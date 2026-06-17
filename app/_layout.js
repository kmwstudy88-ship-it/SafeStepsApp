# ============================================
# SafeSteps Programs – Full Auto Builder
# ============================================

$root = "C:\Users\SAFES\SafeStepsApp"

Write-Host "Starting SafeSteps Programs Auto-Builder..."

# -----------------------------
# 1. Create required directories
# -----------------------------
$dirs = @(
    "$root\src\safesteps",
    "$root\src\safesteps\lessons",
    "$root\scripts",
    "$root\app\programs",
    "$root\app\programs

\[programId]"
)

foreach ($d in $dirs) {
    if (!(Test-Path $d)) {
        New-Item -ItemType Directory -Force -Path $d | Out-Null
        Write-Host "Created: $d"
    }
}

# -----------------------------
# 2. Create registry.js
# -----------------------------
@"
module.exports = [
  { "id": "keeping-families-together", "title": "Keeping Families Together (High Risk)", "duration": "12 months", "weeks": 52, "lessonsPerWeek": 5 },
  { "id": "reunification", "title": "Reunification Program", "duration": "24 months", "weeks": 104, "lessonsPerWeek": 7 },
  { "id": "home-again", "title": "Home Again Program (Post-Reunification)", "duration": "6–12 months", "weeks": 52, "lessonsPerWeek": 4 },
  { "id": "back-on-track", "title": "Back On Track (Low Risk)", "duration": "6–8 months", "weeks": 32, "lessonsPerWeek": 4 },
  { "id": "child-protection-awareness", "title": "Child Protection Awareness Program", "duration": "6–12 weeks", "weeks": 12, "lessonsPerWeek": 3 },
  { "id": "parenting-skills", "title": "Parenting Skills Program", "duration": "12 weeks", "weeks": 12, "lessonsPerWeek": 5 },
  { "id": "domestic-violence-awareness", "title": "Domestic Violence Awareness Program", "duration": "8 weeks", "weeks": 8, "lessonsPerWeek": 4 }
];
"@ | Set-Content "$root\src\safesteps\registry.js" -Encoding UTF8

Write-Host "registry.js created."

# -----------------------------
# 3. Create loader.js
# -----------------------------
@"
const fs = require('fs');
const path = require('path');

function loadProgramLessons(programId) {
  const baseDir = path.join(__dirname, 'lessons', programId);
  if (!fs.existsSync(baseDir)) return [];
  const files = fs.readdirSync(baseDir);
  let lessons = [];
  files.forEach((file) => {
    if (file.endsWith('.json')) {
      const content = fs.readFileSync(path.join(baseDir, file), 'utf8');
      try {
        const parsed = JSON.parse(content);
        if (parsed.lessons) lessons = lessons.concat(parsed.lessons);
      } catch (e) {
        console.error("Error parsing", file, e);
      }
    }
  });
  return lessons;
}

function loadAllLessons() {
  const programs = require('./registry.js');
  let all = [];
  programs.forEach((p) => {
    all = all.concat(loadProgramLessons(p.id));
  });
  return all;
}

module.exports = { loadProgramLessons, loadAllLessons };
"@ | Set-Content "$root\src\safesteps\loader.js" -Encoding UTF8

Write-Host "loader.js created."

# -----------------------------
# 4. Create scripts\bulk-build.js
# -----------------------------
@"
const fs = require('fs');
const path = require('path');
const programs = require('../src/safesteps/registry.js');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function buildProgram(program) {
  const id = program.id;
  const title = program.title;
  const weeks = program.weeks;
  const lessonsPerWeek = program.lessonsPerWeek;

  const baseDir = path.join(__dirname, '..', 'src', 'safesteps', 'lessons', id);
  ensureDir(baseDir);

  console.log('');
  console.log('Building Program: ' + title);

  for (let w = 1; w <= weeks; w++) {
    const weekFile = path.join(baseDir, 'week' + w + '.json');
    const lessons = [];
    for (let l = 1; l <= lessonsPerWeek; l++) {
      lessons.push({
        id: id + '-w' + w + '-l' + l,
        title: 'Lesson ' + l,
        week: w,
        content: 'Lesson content goes here.'
      });
    }
    fs.writeFileSync(weekFile, JSON.stringify({ week: w, lessons: lessons }, null, 2));
    console.log('   ✓ week' + w + '.json');
  }

  console.log('✓ Finished: ' + title);
}

function main() {
  console.log('SafeSteps Bulk Build System Starting...');
  programs.forEach(buildProgram);
  console.log('');
  console.log('All programs generated successfully.');
}

main();
"@ | Set-Content "$root\scripts\bulk-build.js" -Encoding UTF8

Write-Host "bulk-build.js created."

# -----------------------------
# 5. Create app\programs\index.js
# -----------------------------
@"
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import programs from '../../src/safesteps/registry';

export default function ProgramsHome() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.header}>SafeSteps Programs</Text>
      <FlatList
        data={programs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/programs/' + item.id)}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.duration}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 10, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '600' },
  subtitle: { fontSize: 14, color: '#666' }
});
"@ | Set-Content "$root\app\programs\index.js" -Encoding UTF8

Write-Host "app\programs\index.js created."

# -----------------------------
# 6. Create app\programs

\[programId]\index.js
# -----------------------------
@"
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import programs from '../../../src/safesteps/registry';

export default function ProgramDetails() {
  const { programId } = useLocalSearchParams();
  const router = useRouter();
  const program = programs.find((p) => p.id === programId) || {};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>{program.title}</Text>
      <Text style={styles.sub}>Duration: {program.duration}</Text>
      <Text style={styles.sub}>Weeks: {program.weeks}</Text>

      <TouchableOpacity
        style={styles.buttonPrimary}
        onPress={() => router.push('/programs/' + programId + '/weeks')}
      >
        <Text style={styles.buttonText}>View Weeks</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonSecondary}
        onPress={() => router.push('/programs')}
      >
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { fontSize: 26, fontWeight: 'bold', marginBottom: 10 },
  sub: { fontSize: 16, marginBottom: 6 },
  buttonPrimary: { backgroundColor: '#007bff', padding: 14, borderRadius: 10, marginTop: 20 },
  buttonSecondary: { backgroundColor: '#6c757d', padding: 14, borderRadius: 10, marginTop: 10 },
  buttonText: { color: '#fff', textAlign: 'center', fontSize: 16 }
});
"@ | Set-Content "$root\app\programs

\[programId]\index.js" -Encoding UTF8

Write-Host ""
Write-Host "SafeSteps Programs System fully generated."