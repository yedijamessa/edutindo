import { randomUUID } from "crypto";
import path from "path";
import dotenv from "dotenv";
import {
  DEFAULT_CURRICULUM_SCHOOL_SLUG,
  createCurriculumNode,
  listCurriculumTree,
  type CurriculumNode,
  updateCurriculumNode,
} from "@/lib/curriculum-portal";
import { englishBlueprintByYear, type EnglishBlueprintChapter, type EnglishBlueprintLesson, type EnglishBlueprintSourceRef } from "@/lib/curriculum/english-ielts-blueprint";
import { getModuleEditorDocument, saveModuleEditorDocument } from "@/lib/module-editor";
import type { ModuleEditorBlock, ModuleEditorDocument, ModuleEditorPage, ModuleEditorQuizBlock } from "@/types/module-editor";
import { grammarLessons } from "../../ielts-prep/app/lib/grammar-content";
import { collocationLessons } from "../../ielts-prep/app/lib/collocation-content";
import { phrasalVerbLessons } from "../../ielts-prep/app/lib/phrasal-verbs-content";
import { idiomLessons } from "../../ielts-prep/app/lib/idioms-content";
import { lessonContent } from "../../ielts-prep/app/lib/lesson-content";
import { topics } from "../../ielts-prep/app/lib/vocabulary-data";
import { WRITING_PROMPTS } from "../../ielts-prep/app/lib/writing-prompts";
import { DEFAULT_TESTS } from "../../ielts-prep/app/lib/mock-tests";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const ACTOR_USER_ID = "system-english-ielts-seed";
const ENGLISH_SUBJECT_TITLE = "English";
const ENGLISH_SUBJECT_SLUG = "english";
const overwriteDocs = process.argv.includes("--overwrite-docs");

type VocabularyTopicMeta = {
  topicTitle: string;
  levelTitle: string;
  description: string;
};

const vocabularyTopicByKey = new Map<string, VocabularyTopicMeta>();
for (const topic of topics) {
  for (const level of topic.levels) {
    vocabularyTopicByKey.set(level.contentKey, {
      topicTitle: topic.title,
      levelTitle: level.title,
      description: topic.description,
    });
  }
}

function slugify(value: string) {
  const base = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return base || "item";
}

function createTextBlock(title: string, body: string): ModuleEditorBlock {
  return {
    id: randomUUID(),
    type: "text",
    title,
    body,
  };
}

function createQuizBlock(
  input:
    | {
        prompt: string;
        options: string[];
        answer: string;
        explanation?: string;
      }
    | {
        prompt: string;
        answer: string;
        explanation?: string;
      }
): ModuleEditorQuizBlock {
  if ("options" in input) {
    const options = input.options.map((text) => ({ id: randomUUID(), text }));
    const matchedOption = options.find((option) => option.text === input.answer) ?? options[0];

    return {
      id: randomUUID(),
      type: "quiz",
      quizType: "multiple-choice-single",
      prompt: input.prompt,
      options,
      correctOptionIds: matchedOption ? [matchedOption.id] : [],
      acceptableAnswers: [],
      matchingPairs: [],
      orderingItems: [],
      explanation: input.explanation ?? "",
    };
  }

  return {
    id: randomUUID(),
    type: "quiz",
    quizType: "fill-in-the-blank",
    prompt: input.prompt,
    options: [],
    correctOptionIds: [],
    acceptableAnswers: [input.answer],
    matchingPairs: [],
    orderingItems: [],
    explanation: input.explanation ?? "",
  };
}

function createPage(title: string, description: string, blocks: ModuleEditorBlock[]): ModuleEditorPage {
  return {
    id: randomUUID(),
    title,
    description,
    blocks,
  };
}

