import React, { useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  getLessonWorkbookById,
  PARENT_LESSON_WORKBOOKS,
  ParentLessonWorkbook,
} from './parentLessonDefinitions';

const TOTAL_PAGES = 9;

export function ParentLessonWorkbookScreen({
  initialLessonId = 'taking_responsibility',
  onFinishLesson,
}: {
  initialLessonId?: string;
  onFinishLesson?: () => void;
}) {
  const [selectedLessonId, setSelectedLessonId] = useState(initialLessonId);
  const [page, setPage] = useState(1);
  const scrollRef = useRef<ScrollView | null>(null);

  const lesson: ParentLessonWorkbook = getLessonWorkbookById(selectedLessonId);
  const { theme } = lesson;
  const switcherWorkbooks = PARENT_LESSON_WORKBOOKS.some((item) => item.id === lesson.id)
    ? PARENT_LESSON_WORKBOOKS
    : [lesson, ...PARENT_LESSON_WORKBOOKS];

  // Interactive workbook state keyed by lessonId
  const [definitions, setDefinitions] = useState<Record<string, string>>({});
  const [checkInAnswers, setCheckInAnswers] = useState<Record<string, string>>({});
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [activity1Answers, setActivity1Answers] = useState<Record<string, string>>({});
  const [activity2Answers, setActivity2Answers] = useState<Record<string, string>>({});
  const [reflectionAnswers, setReflectionAnswers] = useState<Record<string, string>>({});
  const [selfChecks, setSelfChecks] = useState<Record<string, boolean>>({});
  const [wrapUpMinutes, setWrapUpMinutes] = useState<Record<string, string>>({});
  const [wrapUpResponse, setWrapUpResponse] = useState<Record<string, string>>({});
  const [wrapUpRoutine, setWrapUpRoutine] = useState<Record<string, string>>({});
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({});

  function goToPage(nextPage: number) {
    const clamped = Math.max(1, Math.min(TOTAL_PAGES, nextPage));
    setPage(clamped);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }

  function handleSelectLesson(lessonId: string) {
    setSelectedLessonId(lessonId);
    setPage(1);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }

  function toggleSelfCheck(index: number) {
    const key = `${lesson.id}_${index}`;
    setSelfChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const currentRating = ratings[lesson.id] ?? 0;

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      {/* Lesson Switcher Pills */}
      <View style={styles.lessonSwitcherBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.lessonSwitcherContent}
        >
          {switcherWorkbooks.map((item) => {
            const active = item.id === lesson.id;
            const isDone = completedLessons[item.id];
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.lessonTab,
                  active && {
                    backgroundColor: item.theme.accentPrimary,
                    borderColor: item.theme.accentPrimary,
                  },
                ]}
                onPress={() => handleSelectLesson(item.id)}
              >
                <Text
                  style={[
                    styles.lessonTabText,
                    active && styles.lessonTabTextActive,
                  ]}
                >
                  {item.title}
                  {isDone ? ' ✓' : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top Navigation Row (Back Button | Lesson Title | Page X of 9) */}
        <View style={styles.topNavRow}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={page > 1 ? 'Previous page' : 'Exit lesson'}
            style={styles.backCircleButton}
            onPress={() => {
              if (page > 1) {
                goToPage(page - 1);
              } else {
                onFinishLesson?.();
              }
            }}
          >
            <Text style={[styles.backArrowText, { color: theme.headingColor }]}>←</Text>
          </TouchableOpacity>

          <Text style={[styles.topLessonTitle, { color: theme.headingColor }]} numberOfLines={1}>
            {lesson.title}
          </Text>

          <View style={[styles.pagePill, { backgroundColor: theme.badgeBg }]}>
            <Text style={[styles.pagePillText, { color: theme.badgeText }]}>
              Page {page} of {TOTAL_PAGES}
            </Text>
          </View>
        </View>

        {/* 9-Segment Progress Bar */}
        <View style={styles.progressSegmentsRow}>
          {Array.from({ length: TOTAL_PAGES }, (_, idx) => {
            const segPage = idx + 1;
            const active = segPage <= page;
            return (
              <TouchableOpacity
                key={segPage}
                accessibilityRole="button"
                accessibilityLabel={`Go to page ${segPage}`}
                style={[
                  styles.progressSegment,
                  {
                    backgroundColor: active ? theme.accentPrimary : '#DCD7E8',
                  },
                ]}
                onPress={() => goToPage(segPage)}
              />
            );
          })}
        </View>

        {/* SafeSteps Brand Header */}
        <View style={styles.brandBlock}>
          <View style={styles.brandLogoRow}>
            <Text style={styles.brandEmblem}>💞</Text>
            <Text style={[styles.brandTitle, { color: theme.accentSecondary }]}>
              Safe
              <Text style={{ color: theme.accentPrimary }}>Steps</Text>
            </Text>
          </View>
          <Text style={[styles.brandTagline, { color: theme.headingColor }]}>
            STRONGER FAMILIES, SAFER FUTURES
          </Text>
        </View>

        {/* PAGE 1: Intro & Lesson Plan */}
        {page === 1 && (
          <View style={styles.pageBody}>
            <Text style={[styles.heroHeading, { color: theme.headingColor }]}>
              {lesson.title}
            </Text>

            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: theme.cardBorder }]} />
              <Text style={[styles.dividerHeart, { color: theme.heartIcon }]}>♥</Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.cardBorder }]} />
            </View>

            <View style={styles.clockBadgeRow}>
              <Text style={[styles.clockIcon, { color: theme.accentPrimary }]}>🕒</Text>
              <Text style={[styles.clockBadgeText, { color: theme.accentPrimary }]}>
                {lesson.durationLabel}
              </Text>
            </View>

            <Text style={[styles.leadParagraph, { color: theme.bodyColor }]}>
              {lesson.page1.introText}
            </Text>

            {/* In this lesson you will */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.cardBorder,
                },
              ]}
            >
              <View style={styles.introCardRow}>
                <View
                  style={[
                    styles.silhouetteCircle,
                    { backgroundColor: theme.accentSoft, borderColor: theme.cardBorder },
                  ]}
                >
                  <Text style={styles.silhouetteEmoji}>👨‍👩‍👧‍👦</Text>
                </View>

                <View style={styles.introOutcomesColumn}>
                  <Text style={[styles.cardSectionTitle, { color: theme.accentPrimary }]}>
                    In this lesson you will:
                  </Text>
                  {lesson.page1.learningOutcomes.map((outcome) => (
                    <View key={outcome} style={styles.heartBulletRow}>
                      <Text style={[styles.heartBulletIcon, { color: theme.heartIcon }]}>
                        ♥
                      </Text>
                      <Text style={[styles.bulletText, { color: theme.bodyColor }]}>
                        {outcome}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Lesson Plan */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.cardBorder,
                },
              ]}
            >
              <Text style={[styles.cardSectionTitle, { color: theme.accentPrimary }]}>
                Lesson Plan
              </Text>
              {lesson.page1.lessonPlan.map((step, idx) => (
                <View
                  key={step.label}
                  style={[
                    styles.planRow,
                    idx < lesson.page1.lessonPlan.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: theme.accentSoft,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.planIconCircle,
                      { backgroundColor: theme.accentSoft },
                    ]}
                  >
                    <Text style={styles.planIconText}>{step.icon}</Text>
                  </View>
                  <Text style={[styles.planDurationText, { color: theme.headingColor }]}>
                    {step.duration}{' '}
                    <Text style={[styles.planLabelText, { color: theme.bodyColor }]}>
                      – {step.label}
                    </Text>
                  </Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.primaryCtaButton, { backgroundColor: theme.buttonBg }]}
              onPress={() => goToPage(2)}
            >
              <Text style={[styles.primaryCtaText, { color: theme.buttonText }]}>
                Start Lesson
              </Text>
              <Text style={[styles.primaryCtaArrow, { color: theme.buttonText }]}>→</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* PAGE 2: Before You Start (Your Definition) */}
        {page === 2 && (
          <View style={styles.pageBody}>
            <Text style={[styles.heroHeading, { color: theme.headingColor }]}>
              {lesson.page2.heading}
            </Text>

            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: theme.cardBorder }]} />
              <Text style={[styles.dividerHeart, { color: theme.heartIcon }]}>♥</Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.cardBorder }]} />
            </View>

            <Text style={[styles.subHeadingText, { color: theme.accentPrimary }]}>
              {lesson.page2.subheading}
            </Text>

            <Text style={[styles.leadParagraph, { color: theme.bodyColor }]}>
              {lesson.page2.introText}
            </Text>

            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.cardBorder,
                },
              ]}
            >
              <View style={styles.introCardRow}>
                <View
                  style={[
                    styles.silhouetteCircle,
                    { backgroundColor: theme.accentSoft, borderColor: theme.cardBorder },
                  ]}
                >
                  <Text style={styles.silhouetteEmoji}>👨‍👩‍👧‍👦</Text>
                </View>
                <View style={styles.introOutcomesColumn}>
                  <Text style={[styles.smallCapsLabel, { color: theme.accentPrimary }]}>
                    {lesson.page2.mainQuestionLabel}
                  </Text>
                  <Text style={[styles.mainQuestionHeading, { color: theme.headingColor }]}>
                    {lesson.page2.mainQuestion}
                  </Text>
                </View>
              </View>

              <TextInput
                multiline
                placeholder="Write your thoughts in your own words..."
                placeholderTextColor={theme.mutedColor}
                value={definitions[lesson.id] ?? ''}
                onChangeText={(text) =>
                  setDefinitions((prev) => ({ ...prev, [lesson.id]: text }))
                }
                style={[
                  styles.linedTextArea,
                  {
                    borderColor: theme.cardBorder,
                    color: theme.bodyColor,
                    backgroundColor: theme.accentTint,
                  },
                ]}
              />

              <View
                style={[
                  styles.tipBox,
                  {
                    backgroundColor: theme.bannerBg,
                    borderColor: theme.bannerBorder,
                  },
                ]}
              >
                <View
                  style={[
                    styles.tipIconCircle,
                    { backgroundColor: theme.accentPrimary },
                  ]}
                >
                  <Text style={styles.tipIconText}>💡</Text>
                </View>
                <Text style={[styles.tipBodyText, { color: theme.bodyColor }]}>
                  {lesson.page2.tipText}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.primaryCtaButton, { backgroundColor: theme.buttonBg }]}
              onPress={() => goToPage(3)}
            >
              <Text style={[styles.primaryCtaText, { color: theme.buttonText }]}>Next</Text>
              <Text style={[styles.primaryCtaArrow, { color: theme.buttonText }]}>→</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* PAGE 3: Check-In & Warm-Up */}
        {page === 3 && (
          <View style={styles.pageBody}>
            <Text style={[styles.heroHeading, { color: theme.headingColor }]}>
              {lesson.page3.heading}
            </Text>

            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: theme.cardBorder }]} />
              <Text style={[styles.dividerHeart, { color: theme.heartIcon }]}>♥</Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.cardBorder }]} />
            </View>

            <View style={styles.clockBadgeRow}>
              <Text style={[styles.clockIcon, { color: theme.accentPrimary }]}>🕒</Text>
              <Text style={[styles.clockBadgeText, { color: theme.accentPrimary }]}>
                {lesson.page3.durationBadge}
              </Text>
            </View>

            <Text style={[styles.leadParagraph, { color: theme.bodyColor }]}>
              {lesson.page3.introText}
            </Text>

            {/* Quick Check-In Questions */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.cardBorder,
                },
              ]}
            >
              <View style={styles.cardHeaderWithIcon}>
                <View
                  style={[
                    styles.sectionAvatarCircle,
                    { backgroundColor: theme.accentSoft },
                  ]}
                >
                  <Text style={styles.sectionAvatarEmoji}>💬</Text>
                </View>
                <Text style={[styles.cardSectionTitle, { color: theme.accentPrimary }]}>
                  {lesson.page3.questionsTitle}
                </Text>
              </View>

              {lesson.page3.questions.map((question, idx) => {
                const key = `${lesson.id}_q_${idx}`;
                return (
                  <View key={question} style={styles.numberedPromptBlock}>
                    <View style={styles.numberedPromptHeader}>
                      <View
                        style={[
                          styles.numberBadge,
                          { backgroundColor: theme.accentPrimary },
                        ]}
                      >
                        <Text style={styles.numberBadgeText}>{idx + 1}</Text>
                      </View>
                      <Text style={[styles.promptQuestionText, { color: theme.headingColor }]}>
                        {question}
                      </Text>
                    </View>
                    <TextInput
                      multiline
                      placeholder="Write your reflection..."
                      placeholderTextColor={theme.mutedColor}
                      value={checkInAnswers[key] ?? ''}
                      onChangeText={(text) =>
                        setCheckInAnswers((prev) => ({ ...prev, [key]: text }))
                      }
                      style={[
                        styles.dottedInput,
                        {
                          borderColor: theme.cardBorder,
                          color: theme.bodyColor,
                          backgroundColor: theme.accentTint,
                        },
                      ]}
                    />
                  </View>
                );
              })}
            </View>

            {/* Quick Rating 1-5 */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.cardBorder,
                },
              ]}
            >
              <View style={styles.cardHeaderWithIcon}>
                <View
                  style={[
                    styles.sectionAvatarCircle,
                    { backgroundColor: theme.accentSoft },
                  ]}
                >
                  <Text style={styles.sectionAvatarEmoji}>⭐</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardSectionTitle, { color: theme.accentPrimary }]}>
                    {lesson.page3.ratingTitle}
                  </Text>
                  <Text style={[styles.ratingSubprompt, { color: theme.bodyColor }]}>
                    {lesson.page3.ratingPrompt}
                  </Text>
                </View>
              </View>

              <View style={styles.ratingScaleRow}>
                {[1, 2, 3, 4, 5].map((num) => {
                  const selected = currentRating === num;
                  return (
                    <TouchableOpacity
                      key={num}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      style={[
                        styles.ratingCircle,
                        {
                          borderColor: selected ? theme.accentPrimary : theme.cardBorder,
                          backgroundColor: selected
                            ? theme.accentPrimary
                            : theme.cardBackground,
                        },
                      ]}
                      onPress={() =>
                        setRatings((prev) => ({ ...prev, [lesson.id]: num }))
                      }
                    >
                      <Text
                        style={[
                          styles.ratingNumberText,
                          { color: selected ? '#FFFFFF' : theme.headingColor },
                        ]}
                      >
                        {num}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.ratingLabelsRow}>
                <Text style={[styles.ratingEdgeLabel, { color: theme.mutedColor }]}>
                  {lesson.page3.ratingLowLabel}
                </Text>
                <Text style={[styles.ratingEdgeLabel, { color: theme.mutedColor }]}>
                  {lesson.page3.ratingHighLabel}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.primaryCtaButton, { backgroundColor: theme.buttonBg }]}
              onPress={() => goToPage(4)}
            >
              <Text style={[styles.primaryCtaText, { color: theme.buttonText }]}>Next</Text>
              <Text style={[styles.primaryCtaArrow, { color: theme.buttonText }]}>→</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* PAGE 4: Key Learning (What Builds...) */}
        {page === 4 && (
          <View style={styles.pageBody}>
            <Text style={[styles.heroHeading, { color: theme.headingColor }]}>
              {lesson.page4.heading}
            </Text>

            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: theme.cardBorder }]} />
              <Text style={[styles.dividerHeart, { color: theme.heartIcon }]}>♥</Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.cardBorder }]} />
            </View>

            <View style={styles.clockBadgeRow}>
              <Text style={[styles.clockIcon, { color: theme.accentPrimary }]}>🕒</Text>
              <Text style={[styles.clockBadgeText, { color: theme.accentPrimary }]}>
                {lesson.page4.durationBadge}
              </Text>
            </View>

            <Text style={[styles.subHeadingText, { color: theme.accentPrimary }]}>
              🌿 {lesson.page4.sectionLabel} 🌿
            </Text>

            <Text style={[styles.leadParagraph, { color: theme.bodyColor }]}>
              {lesson.page4.introText}
            </Text>

            {lesson.page4.pillars.map((pillar) => (
              <View
                key={pillar.title}
                style={[
                  styles.pillarCard,
                  {
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.cardBorder,
                  },
                ]}
              >
                <View
                  style={[
                    styles.pillarIconCircle,
                    { backgroundColor: theme.accentSoft },
                  ]}
                >
                  <Text style={styles.pillarEmoji}>{pillar.icon}</Text>
                </View>
                <View style={styles.pillarTextColumn}>
                  <Text style={[styles.pillarTitle, { color: theme.headingColor }]}>
                    {pillar.title}
                  </Text>
                  <Text style={[styles.pillarDescription, { color: theme.bodyColor }]}>
                    {pillar.description}
                  </Text>
                </View>
              </View>
            ))}

            <View
              style={[
                styles.quoteBanner,
                {
                  backgroundColor: theme.bannerBg,
                  borderColor: theme.bannerBorder,
                },
              ]}
            >
              <Text style={[styles.quoteBannerHeart, { color: theme.heartIcon }]}>♥</Text>
              <Text style={[styles.quoteBannerText, { color: theme.headingColor }]}>
                {lesson.page4.bottomBannerQuote}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.primaryCtaButton, { backgroundColor: theme.buttonBg }]}
              onPress={() => goToPage(5)}
            >
              <Text style={[styles.primaryCtaText, { color: theme.buttonText }]}>Next</Text>
              <Text style={[styles.primaryCtaArrow, { color: theme.buttonText }]}>→</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* PAGE 5: Barriers & What Helps Repair */}
        {page === 5 && (
          <View style={styles.pageBody}>
            <Text style={[styles.heroHeading, { color: theme.headingColor }]}>
              {lesson.page5.heading}
            </Text>

            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: theme.cardBorder }]} />
              <Text style={[styles.dividerHeart, { color: theme.heartIcon }]}>♥</Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.cardBorder }]} />
            </View>

            <Text style={[styles.subHeadingText, { color: theme.accentPrimary }]}>
              {lesson.page5.sectionLabel}
            </Text>

            <Text style={[styles.leadParagraph, { color: theme.bodyColor }]}>
              {lesson.page5.introText}
            </Text>

            <View style={styles.twoColumnGrid}>
              {/* Left Column: Common Barriers */}
              <View
                style={[
                  styles.halfCard,
                  {
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.cardBorder,
                  },
                ]}
              >
                <View style={styles.halfCardHeader}>
                  <View
                    style={[
                      styles.sectionAvatarCircle,
                      { backgroundColor: theme.accentSoft },
                    ]}
                  >
                    <Text style={styles.sectionAvatarEmoji}>
                      {lesson.page5.barriersIcon}
                    </Text>
                  </View>
                  <Text style={[styles.halfCardTitle, { color: theme.accentPrimary }]}>
                    {lesson.page5.barriersTitle}
                  </Text>
                </View>

                <View style={styles.dividerRowCompact}>
                  <View
                    style={[styles.dividerLine, { backgroundColor: theme.cardBorder }]}
                  />
                  <Text style={[styles.dividerHeart, { color: theme.heartIcon }]}>♥</Text>
                  <View
                    style={[styles.dividerLine, { backgroundColor: theme.cardBorder }]}
                  />
                </View>

                {lesson.page5.barriers.map((barrier) => (
                  <View key={barrier} style={styles.heartBulletRow}>
                    <Text style={[styles.heartBulletIcon, { color: theme.heartIcon }]}>
                      ♥
                    </Text>
                    <Text style={[styles.bulletText, { color: theme.bodyColor }]}>
                      {barrier}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Right Column: What Helps Repair */}
              <View
                style={[
                  styles.halfCard,
                  {
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.cardBorder,
                  },
                ]}
              >
                <View style={styles.halfCardHeader}>
                  <View
                    style={[
                      styles.sectionAvatarCircle,
                      { backgroundColor: theme.accentSoft },
                    ]}
                  >
                    <Text style={styles.sectionAvatarEmoji}>
                      {lesson.page5.repairIcon}
                    </Text>
                  </View>
                  <Text style={[styles.halfCardTitle, { color: theme.accentPrimary }]}>
                    {lesson.page5.repairTitle}
                  </Text>
                </View>

                <View style={styles.dividerRowCompact}>
                  <View
                    style={[styles.dividerLine, { backgroundColor: theme.cardBorder }]}
                  />
                  <Text style={[styles.dividerHeart, { color: theme.heartIcon }]}>♥</Text>
                  <View
                    style={[styles.dividerLine, { backgroundColor: theme.cardBorder }]}
                  />
                </View>

                {lesson.page5.repairs.map((repair) => (
                  <View key={repair} style={styles.heartBulletRow}>
                    <Text style={[styles.heartBulletIcon, { color: theme.heartIcon }]}>
                      ♥
                    </Text>
                    <Text style={[styles.bulletText, { color: theme.bodyColor }]}>
                      {repair}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View
              style={[
                styles.quoteBanner,
                {
                  backgroundColor: theme.bannerBg,
                  borderColor: theme.bannerBorder,
                },
              ]}
            >
              <Text style={[styles.quoteBannerHeart, { color: theme.heartIcon }]}>♡</Text>
              <Text style={[styles.quoteBannerText, { color: theme.headingColor }]}>
                {lesson.page5.bottomBannerQuote}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.primaryCtaButton, { backgroundColor: theme.buttonBg }]}
              onPress={() => goToPage(6)}
            >
              <Text style={[styles.primaryCtaText, { color: theme.buttonText }]}>Next</Text>
              <Text style={[styles.primaryCtaArrow, { color: theme.buttonText }]}>→</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* PAGE 6: Activity 1 (Moments) */}
        {page === 6 && (
          <View style={styles.pageBody}>
            <Text style={[styles.heroHeading, { color: theme.headingColor }]}>
              {lesson.page6.heading}
              {'\n'}
              {lesson.page6.subtitle}
            </Text>

            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: theme.cardBorder }]} />
              <Text style={[styles.dividerHeart, { color: theme.heartIcon }]}>♥</Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.cardBorder }]} />
            </View>

            <View style={styles.clockBadgeRow}>
              <Text style={[styles.clockIcon, { color: theme.accentPrimary }]}>🕒</Text>
              <Text style={[styles.clockBadgeText, { color: theme.accentPrimary }]}>
                {lesson.page6.activityBadge}
              </Text>
            </View>

            <Text style={[styles.leadParagraph, { color: theme.bodyColor }]}>
              {lesson.page6.introText}
            </Text>

            {/* Write About a Moment Card */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.cardBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.cardSectionTitleCentered,
                  { color: theme.accentPrimary },
                ]}
              >
                🌿 {lesson.page6.formTitle} 🌿
              </Text>

              {lesson.page6.prompts.map((prompt, idx) => {
                const key = `${lesson.id}_act1_${idx}`;
                return (
                  <View key={prompt} style={styles.numberedPromptBlock}>
                    <View style={styles.numberedPromptHeader}>
                      <View
                        style={[
                          styles.numberBadge,
                          { backgroundColor: theme.accentPrimary },
                        ]}
                      >
                        <Text style={styles.numberBadgeText}>{idx + 1}</Text>
                      </View>
                      <Text style={[styles.promptQuestionText, { color: theme.headingColor }]}>
                        {prompt}
                      </Text>
                    </View>
                    <TextInput
                      multiline
                      placeholder="Write your notes here..."
                      placeholderTextColor={theme.mutedColor}
                      value={activity1Answers[key] ?? ''}
                      onChangeText={(text) =>
                        setActivity1Answers((prev) => ({ ...prev, [key]: text }))
                      }
                      style={[
                        styles.dottedInput,
                        {
                          borderColor: theme.cardBorder,
                          color: theme.bodyColor,
                          backgroundColor: theme.accentTint,
                        },
                      ]}
                    />
                  </View>
                );
              })}
            </View>

            {/* Ideas Card */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.cardBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.cardSectionTitleCentered,
                  { color: theme.accentPrimary },
                ]}
              >
                🌿 {lesson.page6.ideasTitle} 🌿
              </Text>
              <View style={styles.twoColumnIdeasWrap}>
                {lesson.page6.ideas.map((idea) => (
                  <View key={idea} style={styles.ideaCell}>
                    <Text style={[styles.heartBulletIcon, { color: theme.heartIcon }]}>
                      ♥
                    </Text>
                    <Text style={[styles.bulletText, { color: theme.bodyColor }]}>
                      {idea}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.primaryCtaButton, { backgroundColor: theme.buttonBg }]}
              onPress={() => goToPage(7)}
            >
              <Text style={[styles.primaryCtaText, { color: theme.buttonText }]}>Next</Text>
              <Text style={[styles.primaryCtaArrow, { color: theme.buttonText }]}>→</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* PAGE 7: Activity 2 (Plan) */}
        {page === 7 && (
          <View style={styles.pageBody}>
            <Text style={[styles.heroHeading, { color: theme.headingColor }]}>
              {lesson.page7.heading}
              {'\n'}
              {lesson.page7.subtitle}
            </Text>

            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: theme.cardBorder }]} />
              <Text style={[styles.clockBadgeText, { color: theme.accentPrimary }]}>
                {lesson.page7.activityBadge}
              </Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.cardBorder }]} />
            </View>

            <Text style={[styles.leadParagraph, { color: theme.bodyColor }]}>
              {lesson.page7.introText}
            </Text>

            {/* Build Your Plan Card */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.cardBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.cardSectionTitleCentered,
                  { color: theme.accentPrimary },
                ]}
              >
                {lesson.page7.formTitle}
              </Text>

              {lesson.page7.prompts.map((prompt, idx) => {
                const key = `${lesson.id}_act2_${idx}`;
                return (
                  <View key={prompt} style={styles.numberedPromptBlock}>
                    <View style={styles.numberedPromptHeader}>
                      <View
                        style={[
                          styles.numberBadge,
                          { backgroundColor: theme.accentPrimary },
                        ]}
                      >
                        <Text style={styles.numberBadgeText}>{idx + 1}</Text>
                      </View>
                      <Text style={[styles.promptQuestionText, { color: theme.headingColor }]}>
                        {prompt}
                      </Text>
                    </View>
                    <TextInput
                      multiline
                      placeholder="Type your plan step..."
                      placeholderTextColor={theme.mutedColor}
                      value={activity2Answers[key] ?? ''}
                      onChangeText={(text) =>
                        setActivity2Answers((prev) => ({ ...prev, [key]: text }))
                      }
                      style={[
                        styles.boxedPlanInput,
                        {
                          borderColor: theme.cardBorder,
                          color: theme.bodyColor,
                          backgroundColor: '#FFFFFF',
                        },
                      ]}
                    />
                  </View>
                );
              })}
            </View>

            {/* Simple Strategy Reminders */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.cardBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.cardSectionTitleCentered,
                  { color: theme.accentPrimary },
                ]}
              >
                {lesson.page7.remindersTitle}
              </Text>
              <View style={styles.twoColumnIdeasWrap}>
                {lesson.page7.reminders.map((reminder) => (
                  <View key={reminder} style={styles.ideaCell}>
                    <View
                      style={[
                        styles.checkCircleBadge,
                        { backgroundColor: theme.accentSoft },
                      ]}
                    >
                      <Text
                        style={[
                          styles.checkCircleText,
                          { color: theme.accentPrimary },
                        ]}
                      >
                        ✓
                      </Text>
                    </View>
                    <Text style={[styles.bulletText, { color: theme.bodyColor }]}>
                      {reminder}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View
              style={[
                styles.quoteBanner,
                {
                  backgroundColor: theme.bannerBg,
                  borderColor: theme.bannerBorder,
                },
              ]}
            >
              <Text style={[styles.quoteBannerHeart, { color: theme.heartIcon }]}>💜</Text>
              <Text style={[styles.quoteBannerText, { color: theme.headingColor }]}>
                {lesson.page7.bottomBannerQuote}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.primaryCtaButton, { backgroundColor: theme.buttonBg }]}
              onPress={() => goToPage(8)}
            >
              <Text style={[styles.primaryCtaText, { color: theme.buttonText }]}>Next</Text>
              <Text style={[styles.primaryCtaArrow, { color: theme.buttonText }]}>→</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* PAGE 8: Reflection & Quick Self-Check */}
        {page === 8 && (
          <View style={styles.pageBody}>
            <Text style={[styles.heroHeading, { color: theme.headingColor }]}>
              {lesson.page8.heading}
            </Text>

            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: theme.cardBorder }]} />
              <Text style={[styles.dividerHeart, { color: theme.heartIcon }]}>♥</Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.cardBorder }]} />
            </View>

            <View style={styles.clockBadgeRow}>
              <Text style={[styles.clockIcon, { color: theme.accentPrimary }]}>🕒</Text>
              <Text style={[styles.clockBadgeText, { color: theme.accentPrimary }]}>
                {lesson.page8.badgeLabel}
              </Text>
            </View>

            <Text style={[styles.leadParagraph, { color: theme.bodyColor }]}>
              {lesson.page8.introText}
            </Text>

            {/* Reflection Questions Card */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.cardBorder,
                },
              ]}
            >
              <View style={styles.introCardRow}>
                <View
                  style={[
                    styles.silhouetteCircleSmall,
                    { backgroundColor: theme.accentSoft },
                  ]}
                >
                  <Text style={styles.silhouetteEmojiSmall}>👨‍👩‍👧‍👦</Text>
                </View>
                <Text style={[styles.cardSectionTitle, { color: theme.accentPrimary }]}>
                  {lesson.page8.questionsTitle}
                </Text>
              </View>

              {lesson.page8.questions.map((question, idx) => {
                const key = `${lesson.id}_ref_${idx}`;
                return (
                  <View key={question} style={styles.numberedPromptBlock}>
                    <View style={styles.numberedPromptHeader}>
                      <View
                        style={[
                          styles.numberBadge,
                          { backgroundColor: theme.accentPrimary },
                        ]}
                      >
                        <Text style={styles.numberBadgeText}>{idx + 1}</Text>
                      </View>
                      <Text style={[styles.promptQuestionText, { color: theme.headingColor }]}>
                        {question}
                      </Text>
                    </View>
                    <TextInput
                      multiline
                      placeholder="Write your reflection..."
                      placeholderTextColor={theme.mutedColor}
                      value={reflectionAnswers[key] ?? ''}
                      onChangeText={(text) =>
                        setReflectionAnswers((prev) => ({ ...prev, [key]: text }))
                      }
                      style={[
                        styles.dottedInput,
                        {
                          borderColor: theme.cardBorder,
                          color: theme.bodyColor,
                          backgroundColor: theme.accentTint,
                        },
                      ]}
                    />
                  </View>
                );
              })}
            </View>

            {/* Quick Self-Check Card */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.cardBorder,
                },
              ]}
            >
              <Text style={[styles.cardSectionTitle, { color: theme.accentPrimary }]}>
                {lesson.page8.selfCheckTitle} 🌿
              </Text>

              {lesson.page8.selfCheckItems.map((item, idx) => {
                const checked = !!selfChecks[`${lesson.id}_${idx}`];
                return (
                  <TouchableOpacity
                    key={item}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked }}
                    style={styles.checkboxRow}
                    onPress={() => toggleSelfCheck(idx)}
                  >
                    <View
                      style={[
                        styles.checkboxBox,
                        {
                          borderColor: theme.accentPrimary,
                          backgroundColor: checked
                            ? theme.accentPrimary
                            : '#FFFFFF',
                        },
                      ]}
                    >
                      {checked && <Text style={styles.checkboxTick}>✓</Text>}
                    </View>
                    <Text style={[styles.checkboxLabel, { color: theme.bodyColor }]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[styles.primaryCtaButton, { backgroundColor: theme.buttonBg }]}
              onPress={() => goToPage(9)}
            >
              <Text style={[styles.primaryCtaText, { color: theme.buttonText }]}>Next</Text>
              <Text style={[styles.primaryCtaArrow, { color: theme.buttonText }]}>→</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* PAGE 9: Lesson Wrap-Up */}
        {page === 9 && (
          <View style={styles.pageBody}>
            <Text style={[styles.heroHeading, { color: theme.headingColor }]}>
              {lesson.page9.heading}
            </Text>

            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: theme.cardBorder }]} />
              <Text style={[styles.dividerHeart, { color: theme.heartIcon }]}>♥</Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.cardBorder }]} />
            </View>

            <Text style={[styles.subHeadingText, { color: theme.accentPrimary }]}>
              {lesson.page9.subheading}
            </Text>

            <Text style={[styles.leadParagraph, { color: theme.bodyColor }]}>
              {lesson.page9.introText}
            </Text>

            {/* This Week I Will... */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.cardBorder,
                },
              ]}
            >
              <View style={styles.introCardRow}>
                <View
                  style={[
                    styles.silhouetteCircle,
                    { backgroundColor: theme.accentSoft, borderColor: theme.cardBorder },
                  ]}
                >
                  <Text style={styles.silhouetteEmoji}>👨‍👩‍👧‍👦</Text>
                </View>

                <View style={styles.introOutcomesColumn}>
                  <Text style={[styles.cardSectionTitle, { color: theme.accentPrimary }]}>
                    {lesson.page9.weeklyPlanTitle}
                  </Text>

                  {/* Item 1: spend ___ minutes */}
                  <View style={styles.numberedPromptBlock}>
                    <View style={styles.numberedPromptHeader}>
                      <View
                        style={[
                          styles.numberBadge,
                          { backgroundColor: theme.accentPrimary },
                        ]}
                      >
                        <Text style={styles.numberBadgeText}>1</Text>
                      </View>
                      <View style={styles.inlineMinutesWrap}>
                        <Text style={[styles.promptQuestionText, { color: theme.bodyColor }]}>
                          {lesson.page9.minutesPrefix}{' '}
                        </Text>
                        <TextInput
                          keyboardType="numeric"
                          placeholder="15"
                          placeholderTextColor={theme.mutedColor}
                          value={wrapUpMinutes[lesson.id] ?? ''}
                          onChangeText={(val) =>
                            setWrapUpMinutes((prev) => ({ ...prev, [lesson.id]: val }))
                          }
                          style={[
                            styles.inlineMinutesInput,
                            {
                              borderBottomColor: theme.accentPrimary,
                              color: theme.headingColor,
                            },
                          ]}
                        />
                        <Text style={[styles.promptQuestionText, { color: theme.bodyColor }]}>
                          {' '}
                          {lesson.page9.minutesSuffix}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Item 2 */}
                  <View style={styles.numberedPromptBlock}>
                    <View style={styles.numberedPromptHeader}>
                      <View
                        style={[
                          styles.numberBadge,
                          { backgroundColor: theme.accentPrimary },
                        ]}
                      >
                        <Text style={styles.numberBadgeText}>2</Text>
                      </View>
                      <Text style={[styles.promptQuestionText, { color: theme.bodyColor }]}>
                        {lesson.page9.prompt2Label}
                      </Text>
                    </View>
                    <TextInput
                      placeholder="Write your supportive response..."
                      placeholderTextColor={theme.mutedColor}
                      value={wrapUpResponse[lesson.id] ?? ''}
                      onChangeText={(val) =>
                        setWrapUpResponse((prev) => ({ ...prev, [lesson.id]: val }))
                      }
                      style={[
                        styles.underlineInput,
                        {
                          borderBottomColor: theme.cardBorder,
                          color: theme.headingColor,
                        },
                      ]}
                    />
                  </View>

                  {/* Item 3 */}
                  <View style={styles.numberedPromptBlock}>
                    <View style={styles.numberedPromptHeader}>
                      <View
                        style={[
                          styles.numberBadge,
                          { backgroundColor: theme.accentPrimary },
                        ]}
                      >
                        <Text style={styles.numberBadgeText}>3</Text>
                      </View>
                      <Text style={[styles.promptQuestionText, { color: theme.bodyColor }]}>
                        {lesson.page9.prompt3Label}
                      </Text>
                    </View>
                    <TextInput
                      placeholder="Write the routine you will strengthen..."
                      placeholderTextColor={theme.mutedColor}
                      value={wrapUpRoutine[lesson.id] ?? ''}
                      onChangeText={(val) =>
                        setWrapUpRoutine((prev) => ({ ...prev, [lesson.id]: val }))
                      }
                      style={[
                        styles.underlineInput,
                        {
                          borderBottomColor: theme.cardBorder,
                          color: theme.headingColor,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Remember Card */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.cardBorder,
                },
              ]}
            >
              <Text style={[styles.cardSectionTitle, { color: theme.accentPrimary }]}>
                {lesson.page9.rememberTitle}
              </Text>
              {lesson.page9.rememberItems.map((item) => (
                <View key={item} style={styles.heartBulletRow}>
                  <Text style={[styles.heartBulletIcon, { color: theme.heartIcon }]}>♥</Text>
                  <Text style={[styles.bulletText, { color: theme.bodyColor }]}>{item}</Text>
                </View>
              ))}
            </View>

            {/* Lesson Complete Celebration Banner */}
            <View
              style={[
                styles.completeCelebrationCard,
                {
                  backgroundColor: theme.bannerBg,
                  borderColor: theme.bannerBorder,
                },
              ]}
            >
              <Text style={[styles.completeScriptHeading, { color: theme.accentPrimary }]}>
                ✨ {lesson.page9.completeHeading} ✨
              </Text>
              <Text style={[styles.completeSubtext, { color: theme.headingColor }]}>
                {lesson.page9.completeSubtext}
              </Text>
              <Text style={[styles.dividerHeart, { color: theme.heartIcon }]}>♥</Text>
            </View>

            <TouchableOpacity
              style={[styles.primaryCtaButton, { backgroundColor: theme.buttonBg }]}
              onPress={() => {
                setCompletedLessons((prev) => ({ ...prev, [lesson.id]: true }));
                if (onFinishLesson) {
                  onFinishLesson();
                } else {
                  goToPage(1);
                }
              }}
            >
              <Text style={[styles.primaryCtaText, { color: theme.buttonText }]}>
                Finish Lesson
              </Text>
              <Text style={[styles.primaryCtaArrow, { color: theme.buttonText }]}>→</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  lessonSwitcherBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 10,
  },
  lessonSwitcherContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  lessonTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#CBD5E0',
    backgroundColor: '#F7FAFC',
  },
  lessonTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A5568',
  },
  lessonTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 38,
    gap: 14,
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  backCircleButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  backArrowText: {
    fontSize: 20,
    fontWeight: '700',
  },
  topLessonTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  pagePill: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pagePillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressSegmentsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
  },
  progressSegment: {
    flex: 1,
    height: 7,
    borderRadius: 999,
  },
  brandBlock: {
    alignItems: 'center',
    marginTop: 4,
    gap: 2,
  },
  brandLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandEmblem: {
    fontSize: 26,
  },
  brandTitle: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  brandTagline: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  pageBody: {
    gap: 14,
  },
  heroHeading: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 38,
    marginTop: 4,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 28,
  },
  dividerRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerHeart: {
    fontSize: 14,
  },
  clockBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  clockIcon: {
    fontSize: 16,
  },
  clockBadgeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  subHeadingText: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  leadParagraph: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  introCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flexWrap: 'wrap',
  },
  silhouetteCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  silhouetteEmoji: {
    fontSize: 42,
  },
  silhouetteCircleSmall: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  silhouetteEmojiSmall: {
    fontSize: 26,
  },
  introOutcomesColumn: {
    flex: 1,
    minWidth: 190,
    gap: 8,
  },
  cardSectionTitle: {
    fontSize: 19,
    fontWeight: '800',
  },
  cardSectionTitleCentered: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  heartBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  heartBulletIcon: {
    fontSize: 13,
    marginTop: 3,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  planIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planIconText: {
    fontSize: 16,
  },
  planDurationText: {
    fontSize: 15,
    fontWeight: '700',
  },
  planLabelText: {
    fontWeight: '400',
  },
  smallCapsLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  mainQuestionHeading: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
  },
  linedTextArea: {
    minHeight: 150,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  tipIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipIconText: {
    fontSize: 18,
  },
  tipBodyText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  cardHeaderWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionAvatarEmoji: {
    fontSize: 22,
  },
  numberedPromptBlock: {
    gap: 8,
    marginTop: 4,
  },
  numberedPromptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  numberBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  promptQuestionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  dottedInput: {
    minHeight: 62,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  boxedPlanInput: {
    minHeight: 68,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  ratingSubprompt: {
    fontSize: 13,
    marginTop: 2,
  },
  ratingScaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginTop: 6,
  },
  ratingCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingNumberText: {
    fontSize: 17,
    fontWeight: '700',
  },
  ratingLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  ratingEdgeLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  pillarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  pillarIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillarEmoji: {
    fontSize: 30,
  },
  pillarTextColumn: {
    flex: 1,
    gap: 4,
  },
  pillarTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  pillarDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  quoteBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
  },
  quoteBannerHeart: {
    fontSize: 18,
  },
  quoteBannerText: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  twoColumnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  halfCard: {
    flex: 1,
    minWidth: 240,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  halfCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  halfCardTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
  },
  twoColumnIdeasWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
    columnGap: 12,
  },
  ideaCell: {
    width: '47%',
    minWidth: 140,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkCircleBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleText: {
    fontSize: 12,
    fontWeight: '800',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxTick: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  inlineMinutesWrap: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  inlineMinutesInput: {
    minWidth: 48,
    borderBottomWidth: 1.5,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  underlineInput: {
    borderBottomWidth: 1.5,
    paddingVertical: 6,
    paddingHorizontal: 4,
    fontSize: 14,
    marginLeft: 36,
  },
  completeCelebrationCard: {
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 4,
  },
  completeScriptHeading: {
    fontSize: 26,
    fontWeight: '800',
    fontStyle: 'italic',
  },
  completeSubtext: {
    fontSize: 14,
    fontWeight: '600',
  },
  primaryCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 999,
    marginTop: 4,
    gap: 10,
  },
  primaryCtaText: {
    fontSize: 20,
    fontWeight: '800',
  },
  primaryCtaArrow: {
    fontSize: 22,
    fontWeight: '700',
  },
});
