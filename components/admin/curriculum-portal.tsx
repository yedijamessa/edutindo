"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { GripVertical, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
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
  lesson: "Lesson",
};

const childHintByType: Record<NodeType, string> = {
  year: "subjects",
  subject: "chapters",
  chapter: "lessons",
  lesson: "items",
};

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

interface NodeColumnProps {
  title: string;
  description: string;
  nodeType: NodeType;
  nodes: CurriculumNode[];
  selectedId: string | null;
  disabled: boolean;
  addDisabledReason: string;
  draftTitle: string;
  draftWeekRange: string;
  draftWeek: string;
  draftLessonCode: string;
  busy: boolean;
  dragState: DragState | null;
  onDraftTitleChange: (value: string) => void;
  onDraftWeekRangeChange: (value: string) => void;
  onDraftWeekChange: (value: string) => void;
  onDraftLessonCodeChange: (value: string) => void;
  onSelect: (nodeId: string) => void;
  onCreate: () => void;
  onRename: (node: CurriculumNode) => void;
  onDelete: (node: CurriculumNode) => void;
  onDragStart: (node: CurriculumNode) => void;
  onDragEnd: () => void;
  onDropOnNode: (targetNode: CurriculumNode, siblingNodes: CurriculumNode[]) => void;
  onDropAtEnd: (parentId: string | null, siblingNodes: CurriculumNode[]) => void;
}

