const test = require('node:test');
const assert = require('node:assert/strict');
const content = require('../../utils/parentingFrameworkPreview.js');
test('framework preserves source gaps and stays outside published curriculum', () => {
 const framework = content.getParentingFrameworkPreview();
 assert.equal(framework.publicationStatus, 'draft-review-required');
 assert.equal(framework.tracks.length, 4);
 assert.deepEqual(framework.tracks.map(t=>t.basic.lessons.length), [3,3,3,1]);
 assert.deepEqual(framework.tracks.map(t=>t.facilitator.name), ['Nora','Elijah','Maya','Leo']);
 for (const track of framework.tracks) {
  assert.equal(track.master.status, 'outline-only');
  for (const lesson of track.basic.lessons) {
   assert.equal(lesson.status,'draft');
   assert.ok(lesson.sourceModuleId);
  }
 }
 assert.ok(framework.requirements.privacy.includes('Learning completion does not prove parenting safety or case-plan compliance'));
});
