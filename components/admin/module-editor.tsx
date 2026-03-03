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
  ModuleEditorBlock,
  ModuleEditorDocument,
  ModuleEditorPage,
  ModuleEditorQuizBlock,
  ModuleEditorTarget,
} from "@/types/module-editor";

interface ModuleEditorProps {
  targets: ModuleEditorTarget[];
  initialTarget: ModuleEditorTarget;
  initialDocument: ModuleEditorDocument;
}

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
  const options = Array.from({ length: 4 }, (_, index) => ({
    id: createId(),
    text: `Option ${index + 1}`,
  }));

  return {
    id: createId(),
    type: "quiz",
    prompt: "",
    options,
    correctOptionId: options[0]?.id ?? "",
    explanation: "",
  };
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
  return `${target.nodeType === "chapter" ? "Chapter" : "Module"}: ${target.title}`;
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
              <div>
                <p className="text-sm font-semibold text-slate-900">{block.prompt || "Quiz question"}</p>
              </div>
              <div className="space-y-2">
                {block.options.map((option) => (
                  <div
                    key={option.id}
                    className={cn(
                      "rounded-2xl border px-3 py-2 text-sm",
                      option.id === block.correctOptionId
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-slate-200 bg-slate-50 text-slate-700"
                    )}
                  >
                    {option.text || "Untitled option"}
                  </div>
                ))}
              </div>
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

export function ModuleEditor({ targets, initialTarget, initialDocument }: ModuleEditorProps) {
  const router = useRouter();
  const [target, setTarget] = useState(initialTarget);
  const [title, setTitle] = useState(initialDocument.title);
  const [pages, setPages] = useState(initialDocument.pages);
  const [selectedPageId, setSelectedPageId] = useState(initialDocument.pages[0]?.id ?? "");
  const [updatedAt, setUpdatedAt] = useState<string | null>(initialDocument.updatedAt);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    setTarget(initialTarget);
    setTitle(initialDocument.title);
    setPages(initialDocument.pages);
    setSelectedPageId(initialDocument.pages[0]?.id ?? "");
    setUpdatedAt(initialDocument.updatedAt);
    setSaving(false);
    setDirty(false);
    setMessage("");
    setError("");
  }, [initialDocument, initialTarget]);

  useEffect(() => {
    if (pages.some((page) => page.id === selectedPageId)) return;
    setSelectedPageId(pages[0]?.id ?? "");
  }, [pages, selectedPageId]);

  const selectedPage = useMemo(
    () => pages.find((page) => page.id === selectedPageId) ?? pages[0] ?? null,
    [pages, selectedPageId]
  );

  const chapterTargets = useMemo(
    () => targets.filter((item) => item.nodeType === "chapter"),
    [targets]
  );
  const moduleTargets = useMemo(
    () => targets.filter((item) => item.nodeType === "lesson"),
    [targets]
  );

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

  const saveDocument = async () => {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/admin/module-editor/${target.id}`, {
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

      setTitle(data.document.title);
      setPages(data.document.pages);
      setUpdatedAt(data.document.updatedAt);
      setDirty(false);
      setMessage("Testing module saved.");
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
              <Badge variant="secondary">Testing Editor</Badge>
              <Badge variant="outline">{target.nodeType === "chapter" ? "Chapter" : "Module"}</Badge>
              <Badge variant="outline">{pages.length} page{pages.length === 1 ? "" : "s"}</Badge>
            </div>
            <div>
              <CardTitle className="text-2xl">Module Editor</CardTitle>
              <CardDescription>
                Build page-by-page content with text, image, and quiz blocks for a chapter or module.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              {target.breadcrumbs.map((item, index) => (
                <span key={item.id} className="flex items-center gap-2">
                  {index > 0 && <span className="text-slate-300">/</span>}
                  <span className={cn(index === target.breadcrumbs.length - 1 && "font-medium text-slate-800")}>
                    {item.title}
                  </span>
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="outline">
              <Link href="/admin/curriculum">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Curriculum
              </Link>
            </Button>
            <Button onClick={saveDocument} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Draft"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4 text-sm">
          <div className="min-w-[18rem] flex-1 space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Editor target
            </label>
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              value={target.id}
              onChange={(event) => {
                const nextTargetId = event.target.value;
                router.push(`/admin/module-editor?nodeId=${encodeURIComponent(nextTargetId)}`);
              }}
            >
              {chapterTargets.length > 0 && (
                <optgroup label={`Chapters (${chapterTargets.length})`}>
                  {chapterTargets.map((item) => (
                    <option key={item.id} value={item.id}>
                      {targetLabel(item)}
                    </option>
                  ))}
                </optgroup>
              )}
              {moduleTargets.length > 0 && (
                <optgroup label={`Modules (${moduleTargets.length})`}>
                  {moduleTargets.map((item) => (
                    <option key={item.id} value={item.id}>
                      {targetLabel(item)}
                    </option>
                  ))}
                </optgroup>
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
            <CardDescription>Each page becomes one step in the testing module flow.</CardDescription>
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

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                Options
                              </label>
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
                            </div>

                            {block.options.map((option, optionIndex) => (
                              <div key={option.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant={block.correctOptionId === option.id ? "default" : "outline"}
                                    onClick={() =>
                                      updateBlock(block.id, (current) => ({
                                        ...(current.type === "quiz" ? current : createQuizBlock()),
                                        id: block.id,
                                        correctOptionId: option.id,
                                      }))
                                    }
                                  >
                                    {block.correctOptionId === option.id ? "Correct" : "Mark correct"}
                                  </Button>
                                  <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                                    Option {optionIndex + 1}
                                  </span>
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
                                        return {
                                          ...quizBlock,
                                          id: block.id,
                                          options: nextOptions,
                                          correctOptionId:
                                            quizBlock.correctOptionId === option.id
                                              ? nextOptions[0]?.id ?? ""
                                              : quizBlock.correctOptionId,
                                        };
                                      })
                                    }
                                    disabled={block.options.length <= 2}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
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
                                />
                              </div>
                            ))}
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                              Explanation
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
                              placeholder="Explain why the correct answer is correct."
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
                ? `${selectedPage.title || "Untitled page"} in ${title || target.title}`
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
    </div>
  );
}
