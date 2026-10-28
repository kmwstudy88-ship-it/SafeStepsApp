import test from "node:test";
import assert from "node:assert/strict";

import { importTypeScriptModule } from "./load-typescript-module.mjs";

const {
  deriveAgeBand,
  DEFAULT_PICTURE_OPTIONS,
  childDashboardItems,
} = await importTypeScriptModule("../../lib/child/childData.ts");

test("deriveAgeBand categorizes developmental age bands accurately", () => {
  assert.equal(deriveAgeBand(3), "picture_word_3_6");
  assert.equal(deriveAgeBand(5), "picture_word_3_6");
  assert.equal(deriveAgeBand(6), "picture_word_3_6");
  assert.equal(deriveAgeBand(7), "child_7_11");
  assert.equal(deriveAgeBand(10), "child_7_11");
  assert.equal(deriveAgeBand(11), "child_7_11");
  assert.equal(deriveAgeBand(12), "teen_12_17");
  assert.equal(deriveAgeBand(15), "teen_12_17");
  assert.equal(deriveAgeBand(17), "teen_12_17");
});

test("DEFAULT_PICTURE_OPTIONS provides child-friendly emojis and distinct keys", () => {
  assert(Array.isArray(DEFAULT_PICTURE_OPTIONS));
  assert(DEFAULT_PICTURE_OPTIONS.length >= 8);

  const ids = new Set();
  for (const opt of DEFAULT_PICTURE_OPTIONS) {
    assert(opt.id, "option must have an id");
    assert(opt.emoji, "option must have an emoji");
    assert(opt.label, "option must have a human-readable label");
    assert(!ids.has(opt.id), `duplicate option id: ${opt.id}`);
    ids.add(opt.id);
  }
});

test("childDashboardItems enforce privacy and child-first safety", () => {
  assert(Array.isArray(childDashboardItems));
  assert(childDashboardItems.length >= 6);

  const checkIn = childDashboardItems.find((item) => item.href === "/child/check-in");
  assert(checkIn, "must include feelings check-in");
  assert.equal(checkIn.badge, "Private");

  const safePeople = childDashboardItems.find((item) => item.href === "/child/safe-people");
  assert(safePeople, "must include safe people");
  assert.equal(safePeople.badge, "Safety");
});
