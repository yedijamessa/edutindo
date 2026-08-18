import { redirect } from "next/navigation";
import { ModuleLibraryClient, type LessonStub } from "@/components/admin/module-library-client";
import { listModuleDocuments, listModuleEditorTargets } from "@/lib/module-editor";

export const dynamic = "force-dynamic";

type AdminModulesPageProps = {
  searchParams: Promise<{ lessonId?: string }>;
};

function mapLessonTargetToStub(target: Awaited<ReturnType<typeof listModuleEditorTargets>>[number]): LessonStub {
  return {
    lessonId: target.id,
    lessonTitle: target.title,
    lessonSlug: target.slug,
    lessonCode: String(target.metadata.lessonCode ?? ""),
    week: String(target.metadata.week ?? ""),
    breadcrumbs: target.breadcrumbs,
    subjectTitle: target.breadcrumbs.find((item) => item.nodeType === "subject")?.title ?? "",
    chapterTitle: target.breadcrumbs.find((item) => item.nodeType === "chapter")?.title ?? "",
    schoolSlug: target.breadcrumbs.find((item) => item.nodeType === "school")?.slug ?? "",
    yearSlug: target.breadcrumbs.find((item) => item.nodeType === "year")?.slug ?? "",
    subjectSlug: target.breadcrumbs.find((item) => item.nodeType === "subject")?.slug ?? "",
    chapterSlug: target.breadcrumbs.find((item) => item.nodeType === "chapter")?.slug ?? "",
  };
}

function getLessonDedupeKey(lesson: LessonStub) {
  return [
    lesson.lessonId,
    lesson.lessonSlug,
    lesson.lessonTitle.trim().toLowerCase(),
    lesson.subjectSlug,
    lesson.chapterSlug,
    lesson.schoolSlug,
    lesson.yearSlug,
    lesson.week,
    lesson.lessonCode,
  ].join("|");
}

function dedupeLessons(lessons: LessonStub[]) {
  const seenKeys = new Set<string>();
  const uniqueLessons: LessonStub[] = [];

  for (const lesson of lessons) {
    const key = getLessonDedupeKey(lesson);
    if (seenKeys.has(key)) continue;

    seenKeys.add(key);
    uniqueLessons.push(lesson);
  }

  return uniqueLessons;
}

export default async function AdminModulesPage({ searchParams }: AdminModulesPageProps) {
  const { lessonId } = await searchParams;
  const requestedLessonId = (lessonId || "").trim();
  if (requestedLessonId) {
    redirect(`/admin/module-editor?nodeId=${encodeURIComponent(requestedLessonId)}`);
  }

  const [modules, allTargets] = await Promise.all([
    listModuleDocuments(),
    listModuleEditorTargets(),
  ]);

  const lessons = allTargets
    .filter((target) => target.nodeType === "lesson")
    .map(mapLessonTargetToStub);
  const uniqueLessons = dedupeLessons(lessons);

  const assignedLessonIds = new Set(
    modules.flatMap((module) => module.assignments.map((assignment) => assignment.lessonId))
  );
  const lessonsWithoutModule = uniqueLessons.filter((lesson) => !assignedLessonIds.has(lesson.lessonId));

  return (
    <ModuleLibraryClient
      modules={modules}
      lessons={uniqueLessons}
      lessonsWithoutModule={lessonsWithoutModule}
      initialLessonId={null}
    />
  );
}