function parseNumberRanges(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .flatMap((item) => {
      const match = item.match(/^(\d+)\s*-\s*(\d+)$/);
      if (match) {
        const start = Number(match[1]);
        const end = Number(match[2]);
        if (!Number.isFinite(start) || !Number.isFinite(end)) return [];
        const step = start <= end ? 1 : -1;
        const values: number[] = [];
        for (let current = start; step > 0 ? current <= end : current >= end; current += step) {
          values.push(current);
        }
        return values;
      }

      const single = Number(item);
      return Number.isFinite(single) ? [single] : [];
    });
}

function parseWritingIds(value: string) {
  const tokens = value.match(/([A-Z]{2}\d)\s+([\d,\-\s]+)/i);
  if (!tokens) return [];

  const prefix = tokens[1].toLowerCase();
  const ids = parseNumberRanges(tokens[2]).map((id) => `${prefix}-${String(id).padStart(3, "0")}`);
  return WRITING_PROMPTS.filter((prompt) => ids.includes(prompt.id.toLowerCase()));
}

function formatList(items: string[], limit = items.length) {
  return items
    .filter((item) => item.trim().length > 0)
    .slice(0, limit)
    .map((item) => `- ${item}`)
    .join("\n");
}

function buildSourceNote(ref: EnglishBlueprintSourceRef) {
  return `Source: ${ref.sourceType} / ${ref.ref}`;
}

function buildGrammarPages(ref: EnglishBlueprintSourceRef) {
  const lessons = parseNumberRanges(ref.ref)
    .map((id) => grammarLessons[id])
    .filter((lesson): lesson is NonNullable<(typeof grammarLessons)[number]> => Boolean(lesson));

  if (lessons.length === 0) {
    return [];
  }

  const topicList = lessons.map((lesson) => lesson.title);
  const keyPoints = Array.from(new Set(lessons.flatMap((lesson) => lesson.keyPoints))).slice(0, 8);
  const examples = lessons.flatMap((lesson) => lesson.examples).slice(0, 6);
  const mcqBlocks = lessons.flatMap((lesson) =>
    lesson.quiz.mcq.slice(0, 1).map((item) =>
      createQuizBlock({
        prompt: item.question,
        options: item.options,
        answer: item.answer,
        explanation: `Imported from ${lesson.title}.`,
      })
    )
  );
  const fillBlocks = lessons.flatMap((lesson) =>
    lesson.quiz.fill.slice(0, 1).map((item) =>
      createQuizBlock({
        prompt: item.prompt,
        answer: item.answer,
        explanation: `Imported from ${lesson.title}.`,
      })
    )
  );

  return [
    createPage(
      `Grammar Source ${ref.ref}`,
      "Adapted grammar content from ielts-prep.",
      [
        createTextBlock(
          "Covered Topics",
          [buildSourceNote(ref), "", formatList(topicList, 12), "", formatList(keyPoints, 8)].join("\n")
        ),
        createTextBlock("Examples", formatList(examples, 6)),
      ]
    ),
    createPage("Grammar Practice", "Imported quick checks based on the selected grammar lessons.", [
      ...mcqBlocks.slice(0, 4),
      ...fillBlocks.slice(0, 4),
    ]),
  ];
}

function buildVocabularyPages(ref: EnglishBlueprintSourceRef) {
  const words = lessonContent[ref.ref] ?? [];
  if (words.length === 0) {
    return [];
  }

  const meta = vocabularyTopicByKey.get(ref.ref);
  const wordBank = words
    .slice(0, 12)
    .map((word) => `- ${word.term} (${word.partOfSpeech}): ${word.definition}\n  Example: ${word.example}`)
    .join("\n");
  const practiceBlocks = words.slice(0, 5).map((word, _index, list) => {
    const distractors = list
      .filter((item) => item.id !== word.id)
      .slice(0, 3)
      .map((item) => item.term);
    const options = [word.term, ...distractors].slice(0, 4);

    return createQuizBlock({
      prompt: `Which word matches this definition? ${word.definition}`,
      options,
      answer: word.term,
      explanation: word.example,
    });
  });

  return [
    createPage(
      meta ? `${meta.topicTitle} ${meta.levelTitle}` : `Vocabulary Source ${ref.ref}`,
      "Word bank and usage notes adapted from ielts-prep.",
      [
        createTextBlock(
          "Vocabulary Bank",
          [buildSourceNote(ref), meta?.description ?? "", "", wordBank].filter(Boolean).join("\n")
        ),
      ]
    ),
    createPage("Vocabulary Practice", "Quick checks based on the imported word bank.", practiceBlocks),
  ];
}

