import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { LocalizedText, TourNinjaRelease } from "@shared/tourNinjaRelease";
import { useTranslation } from "@/contexts/TranslationContext";
import {
  TOUR_NINJA_PREVIEW_DIGEST_KEY,
  TOUR_NINJA_PREVIEW_KEY,
  TOUR_NINJA_PREVIEW_RESET_EVENT,
} from "@/lib/tourNinjaPreview";

type Snapshot = { enabled: boolean; release: TourNinjaRelease | null; preview?: boolean; contentDigest?: string };

interface TourNinjaReleaseContextValue {
  release: TourNinjaRelease | null;
  enabled: boolean;
  isPreview: boolean;
  contentDigest?: string;
  text: (value?: LocalizedText) => string | undefined;
  page: (route: string) => TourNinjaRelease["pages"][number] | undefined;
  mediaUrl: (id?: string) => string | undefined;
}

const TourNinjaReleaseContext = createContext<TourNinjaReleaseContextValue | undefined>(undefined);
type ReleaseColors = { primary?: string; secondary?: string; accent?: string };

function hexToHslVariable(hex: string) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return undefined;
  const value = hex.slice(1);
  const r = parseInt(value.slice(0, 2), 16) / 255;
  const g = parseInt(value.slice(2, 4), 16) / 255;
  const b = parseInt(value.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  if (max === min) return `0 0% ${Math.round(lightness * 100)}%`;
  const delta = max - min;
  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  let hue = max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  hue = Math.round(hue * 60);
  if (hue < 0) hue += 360;
  return `${hue} ${Math.round(saturation * 100)}% ${Math.round(lightness * 100)}%`;
}

/**
 * Live configuration is the only public request. A logged-in admin can set
 * sessionStorage `tour-ninja-release-preview` from the admin dashboard; then
 * the browser asks the authenticated preview endpoint. No preview URL/token is
 * exposed to visitors and clearing the tab restores live configuration.
 */
export function TourNinjaReleaseProvider({ children }: { children: ReactNode }) {
  const { currentLanguage, setLanguage } = useTranslation();
  const [snapshot, setSnapshot] = useState<Snapshot>({ enabled: false, release: null });

  const clearPreview = useCallback(() => {
    sessionStorage.removeItem(TOUR_NINJA_PREVIEW_KEY);
    sessionStorage.removeItem(TOUR_NINJA_PREVIEW_DIGEST_KEY);
    setSnapshot({ enabled: false, release: null, preview: false });
  }, []);

  const loadSnapshot = useCallback(async () => {
    const preview = sessionStorage.getItem(TOUR_NINJA_PREVIEW_KEY) === "true";
    const endpoint = preview ? "/api/admin/tour-ninja/releases/preview" : "/api/tour-ninja/releases/live";
    const expectedDigest = preview ? sessionStorage.getItem(TOUR_NINJA_PREVIEW_DIGEST_KEY) : null;
    try {
      // A preview request itself revalidates the existing admin session. The
      // server rejects a stale pin rather than silently switching drafts.
      const response = await fetch(endpoint, {
        credentials: "same-origin",
        cache: "no-store",
        headers: expectedDigest ? { "X-Tour-Ninja-Preview-Digest": expectedDigest } : {},
      });
      if (!response.ok) throw new Error("Release unavailable");
      const value = await response.json() as Snapshot;
      if (preview) {
        const receivedDigest = value.contentDigest;
        if (!value.enabled || !receivedDigest || (expectedDigest && receivedDigest !== expectedDigest)) {
          throw new Error("Preview release changed");
        }
        if (!expectedDigest) sessionStorage.setItem(TOUR_NINJA_PREVIEW_DIGEST_KEY, receivedDigest);
      }
      setSnapshot({ enabled: value.enabled === true, release: value.release || null, preview, contentDigest: value.contentDigest });
    } catch {
      // Drafts fail closed: an expired admin session, network error, or a
      // changed/missing digest clears the private preview rather than falling
      // through to another release.
      if (preview) clearPreview();
      else setSnapshot({ enabled: false, release: null, preview: false });
    }
  }, [clearPreview]);

  useEffect(() => {
    void loadSnapshot();
  }, [loadSnapshot]);

  useEffect(() => {
    window.addEventListener(TOUR_NINJA_PREVIEW_RESET_EVENT, clearPreview);
    return () => window.removeEventListener(TOUR_NINJA_PREVIEW_RESET_EVENT, clearPreview);
  }, [clearPreview]);

  useEffect(() => {
    const revalidate = () => {
      if (document.visibilityState === "visible") void loadSnapshot();
    };
    const interval = window.setInterval(revalidate, 60_000);
    window.addEventListener("focus", revalidate);
    document.addEventListener("visibilitychange", revalidate);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", revalidate);
      document.removeEventListener("visibilitychange", revalidate);
    };
  }, [loadSnapshot]);

  // Respect an explicit visitor preference first. A release default only
  // selects the initial supported UI language for visitors without one.
  useEffect(() => {
    const defaultLanguage = snapshot.release?.languages?.default;
    if (
      snapshot.enabled &&
      defaultLanguage &&
      !localStorage.getItem("preferred-language") &&
      defaultLanguage !== currentLanguage
    ) {
      void setLanguage(defaultLanguage);
    }
  }, [currentLanguage, setLanguage, snapshot.enabled, snapshot.release?.languages?.default]);

  // The schema only permits #RRGGBB branding values. Convert them to the HSL
  // token format this app already uses and restore the exact prior inline
  // values when a release disappears, changes, or preview fails closed.
  useEffect(() => {
    const colors = (snapshot.enabled
      ? (snapshot.release?.branding as (TourNinjaRelease["branding"] & { colors?: ReleaseColors }) | undefined)?.colors
      : undefined);
    if (!colors) return;
    const root = document.documentElement;
    const entries: Array<[string, string | undefined]> = [
      ["--primary", colors.primary],
      ["--secondary", colors.secondary],
      ["--accent", colors.accent],
    ];
    const previous = entries.map(([name]) => [name, root.style.getPropertyValue(name), root.style.getPropertyPriority(name)] as const);
    for (const [name, color] of entries) {
      const hsl = color ? hexToHslVariable(color) : undefined;
      if (hsl) root.style.setProperty(name, hsl);
    }
    return () => {
      for (const [name, value, priority] of previous) {
        if (value) root.style.setProperty(name, value, priority);
        else root.style.removeProperty(name);
      }
    };
  }, [snapshot.enabled, snapshot.release?.branding]);

  const value = useMemo<TourNinjaReleaseContextValue>(() => {
    const release = snapshot.enabled ? snapshot.release : null;
    const text = (localized?: LocalizedText) =>
      localized?.[currentLanguage as keyof LocalizedText] || localized?.en || localized?.fr || localized?.es;
    return {
      release,
      enabled: !!release,
      isPreview: !!release && snapshot.preview === true,
      contentDigest: snapshot.contentDigest,
      text,
      page: (route) => release?.pages.find((item) => item.route === route),
      mediaUrl: (id) => id ? release?.media[id]?.url : undefined,
    };
  }, [currentLanguage, snapshot]);

  return <TourNinjaReleaseContext.Provider value={value}>{children}</TourNinjaReleaseContext.Provider>;
}

export function useTourNinjaRelease() {
  const context = useContext(TourNinjaReleaseContext);
  if (!context) throw new Error("useTourNinjaRelease must be used within TourNinjaReleaseProvider");
  return context;
}
