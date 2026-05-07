"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleHelp,
  FileText,
  GraduationCap,
  Image as ImageIcon,
  Info,
  LayoutList,
  PencilLine,
  Plus,
  StickyNote,
  Lightbulb,
  Search,
  User,
  Calculator,
  Sigma,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ModuleEditorDocument,
  ModuleEditorPage,
  ModuleEditorQuizBlock,
  ModuleEditorQuizType,
} from "@/types/module-editor";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function getQuizTypeLabel(quizType: ModuleEditorQuizType) {
  switch (quizType) {
    case "multiple-choice-single": return "Multiple Choice";
    case "multiple-choice-multiple": return "Multiple Answer";
    case "true-false": return "True / False";
    case "short-answer": return "Short Answer";
    case "fill-in-the-blank": return "Fill in the Blank";
    case "matching": return "Matching";
    case "ordering": return "Ordering";
    case "essay": return "Extended Response";
    default: return "Quiz";
  }
}

function renderMarkdown(value: string) {
  return (
    <div className="prose prose-sm max-w-none text-slate-700 prose-p:leading-relaxed prose-headings:font-bold prose-headings:text-slate-900 prose-a:text-[#2f6fff] prose-a:no-underline hover:prose-a:underline prose-strong:font-bold prose-strong:text-slate-900 prose-ul:list-disc prose-ol:list-decimal prose-li:my-1 prose-img:float-right prose-img:ml-6 prose-img:w-[150px] sm:prose-img:w-[220px] prose-img:rounded-[12px] prose-img:object-cover prose-img:shadow-sm">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {value || "Content will appear here."}
      </ReactMarkdown>
    </div>
  );
}

function blockCount(page: ModuleEditorPage) {
  return page.blocks.length;
}

