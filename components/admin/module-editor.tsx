"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Expand,
  FileText,
  Image as ImageIcon,
  LayoutTemplate,
  Plus,
  Save,
  Trash2,
  CircleHelp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type {
  ModuleEditorDocument,
  ModuleEditorBlock,
  ModuleEditorPage,
  ModuleEditorQuizBlock,
  ModuleEditorQuizMatchPair,
  ModuleEditorQuizOrderingItem,
  ModuleEditorQuizType,
  ModuleEditorTarget,
} from "@/types/module-editor";

interface SubjectOption {
  id: string;
  title: string;
  slug: string;
}

interface ModuleEditorProps {
  chapters: ModuleEditorTarget[];
  subjects: SubjectOption[];
  initialChapter: ModuleEditorTarget | null;
  initialDocument: ModuleEditorDocument | null;
}

const QUIZ_TYPE_OPTIONS: Array<{ value: ModuleEditorQuizType; label: string }> = [
  { value: "multiple-choice-single", label: "Multiple Choice (select one)" },
  { value: "multiple-choice-multiple", label: "Multiple Choice (select several)" },
  { value: "true-false", label: "True or False" },
  { value: "short-answer", label: "Short Answer" },
  { value: "fill-in-the-blank", label: "Fill in the Blank" },
  { value: "matching", label: "Matching" },
  { value: "ordering", label: "Ordering / Sequence" },
  { value: "essay", label: "Essay / Long response" },
];

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2, 10);
}

function createTextBlock(): ModuleEditorBlock {
  return {
    id: createId(),
    type: "text",
    title: "",
    body: "",
  };
}

function createImageBlock(): ModuleEditorBlock {
  return {
    id: createId(),
    type: "image",
    imageUrl: "",
    altText: "",
    caption: "",
  };
}

function createQuizBlock(): ModuleEditorQuizBlock {
  return createQuizBlockForType("multiple-choice-single");
}

function createQuizOptions() {
  return Array.from({ length: 4 }, (_, index) => ({
    id: createId(),
    text: `Option ${index + 1}`,
  }));
}

function createMatchingPairs(): ModuleEditorQuizMatchPair[] {
  return [
    { id: createId(), prompt: "Prompt 1", match: "Match 1" },
    { id: createId(), prompt: "Prompt 2", match: "Match 2" },
    { id: createId(), prompt: "Prompt 3", match: "Match 3" },
  ];
}

function createOrderingItems(): ModuleEditorQuizOrderingItem[] {
  return [
    { id: createId(), text: "Step 1" },
    { id: createId(), text: "Step 2" },
    { id: createId(), text: "Step 3" },
    { id: createId(), text: "Step 4" },
  ];
}

