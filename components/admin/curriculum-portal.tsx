"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  FilePenLine,
  FlaskConical,
  GripVertical,
  LibraryBig,
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  Rocket,
  School,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
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

type ScopedChapterEntry = {
  chapter: CurriculumNode;
  lessons: CurriculumNode[];
};

type LessonEditDraft = {
  lessonId: string;
  title: string;
  week: string;
  lessonCode: string;
};

interface CurriculumPortalProps {
  lockedSchoolSlug?: string | null;
  lockedSubjectSlug?: string | null;
  compactMode?: boolean;
}

const nodeLabelByType: Record<NodeType, string> = {
  school: "School",
  year: "Year",
  subject: "Subject",
  chapter: "Chapter",
  lesson: "Module",
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

function getVisibleLessonsForScope(chapter: CurriculumNode, schoolSlug: string, yearSlug: string) {
  const chapterTags = parseAssignmentTags(chapter.metadata ?? {});
  const lessonNodes = chapter.children.filter((node) => node.nodeType === "lesson");

  return lessonNodes.filter((lesson) => {
    const lessonTags = parseAssignmentTags(lesson.metadata ?? {});

    if (lessonTags.length > 0) {
      return hasAssignmentTag(lessonTags, schoolSlug, yearSlug);
    }

    if (chapterTags.length > 0) {
      return hasAssignmentTag(chapterTags, schoolSlug, yearSlug);
    }

    return false;
  });
}

function getVisibleChapterEntriesForScope(
  subject: CurriculumNode,
  schoolSlug: string,
  yearSlug: string
): ScopedChapterEntry[] {
  return subject.children
    .filter((node) => node.nodeType === "chapter")
    .map((chapter) => ({
      chapter,
      lessons: getVisibleLessonsForScope(chapter, schoolSlug, yearSlug),
    }))
    .filter(({ chapter, lessons }) => {
      const chapterTags = parseAssignmentTags(chapter.metadata ?? {});
      return lessons.length > 0 || hasAssignmentTag(chapterTags, schoolSlug, yearSlug);
    });
}

function stripAssignmentTagsForSchool(metadata: Record<string, unknown>, schoolSlug: string) {
  const currentTags = parseAssignmentTags(metadata);
  return {
    ...(metadata ?? {}),
    assignmentTags: currentTags.filter((tag) => tag.schoolSlug !== schoolSlug),
  };
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

export function CurriculumPortal({
  lockedSchoolSlug = null,
  lockedSubjectSlug = null,
  compactMode = false,
}: CurriculumPortalProps) {
  const [tree, setTree] = useState<CurriculumNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedYearSlug, setSelectedYearSlug] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [collapsedBranches, setCollapsedBranches] = useState<Record<string, boolean>>({});
  const [chapterWeekDrafts, setChapterWeekDrafts] = useState<Record<string, ChapterWeekDraft>>({});
  const [chapterTitleDraft, setChapterTitleDraft] = useState("");
  const [lessonEditDraft, setLessonEditDraft] = useState<LessonEditDraft | null>(null);
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
  const visibleSchools = useMemo(
    () => (lockedSchoolSlug ? schools.filter((item) => item.slug === lockedSchoolSlug) : schools),
    [lockedSchoolSlug, schools]
  );
  const subjects = useMemo(() => {
    const topLevelSubjects = tree.filter((node) => node.nodeType === "subject" && node.parentId === null);

    return topLevelSubjects.filter((subject) => {
      if (lockedSubjectSlug && subject.slug !== lockedSubjectSlug) {
        return false;
      }

      if (!lockedSchoolSlug) {
        return true;
      }

      return subject.children.some((chapter) => {
        if (chapter.nodeType !== "chapter") return false;
        const chapterTags = parseAssignmentTags(chapter.metadata ?? {});
        if (chapterTags.some((tag) => tag.schoolSlug === lockedSchoolSlug)) {
          return true;
        }

        return chapter.children.some((lesson) => {
          if (lesson.nodeType !== "lesson") return false;
          return parseAssignmentTags(lesson.metadata ?? {}).some((tag) => tag.schoolSlug === lockedSchoolSlug);
        });
      });
    });
  }, [lockedSchoolSlug, lockedSubjectSlug, tree]);

  useEffect(() => {
    if (visibleSchools.length === 0) {
      setSelectedSchoolId(null);
      return;
    }

    if (lockedSchoolSlug) {
      const lockedSchool = visibleSchools[0] ?? null;
      if (selectedSchoolId !== lockedSchool?.id) {
        setSelectedSchoolId(lockedSchool?.id ?? null);
      }
      return;
    }

    if (!selectedSchoolId || !visibleSchools.some((item) => item.id === selectedSchoolId)) {
      const defaultSchool =
        visibleSchools.find((item) => item.slug === DEFAULT_SCHOOL_SLUG) ?? visibleSchools[0];
      setSelectedSchoolId(defaultSchool?.id ?? null);
    }
  }, [lockedSchoolSlug, selectedSchoolId, visibleSchools]);

  useEffect(() => {
    if (subjects.length === 0) {
      setSelectedSubjectId(null);
      return;
    }

    if (lockedSubjectSlug) {
      const lockedSubject = subjects.find((item) => item.slug === lockedSubjectSlug) ?? null;
      if (selectedSubjectId !== lockedSubject?.id) {
        setSelectedSubjectId(lockedSubject?.id ?? null);
      }
      return;
    }

    if (!selectedSubjectId || !subjects.some((item) => item.id === selectedSubjectId)) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [lockedSubjectSlug, selectedSubjectId, subjects]);

  const selectedSchool = useMemo(
    () => visibleSchools.find((item) => item.id === selectedSchoolId) ?? null,
    [selectedSchoolId, visibleSchools]
  );
  const selectedSubject = useMemo(
    () => subjects.find((item) => item.id === selectedSubjectId) ?? null,
    [selectedSubjectId, subjects]
  );
  const isLockedSubjectWorkspace = Boolean(compactMode && lockedSchoolSlug && lockedSubjectSlug);
  const toggleBranch = useCallback((key: string) => {
    setCollapsedBranches((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }, []);
  const isBranchCollapsed = useCallback(
    (key: string) => Boolean(collapsedBranches[key]),
    [collapsedBranches]
  );

  const scopedYearGroups = useMemo(() => {
    if (!isLockedSubjectWorkspace || !selectedSchool || !selectedSubject) {
      return [];
    }

    return YEAR_OPTIONS.map((year) => ({
      year,
      chapters: getVisibleChapterEntriesForScope(selectedSubject, selectedSchool.slug, year.slug),
    }));
  }, [isLockedSubjectWorkspace, selectedSchool, selectedSubject]);

  useEffect(() => {
    if (!isLockedSubjectWorkspace) {
      setSelectedYearSlug(null);
      return;
    }

    const availableYears = scopedYearGroups.filter((group) => group.chapters.length > 0);
    const fallbackYear = availableYears[0]?.year.slug ?? YEAR_OPTIONS[0]?.slug ?? null;

    if (!selectedYearSlug || !scopedYearGroups.some((group) => group.year.slug === selectedYearSlug)) {
      setSelectedYearSlug(fallbackYear);
      return;
    }

    const selectedYearGroup = scopedYearGroups.find((group) => group.year.slug === selectedYearSlug) ?? null;
    if (selectedYearGroup || !fallbackYear) return;

    setSelectedYearSlug(fallbackYear);
  }, [isLockedSubjectWorkspace, scopedYearGroups, selectedYearSlug]);

  const chapters = useMemo(() => {
    if (isLockedSubjectWorkspace && selectedSchool && selectedSubject && selectedYearSlug) {
      return getVisibleChapterEntriesForScope(selectedSubject, selectedSchool.slug, selectedYearSlug).map(
        (entry) => entry.chapter
      );
    }

    return selectedSubject?.children.filter((node) => node.nodeType === "chapter") ?? [];
  }, [isLockedSubjectWorkspace, selectedSchool, selectedSubject, selectedYearSlug]);

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

  useEffect(() => {
    setChapterTitleDraft(selectedChapter?.title ?? "");
  }, [selectedChapter]);

  const lessons = useMemo(() => {
    if (isLockedSubjectWorkspace && selectedSchool && selectedChapter && selectedYearSlug) {
      return getVisibleLessonsForScope(selectedChapter, selectedSchool.slug, selectedYearSlug);
    }

    return selectedChapter?.children.filter((node) => node.nodeType === "lesson") ?? [];
  }, [isLockedSubjectWorkspace, selectedChapter, selectedSchool, selectedYearSlug]);

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
    if (!lessonEditDraft) return;

    const activeLesson = lessons.find((lesson) => lesson.id === lessonEditDraft.lessonId) ?? null;
    if (!activeLesson) {
      setLessonEditDraft(null);
    }
  }, [lessonEditDraft, lessons]);

  const allChapters = useMemo(
    () => subjects.flatMap((subject) => subject.children.filter((node) => node.nodeType === "chapter")),
    [subjects]
  );
  const allLessons = useMemo(
    () => allChapters.flatMap((chapter) => chapter.children.filter((node) => node.nodeType === "lesson")),
    [allChapters]
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

  const setDraft = (nodeType: NodeType, value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [nodeType]: value,
    }));
  };

  const createNode = async (
    nodeType: NodeType,
    parentId: string | null,
    override?: { title?: string; metadata?: Record<string, unknown> }
  ) => {
    const title = (override?.title ?? drafts[nodeType]).trim();
    if (!title) return null;

    const metadata: Record<string, unknown> = { ...(override?.metadata ?? {}) };
    if (nodeType === "chapter") {
      metadata.weekRange =
        metadata.weekRange ?? formatChapterWeekRange(chapterWeekStartDraft, chapterWeekEndDraft);
      if (
        isLockedSubjectWorkspace &&
        selectedSchool &&
        selectedYearSlug &&
        !Array.isArray(metadata.assignmentTags)
      ) {
        metadata.assignmentTags = [{ schoolSlug: selectedSchool.slug, yearSlug: selectedYearSlug }];
      }
    }
    if (nodeType === "lesson") {
      metadata.week = metadata.week ?? lessonWeekDraft.trim();
      metadata.lessonCode = metadata.lessonCode ?? lessonCodeDraft.trim();
      if (
        isLockedSubjectWorkspace &&
        selectedSchool &&
        selectedYearSlug &&
        !Array.isArray(metadata.assignmentTags)
      ) {
        metadata.assignmentTags = [{ schoolSlug: selectedSchool.slug, yearSlug: selectedYearSlug }];
      }
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


  const saveSelectedChapterDetails = async () => {
    if (!selectedChapter) return;

    const draft = chapterWeekDrafts[selectedChapter.id] ?? parseChapterWeekDraft(selectedChapter.metadata.weekRange);
    const nextWeekRange = formatChapterWeekRange(draft.start, draft.end);
    const nextTitle = chapterTitleDraft.trim();
    const currentWeekRange = text(selectedChapter.metadata.weekRange);

    if (!nextTitle) {
      setError("Chapter title is required.");
      return;
    }

    if (nextTitle === selectedChapter.title && nextWeekRange === currentWeekRange) {
      return;
    }

    await saveNode(
      selectedChapter,
      nextTitle,
      { ...(selectedChapter.metadata ?? {}), weekRange: nextWeekRange },
      "Chapter updated."
    );
  };

  const createPromptedNode = async (nodeType: NodeType, parentId: string | null) => {
    const label = nodeLabelByType[nodeType];
    const title = window.prompt(`Add ${label.toLowerCase()}`);
    if (!title?.trim()) return;
    await createNode(nodeType, parentId, { title });
  };

  const beginLessonEdit = (lesson: CurriculumNode) => {
    setLessonEditDraft({
      lessonId: lesson.id,
      title: lesson.title,
      week: text(lesson.metadata.week),
      lessonCode: text(lesson.metadata.lessonCode),
    });
  };

  const updateLessonEditDraft = (field: keyof Omit<LessonEditDraft, "lessonId">, value: string) => {
    setLessonEditDraft((current) => (current ? { ...current, [field]: value } : current));
  };

  const saveLessonEdit = async () => {
    if (!lessonEditDraft) return;

    const lesson = lessons.find((item) => item.id === lessonEditDraft.lessonId) ?? null;
    if (!lesson) {
      setLessonEditDraft(null);
      return;
    }

    const nextTitle = lessonEditDraft.title.trim();
    if (!nextTitle) {
      setError("Lesson / module title is required.");
      return;
    }

    const didSave = await saveNode(
      lesson,
      nextTitle,
      {
        ...(lesson.metadata ?? {}),
        week: lessonEditDraft.week.trim(),
        lessonCode: lessonEditDraft.lessonCode.trim(),
      },
      "Lesson / module updated."
    );

    if (didSave) {
      setLessonEditDraft(null);
    }
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
    if (lockedSchoolSlug && node.nodeType !== "school") {
      const confirmed = window.confirm(`Remove "${node.title}" from ${selectedSchool?.title ?? "this school"} only?`);
      if (!confirmed) return;

      const detachQueue =
        node.nodeType === "subject"
          ? node.children
              .filter((child) => child.nodeType === "chapter")
              .flatMap((chapter) => [chapter, ...chapter.children.filter((child) => child.nodeType === "lesson")])
          : node.nodeType === "chapter"
            ? [node, ...node.children.filter((child) => child.nodeType === "lesson")]
            : [node];

      setBusy(true);
      setError("");
      setMessage("");

      try {
        for (const item of detachQueue) {
          const response = await fetch(`/api/admin/curriculum/${item.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: item.title,
              metadata: stripAssignmentTagsForSchool(item.metadata ?? {}, lockedSchoolSlug),
            }),
          });
          const data = await response.json();

          if (!response.ok || !data.ok) {
            setError(data.error || "Failed to remove node from this school.");
            return;
          }
        }

        setMessage(`${nodeLabelByType[node.nodeType]} removed from ${selectedSchool?.title ?? "this school"}.`);
        await loadTree();
      } catch (deleteError) {
        console.error(deleteError);
        setError("Failed to remove node from this school.");
      } finally {
        setBusy(false);
      }

      return;
    }

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

  const workflowSteps = [
    {
      title: "Select School",
      description: "Add your schools and assign year groups.",
    },
    {
      title: "Choose Subject",
      description: "Create reusable subjects.",
    },
    {
      title: "Organise Chapters",
      description: "Break content into chapters by weeks.",
    },
    {
      title: "Add Lessons",
      description: "Attach modules from the library.",
    },
  ];
  const workflowStep = selectedModule ? 4 : selectedChapter ? 3 : selectedSubject ? 2 : 1;
  const selectedSchoolChapterTags = selectedSchool
    ? selectedChapterTags.filter((tag) => tag.schoolSlug === selectedSchool.slug)
    : [];

  return (
    <div className="space-y-5 text-slate-900">
      {!compactMode ? (
      <header className="flex flex-col gap-4 rounded-[28px] border border-[#dce7f6] bg-white/88 px-5 py-4 shadow-[0_22px_60px_-48px_rgba(37,99,235,0.3)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/88 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#2f6fff]">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Admin</p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-slate-50">
              Curriculum Portal
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <button className="inline-flex h-10 items-center gap-2 rounded-full px-3 font-semibold text-slate-600 transition-colors hover:bg-[#f7faff] hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
            <CircleHelp className="h-4 w-4" />
            Help
          </button>
          <button className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-[#f7faff] hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff6b1a] px-1 text-[10px] font-bold text-white">
              3
            </span>
          </button>
          <button className="inline-flex h-10 items-center gap-2 rounded-full border border-[#dce7f6] bg-white px-2.5 pr-3 font-semibold text-slate-700 shadow-sm transition-colors hover:bg-[#f7faff] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0b1d3a] text-xs font-bold text-white">
              AD
            </span>
            Admin
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      </header>
      ) : null}

      {!compactMode ? (
      <section className="rounded-[30px] border border-[#d7e5fb] bg-[linear-gradient(180deg,rgba(238,246,255,0.95)_0%,rgba(248,251,255,0.98)_100%)] p-5 shadow-[0_28px_80px_-60px_rgba(37,99,235,0.42)] dark:border-slate-700 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.96)_0%,rgba(15,23,42,0.9)_100%)] sm:p-6">
        <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)_220px] xl:items-center">
          <div className="flex items-center gap-4">
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-[#cfe0ff] bg-white shadow-[0_24px_55px_-42px_rgba(37,99,235,0.55)] dark:border-slate-700 dark:bg-slate-900">
              <Sparkles className="absolute left-5 top-5 h-3.5 w-3.5 text-[#ff9b52]" />
              <Rocket className="h-11 w-11 text-[#2f6fff]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-slate-50">How it works</h2>
              <p className="mt-2 max-w-[220px] text-sm leading-6 text-slate-500 dark:text-slate-300">
                Build your curriculum structure in a simple step-by-step flow.
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            {workflowSteps.map((step, index) => {
              const stepNumber = index + 1;
              const active = workflowStep === stepNumber;
              const complete = workflowStep > stepNumber;

              return (
                <div key={step.title} className="relative min-w-0">
                  {index < workflowSteps.length - 1 && (
                    <div className="absolute left-[42px] right-[-12px] top-5 hidden h-px bg-[#d7e5fb] md:block" />
                  )}
                  <div className="relative flex items-start gap-3 md:block">
                    <div
                      className={cn(
                        "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-bold",
                        active || complete
                          ? "border-[#2f6fff] bg-[#2f6fff] text-white shadow-[0_14px_28px_-18px_rgba(47,111,255,0.9)]"
                          : "border-[#d8e4f7] bg-white text-slate-500 dark:bg-slate-900"
                      )}
                    >
                      {stepNumber}
                    </div>
                    <div className="mt-0 md:mt-3">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{step.title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-300">{step.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-2">
            <Button
              type="button"
              className={cn("h-12 justify-center gap-2 rounded-2xl text-sm font-semibold", primaryActionClassName)}
              onClick={() => {
                if (!selectedSubject) {
                  createPromptedNode("subject", null);
                  return;
                }
                if (!selectedChapter) {
                  createPromptedNode("chapter", selectedSubject.id);
                  return;
                }
                createPromptedNode("lesson", selectedChapter.id);
              }}
            >
              Start Building
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              asChild
              variant="outline"
              className={cn("h-11 justify-center gap-2 rounded-2xl text-sm font-semibold", secondaryPillButtonClassName)}
            >
              <Link href="/admin/modules">
                <LibraryBig className="h-4 w-4" />
                View Module Library
              </Link>
            </Button>
          </div>
        </div>
      </section>
      ) : null}

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
        <div className="space-y-5">
          {!compactMode ? (
          <section className="flex flex-wrap items-center gap-2 rounded-[24px] border border-[#e0eaf7] bg-white/88 px-4 py-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900/88">
            <span className="mr-2 font-semibold text-slate-600 dark:text-slate-300">Current path:</span>
            {[
              { label: selectedSchool?.title ?? "Select school", icon: School },
              { label: selectedSubject?.title ?? "Select subject", icon: FlaskConical },
              { label: selectedChapter?.title ?? "Select chapter", icon: BookOpen },
              { label: selectedModule?.title ?? "Select lesson", icon: FilePenLine },
            ].map((item, index, items) => {
              const Icon = item.icon;

              return (
                <div key={`${item.label}-${index}`} className="flex items-center gap-2">
                  <span className="inline-flex h-9 items-center gap-2 rounded-full border border-[#e0eaf7] bg-white px-4 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                    <Icon className="h-4 w-4 text-slate-500" />
                    {item.label}
                  </span>
                  {index < items.length - 1 && <ChevronRight className="h-4 w-4 text-slate-300" />}
                </div>
              );
            })}
          </section>
          ) : null}

          <div
            className={cn(
              "grid gap-5",
              compactMode
                ? "xl:grid-cols-[380px_minmax(0,1fr)]"
                : "xl:grid-cols-[340px_minmax(0,1fr)_320px]"
            )}
          >
            <aside className="rounded-[28px] border border-[#e0eaf7] bg-white/92 p-4 shadow-[0_24px_70px_-54px_rgba(15,23,42,0.26)] dark:border-slate-800 dark:bg-slate-900/88">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-950 dark:text-slate-50">Structure</h2>
                <button
                  type="button"
                  onClick={() => {
                    if (isLockedSubjectWorkspace && selectedSubject) {
                      void createPromptedNode("chapter", selectedSubject.id);
                      return;
                    }

                    void createPromptedNode(lockedSchoolSlug ? "subject" : "school", null);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d8e4f7] text-[#2f6fff] transition-colors hover:bg-[#eef4ff]"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {isLockedSubjectWorkspace ? (
                  <>
                    {selectedSchool && selectedSubject ? (
                      <div className="space-y-2">
                        <div className="rounded-[22px] border border-[#e7edf8] bg-[#fbfdff] p-3">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                            <School className="h-3.5 w-3.5" />
                            Locked workspace
                          </div>
                          <p className="mt-2 text-sm font-semibold text-slate-900">
                            {selectedSchool.title} · {selectedSubject.title}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="space-y-2">
                            <div
                              className={cn(
                                "flex items-center rounded-2xl px-3 py-2.5 text-sm font-semibold",
                                "bg-[#eef4ff] text-[#2f6fff]"
                              )}
                            >
                              <button
                                type="button"
                                onClick={() => toggleBranch(`school:${selectedSchool.id}`)}
                                className="mr-2 rounded-full p-1 text-slate-500 hover:bg-white"
                              >
                                {isBranchCollapsed(`school:${selectedSchool.id}`) ? (
                                  <ChevronRight className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </button>
                              <School className="mr-2 h-4 w-4" />
                              <button
                                type="button"
                                onClick={() => setSelectedSchoolId(selectedSchool.id)}
                                className="min-w-0 flex-1 truncate text-left"
                              >
                                {selectedSchool.title}
                              </button>
                            </div>

                            {!isBranchCollapsed(`school:${selectedSchool.id}`) ? (
                              <div className="ml-4 space-y-2 border-l border-dashed border-[#d7e5fb] pl-4">
                                <div className="space-y-2">
                                  <div
                                    className={cn(
                                      "flex items-center rounded-2xl px-3 py-2 text-sm",
                                      "bg-[#f3f7ff] font-semibold text-[#174ea6]"
                                    )}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => toggleBranch(`subject:${selectedSubject.id}`)}
                                      className="mr-2 rounded-full p-1 text-slate-500 hover:bg-white"
                                    >
                                      {isBranchCollapsed(`subject:${selectedSubject.id}`) ? (
                                        <ChevronRight className="h-4 w-4" />
                                      ) : (
                                        <ChevronDown className="h-4 w-4" />
                                      )}
                                    </button>
                                    <FlaskConical className="mr-2 h-4 w-4 shrink-0" />
                                    <button
                                      type="button"
                                      onClick={() => setSelectedSubjectId(selectedSubject.id)}
                                      className="min-w-0 flex-1 truncate text-left"
                                    >
                                      {selectedSubject.title}
                                    </button>
                                  </div>

                                  {!isBranchCollapsed(`subject:${selectedSubject.id}`) ? (
                                    <div className="ml-4 space-y-2 border-l border-dashed border-[#d7e5fb] pl-3">
                                      {scopedYearGroups.map((group) => {
                                        const activeYear = group.year.slug === selectedYearSlug;
                                        const yearKey = `year:${selectedSubject.id}:${group.year.slug}`;

                                        return (
                                          <div key={group.year.slug} className="space-y-1">
                                            <div
                                              className={cn(
                                                "flex items-center rounded-2xl px-3 py-2 text-sm transition-colors",
                                                activeYear
                                                  ? "bg-[#eef4ff] font-semibold text-[#2f6fff]"
                                                  : "text-slate-600 hover:bg-[#f7faff] hover:text-slate-900 dark:text-slate-300"
                                              )}
                                            >
                                              <button
                                                type="button"
                                                onClick={() => toggleBranch(yearKey)}
                                                className="mr-2 rounded-full p-1 text-slate-500 hover:bg-white"
                                              >
                                                {isBranchCollapsed(yearKey) ? (
                                                  <ChevronRight className="h-4 w-4" />
                                                ) : (
                                                  <ChevronDown className="h-4 w-4" />
                                                )}
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => setSelectedYearSlug(group.year.slug)}
                                                className="min-w-0 flex-1 truncate text-left"
                                              >
                                                {group.year.title}
                                              </button>
                                              <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                                                {group.chapters.length}
                                              </span>
                                            </div>

                                            {!isBranchCollapsed(yearKey) ? (
                                              <div className="ml-4 space-y-1 border-l border-dashed border-[#d7e5fb] pl-3">
                                                {group.chapters.length === 0 ? (
                                                  <div className="rounded-2xl border border-dashed border-[#d7e5fb] px-3 py-3 text-xs text-slate-400">
                                                    No chapters for {group.year.title} yet.
                                                  </div>
                                                ) : (
                                                  group.chapters.map(({ chapter, lessons: chapterLessons }) => {
                                                    const activeChapter = chapter.id === selectedChapterId;
                                                    const chapterKey = `chapter:${chapter.id}:${group.year.slug}`;

                                                    return (
                                                      <div key={chapter.id} className="space-y-1">
                                                        <div
                                                          className={cn(
                                                            "flex items-center rounded-2xl px-3 py-2 text-sm transition-colors",
                                                            activeChapter
                                                              ? "bg-[#eef4ff] font-semibold text-[#2f6fff]"
                                                              : "text-slate-600 hover:bg-[#f7faff] hover:text-slate-900 dark:text-slate-300"
                                                          )}
                                                        >
                                                          <button
                                                            type="button"
                                                            onClick={() => toggleBranch(chapterKey)}
                                                            className="mr-2 rounded-full p-1 text-slate-500 hover:bg-white"
                                                          >
                                                            {isBranchCollapsed(chapterKey) ? (
                                                              <ChevronRight className="h-4 w-4" />
                                                            ) : (
                                                              <ChevronDown className="h-4 w-4" />
                                                            )}
                                                          </button>
                                                          <button
                                                            type="button"
                                                            onClick={() => {
                                                              setSelectedYearSlug(group.year.slug);
                                                              setSelectedChapterId(chapter.id);
                                                              setSelectedModuleId(chapterLessons[0]?.id ?? null);
                                                            }}
                                                            className="flex min-w-0 flex-1 items-center gap-2 text-left"
                                                          >
                                                            <BookOpen className="h-4 w-4 shrink-0" />
                                                            <span className="truncate">{chapter.title}</span>
                                                          </button>
                                                          {activeChapter ? (
                                                            <span className="ml-2 flex items-center gap-1">
                                                              <button
                                                                type="button"
                                                                onClick={(event) => {
                                                                  event.stopPropagation();
                                                                  void renameNode(chapter);
                                                                }}
                                                                className="rounded-full p-1 text-slate-400 hover:bg-white hover:text-slate-700"
                                                              >
                                                                <Pencil className="h-3.5 w-3.5" />
                                                              </button>
                                                              <button
                                                                type="button"
                                                                onClick={(event) => {
                                                                  event.stopPropagation();
                                                                  void deleteNode(chapter);
                                                                }}
                                                                className="rounded-full p-1 text-slate-400 hover:bg-white hover:text-red-500"
                                                              >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                              </button>
                                                            </span>
                                                          ) : null}
                                                        </div>

                                                        {!isBranchCollapsed(chapterKey) ? (
                                                          <div className="ml-4 space-y-1 border-l border-dashed border-[#d7e5fb] pl-3">
                                                            {chapterLessons.length === 0 ? (
                                                              <div className="rounded-2xl border border-dashed border-[#d7e5fb] px-3 py-3 text-xs text-slate-400">
                                                                No modules in this chapter yet.
                                                              </div>
                                                            ) : (
                                                              chapterLessons.map((lesson) => {
                                                                const activeLesson = lesson.id === selectedModuleId;

                                                                return (
                                                                  <div
                                                                    key={lesson.id}
                                                                    className={cn(
                                                                      "flex items-center rounded-2xl px-3 py-2 text-sm transition-colors",
                                                                      activeLesson
                                                                        ? "bg-[#f4f8ff] font-semibold text-[#2f6fff]"
                                                                        : "text-slate-600 hover:bg-[#f7faff] hover:text-slate-900 dark:text-slate-300"
                                                                    )}
                                                                  >
                                                                    <button
                                                                      type="button"
                                                                      onClick={() => {
                                                                        setSelectedYearSlug(group.year.slug);
                                                                        setSelectedChapterId(chapter.id);
                                                                        setSelectedModuleId(lesson.id);
                                                                      }}
                                                                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                                                                    >
                                                                      <FilePenLine className="h-4 w-4 shrink-0" />
                                                                      <span className="truncate">{lesson.title}</span>
                                                                    </button>
                                                                    {activeLesson ? (
                                                                      <span className="ml-2 flex items-center gap-1">
                                                                        <button
                                                                          type="button"
                                                                          onClick={(event) => {
                                                                            event.stopPropagation();
                                                                            void renameNode(lesson);
                                                                          }}
                                                                          className="rounded-full p-1 text-slate-400 hover:bg-white hover:text-slate-700"
                                                                        >
                                                                          <Pencil className="h-3.5 w-3.5" />
                                                                        </button>
                                                                        <button
                                                                          type="button"
                                                                          onClick={(event) => {
                                                                            event.stopPropagation();
                                                                            void deleteNode(lesson);
                                                                          }}
                                                                          className="rounded-full p-1 text-slate-400 hover:bg-white hover:text-red-500"
                                                                        >
                                                                          <Trash2 className="h-3.5 w-3.5" />
                                                                        </button>
                                                                      </span>
                                                                    ) : null}
                                                                  </div>
                                                                );
                                                              })
                                                            )}
                                                          </div>
                                                        ) : null}
                                                      </div>
                                                    );
                                                  })
                                                )}
                                              </div>
                                            ) : null}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-[#d7e5fb] px-3 py-4 text-sm text-slate-400">
                        School or subject not found.
                      </div>
                    )}
                  </>
                ) : lockedSchoolSlug ? (
                  <>
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <ChevronDown className="h-4 w-4" />
                      <School className="h-4 w-4 text-slate-500" />
                      {selectedSchool?.title ?? "Selected school"}
                    </div>

                    <div className="space-y-2 border-l border-dashed border-[#d7e5fb] pl-4">
                      {subjects.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-[#d7e5fb] px-3 py-4 text-sm text-slate-400">
                          No subjects yet.
                        </div>
                      ) : (
                        subjects.map((subject) => {
                          const activeSubject = subject.id === selectedSubjectId;

                          return (
                            <div key={subject.id} className="space-y-1">
                              <div
                                className={cn(
                                  "flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm transition-colors",
                                  activeSubject
                                    ? "bg-[#f3f7ff] font-semibold text-[#174ea6]"
                                    : "text-slate-600 hover:bg-[#f7faff] hover:text-slate-900 dark:text-slate-300"
                                )}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedSubjectId(subject.id);
                                    setSelectedChapterId(null);
                                    setSelectedModuleId(null);
                                  }}
                                  className="flex min-w-0 items-center gap-2"
                                >
                                  <FlaskConical className="h-4 w-4 shrink-0" />
                                  <span className="truncate">{subject.title}</span>
                                </button>
                                {activeSubject && (
                                  <span className="ml-auto flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        renameNode(subject);
                                      }}
                                      className="rounded-full p-1 text-slate-400 hover:bg-white hover:text-slate-700"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        deleteNode(subject);
                                      }}
                                      className="rounded-full p-1 text-slate-400 hover:bg-white hover:text-red-500"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </span>
                                )}
                              </div>

                              {activeSubject && (
                                <div className="ml-4 space-y-1 border-l border-dashed border-[#d7e5fb] pl-3">
                                  {chapters.map((chapter) => {
                                    const activeChapter = chapter.id === selectedChapterId;

                                    return (
                                      <div
                                        key={chapter.id}
                                        className={cn(
                                          "flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm transition-colors",
                                          activeChapter
                                            ? "bg-[#eef4ff] font-semibold text-[#2f6fff]"
                                            : "text-slate-600 hover:bg-[#f7faff] hover:text-slate-900 dark:text-slate-300"
                                        )}
                                      >
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setSelectedChapterId(chapter.id);
                                            setSelectedModuleId(null);
                                          }}
                                          className="flex min-w-0 items-center gap-2"
                                        >
                                          <BookOpen className="h-4 w-4" />
                                          <span className="truncate">{chapter.title}</span>
                                        </button>
                                        {activeChapter && (
                                          <span className="flex items-center gap-1">
                                            <button
                                              type="button"
                                              onClick={(event) => {
                                                event.stopPropagation();
                                                renameNode(chapter);
                                              }}
                                              className="rounded-full p-1 text-slate-400 hover:bg-white hover:text-slate-700"
                                            >
                                              <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={(event) => {
                                                event.stopPropagation();
                                                deleteNode(chapter);
                                              }}
                                              className="rounded-full p-1 text-slate-400 hover:bg-white hover:text-red-500"
                                            >
                                              <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                            <MoreVertical className="h-4 w-4 text-slate-400" />
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <ChevronDown className="h-4 w-4" />
                      <School className="h-4 w-4 text-slate-500" />
                      Schools
                    </div>

                    <div className="space-y-2 border-l border-dashed border-[#d7e5fb] pl-4">
                      {visibleSchools.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-[#d7e5fb] px-3 py-4 text-sm text-slate-400">
                          No schools yet.
                        </div>
                      ) : (
                        visibleSchools.map((school) => {
                      const activeSchool = school.id === selectedSchoolId;

                      return (
                        <div key={school.id} className="space-y-2">
                          <div
                            className={cn(
                              "flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm font-semibold transition-colors",
                              activeSchool
                                ? "bg-[#eef4ff] text-[#2f6fff]"
                                : "text-slate-600 hover:bg-[#f7faff] hover:text-slate-900 dark:text-slate-300"
                            )}
                          >
                            <button type="button" onClick={() => setSelectedSchoolId(school.id)} className="flex min-w-0 items-center gap-2">
                              <School className="h-4 w-4" />
                              <span className="truncate">{school.title}</span>
                            </button>
                            <span className="flex items-center gap-1">
                              {activeSchool && (
                                <>
                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      renameNode(school);
                                    }}
                                    className="rounded-full p-1 text-slate-400 hover:bg-white hover:text-slate-700"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      deleteNode(school);
                                    }}
                                    className="rounded-full p-1 text-slate-400 hover:bg-white hover:text-red-500"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </>
                              )}
                              <MoreVertical className="h-4 w-4 text-slate-400" />
                            </span>
                          </div>

                          {activeSchool && (
                            <div className="ml-4 space-y-1 border-l border-dashed border-[#d7e5fb] pl-4">
                              {subjects.map((subject) => {
                                const activeSubject = subject.id === selectedSubjectId;

                                return (
                                  <div key={subject.id} className="space-y-1">
                                    <div
                                      className={cn(
                                        "flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm transition-colors",
                                        activeSubject
                                          ? "bg-[#f3f7ff] font-semibold text-[#174ea6]"
                                          : "text-slate-600 hover:bg-[#f7faff] hover:text-slate-900 dark:text-slate-300"
                                      )}
                                    >
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedSubjectId(subject.id);
                                          setSelectedChapterId(null);
                                          setSelectedModuleId(null);
                                        }}
                                        className="flex min-w-0 items-center gap-2"
                                      >
                                        <FlaskConical className="h-4 w-4 shrink-0" />
                                        <span className="truncate">{subject.title}</span>
                                      </button>
                                      {activeSubject && (
                                        <span className="ml-auto flex items-center gap-1">
                                          <button
                                            type="button"
                                            onClick={(event) => {
                                              event.stopPropagation();
                                              renameNode(subject);
                                            }}
                                            className="rounded-full p-1 text-slate-400 hover:bg-white hover:text-slate-700"
                                          >
                                            <Pencil className="h-3.5 w-3.5" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={(event) => {
                                              event.stopPropagation();
                                              deleteNode(subject);
                                            }}
                                            className="rounded-full p-1 text-slate-400 hover:bg-white hover:text-red-500"
                                          >
                                            <Trash2 className="h-3.5 w-3.5" />
                                          </button>
                                        </span>
                                      )}
                                    </div>

                                    {activeSubject && (
                                      <div className="ml-4 space-y-1 border-l border-dashed border-[#d7e5fb] pl-3">
                                        {chapters.map((chapter) => {
                                          const activeChapter = chapter.id === selectedChapterId;

                                          return (
                                            <div
                                              key={chapter.id}
                                              className={cn(
                                                "flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm transition-colors",
                                                activeChapter
                                                  ? "bg-[#eef4ff] font-semibold text-[#2f6fff]"
                                                  : "text-slate-600 hover:bg-[#f7faff] hover:text-slate-900 dark:text-slate-300"
                                              )}
                                            >
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setSelectedChapterId(chapter.id);
                                                  setSelectedModuleId(null);
                                                }}
                                                className="flex min-w-0 items-center gap-2"
                                              >
                                                <BookOpen className="h-4 w-4" />
                                                <span className="truncate">{chapter.title}</span>
                                              </button>
                                              {activeChapter && (
                                                <span className="flex items-center gap-1">
                                                  <button
                                                    type="button"
                                                    onClick={(event) => {
                                                      event.stopPropagation();
                                                      renameNode(chapter);
                                                    }}
                                                    className="rounded-full p-1 text-slate-400 hover:bg-white hover:text-slate-700"
                                                  >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                  </button>
                                                  <button
                                                    type="button"
                                                    onClick={(event) => {
                                                      event.stopPropagation();
                                                      deleteNode(chapter);
                                                    }}
                                                    className="rounded-full p-1 text-slate-400 hover:bg-white hover:text-red-500"
                                                  >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                  </button>
                                                  <MoreVertical className="h-4 w-4 text-slate-400" />
                                                </span>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                {isLockedSubjectWorkspace ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!selectedSubject}
                      className={cn("h-10 justify-center rounded-2xl text-xs font-semibold", secondaryPillButtonClassName)}
                      onClick={() => selectedSubject && createPromptedNode("chapter", selectedSubject.id)}
                    >
                      Add Chapter
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!selectedChapter}
                      className={cn("h-10 justify-center rounded-2xl text-xs font-semibold", secondaryPillButtonClassName)}
                      onClick={() => selectedChapter && createPromptedNode("lesson", selectedChapter.id)}
                    >
                      Add Module
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn("h-10 justify-center rounded-2xl text-xs font-semibold", secondaryPillButtonClassName)}
                      onClick={() => createPromptedNode("subject", null)}
                    >
                      Add Subject
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!selectedSubject}
                      className={cn("h-10 justify-center rounded-2xl text-xs font-semibold", secondaryPillButtonClassName)}
                      onClick={() => selectedSubject && createPromptedNode("chapter", selectedSubject.id)}
                    >
                      Add Chapter
                    </Button>
                  </>
                )}
              </div>

              <div className="mt-5 border-t border-[#edf2f8] pt-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <span>Year tags</span>
                  <CircleHelp className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {YEAR_OPTIONS.map((year) => (
                    <span
                      key={year.slug}
                      className="inline-flex h-9 items-center rounded-2xl border border-[#d8e4f7] bg-[#fbfdff] px-4 text-xs font-semibold text-[#2f6fff]"
                    >
                      {year.title}
                    </span>
                  ))}
                </div>
              </div>
            </aside>

            <section className="rounded-[28px] border border-[#e0eaf7] bg-white/92 shadow-[0_24px_70px_-54px_rgba(15,23,42,0.26)] dark:border-slate-800 dark:bg-slate-900/88">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf2f8] px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#2f6fff]">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-950 dark:text-slate-50">Chapter Builder</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex h-9 items-center gap-2 rounded-2xl border border-[#dce7ff] bg-[#f4f8ff] px-3 text-xs font-semibold text-[#2f6fff]">
                    <LibraryBig className="h-4 w-4" />
                    {lessons.length} modules
                  </span>
                  <span className="inline-flex h-9 items-center gap-2 rounded-2xl border border-[#ffe1cf] bg-[#fff6ef] px-3 text-xs font-semibold text-[#f97316]">
                    <CalendarDays className="h-4 w-4" />
                    {selectedChapter ? text(selectedChapter.metadata.weekRange) || "No weeks" : "No chapter"}
                  </span>
                </div>
              </div>

              {selectedChapter ? (
                <div className="space-y-5 p-5">
                  <div>
                    <p className="text-base font-bold text-slate-950 dark:text-slate-50">Chapter details</p>
                    <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1.45fr)_120px_120px_minmax(220px,1fr)_150px]">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-500">Chapter title</label>
                        <Input
                          value={chapterTitleDraft}
                          onChange={(event) => setChapterTitleDraft(event.target.value)}
                          className={fieldClassName}
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-500">Start week</label>
                        <Input
                          value={chapterWeekDrafts[selectedChapter.id]?.start ?? ""}
                          onChange={(event) => updateChapterWeekDraft(selectedChapter.id, "start", event.target.value)}
                          className={fieldClassName}
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-500">End week</label>
                        <Input
                          value={chapterWeekDrafts[selectedChapter.id]?.end ?? ""}
                          onChange={(event) => updateChapterWeekDraft(selectedChapter.id, "end", event.target.value)}
                          className={fieldClassName}
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-500">Year tags</label>
                        <div className="flex min-h-11 flex-wrap items-center gap-2 rounded-xl border border-[#dde5f2] bg-white px-2 py-1.5 dark:border-slate-700 dark:bg-slate-950">
                          {selectedSchool ? (
                            YEAR_OPTIONS.map((year) => {
                              const active = hasAssignmentTag(selectedChapterTags, selectedSchool.slug, year.slug);

                              return (
                                <button
                                  key={year.slug}
                                  type="button"
                                  onClick={() => toggleAssignmentTag(selectedChapter, selectedSchool.slug, year.slug)}
                                  className={cn(
                                    "inline-flex h-8 items-center rounded-xl px-3 text-xs font-semibold transition-colors",
                                    active
                                      ? "bg-[#eef4ff] text-[#2f6fff]"
                                      : "bg-[#f8fafc] text-slate-500 hover:text-slate-900"
                                  )}
                                >
                                  {year.title}
                                </button>
                              );
                            })
                          ) : (
                            <span className="px-2 text-xs text-slate-400">Select a school first</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          className={cn("h-11 w-full rounded-xl text-sm font-semibold", primaryActionClassName)}
                          onClick={saveSelectedChapterDetails}
                          disabled={busy}
                        >
                          Save Chapter
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#edf2f8] pt-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-base font-bold text-slate-950 dark:text-slate-50">Lessons / Modules</p>
                      <Button
                        type="button"
                        className={cn("h-10 rounded-xl px-4 text-sm font-semibold", primaryActionClassName)}
                        onClick={() => createPromptedNode("lesson", selectedChapter.id)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Lesson / Module
                      </Button>
                    </div>

                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        createNode("lesson", selectedChapter.id);
                      }}
                      className="mt-4 grid gap-3 rounded-[22px] border border-[#edf2f8] bg-[#fbfdff] p-3 md:grid-cols-[110px_150px_minmax(0,1fr)_150px]"
                    >
                      <Input
                        value={lessonWeekDraft}
                        onChange={(event) => setLessonWeekDraft(event.target.value)}
                        placeholder="Week"
                        className={compactFieldClassName}
                      />
                      <Input
                        value={lessonCodeDraft}
                        onChange={(event) => setLessonCodeDraft(event.target.value)}
                        placeholder="Module code"
                        className={compactFieldClassName}
                      />
                      <Input
                        value={drafts.lesson}
                        onChange={(event) => setDraft("lesson", event.target.value)}
                        placeholder="Lesson / module title"
                        className={compactFieldClassName}
                      />
                      <Button type="submit" disabled={busy || !drafts.lesson.trim()} className="h-9 rounded-xl">
                        Add
                      </Button>
                    </form>

                    <div className="mt-4 overflow-x-auto rounded-[22px] border border-[#edf2f8]">
                      <div className="min-w-[680px]">
                      <div className="grid grid-cols-[54px_82px_132px_minmax(0,1fr)_90px] gap-3 bg-[#f8fbff] px-4 py-3 text-xs font-semibold text-slate-500">
                        <span />
                        <span>Week</span>
                        <span>Module code</span>
                        <span>Lesson / Module title</span>
                        <span className="text-right">Actions</span>
                      </div>
                      {lessons.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-slate-400">No lessons yet.</div>
                      ) : (
                        lessons.map((lesson) => {
                          const activeLesson = lesson.id === selectedModuleId;
                          const canDropHere = canDropOnNode(lesson);
                          const editingLesson = lessonEditDraft?.lessonId === lesson.id;

                          return (
                            <div
                              key={lesson.id}
                              draggable={!busy}
                              onDragStart={(event) => handleDragStart(lesson, event)}
                              onDragEnd={handleDragEnd}
                              onDragOver={(event) => {
                                if (!canDropHere) return;
                                event.preventDefault();
                              }}
                              onDrop={(event) => {
                                if (!canDropHere) return;
                                event.preventDefault();
                                event.stopPropagation();
                                dropOnNode(lesson, lessons);
                              }}
                              className={cn(
                                "grid grid-cols-[54px_82px_132px_minmax(0,1fr)_90px] items-center gap-3 border-t border-[#edf2f8] px-4 py-3 text-sm transition-colors",
                                activeLesson ? "bg-[#f4f8ff]" : "bg-white dark:bg-slate-950"
                              )}
                            >
                              <div className="flex items-center gap-2 text-slate-300">
                                <GripVertical className="h-4 w-4" />
                                <button
                                  type="button"
                                  onClick={() => setSelectedModuleId(lesson.id)}
                                  className={cn(
                                    "h-4 w-4 rounded-full border",
                                    activeLesson ? "border-[#2f6fff] bg-[#2f6fff]" : "border-slate-300"
                                  )}
                                />
                              </div>
                              {editingLesson ? (
                                <>
                                  <Input
                                    value={lessonEditDraft?.week ?? ""}
                                    onChange={(event) => updateLessonEditDraft("week", event.target.value)}
                                    onKeyDown={(event) => {
                                      if (event.key === "Enter") {
                                        event.preventDefault();
                                        void saveLessonEdit();
                                      }
                                    }}
                                    placeholder="Week"
                                    className={compactFieldClassName}
                                  />
                                  <Input
                                    value={lessonEditDraft?.lessonCode ?? ""}
                                    onChange={(event) => updateLessonEditDraft("lessonCode", event.target.value)}
                                    onKeyDown={(event) => {
                                      if (event.key === "Enter") {
                                        event.preventDefault();
                                        void saveLessonEdit();
                                      }
                                    }}
                                    placeholder="Module code"
                                    className={compactFieldClassName}
                                  />
                                  <Input
                                    value={lessonEditDraft?.title ?? ""}
                                    onChange={(event) => updateLessonEditDraft("title", event.target.value)}
                                    onKeyDown={(event) => {
                                      if (event.key === "Enter") {
                                        event.preventDefault();
                                        void saveLessonEdit();
                                      }
                                    }}
                                    placeholder="Lesson / module title"
                                    className={compactFieldClassName}
                                  />
                                </>
                              ) : (
                                <>
                                  <span className="text-slate-600 dark:text-slate-300">{text(lesson.metadata.week) || "-"}</span>
                                  <span className="inline-flex w-fit rounded-xl bg-[#f1f5f9] px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                                    {text(lesson.metadata.lessonCode) || "Module"}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedModuleId(lesson.id)}
                                    className="truncate text-left font-medium text-slate-700 hover:text-slate-950 dark:text-slate-100"
                                  >
                                    {lesson.title}
                                  </button>
                                </>
                              )}
                              <div className="flex items-center justify-end gap-1">
                                {editingLesson ? (
                                  <>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      disabled={busy}
                                      onClick={() => void saveLessonEdit()}
                                      className="h-8 w-8 rounded-full text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      disabled={busy}
                                      onClick={() => setLessonEditDraft(null)}
                                      className="h-8 w-8 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => beginLessonEdit(lesson)}
                                      className="h-8 w-8 rounded-full text-slate-500"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => deleteNode(lesson)}
                                      className="h-8 w-8 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5">
                  <EmptySelectionCard>Select or add a chapter to start building lessons.</EmptySelectionCard>
                </div>
              )}
            </section>

            {!compactMode ? (
            <aside className="space-y-5">
              <section className="rounded-[28px] border border-[#e0eaf7] bg-white/92 p-5 shadow-[0_24px_70px_-54px_rgba(15,23,42,0.26)] dark:border-slate-800 dark:bg-slate-900/88">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#f97316]" />
                  <h2 className="text-lg font-bold text-slate-950 dark:text-slate-50">Quick Actions</h2>
                </div>
                <div className="mt-4 space-y-4">
                  {[
                    {
                      title: "Add your schools",
                      description: "Create schools and assign year groups.",
                      action: () => createPromptedNode("school", null),
                      icon: School,
                    },
                    {
                      title: "Create reusable subjects",
                      description: "Build subjects that can be used across schools.",
                      action: () => createPromptedNode("subject", null),
                      icon: FlaskConical,
                    },
                    {
                      title: "Split content into chapters",
                      description: "Organise topics by weeks and years.",
                      action: () => selectedSubject && createPromptedNode("chapter", selectedSubject.id),
                      icon: BookOpen,
                    },
                    {
                      title: "Attach lesson modules",
                      description: "Add lessons from the Module Library.",
                      action: () => selectedChapter && createPromptedNode("lesson", selectedChapter.id),
                      icon: FilePenLine,
                    },
                  ].map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.title}
                        type="button"
                        onClick={item.action}
                        className="flex w-full items-start gap-3 text-left"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2f6fff] text-xs font-bold text-white">
                          {index + 1}
                        </span>
                        <span className="flex min-w-0 gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#e0eaf7] bg-[#fbfdff] text-slate-500">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span>
                            <span className="block text-sm font-semibold text-slate-900 dark:text-slate-50">
                              {item.title}
                            </span>
                            <span className="mt-0.5 block text-xs leading-5 text-slate-500 dark:text-slate-300">
                              {item.description}
                            </span>
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-[28px] border border-[#e0eaf7] bg-white/92 p-5 shadow-[0_24px_70px_-54px_rgba(15,23,42,0.26)] dark:border-slate-800 dark:bg-slate-900/88">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-[#2f6fff]" />
                  <h2 className="text-lg font-bold text-slate-950 dark:text-slate-50">Your Progress</h2>
                </div>
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {[
                    { label: "Schools", value: schools.length, tone: "text-[#2f6fff] bg-[#f4f8ff]" },
                    { label: "Subjects", value: subjects.length, tone: "text-[#159a61] bg-[#effbf5]" },
                    { label: "Chapters", value: allChapters.length, tone: "text-[#f97316] bg-[#fff6ef]" },
                    { label: "Lessons", value: allLessons.length, tone: "text-[#8b5cf6] bg-[#f7f3ff]" },
                  ].map((item) => (
                    <div key={item.label} className={cn("rounded-2xl px-2 py-3 text-center", item.tone)}>
                      <p className="text-2xl font-bold">{item.value}</p>
                      <p className="mt-1 text-[11px] font-medium">{item.label}</p>
                    </div>
                  ))}
                </div>
              </section>
            </aside>
            ) : null}
          </div>

          {!compactMode ? (
          <div className="flex items-center gap-3 rounded-[24px] border border-[#dbe7fb] bg-white/82 px-5 py-4 text-sm text-[#2451a6] shadow-sm dark:border-slate-800 dark:bg-slate-900/88 dark:text-blue-200">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2f6fff] text-xs font-bold text-white">
              i
            </span>
            <span>
              Lesson tags override chapter tags. Use lesson tags only when a chapter is split across years.
              {selectedSchoolChapterTags.length > 0 ? ` Current chapter tags: ${selectedSchoolChapterTags.length}.` : ""}
            </span>
          </div>
          ) : null}

          {!compactMode ? (
            <>
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
                            Set chapter-wide defaults like assessments and year tags. Lesson tags can override
                            these.
                          </CardDescription>
                        </div>
                        <Button asChild variant="outline" className={cn("h-9 px-4 text-xs font-medium", secondaryPillButtonClassName)}>
                          <Link href="/admin/modules">
                            <FilePenLine className="mr-2 h-4 w-4" />
                            Open Module Library
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
                    title="Lesson Year Tags"
                    description="Tag lessons to specific schools and years. These tags override chapter defaults."
                    tags={selectedModuleTags}
                    schools={schools}
                    busy={busy}
                    action={
                      <Button asChild variant="outline" className={cn("h-9 px-4 text-xs font-medium", secondaryPillButtonClassName)}>
                        <Link href={`/admin/modules?lessonId=${encodeURIComponent(selectedModule.id)}`}>
                          <FilePenLine className="mr-2 h-4 w-4" />
                          Manage Module Assignment
                        </Link>
                      </Button>
                    }
                    onToggle={(schoolSlug, yearSlug) => toggleAssignmentTag(selectedModule, schoolSlug, yearSlug)}
                  />
                ) : (
                  <EmptySelectionCard>Select a lesson to control year-level placement across schools.</EmptySelectionCard>
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
            </>
          ) : null}
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
