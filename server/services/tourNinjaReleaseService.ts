import { createHash } from "node:crypto";
import { tourNinjaReleaseSchema, type TourNinjaRelease } from "@shared/tourNinjaRelease";

export type TourNinjaReleaseMode = "live" | "draft";
export type TourNinjaReleaseSnapshot =
  | { enabled: false; reason: "disabled" | "unavailable" | "invalid"; release: null }
  | { enabled: true; release: TourNinjaRelease; fetchedAt: string; contentDigest: string };

const MAX_RELEASE_BYTES = 1024 * 1024;
const DEFAULT_TIMEOUT_MS = 8_000;
const DEFAULT_FAILURE_TTL_MS = 15_000;

type CacheEntry = { expiresAt: number; snapshot: TourNinjaReleaseSnapshot };
type Timer = ReturnType<typeof setTimeout>;

export interface TourNinjaReleaseServiceDependencies {
  /** Injectable seams keep timeout and remote-loader tests deterministic. */
  fetch?: typeof fetch;
  now?: () => number;
  setTimeout?: (callback: () => void, ms: number) => Timer;
  clearTimeout?: (timer: Timer) => void;
  env?: Record<string, string | undefined>;
}

function isPrivateOrLocalHostname(hostname: string) {
  const normalized = hostname.toLowerCase().replace(/\.$/, "");
  if (normalized === "localhost" || normalized.endsWith(".local") || normalized.endsWith(".internal")) return true;
  if (
    normalized === "::1" || normalized === "[::1]" || normalized === "0.0.0.0" ||
    normalized.startsWith("[fc") || normalized.startsWith("[fd") ||
    normalized.startsWith("[fe80") || normalized.startsWith("[::ffff:")
  ) return true;
  const octets = normalized.split(".").map(Number);
  return octets.length === 4 && octets.every(Number.isInteger) && (
    octets[0] === 10 ||
    octets[0] === 127 ||
    octets[0] === 0 ||
    (octets[0] === 169 && octets[1] === 254) ||
    (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
    (octets[0] === 192 && octets[1] === 168)
  );
}

function isSafeConfiguredEndpoint(value: string | undefined): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.hash &&
      !isPrivateOrLocalHostname(url.hostname);
  } catch {
    return false;
  }
}

function boundedSeconds(raw: string | undefined, fallbackMilliseconds: number, minimum: number, maximum: number) {
  const seconds = Number(raw);
  if (!Number.isFinite(seconds)) return fallbackMilliseconds;
  return Math.max(minimum, Math.min(maximum, seconds)) * 1000;
}

function stableJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  const object = value as Record<string, unknown>;
  return `{${Object.keys(object).sort().map((key) => `${JSON.stringify(key)}:${stableJson(object[key])}`).join(",")}}`;
}

