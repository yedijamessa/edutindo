import "server-only";

import { randomUUID } from "crypto";
import {
  ensureCurriculumReady,
  getCurriculumNodeLineage,
  listCurriculumTree,
  type CurriculumNode,
} from "@/lib/curriculum-portal";
import { sqlQuery as sql } from "@/lib/postgres-query";
import type {
  ModuleEditorBlock,
  ModuleEditorBreadcrumb,
  ModuleEditorDocument,
  ModuleEditorImageBlock,
  ModuleEditorNodeType,
  ModuleEditorPage,
  ModuleEditorQuizBlock,
  ModuleEditorQuizMatchPair,
  ModuleEditorQuizOption,
  ModuleEditorQuizOrderingItem,
  ModuleEditorQuizType,
  ModuleEditorTarget,
  ModuleEditorTextBlock,
} from "@/types/module-editor";

type ModuleEditorRow = {
  curriculum_node_id: string;
  node_type: string;
  title: string;
  pages: unknown;
  updated_at: Date;
};

let moduleEditorSchemaReady: Promise<void> | null = null;

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sanitizeText(value: unknown, maxLength: number) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function sanitizeLongText(value: unknown, maxLength: number) {
  return String(value ?? "").slice(0, maxLength);
}

function sanitizeUrl(value: unknown) {
  const cleaned = String(value ?? "").trim();
  if (!cleaned) return "";

  try {
    const parsed = new URL(cleaned);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "";
    }
    return parsed.toString();
  } catch {
    return "";
  }
}

function isModuleEditorNodeType(value: string): value is ModuleEditorNodeType {
  return value === "chapter" || value === "lesson";
}

function mapBreadcrumb(node: CurriculumNode): ModuleEditorBreadcrumb {
  return {
    id: node.id,
    title: node.title,
    slug: node.slug,
    nodeType: node.nodeType,
  };
}

function createTextBlock(title = "", body = ""): ModuleEditorTextBlock {
  return {
    id: randomUUID(),
    type: "text",
    title,
    body,
  };
}

function createImageBlock(): ModuleEditorImageBlock {
  return {
    id: randomUUID(),
    type: "image",
    imageUrl: "",
    altText: "",
    caption: "",
  };
}

function createQuizOptions(): ModuleEditorQuizOption[] {
  return [
    { id: randomUUID(), text: "Option 1" },
    { id: randomUUID(), text: "Option 2" },
    { id: randomUUID(), text: "Option 3" },
    { id: randomUUID(), text: "Option 4" },
  ];
}

function createDefaultMatchingPairs(): ModuleEditorQuizMatchPair[] {
  return [
    { id: randomUUID(), prompt: "Prompt 1", match: "Match 1" },
    { id: randomUUID(), prompt: "Prompt 2", match: "Match 2" },
    { id: randomUUID(), prompt: "Prompt 3", match: "Match 3" },
  ];
}

function createDefaultOrderingItems(): ModuleEditorQuizOrderingItem[] {
  return [
    { id: randomUUID(), text: "Step 1" },
    { id: randomUUID(), text: "Step 2" },
    { id: randomUUID(), text: "Step 3" },
    { id: randomUUID(), text: "Step 4" },
  ];
}

function getDefaultOptionsForQuizType(quizType: ModuleEditorQuizType): ModuleEditorQuizOption[] {
  if (quizType === "true-false") {
    return [
      { id: randomUUID(), text: "True" },
      { id: randomUUID(), text: "False" },
    ];
  }

  if (
    quizType === "short-answer" ||
    quizType === "fill-in-the-blank" ||
    quizType === "matching" ||
    quizType === "ordering" ||
    quizType === "essay"
  ) {
    return [];
  }

  return createQuizOptions();
}

function normalizeQuizType(value: unknown): ModuleEditorQuizType {
  const cleaned = sanitizeText(value, 40);

  if (
    cleaned === "multiple-choice-single" ||
    cleaned === "multiple-choice-multiple" ||
    cleaned === "true-false" ||
    cleaned === "short-answer" ||
    cleaned === "fill-in-the-blank" ||
    cleaned === "matching" ||
    cleaned === "ordering" ||
    cleaned === "essay"
  ) {
    return cleaned;
  }

  return "multiple-choice-single";
}

