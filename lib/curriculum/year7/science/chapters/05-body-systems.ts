import { Year7ScienceChapter } from "../types";

export const bodySystemsChapter: Year7ScienceChapter = {
  slug: "biological-science-body-systems",
  order: 5,
  unitTitle: "Biological Science: Body Systems",
  shortTitle: "Body Systems",
  strand: "Biological Science",
  weekRange: "Weeks 11-12",
  lessons: [
    {
      week: "11",
      lessonCode: "11.1",
      title: "Levels of organization",
    },
    {
      week: "11",
      lessonCode: "11.2",
      title: "Skeleton",
    },
    {
      week: "11",
      lessonCode: "11.3",
      title: "Movement: joints & muscles",
    },
    {
      week: "12",
      lessonCode: "12.1",
      title: "Breathing: lungs and gas exchange",
    },
    {
      week: "12",
      lessonCode: "12.2",
      title: "Aerobic respiration",
    },
    {
      week: "12",
      lessonCode: "12.3",
      title: "Anaerobic respiration",
    },
  ],
  learningOutcomes: [
    "Students observe the level of organization that exists in a multicellular organism.",
    "Students build understanding of organ systems such as respiratory and skeletal systems.",
    "Students find out how the lungs help breathing and how the skeleton does more than expected.",
    "Students learn how energy is transferred from food to cells through respiration.",
    "Students compare aerobic respiration with anaerobic respiration and fermentation.",
  ],
  sourceFile: "lib/curriculum/year7/science/chapters/05-body-systems.ts",
};
