import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { BackToChildHome, ChildScreenShell, InfoCard, PrivacyNotice, SectionTitle } from "../../lib/child/components";
import { saveChildRequest } from "../../lib/child/childService";
import { weekendActivityChallenges } from "../../lib/data/familyChallenges";
import type { SafeStepsParentChallenge } from "../../lib/data/safestepsParentChallenges";

const previewCount = 24;

export default function ChildWeekendActivitiesScreen() {
  const [workingId, setWorkingId] = useState("");
  const [message, setMessage] = useState("");
  const activities = useMemo(() => weekendActivityChallenges.slice(0, previewCount), []);

  async function requestActivity(challenge: SafeStepsParentChallenge) {
    try {
      setWorkingId(challenge.id);
      setMessage("");

      await saveChildRequest({
        requestType: "Weekend Activity Request",
        message: `${challenge.displayTitle} | ${challenge.category} | ${challenge.purpose}`,
        shareAudience: "parent",
      });

      setMessage("Weekend activity request shared with your parent.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not share the weekend activity request.");
    } finally {
      setWorkingId("");
    }
  }

  return (
    <ChildScreenShell
      title="Weekend Activities"
      subtitle="Choose a safe activity, connection challenge, routine, or family task you would like to do."
    >
      <PrivacyNotice />

      <InfoCard
        title={`${weekendActivityChallenges.length} weekend-ready activities`}
        description="These are family-use challenges suited to shared time, connection, routines, care, communication, and child voice."
      />

      <SectionTitle>Pick something for the weekend</SectionTitle>

      {activities.map((challenge) => (
        <InfoCard
          key={challenge.id}
          title={challenge.displayTitle}
          description={`${challenge.category} - ${challenge.estimatedTime}`}
        >
          <Text style={styles.purpose}>{challenge.purpose}</Text>
          <Pressable
            style={styles.button}
            onPress={() => requestActivity(challenge)}
            disabled={workingId === challenge.id}
          >
            <Text style={styles.buttonText}>
              {workingId === challenge.id ? "Sharing..." : "Ask For This Weekend"}
            </Text>
          </Pressable>
        </InfoCard>
      ))}

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <BackToChildHome />
    </ChildScreenShell>
  );
}

const styles = StyleSheet.create({
  purpose: {
    color: "#20382B",
    lineHeight: 21,
    marginTop: 10,
  },
  button: {
    backgroundColor: "#20382B",
    borderRadius: 14,
    marginTop: 12,
    paddingVertical: 13,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    textAlign: "center",
  },
  message: {
    color: "#20382B",
    fontWeight: "700",
    marginTop: 12,
    textAlign: "center",
  },
});
