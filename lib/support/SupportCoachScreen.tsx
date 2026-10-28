import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
} from 'react-native';
import {
  ChatMessage,
  AUSTRALIAN_CRISIS_CONTACTS,
  COACH_SUGGESTED_PROMPTS,
  getCoachResponse,
} from './supportCoachService';

export function SupportCoachScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'coach',
      text: "Hello! I am your SafeSteps AI Support Coach. I'm here 24/7 to help you de-escalate stressful moments, prepare for caseworker check-ins, or guide you through a 60-second breathing reset.\n\nHow are you feeling right now?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        'Need a 60-second breathing reset',
        'Feeling overwhelmed right now',
        'Meltdown before handover',
      ],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCrisisBanner, setShowCrisisBanner] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = async (textToSend?: string) => {
    const content = (textToSend || inputText).trim();
    if (!content) return;

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text: content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    const coachRes = await getCoachResponse(content, newMessages);
    setIsTyping(false);

    const coachMsg: ChatMessage = {
      id: `msg_coach_${Date.now()}`,
      sender: 'coach',
      text: coachRes.message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: coachRes.suggestedActions,
      crisisAlertTriggered: coachRes.crisisTriggered,
    };

    if (coachRes.crisisTriggered) {
      setShowCrisisBanner(true);
    }

    setMessages((prev) => [...prev, coachMsg]);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleCallHelpline = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.badge}>AI COMPANION & DE-ESCALATION</Text>
          <TouchableOpacity
            style={styles.crisisToggle}
            onPress={() => setShowCrisisBanner(!showCrisisBanner)}
          >
            <Text style={styles.crisisToggleText}>
              {showCrisisBanner ? '✕ Hide Helplines' : '🚨 Crisis Helplines'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>Parent Support Coach</Text>
        <Text style={styles.disclaimerText}>
          Supportive coaching & grounding only. Not a substitute for crisis intervention.
        </Text>
      </View>

      {/* Emergency Crisis Contact Bar */}
      {showCrisisBanner && (
        <View style={styles.crisisContainer}>
          <Text style={styles.crisisHeader}>24/7 Australian Emergency & Crisis Support</Text>
          <View style={styles.crisisList}>
            {AUSTRALIAN_CRISIS_CONTACTS.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[styles.crisisCard, c.isEmergency && styles.crisisCardEmergency]}
                onPress={() => handleCallHelpline(c.phone)}
                activeOpacity={0.8}
              >
                <View>
                  <Text style={[styles.crisisName, c.isEmergency && styles.emergencyText]}>
                    {c.name}
                  </Text>
                  <Text style={styles.crisisDesc}>{c.description}</Text>
                </View>
                <View style={styles.callPill}>
                  <Text style={styles.callPillText}>📞 {c.phone}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Chat Messages */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.messagesScroll}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((msg) => (
          <View key={msg.id} style={styles.messageRow}>
            <View
              style={[
                styles.messageBubble,
                msg.sender === 'user' ? styles.userBubble : styles.coachBubble,
                msg.crisisAlertTriggered && styles.crisisBubble,
              ]}
            >
              {msg.sender === 'coach' && (
                <Text style={styles.coachLabel}>
                  {msg.crisisAlertTriggered ? '🚨 Urgent Support Guidance' : '🤖 Coach Antigravity'}
                </Text>
              )}
              <Text
                style={[
                  styles.messageText,
                  msg.sender === 'user' ? styles.userText : styles.coachText,
                ]}
              >
                {msg.text}
              </Text>
              <Text style={styles.timestampText}>{msg.timestamp}</Text>

              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <View style={styles.actionChips}>
                  {msg.suggestedActions.map((action, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.actionChip}
                      onPress={() => handleSend(action)}
                    >
                      <Text style={styles.actionChipText}>{action}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        ))}

        {isTyping && (
          <View style={[styles.messageBubble, styles.coachBubble]}>
            <Text style={styles.typingText}>Coach is reflecting with trauma-informed guidance…</Text>
          </View>
        )}
      </ScrollView>

      {/* Suggested Quick Prompts */}
      <View style={styles.promptBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promptScroll}>
          {COACH_SUGGESTED_PROMPTS.map((prompt, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.promptPill}
              onPress={() => handleSend(prompt)}
            >
              <Text style={styles.promptPillText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Input Row */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Share what is happening or how you are feeling..."
          placeholderTextColor="#94A3B8"
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={() => handleSend()}
          disabled={!inputText.trim()}
          activeOpacity={0.8}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 4,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: {
    backgroundColor: '#EFF6FF',
    color: '#2563EB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: '800',
  },
  crisisToggle: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  crisisToggleText: { fontSize: 11, fontWeight: '700', color: '#DC2626' },
  title: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  disclaimerText: { fontSize: 11, color: '#64748B' },
  crisisContainer: {
    backgroundColor: '#FEF2F2',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#FECACA',
    gap: 8,
  },
  crisisHeader: { fontSize: 13, fontWeight: '700', color: '#991B1B' },
  crisisList: { gap: 6 },
  crisisCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  crisisCardEmergency: { borderColor: '#DC2626', backgroundColor: '#FFF5F5' },
  crisisName: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  emergencyText: { color: '#DC2626' },
  crisisDesc: { fontSize: 11, color: '#64748B', maxWidth: 220 },
  callPill: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  callPillText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  messagesScroll: { padding: 16, gap: 14 },
  messageRow: { flexDirection: 'column' },
  messageBubble: {
    maxWidth: '85%',
    padding: 14,
    borderRadius: 14,
    gap: 6,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 2,
  },
  coachBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderBottomLeftRadius: 2,
  },
  crisisBubble: {
    backgroundColor: '#FFF5F5',
    borderColor: '#F87171',
    borderWidth: 1.5,
  },
  coachLabel: { fontSize: 11, fontWeight: '700', color: '#2563EB' },
  messageText: { fontSize: 14, lineHeight: 20 },
  userText: { color: '#FFFFFF' },
  coachText: { color: '#1E293B' },
  timestampText: { fontSize: 10, color: '#94A3B8', alignSelf: 'flex-end' },
  typingText: { fontSize: 13, fontStyle: 'italic', color: '#64748B' },
  actionChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  actionChip: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  actionChipText: { fontSize: 12, color: '#1D4ED8', fontWeight: '600' },
  promptBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingVertical: 8,
  },
  promptScroll: { paddingHorizontal: 14, gap: 8 },
  promptPill: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  promptPillText: { fontSize: 12, color: '#475569', fontWeight: '500' },
  inputContainer: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    color: '#0F172A',
    maxHeight: 80,
  },
  sendButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonDisabled: { opacity: 0.5 },
  sendButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
});
