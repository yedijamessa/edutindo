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

export default async function AdminModulesPage({ searchParams }: AdminModulesPageProps) {
  const { lessonId } = await searchParams;
  const [modules, allTargets] = await Promise.all([
    listModuleDocuments(),
    listModuleEditorTargets(),
  ]);

  const lessons = allTargets
    .filter((target) => target.nodeType === "lesson")
    .map(mapLessonTargetToStub);

  const assignedLessonIds = new Set(
    modules.flatMap((module) => module.assignments.map((assignment) => assignment.lessonId))
  );
  const lessonsWithoutModule = lessons.filter((lesson) => !assignedLessonIds.has(lesson.lessonId));
  const initialLessonId = (lessonId || "").trim() || null;

  return (
    <ModuleLibraryClient
      modules={modules}
      lessons={lessons}
      lessonsWithoutModule={lessonsWithoutModule}
      initialLessonId={initialLessonId}
    />
  );
}