function buildCollocationPages(ref: EnglishBlueprintSourceRef) {
  const lessons = parseNumberRanges(ref.ref)
    .map((id) => collocationLessons[id])
    .filter((lesson): lesson is NonNullable<(typeof collocationLessons)[number]> => Boolean(lesson));

  if (lessons.length === 0) {
    return [];
  }

  const collocations = lessons.flatMap((lesson) => lesson.collocations).slice(0, 12);
  const mcqBlocks = lessons.flatMap((lesson) =>
    lesson.quiz.mcq.slice(0, 1).map((item) =>
      createQuizBlock({
        prompt: item.question,
        options: item.options,
        answer: item.answer,
      })
    )
  );

  return [
    createPage(
      `Collocations ${ref.ref}`,
      "Natural phrase combinations adapted from ielts-prep.",
      [
        createTextBlock(
          "Phrase Bank",
          [
            buildSourceNote(ref),
            "",
            formatList(
              collocations.map((item) => `${item.phrase}: ${item.meaning}. Example: ${item.example}`),
              12
            ),
          ].join("\n")
        ),
      ]
    ),
    createPage(
      "Collocation Practice",
      "Use these prompts for recall, discussion, or notebook practice.",
      [
        ...mcqBlocks.slice(0, 4),
        ...lessons.slice(0, 2).flatMap((lesson) =>
          lesson.quiz.fill.slice(0, 1).map((item) =>
            createQuizBlock({
              prompt: item.prompt,
              answer: item.answer,
            })
          )
        ),
      ]
    ),
  ];
}

function buildPhrasalVerbPages(ref: EnglishBlueprintSourceRef) {
  const lessons = parseNumberRanges(ref.ref)
    .map((id) => phrasalVerbLessons[id])
    .filter((lesson): lesson is NonNullable<(typeof phrasalVerbLessons)[number]> => Boolean(lesson));

  if (lessons.length === 0) {
    return [];
  }

  const verbs = lessons.flatMap((lesson) => lesson.verbs).slice(0, 12);

  return [
    createPage(
      `Phrasal Verbs ${ref.ref}`,
      "Reusable phrase practice adapted from ielts-prep.",
      [
        createTextBlock(
          "Verb Bank",
          [
            buildSourceNote(ref),
            "",
            formatList(
              verbs.map((item) => `${item.verb}: ${item.meaning}. Example: ${item.example}`),
              12
            ),
          ].join("\n")
        ),
      ]
    ),
    createPage(
      "Phrasal Verb Practice",
      "Keep the answers hidden from students until review time.",
      [
        ...lessons.slice(0, 2).flatMap((lesson) =>
          lesson.quiz.mcq.slice(0, 1).map((item) =>
            createQuizBlock({
              prompt: item.question,
              options: item.options,
              answer: item.answer,
            })
          )
        ),
        ...lessons.slice(0, 2).flatMap((lesson) =>
          lesson.quiz.fill.slice(0, 1).map((item) =>
            createQuizBlock({
              prompt: item.prompt,
              answer: item.answer,
            })
          )
        ),
      ]
    ),
  ];
}

