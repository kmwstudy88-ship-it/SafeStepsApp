// courses1to4.js
// Production-ready DOCX generator for SafeSteps courses 1–4
// All course + lesson titles are used as-is (no "Course 1", "Lesson 1" prefixes).

const fs = require("fs");
const path = require("path");
const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
    PageBreak,
} = require("docx");

// ---------------------------
// CONFIG
// ---------------------------

const OUTPUT_FILENAME = "Courses1to4.docx";

// Brand / style config
const BRAND_COLOR = "2F5597"; // SafeSteps primary-ish
const COURSE_COLOR = "385723";
const LESSON_COLOR = "000000";
const BODY_FONT = "Calibri";
const TITLE_FONT = "Calibri";

// ---------------------------
// DATA MODEL (EDIT THIS ONLY)
// ---------------------------

// NOTE: Put your real course + lesson content here.
// Titles are used directly as names everywhere.

const courses = [
    {
        title: "Understanding Your Nervous System",
        description:
            "Learn what the nervous system is, how it works, and why it matters for safety, regulation, and daily life.",
        lessons: [
            {
                title: "What Is the Nervous System and Why Does It Matter?",
                content: [
                    "In this lesson, you’ll explore the basic structure and function of the nervous system.",
                    "You’ll connect this understanding to how you feel, react, and make choices in everyday situations.",
                ],
            },
            {
                title: "Survival States: Fight, Flight, Freeze, and Fawn",
                content: [
                    "This lesson explains the core survival responses and how they show up in behaviour.",
                    "You’ll begin to notice your own patterns without shame or blame.",
                ],
            },
            // ... add remaining Course 1 lessons
        ],
    },
    {
        title: "Building Safety in Your Body",
        description:
            "Focus on practical tools to help your body feel safer, calmer, and more grounded.",
        lessons: [
            {
                title: "Noticing Safety and Danger Signals",
                content: [
                    "Learn to track cues of safety and danger in your body, environment, and relationships.",
                ],
            },
            // ... Course 2 lessons
        ],
    },
    {
        title: "Regulation Skills for Everyday Life",
        description:
            "Learn and practice regulation strategies you can use in real time.",
        lessons: [
            {
                title: "Breath, Movement, and Grounding",
                content: [
                    "Explore simple, repeatable practices to bring your system back toward balance.",
                ],
            },
            // ... Course 3 lessons
        ],
    },
    {
        title: "Applying SafeSteps in Real Situations",
        description:
            "Integrate what you’ve learned into real-world scenarios and relationships.",
        lessons: [
            {
                title: "From Insight to Action",
                content: [
                    "Turn your understanding of the nervous system into concrete, repeatable actions.",
                ],
            },
            // ... Course 4 lessons
        ],
    },
];

// ---------------------------
// DOCX HELPERS
// ---------------------------

function heading(text, level = HeadingLevel.HEADING_1, color = BRAND_COLOR) {
    return new Paragraph({
        text,
        heading: level,
        alignment: AlignmentType.LEFT,
        children: [
            new TextRun({
                text,
                bold: true,
                color,
                font: TITLE_FONT,
            }),
        ],
    });
}

function body(text, opts = {}) {
    return new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: 200 },
        children: [
            new TextRun({
                text,
                font: BODY_FONT,
                size: 24,
                color: LESSON_COLOR,
                ...opts,
            }),
        ],
    });
}

function blankLine() {
    return new Paragraph({ text: "" });
}

function courseHeader(course) {
    return [
        heading(course.title, HeadingLevel.TITLE, COURSE_COLOR),
        blankLine(),
        body(course.description || ""),
        blankLine(),
    ];
}

function lessonBlock(lesson) {
    const blocks = [];

    // Lesson title (used as-is, no numbering)
    blocks.push(
        new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [
                new TextRun({
                    text: lesson.title,
                    bold: true,
                    color: BRAND_COLOR,
                    font: TITLE_FONT,
                    size: 28,
                }),
            ],
        })
    );

    // Lesson content paragraphs
    if (Array.isArray(lesson.content)) {
        for (const line of lesson.content) {
            blocks.push(body(line));
        }
    } else if (typeof lesson.content === "string") {
        blocks.push(body(lesson.content));
    }

    blocks.push(blankLine());
    return blocks;
}

// ---------------------------
// DOCUMENT BUILD
// ---------------------------

function buildDocument() {
    const children = [];

    // Cover
    children.push(
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
                new TextRun({
                    text: "SafeSteps – Courses 1 to 4",
                    bold: true,
                    size: 48,
                    font: TITLE_FONT,
                    color: BRAND_COLOR,
                }),
            ],
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun({
                    text: "Comprehensive Nervous System & Safety Curriculum",
                    size: 28,
                    font: BODY_FONT,
                }),
            ],
        }),
        new Paragraph({ children: [new PageBreak()] })
    );

    // Each course
    courses.forEach((course, courseIndex) => {
        if (courseIndex > 0) {
            // Page break between courses
            children.push(new Paragraph({ children: [new PageBreak()] }));
        }

        children.push(...courseHeader(course));

        if (Array.isArray(course.lessons)) {
            course.lessons.forEach((lesson) => {
                children.push(...lessonBlock(lesson));
            });
        }
    });

    return new Document({
        creator: "SafeSteps",
        title: "SafeSteps – Courses 1 to 4",
        description:
            "Comprehensive SafeSteps curriculum document for courses 1–4 with full lesson content.",
        sections: [
            {
                properties: {},
                children,
            },
        ],
    });
}

// ---------------------------
// MAIN
// ---------------------------

async function main() {
    try {
        const doc = buildDocument();
        const buffer = await Packer.toBuffer(doc);

        const outPath = path.join(process.cwd(), OUTPUT_FILENAME);
        fs.writeFileSync(outPath, buffer);

        console.log(`✅ DOCX generated: ${outPath}`);
    } catch (err) {
        console.error("❌ Failed to generate DOCX:", err);
        process.exitCode = 1;
    }
}

main();