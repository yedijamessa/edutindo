"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Layers3, NotebookPen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ModuleCatalogChapterGroup, ModuleCatalogSubjectGroup } from "@/types/module-editor";

function formatDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Recently updated";

  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AdminMaterialsCatalog({
  subjects,
}: {
  subjects: ModuleCatalogSubjectGroup[];
}) {
  const [selectedSubjectSlug, setSelectedSubjectSlug] = useState<string>("");
  const [selectedChapterSlug, setSelectedChapterSlug] = useState<string>("");

  const totalChapters = subjects.reduce((sum, subject) => sum + subject.chapters.length, 0);
  const totalModules = subjects.reduce(
    (sum, subject) => sum + subject.chapters.reduce((chapterSum, chapter) => chapterSum + chapter.modules.length, 0),
    0
  );

  const selectedSubject = useMemo(
    () => subjects.find((subject) => subject.slug === selectedSubjectSlug) ?? null,
    [selectedSubjectSlug, subjects]
  );
  const effectiveChapterSlug =
    selectedSubject?.chapters.some((chapter) => chapter.slug === selectedChapterSlug) ? selectedChapterSlug : "";
  const selectedChapter = useMemo(
    () => selectedSubject?.chapters.find((chapter) => chapter.slug === effectiveChapterSlug) ?? null,
    [effectiveChapterSlug, selectedSubject]
  );

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fcf8ef_0%,#f7f9ff_18%,#f3f7ff_100%)]">
      <main className="portal-page-width space-y-6 px-4 py-5 lg:px-6 lg:py-6">
        <section className="rounded-[32px] border border-white/70 bg-white/92 p-6 shadow-[0_36px_90px_-68px_rgba(37,99,235,0.58)]">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-[linear-gradient(180deg,#eef4ff_0%,#dfe8ff_100%)] text-[#2f6fff] shadow-[0_18px_36px_-24px_rgba(47,111,255,0.72)]">
                <BookOpen className="h-7 w-7" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Admin Materials</p>
                <h1 className="mt-2 text-[2.2rem] font-black tracking-tight text-slate-950">Subject, Chapter, and Module Catalog</h1>
                <p className="mt-2 max-w-3xl text-[15px] leading-7 text-slate-500">
                  Select a subject first, then a chapter, and only then review the modules in that chapter.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-2xl border-[#dce6f7] bg-white px-5 text-slate-700 shadow-none hover:bg-[#f7faff]"
              >
                <Link href="/admin/module-editor">Open Module Editor</Link>
              </Button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-[24px] border border-[#e7edf8] bg-[#f8fbff] p-4">
              <p className="text-sm font-medium text-slate-500">Subjects</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{subjects.length}</p>
            </div>
            <div className="rounded-[24px] border border-[#e7edf8] bg-[#f8fbff] p-4">
              <p className="text-sm font-medium text-slate-500">Chapters</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{totalChapters}</p>
            </div>
            <div className="rounded-[24px] border border-[#e7edf8] bg-[#f8fbff] p-4">
              <p className="text-sm font-medium text-slate-500">Modules</p>
              <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{totalModules}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[30px] border border-white/70 bg-white/92 p-5 shadow-[0_32px_80px_-70px_rgba(15,23,42,0.45)]">
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Step 1</span>
              <p className="text-sm font-semibold text-slate-700">Choose Subject</p>
              <select
                value={selectedSubjectSlug}
                onChange={(event) => {
                  setSelectedSubjectSlug(event.target.value);
                  setSelectedChapterSlug("");
                }}
                className="h-12 w-full rounded-2xl border border-[#dfe7f5] bg-white px-4 text-sm text-slate-700 focus:outline-none"
              >
                <option value="">Select subject</option>
                {subjects.map((subject) => (
                  <option key={subject.slug} value={subject.slug}>
                    {subject.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Step 2</span>
              <p className="text-sm font-semibold text-slate-700">Choose Chapter</p>
              <select
                value={effectiveChapterSlug}
                onChange={(event) => setSelectedChapterSlug(event.target.value)}
                disabled={!selectedSubject}
                className="h-12 w-full rounded-2xl border border-[#dfe7f5] bg-white px-4 text-sm text-slate-700 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">{selectedSubject ? "Select chapter" : "Choose subject first"}</option>
                {selectedSubject?.chapters.map((chapter) => (
                  <option key={chapter.slug} value={chapter.slug}>
                    {chapter.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        {selectedSubject ? (
          <section className="rounded-[30px] border border-white/70 bg-white/92 p-5 shadow-[0_32px_80px_-70px_rgba(15,23,42,0.45)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">Selected Subject</p>
                <h2 className="mt-2 text-[1.8rem] font-black tracking-tight text-slate-950">{selectedSubject.title}</h2>
              </div>
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-2xl border-[#dce6f7] bg-white px-5 text-slate-700 shadow-none hover:bg-[#f7faff]"
              >
                <Link href={`/admin/module-editor?subjectSlug=${encodeURIComponent(selectedSubject.slug)}`}>
                  Open Subject in Editor
                </Link>
              </Button>
            </div>
          </section>
        ) : null}

        {selectedSubject && selectedChapter ? (
          <SelectedChapterCatalog subject={selectedSubject} chapter={selectedChapter} />
        ) : (
          <section className="rounded-[30px] border border-dashed border-[#d9e5fb] bg-white/75 px-6 py-10 text-center text-sm text-slate-500">
            {selectedSubject
              ? "Choose a chapter to see only that chapter and its modules."
              : "Choose a subject first, then choose a chapter."}
          </section>
        )}
      </main>
    </div>
  );
}

function SelectedChapterCatalog({
  subject,
  chapter,
}: {
  subject: ModuleCatalogSubjectGroup;
  chapter: ModuleCatalogChapterGroup;
}) {
  return (
    <section className="rounded-[30px] border border-white/70 bg-white/92 p-5 shadow-[0_32px_80px_-70px_rgba(15,23,42,0.45)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#2f6fff]">
            <Layers3 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Selected Chapter</p>
            <h3 className="truncate text-[1.65rem] font-black tracking-tight text-slate-950">{chapter.title}</h3>
            <p className="mt-1 text-sm text-slate-500">
              {subject.title} · {chapter.modules.length} module{chapter.modules.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <Button
          asChild
          className="h-10 rounded-2xl bg-[linear-gradient(135deg,#2f6fff_0%,#1d4ed8_100%)] px-4 text-white shadow-[0_18px_36px_-24px_rgba(37,99,235,0.88)] hover:brightness-105"
        >
          <Link
            href={`/admin/module-editor?subjectSlug=${encodeURIComponent(subject.slug)}&chapterSlug=${encodeURIComponent(chapter.slug)}&new=1`}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Module
          </Link>
        </Button>
      </div>

      <div className="mt-5 space-y-3">
        {chapter.modules.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-[#d9e5fb] bg-white px-4 py-5 text-sm text-slate-500">
            No modules yet in this chapter.
          </div>
        ) : (
          chapter.modules.map((module) => (
            <Link
              key={module.moduleId}
              href={`/admin/module-editor?subjectSlug=${encodeURIComponent(subject.slug)}&chapterSlug=${encodeURIComponent(chapter.slug)}&moduleId=${encodeURIComponent(module.moduleId)}`}
              className="block rounded-[22px] border border-[#e5ecf8] bg-white p-4 transition-colors hover:border-[#cfe0ff] hover:bg-[#f8fbff]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <NotebookPen className="h-4 w-4 text-[#2f6fff]" />
                    <h4 className="truncate text-base font-bold text-slate-950">{module.moduleTitle}</h4>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    {module.pageCount} page{module.pageCount === 1 ? "" : "s"} · {module.assignmentCount} curriculum placement
                    {module.assignmentCount === 1 ? "" : "s"}
                  </p>
                </div>
                <span className="rounded-full border border-[#dce6ff] bg-[#f4f8ff] px-3 py-1 text-xs font-semibold text-[#2f6fff]">
                  Updated {formatDate(module.updatedAt)}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
