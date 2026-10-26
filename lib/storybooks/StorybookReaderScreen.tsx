import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';

export type StoryScene = {
  id: string;
  title: string;
  narration: string;
  parentDiscussionPrompt: string;
  childQuestion: string;
  emotionalTheme: 'bravery' | 'kindness' | 'calm_breathing' | 'patience' | 'repair';
};

export const SAMPLE_STORYBOOK = {
  id: 'storybook_01',
  title: 'Oliver and the Big Cloud',
  subtitle: 'A Parent-Child Story about Breathing Through Big Feelings',
  scenes: [
    {
      id: 'scene_1',
      title: 'A Stormy Feeling',
      narration: 'Oliver sat by the window. His chest felt tight, like a grey storm cloud had drifted right inside him. His tower of wooden blocks had crashed to the floor.',
      parentDiscussionPrompt: 'Ask your child: Have you ever felt a storm cloud in your chest or tummy?',
      childQuestion: 'What does Oliver feel like doing right now?',
      emotionalTheme: 'calm_breathing',
    },
    {
      id: 'scene_2',
      title: 'The Three Warm Breaths',
      narration: 'Oliver’s mum sat gently beside him on the rug. She did not yell. She held out her hand: "Let us blow the cloud away together. Breathe in peace... blow out storm."',
      parentDiscussionPrompt: 'Practice taking three slow deep breaths together right now.',
      childQuestion: 'Can you blow out the stormy air with mum?',
      emotionalTheme: 'calm_breathing',
    },
    {
      id: 'scene_3',
      title: 'Rebuilding Together',
      narration: 'With each breath, the cloud grew smaller and lighter. Together, block by block, Oliver and his mum started building a new, stronger tower.',
      parentDiscussionPrompt: 'Affirm your child: When mistakes happen, we can always pause and rebuild together.',
      childQuestion: 'What colour block should they put on top next?',
      emotionalTheme: 'repair',
    },
  ] as StoryScene[],
};

export function StorybookReaderScreen({
  storybook = SAMPLE_STORYBOOK,
  onFinish,
}: {
  storybook?: typeof SAMPLE_STORYBOOK;
  onFinish?: () => void;
}) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const currentScene = storybook.scenes[sceneIndex];
  const isLast = sceneIndex === storybook.scenes.length - 1;

  const handleNext = () => {
    if (isLast) {
      onFinish?.();
    } else {
      setSceneIndex(sceneIndex + 1);
    }
  };

  const handlePrev = () => {
    if (sceneIndex > 0) {
      setSceneIndex(sceneIndex - 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.seriesBadge}>PARENT-CHILD CO-READING</Text>
          <Text style={styles.bookTitle}>{storybook.title}</Text>
          <Text style={styles.subtitle}>{storybook.subtitle}</Text>
          <Text style={styles.pageCount}>Scene {sceneIndex + 1} of {storybook.scenes.length}</Text>
        </View>

        <View style={styles.sceneCard}>
          <Text style={styles.sceneHeading}>{currentScene.title}</Text>
          <Text style={styles.narrationText}>{currentScene.narration}</Text>

          <View style={styles.talkBubbleParent}>
            <Text style={styles.promptTag}>Parent Tip</Text>
            <Text style={styles.bubbleText}>{currentScene.parentDiscussionPrompt}</Text>
          </View>

          <View style={styles.talkBubbleChild}>
            <Text style={styles.promptTagChild}>Ask Your Child</Text>
            <Text style={styles.bubbleText}>{currentScene.childQuestion}</Text>
          </View>
        </View>

        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navButton, sceneIndex === 0 && styles.disabledButton]}
            onPress={handlePrev}
            disabled={sceneIndex === 0}
          >
            <Text style={styles.navText}>Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.navButton, styles.primaryNavButton]} onPress={handleNext}>
            <Text style={styles.primaryNavText}>{isLast ? 'Complete Story' : 'Next Scene'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCF9F2' },
  scroll: { padding: 20, gap: 16 },
  header: { alignItems: 'center', gap: 6, marginVertical: 8 },
  seriesBadge: { backgroundColor: '#FEEBC8', color: '#C05621', fontSize: 11, fontWeight: '800', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  bookTitle: { fontSize: 24, fontWeight: 'bold', color: '#2D3748', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#718096', textAlign: 'center' },
  pageCount: { fontSize: 13, color: '#A0AEC0', marginTop: 4 },
  sceneCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#EDF2F7', gap: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
  sceneHeading: { fontSize: 18, fontWeight: '700', color: '#2B6CB0' },
  narrationText: { fontSize: 17, color: '#2D3748', lineHeight: 28 },
  talkBubbleParent: { backgroundColor: '#EBF8FF', borderLeftWidth: 4, borderLeftColor: '#3182CE', padding: 14, borderRadius: 10 },
  talkBubbleChild: { backgroundColor: '#F0FFF4', borderLeftWidth: 4, borderLeftColor: '#38A169', padding: 14, borderRadius: 10 },
  promptTag: { fontSize: 12, fontWeight: '700', color: '#2B6CB0', textTransform: 'uppercase', marginBottom: 4 },
  promptTagChild: { fontSize: 12, fontWeight: '700', color: '#276749', textTransform: 'uppercase', marginBottom: 4 },
  bubbleText: { fontSize: 14, color: '#2D3748', lineHeight: 20 },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 10 },
  navButton: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#EDF2F7', alignItems: 'center' },
  primaryNavButton: { backgroundColor: '#208AEF' },
  disabledButton: { opacity: 0.4 },
  navText: { fontSize: 15, fontWeight: '600', color: '#4A5568' },
  primaryNavText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});
