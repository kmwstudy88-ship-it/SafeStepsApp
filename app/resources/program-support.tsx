import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

type DownloadableGuide = {
  id: string;
  title: string;
  badge: "PDF Guide" | "Offline Guide";
  detail: string;
  sections: {
    title: string;
    body: string;
    bullets: string[];
  }[];
  checklist: string[];
};

const walkthroughSteps = [
  {
    title: "Start with onboarding",
    detail: "Complete the first-week setup, choose a realistic routine, and know where support resources live.",
  },
  {
    title: "Follow the program plan",
    detail: "Programs organize learning into monthly themes, weekly goals, activities, and reflection prompts.",
  },
  {
    title: "Save progress as you go",
    detail: "Lessons, check-ins, tasks, reflections, and evidence records build a clearer history of engagement.",
  },
  {
    title: "Review and share when ready",
    detail: "Growth reports can summarize completed activity for support workers, counselors, or legal representatives.",
  },
];

const guides: DownloadableGuide[] = [
  {
    id: "program-overview",
    title: "Program Overview",
    badge: "PDF Guide",
    detail: "How modules, weekly lessons, and activities fit together.",
    sections: [
      {
        title: "What a SafeSteps program is",
        body:
          "A SafeSteps program is a guided pathway that helps a parent move through structured learning, practical tasks, reflection, and evidence collection in a steady order.",
        bullets: [
          "Programs organize the parent-facing pathway.",
          "Courses and lessons remain the canonical learning content.",
          "Resources, check-ins, tasks, and evidence tools support the pathway without replacing it.",
        ],
      },
      {
        title: "How the pathway is structured",
        body:
          "Most programs are arranged around larger monthly themes and smaller weekly goals so parents can understand the purpose of each activity.",
        bullets: [
          "Monthly themes give the broader focus, such as communication, emotional regulation, routines, boundaries, safety, or connection.",
          "Weekly sub-topics break the theme into practical steps.",
          "Lessons explain the skill, activities help parents practise it, and reflections capture what changed.",
        ],
      },
      {
        title: "What to expect in week 1",
        body:
          "The first week should feel like setup, not pressure. The goal is to understand where everything lives and begin a small repeatable routine.",
        bullets: [
          "Review the program overview and first weekly goal.",
          "Choose a realistic time for learning, check-ins, and evidence notes.",
          "Find key support resources before they are urgently needed.",
          "Start with small records that show engagement over time.",
        ],
      },
      {
        title: "Navigation basics",
        body:
          "Parents should use the main areas of SafeSteps for different jobs so progress is easier to understand and explain.",
        bullets: [
          "Programs: follow the guided pathway.",
          "Library: browse canonical courses and lessons.",
          "Resources: use checklists, guides, and preparation tools.",
          "Evidence: save records that support progress and engagement.",
          "Reports: review summaries only when source records are ready.",
        ],
      },
    ],
    checklist: [
      "I know which program pathway I am following.",
      "I know where lessons, resources, check-ins, and evidence tools are located.",
      "I have chosen a weekly routine I can realistically repeat.",
      "I know how to save progress before leaving a screen.",
      "I know which support resource to use if I feel stuck.",
    ],
  },
  {
    id: "curriculum-structure",
    title: "Curriculum Structure",
    badge: "Offline Guide",
    detail: "Monthly themes, weekly sub-topics, and practice goals.",
    sections: [
      {
        title: "The difference between Programs, Courses, and Lessons",
        body:
          "SafeSteps keeps curriculum content and program pathways separate so learning remains clear and reusable.",
        bullets: [
          "Lessons are the smallest focused learning units.",
          "Courses group related lessons into a structured skill area.",
          "Programs arrange selected lessons, courses, activities, reflections, and evidence prompts into a guided pathway.",
        ],
      },
      {
        title: "Monthly topics",
        body:
          "Monthly topics explain the larger learning area and help parents understand why a group of weekly tasks matters.",
        bullets: [
          "Positive communication can focus on calm language, repair, listening, and respectful responses.",
          "Emotional regulation can focus on noticing triggers, calming strategies, and co-regulation.",
          "Routine and boundaries can focus on predictable structure, limits, follow-through, and safety.",
          "Connection and repair can focus on trust-building, one-on-one time, and child-centred responses.",
        ],
      },
      {
        title: "Weekly sub-topics",
        body:
          "Weekly sub-topics make the monthly theme practical by turning it into goals, exercises, and reflection prompts.",
        bullets: [
          "Each week should have a clear focus that can be practised in real family life.",
          "Weekly goals should be small enough to repeat and observe.",
          "Reflection prompts should help parents notice effort, barriers, and changes.",
          "Evidence prompts should capture examples without overstating what they prove.",
        ],
      },
      {
        title: "Using learning without rushing",
        body:
          "Progress should be built from consistency, review, and supported practice rather than racing through screens.",
        bullets: [
          "Complete lessons in order when the program gives an order.",
          "Repeat important activities if the skill is not stable yet.",
          "Use resources when a checklist or guide would reduce stress.",
          "Ask for support when barriers keep repeating.",
        ],
      },
    ],
    checklist: [
      "I understand that lessons and courses are the curriculum source.",
      "I understand that programs organize learning into a pathway.",
      "I can identify the monthly theme I am working on.",
      "I can explain the weekly goal in plain language.",
      "I know what practice task or reflection belongs with this week.",
    ],
  },
  {
    id: "growth-reporting",
    title: "Growth Reporting",
    badge: "PDF Guide",
    detail: "How activity logs and evidence feed report summaries.",
    sections: [
      {
        title: "What growth reports are for",
        body:
          "Growth reports help summarize engagement, effort, consistency, and recorded progress for review by the parent and, when chosen, support professionals.",
        bullets: [
          "Reports can show participation over time.",
          "Reports can organize lessons, check-ins, reflections, tasks, and evidence records.",
          "Reports should not be treated as automatic legal, clinical, safety, or reunification decisions.",
        ],
      },
      {
        title: "What feeds a report",
        body:
          "A useful report is built from source records that remain traceable and reviewable.",
        bullets: [
          "Completed lessons and course activity show learning engagement.",
          "Check-ins and reflections show patterns over time.",
          "Tasks and checklist completion show practical follow-through.",
          "Evidence uploads can support claims when the source, date, and limitation are clear.",
          "Support service notes should stay separate from final approvals unless a dedicated approval record exists.",
        ],
      },
      {
        title: "Sharing reports",
        body:
          "Parents should control when and how reports are shared, and report language should stay accurate about what is verified.",
        bullets: [
          "Share only what is appropriate for the support worker, counsellor, educator, or legal representative.",
          "Keep facts, reflections, interpretations, and responses separate.",
          "Do not describe a report as court approved unless that approval actually exists.",
          "Use reports as evidence of engagement and progress signals, not as a guarantee of an outcome.",
        ],
      },
      {
        title: "Before exporting",
        body:
          "A quick review before sharing helps prevent confusion, missing context, or overstated conclusions.",
        bullets: [
          "Check that dates and titles are correct.",
          "Check that evidence records have enough context.",
          "Check that any sensitive child information is appropriate to share.",
          "Check that unresolved concerns or limitations are still visible.",
        ],
      },
    ],
    checklist: [
      "I have completed current lessons, reflections, or check-ins before reporting.",
      "My evidence records include context and dates.",
      "I know who I am sharing the report with and why.",
      "Sensitive child information has been reviewed before sharing.",
      "The report does not claim more than the records can support.",
    ],
  },
];

