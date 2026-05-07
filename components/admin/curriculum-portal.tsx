"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent, type ReactNode } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight, FilePenLine, GripVertical, Loader2, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { cn } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createQuiz, getQuizzes } from "@/lib/firestore-services";
import type { Question, QuestionType, Quiz } from "@/types/lms";

type NodeType = "school" | "year" | "subject" | "chapter" | "lesson";

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

type ChapterWeekDraft = {
  start: string;
  end: string;
};

type ChapterAssessmentDraft = {
  preTestQuizId: string;
  postTestQuizId: string;
  preTestEnabled: boolean;
  postTestEnabled: boolean;
};

type AssessmentType = "pre" | "post";

type QuizDraft = {
  title: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  questions: Question[];
};

type QuestionDraft = {
  question: string;
  type: QuestionType;
  points: number;
  options: string[];
  correctAnswer: string | number;
};

type AssignmentTag = {
  schoolSlug: string;
  yearSlug: string;
};

const nodeLabelByType: Record<NodeType, string> = {
  school: "School",
  year: "Year",
  subject: "Subject",
  chapter: "Chapter",
  lesson: "Module",
};

const childHintByType: Record<NodeType, string> = {
  school: "tags",
  year: "subjects",
  subject: "chapters",
  chapter: "modules",
  lesson: "items",
};

const DEFAULT_SCHOOL_SLUG = "edutindo";
const YEAR_OPTIONS = [
  { title: "Year 7", slug: "year-7" },
  { title: "Year 8", slug: "year-8" },
  { title: "Year 9", slug: "year-9" },
] as const;

const surfaceCardClassName =
  "rounded-[28px] border border-slate-200/80 bg-white/92 shadow-[0_24px_70px_-54px_rgba(15,23,42,0.38)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/84 dark:shadow-none";
const dashedSurfaceCardClassName =
  "rounded-[28px] border border-dashed border-slate-300 bg-white/65 shadow-[0_24px_70px_-54px_rgba(15,23,42,0.2)] dark:border-slate-700 dark:bg-slate-900/60 dark:shadow-none";
const countBubbleClassName =
  "inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#ff6b1a] px-2 text-[11px] font-semibold text-white shadow-[0_14px_30px_-20px_rgba(255,107,26,0.95)]";
const fieldClassName =
  "h-11 rounded-xl border-[#dde5f2] bg-white text-slate-700 shadow-[inset_0_1px_2px_rgba(15,23,42,0.05)] placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#c9d9ff] focus-visible:ring-offset-0 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500";
const compactFieldClassName =
  "h-9 rounded-xl border-[#dde5f2] bg-white text-xs text-slate-700 shadow-[inset_0_1px_2px_rgba(15,23,42,0.05)] placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#c9d9ff] focus-visible:ring-offset-0 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500";
const primaryActionClassName =
  "h-11 rounded-full bg-[linear-gradient(135deg,#2f6fff_0%,#1d4ed8_100%)] text-white shadow-[0_20px_40px_-24px_rgba(37,99,235,0.95)] hover:brightness-105";
const secondaryPillButtonClassName =
  "rounded-full border-[#d8dfea] bg-white text-slate-700 shadow-none hover:border-[#c6d4f3] hover:bg-[#f7faff] hover:text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900";

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

function toBoolean(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  const cleaned = text(value).toLowerCase();
  return cleaned === "true" || cleaned === "1" || cleaned === "yes" || cleaned === "on";
}

function normalizeWeekInput(value: string) {
  return value.replace(/\D/g, "").slice(0, 3);
}

function parseChapterWeekDraft(value: unknown): ChapterWeekDraft {
  const matches = text(value).match(/\d+/g) ?? [];

  if (matches.length === 0) {
    return { start: "", end: "" };
  }

  if (matches.length === 1) {
    return { start: matches[0], end: matches[0] };
  }

  return { start: matches[0] ?? "", end: matches[1] ?? matches[0] ?? "" };
}

function formatChapterWeekRange(startInput: string, endInput: string) {
  const normalizedStart = normalizeWeekInput(startInput);
  const normalizedEnd = normalizeWeekInput(endInput);

  if (!normalizedStart && !normalizedEnd) {
    return "";
  }

  const startValue = normalizedStart || normalizedEnd;
  const endValue = normalizedEnd || normalizedStart;

  const startNumber = Number(startValue);
  const endNumber = Number(endValue);

  if (Number.isFinite(startNumber) && Number.isFinite(endNumber) && startNumber > endNumber) {
    return startNumber === endNumber ? `Week ${startValue}` : `Weeks ${endValue}-${startValue}`;
  }

  return startValue === endValue ? `Week ${startValue}` : `Weeks ${startValue}-${endValue}`;
}

function parseAssessmentDraft(metadata: Record<string, unknown>): ChapterAssessmentDraft {
  return {
    preTestQuizId: text(metadata.preTestQuizId),
    postTestQuizId: text(metadata.postTestQuizId),
    preTestEnabled: toBoolean(metadata.preTestEnabled),
    postTestEnabled: toBoolean(metadata.postTestEnabled),
  };
}

function sameDraftMap(left: Record<string, ChapterWeekDraft>, right: Record<string, ChapterWeekDraft>) {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  if (leftKeys.length !== rightKeys.length) return false;

  return leftKeys.every(
    (key) => left[key]?.start === right[key]?.start && left[key]?.end === right[key]?.end
  );
}

function sameAssessmentDraftMap(
  left: Record<string, ChapterAssessmentDraft>,
  right: Record<string, ChapterAssessmentDraft>
) {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  if (leftKeys.length !== rightKeys.length) return false;

  return leftKeys.every((key) => {
    const leftValue = left[key];
    const rightValue = right[key];
    return (
      leftValue?.preTestQuizId === rightValue?.preTestQuizId &&
      leftValue?.postTestQuizId === rightValue?.postTestQuizId &&
      leftValue?.preTestEnabled === rightValue?.preTestEnabled &&
      leftValue?.postTestEnabled === rightValue?.postTestEnabled
    );
  });
}

