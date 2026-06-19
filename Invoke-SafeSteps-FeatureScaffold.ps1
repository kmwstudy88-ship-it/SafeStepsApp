<#
.SYNOPSIS
    Scaffolds remaining SafeSteps app features (screens, assets) and runs basic checks.

.DESCRIPTION
    - Ensures key feature folders exist
    - Creates login, register, program selection, lessons, tasks, evidence, assessments screens
    - Ensures basic app assets exist
    - Runs TypeScript check and Expo doctor
#>

[CmdletBinding()]
param(
    [string]$ProjectRoot = (Get-Location).Path
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Info { param([string]$m) Write-Host "[INFO ] $m" -ForegroundColor Cyan }
function Write-Ok   { param([string]$m) Write-Host "[ OK  ] $m" -ForegroundColor Green }
function Write-Warn { param([string]$m) Write-Host "[WARN ] $m" -ForegroundColor Yellow }
function Write-Fail { param([string]$m) Write-Host "[FAIL ] $m" -ForegroundColor Red }

function Ensure-Folder {
    param([string]$Path)
    if (-not (Test-Path $Path)) {
        New-Item -ItemType Directory -Path $Path | Out-Null
        Write-Ok "Created folder: $Path"
    } else {
        Write-Ok "Folder exists: $Path"
    }
}

function Ensure-File {
    param(
        [string]$Path,
        [string]$Content
    )
    if (-not (Test-Path $Path)) {
        $dir = Split-Path $Path -Parent
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir | Out-Null
        }
        $Content | Out-File -FilePath $Path -Encoding UTF8 -Force
        Write-Ok "Created file: $Path"
    } else {
        Write-Ok "File exists (skipped): $Path"
    }
}

$AppDir = Join-Path $ProjectRoot "app"

Write-Info "=== Ensure feature folders ==="

$featureFolders = @(
    "login",
    "register",
    "programs",
    "lessons",
    "tasks",
    "evidence",
    "assessments"
)

foreach ($f in $featureFolders) {
    Ensure-Folder (Join-Path $AppDir $f)
}

Write-Info "=== Scaffold login screen ==="

$loginPath = Join-Path $AppDir "login\index.tsx"
$loginContent = @'
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { globalStyles } from '../styles';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = () => {
    // TODO: wire to real auth
    router.replace('/dashboard');
  };

  return (
    <View style={globalStyles.screen}>
      <Text style={globalStyles.title}>Login</Text>

      <TextInput
        style={[globalStyles.text, { borderWidth: 1, padding: 8, marginBottom: 12 }]}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={[globalStyles.text, { borderWidth: 1, padding: 8, marginBottom: 12 }]}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={globalStyles.button} onPress={onLogin}>
        <Text style={globalStyles.buttonText}>Continue</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text style={[globalStyles.text, { marginTop: 16 }]}>
          Don't have an account? Create one
        </Text>
      </TouchableOpacity>
    </View>
  );
}
'@
Ensure-File -Path $loginPath -Content $loginContent

Write-Info "=== Scaffold register screen ==="

$registerPath = Join-Path $AppDir "register\index.tsx"
$registerContent = @'
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { globalStyles } from '../styles';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onRegister = () => {
    // TODO: wire to real registration
    router.replace('/dashboard');
  };

  return (
    <View style={globalStyles.screen}>
      <Text style={globalStyles.title}>Create Account</Text>

      <TextInput
        style={[globalStyles.text, { borderWidth: 1, padding: 8, marginBottom: 12 }]}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={[globalStyles.text, { borderWidth: 1, padding: 8, marginBottom: 12 }]}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={[globalStyles.text, { borderWidth: 1, padding: 8, marginBottom: 12 }]}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={globalStyles.button} onPress={onRegister}>
        <Text style={globalStyles.buttonText}>Create Account</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/login')}>
        <Text style={[globalStyles.text, { marginTop: 16 }]}>
          Already have an account? Login
        </Text>
      </TouchableOpacity>
    </View>
  );
}
'@
Ensure-File -Path $registerPath -Content $registerContent

Write-Info "=== Scaffold program selection screen ==="

$programsIndexPath = Join-Path $AppDir "programs\index.tsx"
$programsIndexContent = @'
import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { globalStyles } from '../styles';

const PROGRAMS = [
  { id: 'foundations', name: 'Foundations Program' },
  { id: 'advanced', name: 'Advanced Program' },
];

