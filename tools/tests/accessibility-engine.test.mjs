import test from "node:test";
import assert from "node:assert/strict";

import { importTypeScriptModule } from "./load-typescript-module.mjs";

const {
  simplifyToPlainLanguage,
  segmentTextForReadAloud,
  AccessibilitySpeechController,
  PLAIN_LANGUAGE_GLOSSARY,
} = await importTypeScriptModule("../../lib/accessibility/accessibilityEngine.ts");

test("simplifyToPlainLanguage substitutes statutory jargon with accessible wording", () => {
  const formalText = "The parent showed improved protective capacity during supervised contact before reunification.";
  const simplified = simplifyToPlainLanguage(formalText);

  assert(!simplified.toLowerCase().includes("protective capacity"), "should replace protective capacity");
  assert(simplified.includes("strength and ability to keep children safe"), "should explain protective capacity clearly");
  assert(simplified.includes("supported family visit with a worker present"), "should explain supervised contact");
  assert(simplified.includes("children returning home to live with you"), "should explain reunification");
});

test("PLAIN_LANGUAGE_GLOSSARY defines essential trauma-informed terms", () => {
  assert(PLAIN_LANGUAGE_GLOSSARY["reunification"]);
  assert(PLAIN_LANGUAGE_GLOSSARY["procedural fairness"]);
  assert(PLAIN_LANGUAGE_GLOSSARY["restorative repair"]);
  assert(PLAIN_LANGUAGE_GLOSSARY["emotional dysregulation"]);
});

test("segmentTextForReadAloud splits sentences and paragraphs with stable IDs", () => {
  const multiText = "Welcome to the family meeting. We will discuss safety steps.\n\nEveryone has a right to be heard. Let us begin.";
  const segments = segmentTextForReadAloud(multiText);

  assert.equal(segments.length, 4);
  assert.equal(segments[0].id, "p0_s0");
  assert.equal(segments[0].paragraphIndex, 0);
  assert.equal(segments[0].sentenceIndex, 0);
  assert.equal(segments[1].id, "p0_s1");
  assert.equal(segments[2].id, "p1_s0");
  assert.equal(segments[3].id, "p1_s1");

  assert(segments[0].text.startsWith("Welcome"));
  assert(segments[2].text.startsWith("Everyone"));
});

test("AccessibilitySpeechController manages playback state and notifies subscribers", () => {
  const text = "First sentence here. Second sentence here. Third sentence here.";
  const controller = new AccessibilitySpeechController(text);

  let latestState = controller.getState();
  assert.equal(latestState.isPlaying, false);
  assert.equal(latestState.totalSegments, 3);
  assert.equal(latestState.activeSegmentIndex, 0);

  const unsub = controller.subscribe((state) => {
    latestState = state;
  });

  controller.play();
  assert.equal(latestState.isPlaying, true);
  assert.equal(latestState.isPaused, false);

  controller.pause();
  assert.equal(latestState.isPlaying, false);
  assert.equal(latestState.isPaused, true);

  controller.setRate(1.25);
  assert.equal(latestState.rate, 1.25);

  controller.nextSegment();
  assert.equal(latestState.activeSegmentIndex, 1);

  controller.seekToSegment(2);
  assert.equal(latestState.activeSegmentIndex, 2);

  controller.stop();
  assert.equal(latestState.isPlaying, false);
  assert.equal(latestState.activeSegmentIndex, 0);

  unsub();
});
