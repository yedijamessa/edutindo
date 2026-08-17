"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Check,
  FileClock,
  FolderPlus,
  Layers3,
  Loader2,
  NotebookTabs,
  Plus,
  School,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type ContentSandboxMode = "curriculum" | "chapter" | "module";

type SandboxNodeType = "school" | "year" | "subject" | "chapter" | "lesson";

export type SandboxNode = {
  id: string;
  parentId: string | null;
  nodeType: SandboxNodeType;
  title: string;
  slug: string;
  position: number;
  metadata: Record<string, unknown>;
  children: SandboxNode[];
};

export type SandboxModule = {
  moduleId: string;
  moduleTitle: string;
  moduleCode: string;
  uniqueIdentifier: string;
  pageCount: number;
  subjectSlug: string;
  subjectTitle: string;
  chapterSlug: string;
  chapterTitle: string;
  assignments: Array<{
    lessonId: string;
    lessonTitle: string;
    chapterSlug: string;
    subjectSlug: string;
  }>;
};

type AssignmentTag = {
  schoolSlug: string;
  yearSlug: string;
};

type DraftModule = {
  title: string;
  code: string;
  uniqueIdentifier: string;
};

const YEAR_OPTIONS = [
  { title: "Year 7", slug: "year-7" },
  { title: "Year 8", slug: "year-8" },
  { title: "Year 9", slug: "year-9" },
];

const modeCopy: Record<
  ContentSandboxMode,
  {
    title: string;
    eyebrow: string;
    description: string;
    icon: typeof FolderPlus;
  }
> = {
  curriculum: {
    title: "Create Curriculum",
    eyebrow: "Content Sandbox",
    description: "Create a curriculum, add or copy chapters, then optionally assign it to a school and year.",
    icon: FolderPlus,
  },
  chapter: {
    title: "Create Chapter",
    eyebrow: "Chapter Builder",
    description: "Create a chapter under a curriculum, then choose existing modules or create new modules inside it.",
    icon: Layers3,
  },
  module: {
    title: "Create Module",
    eyebrow: "Module Builder",
    description: "Create a reusable module and place it into a chosen curriculum chapter.",
    icon: NotebookTabs,
  },
};

function text(value: unknown) {
  return String(value ?? "").trim();
}

function getAssignmentTags(school: SandboxNode | null, yearSlug: string): AssignmentTag[] {
  if (!school || !yearSlug) return [];
  return [{ schoolSlug: school.slug, yearSlug }];
}

function getAllNodes(root: SandboxNode[], nodeType: SandboxNodeType) {
  const matches: SandboxNode[] = [];
  const visit = (node: SandboxNode) => {
    if (node.nodeType === nodeType) matches.push(node);
    node.children.forEach(visit);
  };
  root.forEach(visit);
  return matches;
}

async function readResponse(response: Response) {
  const data = await response.json();
  if (!response.ok || !data?.ok) {
    throw new Error(data?.error || "Request failed.");
  }
  return data;
}

function FieldLabel({ children }: { children: string }) {
  return <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{children}</label>;
}

