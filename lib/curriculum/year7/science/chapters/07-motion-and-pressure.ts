import { Year7ScienceChapter } from "../types";

export const motionAndPressureChapter: Year7ScienceChapter = {
  slug: "physical-science-motion-and-pressure",
  order: 7,
  unitTitle: "Physical Science: Motion and Pressure",
  shortTitle: "Motion and Pressure",
  strand: "Physical Science",
  weekRange: "Weeks 16-17",
  lessons: [
    {
      week: "16",
      lessonCode: "16.1",
      title: "Introduction of speed",
    },
    {
      week: "16",
      lessonCode: "16.2",
      title: "Motion graphs",
    },
    {
      week: "16",
      lessonCode: "16.3",
      title: "Pressure in gases, liquids, and solids",
    },
    {
      week: "17",
      lessonCode: "17.1",
      title: "Turning forces",
    },
    {
      week: "17",
      lessonCode: "17.2",
      title: "Experiment",
    },
    {
      week: "17",
      lessonCode: "17.3",
      title: "Paper writing & reflection",
    },
  ],
  learningOutcomes: [
    "Students learn how to interpret a motion graph of distance against time.",
    "Students calculate speed from data and from motion graphs.",
    "Students investigate pressure in gases, liquids, and solids, including atmospheric pressure.",
    "Students learn how turning forces work around a pivot and why some objects are more balanced than others.",
  ],
  sourceFile: "lib/curriculum/year7/science/chapters/07-motion-and-pressure.ts",
};