/** A content-derived identifier, stable across insignificant JSON key ordering. */
export function getTourNinjaReleaseContentDigest(release: TourNinjaRelease): string {
  return `sha256-${createHash("sha256").update(stableJson(release)).digest("base64url")}`;
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

async function readBoundedBody(response: Response): Promise<string | null> {
  const declaredLength = response.headers.get("content-length");
  if (declaredLength && /^\d+$/.test(declaredLength) && Number(declaredLength) > MAX_RELEASE_BYTES) return null;

  if (!response.body) {
    const text = await response.text();
    return Buffer.byteLength(text, "utf8") <= MAX_RELEASE_BYTES ? text : null;
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_RELEASE_BYTES) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(body);
}

function configuredEndpoint(env: Record<string, string | undefined>, mode: TourNinjaReleaseMode) {
  return mode === "live" ? env.TOUR_NINJA_RELEASES_URL : env.TOUR_NINJA_DRAFT_RELEASE_URL;
}

interface ReleaseValidationPolicy {
  trustedMediaHosts: string[];
  trustedMediaOrigins: string[];
  pin: { id?: string; version?: string; digest?: string };
}

function configuredValidationPolicy(env: Record<string, string | undefined>, mode: TourNinjaReleaseMode): ReleaseValidationPolicy {
  return {
    trustedMediaHosts: env.TOUR_NINJA_TRUSTED_MEDIA_HOSTS?.split(",")
      .map((value) => value.trim().toLowerCase()).filter(Boolean).sort() || [],
    trustedMediaOrigins: env.TOUR_NINJA_TRUSTED_MEDIA_ORIGINS?.split(",")
      .map((value) => value.trim()).filter(Boolean).sort() || [],
    pin: configuredPin(env, mode),
  };
}

function isTrustedMediaUrl(urlValue: string, policy: ReleaseValidationPolicy) {
  if (policy.trustedMediaHosts.length === 0 && policy.trustedMediaOrigins.length === 0) return true;

  const url = new URL(urlValue);
  const host = url.hostname.toLowerCase();
  const hostAllowed = policy.trustedMediaHosts.some((allowed) =>
    allowed === host ||
    (allowed.startsWith("*.") && host.endsWith(allowed.slice(1)) && host !== allowed.slice(2)) ||
    (allowed.startsWith(".") && host.endsWith(allowed) && host !== allowed.slice(1)),
  );
  return hostAllowed || policy.trustedMediaOrigins.includes(url.origin);
}

function configuredPin(env: Record<string, string | undefined>, mode: TourNinjaReleaseMode) {
  const prefix = mode === "live" ? "TOUR_NINJA_LIVE_RELEASE" : "TOUR_NINJA_DRAFT_RELEASE";
  return {
    id: env[`${prefix}_ID`] || env.TOUR_NINJA_RELEASE_ID,
    version: env[`${prefix}_VERSION`],
    digest: env[`${prefix}_CONTENT_DIGEST`],
  };
}

function cacheKey(mode: TourNinjaReleaseMode, endpoint: string, policy: ReleaseValidationPolicy) {
  return `${mode}\u0000${new URL(endpoint).toString()}\u0000${stableJson(policy)}`;
}

export function createTourNinjaReleaseService(dependencies: TourNinjaReleaseServiceDependencies = {}) {
  const cache = new Map<string, CacheEntry>();
  const inflight = new Map<string, Promise<TourNinjaReleaseSnapshot>>();
  // This deliberately survives cache clears: a revision is immutable for this process lifetime.
  const knownRevisionDigests = new Map<string, string>();
  const env = dependencies.env || process.env;
  const now = dependencies.now || Date.now;
  const fetcher = dependencies.fetch || globalThis.fetch;
  const scheduleTimeout = dependencies.setTimeout || setTimeout;
  const cancelTimeout = dependencies.clearTimeout || clearTimeout;

  const cacheSnapshot = (key: string, snapshot: TourNinjaReleaseSnapshot, milliseconds: number) => {
    cache.set(key, { snapshot, expiresAt: now() + milliseconds });
    return snapshot;
  };

  const load = async (
    mode: TourNinjaReleaseMode,
    endpoint: string,
    key: string,
    policy: ReleaseValidationPolicy,
  ): Promise<TourNinjaReleaseSnapshot> => {
    const controller = new AbortController();
    let rejectTimeout: ((reason?: unknown) => void) | undefined;
    const timedOut = new Promise<never>((_resolve, reject) => { rejectTimeout = reject; });
    let timeout: Timer | undefined;

    const unavailable = () => cacheSnapshot(key, { enabled: false, reason: "unavailable", release: null },
      boundedSeconds(env.TOUR_NINJA_RELEASES_FAILURE_CACHE_SECONDS, DEFAULT_FAILURE_TTL_MS, 1, 300));
    const invalid = () => cacheSnapshot(key, { enabled: false, reason: "invalid", release: null },
      boundedSeconds(env.TOUR_NINJA_RELEASES_FAILURE_CACHE_SECONDS, DEFAULT_FAILURE_TTL_MS, 1, 300));

    try {
      const headers: Record<string, string> = { Accept: "application/json" };
      if (env.TOUR_NINJA_RELEASES_TOKEN) headers.Authorization = `Bearer ${env.TOUR_NINJA_RELEASES_TOKEN}`;
      // Start the request before scheduling the timeout so an immediately-fired
      // injected timer still aborts a fetch implementation that observes signals.
      const fetchRequest = fetcher(endpoint, { method: "GET", headers, signal: controller.signal, redirect: "error" });
      timeout = scheduleTimeout(() => {
        controller.abort();
        rejectTimeout?.(new Error("Tour Ninja release request timed out"));
      }, boundedSeconds(env.TOUR_NINJA_RELEASES_TIMEOUT_SECONDS, DEFAULT_TIMEOUT_MS, 1, 30));
      const response = await Promise.race([
        fetchRequest,
        timedOut,
      ]);
      if (!response.ok) return unavailable();

      const body = await Promise.race([readBoundedBody(response), timedOut]);
      if (body === null) return unavailable();

      let json: unknown;
      try {
        json = JSON.parse(body);
      } catch {
        return invalid();
      }
      const parsed = tourNinjaReleaseSchema.safeParse(json);
      if (!parsed.success || parsed.data.release.status !== mode) return invalid();
      if (!Object.values(parsed.data.media).every((media) => isTrustedMediaUrl(media.url, policy))) return invalid();

      const digest = getTourNinjaReleaseContentDigest(parsed.data);
      const pin = policy.pin;
      if (
        (pin.id && parsed.data.release.id !== pin.id) ||
        (pin.version && parsed.data.release.version !== pin.version) ||
        (pin.digest && digest !== pin.digest)
      ) return invalid();

      // Draft and live releases can legitimately share an id/version during
      // promotion, while a changed revision within either mode is rejected.
      const revision = `${mode}\u0000${parsed.data.release.id}@${parsed.data.release.version}`;
      const priorDigest = knownRevisionDigests.get(revision);
      if (priorDigest && priorDigest !== digest) return invalid();
      knownRevisionDigests.set(revision, digest);

      const snapshot = deepFreeze({
        enabled: true as const,
        release: parsed.data,
        fetchedAt: new Date(now()).toISOString(),
        contentDigest: digest,
      });
      return cacheSnapshot(key, snapshot, boundedSeconds(env.TOUR_NINJA_RELEASES_CACHE_SECONDS, 60_000, 10, 3600));
    } catch {
      return unavailable();
    } finally {
      if (timeout) cancelTimeout(timeout);
    }
  };

  const getSnapshot = async (mode: TourNinjaReleaseMode): Promise<TourNinjaReleaseSnapshot> => {
    if (env.TOUR_NINJA_RELEASES_ENABLED !== "true") return { enabled: false, reason: "disabled", release: null };

    const endpoint = configuredEndpoint(env, mode);
    if (!isSafeConfiguredEndpoint(endpoint)) return { enabled: false, reason: "unavailable", release: null };
    const policy = configuredValidationPolicy(env, mode);
    const key = cacheKey(mode, endpoint, policy);
    const cached = cache.get(key);
    if (cached && cached.expiresAt > now()) return cached.snapshot;

    const existing = inflight.get(key);
    if (existing) return existing;
    const request = load(mode, endpoint, key, policy);
    inflight.set(key, request);
    try {
      return await request;
    } finally {
      inflight.delete(key);
    }
  };

  return {
    getSnapshot,
    clearCache: () => cache.clear(),
  };
}

const defaultService = createTourNinjaReleaseService();

export function isTourNinjaReleaseEnabled() {
  return process.env.TOUR_NINJA_RELEASES_ENABLED === "true";
}

export function clearTourNinjaReleaseSnapshotCache() {
  defaultService.clearCache();
}

/**
 * Fetches only a deployer-configured HTTPS endpoint. User input never
 * influences this request, redirects are rejected, and invalid data is never
 * retained as a usable release. Content digests and revision immutability are
 * process-lifetime protections; configure a release ID/version/digest pin when
 * an exact reviewed release must remain enforced across process restarts.
 */
export function getTourNinjaReleaseSnapshot(mode: TourNinjaReleaseMode): Promise<TourNinjaReleaseSnapshot> {
  return defaultService.getSnapshot(mode);
}