import { introductionChapter } from "./chapters/01-introduction";
import { cellsChapter } from "./chapters/02-cells";
import { acidsAndAlkalisChapter } from "./chapters/03-acids-and-alkalis";
import { forcesChapter } from "./chapters/04-forces";
import { bodySystemsChapter } from "./chapters/05-body-systems";
import { particleBehaviourChapter } from "./chapters/06-particle-behaviour";
import { motionAndPressureChapter } from "./chapters/07-motion-and-pressure";
import { healthAndLifestyleChapter } from "./chapters/08-health-and-lifestyle";
import { elementsAtomsCompoundsChapter } from "./chapters/09-elements-atoms-compounds";
import { soundChapter } from "./chapters/10-sound";
import { periodicTableChapter } from "./chapters/11-periodic-table";
import { lightChapter } from "./chapters/12-light";
import { plantsChapter } from "./chapters/13-plants";
import { spaceChapter } from "./chapters/14-space";
import { finalProjectChapter } from "./chapters/15-final-project";

export type { Year7ScienceChapter, Year7ScienceLesson } from "./types";

export const year7ScienceChapters = [
  introductionChapter,
  cellsChapter,
  acidsAndAlkalisChapter,
  forcesChapter,
  bodySystemsChapter,
  particleBehaviourChapter,
  motionAndPressureChapter,
  healthAndLifestyleChapter,
  elementsAtomsCompoundsChapter,
  soundChapter,
  periodicTableChapter,
  lightChapter,
  plantsChapter,
  spaceChapter,
  finalProjectChapter,
];

export const getYear7ScienceChapterBySlug = (chapterSlug: string) =>
  year7ScienceChapters.find((chapter) => chapter.slug === chapterSlug);

export const YEAR7_SCIENCE_TOTAL_LESSONS = year7ScienceChapters.reduce(
  (total, chapter) => total + chapter.lessons.length,
  0
);
