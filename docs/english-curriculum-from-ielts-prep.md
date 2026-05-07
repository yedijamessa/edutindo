# English Curriculum Blueprint From `ielts-prep`

This blueprint is designed for the current `edutindo-new` curriculum structure:

- `school -> year -> subject -> chapter -> lesson`
- Students browse by subject, then open chapters, then move lesson-by-lesson.
- Teachers and admins can manage chapter flow, pre-tests, post-tests, and lesson exports.

The goal here is simple:

- do not invent a brand-new English syllabus
- reuse the content that already exists in `ielts-prep`
- group that content into a Year 7, Year 8, and Year 9 subject structure that fits `edutindo-new`

## Reuse Rules

Use these rules when rebuilding lessons in the module editor:

1. Grammar topic ranges become one lesson when the topics are tightly related.
2. One vocabulary topic + one CEFR level usually becomes one lesson or one word-bank page.
3. One collocation, phrasal verb, or idiom topic usually becomes one focused practice lesson.
4. One writing prompt set becomes one recurring practice lesson, not one permanent theory lesson.
5. One speaking set becomes one oral practice lesson.
6. The current listening page is not a full internal module yet, so treat listening as a strategy/resource chapter for now.

## Source Legend

- `grammar 1-6` means `ielts-prep/app/lib/grammar-data.ts` topic ids `1` through `6`
- `vocab family-beginner` means `ielts-prep/app/lib/lesson-content.ts` key `family-beginner`
- `collocation 27-33` means `ielts-prep/app/lib/collocation-data.ts` topic ids `27` through `33`
- `phrasal 42-50` means `ielts-prep/app/lib/phrasal-verbs-data.ts` topic ids `42` through `50`
- `idioms 11-18` means `ielts-prep/app/lib/idioms-data.ts` topic ids `11` through `18`
- `writing AT1 001-005` means `ielts-prep/app/lib/writing-prompts.ts`
- `speaking academic sets 1-4` means the first four academic sets in `ielts-prep/app/(dashboard)/speaking/page.tsx`
- `reading practice set 1` means the current built-in reading page content in `ielts-prep/app/(dashboard)/reading/page.tsx`
- `mock test reading/writing/speaking` means `ielts-prep/app/lib/mock-tests.ts`

## Subject Setup

Create one top-level subject:

- `English`

Do not create separate top-level subjects for grammar, vocabulary, IELTS, speaking, or writing.
Those should be chapters under `English`.

## Year 7 Blueprint

Year 7 should feel like English foundations with light IELTS alignment, not full exam training.

### Chapter 1

- Title: `Grammar Foundations A`
- Week range: `Weeks 1-6`
- Learning outcomes:
  - Build confidence with present, past, and future structures.
  - Use simple question forms correctly.
  - Recognize tense meaning in short texts.
- Lessons:
  - `L1` Present simple and present continuous
    - Source: `grammar 1-4`
  - `L2` Past simple and past continuous
    - Source: `grammar 5-6`
  - `L3` Present perfect essentials
    - Source: `grammar 7-14`
  - `L4` Future plans and predictions
    - Source: `grammar 19-25`
  - `L5` Questions and short answers
    - Source: `grammar 49-52`
  - `L6` Review and mastery check
    - Source: `grammar 1-14, 19-25, 49-52`

### Chapter 2

- Title: `Grammar Foundations B`
- Week range: `Weeks 7-11`
- Learning outcomes:
  - Use modals for ability, advice, and obligation.
  - Build clearer noun phrases and sentence patterns.
  - Improve basic word order and connector use.
- Lessons:
  - `L1` Modals for daily communication
    - Source: `grammar 26-37`
  - `L2` Countable nouns, articles, and quantity
    - Source: `grammar 69-81, 87-91`
  - `L3` Pronouns and determiners
    - Source: `grammar 82-86`
  - `L4` Adjectives, adverbs, and word order
    - Source: `grammar 98-112`
  - `L5` Basic conjunctions and prepositions
    - Source: `grammar 113-136`

