import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  Microscope,
  PencilLine,
  Sparkles,
} from "lucide-react";
import { LessonExportButton } from "@/components/lms/lesson-export-button";
import { IntroductionToCellsFunnel } from "@/components/lms/lessons/introduction-to-cells-funnel";
import { ModuleDocumentView } from "@/components/lms/module-document-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurriculumLessonContent } from "@/lib/curriculum-lesson-content";
import { buildCurriculumMaterialsHref } from "@/lib/curriculum-navigation";
import { getCurriculumLessonContext } from "@/lib/curriculum-portal";
import { getAssignedModuleDocumentForLesson } from "@/lib/module-editor";

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
  const schoolMaterialsPath = buildCurriculumMaterialsHref(role, { schoolSlug: school.slug });
  const yearMaterialsPath = buildCurriculumMaterialsHref(role, {
    schoolSlug: school.slug,
    yearSlug: year.slug,
  });
  const subjectMaterialsPath = buildCurriculumMaterialsHref(role, {
    schoolSlug: school.slug,
    yearSlug: year.slug,
    subjectSlug: subject.slug,
  });
  const lessonContent = getCurriculumLessonContent(subject.slug, lesson.slug);
  const moduleDocument = await getAssignedModuleDocumentForLesson(lesson.id);
  const isIntroCellsLesson = lessonContent.interactiveExperience && !moduleDocument;
  const postTestAvailable =
    role === "student" && !nextLesson && Boolean(chapter.postTestEnabled) && Boolean(chapter.postTestQuizId);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7faff_0%,#eef4ff_50%,#f9fbff_100%)] dark:bg-[linear-gradient(180deg,#020617_0%,#0f172a_55%,#020617_100%)]">
      <main className="portal-page-width px-4 pb-16 pt-5 sm:px-6 lg:px-8">
        {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 overflow-auto text-xs text-slate-400">
          <Link href={materialsPath} className="hover:text-slate-700 transition-colors whitespace-nowrap">
            Learning Materials
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <Link href={schoolMaterialsPath} className="hover:text-slate-700 transition-colors whitespace-nowrap text-slate-500">
            {school.title}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <Link href={yearMaterialsPath} className="hover:text-slate-700 transition-colors whitespace-nowrap text-slate-500">
            {year.title}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <Link href={subjectMaterialsPath} className="hover:text-slate-700 transition-colors whitespace-nowrap text-slate-500">
            {subject.title}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <Link href={chapterPath} className="hover:text-slate-700 transition-colors whitespace-nowrap text-slate-500">
            {chapter.title}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <span className="font-semibold text-slate-800 whitespace-nowrap">
            {lesson.lessonCode || lesson.title}
          </span>
        </div>

        {/* ── Lesson header card ─────────────────────────────────────────── */}
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4 rounded-[28px] border border-white/70 bg-white/90 px-7 py-6 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.35)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ff7a1a]">
              {lesson.lessonCode || "Lesson"}
            </p>
            <h1 className="text-[2rem] font-black tracking-tight text-slate-950 dark:text-slate-50">
              {lesson.title}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-300">
              {subject.title} / {chapter.title}
            </p>
          </div>

          {role === "admin" ? (
            <div className="flex flex-wrap items-center gap-3">
              <Button
                asChild
                variant="outline"
                className="h-10 rounded-full border-[#d9e1ef] bg-white px-4 text-slate-700 shadow-none hover:border-[#c6d4f3] hover:bg-[#f7faff]"
              >
                <Link href={`/admin/modules?lessonId=${encodeURIComponent(lesson.id)}`}>
                  <PencilLine className="mr-2 h-4 w-4" />
                  Manage Module Assignment
                </Link>
              </Button>
              {moduleDocument && (
                <Button
                  asChild
                  variant="outline"
                  className="h-10 rounded-full border-[#d9e1ef] bg-white px-4 text-slate-700 shadow-none hover:border-[#c6d4f3] hover:bg-[#f7faff]"
                >
                  <Link href={`/admin/module-editor?moduleId=${encodeURIComponent(moduleDocument.id)}`}>
                    <PencilLine className="mr-2 h-4 w-4" />
                    Edit Assigned Module
                  </Link>
                </Button>
              )}
              <LessonExportButton
                exportPath={`${chapterPath}/${lesson.slug}/export`}
                lessonTitle={lesson.title}
                buttonLabel="Export Module"
              />
            </div>
          ) : null}
        </div>

        {/* ── Content area ───────────────────────────────────────────────── */}
        <div className="mt-5">
          {isIntroCellsLesson ? (
            <IntroductionToCellsFunnel />
          ) : moduleDocument ? (
            <ModuleDocumentView
              document={moduleDocument}
              showAnswers={role !== "student"}
              meta={{
                lessonCode: lesson.lessonCode ?? undefined,
                chapterTitle: chapter.title,
                weekRange: chapter.weekRange ?? undefined,
              }}
            />
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              <Card className="rounded-[24px] border-[#e5ecf8] bg-white shadow-[0_20px_48px_-40px_rgba(15,23,42,0.3)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Microscope className="h-5 w-5 text-[#2f6fff]" />
                    Lesson Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-700">{lessonContent.overview}</p>
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

              <Card className="rounded-[24px] border-[#e5ecf8] bg-white shadow-[0_20px_48px_-40px_rgba(15,23,42,0.3)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    Suggested Activities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {lessonContent.activities.map((activity) => (
                    <div
                      key={activity}
                      className="rounded-[14px] border border-[#e8eef8] bg-slate-50 p-3 text-sm text-slate-700"
                    >
                      {activity}
                    </div>
                  ))}
                  <Button asChild variant="outline" className="w-full rounded-full">
                    <Link href={chapterPath}>
                      Return to Lesson Plan
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {postTestAvailable && (
          <Card className="mt-5 rounded-[24px] border-emerald-200 bg-emerald-50">
            <CardHeader>
              <CardTitle>Post-test</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href={`/student/quizzes/${chapter.postTestQuizId}`}>Start Post-test</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ── Bottom navigation ──────────────────────────────────────────── */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          {previousLesson ? (
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-full border-[#d9e1ef] bg-white px-5 text-slate-700 shadow-none hover:border-[#c6d4f3] hover:bg-[#f7faff] dark:border-slate-700 dark:bg-slate-900"
            >
              <Link href={`${chapterPath}/${previousLesson.slug}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Lesson {previousLesson.lessonCode || previousLesson.title}
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-full border-[#d9e1ef] bg-white px-5 text-slate-700 shadow-none hover:border-[#c6d4f3] hover:bg-[#f7faff] dark:border-slate-700 dark:bg-slate-900"
            >
              <Link href={chapterPath}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Chapter
              </Link>
            </Button>
          )}

          {nextLesson ? (
            <Button
              asChild
              className="h-11 rounded-full bg-[linear-gradient(135deg,#2f6fff_0%,#1d4ed8_100%)] px-5 text-white shadow-[0_16px_32px_-20px_rgba(37,99,235,0.85)] hover:brightness-105"
            >
              <Link href={`${chapterPath}/${nextLesson.slug}`}>
                Next Lesson {nextLesson.lessonCode || nextLesson.title}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              className="h-11 rounded-full bg-[linear-gradient(135deg,#2f6fff_0%,#1d4ed8_100%)] px-5 text-white shadow-[0_16px_32px_-20px_rgba(37,99,235,0.85)] hover:brightness-105"
            >
              <Link href={chapterPath}>Finish Lesson Series</Link>
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
