export interface EnglishBlueprintSourceRef {
  sourceType:
    | "grammar"
    | "vocabulary"
    | "collocation"
    | "phrasal"
    | "idioms"
    | "reading"
    | "writing"
    | "speaking"
    | "listening"
    | "mock-test"
    | "review";
  ref: string;
}

export interface EnglishBlueprintLesson {
  lessonCode: string;
  title: string;
  sourceRefs: EnglishBlueprintSourceRef[];
}

export interface EnglishBlueprintChapter {
  yearSlug: "year-7" | "year-8" | "year-9";
  slug: string;
  shortTitle: string;
  unitTitle: string;
  weekRange: string;
  learningOutcomes: string[];
  lessons: EnglishBlueprintLesson[];
}

export const englishIeltsBlueprint: EnglishBlueprintChapter[] = [
  {
    yearSlug: "year-7",
    slug: "grammar-foundations-a",
    shortTitle: "Grammar Foundations A",
    unitTitle: "Core tenses, question forms, and first grammar review cycle.",
    weekRange: "Weeks 1-6",
    learningOutcomes: [
      "Build confidence with present, past, and future structures.",
      "Use simple question forms correctly.",
      "Recognize tense meaning in short texts.",
    ],
    lessons: [
      {
        lessonCode: "ENG7-GA-01",
        title: "Present simple and present continuous",
        sourceRefs: [{ sourceType: "grammar", ref: "1-4" }],
      },
      {
        lessonCode: "ENG7-GA-02",
        title: "Past simple and past continuous",
        sourceRefs: [{ sourceType: "grammar", ref: "5-6" }],
      },
      {
        lessonCode: "ENG7-GA-03",
        title: "Present perfect essentials",
        sourceRefs: [{ sourceType: "grammar", ref: "7-14" }],
      },
      {
        lessonCode: "ENG7-GA-04",
        title: "Future plans and predictions",
        sourceRefs: [{ sourceType: "grammar", ref: "19-25" }],
      },
      {
        lessonCode: "ENG7-GA-05",
        title: "Questions and short answers",
        sourceRefs: [{ sourceType: "grammar", ref: "49-52" }],
      },
      {
        lessonCode: "ENG7-GA-06",
        title: "Review and mastery check",
        sourceRefs: [{ sourceType: "review", ref: "grammar 1-14, 19-25, 49-52" }],
      },
    ],
  },
  {
    yearSlug: "year-7",
    slug: "grammar-foundations-b",
    shortTitle: "Grammar Foundations B",
    unitTitle: "Modals, articles, sentence order, and core connectors.",
    weekRange: "Weeks 7-11",
    learningOutcomes: [
      "Use modals for ability, advice, and obligation.",
      "Build clearer noun phrases and sentence patterns.",
      "Improve basic word order and connector use.",
    ],
    lessons: [
      {
        lessonCode: "ENG7-GB-01",
        title: "Modals for daily communication",
        sourceRefs: [{ sourceType: "grammar", ref: "26-37" }],
      },
      {
        lessonCode: "ENG7-GB-02",
        title: "Countable nouns, articles, and quantity",
        sourceRefs: [{ sourceType: "grammar", ref: "69-81, 87-91" }],
      },
      {
        lessonCode: "ENG7-GB-03",
        title: "Pronouns and determiners",
        sourceRefs: [{ sourceType: "grammar", ref: "82-86" }],
      },
      {
        lessonCode: "ENG7-GB-04",
        title: "Adjectives, adverbs, and word order",
        sourceRefs: [{ sourceType: "grammar", ref: "98-112" }],
      },
      {
        lessonCode: "ENG7-GB-05",
        title: "Basic conjunctions and prepositions",
        sourceRefs: [{ sourceType: "grammar", ref: "113-136" }],
      },
    ],
  },
  {
    yearSlug: "year-7",
    slug: "vocabulary-for-everyday-life",
    shortTitle: "Vocabulary for Everyday Life",
    unitTitle: "Daily vocabulary for home, school, travel, and routine speaking.",
    weekRange: "Weeks 12-16",
    learningOutcomes: [
      "Use common word sets for family, routines, school, and travel.",
      "Understand example sentences and word use in context.",
      "Build a beginner speaking vocabulary bank.",
    ],
    lessons: [
      {
        lessonCode: "ENG7-VO-01",
        title: "Family and relationships",
        sourceRefs: [{ sourceType: "vocabulary", ref: "family-beginner" }],
      },
      {
        lessonCode: "ENG7-VO-02",
        title: "Daily routines",
        sourceRefs: [{ sourceType: "vocabulary", ref: "daily-beginner" }],
      },
      {
        lessonCode: "ENG7-VO-03",
        title: "Food and home",
        sourceRefs: [
          { sourceType: "vocabulary", ref: "food-beginner" },
          { sourceType: "vocabulary", ref: "home-beginner" },
        ],
      },
      {
        lessonCode: "ENG7-VO-04",
        title: "Travel and education",
        sourceRefs: [
          { sourceType: "vocabulary", ref: "travel-basic-beginner" },
          { sourceType: "vocabulary", ref: "education-beginner" },
        ],
      },
      {
        lessonCode: "ENG7-VO-05",
        title: "Work, media, and technology",
        sourceRefs: [
          { sourceType: "vocabulary", ref: "work-beginner" },
          { sourceType: "vocabulary", ref: "media-beginner" },
          { sourceType: "vocabulary", ref: "tech-beginner" },
        ],
      },
    ],
  },
  {
    yearSlug: "year-7",
    slug: "natural-english-phrases",
    shortTitle: "Natural English Phrases",
    unitTitle: "Introductory collocations, phrasal verbs, and idioms.",
    weekRange: "Weeks 17-20",
    learningOutcomes: [
      "Recognize natural word combinations.",
      "Use basic phrasal verbs and idioms in speech.",
      "Distinguish literal meaning from figurative meaning.",
    ],
    lessons: [
      {
        lessonCode: "ENG7-PH-01",
        title: "Collocations basics",
        sourceRefs: [{ sourceType: "collocation", ref: "1-6" }],
      },
      {
        lessonCode: "ENG7-PH-02",
        title: "Phrasal verbs basics",
        sourceRefs: [{ sourceType: "phrasal", ref: "1-5" }],
      },
      {
        lessonCode: "ENG7-PH-03",
        title: "Idioms for school and feelings",
        sourceRefs: [{ sourceType: "idioms", ref: "1-7" }],
      },
      {
        lessonCode: "ENG7-PH-04",
        title: "Agreement, opinion, and response language",
        sourceRefs: [
          { sourceType: "collocation", ref: "55-60" },
          { sourceType: "idioms", ref: "11-12" },
        ],
      },
    ],
  },
  {
    yearSlug: "year-7",
    slug: "reading-and-speaking-basics",
    shortTitle: "Reading and Speaking Basics",
    unitTitle: "First exposure to longer reading tasks and guided speaking practice.",
    weekRange: "Weeks 21-24",
    learningOutcomes: [
      "Read longer passages without panicking.",
      "Practice simple speaking responses on familiar topics.",
      "Notice question instructions and answer types.",
    ],
    lessons: [
      {
        lessonCode: "ENG7-RS-01",
        title: "Reading strategies: skimming and paragraph focus",
        sourceRefs: [{ sourceType: "reading", ref: "practice set 1, passage 1" }],
      },
      {
        lessonCode: "ENG7-RS-02",
        title: "Reading strategies: summary and short-answer work",
        sourceRefs: [{ sourceType: "reading", ref: "practice set 1, passage 2" }],
      },
      {
        lessonCode: "ENG7-RS-03",
        title: "Speaking basics on daily life",
        sourceRefs: [{ sourceType: "speaking", ref: "general sets 1-3" }],
      },
      {
        lessonCode: "ENG7-RS-04",
        title: "Speaking basics on family and routine",
        sourceRefs: [{ sourceType: "speaking", ref: "general sets 4-6" }],
      },
    ],
  },
  {
    yearSlug: "year-7",
    slug: "guided-writing",
    shortTitle: "Guided Writing",
    unitTitle: "Short messages, first formal writing, and opinion paragraphs.",
    weekRange: "Weeks 25-28",
    learningOutcomes: [
      "Turn grammar and vocabulary into short written output.",
      "Write clear paragraphs with simple structure.",
      "Prepare for more formal writing in Year 8.",
    ],
    lessons: [
      {
        lessonCode: "ENG7-WR-01",
        title: "Short personal writing and messages",
        sourceRefs: [{ sourceType: "writing", ref: "GT1 003" }],
      },
      {
        lessonCode: "ENG7-WR-02",
        title: "Formal apology and request writing",
        sourceRefs: [{ sourceType: "writing", ref: "GT1 002, GT1 005" }],
      },
      {
        lessonCode: "ENG7-WR-03",
        title: "First opinion paragraphs",
        sourceRefs: [{ sourceType: "writing", ref: "GT2 004, GT2 005" }],
      },
      {
        lessonCode: "ENG7-WR-04",
        title: "Year-end writing portfolio",
        sourceRefs: [{ sourceType: "review", ref: "reuse Year 7 Chapters 1-5" }],
      },
    ],
  },
  {
    yearSlug: "year-8",
    slug: "grammar-for-clear-ideas",
    shortTitle: "Grammar for Clear Ideas",
    unitTitle: "Complex structures for stronger explanation and comparison.",
    weekRange: "Weeks 1-6",
    learningOutcomes: [
      "Use more complex sentence structures in speech and writing.",
      "Improve accuracy with clause-based grammar.",
      "Support explanation and comparison more clearly.",
    ],
    lessons: [
      {
        lessonCode: "ENG8-GR-01",
        title: "Passive and reported speech",
        sourceRefs: [{ sourceType: "grammar", ref: "42-48" }],
      },
      {
        lessonCode: "ENG8-GR-02",
        title: "Verb patterns with -ing and to",
        sourceRefs: [{ sourceType: "grammar", ref: "53-68" }],
      },
      {
        lessonCode: "ENG8-GR-03",
        title: "Relative clauses and extra information",
        sourceRefs: [{ sourceType: "grammar", ref: "92-97" }],
      },
      {
        lessonCode: "ENG8-GR-04",
        title: "Comparing, qualifying, and emphasizing",
        sourceRefs: [{ sourceType: "grammar", ref: "102-112" }],
      },
      {
        lessonCode: "ENG8-GR-05",
        title: "Linkers and logic in sentences",
        sourceRefs: [{ sourceType: "grammar", ref: "113-120" }],
      },
    ],
  },
  {
    yearSlug: "year-8",
    slug: "intermediate-vocabulary-for-study-and-society",
    shortTitle: "Intermediate Vocabulary",
    unitTitle: "Topic vocabulary for study, society, media, and public issues.",
    weekRange: "Weeks 7-12",
    learningOutcomes: [
      "Talk about school, society, technology, and public issues.",
      "Extend vocabulary from everyday English into academic English.",
      "Build better speaking and writing content.",
    ],
    lessons: [
      {
        lessonCode: "ENG8-VO-01",
        title: "Education and work",
        sourceRefs: [
          { sourceType: "vocabulary", ref: "education-intermediate" },
          { sourceType: "vocabulary", ref: "work-intermediate" },
        ],
      },
      {
        lessonCode: "ENG8-VO-02",
        title: "Technology and environment",
        sourceRefs: [
          { sourceType: "vocabulary", ref: "tech-intermediate" },
          { sourceType: "vocabulary", ref: "environment-intermediate" },
        ],
      },
      {
        lessonCode: "ENG8-VO-03",
        title: "Media and politics",
        sourceRefs: [
          { sourceType: "vocabulary", ref: "media-intermediate" },
          { sourceType: "vocabulary", ref: "politics-intermediate" },
        ],
      },
      {
        lessonCode: "ENG8-VO-04",
        title: "Arts and psychology",
        sourceRefs: [
          { sourceType: "vocabulary", ref: "arts-intermediate" },
          { sourceType: "vocabulary", ref: "psychology-intermediate" },
        ],
      },
      {
        lessonCode: "ENG8-VO-05",
        title: "Global issues and abstract ideas",
        sourceRefs: [
          { sourceType: "vocabulary", ref: "global-issues-intermediate" },
          { sourceType: "vocabulary", ref: "abstract-intermediate" },
        ],
      },
      {
        lessonCode: "ENG8-VO-06",
        title: "Community, travel, and home",
        sourceRefs: [
          { sourceType: "vocabulary", ref: "travel-basic-intermediate" },
          { sourceType: "vocabulary", ref: "home-intermediate" },
        ],
      },
    ],
  },
  {
    yearSlug: "year-8",
    slug: "collocations-for-academic-english",
    shortTitle: "Collocations for Academic English",
    unitTitle: "Natural word partnerships for speaking, study, and writing tasks.",
    weekRange: "Weeks 13-17",
    learningOutcomes: [
      "Use stronger word partnerships in presentations and writing.",
      "Sound more natural in academic English.",
      "Improve register control.",
    ],
    lessons: [
      {
        lessonCode: "ENG8-CO-01",
        title: "Learning how collocations work",
        sourceRefs: [{ sourceType: "collocation", ref: "1-5" }],
      },
      {
        lessonCode: "ENG8-CO-02",
        title: "Study, learning, and presentations",
        sourceRefs: [{ sourceType: "collocation", ref: "27-29" }],
      },
      {
        lessonCode: "ENG8-CO-03",
        title: "Work, business, and academic writing",
        sourceRefs: [{ sourceType: "collocation", ref: "30-33" }],
      },
      {
        lessonCode: "ENG8-CO-04",
        title: "Society, news, money, and global problems",
        sourceRefs: [{ sourceType: "collocation", ref: "34-39" }],
      },
      {
        lessonCode: "ENG8-CO-05",
        title: "Agreeing, deciding, and cause/effect",
        sourceRefs: [{ sourceType: "collocation", ref: "51-60" }],
      },
    ],
  },
  {
    yearSlug: "year-8",
    slug: "phrasal-verbs-and-idioms-for-fluency",
    shortTitle: "Phrasal Verbs and Idioms",
    unitTitle: "Flexible discussion language for study, communication, and response.",
    weekRange: "Weeks 18-22",
    learningOutcomes: [
      "Speak more flexibly in discussion and problem-solving.",
      "Use common phrasal verbs related to study and communication.",
      "Recognize figurative expressions without overusing them in formal writing.",
    ],
    lessons: [
      {
        lessonCode: "ENG8-PI-01",
        title: "Classroom and study phrasal verbs",
        sourceRefs: [{ sourceType: "phrasal", ref: "42-44" }],
      },
      {
        lessonCode: "ENG8-PI-02",
        title: "Work, business, and telephoning phrasal verbs",
        sourceRefs: [{ sourceType: "phrasal", ref: "45-50" }],
      },
      {
        lessonCode: "ENG8-PI-03",
        title: "Communication and problem-solving phrasal verbs",
        sourceRefs: [{ sourceType: "phrasal", ref: "31, 35-41" }],
      },
      {
        lessonCode: "ENG8-PI-04",
        title: "Idioms for discussion and response",
        sourceRefs: [{ sourceType: "idioms", ref: "11-18" }],
      },
      {
        lessonCode: "ENG8-PI-05",
        title: "Idioms for time, memory, and communication",
        sourceRefs: [{ sourceType: "idioms", ref: "27-32" }],
      },
    ],
  },
  {
    yearSlug: "year-8",
    slug: "reading-skills-lab",
    shortTitle: "Reading Skills Lab",
    unitTitle: "Longer reading practice with strategy and timing.",
    weekRange: "Weeks 23-26",
    learningOutcomes: [
      "Handle longer texts and mixed question types.",
      "Use timed reading strategies.",
      "Learn how summary completion and short answers work.",
    ],
    lessons: [
      {
        lessonCode: "ENG8-RD-01",
        title: "Paragraph matching and multiple choice",
        sourceRefs: [{ sourceType: "reading", ref: "practice set 1, passage 1" }],
      },
      {
        lessonCode: "ENG8-RD-02",
        title: "Summary completion and short answers",
        sourceRefs: [{ sourceType: "reading", ref: "practice set 1, passage 2" }],
      },
      {
        lessonCode: "ENG8-RD-03",
        title: "Writer viewpoint and argument reading",
        sourceRefs: [{ sourceType: "reading", ref: "practice set 1, passage 3" }],
      },
      {
        lessonCode: "ENG8-RD-04",
        title: "Timed reading mini mock",
        sourceRefs: [{ sourceType: "mock-test", ref: "reading" }],
      },
    ],
  },
  {
    yearSlug: "year-8",
    slug: "writing-foundations",
    shortTitle: "Writing Foundations",
    unitTitle: "General and academic task structures with feedback loops.",
    weekRange: "Weeks 27-31",
    learningOutcomes: [
      "Learn the major IELTS-style writing task shapes.",
      "Practice both general and academic writing formats.",
      "Build drafting and revision discipline.",
    ],
    lessons: [
      {
        lessonCode: "ENG8-WR-01",
        title: "General Task 1 letters",
        sourceRefs: [{ sourceType: "writing", ref: "GT1 001-005" }],
      },
      {
        lessonCode: "ENG8-WR-02",
        title: "Academic Task 1 charts and graphs",
        sourceRefs: [{ sourceType: "writing", ref: "AT1 001-003" }],
      },
      {
        lessonCode: "ENG8-WR-03",
        title: "Academic Task 1 processes and maps",
        sourceRefs: [{ sourceType: "writing", ref: "AT1 004-005" }],
      },
      {
        lessonCode: "ENG8-WR-04",
        title: "Academic Task 2 opinion and discussion essays",
        sourceRefs: [{ sourceType: "writing", ref: "AT2 001-008" }],
      },
      {
        lessonCode: "ENG8-WR-05",
        title: "Feedback and redrafting cycle",
        sourceRefs: [{ sourceType: "writing", ref: "page evaluator" }],
      },
    ],
  },
  {
    yearSlug: "year-8",
    slug: "speaking-foundations",
    shortTitle: "Speaking Foundations",
    unitTitle: "Part 1, Part 2, and Part 3 style speaking practice.",
    weekRange: "Weeks 32-35",
    learningOutcomes: [
      "Develop speaking confidence for Part 1, Part 2, and Part 3 style prompts.",
      "Expand answers with reasons and examples.",
      "Get used to recording and review.",
    ],
    lessons: [
      {
        lessonCode: "ENG8-SP-01",
        title: "Part 1 fluency on study and daily life",
        sourceRefs: [{ sourceType: "speaking", ref: "academic sets 1-4" }],
      },
      {
        lessonCode: "ENG8-SP-02",
        title: "Part 2 cue-card building",
        sourceRefs: [{ sourceType: "speaking", ref: "academic sets 1-4" }],
      },
      {
        lessonCode: "ENG8-SP-03",
        title: "Part 3 extended discussion",
        sourceRefs: [{ sourceType: "speaking", ref: "academic sets 5-8" }],
      },
      {
        lessonCode: "ENG8-SP-04",
        title: "Recorded speaking review",
        sourceRefs: [{ sourceType: "speaking", ref: "page evaluator" }],
      },
    ],
  },
  {
    yearSlug: "year-9",
    slug: "advanced-grammar-for-accuracy",
    shortTitle: "Advanced Grammar for Accuracy",
    unitTitle: "Exam-focused grammar review and editing discipline.",
    weekRange: "Weeks 1-5",
    learningOutcomes: [
      "Write and speak with fewer high-frequency grammar errors.",
      "Control academic tone more consistently.",
      "Edit output using grammar patterns intentionally.",
    ],
    lessons: [
      {
        lessonCode: "ENG9-GR-01",
        title: "Tense review for narrative and explanation",
        sourceRefs: [{ sourceType: "grammar", ref: "7-25" }],
      },
      {
        lessonCode: "ENG9-GR-02",
        title: "Modals, conditionals, and wish structures",
        sourceRefs: [{ sourceType: "grammar", ref: "26-41" }],
      },
      {
        lessonCode: "ENG9-GR-03",
        title: "Reference, clauses, and sentence control",
        sourceRefs: [{ sourceType: "grammar", ref: "82-97" }],
      },
      {
        lessonCode: "ENG9-GR-04",
        title: "Passive, reporting, and formal expression",
        sourceRefs: [{ sourceType: "grammar", ref: "42-48" }],
      },
      {
        lessonCode: "ENG9-GR-05",
        title: "Editing clinic",
        sourceRefs: [{ sourceType: "review", ref: "grammar 7-48, 82-97" }],
      },
    ],
  },
  {
    yearSlug: "year-9",
    slug: "advanced-vocabulary-mastery",
    shortTitle: "Advanced Vocabulary Mastery",
    unitTitle: "Nuanced vocabulary sets for essay and speaking themes.",
    weekRange: "Weeks 6-10",
    learningOutcomes: [
      "Use topic vocabulary for essays and speaking tasks.",
      "Shift from intermediate range into more nuanced word choice.",
      "Build reusable lexical sets for exam themes.",
    ],
    lessons: [
      {
        lessonCode: "ENG9-VO-01",
        title: "Education, work, and media",
        sourceRefs: [
          { sourceType: "vocabulary", ref: "education-advanced" },
          { sourceType: "vocabulary", ref: "work-advanced" },
          { sourceType: "vocabulary", ref: "media-advanced" },
        ],
      },
      {
        lessonCode: "ENG9-VO-02",
        title: "Technology, science, and environment",
        sourceRefs: [
          { sourceType: "vocabulary", ref: "tech-advanced" },
          { sourceType: "vocabulary", ref: "environment-advanced" },
        ],
      },
      {
        lessonCode: "ENG9-VO-03",
        title: "Politics, society, and global issues",
        sourceRefs: [
          { sourceType: "vocabulary", ref: "politics-advanced" },
          { sourceType: "vocabulary", ref: "global-issues-advanced" },
        ],
      },
      {
        lessonCode: "ENG9-VO-04",
        title: "Abstract ideas, psychology, and arts",
        sourceRefs: [
          { sourceType: "vocabulary", ref: "abstract-advanced" },
          { sourceType: "vocabulary", ref: "psychology-advanced" },
          { sourceType: "vocabulary", ref: "arts-advanced" },
        ],
      },
      {
        lessonCode: "ENG9-VO-05",
        title: "Travel, housing, and personal extension bank",
        sourceRefs: [
          { sourceType: "vocabulary", ref: "travel-basic-advanced" },
          { sourceType: "vocabulary", ref: "home-advanced" },
        ],
      },
    ],
  },
  {
    yearSlug: "year-9",
    slug: "advanced-phrase-and-idiom-control",
    shortTitle: "Advanced Phrase and Idiom Control",
    unitTitle: "Higher-level collocations, phrasal verbs, and selective idiom use.",
    weekRange: "Weeks 11-16",
    learningOutcomes: [
      "Improve lexical sophistication without becoming unnatural.",
      "Separate formal and informal phrase choices.",
      "Use idiomatic language selectively in speaking.",
    ],
    lessons: [
      {
        lessonCode: "ENG9-PI-01",
        title: "Advanced collocations for essays and reports",
        sourceRefs: [{ sourceType: "collocation", ref: "101-118" }],
      },
      {
        lessonCode: "ENG9-PI-02",
        title: "Advanced collocations for social issues and public topics",
        sourceRefs: [{ sourceType: "collocation", ref: "130-157" }],
      },
      {
        lessonCode: "ENG9-PI-03",
        title: "Advanced phrasal verbs for study, work, and argument",
        sourceRefs: [{ sourceType: "phrasal", ref: "101-136" }],
      },
      {
        lessonCode: "ENG9-PI-04",
        title: "Advanced phrasal verbs for real-world themes",
        sourceRefs: [{ sourceType: "phrasal", ref: "137-155" }],
      },
      {
        lessonCode: "ENG9-PI-05",
        title: "Advanced idioms for media, society, and discussion",
        sourceRefs: [{ sourceType: "idioms", ref: "101-141" }],
      },
      {
        lessonCode: "ENG9-PI-06",
        title: "Advanced conversation idioms",
        sourceRefs: [{ sourceType: "idioms", ref: "142-160" }],
      },
    ],
  },
  {
    yearSlug: "year-9",
    slug: "ielts-reading-intensive",
    shortTitle: "IELTS Reading Intensive",
    unitTitle: "Timed reading cycles and question-type review.",
    weekRange: "Weeks 17-20",
    learningOutcomes: [
      "Manage time under reading pressure.",
      "Identify question types quickly.",
      "Improve accuracy through review, not only volume.",
    ],
    lessons: [
      {
        lessonCode: "ENG9-RD-01",
        title: "Full reading practice set 1",
        sourceRefs: [{ sourceType: "reading", ref: "practice set 1" }],
      },
      {
        lessonCode: "ENG9-RD-02",
        title: "Timed second-cycle reading practice",
        sourceRefs: [{ sourceType: "reading", ref: "practice set 1 reused with timing" }],
      },
      {
        lessonCode: "ENG9-RD-03",
        title: "Shorter mock reading practice",
        sourceRefs: [{ sourceType: "mock-test", ref: "reading" }],
      },
      {
        lessonCode: "ENG9-RD-04",
        title: "Weakness review by question type",
        sourceRefs: [
          { sourceType: "reading", ref: "practice set 1" },
          { sourceType: "mock-test", ref: "reading" },
        ],
      },
    ],
  },
  {
    yearSlug: "year-9",
    slug: "ielts-writing-intensive",
    shortTitle: "IELTS Writing Intensive",
    unitTitle: "Task family practice with timed writing and evaluation.",
    weekRange: "Weeks 21-26",
    learningOutcomes: [
      "Practice all major IELTS writing task families.",
      "Build a repeatable plan-draft-review loop.",
      "Use feedback actively to improve band descriptors.",
    ],
    lessons: [
      {
        lessonCode: "ENG9-WR-01",
        title: "Academic Task 1 report cycle",
        sourceRefs: [{ sourceType: "writing", ref: "AT1 001-005" }],
      },
      {
        lessonCode: "ENG9-WR-02",
        title: "Academic Task 2 argument cycle",
        sourceRefs: [{ sourceType: "writing", ref: "AT2 001-004" }],
      },
      {
        lessonCode: "ENG9-WR-03",
        title: "Academic Task 2 cause, solution, and public issue cycle",
        sourceRefs: [{ sourceType: "writing", ref: "AT2 005-008" }],
      },
      {
        lessonCode: "ENG9-WR-04",
        title: "General Task 1 letter cycle",
        sourceRefs: [{ sourceType: "writing", ref: "GT1 001-005" }],
      },
      {
        lessonCode: "ENG9-WR-05",
        title: "General Task 2 essay cycle",
        sourceRefs: [{ sourceType: "writing", ref: "GT2 001-005" }],
      },
      {
        lessonCode: "ENG9-WR-06",
        title: "Timed mock writing with feedback",
        sourceRefs: [
          { sourceType: "mock-test", ref: "writing" },
          { sourceType: "writing", ref: "page evaluator" },
        ],
      },
    ],
  },
  {
    yearSlug: "year-9",
    slug: "ielts-speaking-intensive",
    shortTitle: "IELTS Speaking Intensive",
    unitTitle: "Topic-bank speaking practice with recorded review.",
    weekRange: "Weeks 27-31",
    learningOutcomes: [
      "Build confident, extended spoken answers.",
      "Practice topic development across all parts of the speaking test.",
      "Use feedback from recordings to improve clarity and range.",
    ],
    lessons: [
      {
        lessonCode: "ENG9-SP-01",
        title: "Part 1 topic bank",
        sourceRefs: [{ sourceType: "speaking", ref: "academic sets 1-8" }],
      },
      {
        lessonCode: "ENG9-SP-02",
        title: "Part 2 cue-card bank A",
        sourceRefs: [{ sourceType: "speaking", ref: "academic sets 1-4" }],
      },
      {
        lessonCode: "ENG9-SP-03",
        title: "Part 2 cue-card bank B",
        sourceRefs: [{ sourceType: "speaking", ref: "academic sets 5-8" }],
      },
      {
        lessonCode: "ENG9-SP-04",
        title: "Part 3 abstract discussion",
        sourceRefs: [{ sourceType: "speaking", ref: "academic sets 1-8" }],
      },
      {
        lessonCode: "ENG9-SP-05",
        title: "Mock speaking and evaluator review",
        sourceRefs: [
          { sourceType: "mock-test", ref: "speaking" },
          { sourceType: "speaking", ref: "page evaluator" },
        ],
      },
    ],
  },
  {
    yearSlug: "year-9",
    slug: "listening-strategy-and-resource-lab",
    shortTitle: "Listening Strategy Lab",
    unitTitle: "Strategy-first listening work until native in-app listening modules exist.",
    weekRange: "Weeks 32-34",
    learningOutcomes: [
      "Use better listening habits before full in-app listening modules exist.",
      "Track mistakes in spelling, distractors, and synonyms.",
      "Build a repeatable outside-practice routine.",
    ],
    lessons: [
      {
        lessonCode: "ENG9-LI-01",
        title: "Prediction and distractors",
        sourceRefs: [{ sourceType: "listening", ref: "strategy page" }],
      },
      {
        lessonCode: "ENG9-LI-02",
        title: "Synonyms, spelling, and answer transfer",
        sourceRefs: [{ sourceType: "listening", ref: "strategy page" }],
      },
      {
        lessonCode: "ENG9-LI-03",
        title: "External listening practice log",
        sourceRefs: [{ sourceType: "listening", ref: "resource links" }],
      },
    ],
  },
  {
    yearSlug: "year-9",
    slug: "mock-exams-and-capstone",
    shortTitle: "Mock Exams and Capstone",
    unitTitle: "End-of-track mocks, reflection, and study planning.",
    weekRange: "Weeks 35-38",
    learningOutcomes: [
      "Experience combined practice close to exam mode.",
      "Review weaknesses across reading, writing, and speaking.",
      "Finish with a student reflection and target plan.",
    ],
    lessons: [
      {
        lessonCode: "ENG9-MK-01",
        title: "Reading mock",
        sourceRefs: [{ sourceType: "mock-test", ref: "reading" }],
      },
      {
        lessonCode: "ENG9-MK-02",
        title: "Writing mock",
        sourceRefs: [{ sourceType: "mock-test", ref: "writing" }],
      },
      {
        lessonCode: "ENG9-MK-03",
        title: "Speaking mock",
        sourceRefs: [{ sourceType: "mock-test", ref: "speaking" }],
      },
      {
        lessonCode: "ENG9-MK-04",
        title: "Final reflection and study plan",
        sourceRefs: [
          { sourceType: "writing", ref: "page evaluator" },
          { sourceType: "speaking", ref: "page evaluator" },
        ],
      },
    ],
  },
];

export const englishBlueprintByYear = {
  "year-7": englishIeltsBlueprint.filter((chapter) => chapter.yearSlug === "year-7"),
  "year-8": englishIeltsBlueprint.filter((chapter) => chapter.yearSlug === "year-8"),
  "year-9": englishIeltsBlueprint.filter((chapter) => chapter.yearSlug === "year-9"),
} as const;
