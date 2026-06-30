import { ScrollView, Text, View } from "react-native";

const resources = [
  {
    category: "Parenting Tools",
    items: [
      "Family meeting template",
      "Daily routine checklist",
      "Positive communication guide",
      "Child behaviour observation sheet",
    ],
  },
  {
    category: "Evidence Templates",
    items: [
      "Weekly parenting practice log",
      "Home routine evidence checklist",
      "Reflection journal template",
      "Goal progress tracker",
    ],
  },
  {
    category: "Safety and Support",
    items: [
      "Emergency support contacts",
      "Safety planning worksheet",
      "Child wellbeing check-in guide",
      "Support service preparation checklist",
    ],
  },
  {
    category: "Program Support",
    items: [
      "How SafeSteps programs work",
      "Understanding monthly topics",
      "Understanding weekly sub-topics",
      "How growth reports are created",
    ],
  },
];

export default function ResourcesScreen() {
  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 8 }}>
        Resources
      </Text>

      <Text style={{ marginBottom: 20 }}>
        Resources are available anytime. They are separate from Programs and
        Courses and can be used as support tools, worksheets, templates, and
        guides.
      </Text>

      {resources.map((section) => (
        <View
          key={section.category}
          style={{
            padding: 16,
            backgroundColor: "#f1f5f3",
            borderRadius: 12,
            marginBottom: 14,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
            {section.category}
          </Text>

          {section.items.map((item) => (
            <View
              key={item}
              style={{
                padding: 12,
                backgroundColor: "#ffffff",
                borderRadius: 10,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: "#d8e5dd",
              }}
            >
              <Text>{item}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}
