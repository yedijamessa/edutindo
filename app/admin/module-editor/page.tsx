import Link from "next/link";
import { ModuleEditor } from "@/components/admin/module-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getModuleEditorDocument, listModuleEditorTargets } from "@/lib/module-editor";

export const dynamic = "force-dynamic";

type ModuleEditorPageProps = {
  searchParams: Promise<{ nodeId?: string }>;
};

export default async function AdminModuleEditorPage({ searchParams }: ModuleEditorPageProps) {
  const { nodeId } = await searchParams;
  const targets = await listModuleEditorTargets();

  if (targets.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto max-w-4xl p-6 lg:p-8">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>No editor targets yet</CardTitle>
              <CardDescription>
                Create a chapter or module in the curriculum portal first, then come back here.
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
    targets.find((target) => target.id === (nodeId || "").trim()) ??
    targets.find((target) => target.nodeType === "lesson") ??
    targets[0];

  const initialDocument = await getModuleEditorDocument(initialTarget.id);

  if (!initialDocument) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto max-w-4xl p-6 lg:p-8">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Editor target not found</CardTitle>
              <CardDescription>
                The requested chapter or module could not be loaded.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/admin/curriculum">Back to Curriculum</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-[96rem] p-4 lg:p-6">
        <ModuleEditor
          targets={targets}
          initialTarget={initialTarget}
          initialDocument={initialDocument}
        />
      </main>
    </div>
  );
}