function Panel({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: typeof FolderPlus;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[24px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.5)] dark:border-slate-800 dark:bg-slate-900/84">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-[#eef4ff] text-[#2f6fff]">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-300">{description}</p>
        </div>
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

export function ContentSandboxClient({
  mode,
  initialTree,
  initialModules,
}: {
  mode: ContentSandboxMode;
  initialTree: SandboxNode[];
  initialModules: SandboxModule[];
}) {
  const router = useRouter();
  const [tree, setTree] = useState(initialTree);
  const [modules, setModules] = useState(initialModules);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [selectedYearSlug, setSelectedYearSlug] = useState("year-7");
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([]);
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([]);
  const [curriculumTitle, setCurriculumTitle] = useState("");
  const [curriculumCode, setCurriculumCode] = useState("");
  const [curriculumUniqueId, setCurriculumUniqueId] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterCode, setChapterCode] = useState("");
  const [chapterUniqueId, setChapterUniqueId] = useState("");
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleCode, setModuleCode] = useState("");
  const [moduleUniqueId, setModuleUniqueId] = useState("");
  const [newSubjectTitle, setNewSubjectTitle] = useState("");
  const [newSubjectCode, setNewSubjectCode] = useState("");
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [newSchoolTitle, setNewSchoolTitle] = useState("");
  const [newModules, setNewModules] = useState<DraftModule[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const copy = modeCopy[mode];
  const HeaderIcon = copy.icon;

  const subjects = useMemo(() => tree.filter((node) => node.nodeType === "subject" && node.parentId === null), [tree]);
  const schools = useMemo(() => tree.filter((node) => node.nodeType === "school" && node.parentId === null), [tree]);
  const allChapters = useMemo(() => getAllNodes(tree, "chapter"), [tree]);
  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId) ?? null;
  const selectedSchool = schools.find((school) => school.id === selectedSchoolId) ?? null;
  const subjectChapters = selectedSubject?.children.filter((node) => node.nodeType === "chapter") ?? [];
  const selectedChapter = subjectChapters.find((chapter) => chapter.id === selectedChapterId) ?? null;

  async function refreshTree() {
    const response = await fetch("/api/admin/curriculum", { cache: "no-store" });
    const data = await readResponse(response);
    setTree(Array.isArray(data.tree) ? data.tree : []);
  }

  async function createNode(nodeType: SandboxNodeType, parentId: string | null, title: string, metadata?: Record<string, unknown>) {
    const response = await fetch("/api/admin/curriculum", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nodeType, parentId, title, metadata }),
    });
    const data = await readResponse(response);
    return data.node as SandboxNode;
  }

  async function createModuleDocument(input: DraftModule, subject: SandboxNode, chapter: SandboxNode) {
    const response = await fetch("/api/admin/module-editor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: input.title,
        moduleCode: input.code,
        uniqueIdentifier: input.uniqueIdentifier,
        subjectSlug: subject.slug,
        subjectTitle: subject.title,
        chapterSlug: chapter.slug,
        chapterTitle: chapter.title,
      }),
    });
    const data = await readResponse(response);
    const document = data.document;
    const nextModule: SandboxModule = {
      moduleId: document.id,
      moduleTitle: document.title,
      moduleCode: document.moduleCode ?? "",
      uniqueIdentifier: document.uniqueIdentifier ?? "",
      pageCount: document.pages?.length ?? 1,
      subjectSlug: document.subjectSlug,
      subjectTitle: document.subjectTitle,
      chapterSlug: document.chapterSlug,
      chapterTitle: document.chapterTitle,
      assignments: [],
    };
    setModules((current) => [nextModule, ...current]);
    return nextModule;
  }

  async function createLessonAndAssign(chapter: SandboxNode, module: SandboxModule, assignmentTags: AssignmentTag[]) {
    const lesson = await createNode("lesson", chapter.id, module.moduleTitle, {
      lessonCode: module.moduleCode,
      uniqueIdentifier: module.uniqueIdentifier,
      assignmentTags,
    });

    const response = await fetch("/api/admin/module-assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleId: module.moduleId, lessonId: lesson.id }),
    });
    await readResponse(response);
    return lesson;
  }

  async function ensureSubject() {
    if (selectedSubject) return selectedSubject;
    if (!newSubjectTitle.trim()) {
      throw new Error("Choose a curriculum or create a new subject first.");
    }

    const subject = await createNode("subject", null, newSubjectTitle.trim(), {
      curriculumCode: newSubjectCode.trim(),
      uniqueIdentifier: newSubjectCode.trim() || newSubjectTitle.trim(),
    });
    setSelectedSubjectId(subject.id);
    return subject;
  }

  async function ensureChapter(subject: SandboxNode) {
    if (selectedChapter && selectedChapter.parentId === subject.id) return selectedChapter;
    if (!newChapterTitle.trim()) {
      throw new Error("Choose a chapter or create a new chapter first.");
    }

    const chapter = await createNode("chapter", subject.id, newChapterTitle.trim(), {
      chapterCode: chapterCode.trim(),
      uniqueIdentifier: chapterUniqueId.trim() || newChapterTitle.trim(),
    });
    setSelectedChapterId(chapter.id);
    return chapter;
  }

  async function handleCreateInlineSubject() {
    if (!newSubjectTitle.trim()) {
      setError("Enter a new subject name first.");
      return;
    }

    await runAction(async () => {
      const subject = await createNode("subject", null, newSubjectTitle.trim(), {
        curriculumCode: newSubjectCode.trim(),
        uniqueIdentifier: newSubjectCode.trim() || newSubjectTitle.trim(),
      });
      setSelectedSubjectId(subject.id);
      setNewSubjectTitle("");
      setNewSubjectCode("");
      await refreshTree();
      setMessage("Subject created and selected.");
    });
  }

  async function handleCreateInlineChapter() {
    await runAction(async () => {
      const subject = await ensureSubject();
      if (!newChapterTitle.trim()) {
        throw new Error("Enter a new chapter name first.");
      }
      const chapter = await createNode("chapter", subject.id, newChapterTitle.trim(), {
        chapterCode: chapterCode.trim(),
        uniqueIdentifier: chapterUniqueId.trim() || newChapterTitle.trim(),
      });
      setSelectedChapterId(chapter.id);
      setNewChapterTitle("");
      await refreshTree();
      setMessage("Chapter created and selected.");
    });
  }

  async function handleCreateInlineSchool() {
    if (!newSchoolTitle.trim()) {
      setError("Enter a school name first.");
      return;
    }

    await runAction(async () => {
      const school = await createNode("school", null, newSchoolTitle.trim(), {});
      setSelectedSchoolId(school.id);
      setNewSchoolTitle("");
      await refreshTree();
      setMessage("School created and selected.");
    });
  }

  async function runAction(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await action();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateModule() {
    await runAction(async () => {
      if (!moduleTitle.trim()) throw new Error("Module name is required.");
      const subject = await ensureSubject();
      const chapter = await ensureChapter(subject);
      const module = await createModuleDocument(
        {
          title: moduleTitle.trim(),
          code: moduleCode.trim(),
          uniqueIdentifier: moduleUniqueId.trim(),
        },
        subject,
        chapter
      );
      await createLessonAndAssign(chapter, module, getAssignmentTags(selectedSchool, selectedYearSlug));
      router.push("/admin/materials");
    });
  }

  async function handleCreateChapter() {
    await runAction(async () => {
      if (!chapterTitle.trim()) throw new Error("Chapter name is required.");
      const subject = await ensureSubject();
      const chapter = await createNode("chapter", subject.id, chapterTitle.trim(), {
        chapterCode: chapterCode.trim(),
        uniqueIdentifier: chapterUniqueId.trim(),
        assignmentTags: getAssignmentTags(selectedSchool, selectedYearSlug),
      });

      const existingModules = modules.filter((module) => selectedModuleIds.includes(module.moduleId));
      for (const module of existingModules) {
        await createLessonAndAssign(chapter, module, getAssignmentTags(selectedSchool, selectedYearSlug));
      }

      for (const draft of newModules.filter((item) => item.title.trim())) {
        const module = await createModuleDocument(
          {
            title: draft.title.trim(),
            code: draft.code.trim(),
            uniqueIdentifier: draft.uniqueIdentifier.trim(),
          },
          subject,
          chapter
        );
        await createLessonAndAssign(chapter, module, getAssignmentTags(selectedSchool, selectedYearSlug));
      }

      setSelectedChapterId(chapter.id);
      setChapterTitle("");
      setChapterCode("");
      setChapterUniqueId("");
      setSelectedModuleIds([]);
      setNewModules([]);
      await refreshTree();
      setMessage("Chapter created with selected modules.");
    });
  }

  async function cloneChapterIntoSubject(sourceChapter: SandboxNode, subject: SandboxNode, assignmentTags: AssignmentTag[]) {
    const chapter = await createNode("chapter", subject.id, sourceChapter.title, {
      ...(sourceChapter.metadata ?? {}),
      assignmentTags,
    });

    const sourceLessons = sourceChapter.children.filter((child) => child.nodeType === "lesson");
    for (const lesson of sourceLessons) {
      const matchingModule = modules.find((module) =>
        module.assignments.some((assignment) => assignment.lessonId === lesson.id)
      );
      if (!matchingModule) {
        await createNode("lesson", chapter.id, lesson.title, {
          ...(lesson.metadata ?? {}),
          assignmentTags,
        });
        continue;
      }
      await createLessonAndAssign(chapter, matchingModule, assignmentTags);
    }
  }

  async function handleCreateCurriculum() {
    await runAction(async () => {
      if (!curriculumTitle.trim()) throw new Error("Curriculum name is required.");
      const subject = await createNode("subject", null, curriculumTitle.trim(), {
        curriculumCode: curriculumCode.trim(),
        uniqueIdentifier: curriculumUniqueId.trim(),
      });
      const assignmentTags = getAssignmentTags(selectedSchool, selectedYearSlug);

      const copiedChapters = allChapters.filter((chapter) => selectedChapterIds.includes(chapter.id));
      for (const chapter of copiedChapters) {
        await cloneChapterIntoSubject(chapter, subject, assignmentTags);
      }

      if (chapterTitle.trim()) {
        await createNode("chapter", subject.id, chapterTitle.trim(), {
          chapterCode: chapterCode.trim(),
          uniqueIdentifier: chapterUniqueId.trim(),
          assignmentTags,
        });
      }

      setSelectedSubjectId(subject.id);
      setCurriculumTitle("");
      setCurriculumCode("");
      setCurriculumUniqueId("");
      setSelectedChapterIds([]);
      setChapterTitle("");
      await refreshTree();
      setMessage("Curriculum created and stored in the database.");
    });
  }

  const toggleModule = (moduleId: string) => {
    setSelectedModuleIds((current) =>
      current.includes(moduleId) ? current.filter((id) => id !== moduleId) : [...current, moduleId]
    );
  };

  const toggleChapter = (chapterId: string) => {
    setSelectedChapterIds((current) =>
      current.includes(chapterId) ? current.filter((id) => id !== chapterId) : [...current, chapterId]
    );
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7faff_0%,#eef4ff_48%,#f9fbff_100%)] dark:bg-[linear-gradient(180deg,#020617_0%,#0f172a_52%,#020617_100%)]">
      <main className="portal-page-width px-4 pb-12 pt-5 sm:px-6 lg:px-8 lg:pb-16">
        <div className="space-y-5">
          <Button
            asChild
            variant="outline"
            className="h-11 w-fit border-[#d8cdb7] bg-white/80 px-5 text-slate-700 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.65)] backdrop-blur hover:border-[#cabb9f] hover:bg-white hover:text-slate-900"
          >
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin
            </Link>
          </Button>

          <section className="rounded-[30px] border border-white/70 bg-white/92 p-6 shadow-[0_36px_90px_-68px_rgba(37,99,235,0.58)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-[#eef4ff] text-[#2f6fff]">
                  <HeaderIcon className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{copy.eyebrow}</p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
                    {copy.title}
                  </h1>
                  <p className="mt-2 max-w-3xl text-[15px] leading-7 text-slate-500 dark:text-slate-300">
                    {copy.description}
                  </p>
                </div>
              </div>
              {mode === "curriculum" ? (
                <Button onClick={handleCreateCurriculum} disabled={busy} className="h-11 rounded-full px-5">
                  {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Create Curriculum
                </Button>
              ) : null}
              {mode === "chapter" ? (
                <Button onClick={handleCreateChapter} disabled={busy} className="h-11 rounded-full px-5">
                  {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Create Chapter
                </Button>
              ) : null}
              {mode === "module" ? (
                <Button onClick={handleCreateModule} disabled={busy} className="h-11 rounded-full px-5">
                  {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Create Module
                </Button>
              ) : null}
            </div>
          </section>

          {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
          {message ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </div>
          ) : null}

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
            <div className="space-y-5">
              {mode === "curriculum" ? (
                <Panel
                  title="Curriculum"
                  description="Name the curriculum and add reusable codes before choosing chapters."
                  icon={FolderPlus}
                >
                  <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_160px_220px]">
                    <div className="space-y-2">
                      <FieldLabel>Curriculum name</FieldLabel>
                      <Input value={curriculumTitle} onChange={(event) => setCurriculumTitle(event.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel>Code</FieldLabel>
                      <Input value={curriculumCode} onChange={(event) => setCurriculumCode(event.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel>Unique identifier</FieldLabel>
                      <Input value={curriculumUniqueId} onChange={(event) => setCurriculumUniqueId(event.target.value)} />
                    </div>
                  </div>
                </Panel>
              ) : (
                <SubjectChooser
                  subjects={subjects}
                  selectedSubjectId={selectedSubjectId}
                  setSelectedSubjectId={(id) => {
                    setSelectedSubjectId(id);
                    setSelectedChapterId("");
                  }}
                  newSubjectTitle={newSubjectTitle}
                  setNewSubjectTitle={setNewSubjectTitle}
                  newSubjectCode={newSubjectCode}
                  setNewSubjectCode={setNewSubjectCode}
                  onCreateSubject={handleCreateInlineSubject}
                  busy={busy}
                />
              )}

              {mode === "module" ? (
                <>
                  <ChapterChooser
                    chapters={subjectChapters}
                    selectedChapterId={selectedChapterId}
                    setSelectedChapterId={setSelectedChapterId}
                    newChapterTitle={newChapterTitle}
                    setNewChapterTitle={setNewChapterTitle}
                    onCreateChapter={handleCreateInlineChapter}
                    disabled={!selectedSubject && !newSubjectTitle.trim()}
                    busy={busy}
                  />
                  <Panel title="Module" description="Create a reusable module and assign it into the selected chapter." icon={NotebookTabs}>
                    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_160px_220px]">
                      <div className="space-y-2">
                        <FieldLabel>Module name</FieldLabel>
                        <Input value={moduleTitle} onChange={(event) => setModuleTitle(event.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <FieldLabel>Module code</FieldLabel>
                        <Input value={moduleCode} onChange={(event) => setModuleCode(event.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <FieldLabel>Unique identifier</FieldLabel>
                        <Input value={moduleUniqueId} onChange={(event) => setModuleUniqueId(event.target.value)} />
                      </div>
                    </div>
                    <Button onClick={handleCreateModule} disabled={busy} className="h-11 rounded-full px-5">
                      {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                      Create Module
                    </Button>
                  </Panel>
                </>
              ) : null}

              {mode === "chapter" ? (
                <>
                  <ChapterDraftPanel
                    chapterTitle={chapterTitle}
                    setChapterTitle={setChapterTitle}
                    chapterCode={chapterCode}
                    setChapterCode={setChapterCode}
                    chapterUniqueId={chapterUniqueId}
                    setChapterUniqueId={setChapterUniqueId}
                  />
                  <ModulePicker
                    modules={modules}
                    selectedModuleIds={selectedModuleIds}
                    toggleModule={toggleModule}
                    newModules={newModules}
                    setNewModules={setNewModules}
                  />
                  <Button onClick={handleCreateChapter} disabled={busy} className="h-11 rounded-full px-5">
                    {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                    Create Chapter
                  </Button>
                </>
              ) : null}

              {mode === "curriculum" ? (
                <>
                  <Panel title="Chapters" description="Copy available chapters or create a first empty chapter." icon={Layers3}>
                    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_160px_220px]">
                      <div className="space-y-2">
                        <FieldLabel>New chapter name</FieldLabel>
                        <Input value={chapterTitle} onChange={(event) => setChapterTitle(event.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <FieldLabel>Chapter code</FieldLabel>
                        <Input value={chapterCode} onChange={(event) => setChapterCode(event.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <FieldLabel>Unique identifier</FieldLabel>
                        <Input value={chapterUniqueId} onChange={(event) => setChapterUniqueId(event.target.value)} />
                      </div>
                    </div>
                    <div className="grid gap-2 md:grid-cols-2">
                      {allChapters.map((chapter) => (
                        <button
                          key={chapter.id}
                          type="button"
                          onClick={() => toggleChapter(chapter.id)}
                          className={cn(
                            "flex items-center justify-between rounded-2xl border px-3 py-3 text-left text-sm",
                            selectedChapterIds.includes(chapter.id)
                              ? "border-[#2f6fff] bg-[#f4f8ff] text-[#174ea6]"
                              : "border-slate-200 bg-white text-slate-700"
                          )}
                        >
                          <span className="truncate">{chapter.title}</span>
                          {selectedChapterIds.includes(chapter.id) ? <Check className="h-4 w-4" /> : null}
                        </button>
                      ))}
                    </div>
                  </Panel>
                  <Button onClick={handleCreateCurriculum} disabled={busy} className="h-11 rounded-full px-5">
                    {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                    Create Curriculum
                  </Button>
                </>
              ) : null}
            </div>

            <div className="space-y-5">
              <AssignmentPanel
                schools={schools}
                selectedSchoolId={selectedSchoolId}
                setSelectedSchoolId={setSelectedSchoolId}
                selectedYearSlug={selectedYearSlug}
                setSelectedYearSlug={setSelectedYearSlug}
                newSchoolTitle={newSchoolTitle}
                setNewSchoolTitle={setNewSchoolTitle}
                onCreateSchool={handleCreateInlineSchool}
                busy={busy}
              />
              <Panel title="Current Selection" description="A quick check before creating content." icon={FileClock}>
                <SummaryLine label="Curriculum" value={selectedSubject?.title || curriculumTitle || newSubjectTitle || "Not selected"} />
                <SummaryLine label="Chapter" value={selectedChapter?.title || chapterTitle || newChapterTitle || "Not selected"} />
                <SummaryLine label="School" value={selectedSchool?.title || "No school assignment"} />
                <SummaryLine label="Year" value={selectedSchool ? selectedYearSlug : "No year assignment"} />
              </Panel>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function SubjectChooser({
  subjects,
  selectedSubjectId,
  setSelectedSubjectId,
  newSubjectTitle,
  setNewSubjectTitle,
  newSubjectCode,
  setNewSubjectCode,
  onCreateSubject,
  busy,
}: {
  subjects: SandboxNode[];
  selectedSubjectId: string;
  setSelectedSubjectId: (id: string) => void;
  newSubjectTitle: string;
  setNewSubjectTitle: (value: string) => void;
  newSubjectCode: string;
  setNewSubjectCode: (value: string) => void;
  onCreateSubject: () => void;
  busy: boolean;
}) {
  return (
    <Panel title="Curriculum" description="Choose an existing curriculum or create a new subject here." icon={FolderPlus}>
      <div className="space-y-2">
        <FieldLabel>Available curriculum</FieldLabel>
        <select
          value={selectedSubjectId}
          onChange={(event) => setSelectedSubjectId(event.target.value)}
          className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
        >
          <option value="">Choose curriculum</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.title}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_140px_auto]">
        <Input value={newSubjectTitle} onChange={(event) => setNewSubjectTitle(event.target.value)} placeholder="New subject name" />
        <Input value={newSubjectCode} onChange={(event) => setNewSubjectCode(event.target.value)} placeholder="Code" />
        <Button type="button" variant="outline" onClick={onCreateSubject} disabled={busy} className="rounded-full">
          <Plus className="mr-2 h-4 w-4" />
          Add
        </Button>
      </div>
    </Panel>
  );
}

function ChapterChooser({
  chapters,
  selectedChapterId,
  setSelectedChapterId,
  newChapterTitle,
  setNewChapterTitle,
  onCreateChapter,
  disabled,
  busy,
}: {
  chapters: SandboxNode[];
  selectedChapterId: string;
  setSelectedChapterId: (id: string) => void;
  newChapterTitle: string;
  setNewChapterTitle: (value: string) => void;
  onCreateChapter: () => void;
  disabled: boolean;
  busy: boolean;
}) {
  return (
    <Panel title="Chapter" description="Choose an available chapter or create a new one before placing the module." icon={BookOpen}>
      <div className="space-y-2">
        <FieldLabel>Available chapter</FieldLabel>
        <select
          value={selectedChapterId}
          onChange={(event) => setSelectedChapterId(event.target.value)}
          disabled={disabled}
          className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm disabled:bg-slate-50"
        >
          <option value="">Choose chapter</option>
          {chapters.map((chapter) => (
            <option key={chapter.id} value={chapter.id}>
              {chapter.title}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
        <Input
          value={newChapterTitle}
          onChange={(event) => setNewChapterTitle(event.target.value)}
          placeholder="New chapter name"
          disabled={disabled}
        />
        <Button type="button" variant="outline" onClick={onCreateChapter} disabled={disabled || busy} className="rounded-full">
          <Plus className="mr-2 h-4 w-4" />
          Add
        </Button>
      </div>
    </Panel>
  );
}

function ChapterDraftPanel({
  chapterTitle,
  setChapterTitle,
  chapterCode,
  setChapterCode,
  chapterUniqueId,
  setChapterUniqueId,
}: {
  chapterTitle: string;
  setChapterTitle: (value: string) => void;
  chapterCode: string;
  setChapterCode: (value: string) => void;
  chapterUniqueId: string;
  setChapterUniqueId: (value: string) => void;
}) {
  return (
    <Panel title="Chapter Details" description="Name the chapter and set its code before adding modules." icon={Layers3}>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_160px_220px]">
        <Input value={chapterTitle} onChange={(event) => setChapterTitle(event.target.value)} placeholder="Chapter name" />
        <Input value={chapterCode} onChange={(event) => setChapterCode(event.target.value)} placeholder="Chapter code" />
        <Input value={chapterUniqueId} onChange={(event) => setChapterUniqueId(event.target.value)} placeholder="Unique identifier" />
      </div>
    </Panel>
  );
}

function ModulePicker({
  modules,
  selectedModuleIds,
  toggleModule,
  newModules,
  setNewModules,
}: {
  modules: SandboxModule[];
  selectedModuleIds: string[];
  toggleModule: (moduleId: string) => void;
  newModules: DraftModule[];
  setNewModules: (modules: DraftModule[]) => void;
}) {
  return (
    <Panel title="Modules Inside" description="Choose existing modules or add new module drafts for this chapter." icon={NotebookTabs}>
      <div className="space-y-3">
        {newModules.map((module, index) => (
          <div key={index} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_140px_180px]">
            <Input
              value={module.title}
              onChange={(event) => {
                const next = [...newModules];
                next[index] = { ...module, title: event.target.value };
                setNewModules(next);
              }}
              placeholder="New module title"
            />
            <Input
              value={module.code}
              onChange={(event) => {
                const next = [...newModules];
                next[index] = { ...module, code: event.target.value };
                setNewModules(next);
              }}
              placeholder="Code"
            />
            <Input
              value={module.uniqueIdentifier}
              onChange={(event) => {
                const next = [...newModules];
                next[index] = { ...module, uniqueIdentifier: event.target.value };
                setNewModules(next);
              }}
              placeholder="Unique ID"
            />
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => setNewModules([...newModules, { title: "", code: "", uniqueIdentifier: "" }])}
          className="rounded-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Module
        </Button>
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        {modules.slice(0, 16).map((module) => (
          <button
            key={module.moduleId}
            type="button"
            onClick={() => toggleModule(module.moduleId)}
            className={cn(
              "flex items-center justify-between rounded-2xl border px-3 py-3 text-left text-sm",
              selectedModuleIds.includes(module.moduleId)
                ? "border-[#2f6fff] bg-[#f4f8ff] text-[#174ea6]"
                : "border-slate-200 bg-white text-slate-700"
            )}
          >
            <span className="min-w-0">
              <span className="block truncate font-semibold">{module.moduleTitle}</span>
              <span className="block truncate text-xs text-slate-500">{module.moduleCode || module.uniqueIdentifier || "No code"}</span>
            </span>
            {selectedModuleIds.includes(module.moduleId) ? <Check className="h-4 w-4 shrink-0" /> : null}
          </button>
        ))}
      </div>
    </Panel>
  );
}

function AssignmentPanel({
  schools,
  selectedSchoolId,
  setSelectedSchoolId,
  selectedYearSlug,
  setSelectedYearSlug,
  newSchoolTitle,
  setNewSchoolTitle,
  onCreateSchool,
  busy,
}: {
  schools: SandboxNode[];
  selectedSchoolId: string;
  setSelectedSchoolId: (id: string) => void;
  selectedYearSlug: string;
  setSelectedYearSlug: (value: string) => void;
  newSchoolTitle: string;
  setNewSchoolTitle: (value: string) => void;
  onCreateSchool: () => void;
  busy: boolean;
}) {
  return (
    <Panel title="School Assignment" description="Choose a school and year, or leave it unassigned in the database." icon={School}>
      <div className="space-y-2">
        <FieldLabel>School</FieldLabel>
        <select
          value={selectedSchoolId}
          onChange={(event) => setSelectedSchoolId(event.target.value)}
          className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
        >
          <option value="">No school assignment</option>
          {schools.map((school) => (
            <option key={school.id} value={school.id}>
              {school.title}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <FieldLabel>Year</FieldLabel>
        <select
          value={selectedYearSlug}
          onChange={(event) => setSelectedYearSlug(event.target.value)}
          disabled={!selectedSchoolId}
          className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm disabled:bg-slate-50"
        >
          {YEAR_OPTIONS.map((year) => (
            <option key={year.slug} value={year.slug}>
              {year.title}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
        <Input value={newSchoolTitle} onChange={(event) => setNewSchoolTitle(event.target.value)} placeholder="New school name" />
        <Button type="button" variant="outline" onClick={onCreateSchool} disabled={busy} className="rounded-full">
          <Plus className="mr-2 h-4 w-4" />
          Add School
        </Button>
      </div>
    </Panel>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-2 text-sm last:border-b-0">
      <span className="font-semibold text-slate-500">{label}</span>
      <span className="min-w-0 truncate text-right text-slate-900">{value}</span>
    </div>
  );
}
