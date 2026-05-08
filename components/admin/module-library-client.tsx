"use client";

import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ExternalLink,
  PencilLine,
  Plus,
  Search,
  Trash2,
  Unlink,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ModuleListEntry } from "@/lib/module-editor";
import type { ModuleEditorBreadcrumb } from "@/types/module-editor";

export type LessonStub = {
  lessonId: string;
  lessonTitle: string;
  lessonSlug: string;
  lessonCode: string;
  week: string;
  breadcrumbs: ModuleEditorBreadcrumb[];
  subjectTitle: string;
  chapterTitle: string;
  schoolSlug: string;
  yearSlug: string;
  subjectSlug: string;
  chapterSlug: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", className)}>
      {children}
    </span>
  );
}

function LessonLabel({ lesson }: { lesson: LessonStub }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold text-slate-900">{lesson.lessonTitle}</p>
      <p className="truncate text-xs text-slate-400">
        {lesson.subjectTitle || "No subject"}
        {lesson.chapterTitle ? ` · ${lesson.chapterTitle}` : ""}
        {lesson.week ? ` · ${lesson.week}` : ""}
        {lesson.lessonCode ? ` · ${lesson.lessonCode}` : ""}
      </p>
    </div>
  );
}

function ModuleLabel({ module }: { module: ModuleListEntry }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold text-slate-900">{module.moduleTitle}</p>
      <p className="truncate text-xs text-slate-400">
        {module.pageCount} {module.pageCount === 1 ? "page" : "pages"} ·{" "}
        {module.assignments.length} {module.assignments.length === 1 ? "lesson" : "lessons"}
      </p>
    </div>
  );
}

