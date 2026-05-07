"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileText,
  PencilLine,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ModuleListEntry } from "@/lib/module-editor";
import type { ModuleEditorBreadcrumb } from "@/types/module-editor";

type LessonStub = {
  nodeId: string;
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

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", className)}>
      {children}
    </span>
  );
}

// ── New Module Dialog ────────────────────────────────────────────────────────

function NewModuleDialog({
  lessons,
  onClose,
}: {
  lessons: LessonStub[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<LessonStub | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return lessons;
    return lessons.filter(
      (l) =>
        l.lessonTitle.toLowerCase().includes(q) ||
        l.subjectTitle.toLowerCase().includes(q) ||
        l.chapterTitle.toLowerCase().includes(q) ||
        l.lessonCode.toLowerCase().includes(q)
    );
  }, [lessons, search]);

  // Group by subject
  const grouped = useMemo(() => {
    const map = new Map<string, LessonStub[]>();
    for (const l of filtered) {
      const key = l.subjectTitle || "Other";
      map.set(key, [...(map.get(key) ?? []), l]);
    }
    return map;
  }, [filtered]);

  function handleConfirm() {
    if (!selected) return;
    router.push(`/admin/module-editor?nodeId=${encodeURIComponent(selected.nodeId)}`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4 rounded-[28px] border border-[#e5ecf8] bg-white shadow-[0_40px_100px_-40px_rgba(15,23,42,0.5)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#f0f4fb]">
          <div>
            <p className="text-[1.1rem] font-bold text-slate-950">New Module</p>
            <p className="text-xs text-slate-400 mt-0.5">Pick a lesson to attach this module to</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-2 rounded-[14px] border border-[#dce6ff] bg-[#f8fbff] px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search lessons…"
              className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none"
            />
          </div>
        </div>

        {/* List */}
        <div className="mt-3 max-h-72 overflow-y-auto px-6 pb-2">
          {grouped.size === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">No lessons found.</p>
          ) : (
            [...grouped.entries()].map(([subject, items]) => (
              <div key={subject} className="mb-3">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  {subject}
                </p>
                <div className="space-y-1">
                  {items.map((lesson) => (
                    <button
                      key={lesson.nodeId}
                      type="button"
                      onClick={() => setSelected(lesson)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-[14px] border px-4 py-3 text-left transition-colors",
                        selected?.nodeId === lesson.nodeId
                          ? "border-[#2f6fff] bg-[#eef4ff]"
                          : "border-[#e8eef8] bg-white hover:bg-[#f7faff]"
                      )}
                    >
                      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{lesson.lessonTitle}</p>
                        <p className="text-xs text-slate-400 truncate">
                          {lesson.chapterTitle}
                          {lesson.week ? ` · ${lesson.week}` : ""}
                          {lesson.lessonCode ? ` · ${lesson.lessonCode}` : ""}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
          {/* Note pointing to curriculum portal for new lessons */}
          <div className="mt-4 border-t border-[#f0f4fb] pt-4 text-center">
            <p className="text-xs text-slate-500">
              Can&apos;t find the lesson you need? You can create new lessons in the{" "}
              <Link href="/admin/curriculum" className="font-semibold text-[#2f6fff] hover:underline" onClick={onClose}>
                Curriculum Portal
              </Link>
              .
            </p>
          </div>
        </div>
        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[#f0f4fb] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#d9e1ef] bg-white px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selected}
            onClick={handleConfirm}
            className="rounded-full bg-[linear-gradient(135deg,#2f6fff,#1d4ed8)] px-5 py-2 text-sm font-semibold text-white shadow-[0_12px_24px_-14px_rgba(37,99,235,0.65)] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Open Module Editor →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ModuleLibraryClient({
  modules,
  lessonsWithoutModule,
}: {
  modules: ModuleListEntry[];
  lessonsWithoutModule: LessonStub[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [dialogPreselect, setDialogPreselect] = useState<LessonStub | null>(null);
  const [showEmpty, setShowEmpty] = useState(false);
  const [unassigning, setUnassigning] = useState<string | null>(null);

  // Derive filter options
  const subjects = useMemo(() => {
    const s = new Set(modules.map((m) => m.subjectTitle).filter(Boolean));
    return [...s].sort();
  }, [modules]);

  const years = useMemo(() => {
    const y = new Set(
      modules.map((m) => m.breadcrumbs.find((b) => b.nodeType === "year")?.title ?? "").filter(Boolean)
    );
    return [...y].sort();
  }, [modules]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return modules.filter((m) => {
      if (filterSubject !== "all" && m.subjectTitle !== filterSubject) return false;
      const yearTitle = m.breadcrumbs.find((b) => b.nodeType === "year")?.title ?? "";
      if (filterYear !== "all" && yearTitle !== filterYear) return false;
      if (!q) return true;
      return (
        m.lessonTitle.toLowerCase().includes(q) ||
        m.moduleTitle.toLowerCase().includes(q) ||
        m.subjectTitle.toLowerCase().includes(q) ||
        m.chapterTitle.toLowerCase().includes(q) ||
        m.lessonCode.toLowerCase().includes(q)
      );
    });
  }, [modules, search, filterSubject, filterYear]);

  async function handleUnassign(nodeId: string) {
    if (!confirm("Remove this module? The lesson will still exist but its content will be deleted.")) return;
    setUnassigning(nodeId);
    try {
      await fetch(`/api/modules/${encodeURIComponent(nodeId)}`, { method: "DELETE" });
      startTransition(() => router.refresh());
    } finally {
      setUnassigning(null);
    }
  }

  function openDialogForLesson(lesson: LessonStub) {
    setDialogPreselect(lesson);
    setShowDialog(true);
  }

  const dialogLessons = useMemo(() => {
    if (dialogPreselect) return [dialogPreselect];
    return lessonsWithoutModule;
  }, [dialogPreselect, lessonsWithoutModule]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7faff_0%,#eef4ff_50%,#f9fbff_100%)]">
      <main className="mx-auto max-w-[1280px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[2rem] font-black tracking-tight text-slate-950">Module Library</h1>
            <p className="mt-1 text-sm text-slate-500">
              {modules.length} module{modules.length !== 1 ? "s" : ""} across the curriculum
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setDialogPreselect(null); setShowDialog(true); }}
            className="flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#2f6fff,#1d4ed8)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_16px_32px_-20px_rgba(37,99,235,0.8)] hover:brightness-105 transition-all"
          >
            <Plus className="h-4 w-4" />
            New Module
          </button>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-[14px] border border-[#dce6ff] bg-white px-3 py-2 shadow-sm">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search modules…"
              className="w-48 bg-transparent text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none"
            />
          </div>

          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="rounded-[14px] border border-[#dce6ff] bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="rounded-[14px] border border-[#dce6ff] bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:outline-none"
          >
            <option value="all">All Years</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>

          {(search || filterSubject !== "all" || filterYear !== "all") && (
            <button
              type="button"
              onClick={() => { setSearch(""); setFilterSubject("all"); setFilterYear("all"); }}
              className="flex items-center gap-1.5 rounded-full border border-[#f0c0a0] bg-[#fff7f0] px-3 py-2 text-xs font-semibold text-[#c2410c] hover:bg-[#ffede0]"
            >
              <X className="h-3.5 w-3.5" />
              Clear filters
            </button>
          )}
        </div>

        {/* Modules table */}
        <div className="mt-6 rounded-[24px] border border-white/70 bg-white/90 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.3)] backdrop-blur overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-400">
              No modules match your filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead>
                  <tr className="border-b border-[#f0f4fb]">
                    {["Lesson", "Subject", "Chapter", "Week", "Pages", "Last Updated", "Actions"].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => {
                    const previewHref = `/admin/materials/curriculum/${m.schoolSlug}/${m.yearSlug}/${m.subjectSlug}/${m.chapterSlug}/${m.lessonSlug}`;
                    const editHref = `/admin/module-editor?nodeId=${encodeURIComponent(m.nodeId)}`;
                    const isUnassigning = unassigning === m.nodeId;

                    return (
                      <tr key={m.nodeId} className="border-b border-[#f7f9fc] last:border-b-0 hover:bg-[#f8fbff] transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] bg-[#eef4ff] text-[#2f6fff]">
                              <BookOpen className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{m.lessonTitle}</p>
                              {m.lessonCode && (
                                <p className="text-xs text-slate-400">{m.lessonCode}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-600">{m.subjectTitle || "—"}</td>
                        <td className="px-5 py-4 text-slate-600">{m.chapterTitle || "—"}</td>
                        <td className="px-5 py-4">
                          {m.week ? (
                            <Badge className="border border-[#dce6ff] bg-[#f0f6ff] text-[#2f6fff]">{m.week}</Badge>
                          ) : "—"}
                        </td>
                        <td className="px-5 py-4">
                          <Badge className="bg-[#ecfbf3] text-[#159a61]">{m.pageCount} {m.pageCount === 1 ? "page" : "pages"}</Badge>
                        </td>
                        <td className="px-5 py-4 text-slate-500">{formatDate(m.updatedAt)}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Link
                              href={editHref}
                              className="flex items-center gap-1.5 rounded-full border border-[#dce6ff] bg-white px-3 py-1.5 text-xs font-semibold text-[#2f6fff] hover:bg-[#f0f6ff] transition-colors"
                            >
                              <PencilLine className="h-3.5 w-3.5" />
                              Edit
                            </Link>
                            <Link
                              href={previewHref}
                              className="flex items-center gap-1.5 rounded-full border border-[#e5ecf8] bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              Preview
                            </Link>
                            <button
                              type="button"
                              disabled={isUnassigning || isPending}
                              onClick={() => handleUnassign(m.nodeId)}
                              className="flex items-center gap-1.5 rounded-full border border-[#fde8e8] bg-white px-3 py-1.5 text-xs font-semibold text-[#dc2626] hover:bg-[#fff5f5] transition-colors disabled:opacity-40"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              {isUnassigning ? "Removing…" : "Unassign"}
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

        {/* Lessons without modules (collapsible) */}
        {lessonsWithoutModule.length > 0 && (
          <div className="mt-8">
            <button
              type="button"
              onClick={() => setShowEmpty((v) => !v)}
              className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              {showEmpty ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              Lessons without a module ({lessonsWithoutModule.length})
            </button>

            {showEmpty && (
              <div className="mt-3 rounded-[24px] border border-[#e5ecf8] bg-white/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead>
                      <tr className="border-b border-[#f0f4fb]">
                        {["Lesson", "Subject", "Chapter", "Week", ""].map((h, i) => (
                          <th key={i} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {lessonsWithoutModule.map((l) => (
                        <tr key={l.nodeId} className="border-b border-[#f7f9fc] last:border-b-0 hover:bg-[#f8fbff] transition-colors">
                          <td className="px-5 py-3.5">
                            <p className="font-medium text-slate-700">{l.lessonTitle}</p>
                            {l.lessonCode && <p className="text-xs text-slate-400">{l.lessonCode}</p>}
                          </td>
                          <td className="px-5 py-3.5 text-slate-500">{l.subjectTitle || "—"}</td>
                          <td className="px-5 py-3.5 text-slate-500">{l.chapterTitle || "—"}</td>
                          <td className="px-5 py-3.5 text-slate-500">{l.week || "—"}</td>
                          <td className="px-5 py-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => openDialogForLesson(l)}
                              className="flex items-center gap-1.5 rounded-full bg-[#2f6fff] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1d4ed8] transition-colors ml-auto"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Create Module
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {showDialog && (
        <NewModuleDialog
          lessons={dialogLessons}
          onClose={() => { setShowDialog(false); setDialogPreselect(null); }}
        />
      )}
    </div>
  );
}