function buildIdiomPages(ref: EnglishBlueprintSourceRef) {
  const lessons = parseNumberRanges(ref.ref)
    .map((id) => idiomLessons[id])
    .filter((lesson): lesson is NonNullable<(typeof idiomLessons)[number]> => Boolean(lesson));

  if (lessons.length === 0) {
    return [];
  }

  const idioms = lessons.flatMap((lesson) => lesson.idioms).slice(0, 12);

  return [
    createPage(
      `Idioms ${ref.ref}`,
      "Figurative language adapted from ielts-prep.",
      [
        createTextBlock(
          "Idiom Bank",
          [
            buildSourceNote(ref),
            "",
            formatList(
              idioms.map((item) => `${item.idiom}: ${item.meaning}. Example: ${item.example}`),
              12
            ),
          ].join("\n")
        ),
      ]
    ),
    createPage(
      "Idiom Practice",
      "Use these prompts to connect meaning, tone, and context.",
      [
        ...lessons.slice(0, 2).flatMap((lesson) =>
          lesson.quiz.mcq.slice(0, 1).map((item) =>
            createQuizBlock({
              prompt: item.question,
              options: item.options,
              answer: item.answer,
            })
          )
        ),
        ...lessons.slice(0, 2).flatMap((lesson) =>
          lesson.quiz.fill.slice(0, 1).map((item) =>
            createQuizBlock({
              prompt: item.prompt,
              answer: item.answer,
            })
          )
        ),
      ]
    ),
  ];
}

function buildWritingPages(ref: EnglishBlueprintSourceRef) {
  const prompts = parseWritingIds(ref.ref);
  if (prompts.length === 0) {
    return [];
  }

  return [
    createPage(
      `Writing Tasks ${ref.ref}`,
      "Prompt bank imported from ielts-prep.",
      [
        createTextBlock(
          "Selected Prompts",
          [
            buildSourceNote(ref),
            "",
            ...prompts.slice(0, 8).map((prompt) => `${prompt.type}: ${prompt.title}\n${prompt.prompt}`),
          ].join("\n\n")
        ),
      ]
    ),
    createPage(
      "Writing Output",
      "Essay blocks are useful for guided notebook work, teacher marking, or oral planning.",
      prompts.slice(0, 4).map((prompt) => ({
        id: randomUUID(),
        type: "quiz",
        quizType: "essay",
        prompt: `${prompt.type}: ${prompt.title}\n\n${prompt.prompt}`,
        options: [],
        correctOptionIds: [],
        acceptableAnswers: [],
        matchingPairs: [],
        orderingItems: [],
        explanation: "Suggested check: task response, organization, vocabulary range, and grammar control.",
      }))
    ),
  ];
}

function buildMockTestPages(ref: EnglishBlueprintSourceRef) {
  const matches = DEFAULT_TESTS.filter((test) => test.module === ref.ref);
  if (matches.length === 0) {
    return [];
  }

  return matches.flatMap((test) => {
    if (test.module === "reading") {
      return [
        createPage(
          `Mock Test: ${test.title}`,
          "Reading mock adapted from ielts-prep.",
          [
            createTextBlock(
              "Reading Passage",
              [buildSourceNote(ref), "", String(test.content.passage ?? "")].join("\n")
            ),
          ]
        ),
        createPage(
          "Reading Questions",
          "Use this as a timed checkpoint lesson.",
          Array.isArray(test.content.questions)
            ? test.content.questions.slice(0, 3).map((question) =>
                createQuizBlock({
                  prompt: question.text,
                  options: question.options,
                  answer: question.options[question.correct] ?? question.options[0] ?? "",
                })
              )
            : [createTextBlock("Mock Test", "No question set was found for this reading mock.")]
        ),
      ];
    }

    if (test.module === "writing") {
      return [
        createPage(
          `Mock Test: ${test.title}`,
          "Writing mock adapted from ielts-prep.",
          [
            createTextBlock(
              "Writing Brief",
              [
                buildSourceNote(ref),
                "",
                `Task Type: ${String(test.content.taskType ?? "Writing Task")}`,
                "",
                String(test.content.prompt ?? ""),
              ].join("\n")
            ),
          ]
        ),
      ];
    }

    return [
      createPage(
        `Mock Test: ${test.title}`,
        "Speaking mock adapted from ielts-prep.",
        [
          createTextBlock(
            "Speaking Flow",
            [
              buildSourceNote(ref),
              "",
              "Part 1",
              formatList(Array.isArray(test.content.part1) ? test.content.part1 : []),
              "",
              "Part 2",
              `Cue card: ${String(test.content.part2?.cue ?? "")}`,
              formatList(Array.isArray(test.content.part2?.points) ? test.content.part2.points : []),
              "",
              "Part 3",
              formatList(Array.isArray(test.content.part3) ? test.content.part3 : []),
            ].join("\n")
          ),
        ]
      ),
    ];
  });
}