function NodeColumn({
  title,
  description,
  nodeType,
  nodes,
  selectedId,
  disabled,
  addDisabledReason,
  draftTitle,
  draftWeekRange,
  draftWeek,
  draftLessonCode,
  busy,
  dragState,
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
  onDropOnNode,
  onDropAtEnd,
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
                placeholder="Lesson code (example: 2.1)"
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
            "space-y-2 rounded-xl border border-dashed p-2",
            disabled ? "bg-slate-50" : "bg-white"
          )}
          onDragOver={(event) => {
            if (disabled) return;
            event.preventDefault();
          }}
          onDrop={(event) => {
            if (disabled) return;
            event.preventDefault();
            onDropAtEnd(nodes[0]?.parentId ?? null, nodes);
          }}
        >
          {nodes.length === 0 ? (
            <div className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
              No {label.toLowerCase()} yet.
            </div>
          ) : (
            nodes.map((node) => {
              const isSelected = selectedId === node.id;
              const canDropHere =
                dragState &&
                dragState.parentId === node.parentId &&
                dragState.nodeType === node.nodeType &&
                dragState.nodeId !== node.id;

              const chapterWeekRange = text(node.metadata.weekRange);
              const lessonWeek = text(node.metadata.week);
              const lessonCode = text(node.metadata.lessonCode);

              return (
                <div
                  key={node.id}
                  draggable={!busy}
                  onDragStart={() => onDragStart(node)}
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
                        <p className="text-xs text-slate-500">
                          {node.children.length} {childHintByType[nodeType]}
                        </p>
                        {nodeType === "chapter" && chapterWeekRange && (
                          <p className="text-xs text-slate-500">{chapterWeekRange}</p>
                        )}
                        {nodeType === "lesson" && (lessonCode || lessonWeek) && (
                          <p className="text-xs text-slate-500">
                            {lessonCode || "Lesson"}
                            {lessonWeek ? ` · Week ${lessonWeek}` : ""}
                          </p>
                        )}
                      </div>
                    </button>

                    <div className="flex items-center gap-1">
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

  const [selectedYearId, setSelectedYearId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);

  const [dragState, setDragState] = useState<DragState | null>(null);

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

  useEffect(() => {
    if (years.length === 0) {
      setSelectedYearId(null);
      return;
    }

    if (!selectedYearId || !years.some((item) => item.id === selectedYearId)) {
      setSelectedYearId(years[0].id);
    }
  }, [years, selectedYearId]);

  const selectedYear = useMemo(
    () => years.find((item) => item.id === selectedYearId) ?? null,
    [years, selectedYearId]
  );

  const subjects = selectedYear?.children ?? [];

  useEffect(() => {
    if (subjects.length === 0) {
      setSelectedSubjectId(null);
      return;
    }

    if (!selectedSubjectId || !subjects.some((item) => item.id === selectedSubjectId)) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [subjects, selectedSubjectId]);

  const selectedSubject = useMemo(
    () => subjects.find((item) => item.id === selectedSubjectId) ?? null,
    [subjects, selectedSubjectId]
  );

  const chapters = selectedSubject?.children ?? [];

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

  const setDraft = (nodeType: NodeType, value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [nodeType]: value,
    }));
  };

  const createNode = async (nodeType: NodeType, parentId: string | null) => {
    const title = drafts[nodeType].trim();
    if (!title) return;

    const metadata: Record<string, unknown> = {};
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
        return;
      }

      const createdId = String(data?.node?.id || "");
      setDraft(nodeType, "");
      if (nodeType === "chapter") {
        setChapterWeekRangeDraft("");
      }
      if (nodeType === "lesson") {
        setLessonWeekDraft("");
        setLessonCodeDraft("");
      }
      setMessage(`${nodeLabelByType[nodeType]} added.`);

      await loadTree();

      if (createdId) {
        if (nodeType === "year") {
          setSelectedYearId(createdId);
        }
        if (nodeType === "subject") {
          setSelectedSubjectId(createdId);
        }
        if (nodeType === "chapter") {
          setSelectedChapterId(createdId);
        }
      }
    } catch (createError) {
      console.error(createError);
      setError("Failed to create node.");
    } finally {
      setBusy(false);
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

      const nextLessonCode = window.prompt("Lesson code (example: 2.1)", text(metadata.lessonCode));
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
      setDragState(null);
    }
  };

  const dropOnNode = async (targetNode: CurriculumNode, siblingNodes: CurriculumNode[]) => {
    if (!dragState) return;
    if (dragState.parentId !== targetNode.parentId) return;
    if (dragState.nodeType !== targetNode.nodeType) return;

    const currentIds = siblingNodes.map((item) => item.id);
    const nextIds = reorderIds(currentIds, dragState.nodeId, targetNode.id);

    if (hasSameOrder(currentIds, nextIds)) {
      setDragState(null);
      return;
    }

    await persistOrder(targetNode.parentId, nextIds);
  };

  const dropAtEnd = async (parentId: string | null, siblingNodes: CurriculumNode[]) => {
    if (!dragState) return;
    if (dragState.parentId !== parentId) return;

    const currentIds = siblingNodes.map((item) => item.id);
    const nextIds = reorderIds(currentIds, dragState.nodeId, null);

    if (hasSameOrder(currentIds, nextIds)) {
      setDragState(null);
      return;
    }

    await persistOrder(parentId, nextIds);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Curriculum Portal</CardTitle>
          <CardDescription>
            Manage hierarchy and order manually: Year -&gt; Subject -&gt; Chapter -&gt; Lesson. Set lesson week and code (e.g., 2.1, 2.2) directly here.
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
        <div className="grid gap-4 xl:grid-cols-4">
          <NodeColumn
            title="Years"
            description="Top level year buckets."
            nodeType="year"
            nodes={years}
            selectedId={selectedYearId}
            disabled={false}
            addDisabledReason=""
            draftTitle={drafts.year}
            draftWeekRange=""
            draftWeek=""
            draftLessonCode=""
            busy={busy}
            dragState={dragState}
            onDraftTitleChange={(value) => setDraft("year", value)}
            onDraftWeekRangeChange={() => undefined}
            onDraftWeekChange={() => undefined}
            onDraftLessonCodeChange={() => undefined}
            onSelect={(nodeId) => setSelectedYearId(nodeId)}
            onCreate={() => createNode("year", null)}
            onRename={renameNode}
            onDelete={deleteNode}
            onDragStart={(node) => setDragState({ nodeId: node.id, parentId: node.parentId, nodeType: node.nodeType })}
            onDragEnd={() => setDragState(null)}
            onDropOnNode={dropOnNode}
            onDropAtEnd={dropAtEnd}
          />

          <NodeColumn
            title="Subjects"
            description={selectedYear ? `Inside year: ${selectedYear.title}` : "Select a year first."}
            nodeType="subject"
            nodes={subjects}
            selectedId={selectedSubjectId}
            disabled={!selectedYear}
            addDisabledReason="Choose a year to add subjects."
            draftTitle={drafts.subject}
            draftWeekRange=""
            draftWeek=""
            draftLessonCode=""
            busy={busy}
            dragState={dragState}
            onDraftTitleChange={(value) => setDraft("subject", value)}
            onDraftWeekRangeChange={() => undefined}
            onDraftWeekChange={() => undefined}
            onDraftLessonCodeChange={() => undefined}
            onSelect={(nodeId) => setSelectedSubjectId(nodeId)}
            onCreate={() => createNode("subject", selectedYear?.id ?? null)}
            onRename={renameNode}
            onDelete={deleteNode}
            onDragStart={(node) => setDragState({ nodeId: node.id, parentId: node.parentId, nodeType: node.nodeType })}
            onDragEnd={() => setDragState(null)}
            onDropOnNode={dropOnNode}
            onDropAtEnd={dropAtEnd}
          />

          <NodeColumn
            title="Chapters"
            description={selectedSubject ? `Inside subject: ${selectedSubject.title}` : "Select a subject first."}
            nodeType="chapter"
            nodes={chapters}
            selectedId={selectedChapterId}
            disabled={!selectedSubject}
            addDisabledReason="Choose a subject to add chapters."
            draftTitle={drafts.chapter}
            draftWeekRange={chapterWeekRangeDraft}
            draftWeek=""
            draftLessonCode=""
            busy={busy}
            dragState={dragState}
            onDraftTitleChange={(value) => setDraft("chapter", value)}
            onDraftWeekRangeChange={setChapterWeekRangeDraft}
            onDraftWeekChange={() => undefined}
            onDraftLessonCodeChange={() => undefined}
            onSelect={(nodeId) => setSelectedChapterId(nodeId)}
            onCreate={() => createNode("chapter", selectedSubject?.id ?? null)}
            onRename={renameNode}
            onDelete={deleteNode}
            onDragStart={(node) => setDragState({ nodeId: node.id, parentId: node.parentId, nodeType: node.nodeType })}
            onDragEnd={() => setDragState(null)}
            onDropOnNode={dropOnNode}
            onDropAtEnd={dropAtEnd}
          />

          <NodeColumn
            title="Lessons"
            description={selectedChapter ? `Inside chapter: ${selectedChapter.title}` : "Select a chapter first."}
            nodeType="lesson"
            nodes={lessons}
            selectedId={null}
            disabled={!selectedChapter}
            addDisabledReason="Choose a chapter to add lessons."
            draftTitle={drafts.lesson}
            draftWeekRange=""
            draftWeek={lessonWeekDraft}
            draftLessonCode={lessonCodeDraft}
            busy={busy}
            dragState={dragState}
            onDraftTitleChange={(value) => setDraft("lesson", value)}
            onDraftWeekRangeChange={() => undefined}
            onDraftWeekChange={setLessonWeekDraft}
            onDraftLessonCodeChange={setLessonCodeDraft}
            onSelect={() => undefined}
            onCreate={() => createNode("lesson", selectedChapter?.id ?? null)}
            onRename={renameNode}
            onDelete={deleteNode}
            onDragStart={(node) => setDragState({ nodeId: node.id, parentId: node.parentId, nodeType: node.nodeType })}
            onDragEnd={() => setDragState(null)}
            onDropOnNode={dropOnNode}
            onDropAtEnd={dropAtEnd}
          />
        </div>
      )}
    </div>
  );
}
