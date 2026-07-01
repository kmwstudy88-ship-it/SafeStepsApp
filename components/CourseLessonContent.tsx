import { Text, TextInput, View } from "react-native";

import type { CourseLesson } from "../lib/data/courses";
import { globalStyles } from "../lib/styles";

function ComparisonColumn({
  title,
  items,
  positive,
}: {
  title: string;
  items: string[];
  positive: boolean;
}) {
  return (
    <View style={globalStyles.coursePointCard}>
      <Text style={globalStyles.courseSectionTitle}>{title}</Text>
      {items.map((item) => (
        <View key={item} style={globalStyles.courseStepRow}>
          <View style={positive ? globalStyles.courseCheckIcon : globalStyles.courseXIcon}>
            <Text style={positive ? globalStyles.courseCheckIconText : globalStyles.courseXIconText}>
              {positive ? "OK" : "X"}
            </Text>
          </View>
          <Text style={globalStyles.courseBody}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export function CourseLessonContent({
  lesson,
  parentMeaning,
  onParentMeaningChange,
}: {
  lesson: CourseLesson;
  parentMeaning: string;
  onParentMeaningChange: (value: string) => void;
}) {
  const parentMeaningPrompt =
    lesson.content?.parentMeaningPrompt ??
    `What does "${lesson.title}" mean for you, your child, and the way you want your family to grow?`;

  return (
    <View style={{ gap: 22 }}>
      {lesson.content ? (
        <View style={globalStyles.courseFeatureCard}>
          <View style={globalStyles.courseFeatureIcon}>
            <Text style={globalStyles.courseFeatureIconText}>S</Text>
          </View>
          <View style={globalStyles.courseFeatureCopy}>
            <Text style={globalStyles.courseSectionTitle}>Why it matters</Text>
            <Text style={globalStyles.courseBody}>{lesson.content.whyItMatters}</Text>
          </View>
        </View>
      ) : null}

      {lesson.content?.validationIs && lesson.content.validationIsNot ? (
        <View style={globalStyles.courseBlock}>
          <Text style={globalStyles.courseBlockTitle}>
            {lesson.content.comparisonTitle ?? "What this is and is not"}
          </Text>
          <View style={globalStyles.courseGrid}>
            <ComparisonColumn
              title={lesson.content.positiveTitle ?? "This is"}
              items={lesson.content.validationIs}
              positive
            />
            <ComparisonColumn
              title={lesson.content.negativeTitle ?? "This is not"}
              items={lesson.content.validationIsNot}
              positive={false}
            />
          </View>
        </View>
      ) : null}

      {lesson.content?.positiveItems && lesson.content.negativeItems ? (
        <View style={globalStyles.courseBlock}>
          <Text style={globalStyles.courseBlockTitle}>
            {lesson.content.comparisonTitle ?? "What this is and is not"}
          </Text>
          <View style={globalStyles.courseGrid}>
            <ComparisonColumn
              title={lesson.content.positiveTitle ?? "This is"}
              items={lesson.content.positiveItems}
              positive
            />
            <ComparisonColumn
              title={lesson.content.negativeTitle ?? "This is not"}
              items={lesson.content.negativeItems}
              positive={false}
            />
          </View>
        </View>
      ) : null}

      {lesson.content?.example ? (
        <View style={globalStyles.courseFeatureCard}>
          <View style={globalStyles.courseFeatureCopy}>
            <Text style={globalStyles.courseBlockTitle}>Example</Text>
            <View style={globalStyles.courseGrid}>
              <View style={globalStyles.courseSpeechCard}>
                <Text style={globalStyles.courseSectionTitle}>
                  {lesson.content.example.insteadOfLabel ?? "Instead of"}
                </Text>
                <Text style={globalStyles.courseBody}>{lesson.content.example.insteadOf}</Text>
              </View>
              <View style={globalStyles.courseSpeechCard}>
                <Text style={globalStyles.courseSectionTitle}>
                  {lesson.content.example.trySayingLabel ?? "Try"}
                </Text>
                <Text style={globalStyles.courseBody}>{lesson.content.example.trySaying}</Text>
              </View>
            </View>
          </View>
        </View>
      ) : null}

      {lesson.content?.steps?.length ? (
        <View style={globalStyles.courseBlock}>
          <Text style={globalStyles.courseBlockTitle}>
            {lesson.content.stepsTitle ?? `How to practise in ${lesson.content.steps.length} steps`}
          </Text>
          {lesson.content.steps.map((step, index) => (
            <View key={step.title} style={globalStyles.courseStepRow}>
              <View style={globalStyles.courseStepNumber}>
                <Text style={globalStyles.courseStepNumberText}>{index + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={globalStyles.courseSectionTitle}>{step.title}</Text>
                <Text style={globalStyles.courseBody}>{step.body}</Text>
                <Text style={globalStyles.coursePrompt}>{step.prompt}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}

      <View style={globalStyles.courseReflectionCard}>
        <Text style={globalStyles.courseBlockTitle}>Parent meaning</Text>
        <Text style={globalStyles.courseBody}>{parentMeaningPrompt}</Text>
        <TextInput
          value={parentMeaning}
          onChangeText={onParentMeaningChange}
          placeholder="Write what this lesson means for you and your family."
          placeholderTextColor="#667085"
          multiline
          style={globalStyles.courseReflectionInput}
        />
      </View>
    </View>
  );
}
