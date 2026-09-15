export const TOUR_NINJA_PREVIEW_KEY = "tour-ninja-release-preview";
export const TOUR_NINJA_PREVIEW_DIGEST_KEY = "tour-ninja-release-preview-digest";
export const TOUR_NINJA_PREVIEW_RESET_EVENT = "tour-ninja-release-preview-reset";

export interface PreviewStorage {
  removeItem(key: string): void;
}

/** Kept DOM-free so logout cleanup can be regression-tested in Node. */
export function clearTourNinjaPreview(storage: PreviewStorage, notify: () => void) {
  storage.removeItem(TOUR_NINJA_PREVIEW_KEY);
  storage.removeItem(TOUR_NINJA_PREVIEW_DIGEST_KEY);
  notify();
}