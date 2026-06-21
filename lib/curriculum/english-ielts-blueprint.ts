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

type ThemeLessonSeed = {
  title: string;
  ref: string;
};

function createThemeChapter(input: {
  slug: string;
  shortTitle: string;
  unitTitle: string;
  weekRange: string;
  codePrefix: string;
  learningOutcomes: string[];
  lessons: ThemeLessonSeed[];
}): EnglishBlueprintChapter {
  return {
    yearSlug: "year-7",
    slug: input.slug,
    shortTitle: input.shortTitle,
    unitTitle: input.unitTitle,
    weekRange: input.weekRange,
    learningOutcomes: input.learningOutcomes,
    lessons: input.lessons.map((lesson, index) => ({
      lessonCode: `${input.codePrefix}-${String(index + 1).padStart(2, "0")}`,
      title: lesson.title,
      sourceRefs: [{ sourceType: "grammar", ref: lesson.ref }],
    })),
  };
}

const year7GrammarThemeChapters: EnglishBlueprintChapter[] = [
  createThemeChapter({
    slug: "present-and-past",
    shortTitle: "Present and Past",
    unitTitle: "Core present and past tense patterns for everyday meaning and sentence control.",
    weekRange: "Weeks 1-3",
    codePrefix: "ENG7-PP",
    learningOutcomes: [
      "Recognize the difference between present simple, present continuous, past simple, and past continuous.",
      "Choose the correct tense for routines, actions in progress, and completed past events.",
      "Use tense contrast more confidently in short sentences and examples.",
    ],
    lessons: [
      { title: "Present continuous (I am doing)", ref: "1" },
      { title: "Present simple (I do)", ref: "2" },
      { title: "Present continuous and present simple 1 (I am doing and I do)", ref: "3" },
      { title: "Present continuous and present simple 2 (I am doing and I do)", ref: "4" },
      { title: "Past simple (I did)", ref: "5" },
      { title: "Past continuous (I was doing)", ref: "6" },
    ],
  }),
  createThemeChapter({
    slug: "present-perfect-and-past-perfect",
    shortTitle: "Present Perfect and Past Perfect",
    unitTitle: "Present perfect, past perfect, and related time expressions for ongoing and completed meaning.",
    weekRange: "Weeks 4-8",
    codePrefix: "ENG7-PF",
    learningOutcomes: [
      "Use present perfect and past perfect forms with better time awareness.",
      "Understand how since, for, already, and yet shape sentence meaning.",
      "Compare finished past actions with actions connected to the present.",
    ],
    lessons: [
      { title: "Present perfect 1 (I have done)", ref: "7" },
      { title: "Present perfect 2 (I have done)", ref: "8" },
      { title: "Present perfect continuous (I have been doing)", ref: "9" },
      { title: "Present perfect continuous and simple (I have been doing and I have done)", ref: "10" },
      { title: "How long have you (been) ... ?", ref: "11" },
      { title: "For and since, when ... ?, and how long ... ?", ref: "12" },
      { title: "Present perfect and past 1 (I have done and I did)", ref: "13" },
      { title: "Present perfect and past 2 (I have done and I did)", ref: "14" },
      { title: "Past perfect (I had done)", ref: "15" },
      { title: "Past perfect continuous (I had been doing)", ref: "16" },
      { title: "Have and have got", ref: "17" },
      { title: "Used to (do)", ref: "18" },
    ],
  }),
  createThemeChapter({
    slug: "future",
    shortTitle: "Future",
    unitTitle: "Future forms for plans, predictions, schedules, and time clauses.",
    weekRange: "Weeks 9-11",
    codePrefix: "ENG7-FU",
    learningOutcomes: [
      "Use present forms, going to, and will for different kinds of future meaning.",
      "Compare planned actions with predictions and spontaneous decisions.",
      "Handle future time clauses such as when and if more accurately.",
    ],
    lessons: [
      { title: "Present tenses (I am doing / I do) for the future", ref: "19" },
      { title: "I'm going to (do)", ref: "20" },
      { title: "Will and shall 1", ref: "21" },
      { title: "Will and shall 2", ref: "22" },
      { title: "I will and I'm going to", ref: "23" },
      { title: "Will be doing and will have done", ref: "24" },
      { title: "When I do and when I've done, if and when", ref: "25" },
    ],
  }),
  createThemeChapter({
    slug: "modals",
    shortTitle: "Modals",
    unitTitle: "Modal verbs for ability, permission, advice, obligation, and everyday interaction.",
    weekRange: "Weeks 12-16",
    codePrefix: "ENG7-MD",
    learningOutcomes: [
      "Use common modals to express rules, advice, possibility, and requests.",
      "Distinguish strong obligation from softer suggestion and possibility.",
      "Respond more naturally in everyday spoken English.",
    ],
    lessons: [
      { title: "Can, could, and (be) able to", ref: "26" },
      { title: "Could (do) and could have (done)", ref: "27" },
      { title: "Must and can't", ref: "28" },
      { title: "May and might 1", ref: "29" },
      { title: "May and might 2", ref: "30" },
      { title: "Have to and must", ref: "31" },
      { title: "Must, mustn't, needn't", ref: "32" },
      { title: "Should 1", ref: "33" },
      { title: "Should 2", ref: "34" },
      { title: "I'd better ..., it's time ...", ref: "35" },
      { title: "Would", ref: "36" },
      { title: "Can/could/would you ... ? (requests, offers, permission, and invitations)", ref: "37" },
    ],
  }),
  createThemeChapter({
    slug: "if-and-wish",
    shortTitle: "If and Wish",
    unitTitle: "Conditionals and wish structures for real, unreal, and past-imagined situations.",
    weekRange: "Weeks 17-18",
    codePrefix: "ENG7-IW",
    learningOutcomes: [
      "Build simple if-sentences for real and unreal situations.",
      "Use wish to talk about present regret and past regret.",
      "Recognize how verb form changes shift meaning in conditional patterns.",
    ],
    lessons: [
      { title: "If I do ..., and if I did ...", ref: "38" },
      { title: "If I knew ..., I wish I knew ...", ref: "39" },
      { title: "If I had known ..., I wish I had known ...", ref: "40" },
      { title: "Wish", ref: "41" },
    ],
  }),
  createThemeChapter({
    slug: "passive",
    shortTitle: "Passive",
    unitTitle: "Passive structures for focus, reporting, and formal sentence patterns.",
    weekRange: "Weeks 19-20",
    codePrefix: "ENG7-PA",
    learningOutcomes: [
      "Recognize and form passive sentences in different tenses.",
      "Use passive reporting phrases in more formal English.",
      "Understand when the object becomes the focus of the sentence.",
    ],
    lessons: [
      { title: "Passive 1 (is done / was done)", ref: "42" },
      { title: "Passive 2 (be done / been done / being done)", ref: "43" },
      { title: "Passive 3", ref: "44" },
      { title: "It is said that ..., he is said to ..., he is supposed to ...", ref: "45" },
      { title: "Have something done", ref: "46" },
    ],
  }),
  createThemeChapter({
    slug: "reported-speech",
    shortTitle: "Reported Speech",
    unitTitle: "Reporting what people say, ask, and explain in connected speech.",
    weekRange: "Weeks 21-21",
    codePrefix: "ENG7-RP",
    learningOutcomes: [
      "Report statements and follow-up meaning more clearly.",
      "Notice tense and pronoun shifts in reported speech.",
      "Turn direct speech into reported forms with more confidence.",
    ],
    lessons: [
      { title: "Reported speech 1 (he said that ...)", ref: "47" },
      { title: "Reported speech 2", ref: "48" },
    ],
  }),
  createThemeChapter({
    slug: "questions-and-auxiliary-verbs",
    shortTitle: "Questions and Auxiliary Verbs",
    unitTitle: "Question forms, auxiliary verbs, and short responses for spoken interaction.",
    weekRange: "Weeks 22-23",
    codePrefix: "ENG7-QA",
    learningOutcomes: [
      "Ask clearer yes/no and information questions.",
      "Use auxiliary verbs to make short answers and question tags.",
      "Recognize indirect question patterns in everyday English.",
    ],
    lessons: [
      { title: "Questions 1", ref: "49" },
      { title: "Questions 2 (do you know where ... ? / he asked me where ...)", ref: "50" },
      { title: "Auxiliary verbs (have/do/can etc.) I think so / I hope so etc.", ref: "51" },
      { title: "Question tags (do you? / isn't it? etc.)", ref: "52" },
    ],
  }),
  createThemeChapter({
    slug: "ing-and-to-patterns",
    shortTitle: "-ing and To ...",
    unitTitle: "Common verb patterns with -ing, to, objects, and prepositions.",
    weekRange: "Weeks 24-28",
    codePrefix: "ENG7-IT",
    learningOutcomes: [
      "Use verb patterns with -ing and to more accurately.",
      "Notice how meaning changes with different verb complements.",
      "Apply common exam and classroom patterns in speaking and writing.",
    ],
    lessons: [
      { title: "Verb + -ing (enjoy doing / stop doing etc.)", ref: "53" },
      { title: "Verb + to ... (decide to ... / forget to ... etc.)", ref: "54" },
      { title: "Verb + (object) + to ... (I want you to ...)", ref: "55" },
      { title: "Verb + -ing or to ... 1 (remember, regret etc.)", ref: "56" },
      { title: "Verb + -ing or to ... 2 (try, need, help)", ref: "57" },
      { title: "Verb + -ing or to ... 3 (like / would like etc.)", ref: "58" },
      { title: "Prefer and would rather", ref: "59" },
      { title: "Preposition (in/for/about etc.) + -ing", ref: "60" },
      { title: "Be/get used to ... / I'm used to ...", ref: "61" },
      { title: "Verb + preposition + -ing (succeed in -ing / insist on -ing etc.)", ref: "62" },
      { title: "There's no point in -ing, it's worth -ing etc.", ref: "63" },
      { title: "To ... , for ... and so that ...", ref: "64" },
      { title: "Adjective + to ...", ref: "65" },
      { title: "To ... (afraid to do) and preposition + -ing (afraid of -ing)", ref: "66" },
      { title: "See somebody do and see somebody doing", ref: "67" },
      { title: "-ing clauses (He hurt his knee playing football.)", ref: "68" },
    ],
  }),
  createThemeChapter({
    slug: "articles-and-nouns",
    shortTitle: "Articles and Nouns",
    unitTitle: "Countability, articles, noun phrases, and names in common English use.",
    weekRange: "Weeks 29-32",
    codePrefix: "ENG7-AN",
    learningOutcomes: [
      "Distinguish countable and uncountable nouns more confidently.",
      "Choose a/an/the and zero article with better accuracy.",
      "Understand common noun phrase patterns in everyday English.",
    ],
    lessons: [
      { title: "Countable and uncountable 1", ref: "69" },
      { title: "Countable and uncountable 2", ref: "70" },
      { title: "Countable nouns with a/an and some", ref: "71" },
      { title: "A/an and the", ref: "72" },
      { title: "The 1", ref: "73" },
      { title: "The 2 (school / the school etc.)", ref: "74" },
      { title: "The 3 (children / the children)", ref: "75" },
      { title: "The 4 (the giraffe / the telephone / the old etc.)", ref: "76" },
      { title: "Names with and without the 1", ref: "77" },
      { title: "Names with and without the 2", ref: "78" },
      { title: "Singular and plural", ref: "79" },
      { title: "Noun + noun (a bus driver / a headache)", ref: "80" },
      { title: "'s (your sister's name) and of ... (the name of the book)", ref: "81" },
    ],
  }),
  createThemeChapter({
    slug: "pronouns-and-determiners",
    shortTitle: "Pronouns and Determiners",
    unitTitle: "Reference words, quantity words, and determiner choices for clearer sentence meaning.",
    weekRange: "Weeks 33-35",
    codePrefix: "ENG7-PD",
    learningOutcomes: [
      "Use pronouns and determiners to refer clearly to people and things.",
      "Choose quantity words such as some, any, much, and many more accurately.",
      "Avoid common confusion with each/every, both/either, and no/none forms.",
    ],
    lessons: [
      { title: "Myself/yourself/themselves etc.", ref: "82" },
      { title: "A friend of mine, my own house, on my own / by myself", ref: "83" },
      { title: "There ... and it ...", ref: "84" },
      { title: "Some and any", ref: "85" },
      { title: "No/none/any, nothing/nobody etc.", ref: "86" },
      { title: "Much, many, little, few, a lot, plenty", ref: "87" },
      { title: "All / all of, most / most of, no / none of etc.", ref: "88" },
      { title: "Both / both of, neither / neither of, either / either of", ref: "89" },
      { title: "All, every, whole", ref: "90" },
      { title: "Each and every", ref: "91" },
    ],
  }),
  createThemeChapter({
    slug: "relative-clauses",
    shortTitle: "Relative Clauses",
    unitTitle: "Who/that/which/where clauses and reduced clause patterns for description.",
    weekRange: "Weeks 36-37",
    codePrefix: "ENG7-RC",
    learningOutcomes: [
      "Join ideas using relative clauses more naturally.",
      "Distinguish defining and extra-information clauses.",
      "Use reduced clause patterns in high-frequency expressions.",
    ],
    lessons: [
      { title: "Relative clauses 1: clauses with who/that/which", ref: "92" },
      { title: "Relative clauses 2: clauses with and without who/that/which", ref: "93" },
      { title: "Relative clauses 3: whose/whom/where", ref: "94" },
      { title: "Relative clauses 4: extra information clauses (1)", ref: "95" },
      { title: "Relative clauses 5: extra information clauses (2)", ref: "96" },
      { title: "-ing and -ed clauses (the woman talking to Tom, the boy injured in the accident)", ref: "97" },
    ],
  }),
  createThemeChapter({
    slug: "adjectives-and-adverbs",
    shortTitle: "Adjectives and Adverbs",
    unitTitle: "Describing, comparing, qualifying, and ordering information in sentences.",
    weekRange: "Weeks 38-41",
    codePrefix: "ENG7-AA",
    learningOutcomes: [
      "Use adjectives and adverbs to describe more precisely.",
      "Compare people, things, and situations using comparative and superlative forms.",
      "Improve sentence flow with better word order and emphasis choices.",
    ],
    lessons: [
      { title: "Adjectives ending in -ing and -ed (boring/bored etc.)", ref: "98" },
      { title: "Adjectives: a nice new house, you look tired", ref: "99" },
      { title: "Adjectives and adverbs 1 (quick/quickly)", ref: "100" },
      { title: "Adjectives and adverbs 2 (well, fast, late, hard/hardly)", ref: "101" },
      { title: "So and such", ref: "102" },
      { title: "Enough and too", ref: "103" },
      { title: "Quite, pretty, rather, and fairly", ref: "104" },
      { title: "Comparative 1 (cheaper, more expensive etc.)", ref: "105" },
      { title: "Comparative 2 (much better / any better etc.)", ref: "106" },
      { title: "Comparative 3 (as ... as / than)", ref: "107" },
      { title: "Superlative (the longest, the most enjoyable etc.)", ref: "108" },
      { title: "Word order 1: verb + object; place and time", ref: "109" },
      { title: "Word order 2: adverbs with the verb", ref: "110" },
      { title: "Still, any more, yet, already", ref: "111" },
      { title: "Even", ref: "112" },
    ],
  }),
  createThemeChapter({
    slug: "conjunctions-and-time-prepositions",
    shortTitle: "Conjunctions and Prepositions",
    unitTitle: "Linking ideas with conjunctions and common time/logic connectors.",
    weekRange: "Weeks 42-44",
    codePrefix: "ENG7-CP",
    learningOutcomes: [
      "Link sentences and clauses with clearer logic.",
      "Use contrast, reason, condition, and time expressions more accurately.",
      "Improve sentence cohesion in short writing and discussion.",
    ],
    lessons: [
      { title: "Although, though, even though, in spite of, despite", ref: "113" },
      { title: "In case", ref: "114" },
      { title: "Unless, as long as, provided", ref: "115" },
      { title: "As (as I walked ... / as I was ... etc.)", ref: "116" },
      { title: "Like and as", ref: "117" },
      { title: "Like, as if", ref: "118" },
      { title: "During, for, while", ref: "119" },
      { title: "By and until, by the time ...", ref: "120" },
    ],
  }),
  createThemeChapter({
    slug: "prepositions",
    shortTitle: "Prepositions",
    unitTitle: "High-frequency preposition patterns with time, place, and verb/adjective combinations.",
    weekRange: "Weeks 45-48",
    codePrefix: "ENG7-PR",
    learningOutcomes: [
      "Use common prepositions with better control in time and place expressions.",
      "Notice repeated verb, noun, and adjective + preposition patterns.",
      "Reduce errors in short sentences and common exam-style items.",
    ],
    lessons: [
      { title: "At/on/in (time)", ref: "121" },
      { title: "On time and in time, at the end and in the end", ref: "122" },
      { title: "In/at/on (position) 1", ref: "123" },
      { title: "In/at/on (position) 2", ref: "124" },
      { title: "In/at/on (position) 3", ref: "125" },
      { title: "To, at, in and into", ref: "126" },
      { title: "On/at (other uses)", ref: "127" },
      { title: "By", ref: "128" },
      { title: "Noun + preposition (reason for, cause of etc.)", ref: "129" },
      { title: "Adjective + preposition 1", ref: "130" },
      { title: "Adjective + preposition 2", ref: "131" },
      { title: "Verb + preposition 1: to and at", ref: "132" },
      { title: "Verb + preposition 2: about/for/of/after", ref: "133" },
      { title: "Verb + preposition 3: about and of", ref: "134" },
      { title: "Verb + preposition 4: of/for/from/on", ref: "135" },
      { title: "Verb + preposition 5: in/into/with/to/on", ref: "136" },
    ],
  }),
  createThemeChapter({
    slug: "phrasal-verbs",
    shortTitle: "Phrasal Verbs",
    unitTitle: "Foundational phrasal verb families for movement, direction, and common usage.",
    weekRange: "Weeks 49-50",
    codePrefix: "ENG7-PV",
    learningOutcomes: [
      "Recognize common phrasal verb building blocks more quickly.",
      "Use directional particles such as in, out, on, off, up, and back more accurately.",
      "Build confidence with high-frequency phrasal verb patterns before wider extension work.",
    ],
    lessons: [
      { title: "Phrasal verbs 1: introduction", ref: "137" },
      { title: "Phrasal verbs 2: in/out", ref: "138" },
      { title: "Phrasal verbs 3: out", ref: "139" },
      { title: "Phrasal verbs 4: on/off (1)", ref: "140" },
      { title: "Phrasal verbs 5: on/off (2)", ref: "141" },
      { title: "Phrasal verbs 6: up/down", ref: "142" },
      { title: "Phrasal verbs 7: up (1)", ref: "143" },
      { title: "Phrasal verbs 8: up (2)", ref: "144" },
      { title: "Phrasal verbs 9: away/back", ref: "145" },
    ],
  }),
];

export const englishIeltsBlueprint: EnglishBlueprintChapter[] = [
  ...year7GrammarThemeChapters,
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