export default function ProgramSelectionScreen() {
  const router = useRouter();

  const onSelect = (programId: string) => {
    // TODO: persist selection
    router.push('/lessons');
  };

  return (
    <View style={globalStyles.screen}>
      <Text style={globalStyles.title}>Choose Your Program</Text>

      <FlatList
        data={PROGRAMS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[globalStyles.button, { marginVertical: 8 }]}
            onPress={() => onSelect(item.id)}
          >
            <Text style={globalStyles.buttonText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
'@
Ensure-File -Path $programsIndexPath -Content $programsIndexContent

Write-Info "=== Scaffold lessons list screen ==="

$lessonsIndexPath = Join-Path $AppDir "lessons\index.tsx"
$lessonsIndexContent = @'
import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { globalStyles } from '../styles';

const LESSONS = [
  { id: 'lesson-1', title: 'Lesson 1: Getting Started' },
  { id: 'lesson-2', title: 'Lesson 2: Safety Basics' },
];

export default function LessonsScreen() {
  const router = useRouter();

  const onOpenLesson = (id: string) => {
    router.push(`/lessons/${id}`);
  };

  return (
    <View style={globalStyles.screen}>
      <Text style={globalStyles.title}>Lessons</Text>

      <FlatList
        data={LESSONS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[globalStyles.button, { marginVertical: 8 }]}
            onPress={() => onOpenLesson(item.id)}
          >
            <Text style={globalStyles.buttonText}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
'@
Ensure-File -Path $lessonsIndexPath -Content $lessonsIndexContent

Write-Info "=== Scaffold lesson detail screen ==="

$lessonDetailPath = Join-Path $AppDir "lessons

\[id].tsx"
$lessonDetailContent = @'
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { globalStyles } from '../styles';

export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <ScrollView style={globalStyles.screen}>
      <Text style={globalStyles.title}>Lesson: {id}</Text>
      <Text style={globalStyles.text}>
        This is where the lesson content will be rendered from your curriculum engine.
      </Text>

      <TouchableOpacity
        style={[globalStyles.button, { marginTop: 24 }]}
        onPress={() => router.push('/tasks')}
      >
        <Text style={globalStyles.buttonText}>View Tasks</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
'@
Ensure-File -Path $lessonDetailPath -Content $lessonDetailContent

Write-Info "=== Scaffold tasks screen ==="

$tasksPath = Join-Path $AppDir "tasks\index.tsx"
$tasksContent = @'
import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { globalStyles } from '../styles';

const TASKS = [
  { id: 'task-1', title: 'Complete safety checklist' },
  { id: 'task-2', title: 'Upload evidence photo' },
];

export default function TasksScreen() {
  return (
    <View style={globalStyles.screen}>
      <Text style={globalStyles.title}>Tasks</Text>

      <FlatList
        data={TASKS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 8 }}>
            <Text style={globalStyles.text}>{item.title}</Text>
          </View>
        )}
      />
    </View>
  );
}
'@
Ensure-File -Path $tasksPath -Content $tasksContent

Write-Info "=== Scaffold evidence screen ==="

$evidencePath = Join-Path $AppDir "evidence\index.tsx"
$evidenceContent = @'
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { globalStyles } from '../styles';

export default function EvidenceScreen() {
  const onUpload = () => {
    // TODO: wire to real upload (camera / file picker)
  };

  return (
    <View style={globalStyles.screen}>
      <Text style={globalStyles.title}>Evidence</Text>
      <Text style={globalStyles.text}>
        Upload photos, documents, or notes as evidence for your progress.
      </Text>

      <TouchableOpacity style={[globalStyles.button, { marginTop: 24 }]} onPress={onUpload}>
        <Text style={globalStyles.buttonText}>Upload Evidence</Text>
      </TouchableOpacity>
    </View>
  );
}
'@
Ensure-File -Path $evidencePath -Content $evidenceContent

Write-Info "=== Scaffold assessments screen ==="

$assessmentsPath = Join-Path $AppDir "assessments\index.tsx"
$assessmentsContent = @'
import React from 'react';
import { View, Text } from 'react-native';
import { globalStyles } from '../styles';

export default function AssessmentsScreen() {
  return (
    <View style={globalStyles.screen}>
      <Text style={globalStyles.title}>Assessments</Text>
      <Text style={globalStyles.text}>
        This is where assessment forms, scores, and feedback will appear.
      </Text>
    </View>
  );
}
'@
Ensure-File -Path $assessmentsPath -Content $assessmentsContent

Write-Info "=== Ensure basic assets exist ==="

$assetsDir = Join-Path $ProjectRoot "assets\images"
Ensure-Folder $assetsDir

$pngBytes = [Convert]::FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/6X2NDcAAAAASUVORK5CYII=")

$assetFiles = @(
    "icon.png",
    "android-icon-foreground.png",
    "android-icon-background.png",
    "android-icon-monochrome.png"
)

foreach ($file in $assetFiles) {
    $path = Join-Path $assetsDir $file
    if (-not (Test-Path $path)) {
        Set-Content -Path $path -Value $pngBytes -Encoding Byte
        Write-Ok "Created placeholder asset: $file"
    } else {
        Write-Ok "Asset exists: $file"
    }
}

Write-Info "=== Run TypeScript check (if tsconfig exists) ==="

Push-Location $ProjectRoot
try {
    if (Test-Path ".\tsconfig.json") {
        npx tsc --noEmit
        Write-Ok "TypeScript check completed."
    } else {
        Write-Warn "tsconfig.json not found – skipping TypeScript check."
    }

    Write-Info "=== Run Expo doctor ==="
    npx expo-doctor
    Write-Ok "Expo doctor completed."
}
finally {
    Pop-Location
}

Write-Ok "Feature scaffolding complete. You can now run: npx expo start"
