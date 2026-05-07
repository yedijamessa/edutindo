import { listModuleDocuments } from "@/lib/module-editor";
import { listModuleEditorTargets } from "@/lib/module-editor";
import { ModuleLibraryClient } from "@/components/admin/module-library-client";

export const dynamic = "force-dynamic";

export default async function AdminModulesPage() {
  const [modules, allTargets] = await Promise.all([
    listModuleDocuments(),
    listModuleEditorTargets(),
  ]);

  // Build the list of lessons WITHOUT a module from allTargets
  const moduledNodeIds = new Set(modules.map((m) => m.nodeId));
  const lessonsWithoutModule = allTargets
    .filter((t) => t.nodeType === "lesson" && !moduledNodeIds.has(t.id))
    .map((t) => ({
      nodeId: t.id,
      lessonTitle: t.title,
      lessonSlug: t.slug,
      lessonCode: String(t.metadata.lessonCode ?? ""),
      week: String(t.metadata.week ?? ""),
      breadcrumbs: t.breadcrumbs,
      subjectTitle: t.breadcrumbs.find((b) => b.nodeType === "subject")?.title ?? "",
      chapterTitle: t.breadcrumbs.find((b) => b.nodeType === "chapter")?.title ?? "",
      schoolSlug: t.breadcrumbs.find((b) => b.nodeType === "school")?.slug ?? "",
      yearSlug: t.breadcrumbs.find((b) => b.nodeType === "year")?.slug ?? "",
      subjectSlug: t.breadcrumbs.find((b) => b.nodeType === "subject")?.slug ?? "",
      chapterSlug: t.breadcrumbs.find((b) => b.nodeType === "chapter")?.slug ?? "",
    }));

  return (
    <ModuleLibraryClient
      modules={modules}
      lessonsWithoutModule={lessonsWithoutModule}
    />
  );
}