function createQuizBlock(quizType: ModuleEditorQuizType = "multiple-choice-single"): ModuleEditorQuizBlock {
  const options = getDefaultOptionsForQuizType(quizType);
  return {
    id: randomUUID(),
    type: "quiz",
    quizType,
    prompt: "",
    options,
    correctOptionIds: options[0]?.id ? [options[0].id] : [],
    acceptableAnswers: [],
    matchingPairs: quizType === "matching" ? createDefaultMatchingPairs() : [],
    orderingItems: quizType === "ordering" ? createDefaultOrderingItems() : [],
    explanation: "",
  };
}

function createDefaultPage(title: string): ModuleEditorPage {
  return {
    id: randomUUID(),
    title,
    description: "",
    blocks: [createTextBlock(title, "Start building this page here.")],
  };
}

function normalizeQuizOptions(input: unknown): ModuleEditorQuizOption[] {
  const rawOptions = Array.isArray(input) ? input : [];
  const options = rawOptions
    .map((option) => {
      if (!isObjectRecord(option)) return null;
      return {
        id: sanitizeText(option.id, 80) || randomUUID(),
        text: sanitizeText(option.text, 240),
      };
    })
    .filter((option): option is ModuleEditorQuizOption => option !== null)
    .slice(0, 8);

  if (options.length >= 2) {
    return options;
  }

  const fallback = createQuizOptions();
  return fallback.slice(0, 2);
}

function normalizeAcceptableAnswers(input: unknown) {
  if (!Array.isArray(input)) return [];

  return Array.from(
    new Set(
      input
        .map((answer) => sanitizeText(answer, 240))
        .filter((answer) => answer.length > 0)
    )
  ).slice(0, 12);
}

function normalizeMatchingPairs(input: unknown) {
  const rawPairs = Array.isArray(input) ? input : [];
  const pairs = rawPairs
    .map((pair) => {
      if (!isObjectRecord(pair)) return null;

      return {
        id: sanitizeText(pair.id, 80) || randomUUID(),
        prompt: sanitizeText(pair.prompt, 240),
        match: sanitizeText(pair.match, 240),
      };
    })
    .filter((pair): pair is ModuleEditorQuizMatchPair => pair !== null)
    .slice(0, 12);

  if (pairs.length >= 2) {
    return pairs;
  }

  return createDefaultMatchingPairs();
}

function normalizeOrderingItems(input: unknown) {
  const rawItems = Array.isArray(input) ? input : [];
  const items = rawItems
    .map((item) => {
      if (!isObjectRecord(item)) return null;

      return {
        id: sanitizeText(item.id, 80) || randomUUID(),
        text: sanitizeText(item.text, 240),
      };
    })
    .filter((item): item is ModuleEditorQuizOrderingItem => item !== null)
    .slice(0, 12);

  if (items.length >= 2) {
    return items;
  }

  return createDefaultOrderingItems();
}