### Chapter 3

- Title: `Vocabulary for Everyday Life`
- Week range: `Weeks 12-16`
- Learning outcomes:
  - Use common word sets for family, routines, school, and travel.
  - Understand example sentences and word use in context.
  - Build a beginner speaking vocabulary bank.
- Lessons:
  - `L1` Family and relationships
    - Source: `vocab family-beginner`
  - `L2` Daily routines
    - Source: `vocab daily-beginner`
  - `L3` Food and home
    - Source: `vocab food-beginner`, `vocab home-beginner`
  - `L4` Travel and education
    - Source: `vocab travel-basic-beginner`, `vocab education-beginner`
  - `L5` Work, media, and technology
    - Source: `vocab work-beginner`, `vocab media-beginner`, `vocab tech-beginner`

### Chapter 4

- Title: `Natural English Phrases`
- Week range: `Weeks 17-20`
- Learning outcomes:
  - Recognize natural word combinations.
  - Use basic phrasal verbs and idioms in speech.
  - Distinguish literal meaning from figurative meaning.
- Lessons:
  - `L1` Collocations basics
    - Source: `collocation 1-6`
  - `L2` Phrasal verbs basics
    - Source: `phrasal 1-5`
  - `L3` Idioms for school and feelings
    - Source: `idioms 1-7`
  - `L4` Agreement, opinion, and response language
    - Source: `collocation 55-60`, `idioms 11-12`

### Chapter 5

- Title: `Reading and Speaking Basics`
- Week range: `Weeks 21-24`
- Learning outcomes:
  - Read longer passages without panicking.
  - Practice simple speaking responses on familiar topics.
  - Notice question instructions and answer types.
- Lessons:
  - `L1` Reading strategies: skimming and paragraph focus
    - Source: `reading practice set 1, passage 1`
  - `L2` Reading strategies: summary and short-answer work
    - Source: `reading practice set 1, passage 2`
  - `L3` Speaking basics on daily life
    - Source: `speaking general sets 1-3`
  - `L4` Speaking basics on family and routine
    - Source: `speaking general sets 4-6`

### Chapter 6

- Title: `Guided Writing`
- Week range: `Weeks 25-28`
- Learning outcomes:
  - Turn grammar and vocabulary into short written output.
  - Write clear paragraphs with simple structure.
  - Prepare for more formal writing in Year 8.
- Lessons:
  - `L1` Short personal writing and messages
    - Source: `writing GT1 003`
  - `L2` Formal apology and request writing
    - Source: `writing GT1 002, GT1 005`
  - `L3` First opinion paragraphs
    - Source: `writing GT2 004, GT2 005`
  - `L4` Year-end writing portfolio
    - Source: reuse `Year 7 Chapters 1-5`

## Year 8 Blueprint

Year 8 should shift from basic English into academic communication and structured practice.

### Chapter 1

- Title: `Grammar for Clear Ideas`
- Week range: `Weeks 1-6`
- Learning outcomes:
  - Use more complex sentence structures in speech and writing.
  - Improve accuracy with clause-based grammar.
  - Support explanation and comparison more clearly.
- Lessons:
  - `L1` Passive and reported speech
    - Source: `grammar 42-48`
  - `L2` Verb patterns with `-ing` and `to`
    - Source: `grammar 53-68`
  - `L3` Relative clauses and extra information
    - Source: `grammar 92-97`
  - `L4` Comparing, qualifying, and emphasizing
    - Source: `grammar 102-112`
  - `L5` Linkers and logic in sentences
    - Source: `grammar 113-120`

### Chapter 2

- Title: `Intermediate Vocabulary for Study and Society`
- Week range: `Weeks 7-12`
- Learning outcomes:
  - Talk about school, society, technology, and public issues.
  - Extend vocabulary from everyday English into academic English.
  - Build better speaking and writing content.
