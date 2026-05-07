import { Year7ScienceChapter } from "../types";

export const lightChapter: Year7ScienceChapter = {
  slug: "physical-science-light",
  order: 12,
  unitTitle: "Physical Science: Light",
  shortTitle: "Light",
  strand: "Physical Science",
  weekRange: "Weeks 29-30",
  lessons: [
    {
      week: "29",
      lessonCode: "3.1",
      title: "Light",
    },
    {
      week: "29",
      lessonCode: "3.2",
      title: "Reflection",
    },
    {
      week: "29",
      lessonCode: "3.3",
      title: "Refraction",
    },
    {
      week: "30",
      lessonCode: "3.4",
      title: "The eye and the camera",
    },
    {
      week: "30",
      lessonCode: "3.5",
      title: "Colour",
    },
    {
      week: "30",
      lessonCode: "3.6",
      title: "What have I learned about light?",
    },
  ],
  learningOutcomes: [
    "Students learn what light is, where it comes from, and how fast it travels.",
    "Students investigate reflection and how light changes direction.",
    "Students trace how light travels from a source to the eye or camera.",
    "Students study color, filters, and why objects appear in different colors.",
  ],
  sourceFile: "lib/curriculum/year7/science/chapters/12-light.ts",
};
