import { Year7ScienceChapter } from "../types";

export const bodySystemsChapter: Year7ScienceChapter = {
  slug: "biological-science-body-systems",
  order: 3,
  unitTitle: "Biological Science: Body Systems",
  shortTitle: "Body Systems",
  strand: "Biological Science",
  weekRange: "Weeks 6-8",
  lessons: [
    {
      week: "6",
      lessonCode: "2.1",
      title: "Levels of organization",
    },
    {
      week: "6",
      lessonCode: "2.2",
      title: "Skeleton",
    },
    {
      week: "6",
      lessonCode: "2.3",
      title: "Movement: joints",
    },
    {
      week: "7",
      lessonCode: "2.4",
      title: "Movement: muscles",
    },
    {
      week: "7",
      lessonCode: "2.5",
      title: "Breathing: lungs",
    },
    {
      week: "7",
      lessonCode: "2.6",
      title: "Breathing: gas exchange",
    },
    {
      week: "8",
      lessonCode: "2.7",
      title: "Aerobic respiration",
    },
    {
      week: "8",
      lessonCode: "2.8",
      title: "Anaerobic respiration",
    },
    {
      week: "8",
      lessonCode: "2.9",
      title: "What have I learned about body systems?",
    },
  ],
  learningOutcomes: [
    "Students explain how cells, tissues, organs, and organ systems are organized in the body.",
    "Students learn how the skeletal, muscular, and respiratory systems work together.",
    "Students describe gas exchange and how energy is released in aerobic and anaerobic respiration.",
  ],
  sourceFile: "lib/curriculum/year7/science/chapters/05-body-systems.ts",
};
