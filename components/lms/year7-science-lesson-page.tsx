import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Microscope,
  Sparkles,
} from "lucide-react";
import { IntroductionToCellsFunnel } from "@/components/lms/lessons/introduction-to-cells-funnel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getYear7ScienceLessonBySlugs } from "@/lib/curriculum/year7/science";

type ChapterPortalRole = "student" | "teacher" | "principal" | "admin";

const lessonGuides: Record<
  string,
  {
    overview: string;
    focus: string[];
    activities: string[];
  }
> = {
  "using-microscopes": {
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
  "comparing-animal-and-plant-cells": {
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
  "investigating-animal-and-plant-cells": {
    overview:
      "Students investigate real slides/images and record evidence of similarities and differences between cell types.",
    focus: [
      "Observe and sketch cell structures.",
      "Use labels correctly for visible parts.",
      "Write evidence-based comparisons.",
    ],
    activities: [
      "Observation table with similarities and differences.",
      "Sketch and annotate one animal and one plant cell.",
      "Short reflection: which cell was easier to identify and why.",
    ],
  },
  "specialized-cells": {
    overview:
      "Students explore how different cells are adapted to different jobs in plants and animals.",
    focus: [
      "Specialized cells have structures that support specific functions.",
      "Examples: nerve, muscle, root hair, guard cells.",
      "Shape and structure connect to function.",
    ],
    activities: [
      "Match cell types to jobs.",
      "Discuss one adaptation per cell type.",
      "Create a quick poster of one specialized cell.",
    ],
  },
  "diffusion-in-cells": {
    overview:
      "Students examine diffusion as the movement of particles from high to low concentration across cell membranes.",
    focus: [
      "Diffusion moves particles down a concentration gradient.",
      "Cell membranes allow movement of selected substances.",
      "Surface area affects diffusion speed.",
    ],
    activities: [
      "Model diffusion with simple simulation or food dye.",
      "Predict direction of movement in sample scenarios.",
      "Explain one real-life diffusion example.",
    ],
  },
  "unicellular-organisms": {
    overview:
      "Students investigate organisms made of one cell and how one cell can carry out life functions.",
    focus: [
      "One cell performs all life processes.",
      "Unicellular examples include bacteria and some protists.",
      "Cell structures still support survival tasks.",
    ],
    activities: [
      "Classify organisms as uni- or multicellular.",
      "Describe one survival feature of a unicellular organism.",
      "Compare one unicellular and one multicellular organism.",
    ],
  },
  "calculating-magnification": {
    overview:
      "Students calculate magnification and connect image size, actual size, and scale.",
    focus: [
      "Magnification = image size / actual size.",
      "Units must match before calculating.",
      "Check reasonableness of final values.",
    ],
    activities: [
      "Solve practice magnification problems.",
      "Convert units before and after calculations.",
      "Explain each step in a worked example.",
    ],
  },
  "review-and-reflect-cells": {
    overview:
      "Students consolidate understanding of cells and identify strengths, misconceptions, and next revision targets.",
    focus: [
      "Review core terms and definitions.",
      "Compare major ideas across the cells unit.",
      "Set one personal improvement target.",
    ],
    activities: [
      "Short mixed quiz.",
      "Correct-and-explain common mistakes.",
      "Write one reflection and one next-step goal.",
    ],
  },
};

interface Year7ScienceLessonPageProps {
  chapterSlug: string;
  lessonSlug: string;
  role: ChapterPortalRole;
}

export function Year7ScienceLessonPage({
  chapterSlug,
  lessonSlug,
  role,
}: Year7ScienceLessonPageProps) {
  const resolved = getYear7ScienceLessonBySlugs(chapterSlug, lessonSlug);
  if (!resolved) {
    notFound();
  }

  const { chapter, lesson } = resolved;

  const lessonsWithSlugs = chapter.lessons.flatMap((item) =>
    item.slug ? [{ ...item, slug: item.slug }] : []
  );
  const currentLessonIndex = lessonsWithSlugs.findIndex((item) => item.slug === lesson.slug);
  const previousLesson = currentLessonIndex > 0 ? lessonsWithSlugs[currentLessonIndex - 1] : null;
  const nextLesson =
    currentLessonIndex < lessonsWithSlugs.length - 1 ? lessonsWithSlugs[currentLessonIndex + 1] : null;

  const chapterPath = `/${role}/materials/year-7/science/${chapter.slug}`;
  const materialsPath = `/${role}/materials`;
  const isIntroCellsLesson = chapter.slug === "biological-science-cells" && lesson.slug === "introduction-to-cells";
  const guide = lesson.slug ? lessonGuides[lesson.slug] : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <main className="p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex items-center gap-2 overflow-auto text-sm text-muted-foreground">
            <Link href={materialsPath} className="hover:text-foreground transition-colors whitespace-nowrap">
              Learning Materials
            </Link>
            <ChevronRight className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">Year 7</span>
            <ChevronRight className="h-4 w-4 shrink-0" />
            <Link href={`/${role}/materials/year-7/science`} className="hover:text-foreground transition-colors whitespace-nowrap">
              Science
            </Link>
            <ChevronRight className="h-4 w-4 shrink-0" />
            <Link href={chapterPath} className="hover:text-foreground transition-colors whitespace-nowrap">
              Chapter {chapter.order}
            </Link>
            <ChevronRight className="h-4 w-4 shrink-0" />
            <span className="font-medium text-foreground whitespace-nowrap">{lesson.lessonCode}</span>
          </div>

          {isIntroCellsLesson ? (
            <IntroductionToCellsFunnel />
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Microscope className="h-5 w-5 text-blue-600" />
                    Lesson Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-700">
                    {guide?.overview ??
                      "Use this lesson page to build chapter-specific content, activities, and assessments."}
                  </p>

                  <div className="space-y-2">
                    <p className="font-semibold text-slate-900">Lesson Focus</p>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                      {(guide?.focus ?? [
                        "Define the core lesson concept.",
                        "Add one practical example.",
                        "Check understanding with one quick quiz.",
                      ]).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    Suggested Activities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(guide?.activities ?? [
                    "Open with a short concept recap.",
                    "Add one observation activity.",
                    "Close with an exit-ticket prompt.",
                  ]).map((activity) => (
                    <div key={activity} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                      {activity}
                    </div>
                  ))}

                  <Button asChild variant="outline" className="w-full">
                    <Link href={chapterPath}>
                      Return to Lesson Plan
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            {previousLesson ? (
              <Button asChild variant="outline">
                <Link href={`${chapterPath}/${previousLesson.slug}`}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Lesson {previousLesson.lessonCode}
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline">
                <Link href={chapterPath}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Chapter
                </Link>
              </Button>
            )}

            {nextLesson ? (
              <Button asChild>
                <Link href={`${chapterPath}/${nextLesson.slug}`}>
                  Lesson {nextLesson.lessonCode}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href={chapterPath}>Finish Lesson Series</Link>
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
