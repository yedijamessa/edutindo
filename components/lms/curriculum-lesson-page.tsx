import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, ChevronLeft, ChevronRight, Microscope, Sparkles } from "lucide-react";
import { IntroductionToCellsFunnel } from "@/components/lms/lessons/introduction-to-cells-funnel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurriculumLessonContext } from "@/lib/curriculum-portal";

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
};

interface CurriculumLessonPageProps {
  schoolSlug?: string;
  yearSlug: string;
  subjectSlug: string;
  chapterSlug: string;
  lessonSlug: string;
  role: ChapterPortalRole;
}

export async function CurriculumLessonPage({
  schoolSlug,
  yearSlug,
  subjectSlug,
  chapterSlug,
  lessonSlug,
  role,
}: CurriculumLessonPageProps) {
  const context = await getCurriculumLessonContext({
    schoolSlug,
    yearSlug,
    subjectSlug,
    chapterSlug,
    lessonSlug,
  });

  if (!context) {
    notFound();
  }

  const { school, year, subject, chapter, lesson, previousLesson, nextLesson } = context;

  const chapterPath = `/${role}/materials/curriculum/${school.slug}/${year.slug}/${subject.slug}/${chapter.slug}`;
  const materialsPath = `/${role}/materials`;
  const guide = lessonGuides[lesson.slug] ?? null;
  const isIntroCellsLesson = subject.slug === "science" && lesson.slug === "introduction-to-cells";
  const postTestAvailable =
    role === "student" && !nextLesson && Boolean(chapter.postTestEnabled) && Boolean(chapter.postTestQuizId);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <main className="p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex items-center gap-2 overflow-auto text-sm text-muted-foreground">
            <Link href={materialsPath} className="hover:text-foreground transition-colors whitespace-nowrap">
              Learning Materials
            </Link>
            <ChevronRight className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">{school.title}</span>
            <ChevronRight className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">{year.title}</span>
            <ChevronRight className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">{subject.title}</span>
            <ChevronRight className="h-4 w-4 shrink-0" />
            <Link href={chapterPath} className="hover:text-foreground transition-colors whitespace-nowrap">
              {chapter.title}
            </Link>
            <ChevronRight className="h-4 w-4 shrink-0" />
            <span className="font-medium text-foreground whitespace-nowrap">
              {lesson.lessonCode || lesson.title}
            </span>
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

          {postTestAvailable && (
            <Card className="border-emerald-200 bg-emerald-50">
              <CardHeader>
                <CardTitle>Post-test</CardTitle>
                <CardDescription>
                  You have reached the final lesson. Take the post-test to measure your progress.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href={`/student/quizzes/${chapter.postTestQuizId}`}>Start Post-test</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            {previousLesson ? (
              <Button asChild variant="outline">
                <Link href={`${chapterPath}/${previousLesson.slug}`}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Lesson {previousLesson.lessonCode || previousLesson.title}
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
                  Lesson {nextLesson.lessonCode || nextLesson.title}
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
