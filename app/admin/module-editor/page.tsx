import Link from "next/link";
import { ModuleEditor } from "@/components/admin/module-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listCurriculumTree } from "@/lib/curriculum-portal";
import { getModuleEditorDocument, listModuleEditorTargets } from "@/lib/module-editor";

export const dynamic = "force-dynamic";

type ModuleEditorPageProps = {
  searchParams: Promise<{ nodeId?: string }>;
};

export default async function AdminModuleEditorPage({ searchParams }: ModuleEditorPageProps) {
  const { nodeId } = await searchParams;
  const tree = await listCurriculumTree();
  const targets = await listModuleEditorTargets();
  const chapterTargets = targets.filter((target) => target.nodeType === "chapter");
  const subjects = tree
    .filter((node) => node.nodeType === "subject")
    .map((node) => ({ id: node.id, title: node.title, slug: node.slug }))
    .sort((left, right) => left.title.localeCompare(right.title));

  if (subjects.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto max-w-4xl p-6 lg:p-8">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>No subjects available yet</CardTitle>
              <CardDescription>
                Create a subject in the curriculum portal first. After that, you can create chapters directly from the module editor.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/admin/curriculum">Open Curriculum Portal</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const initialTarget =
    chapterTargets.find((target) => target.id === (nodeId || "").trim()) ??
    chapterTargets[0] ??
    null;
  const initialDocument = initialTarget ? await getModuleEditorDocument(initialTarget.id) : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-[96rem] p-4 lg:p-6">
        <ModuleEditor
          chapters={chapterTargets}
          subjects={subjects}
          initialChapter={initialTarget}
          initialDocument={initialDocument}
        />
      </main>
    </div>
  );
}