function buildGuidancePages(ref: EnglishBlueprintSourceRef) {
  const titleByType: Record<EnglishBlueprintSourceRef["sourceType"], string> = {
    grammar: "Grammar Guidance",
    vocabulary: "Vocabulary Guidance",
    collocation: "Collocation Guidance",
    phrasal: "Phrasal Verb Guidance",
    idioms: "Idiom Guidance",
    reading: "Reading Guidance",
    writing: "Writing Guidance",
    speaking: "Speaking Guidance",
    listening: "Listening Guidance",
    "mock-test": "Mock Test Guidance",
    review: "Review Guidance",
  };

  const bodyByType: Partial<Record<EnglishBlueprintSourceRef["sourceType"], string>> = {
    reading:
      "Use the linked IELTS reading material as a guided lab. Focus on skimming, scanning, noticing task instructions, and checking answers with evidence from the text.",
    speaking:
      "Use the speaking sets from ielts-prep as oral practice. Run them as pair work, timed monologues, or teacher-led interviews before reflection.",
    listening:
      "Use the strategy page and external resources from ielts-prep as a listening lab. Keep this lesson practical: prediction, distractors, note-taking, spelling, and review.",
    review:
      "Use this lesson as a cumulative check. Pull short tasks from the earlier lessons in the chapter and finish with one written or spoken output.",
  };

  return [
    createPage(
      titleByType[ref.sourceType],
      "A source note was saved even when the original material is not structured as an exported data file yet.",
      [
        createTextBlock(
          "Teaching Note",
          [
            buildSourceNote(ref),
            "",
            bodyByType[ref.sourceType] ?? "Use the linked source material as the basis for this lesson.",
            "",
            "Recommended classroom flow:",
            "- Open with a 5-minute recap.",
            "- Model one worked example from the source material.",
            "- Give learners one guided practice task.",
            "- Close with one exit question or short reflection.",
          ].join("\n")
        ),
      ]
    ),
  ];
}

function buildPagesForSourceRef(ref: EnglishBlueprintSourceRef) {
  switch (ref.sourceType) {
    case "grammar":
      return buildGrammarPages(ref);
    case "vocabulary":
      return buildVocabularyPages(ref);
    case "collocation":
      return buildCollocationPages(ref);
    case "phrasal":
      return buildPhrasalVerbPages(ref);
    case "idioms":
      return buildIdiomPages(ref);
    case "writing":
      return buildWritingPages(ref);
    case "mock-test":
      return buildMockTestPages(ref);
    case "reading":
    case "speaking":
    case "listening":
    case "review":
      return buildGuidancePages(ref);
    default:
      return [];
  }
}

function buildOverviewPage(chapter: EnglishBlueprintChapter, lesson: EnglishBlueprintLesson) {
  return createPage(
    "Lesson Overview",
    "Auto-generated from the English IELTS blueprint.",
    [
      createTextBlock(
        lesson.title,
        [
          `Lesson code: ${lesson.lessonCode}`,
          `Chapter: ${chapter.shortTitle}`,
          `Unit: ${chapter.unitTitle}`,
          `Week range: ${chapter.weekRange}`,
          "",
          "Learning outcomes:",
          formatList(chapter.learningOutcomes, 6),
          "",
          "Imported source refs:",
          formatList(lesson.sourceRefs.map((ref) => `${ref.sourceType} / ${ref.ref}`)),
        ].join("\n")
      ),
    ]
  );
}

