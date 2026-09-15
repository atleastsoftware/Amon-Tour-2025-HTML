import assert from "node:assert/strict";
import test from "node:test";
import {
  clearTourNinjaPreview,
  TOUR_NINJA_PREVIEW_DIGEST_KEY,
  TOUR_NINJA_PREVIEW_KEY,
} from "../client/src/lib/tourNinjaPreview";

test("logout preview cleanup removes both tab-scoped keys and synchronously signals a reset", () => {
  const removed: string[] = [];
  let reset = false;
  clearTourNinjaPreview({ removeItem: (key) => removed.push(key) }, () => { reset = true; });

  assert.deepEqual(removed, [TOUR_NINJA_PREVIEW_KEY, TOUR_NINJA_PREVIEW_DIGEST_KEY]);
  assert.equal(reset, true);
});