# ============================================
# SAFE STEPS PROGRAMS — FULL AUTO BUILDER
# ============================================

$root = 'C:\Users\SAFES\SafeStepsApp'

Write-Host '🚀 Starting SafeSteps Programs Auto-Builder...'

# -----------------------------
# 1. Create required directories
# -----------------------------
$dirs = @(
    "$root\src\safesteps",
    "$root\src\safesteps\lessons",
    "$root\scripts",
    "$root\app\programs",
    "$root\app\programs\_program"
)

foreach ($d in $dirs) {
    if (!(Test-Path $d)) {
        New-Item -ItemType Directory -Force $d | Out-Null
        Write-Host "📁 Created: $d"
    }
}

# -----------------------------
# 2. Create registry.js
# -----------------------------
@'
module.exports = [
  { "id": "keeping-families-together", "title": "Keeping Families Together (High Risk)", "duration": "12 months", "weeks": 52, "lessonsPerWeek": 5 },
  { "id": "reunification", "title": "Reunification Program", "duration": "24 months", "weeks": 104, "lessonsPerWeek": 7 },
  { "id": "home-again", "title": "Home Again Program (Post-Reunification)", "duration": "6–12 months", "weeks": 52, "lessonsPerWeek": 4 },
  { "id": "back-on-track", "title": "Back On Track (Low Risk)", "duration": "6–8 months", "weeks": 32, "lessonsPerWeek": 4 },
  { "id": "child-protection-awareness", "title": "Child Protection Awareness Program", "duration": "6–12 weeks", "weeks": 12, "lessonsPerWeek": 3 },
  { "id": "parenting-skills", "title": "Parenting Skills Program", "duration": "12 weeks", "weeks": 12, "lessonsPerWeek": 5 },
  { "id": "domestic-violence-awareness", "title": "Domestic Violence Awareness Program", "duration": "8 weeks", "weeks": 8, "lessonsPerWeek": 4 }
];
'@ | Set-Content "$root\src\safesteps\registry.js"

Write-Host '📄 registry.js created.'

# -----------------------------
# 3. Create loader.js
# -----------------------------
@'
const fs = require("fs");
const path = require("path");

function loadProgramLessons(programId) {
  const baseDir = path.join(__dirname, "lessons", programId);
  if (!fs.existsSync(baseDir)) return [];
  const files = fs.readdirSync(baseDir);
  let lessons = [];
  files.forEach(file => {
    if (file.endsWith(".json")) {
      const content = fs.readFileSync(path.join(baseDir, file), "utf8");
      lessons.push(...JSON.parse(content).lessons);
    }
  });
  return lessons;
}

function loadAllLessons() {
  const programs = require("./registry.js");
  let all = [];
  programs.forEach(p => all.push(...loadProgramLessons(p.id)));
  return all;
}

module.exports = { loadProgramLessons, loadAllLessons };
'@ | Set-Content "$root\src\safesteps\loader.js"

Write-Host '📄 loader.js created.'

# -----------------------------
# 4. Create bulk-build.js
# -----------------------------
@'
const fs = require("fs");
const path = require("path");
const programs = require("../src/safesteps/registry.js");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function buildProgram(program) {
  const { id, title, weeks, lessonsPerWeek } = program;
  const baseDir = path.join(__dirname, "..", "src", "safesteps", "lessons", id);
  ensureDir(baseDir);

  console.log("\\n📘 Building Program:", title);

  for (let w = 1; w <= weeks; w++) {
    const weekFile = path.join(baseDir, `week${w}.json`);
    const lessons = [];
    for (let l = 1; l <= lessonsPerWeek; l++) {
      lessons.push({
        id: `${id}-w${w}-l${l}`,
        title: `Lesson ${l}`,
        week: w,
        content: "Lesson content goes here."
      });
    }
    fs.writeFileSync(weekFile, JSON.stringify({ week: w, lessons }, null, 2));
    console.log("   ✓ week" + w + ".json");
  }
}

function main() {
  console.log("🚀 SafeSteps Bulk Build Starting...");
  programs.forEach(buildProgram);
  console.log("\\n🎉 All programs generated.");
}

main();
'@ | Set-Content "$root\scripts\bulk-build.js"

Write-Host '📄 bulk-build.js created.'

Write-Host '✅ SafeSteps Programs System fully generated!'
