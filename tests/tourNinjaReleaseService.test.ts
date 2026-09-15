import assert from "node:assert/strict";
import test from "node:test";
import { tourNinjaReleaseSchema } from "../shared/tourNinjaRelease";
import {
  createTourNinjaReleaseService,
  type TourNinjaReleaseServiceDependencies,
} from "../server/services/tourNinjaReleaseService";

const release = {
  schemaVersion: "tourninja-release/v1",
  release: {
    id: "reviewed-release",
    version: "1.2.3",
    status: "live",
    publishedAt: "2025-01-15T12:00:00.000Z",
  },
  branding: {
    siteName: { en: "Amon Tour" },
    colors: { primary: "#084F6E", secondary: "#3BA8AF", accent: "#FFFFFF" },
    logoMediaId: "logo",
  },
  languages: { default: "en", supported: ["en", "fr"] },
  media: {
    logo: { kind: "image", url: "https://cdn.example.com/logo.png", alt: { en: "Logo" } },
    hero: { kind: "image", url: "https://cdn.example.com/hero.jpg", alt: { en: "Krabi" } },
  },
  pages: [{
    route: "/",
    hero: { title: { en: "Discover Krabi" }, mediaId: "hero" },
    sections: [{ id: "ideas", type: "text_image", mediaId: "hero" }],
  }],
};

const liveEndpoint = "https://releases.example.com/live.json";
const draftEndpoint = "https://releases.example.com/draft.json";

function enabledEnv(overrides: Record<string, string | undefined> = {}) {
  return {
    TOUR_NINJA_RELEASES_ENABLED: "true",
    TOUR_NINJA_RELEASES_URL: liveEndpoint,
    TOUR_NINJA_DRAFT_RELEASE_URL: draftEndpoint,
    ...overrides,
  };
}

function jsonResponse(value: unknown) {
  return new Response(JSON.stringify(value), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

function dependencies(
  fetch: typeof globalThis.fetch,
  env = enabledEnv(),
): TourNinjaReleaseServiceDependencies {
  return { fetch, env, now: () => Date.UTC(2025, 0, 15, 12) };
}

test("loader is disabled without an explicit enable flag", async () => {
  let calls = 0;
  const service = createTourNinjaReleaseService(dependencies(async () => {
    calls += 1;
    return jsonResponse(release);
  }, { TOUR_NINJA_RELEASES_URL: liveEndpoint }));

  assert.deepEqual(await service.getSnapshot("live"), {
    enabled: false,
    reason: "disabled",
    release: null,
  });
  assert.equal(calls, 0);
});

test("returns an immutable success snapshot with a content digest", async () => {
  const service = createTourNinjaReleaseService(dependencies(async () => jsonResponse(release)));
  const snapshot = await service.getSnapshot("live");

  assert.equal(snapshot.enabled, true);
  if (!snapshot.enabled) return assert.fail("expected an enabled release");
  assert.match(snapshot.contentDigest, /^sha256-[A-Za-z0-9_-]+$/);
  assert.equal(snapshot.fetchedAt, "2025-01-15T12:00:00.000Z");
  assert.equal(Object.isFrozen(snapshot.release), true);
  assert.equal(Object.isFrozen(snapshot.release.pages), true);
});

test("rejects invalid JSON, invalid schema data, and a draft returned from live", async () => {
  const responses = [
    new Response("{not-json", { status: 200 }),
    jsonResponse({ ...release, release: { ...release.release, status: "live", unknown: true } }),
    jsonResponse({ ...release, release: { ...release.release, status: "draft" } }),
  ];
  const service = createTourNinjaReleaseService(dependencies(async () => responses.shift()!));

  for (let index = 0; index < 3; index += 1) {
    const snapshot = await service.getSnapshot("live");
    assert.deepEqual(snapshot, { enabled: false, reason: "invalid", release: null });
    service.clearCache();
  }
});

test("caches a network failure for a finite failure TTL", async () => {
  let calls = 0;
  let clock = 0;
  const service = createTourNinjaReleaseService({
    ...dependencies(async () => {
      calls += 1;
      throw new Error("network down");
    }, enabledEnv({ TOUR_NINJA_RELEASES_FAILURE_CACHE_SECONDS: "1" })),
    now: () => clock,
  });

  assert.equal((await service.getSnapshot("live")).enabled, false);
  assert.equal((await service.getSnapshot("live")).enabled, false);
  assert.equal(calls, 1);
  clock = 1_001;
  assert.equal((await service.getSnapshot("live")).enabled, false);
  assert.equal(calls, 2);
});

test("aborts an unresolved request using injected timing", async () => {
  let sawAbort = false;
  const service = createTourNinjaReleaseService({
    ...dependencies(async (_input, init) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => {
        sawAbort = true;
        reject(new Error("aborted"));
      });
    })),
    setTimeout: (callback) => {
      callback();
      return 0 as unknown as ReturnType<typeof setTimeout>;
    },
    clearTimeout: () => undefined,
  });

  assert.deepEqual(await service.getSnapshot("live"), {
    enabled: false,
    reason: "unavailable",
    release: null,
  });
  assert.equal(sawAbort, true);
});

test("rejects an oversized streaming response before parsing it", async () => {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new Uint8Array(1024 * 1024 + 1));
      controller.close();
    },
  });
  const service = createTourNinjaReleaseService(dependencies(async () => new Response(body)));
  assert.deepEqual(await service.getSnapshot("live"), {
    enabled: false,
    reason: "unavailable",
    release: null,
  });
});

