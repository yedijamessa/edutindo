"use client";

import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  CircleHelp,
  Clock3,
  Download,
  ExternalLink,
  Grid2X2,
  List,
  ListFilter,
  Mail,
  Plus,
  Search,
  Settings,
  Trash2,
  Unlink,
  Users,
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

function ModuleLabel({
  module,
  showAssignmentCount = true,
}: {
  module: ModuleListEntry;
  showAssignmentCount?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold text-slate-900">{module.moduleTitle}</p>
      <p className="truncate text-xs text-slate-400">
        {module.pageCount} {module.pageCount === 1 ? "page" : "pages"}
        {showAssignmentCount ? ` · ${module.assignments.length}` : ""}
      </p>
    </div>
  );
}

function getModuleSubject(module: ModuleListEntry) {
  return module.assignments[0]?.subjectTitle || "General";
}

function getModuleTopic(module: ModuleListEntry) {
  return module.assignments[0]?.chapterTitle || "General";
}

function getSchoolTitleFromBreadcrumbs(breadcrumbs: ModuleEditorBreadcrumb[]) {
  return breadcrumbs.find((item) => item.nodeType === "school")?.title ?? "";
}

function getLessonSchoolTitle(lesson: LessonStub) {
  return getSchoolTitleFromBreadcrumbs(lesson.breadcrumbs) || lesson.schoolSlug || "No school";
}

function getAssignmentSchoolTitle(assignment: ModuleListEntry["assignments"][number]) {
  return getSchoolTitleFromBreadcrumbs(assignment.breadcrumbs) || assignment.schoolSlug || "No school";
}

function lessonMatchesSchool(lesson: LessonStub, schoolSlug: string) {
  return schoolSlug === "all" || lesson.schoolSlug === schoolSlug;
}

