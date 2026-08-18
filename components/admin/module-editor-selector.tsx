"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, Layers3, NotebookPen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ModuleCatalogSubjectGroup } from "@/types/module-editor";

function createSearch(
  subjectSlug: string | null,
  chapterSlug: string | null,
  moduleId: string | null,
  creatingNew: boolean
) {
  const params = new URLSearchParams();

  if (subjectSlug) params.set("subjectSlug", subjectSlug);
  if (chapterSlug) params.set("chapterSlug", chapterSlug);
  if (moduleId) {
    params.set("moduleId", moduleId);
  } else if (creatingNew) {
    params.set("new", "1");
  }

  const search = params.toString();
  return search ? `?${search}` : "";
}

export function ModuleEditorSelector({
  subjects,
  currentSubjectSlug,
  currentChapterSlug,
  currentModuleId,
  creatingNew,
}: {
  subjects: ModuleCatalogSubjectGroup[];
  currentSubjectSlug: string | null;
  currentChapterSlug: string | null;
  currentModuleId: string | null;
  creatingNew: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const currentSubject = useMemo(
    () => subjects.find((subject) => subject.slug === currentSubjectSlug) ?? null,
    [currentSubjectSlug, subjects]
  );

  const chapters = currentSubject?.chapters ?? [];
  const currentChapter = chapters.find((chapter) => chapter.slug === currentChapterSlug) ?? null;
  const modules = currentChapter?.modules ?? [];

  const navigate = (
    subjectSlug: string | null,
    chapterSlug: string | null,
    moduleId: string | null,
    nextCreatingNew: boolean
  ) => {
    router.replace(`${pathname}${createSearch(subjectSlug, chapterSlug, moduleId, nextCreatingNew)}`);
  };

  return (
    <section className="rounded-[30px] border border-[#edf2fb] bg-white/92 p-5 shadow-[0_30px_70px_-60px_rgba(15,23,42,0.35)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Module Editor Flow</p>
          <h1 className="mt-2 text-[2rem] font-black tracking-tight text-slate-950">Pilih Subject, Chapter, dan Module</h1>
          <p className="mt-2 max-w-3xl text-[15px] leading-7 text-slate-500">
            Pick the catalog location first. After that you can open an existing module or create a new one in the
            same chapter.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            asChild
            variant="outline"
            className="h-11 rounded-2xl border-[#dce6f7] bg-white px-5 text-slate-700 shadow-none hover:bg-[#f7faff]"
          >
            <Link href="/admin/materials">
              Materials Catalog
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">Pilih Subject</span>
          <select
            value={currentSubjectSlug ?? ""}
            onChange={(event) => navigate(event.target.value || null, null, null, false)}
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
          <span className="text-sm font-semibold text-slate-700">Pilih Chapter</span>
          <select
            value={currentChapterSlug ?? ""}
            onChange={(event) =>
              navigate(currentSubjectSlug, event.target.value || null, null, false)
            }
            disabled={!currentSubject}
            className="h-12 w-full rounded-2xl border border-[#dfe7f5] bg-white px-4 text-sm text-slate-700 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
          >
            <option value="">Select chapter</option>
            {chapters.map((chapter) => (
              <option key={chapter.slug} value={chapter.slug}>
                {chapter.title}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">Pilih Module</span>
          <select
            value={currentModuleId ?? ""}
            onChange={(event) =>
              navigate(currentSubjectSlug, currentChapterSlug, event.target.value || null, false)
            }
            disabled={!currentChapter}
            className="h-12 w-full rounded-2xl border border-[#dfe7f5] bg-white px-4 text-sm text-slate-700 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
          >
            <option value="">Select module</option>
            {modules.map((module) => (
              <option key={module.moduleId} value={module.moduleId}>
                {module.moduleTitle}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="rounded-[24px] border border-[#e7edf8] bg-[#f8fbff] p-4">
          {currentSubject && currentChapter ? (
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#2f6fff]">
                  <Layers3 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Selected Chapter</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {currentSubject.title} · {currentChapter.title}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#2f6fff]">
                  <NotebookPen className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Modules</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {modules.length} module{modules.length === 1 ? "" : "s"} in this chapter
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Choose a subject and chapter to continue.</p>
          )}
        </div>

        <Button
          type="button"
          disabled={!currentSubject || !currentChapter}
          onClick={() => navigate(currentSubjectSlug, currentChapterSlug, null, true)}
          className="h-12 rounded-2xl bg-[linear-gradient(135deg,#2f6fff_0%,#1d4ed8_100%)] px-5 text-white shadow-[0_20px_40px_-28px_rgba(37,99,235,0.88)] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Module
        </Button>
      </div>

      {currentChapter && modules.length > 0 && !currentModuleId && !creatingNew ? (
        <div className="mt-5 rounded-[24px] border border-[#e7edf8] bg-white p-4">
          <p className="text-sm font-semibold text-slate-900">Available modules in this chapter</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {modules.map((module) => (
              <button
                key={module.moduleId}
                type="button"
                onClick={() => navigate(currentSubjectSlug, currentChapterSlug, module.moduleId, false)}
                className="rounded-full border border-[#dce6ff] bg-[#f4f8ff] px-4 py-2 text-sm font-semibold text-[#2f6fff] transition-colors hover:bg-[#eaf1ff]"
              >
                {module.moduleTitle}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