function slugifyValue(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseAssignmentTags(metadata: Record<string, unknown>): AssignmentTag[] {
  if (!Array.isArray(metadata.assignmentTags)) return [];

  const seen = new Set<string>();
  const next: AssignmentTag[] = [];

  for (const item of metadata.assignmentTags) {
    if (typeof item !== "object" || item === null || Array.isArray(item)) continue;
    const schoolSlug = slugifyValue(text((item as Record<string, unknown>).schoolSlug));
    const yearSlug = slugifyValue(text((item as Record<string, unknown>).yearSlug));
    if (!schoolSlug || !yearSlug) continue;

    const key = `${schoolSlug}:${yearSlug}`;
    if (seen.has(key)) continue;
    seen.add(key);
    next.push({ schoolSlug, yearSlug });
  }

  return next;
}

function hasAssignmentTag(tags: AssignmentTag[], schoolSlug: string, yearSlug: string) {
  return tags.some((tag) => tag.schoolSlug === schoolSlug && tag.yearSlug === yearSlug);
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
  draftWeekRangeStart: string;
  draftWeekRangeEnd: string;
  draftWeek: string;
  draftLessonCode: string;
  busy: boolean;
  onDraftTitleChange: (value: string) => void;
  onDraftWeekRangeStartChange: (value: string) => void;
  onDraftWeekRangeEndChange: (value: string) => void;
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
  chapterWeekDrafts?: Record<string, ChapterWeekDraft>;
  chapterWeekBusyId?: string | null;
  onChapterWeekDraftChange?: (chapterId: string, field: "start" | "end", value: string) => void;
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
  draftWeekRangeStart,
  draftWeekRangeEnd,
  draftWeek,
  draftLessonCode,
  busy,
  onDraftTitleChange,
  onDraftWeekRangeStartChange,
  onDraftWeekRangeEndChange,
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
    <Card className={cn("h-full", surfaceCardClassName)}>
      <CardHeader className="space-y-2 pb-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-[1.45rem] font-semibold tracking-tight text-slate-950 dark:text-slate-50">
            {title}
          </CardTitle>
          <span className={countBubbleClassName}>{nodes.length}</span>
        </div>
        <CardDescription className="text-sm leading-6 text-slate-500 dark:text-slate-300">
          {description}
        </CardDescription>
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
            className={fieldClassName}
          />

          {nodeType === "chapter" && (
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Weeks</span>
              <Input
                type="number"
                min="0"
                inputMode="numeric"
                value={draftWeekRangeStart}
                onChange={(event) => onDraftWeekRangeStartChange(event.target.value)}
                placeholder="2"
                disabled={disabled || busy}
                className={compactFieldClassName}
              />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">to</span>
              <Input
                type="number"
                min="0"
                inputMode="numeric"
                value={draftWeekRangeEnd}
                onChange={(event) => onDraftWeekRangeEndChange(event.target.value)}
                placeholder="4"
                disabled={disabled || busy}
                className={compactFieldClassName}
              />
            </div>
          )}

          {nodeType === "lesson" && (
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={draftWeek}
                onChange={(event) => onDraftWeekChange(event.target.value)}
                placeholder="Week (example: 2)"
                disabled={disabled || busy}
                className={compactFieldClassName}
              />
              <Input
                value={draftLessonCode}
                onChange={(event) => onDraftLessonCodeChange(event.target.value)}
                placeholder="Module code (example: SCI-BS-01)"
                disabled={disabled || busy}
                className={compactFieldClassName}
              />
            </div>
          )}

          <Button
            type="submit"
            className={cn("w-full text-sm font-medium", primaryActionClassName)}
            disabled={disabled || busy || draftTitle.trim().length === 0}
          >
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Add {label}
          </Button>
          {disabled && <p className="text-xs text-slate-400 dark:text-slate-500">{addDisabledReason}</p>}
        </form>

        <div
          className={cn(
            "max-h-[19rem] space-y-2 overflow-y-auto rounded-[22px] border border-dashed p-2.5",
            disabled
              ? "border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950/80"
              : "border-[#cfd9ea] bg-white/95 dark:border-slate-700 dark:bg-slate-950/60"
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
            <div className="rounded-[18px] border border-dashed border-slate-200 px-3 py-6 text-center text-sm text-slate-400 dark:border-slate-800 dark:text-slate-500">
              No {label.toLowerCase()} yet.
            </div>
          ) : (
            nodes.map((node) => {
              const isSelected = selectedId === node.id;
              const canDropHere = canDropOnNode(node);

              const chapterWeekRange = text(node.metadata.weekRange);
              const chapterWeekDraft = chapterWeekDrafts?.[node.id] ?? parseChapterWeekDraft(chapterWeekRange);
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
                    "rounded-[18px] border bg-white px-3 py-3 shadow-[0_18px_34px_-28px_rgba(15,23,42,0.3)] transition-colors dark:bg-slate-900",
                    isSelected
                      ? "border-blue-400 ring-2 ring-blue-100 dark:border-blue-500 dark:ring-blue-950"
                      : "border-slate-200 dark:border-slate-800",
                    canDropHere ? "hover:border-blue-300 dark:hover:border-blue-700" : ""
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onSelect(node.id)}
                      className="flex min-w-0 flex-1 items-start gap-2 text-left"
                    >
                      <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
                          {node.title}
                        </p>
                        {nodeType === "lesson" ? (
                          <p className="text-xs text-slate-500 dark:text-slate-400">Module page</p>
                        ) : nodeType === "school" ? (
                          <p className="text-xs text-slate-500 dark:text-slate-400">School tag</p>
                        ) : (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {node.children.length} {childHintByType[nodeType]}
                          </p>
                        )}
                        {nodeType === "chapter" && chapterWeekRange && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">{chapterWeekRange}</p>
                        )}
                        {nodeType === "lesson" && (lessonCode || lessonWeek) && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {lessonCode || "Module"}
                            {lessonWeek ? ` · Week ${lessonWeek}` : ""}
                          </p>
                        )}
                      </div>
                    </button>

                    <div className="flex items-center gap-1">
                      {nodeType === "lesson" && lessonPreviewBasePath && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          asChild
                          className="h-8 rounded-full px-3 text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          <Link href={`${lessonPreviewBasePath}/${node.slug}`}>Open</Link>
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onRename(node)}
                        disabled={busy}
                        className="h-8 w-8 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(node)}
                        disabled={busy}
                        className="h-8 w-8 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {nodeType === "chapter" && onChapterWeekDraftChange && onSaveChapterWeek && (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="grid flex-1 grid-cols-[auto_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">Weeks</span>
                        <Input
                          type="number"
                          min="0"
                          inputMode="numeric"
                          value={chapterWeekDraft.start}
                          onChange={(event) => onChapterWeekDraftChange(node.id, "start", event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key !== "Enter") return;
                            event.preventDefault();
                            onSaveChapterWeek(node);
                          }}
                          placeholder="2"
                          disabled={busy || chapterWeekBusyId === node.id}
                          className={compactFieldClassName}
                        />
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">to</span>
                        <Input
                          type="number"
                          min="0"
                          inputMode="numeric"
                          value={chapterWeekDraft.end}
                          onChange={(event) => onChapterWeekDraftChange(node.id, "end", event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key !== "Enter") return;
                            event.preventDefault();
                            onSaveChapterWeek(node);
                          }}
                          placeholder="4"
                          disabled={busy || chapterWeekBusyId === node.id}
                          className={compactFieldClassName}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onSaveChapterWeek(node)}
                        disabled={busy || chapterWeekBusyId === node.id}
                        className={cn("h-9 shrink-0 px-3 text-xs", secondaryPillButtonClassName)}
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

        <p className="text-xs text-slate-400 dark:text-slate-500">
          Drag and drop inside this column to change order.
        </p>
      </CardContent>
    </Card>
  );
}