- Lessons:
  - `L1` Education and work
    - Source: `vocab education-intermediate`, `vocab work-intermediate`
  - `L2` Technology and environment
    - Source: `vocab tech-intermediate`, `vocab environment-intermediate`
  - `L3` Media and politics
    - Source: `vocab media-intermediate`, `vocab politics-intermediate`
  - `L4` Arts and psychology
    - Source: `vocab arts-intermediate`, `vocab psychology-intermediate`
  - `L5` Global issues and abstract ideas
    - Source: `vocab global-issues-intermediate`, `vocab abstract-intermediate`
  - `L6` Community, travel, and home
    - Source: `vocab travel-basic-intermediate`, `vocab home-intermediate`

### Chapter 3

- Title: `Collocations for Academic English`
- Week range: `Weeks 13-17`
- Learning outcomes:
  - Use stronger word partnerships in presentations and writing.
  - Sound more natural in academic English.
  - Improve register control.
- Lessons:
  - `L1` Learning how collocations work
    - Source: `collocation 1-5`
  - `L2` Study, learning, and presentations
    - Source: `collocation 27-29`
  - `L3` Work, business, and academic writing
    - Source: `collocation 30-33`
  - `L4` Society, news, money, and global problems
    - Source: `collocation 34-39`
  - `L5` Agreeing, deciding, and cause/effect
    - Source: `collocation 51-60`

### Chapter 4

- Title: `Phrasal Verbs and Idioms for Fluency`
- Week range: `Weeks 18-22`
- Learning outcomes:
  - Speak more flexibly in discussion and problem-solving.
  - Use common phrasal verbs related to study and communication.
  - Recognize figurative expressions without overusing them in formal writing.
- Lessons:
  - `L1` Classroom and study phrasal verbs
    - Source: `phrasal 42-44`
  - `L2` Work, business, and telephoning phrasal verbs
    - Source: `phrasal 45-50`
  - `L3` Communication and problem-solving phrasal verbs
    - Source: `phrasal 31, 35-41`
  - `L4` Idioms for discussion and response
    - Source: `idioms 11-18`
  - `L5` Idioms for time, memory, and communication
    - Source: `idioms 27-32`

### Chapter 5

- Title: `Reading Skills Lab`
- Week range: `Weeks 23-26`
- Learning outcomes:
  - Handle longer texts and mixed question types.
  - Use timed reading strategies.
  - Learn how summary completion and short answers work.
- Lessons:
  - `L1` Paragraph matching and multiple choice
    - Source: `reading practice set 1, passage 1`
  - `L2` Summary completion and short answers
    - Source: `reading practice set 1, passage 2`
  - `L3` Writer viewpoint and argument reading
    - Source: `reading practice set 1, passage 3`
  - `L4` Timed reading mini mock
    - Source: `mock test reading`

### Chapter 6

- Title: `Writing Foundations`
- Week range: `Weeks 27-31`
- Learning outcomes:
  - Learn the major IELTS-style writing task shapes.
  - Practice both general and academic writing formats.
  - Build drafting and revision discipline.
- Lessons:
  - `L1` General Task 1 letters
    - Source: `writing GT1 001-005`
  - `L2` Academic Task 1 charts and graphs
    - Source: `writing AT1 001-003`
  - `L3` Academic Task 1 processes and maps
    - Source: `writing AT1 004-005`
  - `L4` Academic Task 2 opinion and discussion essays
    - Source: `writing AT2 001-008`
  - `L5` Feedback and redrafting cycle
    - Source: `writing page evaluator`

### Chapter 7

- Title: `Speaking Foundations`
- Week range: `Weeks 32-35`
- Learning outcomes:
  - Develop speaking confidence for Part 1, Part 2, and Part 3 style prompts.
  - Expand answers with reasons and examples.
  - Get used to recording and review.
- Lessons:
  - `L1` Part 1 fluency on study and daily life
    - Source: `speaking academic sets 1-4`
  - `L2` Part 2 cue-card building
    - Source: `speaking academic sets 1-4`
  - `L3` Part 3 extended discussion
    - Source: `speaking academic sets 5-8`
  - `L4` Recorded speaking review
    - Source: `speaking page evaluator`

