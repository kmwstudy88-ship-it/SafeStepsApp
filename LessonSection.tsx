import { View, Text } from "react-native";
import LessonStep from "./LessonStep";

interface Section {
  title: string;
  steps: Array<{ text: string }>;
}

export default function LessonSection({ section }: { section: Section }) {
  return (
    <View style={{ marginBottom: 30 }}>
      <Text style={{ fontSize: 22, fontWeight: "600", marginBottom: 10 }}>
        {section.title}
      </Text>

      {section.steps.map((step, index) => (
        <LessonStep key={index} step={step} />
      ))}
    </View>
  );
}