const faqs: FaqItem[] = [
  {
    id: "programs-work",
    question: "How do SafeSteps programs work?",
    answer:
      "Programs are guided pathways. They draw from the canonical Lessons and Courses library, then organize that learning into monthly topics, weekly sub-topics, activities, practice tasks, and reflections.",
  },
  {
    id: "week-one",
    question: "What should I expect in week 1?",
    answer:
      "Week 1 is about setup: understanding your program, choosing a routine, finding check-ins and resources, and starting with small activities that can be repeated consistently.",
  },
  {
    id: "monthly-topics",
    question: "What are monthly topics?",
    answer:
      "Monthly topics are broad themes such as positive communication, emotional regulation, routines, boundaries, safety, and family connection. They help parents see the bigger purpose behind each week.",
  },
  {
    id: "weekly-subtopics",
    question: "How do weekly sub-topics work?",
    answer:
      "Weekly sub-topics turn the monthly theme into practical goals, lesson activities, reflection prompts, and evidence-friendly practice tasks that can be completed in everyday life.",
  },
  {
    id: "growth-reports",
    question: "How are growth reports created?",
    answer:
      "Growth reports summarize completed lessons, daily or weekly check-ins, reflections, task completion, and evidence records. They are engagement summaries, not automatic legal or clinical decisions.",
  },
  {
    id: "sharing-reports",
    question: "Can I share reports with a support worker or legal representative?",
    answer:
      "Reports can be exported or presented when the parent chooses to share them. Keep source records, reflections, and interpretations separate so the report remains clear and reviewable.",
  },
];

