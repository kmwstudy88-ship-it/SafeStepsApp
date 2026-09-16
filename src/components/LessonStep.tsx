import { View, Text } from "react-native";
import type { Step } from "../types";

export type LessonStepProps = {
  step: Step;
};

export default function LessonStep(props: LessonStepProps) {
  const { step } = props;

  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontSize: 16, lineHeight: 22 }}>{step.text}</Text>
    </View>
  );
}