function getDefaultOptionsForQuizType(quizType: ModuleEditorQuizType) {
  if (quizType === "true-false") {
    return [
      { id: createId(), text: "True" },
      { id: createId(), text: "False" },
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

function getDefaultAcceptableAnswersForQuizType(quizType: ModuleEditorQuizType) {
  if (quizType === "fill-in-the-blank") {
    return [""];
  }

  if (quizType === "short-answer") {
    return [""];
  }

  return [];
}

function createQuizBlockForType(quizType: ModuleEditorQuizType): ModuleEditorQuizBlock {
  const options = getDefaultOptionsForQuizType(quizType);

  return {
    id: createId(),
    type: "quiz",
    quizType,
    prompt: "",
    options,
    correctOptionIds: options[0]?.id ? [options[0].id] : [],
    acceptableAnswers: getDefaultAcceptableAnswersForQuizType(quizType),
    matchingPairs: quizType === "matching" ? createMatchingPairs() : [],
    orderingItems: quizType === "ordering" ? createOrderingItems() : [],
    explanation: "",
  };
}

function usesOptionAnswers(quizType: ModuleEditorQuizType) {
  return (
    quizType === "multiple-choice-single" ||
    quizType === "multiple-choice-multiple" ||
    quizType === "true-false"
  );
}

function usesMultipleCorrectAnswers(quizType: ModuleEditorQuizType) {
  return quizType === "multiple-choice-multiple";
}

function usesAcceptableAnswerInputs(quizType: ModuleEditorQuizType) {
  return quizType === "short-answer" || quizType === "fill-in-the-blank";
}

function usesMatchingPairs(quizType: ModuleEditorQuizType) {
  return quizType === "matching";
}

function usesOrderingItems(quizType: ModuleEditorQuizType) {
  return quizType === "ordering";
}

function isEssayQuiz(quizType: ModuleEditorQuizType) {
  return quizType === "essay";
}

function createPage(index: number): ModuleEditorPage {
  return {
    id: createId(),
    title: `Page ${index}`,
    description: "",
    blocks: [createTextBlock()],
  };
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= items.length) return items;

  const next = [...items];
  const [item] = next.splice(index, 1);
  next.splice(targetIndex, 0, item);
  return next;
}

function formatTimestamp(value: string | null) {
  if (!value) return "Not saved yet";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Saved";

  return parsed.toLocaleString();
}

function targetLabel(target: ModuleEditorTarget) {
  return `Chapter: ${target.title}`;
}

function getQuizTypeLabel(quizType: ModuleEditorQuizType) {
  return QUIZ_TYPE_OPTIONS.find((option) => option.value === quizType)?.label ?? "Quiz";
}

function createInitialPages() {
  return [createPage(1)];
}

function PreviewPageContent({ page }: { page: ModuleEditorPage | null }) {
  if (!page) {
    return <p className="text-sm text-slate-500">No page selected.</p>;
  }

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          {page.title || "Untitled page"}
        </p>
        {page.description && (
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{page.description}</p>
        )}
      </div>

      {page.blocks.map((block) => (
        <div key={block.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          {block.type === "text" && (
            <div className="space-y-3">
              {block.title && <h3 className="text-lg font-semibold text-slate-900">{block.title}</h3>}
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {block.body || "Text content will appear here."}
              </p>
            </div>
          )}

          {block.type === "image" && (
            <div className="space-y-3">
              {block.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={block.imageUrl}
                  alt={block.altText || ""}
                  className="max-h-[32rem] w-full rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
                  Add an image URL to preview it here.
                </div>
              )}
              {block.caption && <p className="text-sm text-slate-600">{block.caption}</p>}
            </div>
          )}

          {block.type === "quiz" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Badge variant="outline">{getQuizTypeLabel(block.quizType)}</Badge>
                <p className="text-sm font-semibold text-slate-900">{block.prompt || "Quiz question"}</p>
              </div>
              {usesOptionAnswers(block.quizType) ? (
                <div className="space-y-2">
                  {block.options.map((option) => (
                    <div
                      key={option.id}
                      className={cn(
                        "rounded-2xl border px-3 py-2 text-sm",
                        block.correctOptionIds.includes(option.id)
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-slate-200 bg-slate-50 text-slate-700"
                      )}
                    >
                      {option.text || "Untitled option"}
                    </div>
                  ))}
                </div>
              ) : usesMatchingPairs(block.quizType) ? (
                <div className="space-y-2">
                  {block.matchingPairs.map((pair, index) => (
                    <div
                      key={pair.id}
                      className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-[1fr_auto_1fr]"
                    >
                      <div className="rounded-xl bg-white px-3 py-2 text-sm text-slate-700">
                        {pair.prompt || `Prompt ${index + 1}`}
                      </div>
                      <div className="flex items-center justify-center text-slate-400">=</div>
                      <div className="rounded-xl bg-white px-3 py-2 text-sm text-slate-700">
                        {pair.match || `Match ${index + 1}`}
                      </div>
                    </div>
                  ))}
                </div>
              ) : usesOrderingItems(block.quizType) ? (
                <div className="space-y-2">
                  {block.orderingItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                    >
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                        {index + 1}
                      </span>
                      <span>{item.text || `Step ${index + 1}`}</span>
                    </div>
                  ))}
                </div>
              ) : usesAcceptableAnswerInputs(block.quizType) ? (
                <div className="space-y-2">
                  {block.acceptableAnswers.filter((answer) => answer.trim().length > 0).length > 0 ? (
                    block.acceptableAnswers
                      .filter((answer) => answer.trim().length > 0)
                      .map((answer, index) => (
                        <div
                          key={`${block.id}-${index}`}
                          className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
                        >
                          {answer}
                        </div>
                      ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                      Add at least one accepted answer.
                    </div>
                  )}
                </div>
              ) : isEssayQuiz(block.quizType) ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-sm text-slate-600">
                  Learners will write a long-form response here.
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                    Configure this quiz block.
                  </div>
                </div>
              )}
              {block.explanation && (
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
                  {block.explanation}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function ModuleEditor({ chapters, subjects, initialChapter, initialDocument }: ModuleEditorProps) {
  const router = useRouter();
  const [availableChapters, setAvailableChapters] = useState(chapters);
  const [chapter, setChapter] = useState<ModuleEditorTarget | null>(initialChapter);
  const [title, setTitle] = useState(initialDocument?.title ?? initialChapter?.title ?? "");
  const [pages, setPages] = useState<ModuleEditorPage[]>(() => initialDocument?.pages ?? createInitialPages());
  const [selectedPageId, setSelectedPageId] = useState(initialDocument?.pages[0]?.id ?? "");
  const [updatedAt, setUpdatedAt] = useState<string | null>(initialDocument?.updatedAt ?? null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveChapterId, setSaveChapterId] = useState(initialChapter?.id ?? "");
  const [showCreateChapter, setShowCreateChapter] = useState(chapters.length === 0);
  const [creatingChapter, setCreatingChapter] = useState(false);
  const [createChapterSubjectId, setCreateChapterSubjectId] = useState(subjects[0]?.id ?? "");
  const [createChapterTitle, setCreateChapterTitle] = useState("");
  const [createChapterError, setCreateChapterError] = useState("");

  useEffect(() => {
    setAvailableChapters(chapters);
    setChapter(initialChapter);
    setTitle(initialDocument?.title ?? initialChapter?.title ?? "");
    const nextPages = initialDocument?.pages ?? createInitialPages();
    setPages(nextPages);
    setSelectedPageId(nextPages[0]?.id ?? "");
    setUpdatedAt(initialDocument?.updatedAt ?? null);
    setSaving(false);
    setDirty(false);
    setMessage("");
    setError("");
    setSaveDialogOpen(false);
    setSaveChapterId(initialChapter?.id ?? "");
    setShowCreateChapter(chapters.length === 0);
    setCreateChapterSubjectId(subjects[0]?.id ?? "");
    setCreateChapterTitle("");
    setCreateChapterError("");
  }, [chapters, initialChapter, initialDocument, subjects]);

  useEffect(() => {
    if (pages.some((page) => page.id === selectedPageId)) return;
    setSelectedPageId(pages[0]?.id ?? "");
  }, [pages, selectedPageId]);

  const selectedPage = useMemo(
    () => pages.find((page) => page.id === selectedPageId) ?? pages[0] ?? null,
    [pages, selectedPageId]
  );
  const selectedSaveChapter = useMemo(
    () => availableChapters.find((item) => item.id === saveChapterId) ?? null,
    [availableChapters, saveChapterId]
  );

  useEffect(() => {
    if (chapter?.id) {
      setSaveChapterId(chapter.id);
      return;
    }

    if (saveChapterId && availableChapters.some((item) => item.id === saveChapterId)) {
      return;
    }

    setSaveChapterId(availableChapters[0]?.id ?? "");
  }, [availableChapters, chapter, saveChapterId]);

  const updatePages = (updater: (current: ModuleEditorPage[]) => ModuleEditorPage[]) => {
    setPages((current) => updater(current));
    setDirty(true);
    setMessage("");
    setError("");
  };

  const updateSelectedPage = (updater: (page: ModuleEditorPage) => ModuleEditorPage) => {
    if (!selectedPage) return;

    updatePages((current) =>
      current.map((page) => (page.id === selectedPage.id ? updater(page) : page))
    );
  };

  const updateBlock = (blockId: string, updater: (block: ModuleEditorBlock) => ModuleEditorBlock) => {
    updateSelectedPage((page) => ({
      ...page,
      blocks: page.blocks.map((block) => (block.id === blockId ? updater(block) : block)),
    }));
  };

  const createChapter = async () => {
    setCreatingChapter(true);
    setCreateChapterError("");

    try {
      const response = await fetch("/api/admin/curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodeType: "chapter",
          parentId: createChapterSubjectId,
          title: createChapterTitle,
          metadata: {},
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok || !data.node) {
        setCreateChapterError(data.error || "Failed to create chapter.");
        return null;
      }

      const subject = subjects.find((item) => item.id === createChapterSubjectId);
      const nextChapter: ModuleEditorTarget = {
        id: data.node.id,
        title: data.node.title,
        slug: data.node.slug,
        nodeType: "chapter",
        parentId: data.node.parentId,
        metadata: data.node.metadata ?? {},
        breadcrumbs: subject
          ? [
              {
                id: subject.id,
                title: subject.title,
                slug: subject.slug,
                nodeType: "subject",
              },
              {
                id: data.node.id,
                title: data.node.title,
                slug: data.node.slug,
                nodeType: "chapter",
              },
            ]
          : [
              {
                id: data.node.id,
                title: data.node.title,
                slug: data.node.slug,
                nodeType: "chapter",
              },
            ],
      };

      setAvailableChapters((current) =>
        [...current, nextChapter].sort((left, right) => left.title.localeCompare(right.title))
      );
      setSaveChapterId(nextChapter.id);
      setShowCreateChapter(false);
      setCreateChapterTitle("");
      setMessage(`Chapter "${nextChapter.title}" created.`);
      return nextChapter;
    } catch (createError) {
      console.error(createError);
      setCreateChapterError("Failed to create chapter.");
      return null;
    } finally {
      setCreatingChapter(false);
    }
  };

  const saveDocument = async (targetChapterId: string) => {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/admin/module-editor/${targetChapterId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          pages,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.error || "Failed to save module editor.");
        return;
      }

      const savedChapter = availableChapters.find((item) => item.id === targetChapterId) ?? null;
      setChapter(savedChapter);
      setTitle(data.document.title);
      setPages(data.document.pages);
      setUpdatedAt(data.document.updatedAt);
      setDirty(false);
      setSaveDialogOpen(false);
      setMessage("Module saved.");
      router.replace(`/admin/module-editor?nodeId=${encodeURIComponent(targetChapterId)}`);
      router.refresh();
    } catch (saveError) {
      console.error(saveError);
      setError("Failed to save module editor.");
    } finally {
      setSaving(false);
    }
  };

  const pageIndex = selectedPage ? pages.findIndex((page) => page.id === selectedPage.id) : -1;

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Module Editor</Badge>
              <Badge variant="outline">Stored Content</Badge>
              <Badge variant="outline">{pages.length} page{pages.length === 1 ? "" : "s"}</Badge>
            </div>
            <div>
              <CardTitle className="text-2xl">Module Editor</CardTitle>
              <CardDescription>
                Build page-by-page content with text, image, and quiz blocks, then store it under a chapter.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              {chapter ? (
                chapter.breadcrumbs.map((item, index) => (
                  <span key={item.id} className="flex items-center gap-2">
                    {index > 0 && <span className="text-slate-300">/</span>}
                    <span className={cn(index === chapter.breadcrumbs.length - 1 && "font-medium text-slate-800")}>
                      {item.title}
                    </span>
                  </span>
                ))
              ) : (
                <span>No chapter selected yet. Choose one when you save.</span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="outline">
              <Link href="/admin/curriculum">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Curriculum
              </Link>
            </Button>
            <Button onClick={() => setSaveDialogOpen(true)} disabled={saving || subjects.length === 0}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Module"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4 text-sm">
          <div className="min-w-[18rem] flex-1 space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Current chapter
            </label>
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              value={chapter?.id ?? ""}
              onChange={(event) => {
                const nextTargetId = event.target.value;
                router.push(`/admin/module-editor?nodeId=${encodeURIComponent(nextTargetId)}`);
              }}
              disabled={availableChapters.length === 0}
            >
              {availableChapters.length === 0 ? (
                <option value="">No chapters yet</option>
              ) : (
                availableChapters.map((item) => (
                  <option key={item.id} value={item.id}>
                    {targetLabel(item)}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="min-w-[14rem] flex-1 space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Document title
            </label>
            <Input
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setDirty(true);
                setMessage("");
              }}
              placeholder="Module title"
            />
          </div>

          <div className="text-xs text-slate-500">
            <p>Last saved: {formatTimestamp(updatedAt)}</p>
            <p>Stored under: {chapter?.title ?? "Choose a chapter when saving"}</p>
            {dirty && <p className="font-medium text-amber-600">Unsaved changes</p>}
            {message && <p className="font-medium text-emerald-600">{message}</p>}
            {error && <p className="font-medium text-red-600">{error}</p>}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[20rem_minmax(0,1fr)_24rem]">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Pages</CardTitle>
            <CardDescription>Each page becomes one step in the saved module flow.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                const nextPage = createPage(pages.length + 1);
                updatePages((current) => [...current, nextPage]);
                setSelectedPageId(nextPage.id);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add page
            </Button>

            <div className="space-y-2">
              {pages.map((page, index) => (
                <div
                  key={page.id}
                  onClick={() => setSelectedPageId(page.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedPageId(page.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className={cn(
                    "w-full rounded-2xl border px-3 py-3 text-left transition-colors",
                    page.id === selectedPageId
                      ? "border-blue-200 bg-blue-50"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{page.title || `Page ${index + 1}`}</p>
                      <p className="mt-1 text-xs text-slate-500">{page.blocks.length} block{page.blocks.length === 1 ? "" : "s"}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={(event) => {
                          event.stopPropagation();
                          updatePages((current) => moveItem(current, index, -1));
                        }}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={(event) => {
                          event.stopPropagation();
                          updatePages((current) => moveItem(current, index, 1));
                        }}
                        disabled={index === pages.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={(event) => {
                          event.stopPropagation();
                          if (pages.length <= 1) return;
                          updatePages((current) => current.filter((item) => item.id !== page.id));
                        }}
                        disabled={pages.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {selectedPage ? (
            <>
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-base">Page Settings</CardTitle>
                  <CardDescription>Set the label students will see before the content blocks.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Page title
                      </label>
                      <Input
                        value={selectedPage.title}
                        onChange={(event) =>
                          updateSelectedPage((page) => ({ ...page, title: event.target.value }))
                        }
                        placeholder="Page title"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Position
                      </label>
                      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                        <LayoutTemplate className="h-4 w-4" />
                        Page {pageIndex + 1}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Intro note
                    </label>
                    <Textarea
                      value={selectedPage.description}
                      onChange={(event) =>
                        updateSelectedPage((page) => ({ ...page, description: event.target.value }))
                      }
                      placeholder="Short teacher note or student instruction for this page."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-base">Blocks</CardTitle>
                  <CardDescription>Mix content types inside the current page.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        updateSelectedPage((page) => ({ ...page, blocks: [...page.blocks, createTextBlock()] }))
                      }
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Add Text
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        updateSelectedPage((page) => ({ ...page, blocks: [...page.blocks, createImageBlock()] }))
                      }
                    >
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Add Image
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        updateSelectedPage((page) => ({ ...page, blocks: [...page.blocks, createQuizBlock()] }))
                      }
                    >
                      <CircleHelp className="mr-2 h-4 w-4" />
                      Add Quiz
                    </Button>
                  </div>

                  {selectedPage.blocks.map((block, index) => (
                    <div key={block.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{block.type}</Badge>
                          <span className="text-sm font-medium text-slate-700">Block {index + 1}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() =>
                              updateSelectedPage((page) => ({
                                ...page,
                                blocks: moveItem(page.blocks, index, -1),
                              }))
                            }
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() =>
                              updateSelectedPage((page) => ({
                                ...page,
                                blocks: moveItem(page.blocks, index, 1),
                              }))
                            }
                            disabled={index === selectedPage.blocks.length - 1}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                            onClick={() =>
                              updateSelectedPage((page) => ({
                                ...page,
                                blocks:
                                  page.blocks.length > 1
                                    ? page.blocks.filter((item) => item.id !== block.id)
                                    : [createTextBlock()],
                              }))
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {block.type === "text" && (
                        <div className="mt-4 space-y-4">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                              Heading
                            </label>
                            <Input
                              value={block.title}
                              onChange={(event) =>
                                updateBlock(block.id, (current) => ({
                                  ...current,
                                  type: "text",
                                  title: event.target.value,
                                  body: current.type === "text" ? current.body : "",
                                }))
                              }
                              placeholder="Section heading"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                              Body
                            </label>
                            <Textarea
                              value={block.body}
                              onChange={(event) =>
                                updateBlock(block.id, (current) => ({
                                  ...current,
                                  type: "text",
                                  title: current.type === "text" ? current.title : "",
                                  body: event.target.value,
                                }))
                              }
                              rows={8}
                              placeholder="Write the teaching content here."
                            />
                          </div>
                        </div>
                      )}

                      {block.type === "image" && (
                        <div className="mt-4 grid gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                              Image URL
                            </label>
                            <Input
                              value={block.imageUrl}
                              onChange={(event) =>
                                updateBlock(block.id, (current) => ({
                                  ...current,
                                  type: "image",
                                  imageUrl: event.target.value,
                                  altText: current.type === "image" ? current.altText : "",
                                  caption: current.type === "image" ? current.caption : "",
                                }))
                              }
                              placeholder="https://..."
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                              Alt text
                            </label>
                            <Input
                              value={block.altText}
                              onChange={(event) =>
                                updateBlock(block.id, (current) => ({
                                  ...current,
                                  type: "image",
                                  imageUrl: current.type === "image" ? current.imageUrl : "",
                                  altText: event.target.value,
                                  caption: current.type === "image" ? current.caption : "",
                                }))
                              }
                              placeholder="What should screen readers announce?"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                              Caption
                            </label>
                            <Textarea
                              value={block.caption}
                              onChange={(event) =>
                                updateBlock(block.id, (current) => ({
                                  ...current,
                                  type: "image",
                                  imageUrl: current.type === "image" ? current.imageUrl : "",
                                  altText: current.type === "image" ? current.altText : "",
                                  caption: event.target.value,
                                }))
                              }
                              rows={3}
                              placeholder="Add context for the image."
                            />
                          </div>
                        </div>
                      )}

                      {block.type === "quiz" && (
                        <div className="mt-4 space-y-4">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                              Quiz type
                            </label>
                            <select
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                              value={block.quizType}
                              onChange={(event) =>
                                updateBlock(block.id, (current) => {
                                  const currentQuizBlock = current.type === "quiz" ? current : createQuizBlock();
                                  const nextQuizType = event.target.value as ModuleEditorQuizType;
                                  const nextQuizBlock = createQuizBlockForType(nextQuizType);

                                  return {
                                    ...nextQuizBlock,
                                    id: block.id,
                                    prompt: currentQuizBlock.prompt,
                                    explanation: currentQuizBlock.explanation,
                                  };
                                })
                              }
                            >
                              {QUIZ_TYPE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                              Question
                            </label>
                            <Textarea
                              value={block.prompt}
                              onChange={(event) =>
                                updateBlock(block.id, (current) => ({
                                  ...(current.type === "quiz" ? current : createQuizBlock()),
                                  id: block.id,
                                  prompt: event.target.value,
                                }))
                              }
                              rows={4}
                              placeholder="What should the learner answer?"
                            />
                          </div>

                          {usesOptionAnswers(block.quizType) && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                    Options
                                  </label>
                                  <p className="mt-1 text-xs text-slate-500">
                                    {usesMultipleCorrectAnswers(block.quizType)
                                      ? "Mark every correct answer."
                                      : "Mark one correct answer."}
                                  </p>
                                </div>
                                {block.quizType !== "true-false" && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      updateBlock(block.id, (current) => {
                                        const quizBlock = current.type === "quiz" ? current : createQuizBlock();
                                        return {
                                          ...quizBlock,
                                          id: block.id,
                                          options: [...quizBlock.options, { id: createId(), text: "" }].slice(0, 8),
                                        };
                                      })
                                    }
                                  >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add option
                                  </Button>
                                )}
                              </div>

                              {block.options.map((option, optionIndex) => {
                                const isCorrect = block.correctOptionIds.includes(option.id);

                                return (
                                  <div key={option.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant={isCorrect ? "default" : "outline"}
                                        onClick={() =>
                                          updateBlock(block.id, (current) => {
                                            const quizBlock = current.type === "quiz" ? current : createQuizBlock();
                                            const currentlySelected = quizBlock.correctOptionIds.includes(option.id);

                                            return {
                                              ...quizBlock,
                                              id: block.id,
                                              correctOptionIds: usesMultipleCorrectAnswers(quizBlock.quizType)
                                                ? currentlySelected
                                                  ? quizBlock.correctOptionIds.length > 1
                                                    ? quizBlock.correctOptionIds.filter((value) => value !== option.id)
                                                    : quizBlock.correctOptionIds
                                                  : [...quizBlock.correctOptionIds, option.id]
                                                : [option.id],
                                            };
                                          })
                                        }
                                      >
                                        {isCorrect
                                          ? "Correct"
                                          : usesMultipleCorrectAnswers(block.quizType)
                                            ? "Add correct"
                                            : "Mark correct"}
                                      </Button>
                                      <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                                        Option {optionIndex + 1}
                                      </span>
                                      {block.quizType !== "true-false" && (
                                        <Button
                                          type="button"
                                          size="icon"
                                          variant="ghost"
                                          className="ml-auto h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                                          onClick={() =>
                                            updateBlock(block.id, (current) => {
                                              const quizBlock = current.type === "quiz" ? current : createQuizBlock();
                                              if (quizBlock.options.length <= 2) return quizBlock;

                                              const nextOptions = quizBlock.options.filter((item) => item.id !== option.id);
                                              const nextCorrectOptionIds = quizBlock.correctOptionIds.filter(
                                                (value) => value !== option.id
                                              );

                                              return {
                                                ...quizBlock,
                                                id: block.id,
                                                options: nextOptions,
                                                correctOptionIds:
                                                  nextCorrectOptionIds.length > 0
                                                    ? nextCorrectOptionIds
                                                    : nextOptions[0]?.id
                                                      ? [nextOptions[0].id]
                                                      : [],
                                              };
                                            })
                                          }
                                          disabled={block.options.length <= 2}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                    <Input
                                      className="mt-3"
                                      value={option.text}
                                      onChange={(event) =>
                                        updateBlock(block.id, (current) => {
                                          const quizBlock = current.type === "quiz" ? current : createQuizBlock();
                                          return {
                                            ...quizBlock,
                                            id: block.id,
                                            options: quizBlock.options.map((item) =>
                                              item.id === option.id ? { ...item, text: event.target.value } : item
                                            ),
                                          };
                                        })
                                      }
                                      placeholder={`Option ${optionIndex + 1}`}
                                      disabled={block.quizType === "true-false"}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {usesAcceptableAnswerInputs(block.quizType) && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                    Accepted answers
                                  </label>
                                  <p className="mt-1 text-xs text-slate-500">
                                    Add one or more answers that should count as correct.
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    updateBlock(block.id, (current) => {
                                      const quizBlock = current.type === "quiz" ? current : createQuizBlock();
                                      return {
                                        ...quizBlock,
                                        id: block.id,
                                        acceptableAnswers: [...quizBlock.acceptableAnswers, ""].slice(0, 12),
                                      };
                                    })
                                  }
                                >
                                  <Plus className="mr-2 h-4 w-4" />
                                  Add answer
                                </Button>
                              </div>

                              {(block.acceptableAnswers.length > 0 ? block.acceptableAnswers : [""]).map(
                                (answer, answerIndex) => (
                                  <div
                                    key={`${block.id}-answer-${answerIndex}`}
                                    className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                                  >
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                                        Answer {answerIndex + 1}
                                      </span>
                                      <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        className="ml-auto h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                                        onClick={() =>
                                          updateBlock(block.id, (current) => {
                                            const quizBlock = current.type === "quiz" ? current : createQuizBlock();
                                            const nextAnswers = quizBlock.acceptableAnswers.filter(
                                              (_, index) => index !== answerIndex
                                            );
                                            return {
                                              ...quizBlock,
                                              id: block.id,
                                              acceptableAnswers: nextAnswers,
                                            };
                                          })
                                        }
                                        disabled={block.acceptableAnswers.length <= 1}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    <Input
                                      className="mt-3"
                                      value={answer}
                                      onChange={(event) =>
                                        updateBlock(block.id, (current) => {
                                          const quizBlock = current.type === "quiz" ? current : createQuizBlock();
                                          const baseAnswers =
                                            quizBlock.acceptableAnswers.length > 0 ? quizBlock.acceptableAnswers : [""];
                                          return {
                                            ...quizBlock,
                                            id: block.id,
                                            acceptableAnswers: baseAnswers.map((item, index) =>
                                              index === answerIndex ? event.target.value : item
                                            ),
                                          };
                                        })
                                      }
                                      placeholder={
                                        block.quizType === "fill-in-the-blank"
                                          ? "Expected word or phrase"
                                          : "Accepted short answer"
                                      }
                                    />
                                  </div>
                                )
                              )}
                            </div>
                          )}

                          {usesMatchingPairs(block.quizType) && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                    Matching pairs
                                  </label>
                                  <p className="mt-1 text-xs text-slate-500">
                                    Each row defines one correct match.
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    updateBlock(block.id, (current) => {
                                      const quizBlock = current.type === "quiz" ? current : createQuizBlock();
                                      return {
                                        ...quizBlock,
                                        id: block.id,
                                        matchingPairs: [
                                          ...quizBlock.matchingPairs,
                                          { id: createId(), prompt: "", match: "" },
                                        ].slice(0, 12),
                                      };
                                    })
                                  }
                                >
                                  <Plus className="mr-2 h-4 w-4" />
                                  Add pair
                                </Button>
                              </div>

                              {block.matchingPairs.map((pair, pairIndex) => (
                                <div key={pair.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                                      Pair {pairIndex + 1}
                                    </span>
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="ghost"
                                      className="ml-auto h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                                      onClick={() =>
                                        updateBlock(block.id, (current) => {
                                          const quizBlock = current.type === "quiz" ? current : createQuizBlock();
                                          if (quizBlock.matchingPairs.length <= 2) return quizBlock;

                                          return {
                                            ...quizBlock,
                                            id: block.id,
                                            matchingPairs: quizBlock.matchingPairs.filter((item) => item.id !== pair.id),
                                          };
                                        })
                                      }
                                      disabled={block.matchingPairs.length <= 2}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                                    <Input
                                      value={pair.prompt}
                                      onChange={(event) =>
                                        updateBlock(block.id, (current) => {
                                          const quizBlock = current.type === "quiz" ? current : createQuizBlock();
                                          return {
                                            ...quizBlock,
                                            id: block.id,
                                            matchingPairs: quizBlock.matchingPairs.map((item) =>
                                              item.id === pair.id ? { ...item, prompt: event.target.value } : item
                                            ),
                                          };
                                        })
                                      }
                                      placeholder="Left prompt"
                                    />
                                    <Input
                                      value={pair.match}
                                      onChange={(event) =>
                                        updateBlock(block.id, (current) => {
                                          const quizBlock = current.type === "quiz" ? current : createQuizBlock();
                                          return {
                                            ...quizBlock,
                                            id: block.id,
                                            matchingPairs: quizBlock.matchingPairs.map((item) =>
                                              item.id === pair.id ? { ...item, match: event.target.value } : item
                                            ),
                                          };
                                        })
                                      }
                                      placeholder="Right match"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {usesOrderingItems(block.quizType) && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                    Correct sequence
                                  </label>
                                  <p className="mt-1 text-xs text-slate-500">
                                    Arrange these items in the correct order.
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    updateBlock(block.id, (current) => {
                                      const quizBlock = current.type === "quiz" ? current : createQuizBlock();
                                      return {
                                        ...quizBlock,
                                        id: block.id,
                                        orderingItems: [...quizBlock.orderingItems, { id: createId(), text: "" }].slice(
                                          0,
                                          12
                                        ),
                                      };
                                    })
                                  }
                                >
                                  <Plus className="mr-2 h-4 w-4" />
                                  Add step
                                </Button>
                              </div>

                              {block.orderingItems.map((item, itemIndex) => (
                                <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                                      Step {itemIndex + 1}
                                    </span>
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="ghost"
                                      className="ml-auto h-8 w-8"
                                      onClick={() =>
                                        updateBlock(block.id, (current) => {
                                          const quizBlock = current.type === "quiz" ? current : createQuizBlock();
                                          return {
                                            ...quizBlock,
                                            id: block.id,
                                            orderingItems: moveItem(quizBlock.orderingItems, itemIndex, -1),
                                          };
                                        })
                                      }
                                      disabled={itemIndex === 0}
                                    >
                                      <ArrowUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8"
                                      onClick={() =>
                                        updateBlock(block.id, (current) => {
                                          const quizBlock = current.type === "quiz" ? current : createQuizBlock();
                                          return {
                                            ...quizBlock,
                                            id: block.id,
                                            orderingItems: moveItem(quizBlock.orderingItems, itemIndex, 1),
                                          };
                                        })
                                      }
                                      disabled={itemIndex === block.orderingItems.length - 1}
                                    >
                                      <ArrowDown className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                                      onClick={() =>
                                        updateBlock(block.id, (current) => {
                                          const quizBlock = current.type === "quiz" ? current : createQuizBlock();
                                          if (quizBlock.orderingItems.length <= 2) return quizBlock;

                                          return {
                                            ...quizBlock,
                                            id: block.id,
                                            orderingItems: quizBlock.orderingItems.filter((entry) => entry.id !== item.id),
                                          };
                                        })
                                      }
                                      disabled={block.orderingItems.length <= 2}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <Input
                                    className="mt-3"
                                    value={item.text}
                                    onChange={(event) =>
                                      updateBlock(block.id, (current) => {
                                        const quizBlock = current.type === "quiz" ? current : createQuizBlock();
                                        return {
                                          ...quizBlock,
                                          id: block.id,
                                          orderingItems: quizBlock.orderingItems.map((entry) =>
                                            entry.id === item.id ? { ...entry, text: event.target.value } : entry
                                          ),
                                        };
                                      })
                                    }
                                    placeholder={`Step ${itemIndex + 1}`}
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          {isEssayQuiz(block.quizType) && (
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                              Essay questions do not need fixed answers here. Use the field below to add rubric notes,
                              model-answer guidance, or teacher marking instructions.
                            </div>
                          )}

                          <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                              {isEssayQuiz(block.quizType) ? "Rubric / marking notes" : "Explanation"}
                            </label>
                            <Textarea
                              value={block.explanation}
                              onChange={(event) =>
                                updateBlock(block.id, (current) => ({
                                  ...(current.type === "quiz" ? current : createQuizBlock()),
                                  id: block.id,
                                  explanation: event.target.value,
                                }))
                              }
                              rows={3}
                              placeholder={
                                isEssayQuiz(block.quizType)
                                  ? "Add marking criteria, rubric notes, or model answer guidance."
                                  : "Explain why the correct answer is correct."
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-dashed border-slate-300 bg-slate-50">
              <CardContent className="p-6 text-sm text-slate-500">
                Add a page to start building the module.
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base">Preview</CardTitle>
                <CardDescription>Quick admin-side preview of the current page.</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => setPreviewOpen(true)} disabled={!selectedPage}>
                <Expand className="mr-2 h-4 w-4" />
                Pop Out
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <PreviewPageContent page={selectedPage} />
          </CardContent>
        </Card>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="h-[92vh] max-w-[min(96vw,82rem)] grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-3xl p-0">
          <DialogHeader className="border-b border-slate-200 px-6 py-5">
            <DialogTitle className="text-xl">Full Preview</DialogTitle>
            <DialogDescription>
              {selectedPage
                ? `${selectedPage.title || "Untitled page"} in ${title || chapter?.title || "module draft"}`
                : "No page selected."}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto bg-slate-50 px-6 py-6">
            <div className="mx-auto max-w-4xl">
              <PreviewPageContent page={selectedPage} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="max-w-2xl rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Save Module</DialogTitle>
            <DialogDescription>
              Which chapter should this module be stored under?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Chapter
              </label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                value={saveChapterId}
                onChange={(event) => setSaveChapterId(event.target.value)}
                disabled={availableChapters.length === 0}
              >
                {availableChapters.length === 0 ? (
                  <option value="">No chapters available</option>
                ) : (
                  availableChapters.map((item) => (
                    <option key={item.id} value={item.id}>
                      {targetLabel(item)}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Need a new chapter?</p>
                  <p className="text-sm text-slate-600">
                    Create it here and save this module straight into it.
                  </p>
                </div>
                <Button
                  type="button"
                  variant={showCreateChapter ? "default" : "outline"}
                  onClick={() => {
                    setShowCreateChapter((current) => !current);
                    setCreateChapterError("");
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Chapter
                </Button>
              </div>

              {showCreateChapter && (
                <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1.2fr]">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Subject
                    </label>
                    <select
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                      value={createChapterSubjectId}
                      onChange={(event) => setCreateChapterSubjectId(event.target.value)}
                    >
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      New chapter title
                    </label>
                    <Input
                      value={createChapterTitle}
                      onChange={(event) => setCreateChapterTitle(event.target.value)}
                      placeholder="Example: Cells and Microscopes"
                    />
                  </div>

                  <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm text-slate-500">
                      {createChapterError && <p className="font-medium text-red-600">{createChapterError}</p>}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={creatingChapter || !createChapterSubjectId || !createChapterTitle.trim()}
                      onClick={() => {
                        void createChapter();
                      }}
                    >
                      {creatingChapter ? "Creating..." : "Create Chapter"}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {selectedSaveChapter && (
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                This draft will be stored under <strong>{selectedSaveChapter.title}</strong>.
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setSaveDialogOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (!saveChapterId) {
                    setError("Choose a chapter before saving.");
                    return;
                  }
                  void saveDocument(saveChapterId);
                }}
                disabled={saving || !saveChapterId}
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save to Chapter"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
