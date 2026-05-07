import { Year7ScienceChapter } from "../types";

export const elementsAtomsCompoundsChapter: Year7ScienceChapter = {
  slug: "chemical-science-elements-atoms-and-compounds",
  order: 7,
  unitTitle: "Chemical Science: Elements, atoms, and compounds",
  shortTitle: "Elements, Atoms, and Compounds",
  strand: "Chemical Science",
  weekRange: "Weeks 16-17",
  lessons: [
    {
      week: "16",
      lessonCode: "2.1",
      title: "Elements",
    },
    {
      week: "16",
      lessonCode: "2.2",
      title: "Atoms",
    },
    {
      week: "16",
      lessonCode: "2.3",
      title: "Compounds",
    },
    {
      week: "17",
      lessonCode: "2.4",
      title: "Chemical formulae",
    },
    {
      week: "17",
      lessonCode: "2.5",
      title: "What have I learned about elements, atoms, and compounds?",
    },
  ],
  learningOutcomes: [
    "Students learn about elements and use an international code to identify them.",
    "Students discover how atoms make up elements and combine in different ways to form substances.",
    "Students understand that every material is made from atoms of one or more elements.",
    "Students use chemical formulae to describe compounds and review how particles combine.",
  ],
  sourceFile: "lib/curriculum/year7/science/chapters/09-elements-atoms-compounds.ts",
};
