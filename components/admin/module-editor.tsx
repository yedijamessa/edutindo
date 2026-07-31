"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowUp,
  ArrowDown,
  Bold,
  BookCopy,
  Cloud,
  Eye,
  FileText,
  Image as ImageIcon,
  Italic,
  Layers3,
  Link2,
  List,
  ListOrdered,
  MoreVertical,
  NotebookPen,
  PencilLine,
  Plus,
  Quote,
  LoaderCircle,
  Save,
  Sparkles,
  Trash2,
  CircleHelp,
  Underline,
  type LucideIcon,
} from "lucide-react";
import {
  recommendQuizForModule,
  recommendQuizForPage,
  recommendSectionExpansion,
  type ModuleEditorQuizRecommendation,
  type ModuleEditorSectionRecommendation,
} from "@/lib/ai-services";
import { ModuleDocumentView } from "@/components/lms/module-document-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type {
  ModuleEditorDocument,
  ModuleEditorBlock,
  ModuleEditorPage,
  ModuleEditorQuizBlock,
  ModuleEditorQuizMatchPair,
  ModuleEditorQuizOrderingItem,
  ModuleEditorQuizType,
} from "@/types/module-editor";

interface ModuleEditorProps {
  initialModuleId: string | null;
  initialDocument: ModuleEditorDocument | null;
  subjectSlug: string | null;
  subjectTitle: string;
  chapterSlug: string | null;
  chapterTitle: string;
}

const QUIZ_TYPE_OPTIONS: Array<{ value: ModuleEditorQuizType; label: string }> = [
  { value: "multiple-choice-single", label: "Multiple Choice (select one)" },
  { value: "multiple-choice-multiple", label: "Multiple Choice (select several)" },
  { value: "true-false", label: "True or False" },
  { value: "short-answer", label: "Short Answer" },
  { value: "fill-in-the-blank", label: "Fill in the Blank" },
  { value: "matching", label: "Matching" },
  { value: "ordering", label: "Ordering / Sequence" },
  { value: "essay", label: "Essay / Long response" },
];

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2, 10);
}

function createTextBlock(): ModuleEditorBlock {
  return {
    id: createId(),
    type: "text",
    title: "",
    body: "",
  };
}

function createImageBlock(): ModuleEditorBlock {
  return {
    id: createId(),
    type: "image",
    imageUrl: "",
    altText: "",
    caption: "",
  };
}

function createQuizBlock(): ModuleEditorQuizBlock {
  return createQuizBlockForType("multiple-choice-single");
}

function createQuizOptions() {
  return Array.from({ length: 4 }, (_, index) => ({
    id: createId(),
    text: `Option ${index + 1}`,
  }));
}

function createMatchingPairs(): ModuleEditorQuizMatchPair[] {
  return [
    { id: createId(), prompt: "Prompt 1", match: "Match 1" },
    { id: createId(), prompt: "Prompt 2", match: "Match 2" },
    { id: createId(), prompt: "Prompt 3", match: "Match 3" },
  ];
}

function createOrderingItems(): ModuleEditorQuizOrderingItem[] {
  return [
    { id: createId(), text: "Step 1" },
    { id: createId(), text: "Step 2" },
    { id: createId(), text: "Step 3" },
    { id: createId(), text: "Step 4" },
  ];
}

function getDefaultOptionsForQuizType(quizType: ModuleEditorQuizType) {
  if (quizType === "true-false") {
    return [
      { id: createId(), text: "True" },
      { id: createId(), text: "False" },
    ];
  }

  if (
    quizType === "short-answer" ||
    quizType === "fill-in-the-blank" ||
    quizType === "matching" ||
    quizType === "ordering" ||
    quizType === "essay"
  ) {
    return [];
  }

  return createQuizOptions();
}

function getDefaultAcceptableAnswersForQuizType(quizType: ModuleEditorQuizType) {
  if (quizType === "fill-in-the-blank") {
    return [""];
  }

  if (quizType === "short-answer") {
    return [""];
  }

  return [];
}

function createQuizBlockForType(quizType: ModuleEditorQuizType): ModuleEditorQuizBlock {
  const options = getDefaultOptionsForQuizType(quizType);

  return {
    id: createId(),
    type: "quiz",
    quizType,
    prompt: "",
    options,
    correctOptionIds: options[0]?.id ? [options[0].id] : [],
    acceptableAnswers: getDefaultAcceptableAnswersForQuizType(quizType),
    matchingPairs: quizType === "matching" ? createMatchingPairs() : [],
    orderingItems: quizType === "ordering" ? createOrderingItems() : [],
    explanation: "",
  };
}

function usesOptionAnswers(quizType: ModuleEditorQuizType) {
  return (
    quizType === "multiple-choice-single" ||
    quizType === "multiple-choice-multiple" ||
    quizType === "true-false"
  );
}

function usesMultipleCorrectAnswers(quizType: ModuleEditorQuizType) {
  return quizType === "multiple-choice-multiple";
}

function usesAcceptableAnswerInputs(quizType: ModuleEditorQuizType) {
  return quizType === "short-answer" || quizType === "fill-in-the-blank";
}

function usesMatchingPairs(quizType: ModuleEditorQuizType) {
  return quizType === "matching";
}

function usesOrderingItems(quizType: ModuleEditorQuizType) {
  return quizType === "ordering";
}

function isEssayQuiz(quizType: ModuleEditorQuizType) {
  return quizType === "essay";
}

function createQuizBlockFromRecommendation(
  recommendation: ModuleEditorQuizRecommendation
): ModuleEditorQuizBlock {
  const optionEntries = (
    recommendation.options.length > 0
      ? recommendation.options
      : getDefaultOptionsForQuizType(recommendation.quizType).map((option) => option.text)
  ).map((text) => ({
    id: createId(),
    text,
  }));
  const recommendedCorrectOptionIds = recommendation.correctOptionIndexes
    .map((index) => optionEntries[index]?.id)
    .filter((value): value is string => Boolean(value));

  return {
    id: createId(),
    type: "quiz",
    quizType: recommendation.quizType,
    prompt: recommendation.prompt,
    options: optionEntries,
    correctOptionIds: usesOptionAnswers(recommendation.quizType)
      ? recommendedCorrectOptionIds.length > 0
        ? recommendedCorrectOptionIds
        : optionEntries[0]?.id
          ? [optionEntries[0].id]
          : []
      : [],
    acceptableAnswers:
      recommendation.acceptableAnswers ?? getDefaultAcceptableAnswersForQuizType(recommendation.quizType),
    matchingPairs:
      recommendation.matchingPairs?.map((pair) => ({
        id: createId(),
        prompt: pair.prompt,
        match: pair.match,
      })) ?? (recommendation.quizType === "matching" ? createMatchingPairs() : []),
    orderingItems:
      recommendation.orderingItems?.map((text) => ({
        id: createId(),
        text,
      })) ?? (recommendation.quizType === "ordering" ? createOrderingItems() : []),
    explanation: recommendation.explanation,
  };
}

function createSectionSuggestionBlock(
  recommendation: ModuleEditorSectionRecommendation
): ModuleEditorBlock {
  return {
    id: createId(),
    type: "text",
    title: recommendation.title,
    body: recommendation.body,
  };
}

function createPage(index: number): ModuleEditorPage {
  return {
    id: createId(),
    title: `Page ${index}`,
    description: "",
    blocks: [createTextBlock()],
  };
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= items.length) return items;

  const next = [...items];
  const [item] = next.splice(index, 1);
  next.splice(targetIndex, 0, item);
  return next;
}

