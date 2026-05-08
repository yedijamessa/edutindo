import { ModuleEditor } from "@/components/admin/module-editor";
import { getAssignedModuleIdForLesson, getModuleEditorDocument } from "@/lib/module-editor";

export const dynamic = "force-dynamic";

type ModuleEditorPageProps = {
  searchParams: Promise<{ moduleId?: string; nodeId?: string }>;
};

export default async function AdminModuleEditorPage({ searchParams }: ModuleEditorPageProps) {
  const { moduleId, nodeId } = await searchParams;
  const requestedModuleId = (moduleId || "").trim();
  const requestedNodeId = (nodeId || "").trim();

  const resolvedModuleId =
    requestedModuleId ||
    (requestedNodeId ? await getAssignedModuleIdForLesson(requestedNodeId) : null) ||
    null;

  const initialDocument = resolvedModuleId ? await getModuleEditorDocument(resolvedModuleId) : null;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fdf8ee_0%,#f6f9ff_18%,#f3f7ff_100%)]">
      <main className="mx-auto max-w-[104rem] px-4 py-5 lg:px-6 lg:py-6">
        <ModuleEditor
          initialModuleId={initialDocument?.id ?? null}
          initialDocument={initialDocument}
        />
      </main>
    </div>
  );
}
