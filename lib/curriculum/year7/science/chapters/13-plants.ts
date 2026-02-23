import { Year7ScienceChapter } from "../types";

export const plantsChapter: Year7ScienceChapter = {
  slug: "biological-science-plants",
  order: 13,
  unitTitle: "Biological Science: Plants",
  shortTitle: "Plants",
  strand: "Biological Science",
  weekRange: "Weeks 27-28",
  lessons: [
    {
      week: "27",
      lessonCode: "27.1",
      title: "Photosynthesis",
    },
    {
      week: "27",
      lessonCode: "27.2",
      title: "Leaves",
    },
    {
      week: "27",
      lessonCode: "27.3",
      title: "Plant minerals",
    },
    {
      week: "28",
      lessonCode: "28.1",
      title: "Flowers and pollination",
    },
    {
      week: "28",
      lessonCode: "28.2",
      title: "Fertilization and germination",
    },
    {
      week: "28",
      lessonCode: "28.3",
      title: "Seed dispersal",
    },
  ],
  learningOutcomes: [
    "Students learn how plants make food through photosynthesis and why this is vital for life on Earth.",
    "Students study leaf adaptations for photosynthesis.",
    "Students investigate mineral effects on plant growth.",
    "Students examine plant reproduction through pollination, fertilization, and germination.",
    "Students explore different methods of seed dispersal.",
  ],
  sourceFile: "lib/curriculum/year7/science/chapters/13-plants.ts",
};