function moduleMatchesSchool(module: ModuleListEntry, schoolSlug: string) {
  return schoolSlug === "all" || module.assignments.some((assignment) => assignment.schoolSlug === schoolSlug);
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
  selectedSchoolSlug,
  busyKey,
  error,
  onClose,
  onAssignStudent,
}: {
  module: ModuleListEntry;
  selectedSchoolSlug: string;
  busyKey: string | null;
  error: string;
  onClose: () => void;
  onAssignStudent: (moduleId: string, lessonId: string, email: string) => Promise<string | null>;
}) {
  const [studentEmails, setStudentEmails] = useState("");
  const [studentMessage, setStudentMessage] = useState("");
  const normalizeTitle = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");
  const moduleTitle = normalizeTitle(module.moduleTitle);
  const schoolAssignments =
    selectedSchoolSlug === "all"
      ? module.assignments
      : module.assignments.filter((assignment) => assignment.schoolSlug === selectedSchoolSlug);
  const candidateAssignments = schoolAssignments.length > 0 ? schoolAssignments : module.assignments;
  const studentAssignment =
    candidateAssignments.find((assignment) => normalizeTitle(assignment.lessonTitle) === moduleTitle) ??
    candidateAssignments.find((assignment) => {
      const lessonTitle = normalizeTitle(assignment.lessonTitle);
      return Boolean(lessonTitle) && (moduleTitle.includes(lessonTitle) || lessonTitle.includes(moduleTitle));
    }) ??
    candidateAssignments[0] ??
    null;

  return (
    <DialogShell
      title="Assign Lessons"
      description="Attach this reusable module to any lesson. Each lesson can use one module at a time."
      onClose={onClose}
    >
      <div className="space-y-5 px-6 py-5">
        <div className="rounded-[18px] border border-[#e8eef8] bg-[#f8fbff] p-4">
          <ModuleLabel module={module} showAssignmentCount={false} />
        </div>

        <form
          className="rounded-[18px] border border-[#dce6ff] bg-white p-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setStudentMessage("");

            if (!studentAssignment) return;

            const message = await onAssignStudent(module.moduleId, studentAssignment.lessonId, studentEmails);
            if (message) {
              setStudentMessage(message);
              setStudentEmails("");
            }
          }}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#eef4ff] text-[#2f6fff]">
              <Mail className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900">Send to student</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Enter one or more emails. Existing users must already be students in this school; new users receive an invite for this school.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
            <textarea
              value={studentEmails}
              onChange={(event) => {
                setStudentEmails(event.target.value);
                setStudentMessage("");
              }}
              placeholder="student1@email.com, student2@email.com"
              rows={2}
              className="min-h-11 rounded-[12px] border border-[#e4ecfb] bg-[#f8fbff] px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#2f6fff] focus:outline-none focus:ring-1 focus:ring-[#2f6fff]"
            />
            <div className="flex h-11 min-w-0 items-center rounded-[12px] border border-[#e4ecfb] bg-[#f8fbff] px-4 text-sm font-medium text-slate-700">
              <span className="truncate">
                {studentAssignment
                  ? studentAssignment.lessonTitle
                  : "Assign this module to a lesson first"}
              </span>
            </div>
            <button
              type="submit"
              disabled={!studentEmails.trim() || !studentAssignment || Boolean(busyKey)}
              className="inline-flex h-11 items-center justify-center rounded-[12px] bg-[#2f6fff] px-4 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {busyKey === `student:${module.moduleId}` ? "Sending..." : "Send assignment"}
            </button>
          </div>

          {studentMessage ? (
            <p className="mt-3 rounded-[12px] border border-[#bbf7d0] bg-[#ecfdf3] px-3 py-2 text-xs font-semibold text-[#15803d]">
              {studentMessage}
            </p>
          ) : null}
        </form>

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
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "assigned" | "unassigned">("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"updated-desc" | "updated-asc" | "title-asc">("updated-desc");
  const [showAllModules, setShowAllModules] = useState(false);
  const [inboxSearch, setInboxSearch] = useState("");
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>([]);
  const [selectedTargetModuleId, setSelectedTargetModuleId] = useState(modules[0]?.moduleId ?? "");
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

  useEffect(() => {
    if (selectedTargetModuleId && modules.some((module) => module.moduleId === selectedTargetModuleId)) return;
    setSelectedTargetModuleId(modules[0]?.moduleId ?? "");
  }, [modules, selectedTargetModuleId]);

  useEffect(() => {
    const availableLessonIds = new Set(
      lessonsWithoutModule
        .filter((lesson) => lessonMatchesSchool(lesson, schoolFilter))
        .map((lesson) => lesson.lessonId)
    );
    setSelectedLessonIds((current) => current.filter((lessonId) => availableLessonIds.has(lessonId)));
  }, [lessonsWithoutModule, schoolFilter]);

  const moduleByLessonId = useMemo(() => {
    const map = new Map<string, ModuleListEntry>();
    for (const module of modules) {
      for (const assignment of module.assignments) {
        map.set(assignment.lessonId, module);
      }
    }
    return map;
  }, [modules]);

  const schoolOptions = useMemo(() => {
    const schools = new Map<string, string>();

    for (const lesson of lessons) {
      if (lesson.schoolSlug) schools.set(lesson.schoolSlug, getLessonSchoolTitle(lesson));
    }

    for (const module of modules) {
      for (const assignment of module.assignments) {
        if (assignment.schoolSlug) schools.set(assignment.schoolSlug, getAssignmentSchoolTitle(assignment));
      }
    }

    return Array.from(schools.entries())
      .map(([slug, title]) => ({ slug, title }))
      .sort((left, right) => left.title.localeCompare(right.title));
  }, [lessons, modules]);

  const schoolScopedLessons = useMemo(
    () => lessons.filter((lesson) => lessonMatchesSchool(lesson, schoolFilter)),
    [lessons, schoolFilter]
  );
  const schoolScopedLessonsWithoutModule = useMemo(
    () => lessonsWithoutModule.filter((lesson) => lessonMatchesSchool(lesson, schoolFilter)),
    [lessonsWithoutModule, schoolFilter]
  );
  const schoolScopedModules = useMemo(
    () => modules.filter((module) => moduleMatchesSchool(module, schoolFilter)),
    [modules, schoolFilter]
  );

  const schoolScopedAssignedLessonCount = useMemo(() => {
    const assignedLessonIds = new Set<string>();

    for (const module of modules) {
      for (const assignment of module.assignments) {
        if (schoolFilter === "all" || assignment.schoolSlug === schoolFilter) {
          assignedLessonIds.add(assignment.lessonId);
        }
      }
    }

    return assignedLessonIds.size;
  }, [modules, schoolFilter]);

  const subjectOptions = useMemo(() => {
    const subjects = new Set<string>();

    for (const lesson of schoolScopedLessons) {
      if (lesson.subjectTitle) subjects.add(lesson.subjectTitle);
    }

    for (const module of schoolScopedModules) {
      for (const assignment of module.assignments) {
        if (assignment.subjectTitle) subjects.add(assignment.subjectTitle);
      }
    }

    return Array.from(subjects).sort((left, right) => left.localeCompare(right));
  }, [schoolScopedLessons, schoolScopedModules]);

  const filteredModules = useMemo(() => {
    const query = search.toLowerCase().trim();

    return schoolScopedModules
      .filter((module) => {
      const scopedAssignments =
        schoolFilter === "all"
          ? module.assignments
          : module.assignments.filter((assignment) => assignment.schoolSlug === schoolFilter);

      if (statusFilter === "assigned" && scopedAssignments.length === 0) return false;
      if (statusFilter === "unassigned" && scopedAssignments.length > 0) return false;
      if (subjectFilter !== "all" && !scopedAssignments.some((assignment) => assignment.subjectTitle === subjectFilter)) {
        return false;
      }

      if (!query) return true;
      if (module.moduleTitle.toLowerCase().includes(query)) return true;

      return module.assignments.some((assignment) =>
        [
          assignment.lessonTitle,
          assignment.subjectTitle,
          assignment.chapterTitle,
          assignment.schoolSlug,
          getAssignmentSchoolTitle(assignment),
          assignment.lessonCode,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query)
      );
      })
      .sort((left, right) => {
        if (sortOrder === "title-asc") return left.moduleTitle.localeCompare(right.moduleTitle);
        const leftTime = new Date(left.updatedAt).getTime();
        const rightTime = new Date(right.updatedAt).getTime();
        return sortOrder === "updated-asc" ? leftTime - rightTime : rightTime - leftTime;
      });
  }, [schoolFilter, schoolScopedModules, search, sortOrder, statusFilter, subjectFilter]);

  const visibleModules = showAllModules ? filteredModules : filteredModules.slice(0, 6);

  const filteredInboxLessons = useMemo(() => {
    const query = inboxSearch.toLowerCase().trim();
    if (!query) return schoolScopedLessonsWithoutModule;

    return schoolScopedLessonsWithoutModule.filter((lesson) =>
      [
        lesson.lessonTitle,
        getLessonSchoolTitle(lesson),
        lesson.schoolSlug,
        lesson.subjectTitle,
        lesson.chapterTitle,
        lesson.lessonCode,
        lesson.week,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [inboxSearch, schoolScopedLessonsWithoutModule]);

  const assignableModules = filteredModules.length > 0 ? filteredModules : schoolScopedModules;

  const assignedLessonCount = schoolScopedAssignedLessonCount;
  const latestUpdatedAt = schoolScopedModules.reduce<string | null>((latest, module) => {
    if (!latest) return module.updatedAt;
    return new Date(module.updatedAt).getTime() > new Date(latest).getTime() ? module.updatedAt : latest;
  }, null);

  useEffect(() => {
    if (subjectFilter === "all" || subjectOptions.includes(subjectFilter)) return;
    setSubjectFilter("all");
  }, [subjectFilter, subjectOptions]);

  useEffect(() => {
    if (selectedTargetModuleId && assignableModules.some((module) => module.moduleId === selectedTargetModuleId)) return;
    setSelectedTargetModuleId(assignableModules[0]?.moduleId ?? "");
  }, [assignableModules, selectedTargetModuleId]);

  function toggleInboxLesson(lessonId: string) {
    setSelectedLessonIds((current) =>
      current.includes(lessonId)
        ? current.filter((currentLessonId) => currentLessonId !== lessonId)
        : [...current, lessonId]
    );
  }

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

  async function assignSelectedLessons() {
    if (!selectedTargetModuleId || selectedLessonIds.length === 0) return;

    setBusyKey("bulk-assign");
    setActionError("");

    try {
      for (const lessonId of selectedLessonIds) {
        const response = await fetch("/api/admin/module-assignments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ moduleId: selectedTargetModuleId, lessonId }),
        });
        const data = await response.json();

        if (!response.ok || !data.ok) {
          throw new Error(data.error || "Failed to assign module.");
        }
      }

      setSelectedLessonIds([]);
      startTransition(() => router.refresh());
    } catch (error) {
      console.error(error);
      setActionError(error instanceof Error ? error.message : "Failed to assign module.");
    } finally {
      setBusyKey(null);
    }
  }

  async function assignModuleToStudent(moduleId: string, lessonId: string, emails: string) {
    if (!moduleId || !lessonId || !emails.trim()) return null;

    setBusyKey(`student:${moduleId}`);
    setActionError("");

    try {
      const response = await fetch("/api/admin/module-assignments/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId, lessonId, emails }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setActionError(data.error || "Failed to send lesson assignment.");
        return null;
      }

      startTransition(() => router.refresh());
      return String(data.message || "Lesson assignment sent.");
    } catch (error) {
      console.error(error);
      setActionError("Failed to send lesson assignment.");
      return null;
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fbfdff_0%,#f5f8ff_100%)] text-slate-950">
      <div className="portal-page-width flex min-h-screen">
        <aside className="hidden w-[88px] shrink-0 flex-col items-center border-r border-[#e6edf8] bg-white/90 py-5 lg:flex">
          <Link
            href="/admin/curriculum"
            className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-[#e6edf8] bg-white text-[#2f6fff] shadow-sm"
          >
            <BookOpen className="h-6 w-6" />
          </Link>
          <nav className="mt-5 flex flex-col gap-3">
            <Link
              href="/admin/curriculum"
              className="flex h-14 w-14 items-center justify-center rounded-[18px] text-slate-500 transition-colors hover:bg-[#eef4ff] hover:text-[#2f6fff]"
            >
              <BookOpen className="h-5 w-5" />
            </Link>
            <Link
              href="/admin/modules"
              className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#2f6fff] text-white shadow-[0_18px_32px_-18px_rgba(47,111,255,0.8)]"
            >
              <Grid2X2 className="h-5 w-5" />
            </Link>
            <Link
              href="/admin/materials"
              className="flex h-14 w-14 items-center justify-center rounded-[18px] text-slate-500 transition-colors hover:bg-[#eef4ff] hover:text-[#2f6fff]"
            >
              <List className="h-5 w-5" />
            </Link>
            <span className="flex h-14 w-14 items-center justify-center rounded-[18px] text-slate-500">
              <Users className="h-5 w-5" />
            </span>
            <span className="flex h-14 w-14 items-center justify-center rounded-[18px] text-slate-500">
              <BarChart3 className="h-5 w-5" />
            </span>
            <span className="flex h-14 w-14 items-center justify-center rounded-[18px] text-slate-500">
              <Settings className="h-5 w-5" />
            </span>
          </nav>
          <div className="mt-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
            N
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 pb-10 pt-5 sm:px-6 xl:px-10">
          <header className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-[#5c78ac]">
                <span>Curriculum Portal</span>
                <ChevronRight className="h-4 w-4" />
                <span className="font-semibold text-slate-700">Module Library</span>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#eef4ff] text-[#2f6fff]">
                  <BookOpen className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="text-[2rem] font-black tracking-tight text-slate-950 sm:text-[2.35rem]">Module Library</h1>
                  <p className="text-sm text-[#53688f]">
                    Create reusable modules and attach them to lessons across subjects.
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/admin/module-editor"
              className="mt-7 inline-flex items-center gap-2 rounded-[14px] bg-[linear-gradient(135deg,#2f6fff,#1d4ed8)] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_32px_-18px_rgba(37,99,235,0.9)] transition-all hover:brightness-105"
            >
              <Plus className="h-4 w-4" />
              New Module
            </Link>
          </header>

          <section className="mt-7 rounded-[18px] border border-[#cfe0ff] bg-[linear-gradient(135deg,#f7fbff_0%,#eef5ff_100%)] p-5 shadow-sm">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="grid gap-5 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white text-[#2f6fff] shadow-sm">
                    <BookOpen className="h-7 w-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-[#2f6fff] text-white">1</Badge>
                      <p className="font-semibold">Create Module</p>
                    </div>
                    <p className="mt-2 max-w-[190px] text-sm text-[#53688f]">
                      Group related lessons into reusable modules.
                    </p>
                  </div>
                </div>
                <ArrowRight className="hidden h-5 w-5 text-[#98afd8] md:block" />
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white text-[#2f6fff] shadow-sm">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-[#2f6fff] text-white">2</Badge>
                      <p className="font-semibold">Assign Lessons</p>
                    </div>
                    <p className="mt-2 max-w-[190px] text-sm text-[#53688f]">
                      Attach lessons to your modules so they&apos;re easy to reuse.
                    </p>
                  </div>
                </div>
                <ArrowRight className="hidden h-5 w-5 text-[#98afd8] md:block" />
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white text-[#2f6fff] shadow-sm">
                    <BookOpen className="h-7 w-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-[#2f6fff] text-white">3</Badge>
                      <p className="font-semibold">Reuse Anywhere</p>
                    </div>
                    <p className="mt-2 max-w-[190px] text-sm text-[#53688f]">
                      Use modules across subjects, chapters, and weeks.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => document.getElementById("assignment-inbox")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="flex items-center gap-4 rounded-[16px] border border-[#ffe0ba] bg-[#fff9f0] p-4 text-left transition-colors hover:bg-[#fff4e4]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fff0dc] text-[#f97316]">
                  <CircleAlert className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-bold text-[#ea580c]">{schoolScopedLessonsWithoutModule.length} lessons</p>
                  <p className="font-semibold text-[#ea580c]">need assignment</p>
                  <p className="mt-1 text-sm text-[#8b5a28]">Help organize your content by assigning lessons to modules.</p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-[#b8702f]" />
              </button>
            </div>
          </section>

          <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="flex items-center justify-between rounded-[18px] border border-[#e4ecfb] bg-[#f7faff] px-5 py-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#eaf2ff] text-[#2f6fff]">
                  <Grid2X2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#53688f]">Reusable Modules</p>
                  <p className="text-2xl font-bold text-[#2f6fff]">{schoolScopedModules.length}</p>
                  <p className="text-sm text-[#53688f]">Active modules</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-800" />
            </div>
            <div className="flex items-center justify-between rounded-[18px] border border-[#dff5ea] bg-[#f6fcf9] px-5 py-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e8fbf1] text-[#159a61]">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#53688f]">Assigned Lessons</p>
                  <p className="text-2xl font-bold text-[#159a61]">{assignedLessonCount}</p>
                  <p className="text-sm text-[#53688f]">Linked to modules</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-800" />
            </div>
            <div className="flex items-center justify-between rounded-[18px] border border-[#ffe7ca] bg-[#fff9f2] px-5 py-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fff0dc] text-[#f97316]">
                  <CircleAlert className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#53688f]">Unassigned Lessons</p>
                  <p className="text-2xl font-bold text-[#ea580c]">{schoolScopedLessonsWithoutModule.length}</p>
                  <p className="text-sm text-[#53688f]">Need assignment</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-800" />
            </div>
            <div className="flex items-center justify-between rounded-[18px] border border-[#eee5ff] bg-[#faf7ff] px-5 py-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f3ecff] text-[#7c3aed]">
                  <Clock3 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#53688f]">Recently Updated</p>
                  <p className="text-lg font-bold text-slate-900">{latestUpdatedAt ? formatDate(latestUpdatedAt) : "No updates"}</p>
                  <p className="text-sm text-[#53688f]">Last update</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-800" />
            </div>
          </section>

          <section className="mt-5 flex flex-wrap items-center gap-3 rounded-[18px] border border-[#e4ecfb] bg-white p-2 shadow-sm">
            <label className="relative min-w-[220px]">
              <select
                value={schoolFilter}
                onChange={(event) => {
                  setSchoolFilter(event.target.value);
                  setSearch("");
                  setInboxSearch("");
                  setSelectedLessonIds([]);
                  setShowAllModules(false);
                }}
                className="w-full appearance-none rounded-[14px] border border-[#e4ecfb] bg-white px-4 py-3 pr-10 text-sm font-semibold text-slate-700 focus:outline-none"
              >
                <option value="all">All Schools</option>
                {schoolOptions.map((school) => (
                  <option key={school.slug} value={school.slug}>
                    {school.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </label>
            <label className="flex min-w-[250px] flex-1 items-center gap-2 rounded-[14px] border border-[#e4ecfb] px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search modules in selected school..."
                className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
            </label>
            <label className="relative min-w-[170px]">
              <select
                value={subjectFilter}
                onChange={(event) => setSubjectFilter(event.target.value)}
                className="w-full appearance-none rounded-[14px] border border-[#e4ecfb] bg-white px-4 py-3 pr-10 text-sm text-slate-700 focus:outline-none"
              >
                <option value="all">All Subjects</option>
                {subjectOptions.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </label>
            <label className="relative min-w-[160px]">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as "all" | "assigned" | "unassigned")}
                className="w-full appearance-none rounded-[14px] border border-[#e4ecfb] bg-white px-4 py-3 pr-10 text-sm text-slate-700 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="assigned">Assigned</option>
                <option value="unassigned">Unassigned</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </label>
            <label className="relative min-w-[220px]">
              <select
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value as "updated-desc" | "updated-asc" | "title-asc")}
                className="w-full appearance-none rounded-[14px] border border-[#e4ecfb] bg-white px-4 py-3 pr-10 text-sm text-slate-700 focus:outline-none"
              >
                <option value="updated-desc">Last Updated (Newest)</option>
                <option value="updated-asc">Last Updated (Oldest)</option>
                <option value="title-asc">Title (A-Z)</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </label>
            <button
              type="button"
              onClick={() => {
                setSchoolFilter("all");
                setSearch("");
                setInboxSearch("");
                setStatusFilter("all");
                setSubjectFilter("all");
                setSortOrder("updated-desc");
                setSelectedLessonIds([]);
                setShowAllModules(false);
              }}
              className="px-4 py-3 text-sm font-semibold text-[#2f6fff] transition-colors hover:text-[#1d4ed8]"
            >
              Reset
            </button>
          </section>

          {actionError && (
            <div className="mt-4 rounded-[18px] border border-[#fde8e8] bg-[#fff5f5] px-4 py-3 text-sm font-medium text-[#dc2626]">
              {actionError}
            </div>
          )}

          <section className="mt-5 grid gap-5 2xl:grid-cols-[minmax(0,1fr)_470px]">
            <div className="overflow-hidden rounded-[18px] border border-[#e4ecfb] bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-[#eef3fb] px-5 py-4">
                <h2 className="text-xl font-bold">Reusable Modules</h2>
                <Badge className="border border-[#e4ecfb] bg-white text-[#53688f]">{filteredModules.length} modules</Badge>
              </div>

              {filteredModules.length === 0 ? (
                <div className="px-5 py-16 text-center text-sm text-slate-400">No modules match your filters.</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-sm">
                      <thead>
                        <tr className="border-b border-[#eef3fb]">
                          {["Module", "Subject / Topic", "Pages", "Lessons Using Module", "Last Updated", "Actions"].map((heading) => (
                            <th
                              key={heading}
                              className="px-5 py-3 text-left text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[#62789e]"
                            >
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {visibleModules.map((module) => (
                          <tr
                            key={module.moduleId}
                            className="border-b border-[#eef3fb] transition-colors last:border-b-0 hover:bg-[#f8fbff]"
                          >
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-[#eef4ff] text-[#2f6fff]">
                                  <BookOpen className="h-4 w-4" />
                                </div>
                                <ModuleLabel module={module} />
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <p className="font-medium text-slate-700">{getModuleSubject(module)}</p>
                              <p className="text-xs text-[#62789e]">{getModuleTopic(module)}</p>
                            </td>
                            <td className="px-5 py-3.5">
                              <Badge className="bg-[#ecfbf3] text-[#159a61]">
                                {module.pageCount}
                              </Badge>
                            </td>
                            <td className="px-5 py-3.5">
                              <Badge className="bg-[#ecfbf3] text-[#159a61]">
                                {module.assignments.length}
                              </Badge>
                            </td>
                            <td className="px-5 py-3.5 text-[#62789e]">{formatDate(module.updatedAt)}</td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/admin/module-editor?moduleId=${encodeURIComponent(module.moduleId)}`}
                                  className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#e4ecfb] px-3 py-2 text-xs font-semibold text-[#2f6fff] hover:bg-[#f7faff]"
                                >
                                  Open
                                  <ExternalLink className="h-3 w-3" />
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActionError("");
                                    setSelectedModule(module);
                                  }}
                                  className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#e4ecfb] px-3 py-2 text-xs font-semibold text-[#2f6fff] hover:bg-[#f7faff]"
                                >
                                  <Users className="h-3.5 w-3.5" />
                                  Assign Lessons
                                </button>
                                {(["pdf", "docx", "odt"] as const).map((format) => (
                                  <a
                                    key={format}
                                    href={`/admin/modules/${encodeURIComponent(module.moduleId)}/export?format=${format}`}
                                    className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#e4ecfb] px-3 py-2 text-xs font-semibold uppercase text-[#53688f] hover:bg-[#f7faff] hover:text-[#2f6fff]"
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                    {format}
                                  </a>
                                ))}
                                <button
                                  type="button"
                                  disabled={busyKey === `delete:${module.moduleId}` || isPending}
                                  onClick={() => void deleteModule(module.moduleId)}
                                  className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#fde8e8] text-[#dc2626] transition-colors hover:bg-[#fff5f5] disabled:opacity-40"
                                  aria-label={`Delete ${module.moduleTitle}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {filteredModules.length > 6 && (
                    <button
                      type="button"
                      onClick={() => setShowAllModules((current) => !current)}
                      className="flex w-full items-center justify-center gap-1.5 border-t border-[#eef3fb] px-5 py-3.5 text-sm font-semibold text-[#2f6fff] hover:bg-[#f8fbff]"
                    >
                      {showAllModules ? "Show fewer modules" : "View all modules"}
                      <ChevronDown className={cn("h-4 w-4 transition-transform", showAllModules && "rotate-180")} />
                    </button>
                  )}
                </>
              )}
            </div>

            <div
              id="assignment-inbox"
              className="overflow-hidden rounded-[18px] border border-[#e4ecfb] bg-white shadow-sm"
            >
              <div className="border-b border-[#eef3fb] px-5 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold">Assignment Inbox</h2>
                  <Badge className="bg-[#fff4e8] text-[#ea580c]">{schoolScopedLessonsWithoutModule.length} unassigned lessons</Badge>
                </div>
                <p className="mt-1 max-w-[320px] text-sm text-[#53688f]">
                  Choose a lesson and assign it to an existing module or create a new one.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <label className="flex min-w-0 flex-1 items-center gap-2 rounded-[12px] border border-[#e4ecfb] px-3 py-2.5">
                    <Search className="h-4 w-4 shrink-0 text-slate-400" />
                    <input
                      value={inboxSearch}
                      onChange={(event) => setInboxSearch(event.target.value)}
                      placeholder="Search lessons in selected school..."
                      className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                    />
                  </label>
                  <button
                    type="button"
                    className="flex h-11 w-11 items-center justify-center rounded-[12px] border border-[#e4ecfb] text-slate-700"
                    aria-label="Filter lessons"
                  >
                    <ListFilter className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[430px] text-sm">
                  <thead>
                    <tr className="border-b border-[#eef3fb]">
                      {["Lesson", "Subject", "Chapter", "Week"].map((heading) => (
                        <th
                          key={heading}
                          className="px-4 py-3 text-left text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[#62789e]"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInboxLessons.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-400">
                          {schoolScopedLessonsWithoutModule.length === 0 ? "Every lesson has a module assigned." : "No lessons match your search."}
                        </td>
                      </tr>
                    ) : (
                      filteredInboxLessons.slice(0, 6).map((lesson) => {
                        const isSelected = selectedLessonIds.includes(lesson.lessonId);

                        return (
                          <tr
                            key={lesson.lessonId}
                            className={cn("border-b border-[#eef3fb] last:border-b-0", isSelected && "bg-[#f7faff]")}
                          >
                            <td className="px-4 py-2.5">
                              <label className="flex cursor-pointer items-start gap-2.5">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleInboxLesson(lesson.lessonId)}
                                  className="mt-0.5 h-4 w-4 rounded border-[#b9cffd] accent-[#2f6fff]"
                                />
                                <span className="font-medium text-slate-800">{lesson.lessonTitle}</span>
                              </label>
                            </td>
                            <td className="px-4 py-2.5 text-[#53688f]">{lesson.subjectTitle || "—"}</td>
                            <td className="px-4 py-2.5 text-[#53688f]">{lesson.chapterTitle || "—"}</td>
                            <td className="px-4 py-2.5 text-[#53688f]">{lesson.week || "—"}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 border-t border-[#eef3fb] px-5 py-4">
                <div className="flex items-center justify-between rounded-[12px] border border-[#cfe0ff] bg-[#f7faff] px-3 py-2 text-sm font-medium text-[#2f6fff]">
                  <span>{selectedLessonIds.length} lessons selected</span>
                  <button
                    type="button"
                    onClick={() => setSelectedLessonIds([])}
                    className="font-semibold"
                  >
                    Clear selection
                  </button>
                </div>
                <label className="flex items-center gap-3 text-sm font-semibold text-slate-800">
                  <span className="shrink-0">Assigning to:</span>
                  <span className="relative min-w-0 flex-1">
                    <select
                      value={selectedTargetModuleId}
                      onChange={(event) => setSelectedTargetModuleId(event.target.value)}
                      className="w-full appearance-none rounded-[12px] border border-[#e4ecfb] bg-white px-4 py-2.5 pr-9 font-medium text-slate-700 focus:outline-none"
                    >
                      {assignableModules.map((module) => (
                        <option key={module.moduleId} value={module.moduleId}>
                          {module.moduleTitle}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  </span>
                </label>
                <button
                  type="button"
                  disabled={selectedLessonIds.length === 0 || !selectedTargetModuleId || assignableModules.length === 0 || Boolean(busyKey)}
                  onClick={() => void assignSelectedLessons()}
                  className="flex w-full items-center justify-center gap-2 rounded-[12px] bg-[linear-gradient(135deg,#2f6fff,#1d4ed8)] px-4 py-3 text-sm font-semibold text-white transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <Users className="h-4 w-4" />
                  {busyKey === "bulk-assign" ? "Assigning..." : "Assign to Selected Module"}
                </button>
                <Link
                  href="/admin/module-editor"
                  className="flex w-full items-center justify-center gap-2 rounded-[12px] border border-[#2f6fff] px-4 py-3 text-sm font-semibold text-[#2f6fff] hover:bg-[#f7faff]"
                >
                  <Plus className="h-4 w-4" />
                  Create Module from Lesson
                </Link>
                <p className="flex items-center gap-2 text-xs text-[#62789e]">
                  <CircleHelp className="h-3.5 w-3.5" />
                  Tip: Select multiple lessons to assign in bulk.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>

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
          selectedSchoolSlug={schoolFilter}
          busyKey={busyKey}
          error={actionError}
          onClose={() => {
            setSelectedModule(null);
            setActionError("");
          }}
          onAssignStudent={assignModuleToStudent}
        />
      )}
    </div>
  );
}
