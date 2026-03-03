export interface CurriculumLessonContent {
  overview: string;
  focus: string[];
  activities: string[];
  interactiveExperience: boolean;
}

type LessonGuide = Omit<CurriculumLessonContent, "interactiveExperience"> & {
  interactiveExperience?: boolean;
};

const DEFAULT_OVERVIEW =
  "Use this lesson page to build chapter-specific content, activities, and assessments.";

const DEFAULT_FOCUS = [
  "Define the core lesson concept.",
  "Add one practical example.",
  "Check understanding with one quick quiz.",
];

const DEFAULT_ACTIVITIES = [
  "Open with a short concept recap.",
  "Add one observation activity.",
  "Close with an exit-ticket prompt.",
];

const lessonGuides: Record<string, LessonGuide> = {
  "science:introduction-to-cells": {
    overview:
      "Students are introduced to cells as the building blocks of life and begin using observations to compare living things.",
    focus: [
      "Recognize that all living organisms are made of cells.",
      "Describe cells as tiny units with important jobs.",
      "Connect simple observations to the idea of living structures.",
    ],
    activities: [
      "Sort living and non-living examples.",
      "Discuss where cells might be found in plants and animals.",
      "Record one question learners still have about cells.",
    ],
    interactiveExperience: true,
  },
  "science:using-microscopes": {
    overview:
      "Students learn microscope parts, safe handling, and how to focus from low power to high power.",
    focus: [
      "Identify eyepiece, objective lens, stage, and focus knobs.",
      "Set up a slide and begin at low magnification.",
      "Adjust light and focus clearly before increasing magnification.",
    ],
    activities: [
      "Label microscope parts on a diagram.",
      "Practice focusing on prepared slides.",
      "Record one observation from low and high power.",
    ],
  },
  "science:comparing-animal-and-plant-cells": {
    overview:
      "Students compare structures found in plant and animal cells and identify which structures are shared.",
    focus: [
      "Both: membrane, cytoplasm, nucleus.",
      "Plant only: cell wall and chloroplasts.",
      "Function links: structure supports job.",
    ],
    activities: [
      "Build a Venn diagram.",
      "Label a plant cell and an animal cell.",
      "Explain one key difference in one sentence.",
    ],
  },
};

export function getCurriculumLessonContent(subjectSlug: string, lessonSlug: string): CurriculumLessonContent {
  const key = `${subjectSlug}:${lessonSlug}`;
  const guide = lessonGuides[key];

  return {
    overview: guide?.overview ?? DEFAULT_OVERVIEW,
    focus: guide?.focus ?? DEFAULT_FOCUS,
    activities: guide?.activities ?? DEFAULT_ACTIVITIES,
    interactiveExperience: Boolean(guide?.interactiveExperience),
  };
}
