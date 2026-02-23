import { Year7ScienceChapter } from "../types";

export const periodicTableChapter: Year7ScienceChapter = {
  slug: "chemical-science-the-periodic-table",
  order: 11,
  unitTitle: "Chemical Science: The Periodic Table",
  shortTitle: "The Periodic Table",
  strand: "Chemical Science",
  weekRange: "Weeks 23-24",
  lessons: [
    {
      week: "23",
      lessonCode: "23.1",
      title: "Three elements: copper, sulfur, and germanium",
    },
    {
      week: "23",
      lessonCode: "23.2",
      title: "Physical and chemical properties of metals and non-metals",
    },
    {
      week: "23",
      lessonCode: "23.3",
      title: "Groups and periods",
    },
    {
      week: "24",
      lessonCode: "24.1",
      title: "The elements of group 1",
    },
    {
      week: "24",
      lessonCode: "24.2",
      title: "The elements of group 7",
    },
    {
      week: "24",
      lessonCode: "24.3",
      title: "The elements of group 0",
    },
  ],
  learningOutcomes: [
    "Students identify patterns in groups and periods of the periodic table.",
    "Students compare physical and chemical properties of metals and non-metals.",
    "Students examine key elements from groups 1, 7, and 0 and relate them to real-world uses.",
  ],
  sourceFile: "lib/curriculum/year7/science/chapters/11-periodic-table.ts",
};
