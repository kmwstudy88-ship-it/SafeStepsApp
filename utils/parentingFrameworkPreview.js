const fs = require('node:fs');
const path = require('node:path');
// Editorial preview only; this pack is excluded from published registries.
function getParentingFrameworkPreview() {
 const file = path.join(__dirname, '..', 'curriculum/framework/parenting-tracks.draft.json');
 const framework = JSON.parse(fs.readFileSync(file,'utf8'));
 if (framework.publicationStatus !== 'draft-review-required') throw new Error('Framework preview requires explicit draft status');
 return framework;
}
module.exports = {getParentingFrameworkPreview};
