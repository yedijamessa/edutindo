import { Year7ScienceChapter } from "../types";

export const spaceChapter: Year7ScienceChapter = {
  slug: "physical-science-space",
  order: 14,
  unitTitle: "Physical Science: Space",
  shortTitle: "Space",
  strand: "Physical Science",
  weekRange: "Weeks 29-30",
  lessons: [
    {
      week: "29",
      lessonCode: "29.1",
      title: "The night sky",
    },
    {
      week: "29",
      lessonCode: "29.2",
      title: "The solar system",
    },
    {
      week: "29",
      lessonCode: "29.3",
      title: "Earth",
    },
    {
      week: "30",
      lessonCode: "30.1",
      title: "The moon",
    },
    {
      week: "30",
      lessonCode: "30.2",
      title: "Space debris",
    },
    {
      week: "30",
      lessonCode: "30.3",
      title: "Review and reflects",
    },
  ],
  learningOutcomes: [
    "Students learn what we see in the night sky and how far away objects are.",
    "Students explore the planets of the solar system.",
    "Students investigate seasons and why they differ across places on Earth.",
    "Students study moon phases and eclipses.",
    "Students consider the impact of satellites and space debris.",
  ],
  sourceFile: "lib/curriculum/year7/science/chapters/14-space.ts",
};
