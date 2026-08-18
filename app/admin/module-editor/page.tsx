import { ModuleEditor } from "@/components/admin/module-editor";
import {
  getAssignedModuleIdForLesson,
  getModuleEditorDocument,
  getModuleEditorTarget,
  listModuleCatalog,
} from "@/lib/module-editor";

export const dynamic = "force-dynamic";

type ModuleEditorPageProps = {
  searchParams: Promise<{
    lessonId?: string;
    moduleId?: string;
    nodeId?: string;
    subjectSlug?: string;
    chapterSlug?: string;
    new?: string;
  }>;
};

function text(value: unknown) {
  return String(value ?? "").trim();
}

export default async function AdminModuleEditorPage({ searchParams }: ModuleEditorPageProps) {
  const { lessonId, moduleId, nodeId, subjectSlug, chapterSlug, new: newMode } = await searchParams;
  const requestedLessonId = (lessonId || "").trim();
  const requestedModuleId = (moduleId || "").trim();
  const requestedNodeId = (nodeId || requestedLessonId || "").trim();
  const requestedSubjectSlug = (subjectSlug || "").trim();
  const requestedChapterSlug = (chapterSlug || "").trim();
  const requestedNewMode = (newMode || "").trim() === "1";

  const resolvedModuleId =
    requestedModuleId ||
    (requestedNodeId ? await getAssignedModuleIdForLesson(requestedNodeId) : null) ||
    null;

  const [initialDocument, catalog, requestedTarget] = await Promise.all([
    resolvedModuleId ? getModuleEditorDocument(resolvedModuleId) : Promise.resolve(null),
    listModuleCatalog(),
    requestedNodeId ? getModuleEditorTarget(requestedNodeId) : Promise.resolve(null),
  ]);

  const targetSubject = requestedTarget?.breadcrumbs.find((item) => item.nodeType === "subject") ?? null;
  const targetChapter = requestedTarget?.breadcrumbs.find((item) => item.nodeType === "chapter") ?? null;
  const catalogModules = catalog.flatMap((subject) =>
    subject.chapters.flatMap((chapter) => chapter.modules)
  );
  const selectedCatalogModule =
    (resolvedModuleId ? catalogModules.find((module) => module.moduleId === resolvedModuleId) : null) ?? null;
  const activeSubjectSlug =
    requestedSubjectSlug ||
    initialDocument?.subjectSlug ||
    selectedCatalogModule?.subjectSlug ||
    targetSubject?.slug ||
    null;
  const activeChapterSlug =
    requestedChapterSlug ||
    initialDocument?.chapterSlug ||
    selectedCatalogModule?.chapterSlug ||
    targetChapter?.slug ||
    null;
  const activeSubject =
    (activeSubjectSlug ? catalog.find((subject) => subject.slug === activeSubjectSlug) : null) ?? null;
  const activeChapter =
    activeSubject && activeChapterSlug
      ? activeSubject.chapters.find((chapter) => chapter.slug === activeChapterSlug) ?? null
      : null;
  const activeSubjectTitle =
    activeSubject?.title || initialDocument?.subjectTitle || selectedCatalogModule?.subjectTitle || targetSubject?.title || "";
  const activeChapterTitle =
    activeChapter?.title || initialDocument?.chapterTitle || selectedCatalogModule?.chapterTitle || targetChapter?.title || "";
  const shouldCreateFromLesson =
    Boolean(requestedNodeId && !resolvedModuleId && requestedTarget?.nodeType === "lesson" && activeSubjectSlug && activeChapterSlug);
  const shouldRenderEditor = Boolean(resolvedModuleId || shouldCreateFromLesson || (requestedNewMode && activeSubject && activeChapter));

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fdf8ee_0%,#f6f9ff_18%,#f3f7ff_100%)]">
      <main className="portal-page-width space-y-6 px-4 py-5 lg:px-6 lg:py-6">
        {shouldRenderEditor ? (
          <ModuleEditor
            initialModuleId={initialDocument?.id ?? null}
            initialDocument={initialDocument}
            initialLessonId={shouldCreateFromLesson && requestedTarget ? requestedTarget.id : null}
            initialTitle={requestedTarget?.title ?? ""}
            initialModuleCode={text(requestedTarget?.metadata.lessonCode)}
            initialUniqueIdentifier={text(requestedTarget?.metadata.uniqueIdentifier)}
            subjectSlug={activeSubjectSlug}
            subjectTitle={activeSubjectTitle}
            chapterSlug={activeChapterSlug}
            chapterTitle={activeChapterTitle}
          />
        ) : (
          <section className="rounded-[30px] border border-[#edf2fb] bg-white/92 p-6 shadow-[0_30px_70px_-60px_rgba(15,23,42,0.35)]">
            <h2 className="text-2xl font-black tracking-tight text-slate-950">Choose what you want to edit</h2>
            <p className="mt-2 max-w-3xl text-[15px] leading-7 text-slate-500">
              Start with a subject and chapter above, then open an existing module or create a new one in that catalog
              chapter.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
