import { Year7ScienceChapter } from "../types";

export const soundChapter: Year7ScienceChapter = {
  slug: "physical-science-sound",
  order: 10,
  unitTitle: "Physical Science: Sound",
  shortTitle: "Sound",
  strand: "Physical Science",
  weekRange: "Weeks 21-22",
  lessons: [
    {
      week: "21",
      lessonCode: "21.1",
      title: "Introduction of waves and sound",
    },
    {
      week: "21",
      lessonCode: "21.2",
      title: "Loudness and pitch",
    },
    {
      week: "21",
      lessonCode: "21.3",
      title: "Detecting sound",
    },
    {
      week: "22",
      lessonCode: "22.1",
      title: "Echoes and ultrasound",
    },
    {
      week: "22",
      lessonCode: "22.2",
      title: "Experiment: measuring sound vibration using rice grain",
    },
    {
      week: "22",
      lessonCode: "22.3",
      title: "Paper writing",
    },
  ],
  learningOutcomes: [
    "Students learn about sound, how it is produced, how it travels, and its speed.",
    "Students discover how wave properties of sound explain how we hear.",
    "Students study practical uses of sound and ultrasound in daily life.",
  ],
  sourceFile: "lib/curriculum/year7/science/chapters/10-sound.ts",
};