const QUESTION_TYPE_OPTIONS: Array<{ value: QuestionType; label: string }> = [
  { value: "multiple-choice", label: "Multiple Choice" },
  { value: "true-false", label: "True / False" },
  { value: "short-answer", label: "Short Answer" },
];

function buildDefaultQuizDraft(assessmentType: AssessmentType, chapterTitle: string): QuizDraft {
  const label = assessmentType === "pre" ? "Pre-test" : "Post-test";
  return {
    title: `${label}: ${chapterTitle}`,
    description:
      assessmentType === "pre"
        ? `Check baseline understanding before starting ${chapterTitle}.`
        : `Measure mastery after completing ${chapterTitle}.`,
    timeLimit: 20,
    passingScore: 70,
    questions: [],
  };
}

function buildDefaultQuestionDraft(): QuestionDraft {
  return {
    question: "",
    type: "multiple-choice",
    points: 10,
    options: ["", "", "", ""],
    correctAnswer: 0,
  };
}

interface AssessmentQuizDialogProps {
  open: boolean;
  assessmentType: AssessmentType;
  chapterId: string | null;
  chapterTitle: string;
  onOpenChange: (open: boolean) => void;
  onQuizCreated: (quiz: Quiz, type: AssessmentType, chapterId: string) => void;
}

