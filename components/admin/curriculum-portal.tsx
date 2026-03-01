"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import Link from "next/link";
import { ArrowLeft, GripVertical, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type NodeType = "year" | "subject" | "chapter" | "lesson";

type CurriculumNode = {
  id: string;
  parentId: string | null;
  nodeType: NodeType;
  title: string;
  slug: string;
  position: number;
  metadata: Record<string, unknown>;
  children: CurriculumNode[];
};

type DragState = {
  nodeId: string;
  parentId: string | null;
  nodeType: NodeType;
};

const nodeLabelByType: Record<NodeType, string> = {
  year: "Year",
  subject: "Subject",
  chapter: "Chapter",
  lesson: "Module",
};

const childHintByType: Record<NodeType, string> = {
  year: "subjects",
  subject: "chapters",
  chapter: "modules",
  lesson: "items",
};

const YEAR_OPTIONS = ["Year 7", "Year 8", "Year 9"] as const;
const SUBJECT_OPTIONS = ["Science", "IT", "Christian Studies", "Math", "English"] as const;

function reorderIds(ids: string[], draggedId: string, targetId: string | null) {
  const next = ids.filter((id) => id !== draggedId);
  const targetIndex = targetId ? next.indexOf(targetId) : next.length;
  const safeIndex = targetIndex < 0 ? next.length : targetIndex;
  next.splice(safeIndex, 0, draggedId);
  return next;
}

function hasSameOrder(left: string[], right: string[]) {
  if (left.length !== right.length) return false;
  return left.every((id, index) => id === right[index]);
}

function text(value: unknown) {
  return String(value ?? "").trim();
}

function sameLabel(left: string, right: string) {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

interface NodeColumnProps {
  title: string;
  description: string;
  nodeType: NodeType;
  parentId: string | null;
  nodes: CurriculumNode[];
  selectedId: string | null;
  disabled: boolean;
  addDisabledReason: string;
  draftTitle: string;
  draftWeekRange: string;
  draftWeek: string;
  draftLessonCode: string;
  busy: boolean;
  onDraftTitleChange: (value: string) => void;
  onDraftWeekRangeChange: (value: string) => void;
  onDraftWeekChange: (value: string) => void;
  onDraftLessonCodeChange: (value: string) => void;
  onSelect: (nodeId: string) => void;
  onCreate: () => void;
  onRename: (node: CurriculumNode) => void;
  onDelete: (node: CurriculumNode) => void;
  onDragStart: (node: CurriculumNode, event: DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
  canDropOnNode: (targetNode: CurriculumNode) => boolean;
  canDropAtEnd: (parentId: string | null) => boolean;
  onDropOnNode: (targetNode: CurriculumNode, siblingNodes: CurriculumNode[]) => void;
  onDropAtEnd: (parentId: string | null, siblingNodes: CurriculumNode[]) => void;
  chapterWeekDrafts?: Record<string, string>;
  chapterWeekBusyId?: string | null;
  onChapterWeekDraftChange?: (chapterId: string, value: string) => void;
  onSaveChapterWeek?: (chapter: CurriculumNode) => void;
  lessonPreviewBasePath?: string | null;
}

function NodeColumn({
  title,
  description,
  nodeType,
  parentId,
  nodes,
  selectedId,
  disabled,
  addDisabledReason,
  draftTitle,
  draftWeekRange,
  draftWeek,
  draftLessonCode,
  busy,
  onDraftTitleChange,
  onDraftWeekRangeChange,
  onDraftWeekChange,
  onDraftLessonCodeChange,
  onSelect,
  onCreate,
  onRename,
  onDelete,
  onDragStart,
  onDragEnd,
  canDropOnNode,
  canDropAtEnd,
  onDropOnNode,
  onDropAtEnd,
  chapterWeekDrafts,
  chapterWeekBusyId,
  onChapterWeekDraftChange,
  onSaveChapterWeek,
  lessonPreviewBasePath,
}: NodeColumnProps) {
  const label = nodeLabelByType[nodeType];

  return (
    <Card className="h-full border-slate-200">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{title}</CardTitle>
          <Badge variant="secondary">{nodes.length}</Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (disabled || busy) return;
            onCreate();
          }}
          className="space-y-2"
        >
          <Input
            value={draftTitle}
            onChange={(event) => onDraftTitleChange(event.target.value)}
            placeholder={`Add ${label.toLowerCase()} title...`}
            disabled={disabled || busy}
          />

          {nodeType === "chapter" && (
            <Input
              value={draftWeekRange}
              onChange={(event) => onDraftWeekRangeChange(event.target.value)}
              placeholder="Week range (example: Weeks 2-4)"
              disabled={disabled || busy}
            />
          )}

          {nodeType === "lesson" && (
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={draftWeek}
                onChange={(event) => onDraftWeekChange(event.target.value)}
                placeholder="Week (example: 2)"
                disabled={disabled || busy}
              />
              <Input
                value={draftLessonCode}
                onChange={(event) => onDraftLessonCodeChange(event.target.value)}
                placeholder="Module code (example: 2.1)"
                disabled={disabled || busy}
              />
            </div>
          )}

          <Button
            type="submit"
            size="sm"
            className="w-full"
            disabled={disabled || busy || draftTitle.trim().length === 0}
          >
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Add {label}
          </Button>
          {disabled && <p className="text-xs text-muted-foreground">{addDisabledReason}</p>}
        </form>

        <div
          className={cn(
            "max-h-[48vh] overflow-y-auto space-y-2 rounded-xl border border-dashed p-2",
            disabled ? "bg-slate-50" : "bg-white"
          )}
          onDragOver={(event) => {
            if (disabled || !canDropAtEnd(parentId)) return;
            event.preventDefault();
          }}
          onDrop={(event) => {
            if (disabled || !canDropAtEnd(parentId)) return;
            event.preventDefault();
            onDropAtEnd(parentId, nodes);
          }}
        >
          {nodes.length === 0 ? (
            <div className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
              No {label.toLowerCase()} yet.
            </div>
          ) : (
            nodes.map((node) => {
              const isSelected = selectedId === node.id;
              const canDropHere = canDropOnNode(node);

              const chapterWeekRange = text(node.metadata.weekRange);
              const lessonWeek = text(node.metadata.week);
              const lessonCode = text(node.metadata.lessonCode);

              return (
                <div
                  key={node.id}
                  draggable={!busy}
                  onDragStart={(event) => onDragStart(node, event)}
                  onDragEnd={onDragEnd}
                  onDragOver={(event) => {
                    if (!canDropHere) return;
                    event.preventDefault();
                  }}
                  onDrop={(event) => {
                    if (!canDropHere) return;
                    event.preventDefault();
                    event.stopPropagation();
                    onDropOnNode(node, nodes);
                  }}
                  className={cn(
                    "rounded-lg border bg-white px-3 py-2",
                    isSelected ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onSelect(node.id)}
                      className="flex min-w-0 flex-1 items-start gap-2 text-left"
                    >
                      <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">{node.title}</p>
                        {nodeType === "lesson" ? (
                          <p className="text-xs text-slate-500">Module page</p>
                        ) : (
                          <p className="text-xs text-slate-500">
                            {node.children.length} {childHintByType[nodeType]}
                          </p>
                        )}
                        {nodeType === "chapter" && chapterWeekRange && (
                          <p className="text-xs text-slate-500">{chapterWeekRange}</p>
                        )}
                        {nodeType === "lesson" && (lessonCode || lessonWeek) && (
                          <p className="text-xs text-slate-500">
                            {lessonCode || "Module"}
                            {lessonWeek ? ` · Week ${lessonWeek}` : ""}
                          </p>
                        )}
                      </div>
                    </button>

                    <div className="flex items-center gap-1">
                      {nodeType === "lesson" && lessonPreviewBasePath && (
                        <Button type="button" variant="ghost" size="sm" asChild className="h-8 px-2 text-xs">
                          <Link href={`${lessonPreviewBasePath}/${node.slug}`}>Open</Link>
                        </Button>
                      )}
                      <Button type="button" variant="ghost" size="icon" onClick={() => onRename(node)} disabled={busy}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(node)}
                        disabled={busy}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {nodeType === "chapter" && onChapterWeekDraftChange && onSaveChapterWeek && (
                    <div className="mt-3 flex items-center gap-2">
                      <Input
                        value={chapterWeekDrafts?.[node.id] ?? chapterWeekRange}
                        onChange={(event) => onChapterWeekDraftChange(node.id, event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key !== "Enter") return;
                          event.preventDefault();
                          onSaveChapterWeek(node);
                        }}
                        placeholder="Set week range (example: Weeks 2-4)"
                        disabled={busy || chapterWeekBusyId === node.id}
                        className="h-8 text-xs"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onSaveChapterWeek(node)}
                        disabled={busy || chapterWeekBusyId === node.id}
                        className="h-8 shrink-0 px-2 text-xs"
                      >
                        {chapterWeekBusyId === node.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          "Save"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <p className="text-xs text-muted-foreground">Drag and drop inside this column to change order.</p>
      </CardContent>
    </Card>
  );
}

export function CurriculumPortal() {
  const [tree, setTree] = useState<CurriculumNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [selectedYearTitle, setSelectedYearTitle] = useState<(typeof YEAR_OPTIONS)[number]>(YEAR_OPTIONS[0]);
  const [selectedSubjectTitle, setSelectedSubjectTitle] = useState<string>(SUBJECT_OPTIONS[0]);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [chapterWeekDrafts, setChapterWeekDrafts] = useState<Record<string, string>>({});
  const [chapterWeekBusyId, setChapterWeekBusyId] = useState<string | null>(null);

  const dragStateRef = useRef<DragState | null>(null);

  const [drafts, setDrafts] = useState<Record<NodeType, string>>({
    year: "",
    subject: "",
    chapter: "",
    lesson: "",
  });
  const [chapterWeekRangeDraft, setChapterWeekRangeDraft] = useState("");
  const [lessonWeekDraft, setLessonWeekDraft] = useState("");
  const [lessonCodeDraft, setLessonCodeDraft] = useState("");

  const loadTree = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/curriculum", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.error || "Failed to load curriculum.");
        setTree([]);
        return;
      }

      setTree(Array.isArray(data.tree) ? data.tree : []);
    } catch (loadError) {
      console.error(loadError);
      setError("Failed to load curriculum.");
      setTree([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTree();
  }, [loadTree]);

  const years = tree;

  const selectedYear = useMemo(
    () => years.find((item) => sameLabel(item.title, selectedYearTitle)) ?? null,
    [years, selectedYearTitle]
  );

  const subjects = selectedYear?.children ?? [];

  const selectedSubject = useMemo(
    () => subjects.find((item) => sameLabel(item.title, selectedSubjectTitle)) ?? null,
    [subjects, selectedSubjectTitle]
  );

  const chapters = selectedSubject?.children ?? [];

  useEffect(() => {
    if (subjects.length === 0) return;

    if (!selectedSubject || !subjects.some((item) => sameLabel(item.title, selectedSubjectTitle))) {
      setSelectedSubjectTitle(subjects[0].title);
    }
  }, [selectedSubject, selectedSubjectTitle, subjects]);

  useEffect(() => {
    const nextDrafts: Record<string, string> = {};
    for (const chapter of chapters) {
      nextDrafts[chapter.id] = text(chapter.metadata.weekRange);
    }
    setChapterWeekDrafts(nextDrafts);
  }, [chapters]);

  useEffect(() => {
    if (chapters.length === 0) {
      setSelectedChapterId(null);
      return;
    }

    if (!selectedChapterId || !chapters.some((item) => item.id === selectedChapterId)) {
      setSelectedChapterId(chapters[0].id);
    }
  }, [chapters, selectedChapterId]);

  const selectedChapter = useMemo(
    () => chapters.find((item) => item.id === selectedChapterId) ?? null,
    [chapters, selectedChapterId]
  );

  const lessons = selectedChapter?.children ?? [];
  const lessonPreviewBasePath = useMemo(() => {
    if (!selectedYear || !selectedSubject || !selectedChapter) return null;
    return `/admin/materials/curriculum/${selectedYear.slug}/${selectedSubject.slug}/${selectedChapter.slug}`;
  }, [selectedYear, selectedSubject, selectedChapter]);

  useEffect(() => {
    if (wizardStep === 1) return;
    if (!selectedYear) {
      setWizardStep(1);
    }
  }, [selectedYear, wizardStep]);

  const canDropOnNode = useCallback((targetNode: CurriculumNode) => {
    const dragState = dragStateRef.current;
    if (!dragState) return false;
    if (dragState.parentId !== targetNode.parentId) return false;
    if (dragState.nodeType !== targetNode.nodeType) return false;
    return dragState.nodeId !== targetNode.id;
  }, []);

  const canDropAtEnd = useCallback((parentId: string | null) => {
    const dragState = dragStateRef.current;
    return Boolean(dragState && dragState.parentId === parentId);
  }, []);

  const setDraft = (nodeType: NodeType, value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [nodeType]: value,
    }));
  };

  const createNode = async (
    nodeType: NodeType,
    parentId: string | null,
    overrides?: {
      title?: string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<string | null> => {
    const title = (overrides?.title ?? drafts[nodeType]).trim();
    if (!title) return null;

    const metadata: Record<string, unknown> = { ...(overrides?.metadata ?? {}) };
    if (nodeType === "chapter") {
      metadata.weekRange = chapterWeekRangeDraft.trim();
    }
    if (nodeType === "lesson") {
      metadata.week = lessonWeekDraft.trim();
      metadata.lessonCode = lessonCodeDraft.trim();
    }

    setBusy(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodeType, parentId, title, metadata }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.error || "Failed to create node.");
        return null;
      }

      const createdId = String(data?.node?.id || "");
      if (!overrides?.title) {
        setDraft(nodeType, "");
      }
      if (nodeType === "chapter") {
        setChapterWeekRangeDraft("");
      }
      if (nodeType === "lesson") {
        setLessonWeekDraft("");
        setLessonCodeDraft("");
      }
      setMessage(`${nodeLabelByType[nodeType]} added.`);

      await loadTree();

      if (createdId && nodeType === "subject") {
        setSelectedSubjectTitle(title);
        setSelectedChapterId(null);
      }
      if (createdId && nodeType === "chapter") {
        setSelectedChapterId(createdId);
      }
      return createdId || null;
    } catch (createError) {
      console.error(createError);
      setError("Failed to create node.");
      return null;
    } finally {
      setBusy(false);
    }
  };

  const handleYearChange = (value: (typeof YEAR_OPTIONS)[number]) => {
    setSelectedYearTitle(value);
    const matched = years.find((item) => sameLabel(item.title, value));
    setWizardStep(matched ? 2 : 1);
    setSelectedChapterId(null);
  };

  const handleSubjectChange = (value: string) => {
    setSelectedSubjectTitle(value);
    const matched = subjects.find((item) => sameLabel(item.title, value));
    if (matched) {
      setWizardStep(3);
      return;
    }
    setWizardStep(2);
    setSelectedChapterId(null);
  };

  const createSelectedYear = async () => {
    if (selectedYear) return;
    const createdId = await createNode("year", null, { title: selectedYearTitle });
    if (createdId) {
      setWizardStep(2);
    }
  };

  const createSelectedSubject = async () => {
    if (!selectedYear || selectedSubject) return;
    const createdId = await createNode("subject", selectedYear.id, { title: selectedSubjectTitle });
    if (createdId) {
      setWizardStep(3);
    }
  };

  const updateChapterWeekDraft = (chapterId: string, value: string) => {
    setChapterWeekDrafts((prev) => ({
      ...prev,
      [chapterId]: value,
    }));
  };

  const saveChapterWeek = async (chapter: CurriculumNode) => {
    const nextWeekRange = (chapterWeekDrafts[chapter.id] ?? "").trim();
    const currentWeekRange = text(chapter.metadata.weekRange);
    if (nextWeekRange === currentWeekRange) return;

    setChapterWeekBusyId(chapter.id);
    setError("");
    setMessage("");

    const metadata: Record<string, unknown> = {
      ...(chapter.metadata ?? {}),
      weekRange: nextWeekRange,
    };

    try {
      const response = await fetch(`/api/admin/curriculum/${chapter.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: chapter.title, metadata }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.error || "Failed to update chapter week range.");
        return;
      }

      setMessage("Chapter week range updated.");
      await loadTree();
    } catch (saveError) {
      console.error(saveError);
      setError("Failed to update chapter week range.");
    } finally {
      setChapterWeekBusyId(null);
    }
  };

  const renameNode = async (node: CurriculumNode) => {
    const nextTitle = window.prompt(`Rename ${nodeLabelByType[node.nodeType]}`, node.title);
    if (!nextTitle) return;

    const metadata: Record<string, unknown> = { ...(node.metadata ?? {}) };

    if (node.nodeType === "chapter") {
      const nextWeekRange = window.prompt("Week range", text(metadata.weekRange));
      if (nextWeekRange === null) return;
      metadata.weekRange = nextWeekRange;
    }

    if (node.nodeType === "lesson") {
      const nextWeek = window.prompt("Week", text(metadata.week));
      if (nextWeek === null) return;

      const nextLessonCode = window.prompt("Module code (example: 2.1)", text(metadata.lessonCode));
      if (nextLessonCode === null) return;

      metadata.week = nextWeek;
      metadata.lessonCode = nextLessonCode;
    }

    setBusy(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/curriculum/${node.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: nextTitle, metadata }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.error || "Failed to update node.");
        return;
      }

      setMessage(`${nodeLabelByType[node.nodeType]} updated.`);
      await loadTree();
    } catch (renameError) {
      console.error(renameError);
      setError("Failed to update node.");
    } finally {
      setBusy(false);
    }
  };

  const deleteNode = async (node: CurriculumNode) => {
    const hasChildren = node.children.length > 0;
    const confirmed = window.confirm(
      hasChildren
        ? `Delete \"${node.title}\" and all nested items?`
        : `Delete \"${node.title}\"?`
    );

    if (!confirmed) return;

    setBusy(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/curriculum/${node.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.error || "Failed to delete node.");
        return;
      }

      setMessage(`${nodeLabelByType[node.nodeType]} deleted.`);
      await loadTree();
    } catch (deleteError) {
      console.error(deleteError);
      setError("Failed to delete node.");
    } finally {
      setBusy(false);
    }
  };

  const persistOrder = async (parentId: string | null, orderedNodeIds: string[]) => {
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/curriculum/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentId, orderedNodeIds }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.error || "Failed to reorder nodes.");
        return;
      }

      setMessage("Order updated.");
      await loadTree();
    } catch (reorderError) {
      console.error(reorderError);
      setError("Failed to reorder nodes.");
    } finally {
      setBusy(false);
      dragStateRef.current = null;
    }
  };

  const dropOnNode = async (targetNode: CurriculumNode, siblingNodes: CurriculumNode[]) => {
    const dragState = dragStateRef.current;
    if (!dragState) return;
    if (dragState.parentId !== targetNode.parentId) return;
    if (dragState.nodeType !== targetNode.nodeType) return;

    const currentIds = siblingNodes.map((item) => item.id);
    const nextIds = reorderIds(currentIds, dragState.nodeId, targetNode.id);

    if (hasSameOrder(currentIds, nextIds)) {
      dragStateRef.current = null;
      return;
    }

    await persistOrder(targetNode.parentId, nextIds);
  };

  const dropAtEnd = async (parentId: string | null, siblingNodes: CurriculumNode[]) => {
    const dragState = dragStateRef.current;
    if (!dragState) return;
    if (dragState.parentId !== parentId) return;

    const currentIds = siblingNodes.map((item) => item.id);
    const nextIds = reorderIds(currentIds, dragState.nodeId, null);

    if (hasSameOrder(currentIds, nextIds)) {
      dragStateRef.current = null;
      return;
    }

    await persistOrder(parentId, nextIds);
  };

  const handleDragStart = (node: CurriculumNode, event: DragEvent<HTMLDivElement>) => {
    dragStateRef.current = { nodeId: node.id, parentId: node.parentId, nodeType: node.nodeType };
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", node.id);
  };

  const handleDragEnd = () => {
    dragStateRef.current = null;
  };

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden">
      <Card className="shrink-0">
        <CardHeader>
          <CardTitle className="text-2xl">Curriculum Portal</CardTitle>
          <CardDescription>
            Choose a year, then manage subjects, chapters, and modules from one screen.
          </CardDescription>
        </CardHeader>
      </Card>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-green-700">{message}</p>}

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading curriculum...
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          {wizardStep === 1 && (
            <Card className="border-slate-200">
              <CardHeader className="space-y-2">
                <Badge className="w-fit bg-blue-100 text-blue-700 hover:bg-blue-100 border border-blue-200">
                  Step 1
                </Badge>
                <CardTitle className="text-base">Choose Year</CardTitle>
                <CardDescription>Only Year 7, Year 8, and Year 9 are allowed.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <select
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={selectedYearTitle}
                  onChange={(event) => handleYearChange(event.target.value as (typeof YEAR_OPTIONS)[number])}
                  disabled={busy}
                >
                  {YEAR_OPTIONS.map((yearTitle) => (
                    <option key={yearTitle} value={yearTitle}>
                      {yearTitle}
                    </option>
                  ))}
                </select>

                {selectedYear ? (
                  <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <p className="text-sm text-slate-700">Selected: {selectedYear.title}</p>
                    <Button type="button" size="sm" onClick={() => setWizardStep(2)} disabled={busy}>
                      Continue to Subject
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2 rounded-lg border border-dashed px-3 py-3 text-sm text-muted-foreground">
                    <p>{selectedYearTitle} has not been created in curriculum yet.</p>
                    <Button type="button" size="sm" onClick={createSelectedYear} disabled={busy}>
                      {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                      Create {selectedYearTitle}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {wizardStep === 2 && (
            <Card className="border-slate-200">
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Badge className="w-fit bg-blue-100 text-blue-700 hover:bg-blue-100 border border-blue-200">
                    Step 2
                  </Badge>
                  <Button type="button" variant="outline" size="sm" onClick={() => setWizardStep(1)} disabled={busy}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Year
                  </Button>
                </div>
                <CardTitle className="text-base">Subject Setup</CardTitle>
                <CardDescription>
                  {selectedYear
                    ? `Inside year: ${selectedYear.title}. You can quick-add a common subject here, then manage all subjects, chapters, and modules in the builder.`
                    : "Select or create the chosen year in Step 1 first."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <select
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm disabled:bg-slate-50"
                  value={selectedSubjectTitle}
                  onChange={(event) => handleSubjectChange(event.target.value as (typeof SUBJECT_OPTIONS)[number])}
                  disabled={!selectedYear || busy}
                >
                  {SUBJECT_OPTIONS.map((subjectTitle) => (
                    <option key={subjectTitle} value={subjectTitle}>
                      {subjectTitle}
                    </option>
                  ))}
                </select>

                {!selectedYear ? (
                  <p className="text-xs text-muted-foreground">
                    This step requires a valid year from Step 1.
                  </p>
                ) : (
                  <div className="space-y-3 rounded-lg border border-slate-200 bg-white px-3 py-3">
                    {selectedSubject ? (
                      <p className="text-sm text-slate-700">Selected: {selectedSubject.title}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {selectedSubjectTitle} has not been created in {selectedYear.title} yet.
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {!selectedSubject && (
                        <Button type="button" size="sm" variant="outline" onClick={createSelectedSubject} disabled={busy}>
                          {busy ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Plus className="mr-2 h-4 w-4" />
                          )}
                          Add {selectedSubjectTitle}
                        </Button>
                      )}
                      <Button type="button" size="sm" onClick={() => setWizardStep(3)} disabled={busy}>
                        Open Curriculum Builder
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {wizardStep === 3 && (
            <div className="flex min-h-0 flex-1 flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Badge variant="secondary">{selectedYear?.title ?? selectedYearTitle}</Badge>
                  <Badge variant="secondary">{selectedSubject?.title ?? "No subject selected"}</Badge>
                  <Badge variant="secondary">{selectedChapter?.title ?? "No chapter selected"}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setWizardStep(2)} disabled={busy}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Setup
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setWizardStep(1)} disabled={busy}>
                    Change Year
                  </Button>
                </div>
              </div>

              <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-3">
                {selectedYear ? (
                  <NodeColumn
                    title="Manage Subjects"
                    description={`Add and reorder subjects inside ${selectedYear.title}. Select one to manage its chapters.`}
                    nodeType="subject"
                    parentId={selectedYear.id}
                    nodes={subjects}
                    selectedId={selectedSubject?.id ?? null}
                    disabled={false}
                    addDisabledReason=""
                    draftTitle={drafts.subject}
                    draftWeekRange=""
                    draftWeek=""
                    draftLessonCode=""
                    busy={busy}
                    onDraftTitleChange={(value) => setDraft("subject", value)}
                    onDraftWeekRangeChange={() => undefined}
                    onDraftWeekChange={() => undefined}
                    onDraftLessonCodeChange={() => undefined}
                    onSelect={(nodeId) => {
                      const nextSubject = subjects.find((item) => item.id === nodeId);
                      if (!nextSubject) return;
                      setSelectedSubjectTitle(nextSubject.title);
                      setSelectedChapterId(null);
                    }}
                    onCreate={() => createNode("subject", selectedYear.id)}
                    onRename={renameNode}
                    onDelete={deleteNode}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    canDropOnNode={canDropOnNode}
                    canDropAtEnd={canDropAtEnd}
                    onDropOnNode={dropOnNode}
                    onDropAtEnd={dropAtEnd}
                  />
                ) : (
                  <Card className="border-dashed border-slate-300 bg-slate-50">
                    <CardContent className="p-4 text-sm text-muted-foreground">
                      Select a valid year first.
                    </CardContent>
                  </Card>
                )}

                {selectedSubject ? (
                  <NodeColumn
                    title="Manage Chapters"
                    description={`Inside subject: ${selectedSubject.title}. Add chapters, reorder them, and update week ranges inline.`}
                    nodeType="chapter"
                    parentId={selectedSubject.id}
                    nodes={chapters}
                    selectedId={selectedChapterId}
                    disabled={false}
                    addDisabledReason=""
                    draftTitle={drafts.chapter}
                    draftWeekRange={chapterWeekRangeDraft}
                    draftWeek=""
                    draftLessonCode=""
                    busy={busy}
                    onDraftTitleChange={(value) => setDraft("chapter", value)}
                    onDraftWeekRangeChange={setChapterWeekRangeDraft}
                    onDraftWeekChange={() => undefined}
                    onDraftLessonCodeChange={() => undefined}
                    onSelect={(nodeId) => setSelectedChapterId(nodeId)}
                    onCreate={() => createNode("chapter", selectedSubject.id)}
                    onRename={renameNode}
                    onDelete={deleteNode}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    canDropOnNode={canDropOnNode}
                    canDropAtEnd={canDropAtEnd}
                    onDropOnNode={dropOnNode}
                    onDropAtEnd={dropAtEnd}
                    chapterWeekDrafts={chapterWeekDrafts}
                    chapterWeekBusyId={chapterWeekBusyId}
                    onChapterWeekDraftChange={updateChapterWeekDraft}
                    onSaveChapterWeek={saveChapterWeek}
                  />
                ) : (
                  <Card className="border-dashed border-slate-300 bg-slate-50">
                    <CardContent className="p-4 text-sm text-muted-foreground">
                      Select or add a subject to manage its chapters.
                    </CardContent>
                  </Card>
                )}

                {selectedChapter ? (
                  <NodeColumn
                    title="Manage Modules"
                    description={`Inside chapter: ${selectedChapter.title}. Add, edit, delete, and reorder modules here.`}
                    nodeType="lesson"
                    parentId={selectedChapter.id}
                    nodes={lessons}
                    selectedId={null}
                    disabled={false}
                    addDisabledReason=""
                    draftTitle={drafts.lesson}
                    draftWeekRange=""
                    draftWeek={lessonWeekDraft}
                    draftLessonCode={lessonCodeDraft}
                    busy={busy}
                    onDraftTitleChange={(value) => setDraft("lesson", value)}
                    onDraftWeekRangeChange={() => undefined}
                    onDraftWeekChange={setLessonWeekDraft}
                    onDraftLessonCodeChange={setLessonCodeDraft}
                    onSelect={() => undefined}
                    onCreate={() => createNode("lesson", selectedChapter.id)}
                    onRename={renameNode}
                    onDelete={deleteNode}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    canDropOnNode={canDropOnNode}
                    canDropAtEnd={canDropAtEnd}
                    onDropOnNode={dropOnNode}
                    onDropAtEnd={dropAtEnd}
                    lessonPreviewBasePath={lessonPreviewBasePath}
                  />
                ) : (
                  <Card className="border-dashed border-slate-300 bg-slate-50">
                    <CardContent className="p-4 text-sm text-muted-foreground">
                      Select or add a chapter to manage its modules.
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
