import React, { useState, useEffect } from 'react';
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
import {
  CalendarEvent,
  CalendarEventType,
  EventLocationType,
  getCalendarEvents,
  createCalendarEvent,
  markEventCompleted,
} from './unifiedCalendarService';

const EVENT_TYPE_CONFIG: Record<
  CalendarEventType,
  { label: string; icon: string; bg: string; text: string }
> = {
  contact_visit: { label: 'Contact Visit', icon: '🤝', bg: '#EFF6FF', text: '#1D4ED8' },
  court_hearing: { label: 'Court Hearing', icon: '⚖️', bg: '#FEF2F2', text: '#B91C1C' },
  practitioner_appointment: { label: 'Specialist / Health', icon: '🩺', bg: '#F0FDF4', text: '#15803D' },
  task_deadline: { label: 'Case Plan Deadline', icon: '⏰', bg: '#FFFBEB', text: '#B45309' },
};

export function UnifiedCalendarScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | CalendarEventType>('all');
  const [isAddingEvent, setIsAddingEvent] = useState(false);

  // New event form state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<CalendarEventType>('contact_visit');
  const [newLocationType, setNewLocationType] = useState<EventLocationType>('in_person');
  const [newLocation, setNewLocation] = useState('');
  const [newStartTime, setNewStartTime] = useState('');
  const [newPrepInstructions, setNewPrepInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    const list = await getCalendarEvents('demo_case');
    setEvents(list);
  };

  const handleMarkCompleted = async (eventId: string) => {
    const res = await markEventCompleted(eventId);
    if (res.success) {
      await loadEvents();
    }
  };

  const handleCreateEvent = async () => {
    if (!newTitle.trim()) {
      Alert.alert('Title Required', 'Please enter a name for the appointment or visit.');
      return;
    }
    if (!newStartTime.trim()) {
      Alert.alert('Date Required', 'Please enter a date (e.g. 2026-11-20T10:00:00Z).');
      return;
    }

    setIsSubmitting(true);
    const result = await createCalendarEvent({
      caseId: 'demo_case',
      title: newTitle.trim(),
      eventType: newType,
      startTime: newStartTime.trim(),
      location: newLocation.trim(),
      locationType: newLocationType,
      prepInstructions: newPrepInstructions.trim(),
    });
    setIsSubmitting(false);

    if (result.success) {
      Alert.alert('Event Scheduled', 'Added to your SafeSteps family calendar with reminders.');
      setIsAddingEvent(false);
      setNewTitle('');
      setNewStartTime('');
      setNewLocation('');
      setNewPrepInstructions('');
      await loadEvents();
    } else {
      Alert.alert('Error', result.error || 'Failed to schedule event.');
    }
  };

  const filteredEvents = events.filter((e) => {
    if (selectedFilter === 'all') return true;
    return e.eventType === selectedFilter;
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.badge}>FAMILY TIMELINE & ATTENDANCE</Text>
          <Text style={styles.title}>Unified Family Calendar</Text>
          <Text style={styles.subtitle}>
            Coordinated contact visits, Children's Court dates, health appointments, and case milestone deadlines.
          </Text>
        </View>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          <TouchableOpacity
            style={[styles.filterChip, selectedFilter === 'all' && styles.filterChipActive]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text style={[styles.filterChipText, selectedFilter === 'all' && styles.filterChipTextActive]}>
              All ({events.length})
            </Text>
          </TouchableOpacity>
          {(Object.keys(EVENT_TYPE_CONFIG) as CalendarEventType[]).map((type) => {
            const cfg = EVENT_TYPE_CONFIG[type];
            const count = events.filter((e) => e.eventType === type).length;
            const isSelected = selectedFilter === type;

            return (
              <TouchableOpacity
                key={type}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => setSelectedFilter(type)}
              >
                <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                  {cfg.icon} {cfg.label} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Schedule New Event Toggle Button */}
        <TouchableOpacity
          style={styles.addEventBtn}
          onPress={() => setIsAddingEvent(!isAddingEvent)}
          activeOpacity={0.8}
        >
          <Text style={styles.addEventBtnText}>
            {isAddingEvent ? '▲ Cancel New Schedule' : '+ Schedule Visit or Appointment'}
          </Text>
        </TouchableOpacity>

        {isAddingEvent && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Add Calendar Item</Text>

            <Text style={styles.fieldLabel}>Event Title:</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Weekly Supervised Visit with Children"
              placeholderTextColor="#94A3B8"
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <Text style={styles.fieldLabel}>Event Category:</Text>
            <View style={styles.typeSelectorRow}>
              {(Object.keys(EVENT_TYPE_CONFIG) as CalendarEventType[]).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeSelectBtn,
                    newType === type && styles.typeSelectBtnActive,
                  ]}
                  onPress={() => setNewType(type)}
                >
                  <Text
                    style={[
                      styles.typeSelectBtnText,
                      newType === type && styles.typeSelectBtnTextActive,
                    ]}
                  >
                    {EVENT_TYPE_CONFIG[type].icon} {EVENT_TYPE_CONFIG[type].label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Date & Time (ISO format):</Text>
            <TextInput
              style={styles.input}
              placeholder="2026-11-20T10:00:00Z"
              placeholderTextColor="#94A3B8"
              value={newStartTime}
              onChangeText={setNewStartTime}
            />

            <Text style={styles.fieldLabel}>Location:</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Community Centre Room 4, or Telehealth"
              placeholderTextColor="#94A3B8"
              value={newLocation}
              onChangeText={setNewLocation}
            />

            <Text style={styles.fieldLabel}>Preparation Checklist / Notes:</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Items to pack, questions for doctor, or transit plans..."
              placeholderTextColor="#94A3B8"
              value={newPrepInstructions}
              onChangeText={setNewPrepInstructions}
              multiline
            />

            <TouchableOpacity
              style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
              onPress={handleCreateEvent}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              <Text style={styles.submitBtnText}>
                {isSubmitting ? 'Saving Event...' : 'Add to Family Calendar'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Events Cards */}
        <View style={styles.eventsList}>
          {filteredEvents.map((evt) => {
            const cfg = EVENT_TYPE_CONFIG[evt.eventType];
            const dateStr = new Date(evt.startTime).toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });
            const timeStr = new Date(evt.startTime).toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <View key={evt.id} style={[styles.eventCard, evt.isCompleted && styles.eventCardCompleted]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.typeBadge, { backgroundColor: cfg.bg }]}>
                    <Text style={[styles.typeBadgeText, { color: cfg.text }]}>
                      {cfg.icon} {cfg.label}
                    </Text>
                  </View>
                  <Text style={styles.dateTimeText}>
                    📅 {dateStr} at {timeStr}
                  </Text>
                </View>

                <Text style={[styles.eventTitle, evt.isCompleted && styles.eventTitleCompleted]}>
                  {evt.title}
                </Text>

                {evt.location ? (
                  <Text style={styles.locationText}>
                    📍 {evt.location} ({evt.locationType.replace(/_/g, ' ')})
                  </Text>
                ) : null}

                {/* Preparation Instructions */}
                {evt.prepInstructions ? (
                  <View style={styles.prepBox}>
                    <Text style={styles.prepTitle}>🎒 Visit / Appointment Preparation:</Text>
                    <Text style={styles.prepBody}>{evt.prepInstructions}</Text>
                  </View>
                ) : null}

                {/* Attendees */}
                {evt.attendees && evt.attendees.length > 0 && (
                  <View style={styles.attendeesRow}>
                    <Text style={styles.attendeesLabel}>Attendees:</Text>
                    {evt.attendees.map((att, idx) => (
                      <View key={idx} style={styles.attendeePill}>
                        <Text style={styles.attendeePillText}>{att.name}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.cardFooter}>
                  {evt.linkedRoute && (
                    <TouchableOpacity
                      onPress={() => router.push(evt.linkedRoute as any)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.actionLink}>Open Associated Tool ›</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.completeBtn, evt.isCompleted && styles.completeBtnDone]}
                    onPress={() => handleMarkCompleted(evt.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.completeBtnText}>
                      {evt.isCompleted ? '✓ Completed' : 'Mark Completed'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
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
    letterSpacing: 0.5,
  },
  title: { fontSize: 24, fontWeight: '800', color: '#0F172A' },
  subtitle: { fontSize: 14, color: '#64748B', lineHeight: 20 },
  filtersScroll: { gap: 8, paddingVertical: 4 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  filterChipText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  filterChipTextActive: { color: '#FFFFFF' },
  addEventBtn: {
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
  },
  addEventBtnText: { color: '#2563EB', fontWeight: '700', fontSize: 13 },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 10,
  },
  formTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#334155', marginTop: 2 },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  textArea: { height: 60, textAlignVertical: 'top' },
  typeSelectorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  typeSelectBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typeSelectBtnActive: { backgroundColor: '#EFF6FF', borderColor: '#2563EB' },
  typeSelectBtnText: { fontSize: 11, fontWeight: '600', color: '#475569' },
  typeSelectBtnTextActive: { color: '#1D4ED8' },
  submitBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  eventsList: { gap: 14 },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  eventCardCompleted: { opacity: 0.7, backgroundColor: '#F8FAFC' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  typeBadgeText: { fontSize: 11, fontWeight: '700' },
  dateTimeText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  eventTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  eventTitleCompleted: { textDecorationLine: 'line-through', color: '#94A3B8' },
  locationText: { fontSize: 13, color: '#475569' },
  prepBox: {
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
    padding: 10,
    borderRadius: 6,
    gap: 2,
  },
  prepTitle: { fontSize: 11, fontWeight: '700', color: '#1E40AF' },
  prepBody: { fontSize: 12, color: '#334155', lineHeight: 16 },
  attendeesRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  attendeesLabel: { fontSize: 11, fontWeight: '600', color: '#64748B' },
  attendeePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  attendeePillText: { fontSize: 11, color: '#334155' },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
    marginTop: 2,
  },
  actionLink: { fontSize: 12, fontWeight: '700', color: '#2563EB' },
  completeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  completeBtnDone: { backgroundColor: '#DCFCE7' },
  completeBtnText: { fontSize: 11, fontWeight: '700', color: '#334155' },
});
