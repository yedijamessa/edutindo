import { ModuleEditorSelector } from "@/components/admin/module-editor-selector";
import { ModuleEditor } from "@/components/admin/module-editor";
import { getAssignedModuleIdForLesson, getModuleEditorDocument, listModuleCatalog } from "@/lib/module-editor";

export const dynamic = "force-dynamic";

type ModuleEditorPageProps = {
  searchParams: Promise<{
    moduleId?: string;
    nodeId?: string;
    subjectSlug?: string;
    chapterSlug?: string;
    new?: string;
  }>;
};

export default async function AdminModuleEditorPage({ searchParams }: ModuleEditorPageProps) {
  const { moduleId, nodeId, subjectSlug, chapterSlug, new: newMode } = await searchParams;
  const requestedModuleId = (moduleId || "").trim();
  const requestedNodeId = (nodeId || "").trim();
  const requestedSubjectSlug = (subjectSlug || "").trim();
  const requestedChapterSlug = (chapterSlug || "").trim();
  const requestedNewMode = (newMode || "").trim() === "1";

  const resolvedModuleId =
    requestedModuleId ||
    (requestedNodeId ? await getAssignedModuleIdForLesson(requestedNodeId) : null) ||
    null;

  const [initialDocument, catalog] = await Promise.all([
    resolvedModuleId ? getModuleEditorDocument(resolvedModuleId) : Promise.resolve(null),
    listModuleCatalog(),
  ]);

  const catalogModules = catalog.flatMap((subject) =>
    subject.chapters.flatMap((chapter) => chapter.modules)
  );
  const selectedCatalogModule =
    (resolvedModuleId ? catalogModules.find((module) => module.moduleId === resolvedModuleId) : null) ?? null;
  const activeSubjectSlug =
    requestedSubjectSlug ||
    initialDocument?.subjectSlug ||
    selectedCatalogModule?.subjectSlug ||
    null;
  const activeChapterSlug =
    requestedChapterSlug ||
    initialDocument?.chapterSlug ||
    selectedCatalogModule?.chapterSlug ||
    null;
  const activeSubject =
    (activeSubjectSlug ? catalog.find((subject) => subject.slug === activeSubjectSlug) : null) ?? null;
  const activeChapter =
    activeSubject && activeChapterSlug
      ? activeSubject.chapters.find((chapter) => chapter.slug === activeChapterSlug) ?? null
      : null;
  const activeSubjectTitle =
    activeSubject?.title || initialDocument?.subjectTitle || selectedCatalogModule?.subjectTitle || "";
  const activeChapterTitle =
    activeChapter?.title || initialDocument?.chapterTitle || selectedCatalogModule?.chapterTitle || "";
  const shouldRenderEditor = Boolean(resolvedModuleId || (requestedNewMode && activeSubject && activeChapter));

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fdf8ee_0%,#f6f9ff_18%,#f3f7ff_100%)]">
      <main className="portal-page-width space-y-6 px-4 py-5 lg:px-6 lg:py-6">
        <ModuleEditorSelector
          subjects={catalog}
          currentSubjectSlug={activeSubjectSlug}
          currentChapterSlug={activeChapterSlug}
          currentModuleId={resolvedModuleId}
          creatingNew={requestedNewMode && !resolvedModuleId}
        />

        {shouldRenderEditor ? (
          <ModuleEditor
            initialModuleId={initialDocument?.id ?? null}
            initialDocument={initialDocument}
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