function DialogShell({
  title,
  description,
  onClose,
  children,
}: {
  title: string;
  description: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-3xl rounded-[28px] border border-[#e5ecf8] bg-white shadow-[0_40px_100px_-40px_rgba(15,23,42,0.5)]">
        <div className="flex items-center justify-between border-b border-[#f0f4fb] px-6 pb-4 pt-6">
          <div>
            <p className="text-[1.1rem] font-bold text-slate-950">{title}</p>
            <p className="mt-0.5 text-xs text-slate-400">{description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function LessonAssignmentDialog({
  lesson,
  modules,
  currentModule,
  busyKey,
  error,
  onClose,
  onAssign,
  onUnassign,
}: {
  lesson: LessonStub;
  modules: ModuleListEntry[];
  currentModule: ModuleListEntry | null;
  busyKey: string | null;
  error: string;
  onClose: () => void;
  onAssign: (moduleId: string, lessonId: string) => Promise<boolean>;
  onUnassign: (lessonId: string) => Promise<boolean>;
}) {
  const [search, setSearch] = useState("");

  const filteredModules = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return modules;

    return modules.filter((module) => {
      if (module.moduleTitle.toLowerCase().includes(query)) return true;
      return module.assignments.some((assignment) =>
        [
          assignment.lessonTitle,
          assignment.subjectTitle,
          assignment.chapterTitle,
          assignment.lessonCode,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query)
      );
    });
  }, [modules, search]);

  return (
    <DialogShell
      title="Assign Module to Lesson"
      description="Pick which reusable module this lesson should use."
      onClose={onClose}
    >
      <div className="space-y-5 px-6 py-5">
        <div className="rounded-[18px] border border-[#e8eef8] bg-[#f8fbff] p-4">
          <LessonLabel lesson={lesson} />
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>Current assignment:</span>
            {currentModule ? (
              <>
                <Badge className="border border-[#dce6ff] bg-white text-[#2f6fff]">{currentModule.moduleTitle}</Badge>
                <button
                  type="button"
                  onClick={async () => {
                    const didUnassign = await onUnassign(lesson.lessonId);
                    if (didUnassign) onClose();
                  }}
                  disabled={busyKey === `unassign:${lesson.lessonId}`}
                  className="inline-flex items-center gap-1 rounded-full border border-[#fde8e8] bg-white px-3 py-1 text-xs font-semibold text-[#dc2626] hover:bg-[#fff5f5] disabled:opacity-40"
                >
                  <Unlink className="h-3.5 w-3.5" />
                  {busyKey === `unassign:${lesson.lessonId}` ? "Removing..." : "Unassign"}
                </button>
              </>
            ) : (
              <Badge className="bg-[#fff4e8] text-[#c2410c]">No module assigned</Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-[14px] border border-[#dce6ff] bg-[#f8fbff] px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            autoFocus
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search modules..."
            className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none"
          />
        </div>

        <div className="max-h-[26rem] space-y-2 overflow-y-auto">
          {filteredModules.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">No modules found.</p>
          ) : (
            filteredModules.map((module) => {
              const isCurrent = currentModule?.moduleId === module.moduleId;
              const isBusy = busyKey === `${module.moduleId}:${lesson.lessonId}`;

              return (
                <div
                  key={module.moduleId}
                  className={cn(
                    "flex flex-wrap items-center justify-between gap-3 rounded-[18px] border px-4 py-3",
                    isCurrent ? "border-[#b9cffd] bg-[#eef4ff]" : "border-[#e8eef8] bg-white"
                  )}
                >
                  <ModuleLabel module={module} />
                  <button
                    type="button"
                    disabled={isCurrent || Boolean(busyKey)}
                    onClick={async () => {
                      const didAssign = await onAssign(module.moduleId, lesson.lessonId);
                      if (didAssign) onClose();
                    }}
                    className={cn(
                      "rounded-full px-4 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                      isCurrent
                        ? "border border-[#b9cffd] bg-white text-[#2f6fff]"
                        : "bg-[#2f6fff] text-white hover:bg-[#1d4ed8]"
                    )}
                  >
                    {isCurrent ? "Assigned" : isBusy ? "Assigning..." : "Assign"}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      </div>
    </DialogShell>
  );
}

function ModuleAssignmentDialog({
  module,
  lessons,
  moduleByLessonId,
  busyKey,
  error,
  onClose,
  onAssign,
  onUnassign,
}: {
  module: ModuleListEntry;
  lessons: LessonStub[];
  moduleByLessonId: Map<string, ModuleListEntry>;
  busyKey: string | null;
  error: string;
  onClose: () => void;
  onAssign: (moduleId: string, lessonId: string) => Promise<boolean>;
  onUnassign: (lessonId: string) => Promise<boolean>;
}) {
  const [search, setSearch] = useState("");

  const filteredLessons = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return lessons;

    return lessons.filter((lesson) =>
      [
        lesson.lessonTitle,
        lesson.subjectTitle,
        lesson.chapterTitle,
        lesson.lessonCode,
        lesson.week,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [lessons, search]);

  return (
    <DialogShell
      title="Assign Lessons"
      description="Attach this reusable module to any lesson. Each lesson can use one module at a time."
      onClose={onClose}
    >
      <div className="space-y-5 px-6 py-5">
        <div className="rounded-[18px] border border-[#e8eef8] bg-[#f8fbff] p-4">
          <ModuleLabel module={module} />
          <div className="mt-3 flex flex-wrap gap-2">
            {module.assignments.length === 0 ? (
              <Badge className="bg-[#fff4e8] text-[#c2410c]">Unassigned</Badge>
            ) : (
              module.assignments.map((assignment) => (
                <button
                  key={assignment.lessonId}
                  type="button"
                  onClick={async () => {
                    const didUnassign = await onUnassign(assignment.lessonId);
                    if (didUnassign) onClose();
                  }}
                  disabled={busyKey === `unassign:${assignment.lessonId}`}
                  className="inline-flex items-center gap-1 rounded-full border border-[#dce6ff] bg-white px-3 py-1 text-xs font-semibold text-[#2f6fff] hover:bg-[#f0f6ff] disabled:opacity-40"
                >
                  <span>{assignment.lessonTitle}</span>
                  <Unlink className="h-3 w-3" />
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-[14px] border border-[#dce6ff] bg-[#f8fbff] px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            autoFocus
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search lessons..."
            className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none"
          />
        </div>

        <div className="max-h-[26rem] space-y-2 overflow-y-auto">
          {filteredLessons.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">No lessons found.</p>
          ) : (
            filteredLessons.map((lesson) => {
              const assignedModule = moduleByLessonId.get(lesson.lessonId) ?? null;
              const isCurrent = assignedModule?.moduleId === module.moduleId;
              const isBusy = busyKey === `${module.moduleId}:${lesson.lessonId}`;

              return (
                <div
                  key={lesson.lessonId}
                  className={cn(
                    "flex flex-wrap items-center justify-between gap-3 rounded-[18px] border px-4 py-3",
                    isCurrent ? "border-[#b9cffd] bg-[#eef4ff]" : "border-[#e8eef8] bg-white"
                  )}
                >
                  <div className="min-w-0">
                    <LessonLabel lesson={lesson} />
                    {assignedModule && !isCurrent && (
                      <p className="mt-1 text-xs text-[#c2410c]">Currently using: {assignedModule.moduleTitle}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={Boolean(busyKey)}
                    onClick={async () => {
                      const didAssign = await onAssign(module.moduleId, lesson.lessonId);
                      if (didAssign) onClose();
                    }}
                    className={cn(
                      "rounded-full px-4 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                      isCurrent
                        ? "border border-[#b9cffd] bg-white text-[#2f6fff]"
                        : "bg-[#2f6fff] text-white hover:bg-[#1d4ed8]"
                    )}
                  >
                    {isCurrent ? "Assigned" : assignedModule ? (isBusy ? "Replacing..." : "Replace") : isBusy ? "Assigning..." : "Assign"}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      </div>
    </DialogShell>
  );
}

export function ModuleLibraryClient({
  modules,
  lessons,
  lessonsWithoutModule,
  initialLessonId,
}: {
  modules: ModuleListEntry[];
  lessons: LessonStub[];
  lessonsWithoutModule: LessonStub[];
  initialLessonId: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "assigned" | "unassigned">("all");
  const [showEmptyLessons, setShowEmptyLessons] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<LessonStub | null>(null);
  const [selectedModule, setSelectedModule] = useState<ModuleListEntry | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [handledInitialLesson, setHandledInitialLesson] = useState(false);

  useEffect(() => {
    if (!initialLessonId || handledInitialLesson) return;
    const lesson = lessons.find((item) => item.lessonId === initialLessonId) ?? null;
    if (lesson) {
      setSelectedLesson(lesson);
      setHandledInitialLesson(true);
    }
  }, [handledInitialLesson, initialLessonId, lessons]);

  const moduleByLessonId = useMemo(() => {
    const map = new Map<string, ModuleListEntry>();
    for (const module of modules) {
      for (const assignment of module.assignments) {
        map.set(assignment.lessonId, module);
      }
    }
    return map;
  }, [modules]);

  const filteredModules = useMemo(() => {
    const query = search.toLowerCase().trim();

    return modules.filter((module) => {
      if (statusFilter === "assigned" && module.assignments.length === 0) return false;
      if (statusFilter === "unassigned" && module.assignments.length > 0) return false;

      if (!query) return true;
      if (module.moduleTitle.toLowerCase().includes(query)) return true;

      return module.assignments.some((assignment) =>
        [
          assignment.lessonTitle,
          assignment.subjectTitle,
          assignment.chapterTitle,
          assignment.lessonCode,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query)
      );
    });
  }, [modules, search, statusFilter]);

  async function assignModule(moduleId: string, lessonId: string) {
    setBusyKey(`${moduleId}:${lessonId}`);
    setActionError("");

    try {
      const response = await fetch("/api/admin/module-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId, lessonId }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setActionError(data.error || "Failed to assign module.");
        return false;
      }

      startTransition(() => router.refresh());
      return true;
    } catch (error) {
      console.error(error);
      setActionError("Failed to assign module.");
      return false;
    } finally {
      setBusyKey(null);
    }
  }

  async function unassignLesson(lessonId: string) {
    setBusyKey(`unassign:${lessonId}`);
    setActionError("");

    try {
      const response = await fetch(`/api/admin/module-assignments?lessonId=${encodeURIComponent(lessonId)}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setActionError(data.error || "Failed to unassign module.");
        return false;
      }

      startTransition(() => router.refresh());
      return true;
    } catch (error) {
      console.error(error);
      setActionError("Failed to unassign module.");
      return false;
    } finally {
      setBusyKey(null);
    }
  }

  async function deleteModule(moduleId: string) {
    if (!confirm("Delete this module? Any lesson using it will lose the assignment.")) return;

    setBusyKey(`delete:${moduleId}`);
    setActionError("");

    try {
      const response = await fetch(`/api/modules/${encodeURIComponent(moduleId)}`, { method: "DELETE" });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setActionError(data.error || "Failed to delete module.");
        return;
      }

      startTransition(() => router.refresh());
    } catch (error) {
      console.error(error);
      setActionError("Failed to delete module.");
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7faff_0%,#eef4ff_50%,#f9fbff_100%)]">
      <main className="mx-auto max-w-[1280px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[2rem] font-black tracking-tight text-slate-950">Module Library</h1>
            <p className="mt-1 text-sm text-slate-500">
              Create free reusable modules here, then assign them to lessons whenever you need.
            </p>
          </div>
          <Link
            href="/admin/module-editor"
            className="flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#2f6fff,#1d4ed8)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_16px_32px_-20px_rgba(37,99,235,0.8)] transition-all hover:brightness-105"
          >
            <Plus className="h-4 w-4" />
            New Module
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-[14px] border border-[#dce6ff] bg-white px-3 py-2 shadow-sm">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search modules..."
              className="w-56 bg-transparent text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "all" | "assigned" | "unassigned")}
            className="rounded-[14px] border border-[#dce6ff] bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none"
          >
            <option value="all">All Modules</option>
            <option value="assigned">Assigned</option>
            <option value="unassigned">Unassigned</option>
          </select>

          {(search || statusFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
              className="flex items-center gap-1.5 rounded-full border border-[#f0c0a0] bg-[#fff7f0] px-3 py-2 text-xs font-semibold text-[#c2410c] hover:bg-[#ffede0]"
            >
              <X className="h-3.5 w-3.5" />
              Clear filters
            </button>
          )}
        </div>

        {actionError && (
          <div className="mt-4 rounded-[18px] border border-[#fde8e8] bg-[#fff5f5] px-4 py-3 text-sm font-medium text-[#dc2626]">
            {actionError}
          </div>
        )}

        <div className="mt-6 overflow-hidden rounded-[24px] border border-white/70 bg-white/90 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.3)] backdrop-blur">
          {filteredModules.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-400">No modules match your filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-sm">
                <thead>
                  <tr className="border-b border-[#f0f4fb]">
                    {["Module", "Assigned Lessons", "Pages", "Last Updated", "Actions"].map((heading) => (
                      <th
                        key={heading}
                        className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-400"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredModules.map((module) => {
                    const previewAssignment = module.assignments[0] ?? null;
                    const previewHref = previewAssignment
                      && previewAssignment.schoolSlug
                      && previewAssignment.yearSlug
                      && previewAssignment.subjectSlug
                      && previewAssignment.chapterSlug
                      && previewAssignment.lessonSlug
                      ? `/admin/materials/curriculum/${previewAssignment.schoolSlug}/${previewAssignment.yearSlug}/${previewAssignment.subjectSlug}/${previewAssignment.chapterSlug}/${previewAssignment.lessonSlug}`
                      : null;

                    return (
                      <tr
                        key={module.moduleId}
                        className="border-b border-[#f7f9fc] transition-colors last:border-b-0 hover:bg-[#f8fbff]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] bg-[#eef4ff] text-[#2f6fff]">
                              <BookOpen className="h-4 w-4" />
                            </div>
                            <ModuleLabel module={module} />
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {module.assignments.length === 0 ? (
                            <Badge className="bg-[#fff4e8] text-[#c2410c]">Unassigned</Badge>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {module.assignments.slice(0, 2).map((assignment) => (
                                <Badge
                                  key={assignment.lessonId}
                                  className="border border-[#dce6ff] bg-[#f0f6ff] text-[#2f6fff]"
                                >
                                  {assignment.lessonTitle}
                                </Badge>
                              ))}
                              {module.assignments.length > 2 && (
                                <Badge className="bg-slate-100 text-slate-600">
                                  +{module.assignments.length - 2} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <Badge className="bg-[#ecfbf3] text-[#159a61]">
                            {module.pageCount} {module.pageCount === 1 ? "page" : "pages"}
                          </Badge>
                        </td>
                        <td className="px-5 py-4 text-slate-500">{formatDate(module.updatedAt)}</td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/admin/module-editor?moduleId=${encodeURIComponent(module.moduleId)}`}
                              className="flex items-center gap-1.5 rounded-full border border-[#dce6ff] bg-white px-3 py-1.5 text-xs font-semibold text-[#2f6fff] transition-colors hover:bg-[#f0f6ff]"
                            >
                              <PencilLine className="h-3.5 w-3.5" />
                              Edit
                            </Link>
                            <button
                              type="button"
                              onClick={() => {
                                setActionError("");
                                setSelectedModule(module);
                              }}
                              className="flex items-center gap-1.5 rounded-full border border-[#dce6ff] bg-white px-3 py-1.5 text-xs font-semibold text-[#2f6fff] transition-colors hover:bg-[#f0f6ff]"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Assign Lessons
                            </button>
                            {previewHref && (
                              <Link
                                href={previewHref}
                                className="flex items-center gap-1.5 rounded-full border border-[#e5ecf8] bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Preview
                              </Link>
                            )}
                            <button
                              type="button"
                              disabled={busyKey === `delete:${module.moduleId}` || isPending}
                              onClick={() => void deleteModule(module.moduleId)}
                              className="flex items-center gap-1.5 rounded-full border border-[#fde8e8] bg-white px-3 py-1.5 text-xs font-semibold text-[#dc2626] transition-colors hover:bg-[#fff5f5] disabled:opacity-40"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              {busyKey === `delete:${module.moduleId}` ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8">
          <button
            type="button"
            onClick={() => setShowEmptyLessons((current) => !current)}
            className="text-sm font-semibold text-slate-500 transition-colors hover:text-slate-800"
          >
            Lessons without a module ({lessonsWithoutModule.length})
          </button>

          {showEmptyLessons && (
            <div className="mt-3 overflow-hidden rounded-[24px] border border-[#e5ecf8] bg-white/80 shadow-sm">
              {lessonsWithoutModule.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-slate-400">
                  Every lesson currently has a module assigned.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-sm">
                    <thead>
                      <tr className="border-b border-[#f0f4fb]">
                        {["Lesson", "Subject", "Chapter", "Week", "Actions"].map((heading) => (
                          <th
                            key={heading}
                            className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-400"
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {lessonsWithoutModule.map((lesson) => (
                        <tr
                          key={lesson.lessonId}
                          className="border-b border-[#f7f9fc] transition-colors last:border-b-0 hover:bg-[#f8fbff]"
                        >
                          <td className="px-5 py-3.5">
                            <p className="font-medium text-slate-700">{lesson.lessonTitle}</p>
                            {lesson.lessonCode && <p className="text-xs text-slate-400">{lesson.lessonCode}</p>}
                          </td>
                          <td className="px-5 py-3.5 text-slate-500">{lesson.subjectTitle || "—"}</td>
                          <td className="px-5 py-3.5 text-slate-500">{lesson.chapterTitle || "—"}</td>
                          <td className="px-5 py-3.5 text-slate-500">{lesson.week || "—"}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex flex-wrap items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setActionError("");
                                  setSelectedLesson(lesson);
                                }}
                                className="rounded-full border border-[#dce6ff] bg-white px-3 py-1.5 text-xs font-semibold text-[#2f6fff] transition-colors hover:bg-[#f0f6ff]"
                              >
                                Assign Existing
                              </button>
                              <Link
                                href="/admin/module-editor"
                                className="rounded-full bg-[#2f6fff] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
                              >
                                Create New Module
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {selectedLesson && (
        <LessonAssignmentDialog
          lesson={selectedLesson}
          modules={modules}
          currentModule={moduleByLessonId.get(selectedLesson.lessonId) ?? null}
          busyKey={busyKey}
          error={actionError}
          onClose={() => {
            setSelectedLesson(null);
            setActionError("");
          }}
          onAssign={assignModule}
          onUnassign={unassignLesson}
        />
      )}

      {selectedModule && (
        <ModuleAssignmentDialog
          module={selectedModule}
          lessons={lessons}
          moduleByLessonId={moduleByLessonId}
          busyKey={busyKey}
          error={actionError}
          onClose={() => {
            setSelectedModule(null);
            setActionError("");
          }}
          onAssign={assignModule}
          onUnassign={unassignLesson}
        />
      )}
    </div>
  );
}
