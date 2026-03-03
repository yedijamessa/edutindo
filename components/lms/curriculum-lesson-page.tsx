import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, ChevronLeft, ChevronRight, Microscope, PencilLine, Sparkles } from "lucide-react";
import { LessonExportButton } from "@/components/lms/lesson-export-button";
import { IntroductionToCellsFunnel } from "@/components/lms/lessons/introduction-to-cells-funnel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurriculumLessonContent } from "@/lib/curriculum-lesson-content";
import { getCurriculumLessonContext } from "@/lib/curriculum-portal";

type ChapterPortalRole = "student" | "teacher" | "principal" | "admin";

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
  const lessonContent = getCurriculumLessonContent(subject.slug, lesson.slug);
  const isIntroCellsLesson = lessonContent.interactiveExperience;
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

          <div className="flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {lesson.lessonCode || "Lesson"}
              </p>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">{lesson.title}</h1>
              <p className="text-sm text-slate-600">
                {subject.title} / {chapter.title}
              </p>
            </div>

            {role === "admin" ? (
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild variant="outline">
                  <Link href={`/admin/module-editor?nodeId=${encodeURIComponent(lesson.id)}`}>
                    <PencilLine className="mr-2 h-4 w-4" />
                    Edit Module
                  </Link>
                </Button>
                <LessonExportButton
                  exportPath={`${chapterPath}/${lesson.slug}/export`}
                  lessonTitle={lesson.title}
                  buttonLabel="Export Module"
                />
              </div>
            ) : null}
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
                    {lessonContent.overview}
                  </p>

                  <div className="space-y-2">
                    <p className="font-semibold text-slate-900">Lesson Focus</p>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                      {lessonContent.focus.map((item) => (
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
                  {lessonContent.activities.map((activity) => (
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