## Year 9 Blueprint

Year 9 should feel like a real IELTS-aligned prep track built from the same content bank.

### Chapter 1

- Title: `Advanced Grammar for Accuracy`
- Week range: `Weeks 1-5`
- Learning outcomes:
  - Write and speak with fewer high-frequency grammar errors.
  - Control academic tone more consistently.
  - Edit output using grammar patterns intentionally.
- Lessons:
  - `L1` Tense review for narrative and explanation
    - Source: `grammar 7-25`
  - `L2` Modals, conditionals, and wish structures
    - Source: `grammar 26-41`
  - `L3` Reference, clauses, and sentence control
    - Source: `grammar 82-97`
  - `L4` Passive, reporting, and formal expression
    - Source: `grammar 42-48`
  - `L5` Editing clinic
    - Source: reuse `grammar 7-48, 82-97`

### Chapter 2

- Title: `Advanced Vocabulary Mastery`
- Week range: `Weeks 6-10`
- Learning outcomes:
  - Use topic vocabulary for essays and speaking tasks.
  - Shift from intermediate range into more nuanced word choice.
  - Build reusable lexical sets for exam themes.
- Lessons:
  - `L1` Education, work, and media
    - Source: `vocab education-advanced`, `vocab work-advanced`, `vocab media-advanced`
  - `L2` Technology, science, and environment
    - Source: `vocab tech-advanced`, `vocab environment-advanced`
  - `L3` Politics, society, and global issues
    - Source: `vocab politics-advanced`, `vocab global-issues-advanced`
  - `L4` Abstract ideas, psychology, and arts
    - Source: `vocab abstract-advanced`, `vocab psychology-advanced`, `vocab arts-advanced`
  - `L5` Travel, housing, and personal extension bank
    - Source: `vocab travel-basic-advanced`, `vocab home-advanced`

### Chapter 3

- Title: `Advanced Phrase and Idiom Control`
- Week range: `Weeks 11-16`
- Learning outcomes:
  - Improve lexical sophistication without becoming unnatural.
  - Separate formal and informal phrase choices.
  - Use idiomatic language selectively in speaking.
- Lessons:
  - `L1` Advanced collocations for essays and reports
    - Source: `collocation 101-118`
  - `L2` Advanced collocations for social issues and public topics
    - Source: `collocation 130-157`
  - `L3` Advanced phrasal verbs for study, work, and argument
    - Source: `phrasal 101-136`
  - `L4` Advanced phrasal verbs for real-world themes
    - Source: `phrasal 137-155`
  - `L5` Advanced idioms for media, society, and discussion
    - Source: `idioms 101-141`
  - `L6` Advanced conversation idioms
    - Source: `idioms 142-160`

### Chapter 4

- Title: `IELTS Reading Intensive`
- Week range: `Weeks 17-20`
- Learning outcomes:
  - Manage time under reading pressure.
  - Identify question types quickly.
  - Improve accuracy through review, not only volume.
- Lessons:
  - `L1` Full reading practice set 1
    - Source: `reading practice set 1`
  - `L2` Timed second-cycle reading practice
    - Source: reuse `reading practice set 1` with stricter timing
  - `L3` Shorter mock reading practice
    - Source: `mock test reading`
  - `L4` Weakness review by question type
    - Source: reuse `reading practice set 1`, `mock test reading`

### Chapter 5

- Title: `IELTS Writing Intensive`
- Week range: `Weeks 21-26`
- Learning outcomes:
  - Practice all major IELTS writing task families.
  - Build a repeatable plan-draft-review loop.
  - Use feedback actively to improve band descriptors.