const sections = [
  {
    title: "How SafeSteps Programs Work",
    points: [
      "Program overview: modules, weekly lessons, activities, and reflections are arranged into a guided pathway.",
      "Onboarding steps: week 1 focuses on routine setup, first check-ins, resource access, and support planning.",
      "Navigation basics: use Programs for the pathway, Library for curriculum, Resources for tools, and Evidence for saved proof of engagement.",
    ],
  },
  {
    title: "Curriculum & Learning Structure",
    points: [
      "Monthly topics explain the larger learning theme and expected outcomes.",
      "Weekly sub-topics break that theme into actionable goals, practice exercises, and reflection prompts.",
      "Lessons and Courses remain the canonical curriculum source; Programs organize them into a parent-facing pathway.",
    ],
  },
  {
    title: "Tracking & Progress Reporting",
    points: [
      "Growth reports can draw from activity logs, check-ins, reflections, completed checklists, and evidence uploads.",
      "Sharing reports should be parent-controlled and used as verified evidence of engagement, not as an automatic decision.",
      "Secure presentation matters: reports should preserve dates, sources, notes, and any limits on what the information proves.",
    ],
  },
];

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function guideToHtml(guide: DownloadableGuide) {
  const sectionsHtml = guide.sections
    .map(
      (section) => `
        <section>
          <h2>${escapeHtml(section.title)}</h2>
          <p>${escapeHtml(section.body)}</p>
          <ul>
            ${section.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}
          </ul>
        </section>
      `,
    )
    .join("");
  const checklistHtml = guide.checklist.map((item) => `<li><span class="box"></span>${escapeHtml(item)}</li>`).join("");

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body {
            color: #12332B;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            line-height: 1.45;
            padding: 32px;
          }
          h1 { font-size: 28px; margin: 0 0 8px; }
          h2 { color: #0D5C75; font-size: 18px; margin: 24px 0 8px; }
          p { color: #43534D; margin: 0 0 10px; }
          ul { margin: 8px 0 0 20px; padding: 0; }
          li { margin: 6px 0; }
          .badge {
            border: 1px solid #C9E1D9;
            border-radius: 999px;
            color: #0D5C75;
            display: inline-block;
            font-size: 11px;
            font-weight: 800;
            margin-bottom: 12px;
            padding: 5px 10px;
            text-transform: uppercase;
          }
          .checklist {
            background: #FFFDF7;
            border: 1px solid #E7D7A8;
            border-radius: 8px;
            margin-top: 24px;
            padding: 16px;
          }
          .checklist h2 { color: #4B3B16; margin-top: 0; }
          .checklist ul { list-style: none; margin-left: 0; }
          .box {
            border: 1.5px solid #0D5C75;
            display: inline-block;
            height: 12px;
            margin-right: 8px;
            width: 12px;
          }
          .footer {
            border-top: 1px solid #DDE8E2;
            color: #66756E;
            font-size: 11px;
            margin-top: 28px;
            padding-top: 12px;
          }
        </style>
      </head>
      <body>
        <span class="badge">${escapeHtml(guide.badge)}</span>
        <h1>SafeSteps ${escapeHtml(guide.title)}</h1>
        <p>${escapeHtml(guide.detail)}</p>
        ${sectionsHtml}
        <section class="checklist">
          <h2>Print / offline checklist</h2>
          <ul>${checklistHtml}</ul>
        </section>
        <p class="footer">SafeSteps resource guide. Use as support and engagement documentation, not as an automatic legal, clinical, safety, or reunification decision.</p>
      </body>
    </html>
  `;
}

export default function ProgramSupportScreen() {
  const { guide } = useLocalSearchParams<{ guide?: string }>();
  const initialGuideId = guides.some((item) => item.id === guide) ? guide : guides[0].id;
  const [openFaqs, setOpenFaqs] = useState<Record<string, boolean>>({
    "programs-work": true,
  });
  const [selectedGuideId, setSelectedGuideId] = useState(initialGuideId);
  const selectedGuide = guides.find((guide) => guide.id === selectedGuideId) ?? guides[0];

  const summary = useMemo(
    () =>
      sections
        .map((section) => `${section.title}\n${section.points.map((point) => `- ${point}`).join("\n")}`)
        .join("\n\n"),
    [],
  );

  const selectedGuideSummary = useMemo(
    () =>
      [
        `${selectedGuide.title}`,
        "",
        selectedGuide.detail,
        "",
        ...selectedGuide.sections.flatMap((section) => [
          section.title,
          section.body,
          ...section.bullets.map((bullet) => `- ${bullet}`),
          "",
        ]),
        "Checklist",
        ...selectedGuide.checklist.map((item) => `[ ] ${item}`),
      ].join("\n"),
    [selectedGuide],
  );

  useEffect(() => {
    if (guide && guides.some((item) => item.id === guide)) {
      setSelectedGuideId(guide);
    }
  }, [guide]);

  async function shareGuide() {
    await Share.share({
      title: "SafeSteps program support guide",
      message: `SafeSteps program support guide\n\n${summary}`,
    });
  }

  async function shareSelectedGuide() {
    await Share.share({
      title: `SafeSteps ${selectedGuide.title}`,
      message: `SafeSteps ${selectedGuide.title}\n\n${selectedGuideSummary}`,
    });
  }

  async function exportSelectedGuidePdf() {
    const result = await Print.printToFileAsync({
      base64: false,
      html: guideToHtml(selectedGuide),
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(result.uri, {
        dialogTitle: `Share SafeSteps ${selectedGuide.title}`,
        mimeType: "application/pdf",
        UTI: "com.adobe.pdf",
      });
      return;
    }

    await Share.share({
      title: `SafeSteps ${selectedGuide.title}`,
      message: `PDF created: ${result.uri}\n\n${selectedGuideSummary}`,
    });
  }

  function toggleFaq(id: string) {
    setOpenFaqs((current) => ({ ...current, [id]: !current[id] }));
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>‹ Back to resources</Text>
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.eyebrow}>Program Support</Text>
        <Text style={styles.title}>Navigate SafeSteps Programs</Text>
        <Text style={styles.intro}>
          Understand how structured learning progresses, where curriculum sits, and how activity, reflection, and
          evidence records can support growth reporting over time.
        </Text>
      </View>

      <View style={styles.tourPanel}>
        <View style={styles.videoThumb}>
          <Text style={styles.playIcon}>▶</Text>
          <Text style={styles.videoLabel}>Interactive tour</Text>
        </View>
        <View style={styles.tourCopy}>
          <Text style={styles.tourTitle}>Quick-start walkthrough</Text>
          <Text style={styles.tourText}>
            A guided overview for parents who want to know what to do first, where to find learning, and how progress is
            captured without reading a long manual.
          </Text>
        </View>
      </View>

      <View style={styles.stepGrid}>
        {walkthroughSteps.map((step, index) => (
          <View key={step.title} style={styles.stepCard}>
            <Text style={styles.stepNumber}>{index + 1}</Text>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepDetail}>{step.detail}</Text>
          </View>
        ))}
      </View>

      <View style={styles.downloadPanel}>
        <View style={styles.downloadHeader}>
          <Text style={styles.sectionTitle}>Downloadable Guides</Text>
          <Pressable onPress={shareGuide} style={styles.shareButton}>
            <Text style={styles.shareButtonText}>Share Guide</Text>
          </Pressable>
        </View>
        <View style={styles.guideGrid}>
          {guides.map((guide) => (
            <Pressable
              accessibilityRole="button"
              key={guide.title}
              onPress={() => setSelectedGuideId(guide.id)}
              style={[styles.guideCard, selectedGuideId === guide.id && styles.guideCardSelected]}
            >
              <Text style={styles.guideBadge}>{guide.badge}</Text>
              <Text style={styles.guideTitle}>{guide.title}</Text>
              <Text style={styles.guideDetail}>{guide.detail}</Text>
              <Text style={styles.guideAction}>{selectedGuideId === guide.id ? "Viewing guide" : "Open guide"}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.guideReader}>
        <View style={styles.guideReaderHeader}>
          <View style={styles.guideReaderTitleBlock}>
            <Text style={styles.guideBadge}>{selectedGuide.badge}</Text>
            <Text style={styles.guideReaderTitle}>{selectedGuide.title}</Text>
            <Text style={styles.guideReaderDetail}>{selectedGuide.detail}</Text>
          </View>
          <Pressable onPress={shareSelectedGuide} style={styles.shareButton}>
            <Text style={styles.shareButtonText}>Share This Guide</Text>
          </Pressable>
          <Pressable onPress={exportSelectedGuidePdf} style={styles.pdfButton}>
            <Text style={styles.pdfButtonText}>Download PDF Guide</Text>
          </Pressable>
        </View>

        {selectedGuide.sections.map((section) => (
          <View key={section.title} style={styles.guideSection}>
            <Text style={styles.guideSectionTitle}>{section.title}</Text>
            <Text style={styles.guideSectionBody}>{section.body}</Text>
            {section.bullets.map((bullet) => (
              <View key={bullet} style={styles.pointRow}>
                <Text style={styles.pointDot}>•</Text>
                <Text style={styles.pointText}>{bullet}</Text>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.checklistBox}>
          <Text style={styles.checklistTitle}>Print / offline checklist</Text>
          {selectedGuide.checklist.map((item) => (
            <View key={item} style={styles.checklistRow}>
              <Text style={styles.checkBox}>□</Text>
              <Text style={styles.checklistText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      {sections.map((section) => (
        <View key={section.title} style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.points.map((point) => (
            <View key={point} style={styles.pointRow}>
              <Text style={styles.pointDot}>•</Text>
              <Text style={styles.pointText}>{point}</Text>
            </View>
          ))}
        </View>
      ))}

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>FAQs</Text>
        {faqs.map((faq) => {
          const isOpen = Boolean(openFaqs[faq.id]);

          return (
            <View key={faq.id} style={styles.faqCard}>
              <Pressable onPress={() => toggleFaq(faq.id)} style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Text style={styles.faqChevron}>{isOpen ? "−" : "+"}</Text>
              </Pressable>
              {isOpen ? <Text style={styles.faqAnswer}>{faq.answer}</Text> : null}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#F7FAF8",
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 14,
    paddingVertical: 6,
  },
  backButtonText: {
    color: "#0D5C75",
    fontSize: 14,
    fontWeight: "800",
  },
  header: {
    marginBottom: 16,
    maxWidth: 940,
  },
  eyebrow: {
    color: "#0D5C75",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  title: {
    color: "#12332B",
    fontSize: 30,
    fontWeight: "900",
    marginBottom: 8,
  },
  intro: {
    color: "#43534D",
    fontSize: 15,
    lineHeight: 22,
  },
  tourPanel: {
    alignItems: "center",
    backgroundColor: "#EAF6F4",
    borderColor: "#B8DAD4",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 14,
    padding: 14,
  },
  videoThumb: {
    alignItems: "center",
    aspectRatio: 16 / 9,
    backgroundColor: "#12332B",
    borderRadius: 8,
    justifyContent: "center",
    minWidth: 220,
  },
  playIcon: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    marginBottom: 6,
  },
  videoLabel: {
    color: "#D8F3EC",
    fontSize: 13,
    fontWeight: "900",
  },
  tourCopy: {
    flex: 1,
    minWidth: 240,
  },
  tourTitle: {
    color: "#12332B",
    fontSize: 19,
    fontWeight: "900",
  },
  tourText: {
    color: "#43534D",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 5,
  },
  stepGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 14,
  },
  stepCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8E2",
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: 230,
    flexGrow: 1,
    padding: 14,
  },
  stepNumber: {
    color: "#0D5C75",
    fontSize: 22,
    fontWeight: "900",
  },
  stepTitle: {
    color: "#183C33",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 6,
  },
  stepDetail: {
    color: "#53635C",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  downloadPanel: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8E2",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
    padding: 16,
  },
  downloadHeader: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
    marginBottom: 12,
  },
  shareButton: {
    backgroundColor: "#0D5C75",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: 14,
  },
  shareButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  pdfButton: {
    backgroundColor: "#FFFFFF",
    borderColor: "#0D5C75",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: 14,
  },
  pdfButtonText: {
    color: "#0D5C75",
    fontWeight: "900",
  },
  guideGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  guideCard: {
    backgroundColor: "#F8FBF9",
    borderColor: "#D8E5DD",
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: 220,
    flexGrow: 1,
    padding: 12,
  },
  guideCardSelected: {
    backgroundColor: "#EAF6F4",
    borderColor: "#0D5C75",
  },
  guideBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EDF7F4",
    borderColor: "#C9E1D9",
    borderRadius: 999,
    borderWidth: 1,
    color: "#0D5C75",
    fontSize: 11,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  guideTitle: {
    color: "#183C33",
    fontSize: 15,
    fontWeight: "900",
    marginTop: 10,
  },
  guideDetail: {
    color: "#53635C",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  guideAction: {
    color: "#0D5C75",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 10,
  },
  guideReader: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8E2",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
    padding: 16,
  },
  guideReaderHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
    marginBottom: 14,
  },
  guideReaderTitleBlock: {
    flex: 1,
    minWidth: 240,
  },
  guideReaderTitle: {
    color: "#12332B",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 10,
  },
  guideReaderDetail: {
    color: "#53635C",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  guideSection: {
    backgroundColor: "#F8FBF9",
    borderColor: "#D8E5DD",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
    padding: 12,
  },
  guideSectionTitle: {
    color: "#183C33",
    fontSize: 17,
    fontWeight: "900",
  },
  guideSectionBody: {
    color: "#43534D",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
  },
  checklistBox: {
    backgroundColor: "#FFFDF7",
    borderColor: "#E7D7A8",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 4,
    padding: 12,
  },
  checklistTitle: {
    color: "#4B3B16",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 8,
  },
  checklistRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 8,
    marginTop: 7,
  },
  checkBox: {
    color: "#0D5C75",
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 20,
  },
  checklistText: {
    color: "#43534D",
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE8E2",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
    padding: 16,
  },
  sectionTitle: {
    color: "#183C33",
    fontSize: 20,
    fontWeight: "900",
  },
  pointRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  pointDot: {
    color: "#0D5C75",
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 20,
  },
  pointText: {
    color: "#43534D",
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
  },
  faqCard: {
    backgroundColor: "#F8FBF9",
    borderColor: "#D8E5DD",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 10,
    overflow: "hidden",
  },
  faqHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    padding: 12,
  },
  faqQuestion: {
    color: "#1E352E",
    flex: 1,
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 20,
  },
  faqChevron: {
    color: "#0D5C75",
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 24,
  },
  faqAnswer: {
    borderTopColor: "#D8E5DD",
    borderTopWidth: 1,
    color: "#53635C",
    fontSize: 14,
    lineHeight: 21,
    padding: 12,
  },
});