function formatTimestamp(value: string | null) {
  if (!value) return "Not saved yet";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Saved";

  return parsed.toLocaleString();
}

function createInitialPages() {
  return [createPage(1)];
}

function countWords(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function getPageWordCount(page: ModuleEditorPage | null) {
  if (!page) return 0;

  return page.blocks.reduce((total, block) => {
    if (block.type === "text") {
      return total + countWords(block.title) + countWords(block.body);
    }

    if (block.type === "image") {
      return total + countWords(block.caption) + countWords(block.altText);
    }

    const optionWords = block.options.reduce((sum, option) => sum + countWords(option.text), 0);
    const answerWords = block.acceptableAnswers.reduce((sum, answer) => sum + countWords(answer), 0);
    const matchingWords = block.matchingPairs.reduce(
      (sum, pair) => sum + countWords(pair.prompt) + countWords(pair.match),
      0
    );
    const orderingWords = block.orderingItems.reduce((sum, item) => sum + countWords(item.text), 0);

    return (
      total +
      countWords(block.prompt) +
      countWords(block.explanation) +
      optionWords +
      answerWords +
      matchingWords +
      orderingWords
    );
  }, 0);
}

type TextFormattingAction =
  | "bold"
  | "italic"
  | "underline"
  | "link"
  | "bullet-list"
  | "numbered-list"
  | "quote";

type AiAssistAction = "page-quiz" | "module-quiz" | "section";

function wrapSelection(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  prefix: string,
  suffix: string,
  fallback: string
) {
  const selectedText = value.slice(selectionStart, selectionEnd);
  const content = selectedText || fallback;
  const replacement = `${prefix}${content}${suffix}`;
  const nextValue = `${value.slice(0, selectionStart)}${replacement}${value.slice(selectionEnd)}`;
  const contentStart = selectionStart + prefix.length;
  const contentEnd = contentStart + content.length;

  return {
    nextValue,
    selectionStart: contentStart,
    selectionEnd: contentEnd,
  };
}

function prefixSelectedLines(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  formatter: (line: string, index: number) => string,
  fallback: string
) {
  const blockStart = value.lastIndexOf("\n", Math.max(0, selectionStart - 1)) + 1;
  const blockEndCandidate = value.indexOf("\n", selectionEnd);
  const blockEnd = blockEndCandidate === -1 ? value.length : blockEndCandidate;
  const selectedBlock = value.slice(blockStart, blockEnd);
  const lines = (selectedBlock || fallback).split("\n");
  const replacement = lines.map((line, index) => formatter(line, index)).join("\n");
  const nextValue = `${value.slice(0, blockStart)}${replacement}${value.slice(blockEnd)}`;

  return {
    nextValue,
    selectionStart: blockStart,
    selectionEnd: blockStart + replacement.length,
  };
}

function getEstimatedReadTime(page: ModuleEditorPage | null) {
  const words = getPageWordCount(page);
  const minutes = Math.max(1, Math.ceil(words / 180));
  return `~ ${minutes} min`;
}

function MetaItem({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex min-w-[12rem] items-start gap-3 px-1 py-1.5">
      <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl border border-[#e5ebf6] bg-[#f8fbff] text-[#7d8fb3]">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <p className="truncate text-sm font-semibold text-slate-900">{value}</p>
        {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
      </div>
    </div>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#eef3fb] px-4 py-3 last:border-b-0">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Icon className="h-4 w-4 text-slate-400" />
        <span>{label}</span>
      </div>
      <span className="rounded-full bg-[#f3f7ff] px-2.5 py-1 text-xs font-semibold text-[#3467f6]">{value}</span>
    </div>
  );
}

export function ModuleEditor({
  initialModuleId,
  initialDocument,
  subjectSlug,
  subjectTitle,
  chapterSlug,
  chapterTitle,
}: ModuleEditorProps) {
  const router = useRouter();
  const [moduleId, setModuleId] = useState(initialModuleId);
  const [title, setTitle] = useState(initialDocument?.title ?? "");
  const [moduleCode, setModuleCode] = useState(initialDocument?.moduleCode ?? "");
  const [uniqueIdentifier, setUniqueIdentifier] = useState(initialDocument?.uniqueIdentifier ?? "");
  const [pages, setPages] = useState<ModuleEditorPage[]>(() => initialDocument?.pages ?? createInitialPages());
  const [selectedPageId, setSelectedPageId] = useState(initialDocument?.pages[0]?.id ?? "");
  const [updatedAt, setUpdatedAt] = useState<string | null>(initialDocument?.updatedAt ?? null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [aiPendingAction, setAiPendingAction] = useState<AiAssistAction | null>(null);
  const [aiInsight, setAiInsight] = useState("");
  const textAreaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  useEffect(() => {
    setModuleId(initialModuleId);
    setTitle(initialDocument?.title ?? "");
    setModuleCode(initialDocument?.moduleCode ?? "");
    setUniqueIdentifier(initialDocument?.uniqueIdentifier ?? "");
    const nextPages = initialDocument?.pages ?? createInitialPages();
    setPages(nextPages);
    setSelectedPageId(nextPages[0]?.id ?? "");
    setUpdatedAt(initialDocument?.updatedAt ?? null);
    setSaving(false);
    setDirty(false);
    setMessage("");
    setError("");
    setAiPendingAction(null);
    setAiInsight("");
  }, [chapterSlug, initialDocument, initialModuleId, subjectSlug]);

  useEffect(() => {
    if (pages.some((page) => page.id === selectedPageId)) return;
    setSelectedPageId(pages[0]?.id ?? "");
  }, [pages, selectedPageId]);

  const selectedPage = useMemo(
    () => pages.find((page) => page.id === selectedPageId) ?? pages[0] ?? null,
    [pages, selectedPageId]
  );

  const updatePages = (updater: (current: ModuleEditorPage[]) => ModuleEditorPage[]) => {
    setPages((current) => updater(current));
    setDirty(true);
    setMessage("");
    setError("");
  };

  const updateSelectedPage = (updater: (page: ModuleEditorPage) => ModuleEditorPage) => {
    if (!selectedPage) return;

    updatePages((current) =>
      current.map((page) => (page.id === selectedPage.id ? updater(page) : page))
    );
  };

  const updateBlock = (blockId: string, updater: (block: ModuleEditorBlock) => ModuleEditorBlock) => {
    updateSelectedPage((page) => ({
      ...page,
      blocks: page.blocks.map((block) => (block.id === blockId ? updater(block) : block)),
    }));
  };

  const appendBlockToPage = (pageId: string, block: ModuleEditorBlock) => {
    updatePages((current) =>
      current.map((page) => (page.id === pageId ? { ...page, blocks: [...page.blocks, block] } : page))
    );
    setSelectedPageId(pageId);
    window.requestAnimationFrame(() => {
      if (block.type === "text") {
        textAreaRefs.current[block.id]?.focus();
      }
    });
  };

  const addBlockToSelectedPage = (factory: () => ModuleEditorBlock) => {
    if (!selectedPage) return;

    const nextBlock = factory();
    appendBlockToPage(selectedPage.id, nextBlock);
  };

  const applyTextFormatting = (blockId: string, action: TextFormattingAction) => {
    const textarea = textAreaRefs.current[blockId];
    if (!textarea) return;

    const value = textarea.value;
    const selectionStart = textarea.selectionStart ?? value.length;
    const selectionEnd = textarea.selectionEnd ?? value.length;

    let result: { nextValue: string; selectionStart: number; selectionEnd: number } | null = null;

    if (action === "bold") {
      result = wrapSelection(value, selectionStart, selectionEnd, "**", "**", "bold text");
    }

    if (action === "italic") {
      result = wrapSelection(value, selectionStart, selectionEnd, "*", "*", "italic text");
    }

    if (action === "underline") {
      result = wrapSelection(value, selectionStart, selectionEnd, "<u>", "</u>", "underlined text");
    }

    if (action === "link") {
      const nextUrl = window.prompt("Enter the link URL", "https://");
      if (nextUrl === null) return;

      const trimmedUrl = nextUrl.trim();
      if (!trimmedUrl) return;

      const selectedText = value.slice(selectionStart, selectionEnd);
      const linkLabel = selectedText || window.prompt("Enter the link text", "Link text") || "Link text";
      const replacement = `[${linkLabel}](${trimmedUrl})`;
      result = {
        nextValue: `${value.slice(0, selectionStart)}${replacement}${value.slice(selectionEnd)}`,
        selectionStart: selectionStart + 1,
        selectionEnd: selectionStart + 1 + linkLabel.length,
      };
    }

    if (action === "bullet-list") {
      result = prefixSelectedLines(value, selectionStart, selectionEnd, (line) => {
        const cleaned = line.trim();
        return cleaned.startsWith("- ") ? cleaned : `- ${cleaned || "List item"}`;
      }, "List item");
    }

    if (action === "numbered-list") {
      result = prefixSelectedLines(
        value,
        selectionStart,
        selectionEnd,
        (line, index) => `${index + 1}. ${line.trim() || `Item ${index + 1}`}`,
        "List item"
      );
    }

    if (action === "quote") {
      result = prefixSelectedLines(value, selectionStart, selectionEnd, (line) => {
        const cleaned = line.trim();
        return cleaned.startsWith("> ") ? cleaned : `> ${cleaned || "Quoted note"}`;
      }, "Quoted note");
    }

    if (!result) return;

    updateBlock(blockId, (current) => ({
      ...current,
      type: "text",
      title: current.type === "text" ? current.title : "",
      body: result.nextValue,
    }));

    window.requestAnimationFrame(() => {
      const nextTextarea = textAreaRefs.current[blockId];
      if (!nextTextarea) return;
      nextTextarea.focus();
      nextTextarea.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  };

  const saveDocument = async () => {
    if (!subjectSlug || !chapterSlug) {
      setError("Choose subject and chapter first.");
      setMessage("");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const endpoint = moduleId ? `/api/admin/module-editor/${moduleId}` : "/api/admin/module-editor";
      const response = await fetch(endpoint, {
        method: moduleId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          moduleCode,
          uniqueIdentifier,
          pages,
          subjectSlug,
          subjectTitle,
          chapterSlug,
          chapterTitle,
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.error || "Failed to save module.");
        return;
      }

      setModuleId(data.document.id);
      setTitle(data.document.title);
      setModuleCode(data.document.moduleCode ?? "");
      setUniqueIdentifier(data.document.uniqueIdentifier ?? "");
      setPages(data.document.pages);
      setUpdatedAt(data.document.updatedAt);
      setDirty(false);
      setMessage("Module saved in the materials catalog.");
      router.replace(
        `/admin/module-editor?subjectSlug=${encodeURIComponent(subjectSlug)}&chapterSlug=${encodeURIComponent(chapterSlug)}&moduleId=${encodeURIComponent(data.document.id)}`
      );
      router.refresh();
    } catch (saveError) {
      console.error(saveError);
      setError("Failed to save module.");
    } finally {
      setSaving(false);
    }
  };

  const runAiAssist = async (action: AiAssistAction) => {
    if (!selectedPage) return;

    const pageId = selectedPage.id;
    const pageLabel = selectedPage.title.trim() || `Page ${pageIndex + 1}`;
    const moduleTitleForAi = title.trim() || chapterTitle || subjectTitle || "Untitled module";

    setAiPendingAction(action);
    setAiInsight("");
    setMessage("");
    setError("");

    try {
      if (action === "page-quiz") {
        const recommendation = await recommendQuizForPage({
          page: selectedPage,
          pages,
          moduleTitle: moduleTitleForAi,
          subjectTitle,
          chapterTitle,
        });

        appendBlockToPage(pageId, createQuizBlockFromRecommendation(recommendation));
        setMessage(`AI added a quiz suggestion for ${pageLabel}.`);
        setAiInsight(`Focused on this page: ${recommendation.focusTopic}`);
        return;
      }

      if (action === "module-quiz") {
        const recommendation = await recommendQuizForModule({
          page: selectedPage,
          pages,
          moduleTitle: moduleTitleForAi,
          subjectTitle,
          chapterTitle,
        });

        appendBlockToPage(pageId, createQuizBlockFromRecommendation(recommendation));
        setMessage(`AI added a module-level quiz suggestion using "${moduleTitleForAi}".`);
        setAiInsight(`Focused on module title: ${recommendation.focusTopic}`);
        return;
      }

      const recommendation = await recommendSectionExpansion({
        page: selectedPage,
        pages,
        moduleTitle: moduleTitleForAi,
        subjectTitle,
        chapterTitle,
      });

      appendBlockToPage(pageId, createSectionSuggestionBlock(recommendation));
      setMessage(`AI added a suggested section for ${pageLabel}.`);
      setAiInsight(`Suggested expansion: ${recommendation.focusTopic}`);
    } catch (aiError) {
      console.error(aiError);
      setError("AI recommendation failed. Please try again.");
    } finally {
      setAiPendingAction(null);
    }
  };

  const pageIndex = selectedPage ? pages.findIndex((page) => page.id === selectedPage.id) : -1;
  const currentYear = new Date().getFullYear();
  const shellCardClassName =
    "border-[#e8eef8] bg-white/90 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.25)] backdrop-blur";
  const aiAssistButtonClassName =
    "h-auto w-full items-start justify-start rounded-[22px] border-[#d7e4ff] bg-white px-4 py-3 text-left text-slate-700 shadow-none hover:bg-[#f7faff] [&_svg]:shrink-0";
  const aiAssistLabelClassName = "flex min-w-0 flex-1 flex-col items-start whitespace-normal break-words";

  return (
    <div className="space-y-6">
      <div className="rounded-[36px] border border-white/80 bg-[radial-gradient(circle_at_top,#fff7ea_0%,#f8fbff_22%,#f3f7ff_100%)] p-4 shadow-[0_40px_120px_-72px_rgba(15,23,42,0.35)] lg:p-6">
        <section className="rounded-[30px] border border-[#edf2fb] bg-white/85 px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] lg:px-7">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#dbe6ff] bg-[#f4f8ff] text-[#3568f5] shadow-[0_18px_36px_-30px_rgba(53,104,245,0.7)]">
                <PencilLine className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="rounded-full bg-[#fff0e4] px-3 py-1 text-[#f27b2f] shadow-none hover:bg-[#fff0e4]">
                    Module Editor
                  </Badge>
                  <Badge variant="outline" className="rounded-full border-[#d9e4fb] bg-white px-3 py-1 text-[#5f7297]">
                    Reusable Content
                  </Badge>
                  {subjectTitle ? (
                    <Badge variant="outline" className="rounded-full border-[#d9e4fb] bg-white px-3 py-1 text-[#5f7297]">
                      {subjectTitle}
                    </Badge>
                  ) : null}
                  {chapterTitle ? (
                    <Badge variant="outline" className="rounded-full border-[#d9e4fb] bg-white px-3 py-1 text-[#5f7297]">
                      {chapterTitle}
                    </Badge>
                  ) : null}
                  <Badge variant="outline" className="rounded-full border-[#d9e4fb] bg-white px-3 py-1 text-[#5f7297]">
                    {pages.length} page{pages.length === 1 ? "" : "s"}
                  </Badge>
                </div>
                <h1 className="mt-3 text-[2.15rem] font-black tracking-tight text-slate-950">Module Editor</h1>
                <p className="mt-1 max-w-3xl text-[15px] leading-7 text-slate-500">
                  Build page-by-page content with text, images, and quizzes, then save it to the materials catalog.
                  Curriculum can place this module anywhere later.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-2xl border-[#dce6f7] bg-white px-5 text-slate-700 shadow-none hover:bg-[#f7faff]"
              >
                <Link href="/admin/materials">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Materials
                </Link>
              </Button>
              <Button
                onClick={() => void saveDocument()}
                disabled={saving}
                className="h-11 rounded-2xl bg-[linear-gradient(135deg,#2f6fff_0%,#1d4ed8_100%)] px-6 text-white shadow-[0_22px_42px_-26px_rgba(37,99,235,0.88)] hover:brightness-105"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Module"}
              </Button>
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-[28px] border border-[#e8eef8] bg-white/90 px-4 py-3 shadow-[0_30px_60px_-55px_rgba(15,23,42,0.35)] backdrop-blur lg:px-5">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <MetaItem icon={Layers3} label="Module Type" value="Reusable Module" hint="Created free and unassigned." />
            <MetaItem
              icon={NotebookPen}
              label="Pages"
              value={`${pages.length} total page${pages.length === 1 ? "" : "s"}`}
              hint={selectedPage ? `Editing page ${pageIndex + 1}` : "No page selected"}
            />
            <MetaItem
              icon={BookCopy}
              label="Catalog Path"
              value={
                subjectTitle && chapterTitle
                  ? `${subjectTitle} / ${chapterTitle}`
                  : subjectTitle || chapterTitle || "Choose subject and chapter"
              }
              hint="This is the materials catalog location for this module."
            />
            <MetaItem
              icon={FileText}
              label="Document Title"
              value={title.trim() || "Untitled module"}
              hint="This is the module name shown in the library."
            />
            <MetaItem
              icon={Cloud}
              label="Last Saved"
              value={formatTimestamp(updatedAt)}
              hint={moduleId ? "Reusable module ready for curriculum placement." : "Draft has not been saved yet."}
            />
          </div>
          <div className="mt-4 grid gap-3 border-t border-[#edf2fb] pt-4 md:grid-cols-[minmax(0,1fr)_160px_minmax(180px,0.7fr)]">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Module title</label>
              <Input
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  setDirty(true);
                  setMessage("");
                  setError("");
                }}
                placeholder="Module title"
                className="h-11 rounded-2xl border-[#dfe7f5] bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Module code</label>
              <Input
                value={moduleCode}
                onChange={(event) => {
                  setModuleCode(event.target.value);
                  setDirty(true);
                  setMessage("");
                  setError("");
                }}
                placeholder="MOD-01"
                className="h-11 rounded-2xl border-[#dfe7f5] bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Unique identifier</label>
              <Input
                value={uniqueIdentifier}
                onChange={(event) => {
                  setUniqueIdentifier(event.target.value);
                  setDirty(true);
                  setMessage("");
                  setError("");
                }}
                placeholder={moduleId || "Auto ID after save"}
                className="h-11 rounded-2xl border-[#dfe7f5] bg-white"
              />
            </div>
          </div>
          {(dirty || message || error) && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#edf2fb] pt-3 text-sm">
              {dirty && (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 font-medium text-amber-700">
                  Unsaved changes
                </span>
              )}
              {message && (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
                  {message}
                </span>
              )}
              {error && (
                <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 font-medium text-red-700">
                  {error}
                </span>
              )}
            </div>
          )}
        </section>

        <div className="mt-5 space-y-5">
          <div className="grid gap-5 xl:grid-cols-[18rem_minmax(0,1fr)_21rem]">
          <Card className={cn(shellCardClassName, "rounded-[28px]")}>
            <CardHeader className="pb-4">
              <CardTitle className="text-[1.45rem] font-bold tracking-tight text-slate-950">Pages</CardTitle>
              <CardDescription className="text-sm leading-6 text-slate-500">
                Each page becomes one step in the saved module flow.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="h-11 w-full rounded-2xl border-[#d7e4ff] bg-white text-[#2f6fff] shadow-none hover:bg-[#f3f8ff]"
                onClick={() => {
                  const nextPage = createPage(pages.length + 1);
                  updatePages((current) => [...current, nextPage]);
                  setSelectedPageId(nextPage.id);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Next Page
              </Button>

              <div>
                <p className="text-sm font-semibold text-slate-500">
                  {selectedPage ? `${pageIndex + 1} of ${pages.length} pages` : `${pages.length} pages`}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Students move page by page. Create a new page here when you want the next screen to start.
                </p>
              </div>

              <div className="max-h-[27rem] space-y-2 overflow-y-auto pr-1">
                {pages.map((page, index) => (
                  <div
                    key={page.id}
                    onClick={() => setSelectedPageId(page.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedPageId(page.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className={cn(
                      "group rounded-[22px] border px-3 py-3.5 text-left transition-all",
                      page.id === selectedPageId
                        ? "border-[#cfe0ff] bg-[#edf4ff] shadow-[0_18px_40px_-30px_rgba(47,111,255,0.55)]"
                        : "border-[#edf2fb] bg-white hover:border-[#dce7fb] hover:bg-[#f9fbff]"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
                          page.id === selectedPageId ? "bg-[#dce8ff] text-[#2f6fff]" : "bg-slate-100 text-slate-500"
                        )}
                      >
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">{page.title || `Page ${index + 1}`}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {page.blocks.length} block{page.blocks.length === 1 ? "" : "s"}
                        </p>
                      </div>
                      <div className="flex items-center gap-0.5 opacity-100 xl:opacity-0 xl:group-hover:opacity-100">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-xl text-slate-500"
                          onClick={(event) => {
                            event.stopPropagation();
                            updatePages((current) => moveItem(current, index, -1));
                          }}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-xl text-slate-500"
                          onClick={(event) => {
                            event.stopPropagation();
                            updatePages((current) => moveItem(current, index, 1));
                          }}
                          disabled={index === pages.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-xl text-slate-500"
                          onClick={(event) => {
                            event.stopPropagation();
                            if (pages.length <= 1) return;
                            updatePages((current) => current.filter((item) => item.id !== page.id));
                          }}
                          disabled={pages.length <= 1}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-[20px] border border-dashed border-[#d6e2fb] bg-[#f8fbff] px-4 py-3">
                <p className="text-sm font-semibold text-slate-700">Need the next student page?</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Click below to create the next page. Everything in the Blocks section stays on the currently selected page until you add another page.
                </p>
                <button
                  type="button"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-[#2f6fff]"
                  onClick={() => {
                    const nextPage = createPage(pages.length + 1);
                    updatePages((current) => [...current, nextPage]);
                    setSelectedPageId(nextPage.id);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add Next Page
                </button>
              </div>
            </CardContent>
          </Card>

          {selectedPage ? (
            <Card className={cn(shellCardClassName, "rounded-[28px]")}>
              <CardHeader className="pb-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-[1.45rem] font-bold tracking-tight text-slate-950">Page Settings</CardTitle>
                    <CardDescription className="text-sm leading-6 text-slate-500">
                      Set the label students will see before the content blocks.
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewOpen(true)}
                    disabled={!selectedPage}
                    className="h-10 rounded-2xl border-[#dfe7f5] bg-white px-4 text-slate-700 shadow-none hover:bg-[#f7faff]"
                  >
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                    Open Preview
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_18rem]">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Page Title</label>
                    <Input
                      className="h-11 rounded-2xl border-[#dfe7f5] bg-white"
                      value={selectedPage.title}
                      onChange={(event) =>
                        updateSelectedPage((page) => ({ ...page, title: event.target.value }))
                      }
                      placeholder="Page title"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Position</label>
                    <div className="relative">
                      <List className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <select
                        className="h-11 w-full appearance-none rounded-2xl border border-[#dfe7f5] bg-white pl-11 pr-4 text-sm text-slate-700 focus:outline-none"
                        value={selectedPage.id}
                        onChange={(event) => setSelectedPageId(event.target.value)}
                      >
                        {pages.map((page, index) => (
                          <option key={page.id} value={page.id}>
                            Page {index + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-sm font-semibold text-slate-700">Intro Note (Optional)</label>
                    <span className="text-xs text-slate-400">{selectedPage.description.length}/500</span>
                  </div>
                  <Textarea
                    className="min-h-[108px] rounded-[20px] border-[#dfe7f5] bg-white"
                    value={selectedPage.description}
                    onChange={(event) =>
                      updateSelectedPage((page) => ({ ...page, description: event.target.value.slice(0, 500) }))
                    }
                    placeholder="Short teacher note or student instruction for this page."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-[28px] border-dashed border-[#d6dff0] bg-[#fbfcff]">
              <CardContent className="p-8 text-sm text-slate-500">Select or add a page to edit its settings.</CardContent>
            </Card>
          )}

          <div className="space-y-5 xl:sticky xl:top-24 xl:self-start">
            <Card className={cn(shellCardClassName, "rounded-[28px]")}>
              <CardHeader className="pb-4">
                <CardTitle className="text-[1.45rem] font-bold tracking-tight text-slate-950">Page Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="overflow-hidden rounded-[22px] border border-[#e5ecf8] bg-white">
                  <SummaryRow
                    icon={FileText}
                    label="Blocks on this page"
                    value={String(selectedPage?.blocks.length ?? 0)}
                  />
                  <SummaryRow icon={Eye} label="Estimated read time" value={getEstimatedReadTime(selectedPage)} />
                  <SummaryRow
                    icon={Cloud}
                    label="Last edited"
                    value={dirty ? "Unsaved" : updatedAt ? "Saved" : "Draft"}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className={cn(shellCardClassName, "rounded-[28px]")}>
              <CardHeader className="pb-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#d9e4fb] bg-[#f4f8ff] text-[#2f6fff]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-[1.45rem] font-bold tracking-tight text-slate-950">Ask AI</CardTitle>
                    <CardDescription className="text-sm leading-6 text-slate-500">
                      Draft quiz ideas for this page, draft a quiz from the module title, or suggest what else should be explained.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="rounded-[22px] border border-[#e5ecf8] bg-[#f8fbff] px-4 py-3">
                  <p className="text-sm font-semibold text-slate-800">
                    {selectedPage?.title.trim() || `Page ${pageIndex + 1}`}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Module focus: {title.trim() || chapterTitle || subjectTitle || "Untitled module"}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className={aiAssistButtonClassName}
                  disabled={aiPendingAction !== null || !selectedPage}
                  onClick={() => void runAiAssist("page-quiz")}
                >
                  {aiPendingAction === "page-quiz" ? (
                    <LoaderCircle className="mr-3 h-4 w-4 animate-spin" />
                  ) : (
                    <CircleHelp className="mr-3 h-4 w-4 text-[#2f6fff]" />
                  )}
                  <span className={aiAssistLabelClassName}>
                    <span className="font-semibold">Ask AI for a page quiz</span>
                    <span className="text-xs text-slate-500">Adds a ready-to-edit quiz block based on this page.</span>
                  </span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className={aiAssistButtonClassName}
                  disabled={aiPendingAction !== null || !selectedPage}
                  onClick={() => void runAiAssist("module-quiz")}
                >
                  {aiPendingAction === "module-quiz" ? (
                    <LoaderCircle className="mr-3 h-4 w-4 animate-spin" />
                  ) : (
                    <BookCopy className="mr-3 h-4 w-4 text-[#2f6fff]" />
                  )}
                  <span className={aiAssistLabelClassName}>
                    <span className="font-semibold">Ask AI for a module quiz</span>
                    <span className="text-xs text-slate-500">Uses the module title so the quiz follows the main topic.</span>
                  </span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className={aiAssistButtonClassName}
                  disabled={aiPendingAction !== null || !selectedPage}
                  onClick={() => void runAiAssist("section")}
                >
                  {aiPendingAction === "section" ? (
                    <LoaderCircle className="mr-3 h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="mr-3 h-4 w-4 text-[#2f6fff]" />
                  )}
                  <span className={aiAssistLabelClassName}>
                    <span className="font-semibold">Ask AI what else to explain</span>
                    <span className="text-xs text-slate-500">Adds a suggested text section with missing angles to cover.</span>
                  </span>
                </Button>

                {aiInsight ? (
                  <div className="rounded-[20px] border border-[#dce7fb] bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Latest AI focus</p>
                    <p className="mt-1 text-sm text-slate-600">{aiInsight}</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card className={cn(shellCardClassName, "rounded-[28px] overflow-hidden")}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-[1.45rem] font-bold tracking-tight text-slate-950">Live Preview</CardTitle>
                    <CardDescription className="text-sm leading-6 text-slate-500">
                      Updates instantly while you edit blocks on this page.
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewOpen(true)}
                    className="h-10 rounded-2xl border-[#dfe7f5] bg-white px-4 text-slate-700 shadow-none hover:bg-[#f7faff]"
                  >
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                    Full Preview
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="max-h-[70vh] overflow-y-auto rounded-[24px] border border-[#e5ecf8] bg-slate-50 p-3">
                  <ModuleDocumentView
                    key={selectedPage?.id || "inline-preview"}
                    document={{
                      id: moduleId || "draft-module",
                      title: title || "Module draft",
                      moduleCode,
                      uniqueIdentifier,
                      pages,
                      updatedAt,
                      subjectSlug: subjectSlug || "",
                      subjectTitle,
                      chapterSlug: chapterSlug || "",
                      chapterTitle,
                    }}
                    initialPageId={selectedPage?.id}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          </div>

          {selectedPage ? (
            <Card className={cn(shellCardClassName, "rounded-[28px]")}>
              <CardHeader className="pb-4">
                <CardTitle className="text-[1.45rem] font-bold tracking-tight text-slate-950">Blocks</CardTitle>
                <CardDescription className="text-sm leading-6 text-slate-500">
                  Mix content types inside the current page. Use Add Next Page in the Pages panel when the next student page should begin.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="sticky top-24 z-20 -mx-1 rounded-[24px] border-2 border-[#c3d3f5] bg-[linear-gradient(180deg,rgba(248,251,255,0.98)_0%,rgba(255,255,255,0.98)_100%)] p-3 shadow-[0_24px_54px_-34px_rgba(15,23,42,0.42)] backdrop-blur">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">Quick Add</p>
                      <p className="text-xs text-slate-600">Add content without jumping back to the top.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 rounded-2xl border-[#c5d7fb] bg-white px-4 text-slate-700 shadow-none hover:bg-[#f7faff]"
                        onClick={() => addBlockToSelectedPage(createTextBlock)}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Add Text
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 rounded-2xl border-[#c5d7fb] bg-white px-4 text-slate-700 shadow-none hover:bg-[#f7faff]"
                        onClick={() => addBlockToSelectedPage(createImageBlock)}
                      >
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Add Image
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 rounded-2xl border-[#c5d7fb] bg-white px-4 text-slate-700 shadow-none hover:bg-[#f7faff]"
                        onClick={() => addBlockToSelectedPage(createQuizBlock)}
                      >
                        <CircleHelp className="mr-2 h-4 w-4" />
                        Add Quiz
                      </Button>
                    </div>
                  </div>
                </div>

                {selectedPage.blocks.map((block, index) => (
                      <div key={block.id} className="rounded-[24px] border border-[#e5ecf8] bg-white p-4 shadow-[0_18px_38px_-34px_rgba(15,23,42,0.35)]">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "inline-flex rounded-full px-3 py-1 text-xs font-bold",
                                block.type === "text"
                                  ? "bg-[#fff0e5] text-[#f27b2f]"
                                  : block.type === "image"
                                    ? "bg-[#eaf1ff] text-[#2f6fff]"
                                    : "bg-[#eafbf2] text-[#149b61]"
                              )}
                            >
                              {block.type === "text" ? "Text" : block.type === "image" ? "Image" : "Quiz"}
                            </span>
                            <span className="text-sm font-semibold text-slate-800">Block {index + 1}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-xl text-slate-500"
                              onClick={() =>
                                updateSelectedPage((page) => ({
                                  ...page,
                                  blocks: moveItem(page.blocks, index, -1),
                                }))
                              }
                              disabled={index === 0}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-xl text-slate-500"
                              onClick={() =>
                                updateSelectedPage((page) => ({
                                  ...page,
                                  blocks: moveItem(page.blocks, index, 1),
                                }))
                              }
                              disabled={index === selectedPage.blocks.length - 1}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600"
                              onClick={() =>
                                updateSelectedPage((page) => ({
                                  ...page,
                                  blocks:
                                    page.blocks.length > 1
                                      ? page.blocks.filter((item) => item.id !== block.id)
                                      : [createTextBlock()],
                                }))
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {block.type === "text" && (
                          <div className="mt-4 space-y-4">
                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-slate-700">Heading</label>
                              <Input
                                className="h-11 rounded-2xl border-[#dfe7f5] bg-white"
                                value={block.title}
                                onChange={(event) =>
                                  updateBlock(block.id, (current) => ({
                                    ...current,
                                    type: "text",
                                    title: event.target.value,
                                    body: current.type === "text" ? current.body : "",
                                  }))
                                }
                                placeholder="Section heading"
                              />
                            </div>
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <label className="text-sm font-semibold text-slate-700">Body</label>
                                  <p className="mt-1 text-xs text-slate-500">
                                    Supports bold, italic, underline, links, bullet lists, numbered lists, and quotes.
                                  </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {[
                                    { label: "Bold", icon: Bold, action: "bold" as const },
                                    { label: "Italic", icon: Italic, action: "italic" as const },
                                    { label: "Underline", icon: Underline, action: "underline" as const },
                                    { label: "Link", icon: Link2, action: "link" as const },
                                    { label: "Bullets", icon: List, action: "bullet-list" as const },
                                    { label: "Numbered", icon: ListOrdered, action: "numbered-list" as const },
                                    { label: "Quote", icon: Quote, action: "quote" as const },
                                  ].map(({ label, icon: Icon, action }) => (
                                    <Button
                                      key={`${block.id}-${action}`}
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="h-9 rounded-xl border-[#dfe7f5] bg-white px-3 text-slate-600 shadow-none hover:bg-[#f7faff]"
                                      onClick={() => applyTextFormatting(block.id, action)}
                                    >
                                      <Icon className="mr-1.5 h-3.5 w-3.5" />
                                      {label}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                              <Textarea
                                ref={(element) => {
                                  textAreaRefs.current[block.id] = element;
                                }}
                                className="min-h-[120px] rounded-[20px] border-[#dfe7f5] bg-white"
                                value={block.body}
                                onChange={(event) =>
                                  updateBlock(block.id, (current) => ({
                                    ...current,
                                    type: "text",
                                    title: current.type === "text" ? current.title : "",
                                    body: event.target.value,
                                  }))
                                }
                                rows={5}
                                placeholder="Write the teaching content here."
                              />
                            </div>
                          </div>
                        )}

                        {block.type === "image" && (
                          <div className="mt-4 grid gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-slate-700">Image URL</label>
                              <Input
                                className="h-11 rounded-2xl border-[#dfe7f5] bg-white"
                                value={block.imageUrl}
                                onChange={(event) =>
                                  updateBlock(block.id, (current) => ({
                                    ...current,
                                    type: "image",
                                    imageUrl: event.target.value,
                                    altText: current.type === "image" ? current.altText : "",
                                    caption: current.type === "image" ? current.caption : "",
                                  }))
                                }
                                placeholder="https://..."
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-slate-700">Alt Text</label>
                              <Input
                                className="h-11 rounded-2xl border-[#dfe7f5] bg-white"
                                value={block.altText}
                                onChange={(event) =>
                                  updateBlock(block.id, (current) => ({
                                    ...current,
                                    type: "image",
                                    imageUrl: current.type === "image" ? current.imageUrl : "",
                                    altText: event.target.value,
                                    caption: current.type === "image" ? current.caption : "",
                                  }))
                                }
                                placeholder="What should screen readers announce?"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-slate-700">Caption</label>
                              <Textarea
                                className="min-h-[96px] rounded-[20px] border-[#dfe7f5] bg-white"
                                value={block.caption}
                                onChange={(event) =>
                                  updateBlock(block.id, (current) => ({
                                    ...current,
                                    type: "image",
                                    imageUrl: current.type === "image" ? current.imageUrl : "",
                                    altText: current.type === "image" ? current.altText : "",
                                    caption: event.target.value,
                                  }))
                                }
                                rows={3}
                                placeholder="Add context for the image."
                              />
                            </div>
                          </div>
                        )}

                        {block.type === "quiz" && (
                          <div className="mt-4 space-y-4">
                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-slate-700">Quiz Type</label>
                              <select
                                className="h-11 w-full rounded-2xl border border-[#dfe7f5] bg-white px-4 text-sm text-slate-700 focus:outline-none"
                                value={block.quizType}
                                onChange={(event) =>
                                  updateBlock(block.id, (current) => {
                                    const currentQuizBlock = current.type === "quiz" ? current : createQuizBlock();
                                    const nextQuizType = event.target.value as ModuleEditorQuizType;
                                    const nextQuizBlock = createQuizBlockForType(nextQuizType);

                                    return {
                                      ...nextQuizBlock,
                                      id: block.id,
                                      prompt: currentQuizBlock.prompt,
                                      explanation: currentQuizBlock.explanation,
                                    };
                                  })
                                }
                              >
                                {QUIZ_TYPE_OPTIONS.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-slate-700">Question</label>
                              <Textarea
                                className="min-h-[110px] rounded-[20px] border-[#dfe7f5] bg-white"
                                value={block.prompt}
                                onChange={(event) =>
                                  updateBlock(block.id, (current) => ({
                                    ...(current.type === "quiz" ? current : createQuizBlock()),
                                    id: block.id,
                                    prompt: event.target.value,
                                  }))
                                }
                                rows={4}
                                placeholder="What should the learner answer?"
                              />
                            </div>

                            {usesOptionAnswers(block.quizType) && (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <label className="text-sm font-semibold text-slate-700">Options</label>
                                    <p className="mt-1 text-xs text-slate-500">
                                      {usesMultipleCorrectAnswers(block.quizType)
                                        ? "Mark every correct answer."
                                        : "Mark one correct answer."}
                                    </p>
                                  </div>
                                  {block.quizType !== "true-false" && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="rounded-2xl"
                                      onClick={() =>
                                        updateBlock(block.id, (current) => {
                                          const quizBlock = current.type === "quiz" ? current : createQuizBlock();
                                          return {
                                            ...quizBlock,
                                            id: block.id,
                                            options: [...quizBlock.options, { id: createId(), text: "" }].slice(0, 8),
                                          };
                                        })
                                      }
                                    >
                                      <Plus className="mr-2 h-4 w-4" />
                                      Add option
                                    </Button>
                                  )}
                                </div>

                                {block.options.map((option, optionIndex) => {
                                  const isCorrect = block.correctOptionIds.includes(option.id);

                                  return (
                                    <div key={option.id} className="rounded-2xl border border-[#e8eef8] bg-[#fbfcff] p-3">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant={isCorrect ? "default" : "outline"}
                                          className={cn(
                                            "rounded-2xl",
                                            isCorrect &&
                                              "bg-[linear-gradient(135deg,#2f6fff_0%,#1d4ed8_100%)] text-white shadow-none"
                                          )}
                                          onClick={() =>
                                            updateBlock(block.id, (current) => {
                                              const quizBlock = current.type === "quiz" ? current : createQuizBlock();
                                              const currentlySelected = quizBlock.correctOptionIds.includes(option.id);

                                              return {
                                                ...quizBlock,
                                                id: block.id,
                                                correctOptionIds: usesMultipleCorrectAnswers(quizBlock.quizType)
                                                  ? currentlySelected
                                                    ? quizBlock.correctOptionIds.length > 1
                                                      ? quizBlock.correctOptionIds.filter((value) => value !== option.id)
                                                      : quizBlock.correctOptionIds
                                                    : [...quizBlock.correctOptionIds, option.id]
                                                  : [option.id],
                                              };
                                            })
                                          }
                                        >
                                          {isCorrect
                                            ? "Correct"
                                            : usesMultipleCorrectAnswers(block.quizType)
                                              ? "Add correct"
                                              : "Mark correct"}
                                        </Button>
                                        <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                                          Option {optionIndex + 1}
                                        </span>
                                        {block.quizType !== "true-false" && (
                                          <Button
                                            type="button"
                                            size="icon"
                                            variant="ghost"
                                            className="ml-auto h-8 w-8 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600"
                                            onClick={() =>
                                              updateBlock(block.id, (current) => {
                                                const quizBlock = current.type === "quiz" ? current : createQuizBlock();
                                                if (quizBlock.options.length <= 2) return quizBlock;

                                                const nextOptions = quizBlock.options.filter((item) => item.id !== option.id);
                                                const nextCorrectOptionIds = quizBlock.correctOptionIds.filter(
                                                  (value) => value !== option.id
                                                );

                                                return {
                                                  ...quizBlock,
                                                  id: block.id,
                                                  options: nextOptions,
                                                  correctOptionIds:
                                                    nextCorrectOptionIds.length > 0
                                                      ? nextCorrectOptionIds
                                                      : nextOptions[0]?.id
                                                        ? [nextOptions[0].id]
                                                        : [],
                                                };
                                              })
                                            }
                                            disabled={block.options.length <= 2}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        )}
                                      </div>
                                      <Input
                                        className="mt-3 h-11 rounded-2xl border-[#dfe7f5] bg-white"
                                        value={option.text}
                                        onChange={(event) =>
                                          updateBlock(block.id, (current) => {
                                            const quizBlock = current.type === "quiz" ? current : createQuizBlock();
                                            return {
                                              ...quizBlock,
                                              id: block.id,
                                              options: quizBlock.options.map((item) =>
                                                item.id === option.id ? { ...item, text: event.target.value } : item
                                              ),
                                            };
                                          })
                                        }
                                        placeholder={`Option ${optionIndex + 1}`}
                                        disabled={block.quizType === "true-false"}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {usesAcceptableAnswerInputs(block.quizType) && (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <label className="text-sm font-semibold text-slate-700">Accepted Answers</label>
                                    <p className="mt-1 text-xs text-slate-500">
                                      Add one or more answers that should count as correct.
                                    </p>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="rounded-2xl"
                                    onClick={() =>
                                      updateBlock(block.id, (current) => {
                                        const quizBlock = current.type === "quiz" ? current : createQuizBlock();
                                        return {
                                          ...quizBlock,
                                          id: block.id,
                                          acceptableAnswers: [...quizBlock.acceptableAnswers, ""].slice(0, 12),
                                        };
                                      })
                                    }
                                  >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add answer
                                  </Button>
                                </div>

                                {(block.acceptableAnswers.length > 0 ? block.acceptableAnswers : [""]).map(
                                  (answer, answerIndex) => (
                                    <div
                                      key={`${block.id}-answer-${answerIndex}`}
                                      className="rounded-2xl border border-[#e8eef8] bg-[#fbfcff] p-3"
                                    >
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                                          Answer {answerIndex + 1}
                                        </span>
                                        <Button
                                          type="button"
                                          size="icon"
                                          variant="ghost"
                                          className="ml-auto h-8 w-8 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600"
                                          onClick={() =>
                                            updateBlock(block.id, (current) => {
                                              const quizBlock = current.type === "quiz" ? current : createQuizBlock();
                                              const nextAnswers = quizBlock.acceptableAnswers.filter(
                                                (_, index) => index !== answerIndex
                                              );
                                              return {
                                                ...quizBlock,
                                                id: block.id,
                                                acceptableAnswers: nextAnswers,
                                              };
                                            })
                                          }
                                          disabled={block.acceptableAnswers.length <= 1}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                      <Input
                                        className="mt-3 h-11 rounded-2xl border-[#dfe7f5] bg-white"
                                        value={answer}
                                        onChange={(event) =>
                                          updateBlock(block.id, (current) => {
                                            const quizBlock = current.type === "quiz" ? current : createQuizBlock();
                                            const baseAnswers =
                                              quizBlock.acceptableAnswers.length > 0 ? quizBlock.acceptableAnswers : [""];
                                            return {
                                              ...quizBlock,
                                              id: block.id,
                                              acceptableAnswers: baseAnswers.map((item, index) =>
                                                index === answerIndex ? event.target.value : item
                                              ),
                                            };
                                          })
                                        }
                                        placeholder={
                                          block.quizType === "fill-in-the-blank"
                                            ? "Expected word or phrase"
                                            : "Accepted short answer"
                                        }
                                      />
                                    </div>
                                  )
                                )}
                              </div>
                            )}

                            {usesMatchingPairs(block.quizType) && (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <label className="text-sm font-semibold text-slate-700">Matching Pairs</label>
                                    <p className="mt-1 text-xs text-slate-500">Each row defines one correct match.</p>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="rounded-2xl"
                                    onClick={() =>
                                      updateBlock(block.id, (current) => {
                                        const quizBlock = current.type === "quiz" ? current : createQuizBlock();
                                        return {
                                          ...quizBlock,
                                          id: block.id,
                                          matchingPairs: [
                                            ...quizBlock.matchingPairs,
                                            { id: createId(), prompt: "", match: "" },
                                          ].slice(0, 12),
                                        };
                                      })
                                    }
                                  >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add pair
                                  </Button>
                                </div>

                                {block.matchingPairs.map((pair, pairIndex) => (
                                  <div key={pair.id} className="rounded-2xl border border-[#e8eef8] bg-[#fbfcff] p-3">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                                        Pair {pairIndex + 1}
                                      </span>
                                      <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        className="ml-auto h-8 w-8 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600"
                                        onClick={() =>
                                          updateBlock(block.id, (current) => {
                                            const quizBlock = current.type === "quiz" ? current : createQuizBlock();
                                            if (quizBlock.matchingPairs.length <= 2) return quizBlock;

                                            return {
                                              ...quizBlock,
                                              id: block.id,
                                              matchingPairs: quizBlock.matchingPairs.filter((item) => item.id !== pair.id),
                                            };
                                          })
                                        }
                                        disabled={block.matchingPairs.length <= 2}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                                      <Input
                                        className="h-11 rounded-2xl border-[#dfe7f5] bg-white"
                                        value={pair.prompt}
                                        onChange={(event) =>
                                          updateBlock(block.id, (current) => {
                                            const quizBlock = current.type === "quiz" ? current : createQuizBlock();
                                            return {
                                              ...quizBlock,
                                              id: block.id,
                                              matchingPairs: quizBlock.matchingPairs.map((item) =>
                                                item.id === pair.id ? { ...item, prompt: event.target.value } : item
                                              ),
                                            };
                                          })
                                        }
                                        placeholder="Left prompt"
                                      />
                                      <Input
                                        className="h-11 rounded-2xl border-[#dfe7f5] bg-white"
                                        value={pair.match}
                                        onChange={(event) =>
                                          updateBlock(block.id, (current) => {
                                            const quizBlock = current.type === "quiz" ? current : createQuizBlock();
                                            return {
                                              ...quizBlock,
                                              id: block.id,
                                              matchingPairs: quizBlock.matchingPairs.map((item) =>
                                                item.id === pair.id ? { ...item, match: event.target.value } : item
                                              ),
                                            };
                                          })
                                        }
                                        placeholder="Right match"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {usesOrderingItems(block.quizType) && (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <label className="text-sm font-semibold text-slate-700">Correct Sequence</label>
                                    <p className="mt-1 text-xs text-slate-500">
                                      Arrange these items in the correct order.
                                    </p>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="rounded-2xl"
                                    onClick={() =>
                                      updateBlock(block.id, (current) => {
                                        const quizBlock = current.type === "quiz" ? current : createQuizBlock();
                                        return {
                                          ...quizBlock,
                                          id: block.id,
                                          orderingItems: [...quizBlock.orderingItems, { id: createId(), text: "" }].slice(
                                            0,
                                            12
                                          ),
                                        };
                                      })
                                    }
                                  >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add step
                                  </Button>
                                </div>

                                {block.orderingItems.map((item, itemIndex) => (
                                  <div key={item.id} className="rounded-2xl border border-[#e8eef8] bg-[#fbfcff] p-3">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                                        Step {itemIndex + 1}
                                      </span>
                                      <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        className="ml-auto h-8 w-8 rounded-xl text-slate-500"
                                        onClick={() =>
                                          updateBlock(block.id, (current) => {
                                            const quizBlock = current.type === "quiz" ? current : createQuizBlock();
                                            return {
                                              ...quizBlock,
                                              id: block.id,
                                              orderingItems: moveItem(quizBlock.orderingItems, itemIndex, -1),
                                            };
                                          })
                                        }
                                        disabled={itemIndex === 0}
                                      >
                                        <ArrowUp className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 rounded-xl text-slate-500"
                                        onClick={() =>
                                          updateBlock(block.id, (current) => {
                                            const quizBlock = current.type === "quiz" ? current : createQuizBlock();
                                            return {
                                              ...quizBlock,
                                              id: block.id,
                                              orderingItems: moveItem(quizBlock.orderingItems, itemIndex, 1),
                                            };
                                          })
                                        }
                                        disabled={itemIndex === block.orderingItems.length - 1}
                                      >
                                        <ArrowDown className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600"
                                        onClick={() =>
                                          updateBlock(block.id, (current) => {
                                            const quizBlock = current.type === "quiz" ? current : createQuizBlock();
                                            if (quizBlock.orderingItems.length <= 2) return quizBlock;

                                            return {
                                              ...quizBlock,
                                              id: block.id,
                                              orderingItems: quizBlock.orderingItems.filter((entry) => entry.id !== item.id),
                                            };
                                          })
                                        }
                                        disabled={block.orderingItems.length <= 2}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    <Input
                                      className="mt-3 h-11 rounded-2xl border-[#dfe7f5] bg-white"
                                      value={item.text}
                                      onChange={(event) =>
                                        updateBlock(block.id, (current) => {
                                          const quizBlock = current.type === "quiz" ? current : createQuizBlock();
                                          return {
                                            ...quizBlock,
                                            id: block.id,
                                            orderingItems: quizBlock.orderingItems.map((entry) =>
                                              entry.id === item.id ? { ...entry, text: event.target.value } : entry
                                            ),
                                          };
                                        })
                                      }
                                      placeholder={`Step ${itemIndex + 1}`}
                                    />
                                  </div>
                                ))}
                              </div>
                            )}

                            {isEssayQuiz(block.quizType) && (
                              <div className="rounded-2xl border border-[#e8eef8] bg-[#fbfcff] p-4 text-sm text-slate-600">
                                Essay questions do not need fixed answers here. Use the field below to add rubric notes,
                                model-answer guidance, or teacher marking instructions.
                              </div>
                            )}

                            <div className="space-y-2">
                              <label className="text-sm font-semibold text-slate-700">
                                {isEssayQuiz(block.quizType) ? "Rubric / marking notes" : "Explanation"}
                              </label>
                              <Textarea
                                className="min-h-[96px] rounded-[20px] border-[#dfe7f5] bg-white"
                                value={block.explanation}
                                onChange={(event) =>
                                  updateBlock(block.id, (current) => ({
                                    ...(current.type === "quiz" ? current : createQuizBlock()),
                                    id: block.id,
                                    explanation: event.target.value,
                                  }))
                                }
                                rows={3}
                                placeholder={
                                  isEssayQuiz(block.quizType)
                                    ? "Add marking criteria, rubric notes, or model answer guidance."
                                    : "Explain why the correct answer is correct."
                                }
                              />
                            </div>
                          </div>
                        )}
                      </div>
                ))}

                <div className="rounded-[20px] border border-dashed border-[#d6dff0] bg-[#fbfcff] px-4 py-3 text-center text-sm font-medium text-slate-500">
                  Use the arrows above to reorder blocks
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-[28px] border-dashed border-[#d6dff0] bg-[#fbfcff]">
              <CardContent className="p-8 text-sm text-slate-500">Add a page to start building the module.</CardContent>
            </Card>
          )}
        </div>

        <p className="pt-8 text-center text-sm text-slate-400">© {currentYear} Yayasan Edutindo. All rights reserved.</p>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="h-[92vh] max-w-[min(98vw,96rem)] grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-3xl p-0">
          <DialogHeader className="border-b border-slate-200 px-6 py-5">
            <DialogTitle className="text-xl">Full Preview</DialogTitle>
            <DialogDescription>
              {selectedPage
                ? `Preview the student flow page-by-page starting from ${selectedPage.title || "the selected page"}.`
                : "No page selected."}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto bg-slate-50 px-4 py-6 lg:px-6">
            <div className="mx-auto w-full max-w-[88rem]">
              <ModuleDocumentView
                key={selectedPage?.id || "preview"}
                document={{
                  id: moduleId || "draft-module",
                  title: title || "Module draft",
                  moduleCode,
                  uniqueIdentifier,
                  pages,
                  updatedAt,
                  subjectSlug: subjectSlug || "",
                  subjectTitle,
                  chapterSlug: chapterSlug || "",
                  chapterTitle,
                }}
                initialPageId={selectedPage?.id}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