test("cache and singleflight keys include both configured endpoint and mode", async () => {
  let calls = 0;
  const draft = structuredClone(release);
  draft.release.status = "draft";
  draft.release.id = "reviewed-draft";
  const env = enabledEnv();
  const service = createTourNinjaReleaseService(dependencies(async (input) => {
    calls += 1;
    return jsonResponse(String(input) === draftEndpoint ? draft : release);
  }, env));

  assert.equal((await service.getSnapshot("live")).enabled, true);
  assert.equal((await service.getSnapshot("live")).enabled, true);
  assert.equal((await service.getSnapshot("draft")).enabled, true);
  env.TOUR_NINJA_RELEASES_URL = "https://releases.example.com/live-next.json";
  assert.equal((await service.getSnapshot("live")).enabled, true);
  assert.equal(calls, 3);
});

test("accepts a promoted id and version in either draft/live fetch order", async () => {
  const draft = structuredClone(release);
  draft.release.status = "draft";

  for (const order of [["draft", "live"], ["live", "draft"]] as const) {
    const service = createTourNinjaReleaseService(dependencies(async (input) =>
      jsonResponse(String(input) === draftEndpoint ? draft : release),
    ));
    assert.equal((await service.getSnapshot(order[0])).enabled, true);
    assert.equal((await service.getSnapshot(order[1])).enabled, true);
  }
});

test("coalesces concurrent reads for the same endpoint and mode", async () => {
  let calls = 0;
  let resolveResponse: ((response: Response) => void) | undefined;
  const service = createTourNinjaReleaseService(dependencies(async () => {
    calls += 1;
    return new Promise<Response>((resolve) => { resolveResponse = resolve; });
  }));

  const first = service.getSnapshot("live");
  const second = service.getSnapshot("live");
  assert.equal(calls, 1);
  resolveResponse?.(jsonResponse(release));
  assert.equal((await first).enabled, true);
  assert.equal((await second).enabled, true);
});

test("rejects changed content for an already seen id and version within the same mode", async () => {
  let response = structuredClone(release);
  const service = createTourNinjaReleaseService(dependencies(async () => jsonResponse(response)));
  assert.equal((await service.getSnapshot("live")).enabled, true);

  response = structuredClone(release);
  response.pages[0].hero.title.en = "Changed after review";
  service.clearCache();
  assert.deepEqual(await service.getSnapshot("live"), {
    enabled: false,
    reason: "invalid",
    release: null,
  });
});

test("enforces configured trusted media hosts and an optional release-id pin", async () => {
  const mediaDenied = createTourNinjaReleaseService(dependencies(
    async () => jsonResponse(release),
    enabledEnv({ TOUR_NINJA_TRUSTED_MEDIA_HOSTS: "assets.example.com" }),
  ));
  assert.equal((await mediaDenied.getSnapshot("live")).enabled, false);

  const pinned = createTourNinjaReleaseService(dependencies(
    async () => jsonResponse(release),
    enabledEnv({ TOUR_NINJA_RELEASE_ID: "different-review" }),
  ));
  assert.deepEqual(await pinned.getSnapshot("live"), {
    enabled: false,
    reason: "invalid",
    release: null,
  });
});

test("does not serve a cached snapshot after pin or trusted-media policy changes", async () => {
  let calls = 0;
  const env = enabledEnv();
  const service = createTourNinjaReleaseService(dependencies(async () => {
    calls += 1;
    return jsonResponse(release);
  }, env));

  assert.equal((await service.getSnapshot("live")).enabled, true);
  env.TOUR_NINJA_RELEASE_ID = "different-review";
  assert.deepEqual(await service.getSnapshot("live"), {
    enabled: false,
    reason: "invalid",
    release: null,
  });
  delete env.TOUR_NINJA_RELEASE_ID;
  env.TOUR_NINJA_TRUSTED_MEDIA_HOSTS = "assets.example.com";
  assert.deepEqual(await service.getSnapshot("live"), {
    enabled: false,
    reason: "invalid",
    release: null,
  });
  assert.equal(calls, 3);
});

test("schema enforces unique section ids and locales, strict colors, and durable image-only section media", () => {
  const duplicateSections = structuredClone(release);
  duplicateSections.pages[0].sections.push({ id: "ideas", type: "text", title: { en: "Again" } });
  assert.equal(tourNinjaReleaseSchema.safeParse(duplicateSections).success, false);

  const duplicateLocales = structuredClone(release);
  duplicateLocales.languages.supported = ["en", "en"];
  assert.equal(tourNinjaReleaseSchema.safeParse(duplicateLocales).success, false);

  const unsupportedDefault = structuredClone(release);
  unsupportedDefault.languages.default = "es";
  assert.equal(tourNinjaReleaseSchema.safeParse(unsupportedDefault).success, false);

  const invalidColor = structuredClone(release);
  invalidColor.branding.colors.primary = "rgb(1, 2, 3)";
  assert.equal(tourNinjaReleaseSchema.safeParse(invalidColor).success, false);

  const extraColor = structuredClone(release);
  (extraColor.branding.colors as Record<string, string>).background = "#000000";
  assert.equal(tourNinjaReleaseSchema.safeParse(extraColor).success, false);

  const fragmentMedia = structuredClone(release);
  fragmentMedia.media.hero.url = "https://cdn.example.com/hero.jpg#revision";
  assert.equal(tourNinjaReleaseSchema.safeParse(fragmentMedia).success, false);

  const credentialMedia = structuredClone(release);
  credentialMedia.media.hero.url = "https://user:password@cdn.example.com/hero.jpg";
  assert.equal(tourNinjaReleaseSchema.safeParse(credentialMedia).success, false);

  const videoSection = structuredClone(release);
  videoSection.media.hero.kind = "video";
  assert.equal(tourNinjaReleaseSchema.safeParse(videoSection).success, false);
});