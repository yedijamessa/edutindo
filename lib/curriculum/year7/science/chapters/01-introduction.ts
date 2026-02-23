import { Year7ScienceChapter } from "../types";

export const introductionChapter: Year7ScienceChapter = {
  slug: "introduction-scientist-and-engineer",
  order: 1,
  unitTitle: "Introduction: How does one become a scientist and an engineer?",
  shortTitle: "Becoming a Scientist and Engineer",
  strand: "Introduction",
  weekRange: "Weeks 0-1",
  lessons: [
    {
      week: "0",
      lessonCode: "0",
      title: "Reading week + LMS introduction",
    },
    {
      week: "1",
      lessonCode: "1",
      title:
        "Working safely, asking scientific questions, design concepts, planning, investigations, recording, analyzing, and presenting data",
    },
  ],
  learningOutcomes: [
    "Students learn how to take ideas and turn them into scientific questions that can be tested.",
    "Students use scientific equipment to collect and record measurements and observations.",
    "Students learn how to work safely and begin to evaluate work to find errors and suggest improvements.",
  ],
  sourceFile: "lib/curriculum/year7/science/chapters/01-introduction.ts",
};
