import { Year7ScienceChapter } from "../types";

export const introductionChapter: Year7ScienceChapter = {
  slug: "introduction-scientist-and-engineer",
  order: 1,
  unitTitle: "Working Scientifically",
  shortTitle: "Working Scientifically",
  strand: "Introduction",
  weekRange: "Weeks 0-2",
  lessons: [
    {
      week: "0",
      lessonCode: "0.1",
      title: "Reading week and LMS introduction",
    },
    {
      week: "1",
      lessonCode: "1.1",
      title: "Asking scientific questions",
    },
    {
      week: "1",
      lessonCode: "1.2",
      title: "Working safely",
    },
    {
      week: "1",
      lessonCode: "1.3",
      title: "Planning investigations",
    },
    {
      week: "2",
      lessonCode: "1.4",
      title: "Recording data",
    },
    {
      week: "2",
      lessonCode: "1.5",
      title: "Presenting data",
    },
    {
      week: "2",
      lessonCode: "1.6",
      title: "Analysing data",
    },
    {
      week: "2",
      lessonCode: "1.7",
      title: "Evaluating data",
    },
  ],
  learningOutcomes: [
    "Students learn how to ask scientific questions that can be explored through observation and investigation.",
    "Students work safely and plan fair tests using suitable equipment and clear methods.",
    "Students record, present, analyse, and evaluate data using appropriate scientific conventions.",
  ],
  sourceFile: "lib/curriculum/year7/science/chapters/01-introduction.ts",
};
