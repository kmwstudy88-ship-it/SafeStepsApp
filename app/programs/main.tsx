import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import {
  getCustomProgramPathways,
  getLaunchPrograms,
  getStructuredDraftPrograms,
  type ProgramPathway,
} from "../../lib/data/programs";

function statusColor(program: ProgramPathway) {
  if (program.launchStatus === "launch") return "#dcefe8";
  if (program.launchStatus === "custom") return "#dff0ff";
  return "#f7e7c2";
}

function ProgramCard({ program }: { program: ProgramPathway }) {
  return (
    <View
      key={program.id}
      style={{
        padding: 16,
        backgroundColor: "#ffffff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#d8e5dd",
        marginBottom: 14,
      }}
    >
      <Text
        style={{
          alignSelf: "flex-start",
          overflow: "hidden",
          borderRadius: 8,
          paddingHorizontal: 10,
          paddingVertical: 5,
          backgroundColor: statusColor(program),
          fontSize: 12,
          fontWeight: "900",
        }}
      >
        {program.launchLabel}
      </Text>

      <Text style={{ fontSize: 22, fontWeight: "bold", marginTop: 10 }}>
        {program.title}
      </Text>

      <Text style={{ marginTop: 4 }}>
        {program.durationMonths > 0
          ? `${program.durationMonths} month program`
          : "Custom duration"}
      </Text>

      <Text style={{ marginTop: 8 }}>{program.description}</Text>
      <Text style={{ marginTop: 8, fontWeight: "700" }}>{program.curationNote}</Text>
      <Text style={{ marginTop: 8 }}>
        Target: {program.curation.targetCohort}
      </Text>
      <Text style={{ marginTop: 4 }}>
        Required courses: {program.curation.requiredCourseIds.length || "Assessment selected"}
      </Text>

      <Link
        href={{
          pathname: "/programs/program",
          params: {
            programId: program.id,
          },
        }}
        asChild
      >
        <Pressable
          style={{
            marginTop: 12,
            padding: 12,
            backgroundColor: "#dcefe8",
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "bold" }}>Review Program</Text>
        </Pressable>
      </Link>
    </View>
  );
}

function ProgramSection({ title, description, programs }: { title: string; description: string; programs: ProgramPathway[] }) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 6 }}>{title}</Text>
      <Text style={{ marginBottom: 12 }}>{description}</Text>
      {programs.map((program) => (
        <ProgramCard key={program.id} program={program} />
      ))}
    </View>
  );
}

export default function BrowseProgramsScreen() {
  const launchPrograms = getLaunchPrograms();
  const structuredDrafts = getStructuredDraftPrograms();
  const customPrograms = getCustomProgramPathways();

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 8 }}>
        Browse Programs
      </Text>

      <Text style={{ marginBottom: 20 }}>
        Compare official launch pathways, structured drafts, and worker-built custom pathways. Browsing never creates an enrolment; enrolment starts from the recommendation saved from parent intake.
      </Text>

      <ProgramSection
        title="Official Launch Programs"
        description="Use these as the main SafeSteps program pathways."
        programs={launchPrograms}
      />

      <ProgramSection
        title="Structured Draft Programs"
        description="These are curated for review, but still need final governance approval before launch."
        programs={structuredDrafts}
      />

      <ProgramSection
        title="Assessment-Led Custom Pathway"
        description="Use this only when a worker builds a family-specific plan."
        programs={customPrograms}
      />
    </ScrollView>
  );
}

