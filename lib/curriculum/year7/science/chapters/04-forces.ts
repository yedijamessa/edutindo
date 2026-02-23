import { Year7ScienceChapter } from "../types";

export const forcesChapter: Year7ScienceChapter = {
  slug: "physical-science-forces",
  order: 4,
  unitTitle: "Physical Science: Forces",
  shortTitle: "Forces",
  strand: "Physical Science",
  weekRange: "Weeks 8-10",
  lessons: [
    {
      week: "8",
      lessonCode: "8.1",
      title: "Introduction to forces",
    },
    {
      week: "8",
      lessonCode: "8.2",
      title: "Squashing and stretching",
    },
    {
      week: "8",
      lessonCode: "8.3",
      title: "Drag force and friction",
    },
    {
      week: "9",
      lessonCode: "9.1",
      title: "Forces at distance",
    },
    {
      week: "9",
      lessonCode: "9.2",
      title: "Balanced and unbalanced: what is the difference?",
    },
    {
      week: "9",
      lessonCode: "9.3",
      title:
        "Force experiment: balanced and unbalanced with toy car, stretching (elastic deformation), compression, bending or breaking (plastic deformation)",
    },
    {
      week: "10",
      lessonCode: "10.1",
      title: "Reading week + writing report",
    },
    {
      week: "10",
      lessonCode: "10.2",
      title: "Presentation",
    },
    {
      week: "10",
      lessonCode: "10.3",
      title: "Review and discussion - forces",
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
