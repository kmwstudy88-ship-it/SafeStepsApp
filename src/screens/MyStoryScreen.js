import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import BottomNavBar from '../components/BottomNavBar';

export default function MyStoryScreen() {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>My Story</Text>

        <View style={styles.card}>
          <Text style={styles.paragraph}>
            I started SafeSteps because I know what it feels like to do everything right and still not be given a fair chance.
          </Text>

          <Text style={styles.paragraph}>
            I know what it feels like to make progress that no one acknowledges. To complete programs, earn certificates, attend every appointment, and still have nothing added to your case file. To have achievements disappear into a system where new workers come in with their own opinions, assumptions, and none of the history of what youâ€™ve actually done.
          </Text>

          <Text style={styles.paragraph}>
            I moved out of the area. I lived with family for stability. I built a safe home. My partner worked fullâ€‘time while we started a handyman and painting service. I completed programs. I passed drug tests. I attended every visit â€” even when it meant travelling for hours just to be there on time.
          </Text>

          <Text style={styles.paragraph}>
            There were no domestic violence reports. No history of violence. No incidents. But my relationship was still judged and never approved, without evidence or fairness.
          </Text>

          <Text style={styles.paragraph}>
            I did everything I was asked to do. I made changes. I showed up. I tried. I kept trying. But the system didnâ€™t see it. Or it saw it and didnâ€™t record it. Or it recorded it and the next worker never read it.
          </Text>

          <Text style={styles.paragraph}>
            And thatâ€™s the part that hurts the most â€” not the work, but the feeling that the work didnâ€™t matter.
          </Text>

          <Text style={styles.paragraph}>
            I experienced what so many families experience: progress not documented, certificates not uploaded, achievements not shared with courts, clean drug tests overlooked, visits attended but not acknowledged, caseworkers changing constantly, opinions replacing facts, and personal feelings clouding professional judgement.
          </Text>

          <Text style={styles.paragraph}>
            Families are told to â€œprove themselves,â€ but the system doesnâ€™t keep the proof.
          </Text>

          <Text style={styles.paragraph}>
            Thatâ€™s why I built SafeSteps â€” the tool I wish existed when I needed it. A place where every step is recorded. Every achievement is saved. Every certificate is stored. Every visit, every task, every effort â€” documented clearly.
          </Text>

          <Text style={styles.paragraph}>
            SafeSteps gives families what I never had: a fair record, a consistent history, a way to show growth, a way to demonstrate change, and a way to be seen.
          </Text>

          <Text style={styles.paragraph}>
            I started SafeSteps because families deserve transparency. They deserve recognition. They deserve a system that sees their effort, not just their mistakes. They deserve a chance â€” a real one.
          </Text>

          <Text style={styles.paragraph}>
            SafeSteps is my way of making sure no family ever feels invisible again.
          </Text>
        </View>
        <TouchableOpacity
    style={styles.navButton}
    onPress={() => router.push('/why-safesteps')}
  >
    <Text style={styles.navButtonText}>Why SafeSteps Exists</Text>
  </TouchableOpacity>
</ScrollView>

      {/* Bottom Navigation Bar */}
      <BottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F4F2',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A3C40',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2E4A4E',
    marginBottom: 16,
  },
});
,
  navButton: {
    backgroundColor: '#1A3C40',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  }