- Lessons:
  - `L1` Academic Task 1 report cycle
    - Source: `writing AT1 001-005`
  - `L2` Academic Task 2 argument cycle
    - Source: `writing AT2 001-004`
  - `L3` Academic Task 2 cause, solution, and public issue cycle
    - Source: `writing AT2 005-008`
  - `L4` General Task 1 letter cycle
    - Source: `writing GT1 001-005`
  - `L5` General Task 2 essay cycle
    - Source: `writing GT2 001-005`
  - `L6` Timed mock writing with feedback
    - Source: `mock test writing`, `writing page evaluator`

### Chapter 6

- Title: `IELTS Speaking Intensive`
- Week range: `Weeks 27-31`
- Learning outcomes:
  - Build confident, extended spoken answers.
  - Practice topic development across all parts of the speaking test.
  - Use feedback from recordings to improve clarity and range.
- Lessons:
  - `L1` Part 1 topic bank
    - Source: `speaking academic sets 1-8`
  - `L2` Part 2 cue-card bank A
    - Source: `speaking academic sets 1-4`
  - `L3` Part 2 cue-card bank B
    - Source: `speaking academic sets 5-8`
  - `L4` Part 3 abstract discussion
    - Source: `speaking academic sets 1-8`
  - `L5` Mock speaking and evaluator review
    - Source: `mock test speaking`, `speaking page evaluator`

### Chapter 7

- Title: `Listening Strategy and Resource Lab`
- Week range: `Weeks 32-34`
- Learning outcomes:
  - Use better listening habits before full in-app listening modules exist.
  - Track mistakes in spelling, distractors, and synonyms.
  - Build a repeatable outside-practice routine.
- Lessons:
  - `L1` Prediction and distractors
    - Source: `listening page`
  - `L2` Synonyms, spelling, and answer transfer
    - Source: `listening page`
  - `L3` External listening practice log
    - Source: `listening page resource links`

### Chapter 8

- Title: `Mock Exams and Capstone`
- Week range: `Weeks 35-38`
- Learning outcomes:
  - Experience combined practice close to exam mode.
  - Review weaknesses across reading, writing, and speaking.
  - Finish with a student reflection and target plan.
- Lessons:
  - `L1` Reading mock
    - Source: `mock test reading`
  - `L2` Writing mock
    - Source: `mock test writing`
  - `L3` Speaking mock
    - Source: `mock test speaking`
  - `L4` Final reflection and study plan
    - Source: reuse `writing page evaluator`, `speaking page evaluator`, chapter reviews

## Minimum Build Order

If you do not want to build everything at once, build in this order:

1. Year 8 `Writing Foundations`
2. Year 9 `IELTS Writing Intensive`
3. Year 9 `IELTS Speaking Intensive`
4. Year 7 `Grammar Foundations A`
5. Year 8 `Reading Skills Lab`
6. Year 9 `IELTS Reading Intensive`
7. Year 7 `Vocabulary for Everyday Life`
8. Year 8 `Intermediate Vocabulary for Study and Society`

This order gives you the fastest visible value from the existing `ielts-prep` material.

## Recommended Module Editor Pattern

When converting any source lesson into `edutindo-new`, use this page/block pattern:

1. Page 1: overview and lesson goals
2. Page 2: key points or word bank
3. Page 3: examples in context
4. Page 4: guided practice
5. Page 5: quiz block
6. Page 6: exit ticket or speaking/writing task

Use these block types:

- `text` for explanation, examples, and instructions
- `image` for Task 1 charts/maps/process visuals
- `quiz` for MCQ, fill-in-the-blank, short answer, matching, ordering, and essay prompts

## Important Constraint

Right now, `edutindo-new` lesson pages still render mostly from `lib/curriculum-lesson-content.ts`, while module editor documents are mainly saved and exported. If you want this blueprint to become truly reusable at scale, the next implementation step should be:

- load `getModuleEditorDocument(lesson.id)` directly on the student lesson page
- use that document as the primary lesson renderer
- keep `getCurriculumLessonContent(...)` only as fallback

That change is what will stop you from manually recreating the same lesson logic over and over.
