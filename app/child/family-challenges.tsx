import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { BackToChildHome, ChildScreenShell, InfoCard, PrivacyNotice, SectionTitle } from "../../lib/child/components";
import { saveChildRequest } from "../../lib/child/childService";
import { familyChallenges } from "../../lib/data/familyChallenges";
import type { SafeStepsParentChallenge } from "../../lib/data/safestepsParentChallenges";

const previewCount = 30;

export default function ChildFamilyChallengesScreen() {
  const [workingId, setWorkingId] = useState("");
  const [message, setMessage] = useState("");
  const visibleChallenges = useMemo(() => familyChallenges.slice(0, previewCount), []);

  async function requestChallenge(challenge: SafeStepsParentChallenge) {
    try {
      setWorkingId(challenge.id);
      setMessage("");

      await saveChildRequest({
        requestType: "Family Challenge Request",
        message: `${challenge.displayTitle} | ${challenge.category} | ${challenge.purpose}`,
        shareAudience: "parent",
      });

      setMessage("Family challenge request shared with your parent.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not share the family challenge request.");
    } finally {
      setWorkingId("");
    }
  }

  return (
    <ChildScreenShell
      title="Family Challenges"
      subtitle="Choose a family activity or challenge you would like to try. Parents only see a request after you share it."
    >
      <PrivacyNotice />

      <InfoCard
        title={`${familyChallenges.length} family-use challenges`}
        description="These are the relationship, routine, care, safety, age-stage, and child voice challenges that can be used by families together."
      />

      <SectionTitle>Choose a family challenge</SectionTitle>

      {visibleChallenges.map((challenge) => (
        <InfoCard
          key={challenge.id}
          title={challenge.displayTitle}
          description={`${challenge.category} - ${challenge.estimatedTime}`}
        >
          <Text style={styles.purpose}>{challenge.purpose}</Text>
          <Pressable
            style={styles.button}
            onPress={() => requestChallenge(challenge)}
            disabled={workingId === challenge.id}
          >
            <Text style={styles.buttonText}>
              {workingId === challenge.id ? "Sharing..." : "Ask To Try This"}
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