function totalBlocks(document: ModuleEditorDocument) {
  return document.pages.reduce((sum, page) => sum + page.blocks.length, 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function QuestionBlock({
  block,
  showAnswers,
}: {
  block: ModuleEditorQuizBlock;
  showAnswers: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const hasAcceptedAnswers =
    showAnswers &&
    (block.quizType === "short-answer" || block.quizType === "fill-in-the-blank") &&
    block.acceptableAnswers.some((a) => a.trim().length > 0);

  return (
    <div className="rounded-[20px] border border-[#ffedd5] bg-[#fffaf5]">
      {/* Header */}
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#fdba74] bg-white px-3 py-1 text-xs font-bold text-[#ea580c] shadow-sm">
            <PencilLine className="h-3.5 w-3.5" />
            {getQuizTypeLabel(block.quizType)}
          </span>
          {showAnswers && (
            <span className="text-xs font-medium text-[#ea580c]">
              Answer key visible
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-[#f0e8d0] px-5 pb-5">
          <p className="mt-4 text-sm font-semibold leading-relaxed text-slate-900">
            {block.prompt || "Quiz prompt"}
          </p>

          {/* Multiple choice / true-false options */}
          {(block.quizType === "multiple-choice-single" ||
            block.quizType === "multiple-choice-multiple" ||
            block.quizType === "true-false") && (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {block.options.map((option) => {
                const isCorrect = showAnswers && block.correctOptionIds.includes(option.id);
                const interactive = !showAnswers;
                const isSelected = interactive && selectedOptions.includes(option.id);
                
                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={!interactive}
                    onClick={() => {
                      if (!interactive) return;
                      if (block.quizType === "multiple-choice-single" || block.quizType === "true-false") {
                        setSelectedOptions([option.id]);
                      } else {
                        setSelectedOptions((prev) => 
                          prev.includes(option.id) ? prev.filter((id) => id !== option.id) : [...prev, option.id]
                        );
                      }
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-[14px] border px-4 py-2.5 text-sm text-left transition-colors",
                      isCorrect
                        ? "border-[#bef2d0] bg-[#eafaf1] text-[#059669]"
                        : isSelected
                          ? "border-[#2f6fff] bg-[#f0f6ff] text-[#1e40af] shadow-[inset_0_0_0_1px_#2f6fff]"
                          : interactive 
                            ? "border-[#e8eef8] bg-white text-slate-700 hover:border-[#2f6fff] hover:bg-[#f0f6ff]"
                            : "border-[#e8eef8] bg-white text-slate-700 cursor-default"
                    )}
                  >
                    {isCorrect ? (
                      <Check className="h-3.5 w-3.5 shrink-0" />
                    ) : isSelected ? (
                      <div className="h-3.5 w-3.5 shrink-0 rounded-full border-4 border-[#2f6fff] bg-white" />
                    ) : interactive ? (
                      <div className="h-3.5 w-3.5 shrink-0 rounded-full border border-slate-300 bg-white" />
                    ) : null}
                    <span>{option.text || "Untitled option"}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Fill-in-the-blank / Short Answer / Essay */}
          {!showAnswers && (block.quizType === "short-answer" || block.quizType === "fill-in-the-blank" || block.quizType === "essay") && (
            <div className="mt-3">
              {block.quizType === "essay" ? (
                <textarea 
                  placeholder="Type your answer here..."
                  className="w-full rounded-[14px] border border-[#e5ecf8] bg-[#f8fbff] px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#2f6fff] focus:outline-none focus:ring-1 focus:ring-[#2f6fff] transition-colors"
                  rows={4}
                />
              ) : (
                <input 
                  type="text"
                  placeholder="Type your answer here..."
                  className="w-full rounded-[14px] border border-[#e5ecf8] bg-[#f8fbff] px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#2f6fff] focus:outline-none focus:ring-1 focus:ring-[#2f6fff] transition-colors"
                />
              )}
            </div>
          )}

          {/* Matching */}
          {!showAnswers && block.quizType === "matching" && (
            <div className="mt-3 space-y-2">
              {block.matchingPairs.map((pair) => {
                 // Sort the matches alphabetically so they aren't obviously in the correct order
                 const matchOptions = [...block.matchingPairs].map(p => p.match).sort((a, b) => a.localeCompare(b));
                 
                 return (
                   <div key={pair.id} className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-[14px] border border-[#e8eef8] bg-white px-4 py-2.5 text-sm">
                     <span className="flex-1 font-medium text-slate-700">{pair.prompt}</span>
                     <select className="w-full sm:w-1/2 rounded-[10px] border border-[#dce6ff] bg-[#f8fbff] px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:border-[#2f6fff] focus:ring-1 focus:ring-[#2f6fff] transition-colors">
                       <option value="">Select match...</option>
                       {matchOptions.map((matchOpt, i) => (
                         <option key={i} value={matchOpt}>{matchOpt}</option>
                       ))}
                     </select>
                   </div>
                 );
              })}
            </div>
          )}


          {/* Explanation */}
          {showAnswers && block.explanation.trim() ? (
            <div className="mt-4 rounded-[14px] border border-[#dce7ff] bg-[#f0f6ff] px-4 py-3 text-sm text-[#1e40af]">
              {block.explanation}
            </div>
          ) : null}

          {/* Acceptable answers */}
          {hasAcceptedAnswers && (
            <div className="mt-3 space-y-2">
              {block.acceptableAnswers
                .filter((a) => a.trim().length > 0)
                .map((a, i) => (
                  <div
                    key={i}
                    className="rounded-[14px] border border-[#bef2d0] bg-[#eafaf1] px-4 py-2.5 text-sm text-[#059669]"
                  >
                    {a}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PageContent({
  page,
  index,
  total,
  showAnswers,
}: {
  page: ModuleEditorPage;
  index: number;
  total: number;
  showAnswers: boolean;
}) {
  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-start justify-between gap-3 rounded-[24px] border border-[#e5ecf8] bg-white p-6 shadow-[0_20px_48px_-40px_rgba(15,23,42,0.35)]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Page {index + 1} of {total}
          </p>
          <h2 className="mt-2 text-[1.6rem] font-bold tracking-tight text-slate-950">
            {page.title}
          </h2>
          {page.description.trim() ? (
            <p className="mt-1 text-sm leading-relaxed text-slate-500">{page.description}</p>
          ) : null}
        </div>
        <FileText className="mt-1 h-5 w-5 shrink-0 text-slate-300" />
      </div>

      {/* Blocks */}
      {page.blocks.map((block) => {
        if (block.type === "text") {
          return (
          return (() => {
            const lower = block.title.toLowerCase();
            let theme = {
              bg: "bg-white",
              border: "border-[#e5ecf8]",
              iconBg: "bg-[#eef4ff]",
              iconColor: "text-[#2f6fff]",
              Icon: BookOpen,
              titleColor: "text-slate-950",
            };
            if (lower.includes("key idea")) {
              theme = { bg: "bg-[#f8fbff]", border: "border-[#dce7ff]", iconBg: "bg-[#2f6fff]", iconColor: "text-white", Icon: Lightbulb, titleColor: "text-slate-950" };
            } else if (lower.includes("hooke") || lower.includes("living organisms") || lower.includes("magnification")) {
              theme = { bg: "bg-[#f0fdf4]", border: "border-[#dcfce7]", iconBg: "bg-[#16a34a]", iconColor: "text-white", Icon: lower.includes("hooke") ? User : lower.includes("magnification") ? Calculator : BookOpen, titleColor: "text-[#166534]" };
            } else if (lower.includes("observation")) {
              theme = { bg: "bg-[#f8fbff]", border: "border-[#dce7ff]", iconBg: "bg-[#2f6fff]", iconColor: "text-white", Icon: Search, titleColor: "text-[#1e3a8a]" };
            }

            const { Icon } = theme;

            return (
              <div
                key={block.id}
                className={cn(
                  "rounded-[24px] border p-6 shadow-[0_16px_40px_-36px_rgba(15,23,42,0.3)]",
                  theme.bg,
                  theme.border
                )}
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", theme.iconBg, theme.iconColor)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  {block.title.trim() ? (
                    <h3 className={cn("text-[1.1rem] font-bold", theme.titleColor)}>{block.title}</h3>
                  ) : (
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Content
                    </span>
                  )}
                </div>
                <div className="space-y-3 pt-1">
                  {renderMarkdown(block.body)}
                </div>
              </div>
            );
          })();
        }

        if (block.type === "image") {
          return (
            <div
              key={block.id}
              className="rounded-[24px] border border-[#e5ecf8] bg-white p-6 shadow-[0_16px_40px_-36px_rgba(15,23,42,0.3)]"
            >
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f5efff] text-[#8b5cf6]">
                  <ImageIcon className="h-4 w-4" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Image
                </span>
              </div>
              {block.imageUrl.trim() ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={block.imageUrl}
                  alt={block.altText || block.caption || "Module illustration"}
                  className="max-h-[32rem] w-full rounded-[18px] object-cover"
                />
              ) : (
                <div className="flex h-48 items-center justify-center rounded-[18px] border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400">
                  No image added yet.
                </div>
              )}
              {block.caption.trim() ? (
                <p className="mt-3 text-sm leading-relaxed text-slate-500">{block.caption}</p>
              ) : null}
            </div>
          );
        }

        // Quiz block
        return <QuestionBlock key={block.id} block={block} showAnswers={showAnswers} />;
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

export interface ModuleDocumentViewMeta {
  lessonCode?: string;
  chapterTitle?: string;
  unitTitle?: string;
  weekRange?: string;
  backHref?: string;
  nextHref?: string;
  nextLessonCode?: string;
  editHref?: string;
  role?: string;
}

export function ModuleDocumentView({
  document,
  showAnswers = false,
  meta,
}: {
  document: ModuleEditorDocument;
  showAnswers?: boolean;
  meta?: ModuleDocumentViewMeta;
}) {
  const [currentPage, setCurrentPage] = useState(0);
  // When showAnswers is false (student role) the mode is permanently locked to "student"
  const [viewMode, setViewMode] = useState<"teacher" | "student">(
    showAnswers ? "teacher" : "student"
  );
  const [note, setNote] = useState("");

  const pages = document.pages;
  const page = pages[currentPage] ?? pages[0];
  const pageIndex = Math.min(currentPage, pages.length - 1);
  const progressPct = Math.round(((pageIndex + 1) / pages.length) * 100);
  // Students never see answers regardless of viewMode
  const effectiveShowAnswers = showAnswers && viewMode === "teacher";

  return (
    <div className="flex flex-col gap-0">
      {/* ── Status bar ─────────────────────────────────────────────────────── */}
      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-[18px] border border-[#e5ecf8] bg-white px-5 py-3 shadow-[0_12px_32px_-28px_rgba(15,23,42,0.28)]">
        <span className="inline-flex rounded-full bg-[#ff7a1a] px-3 py-1 text-xs font-semibold text-white shadow-[0_8px_16px_-10px_rgba(249,115,22,0.7)]">
          Saved Module
        </span>
        <span className="inline-flex rounded-full border border-[#dce6ff] bg-[#f0f6ff] px-3 py-1 text-xs font-semibold text-[#2f6fff]">
          {pages.length} {pages.length === 1 ? "page" : "pages"}
        </span>
        {/* View mode toggle — only shown for admin/teacher/curriculum, never for students */}
        {showAnswers && (
          <button
            type="button"
            onClick={() => setViewMode((v) => (v === "teacher" ? "student" : "teacher"))}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#dce6ff] bg-[#f0f6ff] px-3 py-1 text-xs font-semibold text-[#2f6fff] hover:bg-[#e4eeff] transition-colors"
          >
            <GraduationCap className="h-3.5 w-3.5" />
            {viewMode === "teacher" ? "Teacher View" : "Student View"}
          </button>
        )}
        <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-400">
          <Info className="h-3.5 w-3.5" />
          {effectiveShowAnswers
            ? "Answer keys and explanations are visible in this view."
            : showAnswers
              ? "Switch to Teacher View to see answer keys."
              : "Complete questions and submit for scoring."}
        </div>
      </div>

      {/* ── Three-panel layout ─────────────────────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)_240px]">
        {/* ── Left sidebar: Lesson Outline ─────────────────────────────────── */}
        <aside className="hidden lg:block">
          <div className="sticky top-[5.5rem] rounded-[24px] border border-[#e5ecf8] bg-white p-5 shadow-[0_20px_48px_-42px_rgba(15,23,42,0.35)]">
            <p className="text-[0.9rem] font-semibold text-slate-900">Lesson Outline</p>
            <p className="mt-0.5 text-xs text-slate-400">
              {pages.length} {pages.length === 1 ? "page" : "pages"} / {totalBlocks(document)} blocks
            </p>

            {/* Progress bar */}
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#e8eef8]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#2f6fff,#1d4ed8)] transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Page list */}
            <nav className="mt-4 space-y-1">
              {pages.map((p, i) => {
                const isActive = i === pageIndex;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setCurrentPage(i)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-left transition-colors",
                      isActive
                        ? "bg-[#eef4ff] text-[#2f6fff]"
                        : "text-slate-600 hover:bg-[#f7faff]"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        isActive
                          ? "bg-[#2f6fff] text-white"
                          : "bg-[#e8eef8] text-slate-500"
                      )}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={cn("truncate text-xs font-semibold", isActive ? "text-[#2f6fff]" : "text-slate-800")}>
                        {p.title}
                      </p>
                      <p className="text-[10px] text-slate-400">{blockCount(p)} block{blockCount(p) === 1 ? "" : "s"}</p>
                    </div>
                    <FileText className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                  </button>
                );
              })}
            </nav>

            <button
              type="button"
              onClick={() => setCurrentPage(0)}
              className="mt-3 flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              <LayoutList className="h-3.5 w-3.5" />
              View all pages
            </button>
          </div>
        </aside>

        {/* ── Center: Page content ─────────────────────────────────────────── */}
        <div className="min-w-0">
          {page ? (
            <PageContent
              page={page}
              index={pageIndex}
              total={pages.length}
              showAnswers={effectiveShowAnswers}
            />
          ) : (
            <div className="rounded-[24px] border border-dashed border-[#d9e4f7] bg-[#f8fbff] p-10 text-center text-sm text-slate-500">
              No pages yet.
            </div>
          )}

          {/* Page navigation */}
          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={pageIndex === 0}
              className="flex items-center gap-2 rounded-full border border-[#d9e1ef] bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-none transition-colors hover:border-[#c6d4f3] hover:bg-[#f7faff] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous Page
            </button>
            <span className="text-xs text-slate-400">
              {pageIndex + 1} / {pages.length}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(pages.length - 1, p + 1))}
              disabled={pageIndex === pages.length - 1}
              className="flex items-center gap-2 rounded-full border border-[#d9e1ef] bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-none transition-colors hover:border-[#c6d4f3] hover:bg-[#f7faff] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next Page
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Right sidebar: Quick Panel ───────────────────────────────────── */}
        <aside className="hidden lg:block">
          <div className="sticky top-[5.5rem] space-y-4">
            {/* Page Progress */}
            <div className="rounded-[24px] border border-[#e5ecf8] bg-white p-5 shadow-[0_20px_48px_-42px_rgba(15,23,42,0.35)]">
              <p className="text-sm font-semibold text-slate-900">Quick Panel</p>

              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Page Progress</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Page {pageIndex + 1} of {pages.length}
                  </p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#e8eef8]">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#2f6fff,#1d4ed8)] transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-slate-400">{progressPct}% complete</p>
                </div>

                {/* View Mode toggle — hidden for students */}
                {showAnswers && (
                <div className="border-t border-[#f0f4fb] pt-3">
                  <p className="text-xs font-semibold text-slate-500">View Mode</p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setViewMode("teacher")}
                      className={cn(
                        "flex items-center justify-center gap-1.5 rounded-[12px] border px-3 py-2 text-xs font-semibold transition-colors",
                        viewMode === "teacher"
                          ? "border-[#2f6fff] bg-[#eef4ff] text-[#2f6fff]"
                          : "border-[#e5ecf8] bg-white text-slate-500 hover:bg-[#f7faff]"
                      )}
                    >
                      <GraduationCap className="h-3.5 w-3.5" />
                      Teacher
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("student")}
                      className={cn(
                        "flex items-center justify-center gap-1.5 rounded-[12px] border px-3 py-2 text-xs font-semibold transition-colors",
                        viewMode === "student"
                          ? "border-[#2f6fff] bg-[#eef4ff] text-[#2f6fff]"
                          : "border-[#e5ecf8] bg-white text-slate-500 hover:bg-[#f7faff]"
                      )}
                    >
                      <CircleHelp className="h-3.5 w-3.5" />
                      Student
                    </button>
                  </div>
                </div>
                )} {/* end showAnswers view mode */}
              </div>
            </div>

            {/* Quick Notes */}
            <div className="rounded-[24px] border border-[#e5ecf8] bg-white p-5 shadow-[0_20px_48px_-42px_rgba(15,23,42,0.35)]">
              <div className="flex items-center gap-2">
                <StickyNote className="h-4 w-4 text-slate-400" />
                <p className="text-sm font-semibold text-slate-900">Quick Notes</p>
              </div>
              <p className="mt-1.5 text-xs leading-5 text-slate-400">
                Add notes about this lesson for yourself or other teachers.
              </p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Type a note…"
                rows={3}
                className="mt-3 w-full resize-none rounded-[14px] border border-[#dce6ff] bg-[#f8fbff] px-3 py-2.5 text-xs text-slate-700 placeholder:text-slate-300 focus:border-[#2f6fff] focus:outline-none focus:ring-1 focus:ring-[#bcd2ff]"
              />
              <button
                type="button"
                className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-full border border-[#dce6ff] bg-white py-2 text-xs font-semibold text-[#2f6fff] hover:bg-[#f0f6ff] transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Note
              </button>
            </div>

            {/* Lesson Summary */}
            {meta && (
              <div className="rounded-[24px] border border-[#e5ecf8] bg-white p-5 shadow-[0_20px_48px_-42px_rgba(15,23,42,0.35)]">
                <p className="text-sm font-semibold text-slate-900">Lesson Summary</p>
                <div className="mt-3 space-y-3">
                  {meta.lessonCode && (
                    <div className="flex items-start gap-3">
                      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                          Lesson Code
                        </p>
                        <p className="text-xs font-semibold text-slate-800">{meta.lessonCode}</p>
                      </div>
                    </div>
                  )}
                  {meta.chapterTitle && (
                    <div className="flex items-start gap-3">
                      <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                          Chapter
                        </p>
                        <p className="text-xs font-semibold text-slate-800">{meta.chapterTitle}</p>
                      </div>
                    </div>
                  )}
                  {meta.unitTitle && (
                    <div className="flex items-start gap-3">
                      <LayoutList className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                          Unit
                        </p>
                        <p className="text-xs font-semibold text-slate-800">{meta.unitTitle}</p>
                      </div>
                    </div>
                  )}
                  {meta.weekRange && (
                    <div className="flex items-start gap-3">
                      <PencilLine className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                          Week Range
                        </p>
                        <p className="text-xs font-semibold text-slate-800">{meta.weekRange}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <CircleHelp className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Total Blocks
                      </p>
                      <p className="text-xs font-semibold text-slate-800">
                        {totalBlocks(document)} blocks
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Mobile page switcher (shown only on small screens) */}
      <div className="mt-5 lg:hidden">
        <div className="flex flex-wrap gap-2">
          {pages.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setCurrentPage(i)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                i === pageIndex
                  ? "border-[#2f6fff] bg-[#2f6fff] text-white"
                  : "border-[#d9e1ef] bg-white text-slate-600 hover:bg-[#f7faff]"
              )}
            >
              {i + 1}. {p.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
