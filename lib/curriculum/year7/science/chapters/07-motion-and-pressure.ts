import { Year7ScienceChapter } from "../types";

export const motionAndPressureChapter: Year7ScienceChapter = {
  slug: "physical-science-motion-and-pressure",
  order: 13,
  unitTitle: "Physical Science: Motion and Pressure",
  shortTitle: "Motion and Pressure",
  strand: "Physical Science",
  weekRange: "Weeks 31-33",
  lessons: [
    {
      week: "31",
      lessonCode: "4.1",
      title: "Speed",
    },
    {
      week: "31",
      lessonCode: "4.2",
      title: "Motion graphs",
    },
    {
      week: "32",
      lessonCode: "4.3",
      title: "Pressure in gases",
    },
    {
      week: "32",
      lessonCode: "4.4",
      title: "Pressure in liquids",
    },
    {
      week: "32",
      lessonCode: "4.5",
      title: "Pressure on solids",
    },
    {
      week: "33",
      lessonCode: "4.6",
      title: "Turning forces",
    },
    {
      week: "33",
      lessonCode: "4.7",
      title: "What have I learned about motion and pressure?",
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