function normalizeBlock(input: unknown): ModuleEditorBlock | null {
  if (!isObjectRecord(input)) return null;

  const id = sanitizeText(input.id, 80) || randomUUID();
  const type = sanitizeText(input.type, 20);

  if (type === "text") {
    return {
      id,
      type: "text",
      title: sanitizeText(input.title, 180),
      body: sanitizeLongText(input.body, 12000),
    };
  }

  if (type === "image") {
    return {
      id,
      type: "image",
      imageUrl: sanitizeUrl(input.imageUrl),
      altText: sanitizeText(input.altText, 240),
      caption: sanitizeLongText(input.caption, 1000),
    };
  }

  if (type === "quiz") {
    const quizType = normalizeQuizType(input.quizType);
    const usesOptions =
      quizType === "multiple-choice-single" ||
      quizType === "multiple-choice-multiple" ||
      quizType === "true-false";
    const usesAcceptableAnswers = quizType === "short-answer" || quizType === "fill-in-the-blank";
    const usesMatchingPairs = quizType === "matching";
    const usesOrderingItems = quizType === "ordering";
    const options =
      quizType === "true-false"
        ? getDefaultOptionsForQuizType("true-false")
        : usesOptions
          ? normalizeQuizOptions(input.options)
          : [];
    const legacyCorrectOptionId = sanitizeText(input.correctOptionId, 80);
    const requestedCorrectOptionIds = Array.isArray(input.correctOptionIds)
      ? input.correctOptionIds.map((value) => sanitizeText(value, 80)).filter((value) => value.length > 0)
      : legacyCorrectOptionId
        ? [legacyCorrectOptionId]
        : [];
    const matchingCorrectOptionIds = usesOptions
      ? options
          .filter((option) => requestedCorrectOptionIds.includes(option.id))
          .map((option) => option.id)
      : [];
    const acceptableAnswers = usesAcceptableAnswers ? normalizeAcceptableAnswers(input.acceptableAnswers) : [];
    const matchingPairs = usesMatchingPairs ? normalizeMatchingPairs(input.matchingPairs) : [];
    const orderingItems = usesOrderingItems ? normalizeOrderingItems(input.orderingItems) : [];

    const nextCorrectOptionIds =
      quizType === "multiple-choice-multiple"
        ? matchingCorrectOptionIds.length > 0
          ? matchingCorrectOptionIds
          : options[0]?.id
            ? [options[0].id]
            : []
        : usesOptions
          ? matchingCorrectOptionIds[0]
            ? [matchingCorrectOptionIds[0]]
            : options[0]?.id
              ? [options[0].id]
              : []
          : [];

    return {
      id,
      type: "quiz",
      quizType,
      prompt: sanitizeLongText(input.prompt, 3000),
      options,
      correctOptionIds: nextCorrectOptionIds,
      acceptableAnswers,
      matchingPairs,
      orderingItems,
      explanation: sanitizeLongText(input.explanation, 3000),
    };
  }

  return null;
}

function normalizePages(input: unknown, fallbackTitle: string): ModuleEditorPage[] {
  const rawPages = Array.isArray(input) ? input : [];
  const pages = rawPages
    .map((page, index) => {
      if (!isObjectRecord(page)) return null;
      const blocks = Array.isArray(page.blocks)
        ? page.blocks.map(normalizeBlock).filter((block): block is ModuleEditorBlock => block !== null).slice(0, 24)
        : [];

      return {
        id: sanitizeText(page.id, 80) || randomUUID(),
        title: sanitizeText(page.title, 180) || `${fallbackTitle} Page ${index + 1}`,
        description: sanitizeLongText(page.description, 1000),
        blocks: blocks.length > 0 ? blocks : [createTextBlock()],
      };
    })
    .filter((page): page is ModuleEditorPage => page !== null)
    .slice(0, 50);

  if (pages.length > 0) {
    return pages;
  }

  return [createDefaultPage(`${fallbackTitle} Page 1`)];
}

async function ensureModuleEditorSchema() {
  if (moduleEditorSchemaReady) return moduleEditorSchemaReady;

  moduleEditorSchemaReady = (async () => {
    try {
      await ensureCurriculumReady();

      await sql`
        CREATE TABLE IF NOT EXISTS module_editor_documents (
          curriculum_node_id TEXT PRIMARY KEY REFERENCES curriculum_nodes(id) ON DELETE CASCADE,
          node_type TEXT NOT NULL,
          title TEXT NOT NULL DEFAULT '',
          pages JSONB NOT NULL DEFAULT '[]'::jsonb,
          updated_by_user_id TEXT,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS module_editor_documents_node_type_idx
        ON module_editor_documents (node_type, updated_at DESC)
      `;
    } catch (error) {
      moduleEditorSchemaReady = null;
      throw error;
    }
  })();

  return moduleEditorSchemaReady;
}

