import { notFound } from "next/navigation";
import {
  ContentSandboxClient,
  type ContentSandboxMode,
  type SandboxModule,
  type SandboxNode,
} from "@/components/admin/content-sandbox-client";
import { listCurriculumTree, type CurriculumNode } from "@/lib/curriculum-portal";
import { listModuleDocuments, type ModuleListEntry } from "@/lib/module-editor";

export const dynamic = "force-dynamic";

type ContentSandboxPageProps = {
  params: Promise<{ mode: string }>;
};

const validModes = new Set<ContentSandboxMode>(["curriculum", "chapter", "module"]);

function serializeNode(node: CurriculumNode): SandboxNode {
  return {
    id: node.id,
    parentId: node.parentId,
    nodeType: node.nodeType,
    title: node.title,
    slug: node.slug,
    position: node.position,
    metadata: node.metadata,
    children: node.children.map(serializeNode),
  };
}

function serializeModule(module: ModuleListEntry): SandboxModule {
  return {
    moduleId: module.moduleId,
    moduleTitle: module.moduleTitle,
    moduleCode: module.moduleCode,
    uniqueIdentifier: module.uniqueIdentifier,
    pageCount: module.pageCount,
    subjectSlug: module.subjectSlug,
    subjectTitle: module.subjectTitle,
    chapterSlug: module.chapterSlug,
    chapterTitle: module.chapterTitle,
    assignments: module.assignments.map((assignment) => ({
      lessonId: assignment.lessonId,
      lessonTitle: assignment.lessonTitle,
      subjectSlug: assignment.subjectSlug,
      chapterSlug: assignment.chapterSlug,
    })),
  };
}

export default async function ContentSandboxPage({ params }: ContentSandboxPageProps) {
  const { mode } = await params;

  if (!validModes.has(mode as ContentSandboxMode)) {
    notFound();
  }

  const [tree, modules] = await Promise.all([listCurriculumTree(), listModuleDocuments()]);

  return (
    <ContentSandboxClient
      mode={mode as ContentSandboxMode}
      initialTree={tree.map(serializeNode)}
      initialModules={modules.map(serializeModule)}
    />
  );
}
