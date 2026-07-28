import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

type ResourceFilter = "All" | "Parenting" | "Safety" | "Templates";

type ResourceItem = {
  title: string;
  badge: "Guide" | "PDF" | "Worksheet" | "Checklist" | "Template";
  filters: ResourceFilter[];
  href?: string;
};

type ResourceSection = {
  category: string;
  icon: string;
  accent: string;
  items: ResourceItem[];
};

const filters: ResourceFilter[] = ["All", "Parenting", "Safety", "Templates"];

const resources: ResourceSection[] = [
  {
    category: "Parenting Tools",
    icon: "🛠️",
    accent: "#0D5C75",
    items: [
      {
        title: "Family meeting template",
        badge: "Template",
        filters: ["Parenting", "Templates"],
        href: "/resources/parenting-tools?tool=family-meeting",
      },
      {
        title: "Daily routine checklist",
        badge: "Checklist",
        filters: ["Parenting"],
        href: "/resources/parenting-tools?tool=daily-routine",
      },
      {
        title: "Positive communication guide",
        badge: "Guide",
        filters: ["Parenting"],
        href: "/resources/parenting-tools?tool=positive-communication",
      },
      {
        title: "Child behaviour observation sheet",
        badge: "Worksheet",
        filters: ["Parenting", "Templates"],
        href: "/resources/parenting-tools?tool=behaviour-observation",
      },
    ],
  },
  {
    category: "Evidence Templates",
    icon: "📋",
    accent: "#4A6F3B",
    items: [
      {
        title: "Weekly parenting practice log",
        badge: "Worksheet",
        filters: ["Templates", "Parenting"],
        href: "/resources/evidence-templates?template=weekly-practice-log",
      },
      {
        title: "Home routine evidence checklist",
        badge: "Checklist",
        filters: ["Templates"],
        href: "/resources/evidence-templates?template=home-routine-checklist",
      },
      {
        title: "Reflection journal template",
        badge: "Template",
        filters: ["Templates"],
        href: "/resources/evidence-templates?template=reflection-journal",
      },
      {
        title: "Goal progress tracker",
        badge: "Worksheet",
        filters: ["Templates"],
        href: "/resources/evidence-templates?template=goal-progress-tracker",
      },
    ],
  },
  {
    category: "Safety and Support",
    icon: "🛡️",
    accent: "#B54708",
    items: [
      {
        title: "Emergency support contacts",
        badge: "Guide",
        filters: ["Safety"],
        href: "/resources/safety-planning?tool=emergency-contacts",
      },
      {
        title: "Safety planning worksheet",
        badge: "Worksheet",
        filters: ["Safety", "Templates"],
        href: "/resources/safety-planning?tool=safety-plan",
      },
      {
        title: "Child wellbeing check-in guide",
        badge: "Guide",
        filters: ["Safety", "Parenting"],
        href: "/resources/child-wellbeing-check-in",
      },
      {
        title: "Support service preparation checklist",
        badge: "Checklist",
        filters: ["Safety"],
        href: "/resources/support-service-preparation",
      },
    ],
  },
  {
    category: "Program Support",
    icon: "📘",
    accent: "#5B5B7A",
    items: [
      {
        title: "How SafeSteps programs work",
        badge: "Guide",
        filters: ["Parenting"],
        href: "/resources/program-support?guide=program-overview",
      },
      {
        title: "Understanding monthly topics",
        badge: "Guide",
        filters: ["Parenting"],
        href: "/resources/program-support?guide=curriculum-structure",
      },
      {
        title: "Understanding weekly sub-topics",
        badge: "Guide",
        filters: ["Parenting"],
        href: "/resources/program-support?guide=curriculum-structure",
      },
      {
        title: "How growth reports are created",
        badge: "PDF",
        filters: ["Templates"],
        href: "/resources/program-support?guide=growth-reporting",
      },
    ],
  },
];

const safetyItems = resources.find((section) => section.category === "Safety and Support")?.items.slice(0, 2) ?? [];

