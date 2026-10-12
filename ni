// scripts/bulk-build.js
// Final SafeSteps bulk lesson generator (Node, production-ready)

const fs = require('fs');
const path = require('path');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function buildProgram(programId, weeks, lessonsPerWeek) {
  const baseDir = path.join(__dirname, '..', 'src', 'safesteps', 'lessons', programId);
  ensureDir(baseDir);

  console.log(`Building program: ${programId}`);
  console.log(`Weeks: ${weeks}, Lessons per week: ${lessonsPerWeek}`);

  for (let w = 1; w <= weeks; w++) {
    const weekFile = path.join(baseDir, `week${w}.json`);

    const lessons = [];
    for (let l = 1; l <= lessonsPerWeek; l++) {
      lessons.push({
        id: `${programId}-w${w}-l${l}`,
        title: `Lesson ${l}`,
        week: w,
        content: 'Lesson content goes here.',
      });
    }

    const data = {
      programId,
      week: w,
      lessons,
    };

    fs.writeFileSync(weekFile, JSON.stringify(data, null, 2), 'utf8');
    console.log(`  → wrote ${path.basename(weekFile)}`);
  }

  console.log(`Finished program: ${programId}\n`);
}

// MAIN
function main() {
  // Adjust these to your real program structure
  buildProgram('reunification', 104, 7);
  buildProgram('parenting-skills', 12, 5);
  buildProgram('domestic-violence-awareness', 8, 4);

  console.log('✅ All programs generated successfully.');
}

main();