function mapTargetFromLineage(lineage: CurriculumNode[]): ModuleEditorTarget | null {
  const node = lineage.at(-1);

  if (!node || !isModuleEditorNodeType(node.nodeType)) {
    return null;
  }

  return {
    id: node.id,
    title: node.title,
    slug: node.slug,
    nodeType: node.nodeType,
    parentId: node.parentId,
    metadata: node.metadata,
    breadcrumbs: lineage.map(mapBreadcrumb),
  };
}

export async function listModuleEditorTargets() {
  await ensureModuleEditorSchema();
  const tree = await listCurriculumTree();
  const targets: ModuleEditorTarget[] = [];

  const visit = (node: CurriculumNode, lineage: CurriculumNode[]) => {
    const nextLineage = [...lineage, node];

    if (isModuleEditorNodeType(node.nodeType)) {
      targets.push({
        id: node.id,
        title: node.title,
        slug: node.slug,
        nodeType: node.nodeType,
        parentId: node.parentId,
        metadata: node.metadata,
        breadcrumbs: nextLineage.map(mapBreadcrumb),
      });
    }

    node.children.forEach((child) => visit(child, nextLineage));
  };

  tree.forEach((node) => visit(node, []));

  return targets.sort((left, right) =>
    left.breadcrumbs.map((item) => item.title).join(" / ").localeCompare(
      right.breadcrumbs.map((item) => item.title).join(" / ")
    )
  );
}

export async function getModuleEditorTarget(nodeId: string) {
  await ensureModuleEditorSchema();
  const lineage = await getCurriculumNodeLineage(nodeId);
  return mapTargetFromLineage(lineage);
}

export async function getModuleEditorDocument(nodeId: string): Promise<ModuleEditorDocument | null> {
  await ensureModuleEditorSchema();
  const target = await getModuleEditorTarget(nodeId);

  if (!target) {
    return null;
  }

  const result = await sql<ModuleEditorRow>`
    SELECT
      curriculum_node_id,
      node_type,
      title,
      pages,
      updated_at
    FROM module_editor_documents
    WHERE curriculum_node_id = ${target.id}
    LIMIT 1
  `;

  const row = result.rows[0];
  const pages = normalizePages(row?.pages, target.title);

  return {
    nodeId: target.id,
    nodeType: target.nodeType,
    title: sanitizeText(row?.title ?? target.title, 180) || target.title,
    pages,
    updatedAt: row?.updated_at ? new Date(row.updated_at).toISOString() : null,
  };
}

export async function saveModuleEditorDocument(input: {
  nodeId: string;
  title: unknown;
  pages: unknown;
  actorUserId?: string;
}) {
  await ensureModuleEditorSchema();
  const target = await getModuleEditorTarget(input.nodeId);

  if (!target) {
    throw new Error("Editor target was not found.");
  }

  const title = sanitizeText(input.title, 180) || target.title;
  const pages = normalizePages(input.pages, target.title);
  const actorUserId = sanitizeText(input.actorUserId, 180) || null;

  const result = await sql<ModuleEditorRow>`
    INSERT INTO module_editor_documents (
      curriculum_node_id,
      node_type,
      title,
      pages,
      updated_by_user_id,
      updated_at
    )
    VALUES (
      ${target.id},
      ${target.nodeType},
      ${title},
      ${JSON.stringify(pages)},
      ${actorUserId},
      NOW()
    )
    ON CONFLICT (curriculum_node_id)
    DO UPDATE SET
      node_type = EXCLUDED.node_type,
      title = EXCLUDED.title,
      pages = EXCLUDED.pages,
      updated_by_user_id = EXCLUDED.updated_by_user_id,
      updated_at = NOW()
    RETURNING
      curriculum_node_id,
      node_type,
      title,
      pages,
      updated_at
  `;

  const row = result.rows[0];

  return {
    nodeId: row.curriculum_node_id,
    nodeType: target.nodeType,
    title: row.title,
    pages: normalizePages(row.pages, target.title),
    updatedAt: new Date(row.updated_at).toISOString(),
  } satisfies ModuleEditorDocument;
}