function buildLessonDocument(chapter: EnglishBlueprintChapter, lesson: EnglishBlueprintLesson): ModuleEditorDocument {
  const pages = [
    buildOverviewPage(chapter, lesson),
    ...lesson.sourceRefs.flatMap((ref) => buildPagesForSourceRef(ref)),
  ];

  return {
    nodeId: "",
    nodeType: "lesson",
    title: lesson.title,
    pages: pages.length > 0 ? pages : [buildOverviewPage(chapter, lesson)],
    updatedAt: null,
  };
}

function collectChildren(parent: CurriculumNode, nodeType: CurriculumNode["nodeType"]) {
  return parent.children.filter((child) => child.nodeType === nodeType);
}

function findTopLevelNode(tree: CurriculumNode[], nodeType: CurriculumNode["nodeType"], slug: string) {
  return tree.find((node) => node.nodeType === nodeType && node.slug === slug) ?? null;
}

function getChapterCandidateSlugs(chapter: EnglishBlueprintChapter) {
  return Array.from(new Set([chapter.slug, slugify(chapter.shortTitle)]));
}

function findChapterNode(subjectTree: CurriculumNode, chapter: EnglishBlueprintChapter) {
  const candidateSlugs = new Set(getChapterCandidateSlugs(chapter));
  return collectChildren(subjectTree, "chapter").find((item) => candidateSlugs.has(item.slug)) ?? null;
}

function getChapterMetadata(chapter: EnglishBlueprintChapter) {
  return {
    weekRange: chapter.weekRange,
    unitTitle: chapter.unitTitle,
    learningOutcomes: chapter.learningOutcomes,
    assignmentTags: [{ schoolSlug: DEFAULT_CURRICULUM_SCHOOL_SLUG, yearSlug: chapter.yearSlug }],
  };
}

function getLessonWeek(weekRange: string, index: number) {
  const match = weekRange.match(/(\d+)/);
  if (!match) {
    return `Lesson ${index + 1}`;
  }

  return `Week ${Number(match[1]) + index}`;
}

function getLessonMetadata(chapter: EnglishBlueprintChapter, lesson: EnglishBlueprintLesson, index: number) {
  return {
    week: getLessonWeek(chapter.weekRange, index),
    lessonCode: lesson.lessonCode,
    assignmentTags: [{ schoolSlug: DEFAULT_CURRICULUM_SCHOOL_SLUG, yearSlug: chapter.yearSlug }],
  };
}

async function ensureEnglishSubject() {
  const tree = await listCurriculumTree();
  const existing = findTopLevelNode(tree, "subject", ENGLISH_SUBJECT_SLUG);

  if (existing) {
    return updateCurriculumNode({
      nodeId: existing.id,
      title: ENGLISH_SUBJECT_TITLE,
      metadata: {
        description: "English curriculum seeded from the reusable ielts-prep lesson bank.",
      },
      actorUserId: ACTOR_USER_ID,
    });
  }

  return createCurriculumNode({
    nodeType: "subject",
    title: ENGLISH_SUBJECT_TITLE,
    metadata: {
      description: "English curriculum seeded from the reusable ielts-prep lesson bank.",
    },
    actorUserId: ACTOR_USER_ID,
  });
}

async function ensureChapter(subjectId: string, subjectTree: CurriculumNode, chapter: EnglishBlueprintChapter) {
  const existing = findChapterNode(subjectTree, chapter);

  if (existing) {
    return updateCurriculumNode({
      nodeId: existing.id,
      title: chapter.shortTitle,
      metadata: getChapterMetadata(chapter),
      actorUserId: ACTOR_USER_ID,
    });
  }

  return createCurriculumNode({
    nodeType: "chapter",
    parentId: subjectId,
    title: chapter.shortTitle,
    metadata: getChapterMetadata(chapter),
    actorUserId: ACTOR_USER_ID,
  });
}

