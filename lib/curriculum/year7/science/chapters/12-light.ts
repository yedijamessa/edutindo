import { Year7ScienceChapter } from "../types";

export const lightChapter: Year7ScienceChapter = {
  slug: "physical-science-light",
  order: 12,
  unitTitle: "Physical Science: Light",
  shortTitle: "Light",
  strand: "Physical Science",
  weekRange: "Weeks 25-26",
  lessons: [
    {
      week: "25",
      lessonCode: "25.1",
      title: "Light",
    },
    {
      week: "25",
      lessonCode: "25.2",
      title: "Reflection",
    },
    {
      week: "25",
      lessonCode: "25.3",
      title: "Refraction",
    },
    {
      week: "26",
      lessonCode: "26.1",
      title: "The eye and the camera",
    },
    {
      week: "26",
      lessonCode: "26.2",
      title: "Colour",
    },
    {
      week: "26",
      lessonCode: "26.3",
      title: "Experiment and reflection",
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