function AssessmentQuizDialog({
  open,
  assessmentType,
  chapterId,
  chapterTitle,
  onOpenChange,
  onQuizCreated,
}: AssessmentQuizDialogProps) {
  const [quizDraft, setQuizDraft] = useState<QuizDraft>(buildDefaultQuizDraft(assessmentType, chapterTitle));
  const [currentQuestion, setCurrentQuestion] = useState<QuestionDraft>(buildDefaultQuestionDraft());
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setQuizDraft(buildDefaultQuizDraft(assessmentType, chapterTitle));
    setCurrentQuestion(buildDefaultQuestionDraft());
    setError("");
    setSubmitting(false);
  }, [assessmentType, chapterTitle, open]);

  const handleAddQuestion = () => {
    if (!currentQuestion.question.trim()) {
      setError("Add a question prompt before saving.");
      return;
    }

    const trimmedQuestion = currentQuestion.question.trim();
    const question: Question = {
      id: `q-${Date.now()}`,
      question: trimmedQuestion,
      type: currentQuestion.type,
      points: Number(currentQuestion.points) || 10,
      options:
        currentQuestion.type === "multiple-choice"
          ? currentQuestion.options.map((option) => option.trim())
          : currentQuestion.type === "true-false"
            ? ["True", "False"]
            : undefined,
      correctAnswer:
        currentQuestion.type === "short-answer"
          ? String(currentQuestion.correctAnswer ?? "").trim()
          : Number(currentQuestion.correctAnswer ?? 0),
    };

    setQuizDraft((prev) => ({
      ...prev,
      questions: [...prev.questions, question],
    }));
    setCurrentQuestion(buildDefaultQuestionDraft());
    setError("");
  };

  const handleRemoveQuestion = (questionId: string) => {
    setQuizDraft((prev) => ({
      ...prev,
      questions: prev.questions.filter((question) => question.id !== questionId),
    }));
  };

  const handleCreateQuiz = async () => {
    if (!chapterId) return;
    if (!quizDraft.title.trim() || !quizDraft.description.trim() || quizDraft.questions.length === 0) {
      setError("Complete the quiz details and add at least one question.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const quizId = await createQuiz({
        title: quizDraft.title.trim(),
        description: quizDraft.description.trim(),
        materialId: chapterId,
        questions: quizDraft.questions,
        timeLimit: quizDraft.timeLimit,
        passingScore: quizDraft.passingScore,
        createdBy: "teacher-1",
      });

      const createdQuiz: Quiz = {
        id: quizId,
        title: quizDraft.title.trim(),
        description: quizDraft.description.trim(),
        materialId: chapterId,
        questions: quizDraft.questions,
        timeLimit: quizDraft.timeLimit,
        passingScore: quizDraft.passingScore,
        createdBy: "teacher-1",
        createdAt: new Date(),
      };

      onQuizCreated(createdQuiz, assessmentType, chapterId);
      onOpenChange(false);
    } catch (createError) {
      console.error(createError);
      setError("Failed to create quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            Create {assessmentType === "pre" ? "Pre-test" : "Post-test"} Quiz
          </DialogTitle>
          <DialogDescription>
            Build an assessment quiz for {chapterTitle}. Once created, it will be linked automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Title</label>
              <Input
                value={quizDraft.title}
                onChange={(event) => setQuizDraft((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Assessment title"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Time Limit (minutes)</label>
              <Input
                type="number"
                min="1"
                value={quizDraft.timeLimit}
                onChange={(event) =>
                  setQuizDraft((prev) => ({ ...prev, timeLimit: Number(event.target.value) || 0 }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Description</label>
            <Textarea
              value={quizDraft.description}
              onChange={(event) => setQuizDraft((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Describe what this quiz covers."
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Passing Score (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={quizDraft.passingScore}
                onChange={(event) =>
                  setQuizDraft((prev) => ({ ...prev, passingScore: Number(event.target.value) || 0 }))
                }
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-slate-800">Add Question</p>
              <select
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm"
                value={currentQuestion.type}
                onChange={(event) =>
                  setCurrentQuestion((prev) => ({
                    ...prev,
                    type: event.target.value as QuestionType,
                    correctAnswer: event.target.value === "short-answer" ? "" : 0,
                    options: ["", "", "", ""],
                  }))
                }
              >
                {QUESTION_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Question</label>
              <Input
                value={currentQuestion.question}
                onChange={(event) =>
                  setCurrentQuestion((prev) => ({ ...prev, question: event.target.value }))
                }
                placeholder="Enter the question prompt"
              />
            </div>

            {currentQuestion.type === "multiple-choice" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Options (choose correct answer)</label>
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={currentQuestion.correctAnswer === index ? "default" : "outline"}
                      onClick={() =>
                        setCurrentQuestion((prev) => ({ ...prev, correctAnswer: index }))
                      }
                    >
                      {String.fromCharCode(65 + index)}
                    </Button>
                    <Input
                      value={option}
                      onChange={(event) => {
                        const nextOptions = [...currentQuestion.options];
                        nextOptions[index] = event.target.value;
                        setCurrentQuestion((prev) => ({ ...prev, options: nextOptions }));
                      }}
                      placeholder={`Option ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
            )}

            {currentQuestion.type === "true-false" && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={currentQuestion.correctAnswer === 0 ? "default" : "outline"}
                  onClick={() => setCurrentQuestion((prev) => ({ ...prev, correctAnswer: 0 }))}
                >
                  True
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={currentQuestion.correctAnswer === 1 ? "default" : "outline"}
                  onClick={() => setCurrentQuestion((prev) => ({ ...prev, correctAnswer: 1 }))}
                >
                  False
                </Button>
              </div>
            )}

            {currentQuestion.type === "short-answer" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Expected Answer</label>
                <Input
                  value={String(currentQuestion.correctAnswer ?? "")}
                  onChange={(event) =>
                    setCurrentQuestion((prev) => ({ ...prev, correctAnswer: event.target.value }))
                  }
                  placeholder="Provide the expected answer"
                />
              </div>
            )}

            <div className="flex justify-end">
              <Button type="button" size="sm" onClick={handleAddQuestion}>
                Add Question
              </Button>
            </div>

            {quizDraft.questions.length > 0 && (
              <div className="space-y-2">
                {quizDraft.questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {index + 1}. {question.question}
                      </p>
                      <p className="text-xs text-slate-500 capitalize">
                        {question.type.replace("-", " ")} • {question.points} pts
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveQuestion(question.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button type="button" onClick={handleCreateQuiz} disabled={submitting}>
            {submitting ? "Creating..." : "Create Quiz"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface AssignmentTagEditorProps {
  title: string;
  description: string;
  tags: AssignmentTag[];
  schools: CurriculumNode[];
  busy: boolean;
  onToggle: (schoolSlug: string, yearSlug: string) => void;
  action?: ReactNode;
}

function AssignmentTagEditor({
  title,
  description,
  tags,
  schools,
  busy,
  onToggle,
  action,
}: AssignmentTagEditorProps) {
  return (
    <Card className={surfaceCardClassName}>
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-[1.35rem] font-semibold tracking-tight text-slate-950 dark:text-slate-50">
              {title}
            </CardTitle>
            <CardDescription className="text-sm leading-6 text-slate-500 dark:text-slate-300">
              {description}
            </CardDescription>
          </div>
          {action}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {schools.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-400">
            Add at least one school first so you can tag where this content is used.
          </div>
        ) : (
          schools.map((school) => (
            <div
              key={school.id}
              className="space-y-3 rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_18px_34px_-28px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-950"
            >
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-50">{school.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Choose which year groups use this content.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {YEAR_OPTIONS.map((year) => {
                  const active = hasAssignmentTag(tags, school.slug, year.slug);
                  return (
                    <Button
                      key={`${school.id}-${year.slug}`}
                      type="button"
                      size="sm"
                      variant={active ? "default" : "outline"}
                      disabled={busy}
                      onClick={() => onToggle(school.slug, year.slug)}
                      className={cn(
                        "h-9 px-4 text-xs font-semibold",
                        active
                          ? "bg-[linear-gradient(135deg,#2f6fff_0%,#1d4ed8_100%)] text-white shadow-[0_16px_34px_-24px_rgba(37,99,235,0.92)] hover:brightness-105"
                          : secondaryPillButtonClassName
                      )}
                    >
                      {year.title}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function EmptySelectionCard({ children }: { children: ReactNode }) {
  return (
    <Card className={dashedSurfaceCardClassName}>
      <CardContent className="p-5 text-sm leading-6 text-slate-500 dark:text-slate-400">
        {children}
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
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [chapterWeekDrafts, setChapterWeekDrafts] = useState<Record<string, ChapterWeekDraft>>({});
  const [chapterWeekBusyId, setChapterWeekBusyId] = useState<string | null>(null);
  const [assessmentDrafts, setAssessmentDrafts] = useState<Record<string, ChapterAssessmentDraft>>({});
  const [assessmentBusyId, setAssessmentBusyId] = useState<string | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizzesLoading, setQuizzesLoading] = useState(false);
  const [quizError, setQuizError] = useState("");
  const [assessmentDialogOpen, setAssessmentDialogOpen] = useState(false);
  const [assessmentDialogType, setAssessmentDialogType] = useState<AssessmentType>("pre");
  const [assessmentDialogChapterId, setAssessmentDialogChapterId] = useState<string | null>(null);

  const dragStateRef = useRef<DragState | null>(null);

  const [drafts, setDrafts] = useState<Record<NodeType, string>>({
    school: "",
    year: "",
    subject: "",
    chapter: "",
    lesson: "",
  });
  const [chapterWeekStartDraft, setChapterWeekStartDraft] = useState("");
  const [chapterWeekEndDraft, setChapterWeekEndDraft] = useState("");
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

  useEffect(() => {
    let active = true;

    const loadQuizzes = async () => {
      setQuizzesLoading(true);
      setQuizError("");

      try {
        const items = await getQuizzes();
        if (!active) return;
        setQuizzes(Array.isArray(items) ? items : []);
      } catch (loadError) {
        console.error(loadError);
        if (!active) return;
        setQuizError("Failed to load quizzes.");
        setQuizzes([]);
      } finally {
        if (active) setQuizzesLoading(false);
      }
    };

    loadQuizzes();

    return () => {
      active = false;
    };
  }, []);

  const schools = useMemo(
    () => tree.filter((node) => node.nodeType === "school" && node.parentId === null),
    [tree]
  );
  const subjects = useMemo(
    () => tree.filter((node) => node.nodeType === "subject" && node.parentId === null),
    [tree]
  );

  useEffect(() => {
    if (schools.length === 0) {
      setSelectedSchoolId(null);
      return;
    }

    if (!selectedSchoolId || !schools.some((item) => item.id === selectedSchoolId)) {
      const defaultSchool = schools.find((item) => item.slug === DEFAULT_SCHOOL_SLUG) ?? schools[0];
      setSelectedSchoolId(defaultSchool?.id ?? null);
    }
  }, [schools, selectedSchoolId]);

  useEffect(() => {
    if (subjects.length === 0) {
      setSelectedSubjectId(null);
      return;
    }

    if (!selectedSubjectId || !subjects.some((item) => item.id === selectedSubjectId)) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [selectedSubjectId, subjects]);

  const selectedSchool = useMemo(
    () => schools.find((item) => item.id === selectedSchoolId) ?? null,
    [schools, selectedSchoolId]
  );
  const selectedSubject = useMemo(
    () => subjects.find((item) => item.id === selectedSubjectId) ?? null,
    [selectedSubjectId, subjects]
  );

  const chapters = useMemo(
    () => selectedSubject?.children.filter((node) => node.nodeType === "chapter") ?? [],
    [selectedSubject]
  );

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

  const lessons = useMemo(
    () => selectedChapter?.children.filter((node) => node.nodeType === "lesson") ?? [],
    [selectedChapter]
  );

  useEffect(() => {
    if (lessons.length === 0) {
      setSelectedModuleId(null);
      return;
    }

    if (!selectedModuleId || !lessons.some((item) => item.id === selectedModuleId)) {
      setSelectedModuleId(lessons[0].id);
    }
  }, [lessons, selectedModuleId]);

  const selectedModule = useMemo(
    () => lessons.find((item) => item.id === selectedModuleId) ?? null,
    [lessons, selectedModuleId]
  );

  useEffect(() => {
    const nextDrafts: Record<string, ChapterWeekDraft> = {};
    for (const chapter of chapters) {
      nextDrafts[chapter.id] = parseChapterWeekDraft(chapter.metadata.weekRange);
    }
    setChapterWeekDrafts((currentDrafts) =>
      sameDraftMap(currentDrafts, nextDrafts) ? currentDrafts : nextDrafts
    );
  }, [chapters]);

  useEffect(() => {
    const nextDrafts: Record<string, ChapterAssessmentDraft> = {};
    for (const chapter of chapters) {
      nextDrafts[chapter.id] = parseAssessmentDraft(chapter.metadata ?? {});
    }
    setAssessmentDrafts((currentDrafts) =>
      sameAssessmentDraftMap(currentDrafts, nextDrafts) ? currentDrafts : nextDrafts
    );
  }, [chapters]);

  const selectedAssessmentDraft = useMemo(() => {
    if (!selectedChapter) return null;
    return assessmentDrafts[selectedChapter.id] ?? parseAssessmentDraft(selectedChapter.metadata ?? {});
  }, [assessmentDrafts, selectedChapter]);

  const selectedChapterTags = useMemo(
    () => (selectedChapter ? parseAssignmentTags(selectedChapter.metadata ?? {}) : []),
    [selectedChapter]
  );
  const selectedModuleTags = useMemo(
    () => (selectedModule ? parseAssignmentTags(selectedModule.metadata ?? {}) : []),
    [selectedModule]
  );

  const sortedQuizzes = useMemo(
    () => [...quizzes].sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime()),
    [quizzes]
  );
  const assessmentDialogChapter = useMemo(() => {
    if (!assessmentDialogChapterId) return null;
    return chapters.find((item) => item.id === assessmentDialogChapterId) ?? null;
  }, [assessmentDialogChapterId, chapters]);

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

  const createNode = async (nodeType: NodeType, parentId: string | null) => {
    const title = drafts[nodeType].trim();
    if (!title) return null;

    const metadata: Record<string, unknown> = {};
    if (nodeType === "chapter") {
      metadata.weekRange = formatChapterWeekRange(chapterWeekStartDraft, chapterWeekEndDraft);
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
      setDraft(nodeType, "");
      if (nodeType === "chapter") {
        setChapterWeekStartDraft("");
        setChapterWeekEndDraft("");
      }
      if (nodeType === "lesson") {
        setLessonWeekDraft("");
        setLessonCodeDraft("");
      }

      await loadTree();
      setMessage(`${nodeLabelByType[nodeType]} added.`);

      if (nodeType === "school") {
        setSelectedSchoolId(createdId);
      }
      if (nodeType === "subject") {
        setSelectedSubjectId(createdId);
      }
      if (nodeType === "chapter") {
        setSelectedChapterId(createdId);
      }
      if (nodeType === "lesson") {
        setSelectedModuleId(createdId);
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

  const saveNode = async (
    node: CurriculumNode,
    nextTitle: string,
    metadata: Record<string, unknown>,
    successMessage: string
  ) => {
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
        return false;
      }

      setMessage(successMessage);
      await loadTree();
      return true;
    } catch (saveError) {
      console.error(saveError);
      setError("Failed to update node.");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const updateChapterWeekDraft = (chapterId: string, field: "start" | "end", value: string) => {
    setChapterWeekDrafts((prev) => ({
      ...prev,
      [chapterId]: {
        ...(prev[chapterId] ?? { start: "", end: "" }),
        [field]: normalizeWeekInput(value),
      },
    }));
  };

  const saveChapterWeek = async (chapter: CurriculumNode) => {
    const draft = chapterWeekDrafts[chapter.id] ?? parseChapterWeekDraft(chapter.metadata.weekRange);
    const nextWeekRange = formatChapterWeekRange(draft.start, draft.end);
    const currentWeekRange = text(chapter.metadata.weekRange);
    if (nextWeekRange === currentWeekRange) return;

    setChapterWeekBusyId(chapter.id);
    await saveNode(
      chapter,
      chapter.title,
      { ...(chapter.metadata ?? {}), weekRange: nextWeekRange },
      "Chapter week range updated."
    );
    setChapterWeekBusyId(null);
  };

  const updateAssessmentDraft = (chapterId: string, updates: Partial<ChapterAssessmentDraft>) => {
    setAssessmentDrafts((prev) => ({
      ...prev,
      [chapterId]: {
        ...(prev[chapterId] ?? {
          preTestQuizId: "",
          postTestQuizId: "",
          preTestEnabled: false,
          postTestEnabled: false,
        }),
        ...updates,
      },
    }));
  };

  const applyAssessmentUpdate = async (
    chapter: CurriculumNode,
    updates: Partial<ChapterAssessmentDraft>
  ) => {
    const current = assessmentDrafts[chapter.id] ?? parseAssessmentDraft(chapter.metadata ?? {});
    const nextDraft = { ...current, ...updates };
    updateAssessmentDraft(chapter.id, updates);

    setAssessmentBusyId(chapter.id);
    await saveNode(
      chapter,
      chapter.title,
      {
        ...(chapter.metadata ?? {}),
        preTestQuizId: nextDraft.preTestQuizId,
        postTestQuizId: nextDraft.postTestQuizId,
        preTestEnabled: nextDraft.preTestEnabled,
        postTestEnabled: nextDraft.postTestEnabled,
      },
      "Chapter assessments updated."
    );
    setAssessmentBusyId(null);
  };

  const toggleAssignmentTag = async (node: CurriculumNode, schoolSlug: string, yearSlug: string) => {
    const currentTags = parseAssignmentTags(node.metadata ?? {});
    const nextTags = hasAssignmentTag(currentTags, schoolSlug, yearSlug)
      ? currentTags.filter((tag) => !(tag.schoolSlug === schoolSlug && tag.yearSlug === yearSlug))
      : [...currentTags, { schoolSlug, yearSlug }].sort((left, right) =>
          `${left.schoolSlug}:${left.yearSlug}`.localeCompare(`${right.schoolSlug}:${right.yearSlug}`)
        );

    await saveNode(
      node,
      node.title,
      { ...(node.metadata ?? {}), assignmentTags: nextTags },
      `${nodeLabelByType[node.nodeType]} tags updated.`
    );
  };

  const openAssessmentDialog = (chapter: CurriculumNode, type: AssessmentType) => {
    setAssessmentDialogChapterId(chapter.id);
    setAssessmentDialogType(type);
    setAssessmentDialogOpen(true);
  };

  const handleAssessmentQuizCreated = async (quiz: Quiz, type: AssessmentType, chapterId: string) => {
    setQuizzes((prev) => [quiz, ...prev]);
    const chapter = chapters.find((item) => item.id === chapterId) ?? null;
    if (!chapter) return;

    if (type === "pre") {
      await applyAssessmentUpdate(chapter, {
        preTestQuizId: quiz.id,
        preTestEnabled: true,
      });
      return;
    }

    await applyAssessmentUpdate(chapter, {
      postTestQuizId: quiz.id,
      postTestEnabled: true,
    });
  };

  const renameNode = async (node: CurriculumNode) => {
    const nextTitle = window.prompt(`Rename ${nodeLabelByType[node.nodeType]}`, node.title);
    if (!nextTitle) return;

    const metadata: Record<string, unknown> = { ...(node.metadata ?? {}) };

    if (node.nodeType === "chapter") {
      const currentDraft = parseChapterWeekDraft(metadata.weekRange);
      const nextStart = window.prompt("Start week", currentDraft.start);
      if (nextStart === null) return;

      const nextEnd = window.prompt("End week", currentDraft.end);
      if (nextEnd === null) return;

      metadata.weekRange = formatChapterWeekRange(nextStart, nextEnd);
    }

    if (node.nodeType === "lesson") {
      const nextWeek = window.prompt("Week", text(metadata.week));
      if (nextWeek === null) return;

      const nextLessonCode = window.prompt("Module code (example: 2.1)", text(metadata.lessonCode));
      if (nextLessonCode === null) return;

      metadata.week = nextWeek;
      metadata.lessonCode = nextLessonCode;
    }

    await saveNode(node, nextTitle.trim(), metadata, `${nodeLabelByType[node.nodeType]} updated.`);
  };

  const deleteNode = async (node: CurriculumNode) => {
    const hasChildren = node.children.length > 0;
    const confirmed = window.confirm(
      hasChildren
        ? `Delete "${node.title}" and all nested items?`
        : `Delete "${node.title}"?`
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

  const persistOrder = async (parentId: string | null, nodeType: NodeType, orderedNodeIds: string[]) => {
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/curriculum/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentId, nodeType, orderedNodeIds }),
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
    if (dragState.parentId !== targetNode.parentId || dragState.nodeType !== targetNode.nodeType) return;

    const currentIds = siblingNodes.map((item) => item.id);
    const nextIds = reorderIds(currentIds, dragState.nodeId, targetNode.id);

    if (hasSameOrder(currentIds, nextIds)) {
      dragStateRef.current = null;
      return;
    }

    await persistOrder(targetNode.parentId, targetNode.nodeType, nextIds);
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

    await persistOrder(parentId, dragState.nodeType, nextIds);
  };

  const handleDragStart = (node: CurriculumNode, event: DragEvent<HTMLDivElement>) => {
    dragStateRef.current = {
      nodeId: node.id,
      parentId: node.parentId,
      nodeType: node.nodeType,
    };
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", node.id);
  };

  const handleDragEnd = () => {
    dragStateRef.current = null;
  };

  return (
    <div className="space-y-5">
      <section className="rounded-[30px] border border-[#93a4bd] bg-[linear-gradient(180deg,rgba(255,248,233,0.98)_0%,rgba(255,252,245,0.98)_100%)] p-5 shadow-[0_28px_80px_-60px_rgba(15,23,42,0.42)] dark:border-slate-700 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.96)_0%,rgba(15,23,42,0.9)_100%)] sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative flex h-[102px] w-[102px] shrink-0 items-center justify-center rounded-full border border-[#f2bf73] bg-white/80 shadow-[0_24px_55px_-42px_rgba(245,158,11,0.9)] dark:border-amber-700/60 dark:bg-slate-900/90">
            <Sparkles className="absolute left-7 top-5 h-4 w-4 text-[#1d4ed8]" />
            <Sparkles className="absolute right-7 top-8 h-3.5 w-3.5 text-[#fb923c]" />
            <BookOpen className="h-12 w-12 text-[#153e7d] dark:text-blue-200" strokeWidth={1.9} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-[2.35rem]">
              Curriculum Portal
            </h1>
            <p className="max-w-3xl text-[15px] leading-7 text-slate-500 dark:text-slate-300">
              Build a global library in the order Subject, Chapter, Module. Schools and years are tagging
              rules, not the primary hierarchy.
            </p>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-[22px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
          {message}
        </div>
      )}

      {loading ? (
        <Card className={surfaceCardClassName}>
          <CardContent className="flex items-center gap-3 p-6 text-sm text-slate-500 dark:text-slate-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading curriculum...
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-[1.02fr_1fr]">
            <NodeColumn
              title="Manage Schools"
              description="Schools are usage tags. Add schools here, then assign content to year groups below."
              nodeType="school"
              parentId={null}
              nodes={schools}
              selectedId={selectedSchoolId}
              disabled={false}
              addDisabledReason=""
              draftTitle={drafts.school}
              draftWeekRangeStart=""
              draftWeekRangeEnd=""
              draftWeek=""
              draftLessonCode=""
              busy={busy}
              onDraftTitleChange={(value) => setDraft("school", value)}
              onDraftWeekRangeStartChange={() => undefined}
              onDraftWeekRangeEndChange={() => undefined}
              onDraftWeekChange={() => undefined}
              onDraftLessonCodeChange={() => undefined}
              onSelect={setSelectedSchoolId}
              onCreate={() => createNode("school", null)}
              onRename={renameNode}
              onDelete={deleteNode}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              canDropOnNode={canDropOnNode}
              canDropAtEnd={canDropAtEnd}
              onDropOnNode={dropOnNode}
              onDropAtEnd={dropAtEnd}
            />

            <Card className={surfaceCardClassName}>
              <CardHeader className="space-y-2 pb-4">
                <CardTitle className="text-[1.45rem] font-semibold tracking-tight text-slate-950 dark:text-slate-50">
                  How This Builder Works
                </CardTitle>
                <CardDescription className="text-sm leading-6 text-slate-500 dark:text-slate-300">
                  Create reusable modules first, group them into chapters, then place chapters under a subject.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { label: selectedSchool?.title ?? "Select school", active: Boolean(selectedSchool) },
                    { label: selectedSubject?.title ?? "Select subject", active: Boolean(selectedSubject) },
                    { label: selectedChapter?.title ?? "Select chapter", active: Boolean(selectedChapter) },
                    { label: selectedModule?.title ?? "Select module", active: Boolean(selectedModule) },
                  ].map((item, index, items) => (
                    <div key={`${item.label}-${index}`} className="flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-3 py-1.5 text-xs font-semibold",
                          item.active
                            ? "bg-[#ff6b1a] text-white shadow-[0_14px_30px_-20px_rgba(255,107,26,0.95)]"
                            : "border border-[#d8dfea] bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                        )}
                      >
                        {item.label}
                      </span>
                      {index < items.length - 1 && (
                        <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="rounded-[22px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Available year tags</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {YEAR_OPTIONS.map((year) => (
                      <span
                        key={year.slug}
                        className="inline-flex h-9 items-center rounded-full border border-[#d8dfea] bg-white px-4 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                      >
                        {year.title}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-[22px] border border-dashed border-[#cfd9ea] bg-slate-50/80 p-4 text-sm leading-6 text-slate-500 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-400">
                  Module tags override chapter tags. Use chapter tags when the whole chapter belongs to a year,
                  and module tags when a chapter is split across years.
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <NodeColumn
              title="Manage Subjects"
              description="Global subjects shared across schools and years."
              nodeType="subject"
              parentId={null}
              nodes={subjects}
              selectedId={selectedSubjectId}
              disabled={false}
              addDisabledReason=""
              draftTitle={drafts.subject}
              draftWeekRangeStart=""
              draftWeekRangeEnd=""
              draftWeek=""
              draftLessonCode=""
              busy={busy}
              onDraftTitleChange={(value) => setDraft("subject", value)}
              onDraftWeekRangeStartChange={() => undefined}
              onDraftWeekRangeEndChange={() => undefined}
              onDraftWeekChange={() => undefined}
              onDraftLessonCodeChange={() => undefined}
              onSelect={(nodeId) => {
                setSelectedSubjectId(nodeId);
                setSelectedChapterId(null);
                setSelectedModuleId(null);
              }}
              onCreate={() => createNode("subject", null)}
              onRename={renameNode}
              onDelete={deleteNode}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              canDropOnNode={canDropOnNode}
              canDropAtEnd={canDropAtEnd}
              onDropOnNode={dropOnNode}
              onDropAtEnd={dropAtEnd}
            />

            {selectedSubject ? (
              <NodeColumn
                title="Manage Chapters"
                description={`Inside subject: ${selectedSubject.title}. Add chapters and organise reusable module groups.`}
                nodeType="chapter"
                parentId={selectedSubject.id}
                nodes={chapters}
                selectedId={selectedChapterId}
                disabled={false}
                addDisabledReason=""
                draftTitle={drafts.chapter}
                draftWeekRangeStart={chapterWeekStartDraft}
                draftWeekRangeEnd={chapterWeekEndDraft}
                draftWeek=""
                draftLessonCode=""
                busy={busy}
                onDraftTitleChange={(value) => setDraft("chapter", value)}
                onDraftWeekRangeStartChange={(value) => setChapterWeekStartDraft(normalizeWeekInput(value))}
                onDraftWeekRangeEndChange={(value) => setChapterWeekEndDraft(normalizeWeekInput(value))}
                onDraftWeekChange={() => undefined}
                onDraftLessonCodeChange={() => undefined}
                onSelect={(nodeId) => {
                  setSelectedChapterId(nodeId);
                  setSelectedModuleId(null);
                }}
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
              <EmptySelectionCard>Select or add a subject to manage its chapters.</EmptySelectionCard>
            )}

            {selectedChapter ? (
              <NodeColumn
                title="Manage Modules"
                description={`Inside chapter: ${selectedChapter.title}. Build the reusable modules here.`}
                nodeType="lesson"
                parentId={selectedChapter.id}
                nodes={lessons}
                selectedId={selectedModuleId}
                disabled={false}
                addDisabledReason=""
                draftTitle={drafts.lesson}
                draftWeekRangeStart=""
                draftWeekRangeEnd=""
                draftWeek={lessonWeekDraft}
                draftLessonCode={lessonCodeDraft}
                busy={busy}
                onDraftTitleChange={(value) => setDraft("lesson", value)}
                onDraftWeekRangeStartChange={() => undefined}
                onDraftWeekRangeEndChange={() => undefined}
                onDraftWeekChange={setLessonWeekDraft}
                onDraftLessonCodeChange={setLessonCodeDraft}
                onSelect={setSelectedModuleId}
                onCreate={() => createNode("lesson", selectedChapter.id)}
                onRename={renameNode}
                onDelete={deleteNode}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                canDropOnNode={canDropOnNode}
                canDropAtEnd={canDropAtEnd}
                onDropOnNode={dropOnNode}
                onDropAtEnd={dropAtEnd}
                lessonPreviewBasePath={null}
              />
            ) : (
              <EmptySelectionCard>Select or add a chapter to manage its modules.</EmptySelectionCard>
            )}
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {selectedChapter ? (
              <Card className={surfaceCardClassName}>
                <CardHeader className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <CardTitle className="text-[1.35rem] font-semibold tracking-tight text-slate-950 dark:text-slate-50">
                        Chapter Settings
                      </CardTitle>
                      <CardDescription className="text-sm leading-6 text-slate-500 dark:text-slate-300">
                        Set chapter-wide defaults like assessments and year tags. Module tags can override
                        these.
                      </CardDescription>
                    </div>
                    <Button asChild variant="outline" className={cn("h-9 px-4 text-xs font-medium", secondaryPillButtonClassName)}>
                      <Link href={`/admin/module-editor?nodeId=${encodeURIComponent(selectedChapter.id)}`}>
                        <FilePenLine className="mr-2 h-4 w-4" />
                        Open Chapter Editor
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedAssessmentDraft && (
                    <div className="grid gap-4 md:grid-cols-2">
                      {([
                        {
                          type: "pre" as AssessmentType,
                          title: "Pre-test",
                          helper: "Shown when students start this chapter.",
                          enabled: selectedAssessmentDraft.preTestEnabled,
                          quizId: selectedAssessmentDraft.preTestQuizId,
                        },
                        {
                          type: "post" as AssessmentType,
                          title: "Post-test",
                          helper: "Shown after students finish the final lesson.",
                          enabled: selectedAssessmentDraft.postTestEnabled,
                          quizId: selectedAssessmentDraft.postTestQuizId,
                        },
                      ] as const).map((assessment) => (
                        <div
                          key={assessment.type}
                          className="space-y-3 rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_18px_34px_-28px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-950"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                                {assessment.title}
                              </p>
                              <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                                {assessment.helper}
                              </p>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant={assessment.enabled ? "default" : "outline"}
                              disabled={busy || assessmentBusyId === selectedChapter.id}
                              className={cn(
                                "h-8 px-3 text-xs font-semibold",
                                assessment.enabled
                                  ? "bg-[linear-gradient(135deg,#2f6fff_0%,#1d4ed8_100%)] text-white shadow-[0_16px_34px_-24px_rgba(37,99,235,0.92)] hover:brightness-105"
                                  : secondaryPillButtonClassName
                              )}
                              onClick={() =>
                                applyAssessmentUpdate(selectedChapter, {
                                  ...(assessment.type === "pre"
                                    ? { preTestEnabled: !assessment.enabled }
                                    : { postTestEnabled: !assessment.enabled }),
                                })
                              }
                            >
                              {assessment.enabled ? "Enabled" : "Disabled"}
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                              Linked quiz
                            </label>
                            <select
                              className="h-10 w-full rounded-xl border border-[#dde5f2] bg-white px-3 text-sm text-slate-700 shadow-[inset_0_1px_2px_rgba(15,23,42,0.05)] focus:outline-none focus:ring-2 focus:ring-[#c9d9ff] disabled:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:disabled:bg-slate-900"
                              value={assessment.quizId}
                              disabled={busy || assessmentBusyId === selectedChapter.id || quizzesLoading}
                              onChange={(event) => {
                                const nextId = event.target.value;
                                applyAssessmentUpdate(selectedChapter, {
                                  ...(assessment.type === "pre"
                                    ? { preTestQuizId: nextId }
                                    : { postTestQuizId: nextId }),
                                });
                              }}
                            >
                              <option value="">Select a quiz...</option>
                              {sortedQuizzes.map((quiz) => (
                                <option key={quiz.id} value={quiz.id}>
                                  {quiz.title}
                                </option>
                              ))}
                            </select>
                            {assessment.enabled && !assessment.quizId && (
                              <p className="text-[11px] text-amber-600 dark:text-amber-300">
                                Link a quiz so this assessment appears for students.
                              </p>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              disabled={busy || assessmentBusyId === selectedChapter.id}
                              className={cn("h-9 px-4 text-xs font-medium", secondaryPillButtonClassName)}
                              onClick={() => openAssessmentDialog(selectedChapter, assessment.type)}
                            >
                              Create {assessment.title}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {quizzesLoading && <p className="text-xs text-slate-400 dark:text-slate-500">Loading quizzes...</p>}
                  {quizError && <p className="text-xs text-red-600 dark:text-red-300">{quizError}</p>}
                </CardContent>
              </Card>
            ) : (
              <EmptySelectionCard>Select a chapter to manage assessments and chapter-wide settings.</EmptySelectionCard>
            )}

            {selectedModule ? (
              <AssignmentTagEditor
                title="Module Year Tags"
                description="Tag modules to specific schools and years. These tags override chapter defaults."
                tags={selectedModuleTags}
                schools={schools}
                busy={busy}
                action={
                  <Button asChild variant="outline" className={cn("h-9 px-4 text-xs font-medium", secondaryPillButtonClassName)}>
                    <Link href={`/admin/module-editor?nodeId=${encodeURIComponent(selectedModule.id)}`}>
                      <FilePenLine className="mr-2 h-4 w-4" />
                      Open Module Editor
                    </Link>
                  </Button>
                }
                onToggle={(schoolSlug, yearSlug) => toggleAssignmentTag(selectedModule, schoolSlug, yearSlug)}
              />
            ) : (
              <EmptySelectionCard>Select a module to control year-level placement across schools.</EmptySelectionCard>
            )}
          </div>

          {selectedChapter ? (
            <AssignmentTagEditor
              title="Chapter Year Tags"
              description="Use these when the whole chapter is assigned to a year. Modules can still override this."
              tags={selectedChapterTags}
              schools={schools}
              busy={busy}
              onToggle={(schoolSlug, yearSlug) => toggleAssignmentTag(selectedChapter, schoolSlug, yearSlug)}
            />
          ) : (
            <EmptySelectionCard>Select a chapter to assign school and year tags across the full chapter.</EmptySelectionCard>
          )}
        </div>
      )}

      <AssessmentQuizDialog
        open={assessmentDialogOpen}
        assessmentType={assessmentDialogType}
        chapterId={assessmentDialogChapterId}
        chapterTitle={assessmentDialogChapter?.title ?? selectedChapter?.title ?? "Chapter"}
        onOpenChange={(open) => {
          setAssessmentDialogOpen(open);
          if (!open) setAssessmentDialogChapterId(null);
        }}
        onQuizCreated={handleAssessmentQuizCreated}
      />
    </div>
  );
}
