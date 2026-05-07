import { Year7ScienceChapter } from "../types";

export const forcesChapter: Year7ScienceChapter = {
  slug: "physical-science-forces",
  order: 10,
  unitTitle: "Physical Science: Forces",
  shortTitle: "Forces",
  strand: "Physical Science",
  weekRange: "Weeks 24-26",
  lessons: [
    {
      week: "24",
      lessonCode: "1.1",
      title: "Introduction to forces",
    },
    {
      week: "24",
      lessonCode: "1.2",
      title: "Squashing and stretching",
    },
    {
      week: "24",
      lessonCode: "1.3",
      title: "Drag forces and friction",
    },
    {
      week: "25",
      lessonCode: "1.4",
      title: "Forces at a distance",
    },
    {
      week: "25",
      lessonCode: "1.5",
      title: "Balanced and unbalanced",
    },
    {
      week: "25",
      lessonCode: "1.6",
      title: "Forces practical investigation",
    },
    {
      week: "26",
      lessonCode: "1.7",
      title: "Reading week and report writing",
    },
    {
      week: "26",
      lessonCode: "1.8",
      title: "Presenting force investigations",
    },
    {
      week: "26",
      lessonCode: "1.9",
      title: "What have I learned about forces?",
    },
  ],
  learningOutcomes: [
    "Students learn about different types of force and where they come from.",
    "Students study contact forces and non-contact forces.",
    "Students understand the effects of forces and how we know forces are there.",
    "Students explain the motion of objects using forces and arrows.",
  ],
  sourceFile: "lib/curriculum/year7/science/chapters/04-forces.ts",
};
