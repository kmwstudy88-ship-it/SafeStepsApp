import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChallengeRecommendations } from '../../components/ChallengeRecommendations';

interface GameItem {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  ageBand: string;
  duration: string;
  description: string;
  icon: string;
  color: string;
}

const AVAILABLE_GAMES: GameItem[] = [
  {
    id: 'game_emotion_match',
    title: 'Feeling Detective & Face Match',
    category: 'emotional_learning',
    categoryLabel: 'Emotion Learning',
    ageBand: 'Ages 3–8',
    duration: '5–10 mins',
    description: 'Take turns matching facial expressions and sharing what makes you feel that way.',
    icon: '🎭',
    color: '#3B82F6',
  },
  {
    id: 'game_co_story',
    title: 'The Great Kangaroo Adventure',
    category: 'parent_child',
    categoryLabel: 'Parent-Child Co-Play',
    ageBand: 'Ages 4–10',
    duration: '10–15 mins',
    description: 'Build a funny story together one sentence at a time with surprise story cards.',
    icon: '🦘',
    color: '#10B981',
  },
  {
    id: 'game_calm_countdown',
    title: 'Super-Breather Space Voyage',
    category: 'child_safety',
    categoryLabel: 'Regulation & Calm',
    ageBand: 'All Ages',
    duration: '5 mins',
    description: 'Coordinated breathing mission to power up the spaceship with slow, deep breaths.',
    icon: '🚀',
    color: '#8B5CF6',
  },
  {
    id: 'game_visit_icebreaker',
    title: 'Visit Day High-Five Bingo',
    category: 'contact_visit',
    categoryLabel: 'Contact Visit Play',
    ageBand: 'Ages 5–12',
    duration: '10 mins',
    description: 'Fun, gentle icebreaker challenges designed specifically for supervised contact visit bonding.',
    icon: '⭐',
    color: '#F59E0B',
  },
];

export default function GamesHubScreen() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');

  const handleJoinRoom = () => {
    if (!roomCode.trim()) {
      Alert.alert('Room Code Required', 'Please enter a 4-letter family room code to join.');
      return;
    }
    router.push(`/games/multiplayer/game_custom?roomCode=${roomCode.trim().toUpperCase()}` as any);
  };

  const handleLaunchGame = (gameId: string) => {
    router.push(`/games/multiplayer/${gameId}` as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.badge}>FAMILY CO-PLAY & BONDING</Text>
          <Text style={styles.title}>Co-Play Games Hub</Text>
          <Text style={styles.subtitle}>
            Interactive, non-competitive games designed for parent-child bonding, turn-taking, and emotional regulation.
          </Text>
        </View>

        {/* Join Family Room Card */}
        <View style={styles.joinCard}>
          <Text style={styles.joinTitle}>Join a Family Session</Text>
          <Text style={styles.joinSubtitle}>
            Have a room code from your child's tablet or contact supervisor?
          </Text>
          <View style={styles.joinRow}>
            <TextInput
              style={styles.roomInput}
              placeholder="ROOM CODE"
              placeholderTextColor="#94A3B8"
              value={roomCode}
              onChangeText={setRoomCode}
              autoCapitalize="characters"
              maxLength={6}
            />
            <TouchableOpacity style={styles.joinButton} onPress={handleJoinRoom} activeOpacity={0.8}>
              <Text style={styles.joinButtonText}>Join Room</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionHeader}>Featured Co-Play Games ({AVAILABLE_GAMES.length})</Text>

        <View style={styles.gamesList}>
          {AVAILABLE_GAMES.map((game) => (
            <TouchableOpacity
              key={game.id}
              style={styles.gameCard}
              onPress={() => handleLaunchGame(game.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.gameIconBox, { backgroundColor: `${game.color}15` }]}>
                <Text style={styles.gameIcon}>{game.icon}</Text>
              </View>

              <View style={styles.gameInfo}>
                <View style={styles.gameTopRow}>
                  <Text style={[styles.categoryBadge, { color: game.color }]}>
                    {game.categoryLabel}
                  </Text>
                  <Text style={styles.metaBadge}>{game.ageBand} • {game.duration}</Text>
                </View>

                <Text style={styles.gameTitle}>{game.title}</Text>
                <Text style={styles.gameDescription}>{game.description}</Text>

                <View style={styles.playRow}>
                  <Text style={[styles.playText, { color: game.color }]}>Play Together ›</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <ChallengeRecommendations
          context="Emotional Literacy Connection Attachment Child Voice Co-Play Games"
          title="Voluntary Family Challenges After Co-Play (SS-PCD-030)"
          track="family"
          limit={3}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { padding: 20, gap: 16 },
  header: { gap: 6 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    color: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 11,
    fontWeight: '800',
  },
  title: { fontSize: 24, fontWeight: '800', color: '#0F172A' },
  subtitle: { fontSize: 14, color: '#64748B', lineHeight: 20 },
  joinCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  joinTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  joinSubtitle: { fontSize: 12, color: '#64748B' },
  joinRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  roomInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#0F172A',
  },
  joinButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  sectionHeader: { fontSize: 16, fontWeight: '700', color: '#334155', marginTop: 4 },
  gamesList: { gap: 12 },
  gameCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  gameIconBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameIcon: { fontSize: 28 },
  gameInfo: { flex: 1, gap: 4 },
  gameTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryBadge: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  metaBadge: { fontSize: 11, color: '#64748B' },
  gameTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  gameDescription: { fontSize: 12, color: '#64748B', lineHeight: 16 },
  playRow: { marginTop: 4 },
  playText: { fontSize: 12, fontWeight: '700' },
});
