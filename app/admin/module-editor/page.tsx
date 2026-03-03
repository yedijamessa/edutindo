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

type SubjectOption = {
  id: string;
  title: string;
  slug: string;
};

function dedupeByKey<T extends { id: string }>(
  items: T[],
  getKey: (item: T) => string,
  preferredId?: string | null
) {
  const grouped = new Map<string, T[]>();

  for (const item of items) {
    const key = getKey(item);
    const group = grouped.get(key) ?? [];
    group.push(item);
    grouped.set(key, group);
  }

  return [...grouped.values()].map((group) => {
    if (preferredId) {
      const preferred = group.find((item) => item.id === preferredId);
      if (preferred) return preferred;
    }

    return group[0];
  });
}

function getTargetGroupKey(target: Awaited<ReturnType<typeof listModuleEditorTargets>>[number]) {
  const lineageKey = target.breadcrumbs
    .filter((breadcrumb) =>
      breadcrumb.nodeType === "subject" ||
      breadcrumb.nodeType === "chapter" ||
      breadcrumb.nodeType === "lesson"
    )
    .map((breadcrumb) => `${breadcrumb.nodeType}:${breadcrumb.slug}`)
    .join("/");

  return lineageKey || `${target.nodeType}:${target.slug}`;
}

export default async function AdminModuleEditorPage({ searchParams }: ModuleEditorPageProps) {
  const { nodeId } = await searchParams;
  const requestedNodeId = (nodeId || "").trim();
  const tree = await listCurriculumTree();
  const rawTargets = await listModuleEditorTargets();
  const requestedTarget = rawTargets.find((target) => target.id === requestedNodeId) ?? null;
  const targets = dedupeByKey(
    rawTargets,
    getTargetGroupKey,
    requestedTarget?.id ?? null
  );
  const rawSubjects: SubjectOption[] = tree
    .filter((node) => node.nodeType === "subject")
    .map((node) => ({ id: node.id, title: node.title, slug: node.slug }))
    .sort((left, right) => left.title.localeCompare(right.title));
  const subjects = dedupeByKey(rawSubjects, (subject) => subject.slug, requestedTarget?.parentId ?? null);

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
    targets.find((target) => target.id === requestedNodeId) ??
    (requestedTarget
      ? targets.find((target) => getTargetGroupKey(target) === getTargetGroupKey(requestedTarget))
      : null) ??
    targets[0] ??
    null;
  const initialDocument = initialTarget ? await getModuleEditorDocument(initialTarget.id) : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-[96rem] p-4 lg:p-6">
        <ModuleEditor
          targets={targets}
          subjects={subjects}
          initialTarget={initialTarget}
          initialDocument={initialDocument}
        />
      </main>
    </div>
  );
}