async function ensureLesson(chapterId: string, chapterTree: CurriculumNode, chapter: EnglishBlueprintChapter, lesson: EnglishBlueprintLesson, index: number) {
  const lessonSlug = slugify(lesson.title);
  const existing = collectChildren(chapterTree, "lesson").find((item) => item.slug === lessonSlug) ?? null;

  if (existing) {
    return updateCurriculumNode({
      nodeId: existing.id,
      title: lesson.title,
      metadata: getLessonMetadata(chapter, lesson, index),
      actorUserId: ACTOR_USER_ID,
    });
  }

  return createCurriculumNode({
    nodeType: "lesson",
    parentId: chapterId,
    title: lesson.title,
    metadata: getLessonMetadata(chapter, lesson, index),
    actorUserId: ACTOR_USER_ID,
  });
}

async function seedTree() {
  const subject = await ensureEnglishSubject();

  for (const yearSlug of Object.keys(englishBlueprintByYear) as Array<keyof typeof englishBlueprintByYear>) {
    for (const chapter of englishBlueprintByYear[yearSlug]) {
      const tree = await listCurriculumTree();
      const subjectTree = findTopLevelNode(tree, "subject", subject.slug);
      if (!subjectTree) {
        throw new Error("English subject could not be reloaded from the curriculum tree.");
      }

      const chapterNode = await ensureChapter(subject.id, subjectTree, chapter);
      const refreshedTree = await listCurriculumTree();
      const refreshedSubjectTree = findTopLevelNode(refreshedTree, "subject", subject.slug);
      const chapterTree = refreshedSubjectTree ? findChapterNode(refreshedSubjectTree, chapter) : null;

      if (!chapterTree) {
        throw new Error(`Chapter ${chapter.shortTitle} could not be reloaded.`);
      }

      for (const [lessonIndex, lesson] of chapter.lessons.entries()) {
        await ensureLesson(chapterNode.id, chapterTree, chapter, lesson, lessonIndex);
      }
    }
  }
}

async function seedLessonDocuments() {
  const tree = await listCurriculumTree();
  const subjectTree = findTopLevelNode(tree, "subject", ENGLISH_SUBJECT_SLUG);

  if (!subjectTree) {
    throw new Error("English subject was not found after seeding.");
  }

  for (const chapters of Object.values(englishBlueprintByYear)) {
    for (const chapter of chapters) {
      const chapterTree = findChapterNode(subjectTree, chapter);
      if (!chapterTree) continue;

      for (const lesson of chapter.lessons) {
        const lessonTree =
          chapterTree.children.find((item) => item.nodeType === "lesson" && item.slug === slugify(lesson.title)) ??
          null;
        if (!lessonTree) continue;

        const existingDocument = await getModuleEditorDocument(lessonTree.id);
        if (existingDocument && !overwriteDocs) {
          continue;
        }

        const document = buildLessonDocument(chapter, lesson);
        await saveModuleEditorDocument({
          nodeId: lessonTree.id,
          title: document.title,
          pages: document.pages,
          actorUserId: ACTOR_USER_ID,
        });
      }
    }
  }
}

async function main() {
  console.log("Seeding English curriculum from ielts-prep...");
  console.log(overwriteDocs ? "Existing lesson documents will be overwritten." : "Existing lesson documents will be preserved.");

  await seedTree();
  await seedLessonDocuments();

  console.log("English curriculum seeding finished.");
  console.log("Next step: review the generated modules in /admin/module-editor and adjust any lesson-specific polish.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Failed to seed English curriculum from ielts-prep.");
    console.error(error);
    process.exit(1);
  });