export default function ResourcesScreen() {
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<ResourceFilter>("All");
  const isTwoColumn = width >= 840;
  const normalizedQuery = query.trim().toLowerCase();

  const filteredResources = useMemo(
    () =>
      resources
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => {
            const matchesQuery =
              !normalizedQuery ||
              `${section.category} ${item.title} ${item.badge}`.toLowerCase().includes(normalizedQuery);
            const matchesFilter = activeFilter === "All" || item.filters.includes(activeFilter);
            return matchesQuery && matchesFilter;
          }),
        }))
        .filter((section) => section.items.length > 0),
    [activeFilter, normalizedQuery],
  );

  function openResource(href?: string) {
    if (href) router.push(href as never);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Resources</Text>
        <Text style={styles.intro}>
          Resources are available anytime. They are separate from Programs and Courses and can be used as support tools,
          worksheets, templates, and guides.
        </Text>
      </View>

      <View style={styles.searchPanel}>
        <TextInput
          accessibilityLabel="Search resources"
          onChangeText={setQuery}
          placeholder="Search resources, checklists, templates..."
          placeholderTextColor="#67736A"
          style={styles.searchInput}
          value={query}
        />
        <View style={styles.filterRow}>
          {filters.map((filter) => {
            const active = activeFilter === filter;
            return (
              <Pressable
                accessibilityRole="button"
                key={filter}
                onPress={() => setActiveFilter(filter)}
                style={({ pressed }) => [
                  styles.filterPill,
                  active && styles.filterPillActive,
                  pressed && styles.filterPillPressed,
                ]}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>{filter}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.safetyBanner}>
        <View style={styles.safetyHeaderRow}>
          <Text style={styles.safetyIcon}>🛡️</Text>
          <View style={styles.safetyCopy}>
            <Text style={styles.safetyTitle}>Safety resources</Text>
            <Text style={styles.safetyText}>Quick access for urgent planning and support preparation.</Text>
          </View>
        </View>
        <View style={styles.safetyLinks}>
          {safetyItems.map((item) => (
            <Pressable
              accessibilityRole="link"
              key={item.title}
              onPress={() => openResource(item.href)}
              style={({ pressed }) => [styles.safetyLink, pressed && styles.safetyLinkPressed]}
            >
              <Text style={styles.safetyLinkText}>{item.title}</Text>
              <Text style={styles.cardChevron}>›</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.grid}>
        {filteredResources.map((section) => (
          <View
            key={section.category}
            style={[
              styles.categoryCard,
              isTwoColumn && styles.categoryCardTwoColumn,
              { borderColor: `${section.accent}33` },
            ]}
          >
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryIcon}>{section.icon}</Text>
              <Text style={styles.categoryTitle}>{section.category}</Text>
            </View>

            {section.items.map((item) => (
              <Pressable
                accessibilityRole="link"
                key={item.title}
                onPress={() => openResource(item.href)}
                style={({ pressed }) => [
                  styles.resourceCard,
                  pressed && {
                    borderColor: section.accent,
                    transform: [{ translateY: -2 }],
                  },
                ]}
              >
                <View style={styles.resourceTextBlock}>
                  <Text style={styles.resourceTitle}>{item.title}</Text>
                  <Text style={styles.resourceMeta}>Ready-to-use resource</Text>
                </View>
                <View style={styles.resourceAction}>
                  <Text style={styles.badge}>{item.badge}</Text>
                  <Text style={styles.cardChevron}>›</Text>
                </View>
              </Pressable>
            ))}
          </View>
        ))}
      </View>

      {filteredResources.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No resources found</Text>
          <Text style={styles.emptyText}>Try a different search term or switch the filter back to All.</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#F7FAF8", flex: 1 },
  content: { padding: 20, paddingBottom: 32 },
  header: { marginBottom: 16 },
  title: { color: "#12332B", fontSize: 28, fontWeight: "800", marginBottom: 8 },
  intro: { color: "#43534D", fontSize: 15, lineHeight: 22, maxWidth: 820 },
  searchPanel: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8E2",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
    padding: 12,
  },
  searchInput: {
    backgroundColor: "#F8FBF9",
    borderColor: "#CCDCD4",
    borderRadius: 8,
    borderWidth: 1,
    color: "#12332B",
    fontSize: 15,
    minHeight: 46,
    paddingHorizontal: 14,
  },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  filterPill: {
    borderColor: "#C9D8D1",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  filterPillActive: { backgroundColor: "#0D5C75", borderColor: "#0D5C75" },
  filterPillPressed: { opacity: 0.78 },
  filterText: { color: "#334740", fontSize: 13, fontWeight: "700" },
  filterTextActive: { color: "#FFFFFF" },
  safetyBanner: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FDBA74",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 18,
    padding: 14,
  },
  safetyHeaderRow: { alignItems: "center", flexDirection: "row", gap: 10 },
  safetyIcon: { fontSize: 24 },
  safetyCopy: { flex: 1 },
  safetyTitle: { color: "#7C2D12", fontSize: 17, fontWeight: "800" },
  safetyText: { color: "#8A4B22", fontSize: 13, marginTop: 2 },
  safetyLinks: { gap: 8, marginTop: 12 },
  safetyLink: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#FED7AA",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  safetyLinkPressed: { borderColor: "#B54708", opacity: 0.82 },
  safetyLinkText: { color: "#7C2D12", flex: 1, fontSize: 14, fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  categoryCard: {
    backgroundColor: "#EEF5F1",
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    width: "100%",
  },
  categoryCardTwoColumn: { flexBasis: "48.8%", flexGrow: 1 },
  categoryHeader: { alignItems: "center", flexDirection: "row", gap: 8, marginBottom: 12 },
  categoryIcon: { fontSize: 20 },
  categoryTitle: { color: "#183C33", flex: 1, fontSize: 20, fontWeight: "800" },
  resourceCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#D8E5DD",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    minHeight: 68,
    padding: 12,
  },
  resourceTextBlock: { flex: 1, paddingRight: 10 },
  resourceTitle: { color: "#1E352E", fontSize: 15, fontWeight: "700", lineHeight: 20 },
  resourceMeta: { color: "#66756E", fontSize: 12, marginTop: 2 },
  resourceAction: { alignItems: "center", flexDirection: "row", gap: 8 },
  badge: {
    backgroundColor: "#EDF7F4",
    borderColor: "#C9E1D9",
    borderRadius: 999,
    borderWidth: 1,
    color: "#0D5C75",
    fontSize: 11,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cardChevron: { color: "#0D5C75", fontSize: 24, fontWeight: "700", lineHeight: 24 },
  emptyState: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8E2",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 14,
    padding: 18,
  },
  emptyTitle: { color: "#183C33", fontSize: 17, fontWeight: "800" },
  emptyText: { color: "#66756E", fontSize: 13, marginTop: 4, textAlign: "center" },
});
