export interface Year7ScienceLesson {
  week: string;
  lessonCode: string;
  title: string;
}

export interface Year7ScienceChapter {
  slug: string;
  order: number;
  unitTitle: string;
  shortTitle: string;
  strand: "Introduction" | "Biological Science" | "Chemical Science" | "Physical Science" | "Project";
  weekRange: string;
  lessons: Year7ScienceLesson[];
  learningOutcomes: string[];
  sourceFile: string;
}
