"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Dumbbell,
  DoorOpen,
  EllipsisVertical,
  FileText,
  FlaskConical,
  Globe,
  GitBranch,
  GraduationCap,
  HelpCircle,
  House,
  Lightbulb,
  LayoutGrid,
  LayoutDashboard,
  Monitor,
  Palette,
  PlayCircle,
  School,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  StickyNote,
  Users,
  Video,
} from "lucide-react";
import { SidebarNav } from "@/components/lms/sidebar-nav";
import { MaterialCard } from "@/components/lms/material-card";
import { Badge } from "@/components/ui/badge";
import { Button, cn } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Material } from "@/types/lms";

type PortalRole = "student" | "teacher" | "principal" | "admin";
type LegacyPortalRole = Exclude<PortalRole, "admin">;

interface PortalMaterialsClientProps {
  role: PortalRole;
  materials: Material[];
  lockedSchoolSlug?: string | null;
}

type CurriculumChapter = {
  id: string;
  title: string;
  slug: string;
  position: number;
  weekRange: string;
  lessonCount: number;
};

type CurriculumSubject = {
  id: string;
  title: string;
  slug: string;
  position: number;
  description: string;
  chapterCount: number;
  lessonCount: number;
  chapters: CurriculumChapter[];
};

type CurriculumYear = {
  id: string;
  title: string;
  slug: string;
  position: number;
  yearLevel: number | null;
  subjects: CurriculumSubject[];
};

type CurriculumSchool = {
  id: string;
  title: string;
  slug: string;
  position: number;
  years: CurriculumYear[];
};

type SubjectFilterKey =
  | "all"
  | "language"
  | "math-science"
  | "social-studies"
  | "arts"
  | "religion"
  | "technology";

type MaterialFilterKey = "all" | "lesson-plan" | "quiz" | "worksheet" | "slides";
type StudentSubjectFilterKey = "all" | "core" | "languages" | "arts" | "other";

const roleLabels: Record<PortalRole, string> = {
  student: "Student Portal",
  teacher: "Teacher Portal",
  principal: "Principal Portal",
  admin: "Admin Portal",
};

const subjectFilterOptions: Array<{ key: SubjectFilterKey; label: string }> = [
  { key: "all", label: "All Subjects" },
  { key: "language", label: "Language" },
  { key: "math-science", label: "Math & Science" },
  { key: "social-studies", label: "Social Studies" },
  { key: "arts", label: "The Arts" },
  { key: "religion", label: "Religion" },
  { key: "technology", label: "Technology" },
];

const materialFilterOptions: Array<{ key: MaterialFilterKey; label: string }> = [
  { key: "all", label: "All" },
  { key: "lesson-plan", label: "Lesson Plans" },
  { key: "quiz", label: "Quizzes" },
  { key: "worksheet", label: "Worksheets" },
  { key: "slides", label: "Slides" },
];

const studentSubjectFilterOptions: Array<{ key: StudentSubjectFilterKey; label: string }> = [
  { key: "all", label: "All" },
  { key: "core", label: "Core Subjects" },
  { key: "languages", label: "Languages" },
  { key: "arts", label: "Arts" },
  { key: "other", label: "Other" },
];

const studentPortalNavItems: Array<{
  title: string;
  href: string;
  icon: LucideIcon;
}> = [
  { title: "Dashboard", href: "/student", icon: LayoutDashboard },
  { title: "Materials", href: "/student/materials", icon: BookOpen },
  { title: "Learning Path", href: "/student/learning-path", icon: GitBranch },
  { title: "Quizzes", href: "/student/quizzes", icon: HelpCircle },
  { title: "Notes", href: "/student/notes", icon: StickyNote },
  { title: "Progress", href: "/student/progress", icon: BarChart3 },
  { title: "Announcements", href: "/student/announcements", icon: Sparkles },
  { title: "Calendar", href: "/student/calendar", icon: CalendarDays },
  { title: "Meeting Room", href: "/student/meeting", icon: Video },
  { title: "Book Room", href: "/student/booking", icon: DoorOpen },
];

const materialKindLabels: Record<Exclude<MaterialFilterKey, "all">, string> = {
  "lesson-plan": "Lesson Plan",
  quiz: "Quiz",
  worksheet: "Worksheet",
  slides: "Slides",
};

const materialKindChipClassNames: Record<Exclude<MaterialFilterKey, "all">, string> = {
  "lesson-plan": "border-[#dce7ff] bg-[#eef4ff] text-[#2f6fff]",
  quiz: "border-[#ffe1cf] bg-[#fff1e7] text-[#f97316]",
  worksheet: "border-[#d7f2e3] bg-[#ecfbf3] text-[#159a61]",
  slides: "border-[#eadfff] bg-[#f5efff] text-[#8b5cf6]",
};

function subjectMatches(materialSubject: string, subject: CurriculumSubject) {
  const normalizedMaterial = materialSubject.trim().toLowerCase();
  const normalizedTitle = subject.title.trim().toLowerCase();
  const normalizedSlug = subject.slug.trim().toLowerCase();
  const slugTokens = normalizedSlug.split("-").filter((token) => token.length > 1);

  if (normalizedMaterial.includes(normalizedTitle)) return true;
  if (slugTokens.some((token) => normalizedMaterial.includes(token))) return true;

  return false;
}

function dedupeYearsByTitle(years: CurriculumYear[]) {
  const seen = new Set<string>();

  return years.filter((year) => {
    const key = year.title.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function tokenize(value: string) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((token) => token.length > 2);
}

function formatMaterialDate(value: Date | string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function getSubjectCategory(subject: CurriculumSubject): SubjectFilterKey {
  const haystack = normalizeText(`${subject.title} ${subject.slug} ${subject.description}`);

  if (/(english|bahasa|language|literature|literasi|reading|writing|speaking|grammar)/.test(haystack)) {
    return "language";
  }

  if (/(science|math|mathematics|numeracy|physics|chemistry|biology|algebra|geometry|statistics)/.test(haystack)) {
    return "math-science";
  }

  if (/(social|history|geography|civics|economics|humanities)/.test(haystack)) {
    return "social-studies";
  }

  if (/(art|arts|music|creative|design|drama|painting|drawing|physical|sport|fitness|health)/.test(haystack)) {
    return "arts";
  }

  if (/(religion|christian|faith|islam|bible|church)/.test(haystack)) {
    return "religion";
  }

  if (/(technology|computer|ict|digital|coding|programming|information technology)/.test(haystack)) {
    return "technology";
  }

  return "all";
}

function getStudentSubjectCategory(subject: CurriculumSubject): StudentSubjectFilterKey {
  const haystack = normalizeText(`${subject.title} ${subject.slug} ${subject.description}`);

  if (/(english|bahasa|language|literature|grammar|reading|writing|speaking)/.test(haystack)) {
    return "languages";
  }

  if (/(art|music|creative|design|drama|painting|drawing)/.test(haystack)) {
    return "arts";
  }

  if (/(science|math|mathematics|numeracy|social|history|geography|civics|religion|christian|faith|technology|computer|ict|digital|coding|programming)/.test(haystack)) {
    return "core";
  }

  return "other";
}

function getSubjectVisual(subject: CurriculumSubject): {
  icon: LucideIcon;
  iconClassName: string;
} {
  const haystack = normalizeText(`${subject.title} ${subject.slug} ${subject.description}`);

  if (/(science|physics|chemistry|biology)/.test(haystack)) {
    return {
      icon: FlaskConical,
      iconClassName: "bg-[#eef4ff] text-[#2f6fff]",
    };
  }

  if (/(english|bahasa|language|literature|grammar|reading|writing)/.test(haystack)) {
    return {
      icon: BookOpen,
      iconClassName: "bg-[#eef4ff] text-[#2f6fff]",
    };
  }

  if (/(math|mathematics|numeracy|algebra|geometry|statistics)/.test(haystack)) {
    return {
      icon: LayoutGrid,
      iconClassName: "bg-[#edf9f3] text-[#13a164]",
    };
  }

  if (/(religion|christian|faith|islam|bible|church)/.test(haystack)) {
    return {
      icon: Sparkles,
      iconClassName: "bg-[#f5efff] text-[#8b5cf6]",
    };
  }

  if (/(technology|computer|ict|digital|coding|programming|information technology)/.test(haystack)) {
    return {
      icon: Monitor,
      iconClassName: "bg-[#eef4ff] text-[#2f6fff]",
    };
  }

  if (/(social|history|geography|civics|economics|humanities)/.test(haystack)) {
    return {
      icon: Globe,
      iconClassName: "bg-[#fff4e8] text-[#f97316]",
    };
  }

  if (/(art|music|creative|design|drama|painting|drawing)/.test(haystack)) {
    return {
      icon: Palette,
      iconClassName: "bg-[#f5efff] text-[#8b5cf6]",
    };
  }

  if (/(physical|sport|fitness|health)/.test(haystack)) {
    return {
      icon: Dumbbell,
      iconClassName: "bg-[#eef4ff] text-[#2f6fff]",
    };
  }

  return {
    icon: BookOpen,
    iconClassName: "bg-[#eef4ff] text-[#2f6fff]",
  };
}

function getMaterialKind(material: Material): Exclude<MaterialFilterKey, "all"> {
  const haystack = normalizeText(`${material.title} ${material.description} ${material.subject}`);

  if (/(quiz|assessment|test|exam)/.test(haystack)) {
    return "quiz";
  }

  if (/(worksheet|practice pack|passage|exercise|comprehension)/.test(haystack)) {
    return "worksheet";
  }

  if (/(slides|slide deck|presentation|powerpoint)/.test(haystack)) {
    return "slides";
  }

  return "lesson-plan";
}

function getSubjectSummary(subject: CurriculumSubject) {
  const description = subject.description.trim();

  if (description) return description;

  return `${subject.chapterCount} chapters and ${subject.lessonCount} lessons.`;
}

function getChapterScore(material: Material, chapter: CurriculumChapter) {
  const chapterTokens = new Set([...tokenize(chapter.title), ...tokenize(chapter.slug)]);
  const materialTokens = new Set([
    ...tokenize(material.title),
    ...tokenize(material.description),
    ...tokenize(material.subject),
  ]);
  const materialText = normalizeText(`${material.title} ${material.description}`);
  const chapterTitle = normalizeText(chapter.title);

  let score = 0;

  if (chapterTitle && materialText.includes(chapterTitle)) {
    score += 6;
  }

  chapterTokens.forEach((token) => {
    if (materialTokens.has(token)) {
      score += token.length >= 7 ? 3 : 1;
    }
  });

  return score;
}

function inferRelatedChapter(material: Material, chapters: CurriculumChapter[]) {
  if (chapters.length === 0) return null;

  let bestChapter = chapters[0];
  let bestScore = -1;

  for (const chapter of chapters) {
    const score = getChapterScore(material, chapter);

    if (score > bestScore) {
      bestScore = score;
      bestChapter = chapter;
    }
  }

  return bestChapter;
}

function getStudentMaterialTypePresentation(material: Material) {
  const haystack = normalizeText(`${material.title} ${material.description} ${material.subject}`);

  if (/(worksheet|practice pack|passage|exercise|comprehension)/.test(haystack)) {
    return {
      label: "Worksheet",
      className: "border-[#d7f2e3] bg-[#ecfbf3] text-[#159a61]",
    };
  }

  if (/(lab guide|lab|experiment)/.test(haystack)) {
    return {
      label: "Lab Guide",
      className: "border-[#e3d8ff] bg-[#f3edff] text-[#7c3aed]",
    };
  }

  if (/(slides|slide deck|presentation|powerpoint)/.test(haystack)) {
    return {
      label: "Presentation",
      className: "border-[#e3d8ff] bg-[#f3edff] text-[#7c3aed]",
    };
  }

  if (/(note|notes|summary)/.test(haystack)) {
    return {
      label: "Notes",
      className: "border-[#ffe6ba] bg-[#fff5dd] text-[#d97706]",
    };
  }

  if (/(quiz|assessment|test|exam)/.test(haystack)) {
    return {
      label: "Quiz",
      className: "border-[#ffe1cf] bg-[#fff1e7] text-[#f97316]",
    };
  }

  if (material.type === "pdf") {
    return {
      label: "PDF",
      className: "border-[#ffd7db] bg-[#fff0f2] text-[#e11d48]",
    };
  }

  return {
    label: "Lesson Plan",
    className: "border-[#dce7ff] bg-[#eef4ff] text-[#2f6fff]",
  };
}

function MaterialsHeroArtwork() {
  return (
    <div className="relative hidden h-[132px] lg:block" aria-hidden="true">
      <div className="absolute bottom-5 left-5 h-8 w-40 rounded-full bg-[#dbe7ff]/85 blur-xl" />
      <div className="absolute left-12 top-3 h-[4.6rem] w-[4.6rem] rounded-[24px] border border-[#dce6ff] bg-[linear-gradient(180deg,rgba(235,242,255,0.95),rgba(248,250,255,0.98))] shadow-[0_20px_40px_-30px_rgba(37,99,235,0.72)]" />
      <div className="absolute left-3 top-10 h-11 w-[5.8rem] rounded-[18px] border border-[#dce6ff] bg-[linear-gradient(180deg,rgba(231,239,255,0.98),rgba(248,250,255,0.98))] shadow-[0_20px_40px_-32px_rgba(37,99,235,0.65)]" />
      <div className="absolute left-0 top-[4.6rem] h-8 w-[5.1rem] rounded-[14px] border border-[#dce6ff] bg-[linear-gradient(180deg,rgba(225,235,255,0.98),rgba(246,249,255,0.98))] shadow-[0_16px_32px_-28px_rgba(37,99,235,0.6)]" />
      <div className="absolute right-8 top-5 h-[5.3rem] w-[8.8rem] rounded-[26px] border border-[#dce6ff] bg-[linear-gradient(180deg,rgba(225,235,255,0.92),rgba(247,249,255,0.98))] shadow-[0_24px_48px_-34px_rgba(37,99,235,0.72)]">
        <div className="flex items-center gap-1.5 border-b border-[#e2ebff] px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#c6d7ff]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#d3e0ff]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#dfe8ff]" />
        </div>
        <div className="space-y-2.5 px-4 py-4">
          <div className="h-3 rounded-full bg-[#d5e2ff]" />
          <div className="h-3 w-4/5 rounded-full bg-[#e4ecff]" />
          <div className="h-3 w-2/3 rounded-full bg-[#edf2ff]" />
        </div>
      </div>
      <div className="absolute bottom-4 right-0 h-12 w-12 rounded-[999px_999px_0_999px] bg-[linear-gradient(180deg,rgba(187,225,235,0.92),rgba(255,255,255,0))]" />
      <div className="absolute bottom-[3.4rem] right-[1.45rem] h-10 w-4 rounded-full bg-[#a9d7d4]" />
      <div className="absolute bottom-[3.7rem] right-[0.4rem] h-8 w-7 rounded-[16px_16px_0_16px] bg-[#6fd2aa]" />
      <div className="absolute bottom-[4.8rem] right-[0.75rem] h-5 w-5 rounded-full bg-[#cdeee1]" />
    </div>
  );
}

function AdminMaterialsExperience({
  role,
  outlineLoading,
  outlineError,
  schools,
  selectedSchoolSlug,
  selectedYearSlug,
  selectedSubjectSlug,
  setSelectedSchoolSlug,
  setSelectedYearSlug,
  setSelectedSubjectSlug,
  selectedSchool,
  selectedYear,
  selectedSubject,
  years,
  subjects,
  selectedSubjectMaterials,
  subjectMaterialCounts,
}: {
  role: PortalRole;
  outlineLoading: boolean;
  outlineError: string;
  schools: CurriculumSchool[];
  selectedSchoolSlug: string;
  selectedYearSlug: string;
  selectedSubjectSlug: string;
  setSelectedSchoolSlug: (value: string) => void;
  setSelectedYearSlug: (value: string) => void;
  setSelectedSubjectSlug: (value: string) => void;
  selectedSchool: CurriculumSchool | null;
  selectedYear: CurriculumYear | null;
  selectedSubject: CurriculumSubject | null;
  years: CurriculumYear[];
  subjects: CurriculumSubject[];
  selectedSubjectMaterials: Material[];
  subjectMaterialCounts: Record<string, number>;
}) {
  const [materialSearchQuery, setMaterialSearchQuery] = useState("");
  const [materialFilter, setMaterialFilter] = useState<MaterialFilterKey>("all");
  const [chapterSearchQuery, setChapterSearchQuery] = useState("");
  const [selectedChapterSlug, setSelectedChapterSlug] = useState("");
  const [pickerPanel, setPickerPanel] = useState<"school" | "year" | "subject" | null>(null);

  useEffect(() => {
    setMaterialSearchQuery("");
    setMaterialFilter("all");
    setChapterSearchQuery("");
    setPickerPanel(null);
  }, [selectedSchoolSlug, selectedYearSlug]);

  useEffect(() => {
    setMaterialSearchQuery("");
    setMaterialFilter("all");
    setChapterSearchQuery("");
  }, [selectedSubjectSlug]);

  useEffect(() => {
    if (!selectedSubject?.chapters.length) {
      setSelectedChapterSlug("");
      return;
    }

    if (!selectedChapterSlug || !selectedSubject.chapters.some((chapter) => chapter.slug === selectedChapterSlug)) {
      setSelectedChapterSlug(selectedSubject.chapters[0]?.slug ?? "");
    }
  }, [selectedChapterSlug, selectedSubject]);

  const selectedChapter = useMemo(
    () => selectedSubject?.chapters.find((chapter) => chapter.slug === selectedChapterSlug) ?? null,
    [selectedChapterSlug, selectedSubject]
  );

  const filteredAdminMaterials = useMemo(() => {
    const query = normalizeText(materialSearchQuery);

    return [...selectedSubjectMaterials]
      .filter((material) => {
        const matchesFilter = materialFilter === "all" || getMaterialKind(material) === materialFilter;
        const matchesQuery =
          !query ||
          normalizeText(`${material.title} ${material.description} ${material.subject}`).includes(query);

        return matchesFilter && matchesQuery;
      })
      .sort((left, right) => {
        return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
      });
  }, [materialFilter, materialSearchQuery, selectedSubjectMaterials]);

  const materialRows = useMemo(() => {
    return filteredAdminMaterials.map((material) => ({
      material,
      kind: getMaterialKind(material),
      relatedChapter: inferRelatedChapter(material, selectedSubject?.chapters ?? []),
    }));
  }, [filteredAdminMaterials, selectedSubject]);

  const filteredChapters = useMemo(() => {
    const query = normalizeText(chapterSearchQuery);
    const chapters = selectedSubject?.chapters ?? [];

    if (!query) return chapters;

    return chapters.filter((chapter) =>
      normalizeText(`${chapter.title} ${chapter.slug} ${chapter.weekRange}`).includes(query)
    );
  }, [chapterSearchQuery, selectedSubject]);

  const selectedChapterMaterialRows = useMemo(() => {
    if (!selectedChapter) return [];
    return materialRows.filter(({ relatedChapter }) => relatedChapter?.id === selectedChapter.id);
  }, [materialRows, selectedChapter]);

  const hasSchools = schools.length > 0;
  const hasYears = years.length > 0;
  const hasSubjects = subjects.length > 0;
  const chapterHref =
    selectedSchool && selectedYear && selectedSubject && selectedChapter
      ? `/${role}/materials/curriculum/${selectedSchool.slug}/${selectedYear.slug}/${selectedSubject.slug}/${selectedChapter.slug}`
      : null;
  const adminSidebarItems = [
    { label: "Dashboard", href: "/admin", icon: House },
    { label: "Classes", href: "/teacher", icon: GraduationCap },
    { label: "Students", href: "/teacher/students", icon: Users },
    { label: "Learning Materials", href: "/admin/materials", icon: BookOpen, active: true },
    { label: "Assignments", href: "/student/quizzes", icon: ClipboardList },
    { label: "Reports", href: "/principal", icon: BarChart3 },
    { label: "Settings", href: "/admin/access", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#f4f8ff_48%,#fbfdff_100%)] dark:bg-[linear-gradient(180deg,#020617_0%,#0f172a_55%,#020617_100%)]">
      <div className="portal-page-width flex min-h-screen">
        <aside className="hidden w-[240px] shrink-0 border-r border-[#e1eaf6] bg-white/88 px-5 py-6 backdrop-blur xl:flex xl:flex-col dark:border-slate-800 dark:bg-slate-900/88">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#2f6fff]">
              <BookOpen className="h-5 w-5" />
            </div>
            <p className="text-lg font-bold tracking-tight text-slate-950 dark:text-slate-50">EDUTINDO</p>
          </div>

          <nav className="mt-8 space-y-1.5">
            {adminSidebarItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition-colors",
                    item.active
                      ? "bg-[#eef4ff] text-[#2f6fff]"
                      : "text-slate-500 hover:bg-[#f7faff] hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-4">
            <div className="rounded-[22px] border border-[#dce7ff] bg-[#fbfdff] p-4 dark:border-slate-700 dark:bg-slate-950">
              <div className="flex items-center gap-2 text-sm font-bold text-[#2f6fff]">
                <Lightbulb className="h-4 w-4" />
                How to use this page
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-300">
                Choose a chapter on the left to explore its materials and resources.
              </p>
              <button className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#2f6fff]">
                View quick guide
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-300">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef4ff] text-[#2f6fff]">
                <HelpCircle className="h-4 w-4" />
              </span>
              <div>
                <p className="font-semibold text-slate-700 dark:text-slate-100">Need help?</p>
                <p className="text-xs">Visit our Help Center</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <div className="space-y-4">
            <section className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/88 p-6 shadow-[0_30px_80px_-58px_rgba(37,99,235,0.38)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/82">
              <div className="absolute inset-y-0 right-0 hidden w-[32rem] bg-[radial-gradient(circle_at_center,rgba(147,197,253,0.2),transparent_68%)] lg:block" />
              <div className="relative grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-center">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-50 sm:text-[2.35rem]">
                    Learning Materials
                  </h1>
                  <p className="mt-3 text-[15px] leading-7 text-slate-500 dark:text-slate-300">
                    Browse curriculum-aligned materials by school, year, subject, and chapter.
                  </p>
                </div>
                <MaterialsHeroArtwork />
              </div>
            </section>

            <section className="rounded-[24px] border border-white/70 bg-white/90 px-5 py-4 shadow-[0_24px_60px_-52px_rgba(15,23,42,0.3)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/82">
              <div className="grid gap-4 xl:grid-cols-4">
                {[
                  { step: 1, title: "Select School", hint: selectedSchool?.title ?? "Choose school", done: Boolean(selectedSchool) },
                  { step: 2, title: "Select Year", hint: selectedYear?.title ?? "Choose year", done: Boolean(selectedYear) },
                  { step: 3, title: "Select Subject", hint: selectedSubject?.title ?? "Choose subject", done: Boolean(selectedSubject) },
                  { step: 4, title: "Explore Chapters & Materials", hint: "", done: false },
                ].map((item, index) => (
                  <div key={item.step} className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold",
                        item.done
                          ? "border-[#87d38b] bg-[#f3fff4] text-[#2e9b3d]"
                          : index === 3
                            ? "border-[#2f6fff] bg-[#2f6fff] text-white"
                            : "border-[#dfe7f5] bg-white text-slate-400 dark:bg-slate-950"
                      )}
                    >
                      {item.done ? <Check className="h-4 w-4" /> : item.step}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-50">{item.title}</p>
                        {index < 3 && <div className="hidden h-px flex-1 bg-[#d8e4f7] xl:block" />}
                      </div>
                      {item.hint ? <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-300">{item.hint}</p> : null}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {outlineLoading ? (
              <Card className="border-white/80 bg-white/88 shadow-[0_28px_70px_-58px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-900/80">
                <CardContent className="p-6 text-sm text-slate-500 dark:text-slate-300">
                  Loading curriculum outline...
                </CardContent>
              </Card>
            ) : outlineError ? (
              <Card className="border-red-100 bg-white/88 shadow-[0_28px_70px_-58px_rgba(15,23,42,0.45)] dark:border-red-900/50 dark:bg-slate-900/80">
                <CardContent className="p-6 text-sm text-red-600 dark:text-red-300">
                  {outlineError}
                </CardContent>
              </Card>
            ) : !hasSchools ? (
              <Card className="border-white/80 bg-white/88 shadow-[0_28px_70px_-58px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-900/80">
                <CardContent className="p-6 text-sm text-slate-500 dark:text-slate-300">
                  No curriculum found yet. Create a school, then add years, subjects, chapters, and lessons in Curriculum Portal.
                </CardContent>
              </Card>
            ) : (
              <>
                <section className="rounded-[24px] border border-white/70 bg-white/90 p-4 shadow-[0_24px_60px_-52px_rgba(15,23,42,0.3)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/82">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
                    <span>Home</span>
                    <ChevronRight className="h-4 w-4" />
                    <span>Learning Materials</span>
                    <ChevronRight className="h-4 w-4" />
                    <span>{selectedSubject?.title ?? "Subject"}</span>
                    <ChevronRight className="h-4 w-4" />
                    <span className="font-semibold text-slate-700 dark:text-slate-100">Chapters</span>
                  </div>

                  <div className="mt-4 grid gap-3 xl:grid-cols-4">
                    {[
                      {
                        key: "school" as const,
                        label: "Selected School",
                        value: selectedSchool?.title ?? "Choose school",
                        icon: School,
                        disabled: schools.length <= 1,
                      },
                      {
                        key: "year" as const,
                        label: "Selected Year",
                        value: selectedYear?.title ?? "Choose year",
                        icon: CalendarDays,
                        disabled: years.length <= 1,
                      },
                      {
                        key: "subject" as const,
                        label: "Selected Subject",
                        value: selectedSubject?.title ?? "Choose subject",
                        icon: FlaskConical,
                        disabled: subjects.length <= 1,
                      },
                    ].map((item) => {
                      const Icon = item.icon;

                      return (
                        <div key={item.key} className="rounded-[22px] border border-[#e3ebf7] bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#2f6fff]">
                                <Icon className="h-5 w-5" />
                              </span>
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-slate-500">{item.label}</p>
                                <p className="truncate text-sm font-bold text-slate-950 dark:text-slate-50">{item.value}</p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => setPickerPanel((current) => (current === item.key ? null : item.key))}
                              className="h-9 px-2 text-xs font-semibold text-[#2f6fff]"
                              disabled={item.disabled}
                            >
                              Change
                            </Button>
                          </div>
                        </div>
                      );
                    })}

                    <div className="rounded-[22px] border border-[#e3ebf7] bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fff6ef] text-[#f97316]">
                            <BookOpen className="h-5 w-5" />
                          </span>
                          <div>
                            <p className="text-xs font-medium text-slate-500">{selectedSubject?.title ?? "Subject"} Overview</p>
                            <p className="text-sm font-bold text-slate-950 dark:text-slate-50">
                              {selectedSubject?.chapterCount ?? 0} chapters · {selectedSubject?.lessonCount ?? 0} lessons
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  {pickerPanel && (
                    <div className="mt-4 rounded-[22px] border border-dashed border-[#d9e4f7] bg-[#f8fbff] px-4 py-4 dark:border-slate-700 dark:bg-slate-900/60">
                      <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                        Choose {pickerPanel}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(pickerPanel === "school"
                          ? schools
                          : pickerPanel === "year"
                            ? years
                            : subjects
                        ).map((item) => (
                          <Button
                            key={item.id}
                            type="button"
                            variant="outline"
                            onClick={() => {
                              if (pickerPanel === "school") setSelectedSchoolSlug(item.slug);
                              if (pickerPanel === "year") setSelectedYearSlug(item.slug);
                              if (pickerPanel === "subject") setSelectedSubjectSlug(item.slug);
                              setPickerPanel(null);
                            }}
                            className={cn(
                              "h-10 rounded-full px-4",
                              item.slug ===
                                (pickerPanel === "school"
                                  ? selectedSchoolSlug
                                  : pickerPanel === "year"
                                    ? selectedYearSlug
                                    : selectedSubjectSlug)
                                ? "border-[#2f6fff] bg-[#2f6fff] text-white"
                                : "border-[#d9e1ef] bg-white text-slate-700 shadow-none hover:border-[#c6d4f3] hover:bg-[#f7faff] hover:text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                            )}
                          >
                            {item.title}
                          </Button>
                        ))}
                        {pickerPanel === "year" && !hasYears && (
                          <p className="text-sm text-slate-500 dark:text-slate-300">No years configured for this school yet.</p>
                        )}
                        {pickerPanel === "subject" && !hasSubjects && (
                          <p className="text-sm text-slate-500 dark:text-slate-300">No subjects configured for this year yet.</p>
                        )}
                      </div>
                    </div>
                  )}
                </section>

                <section className="grid gap-4 xl:grid-cols-[390px_minmax(0,1fr)]">
                  <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_24px_60px_-52px_rgba(15,23,42,0.3)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/82">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-xl font-bold text-slate-950 dark:text-slate-50">Chapters</h2>
                      <div className="flex gap-2">
                        <span className="rounded-full border border-[#ffe1cf] bg-[#fff6ef] px-3 py-1 text-xs font-semibold text-[#f97316]">
                          {selectedSubject?.chapterCount ?? 0} chapters
                        </span>
                        <span className="rounded-full border border-[#ffe1cf] bg-[#fff6ef] px-3 py-1 text-xs font-semibold text-[#f97316]">
                          {selectedSubject?.lessonCount ?? 0} lessons
                        </span>
                      </div>
                    </div>

                    <div className="relative mt-4">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        value={chapterSearchQuery}
                        onChange={(event) => setChapterSearchQuery(event.target.value)}
                        placeholder="Search chapters..."
                        className="h-11 rounded-full border-[#d9e1ef] bg-white pl-10 shadow-none dark:border-slate-700 dark:bg-slate-950"
                      />
                    </div>

                    <div className="mt-4 max-h-[470px] space-y-2 overflow-y-auto pr-1">
                      {filteredChapters.length > 0 ? (
                        filteredChapters.map((chapter, index) => {
                          const active = chapter.slug === selectedChapterSlug;

                          return (
                            <button
                              key={chapter.id}
                              type="button"
                              onClick={() => setSelectedChapterSlug(chapter.slug)}
                              className={cn(
                                "flex w-full items-center justify-between rounded-[18px] border px-4 py-3 text-left transition-colors",
                                active
                                  ? "border-[#2f6fff] bg-[#f4f8ff]"
                                  : "border-[#e7edf7] bg-white hover:border-[#c6d4f3] hover:bg-[#fbfdff] dark:border-slate-800 dark:bg-slate-950"
                              )}
                            >
                              <span className="flex min-w-0 items-center gap-3">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f5f8fd] text-sm font-bold text-slate-600">
                                  {index + 1}
                                </span>
                                <span className="min-w-0">
                                  <span className="block truncate text-sm font-bold text-slate-950 dark:text-slate-50">{chapter.title}</span>
                                  <span className="mt-1 block text-xs text-slate-500 dark:text-slate-300">
                                    {chapter.weekRange || "Weeks not set"} · {chapter.lessonCount} lessons
                                  </span>
                                </span>
                              </span>
                              <ChevronRight className="h-4 w-4 shrink-0 text-[#2f6fff]" />
                            </button>
                          );
                        })
                      ) : (
                        <div className="rounded-[18px] border border-dashed border-[#d9e4f7] p-5 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-300">
                          No chapters found.
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setChapterSearchQuery("")}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 text-sm font-semibold text-[#2f6fff]"
                    >
                      View all chapters ({selectedSubject?.chapterCount ?? 0})
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_24px_60px_-52px_rgba(15,23,42,0.3)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/82">
                    {selectedChapter ? (
                      <>
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <span className="inline-flex rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#2f6fff]">
                              Chapter {(selectedSubject?.chapters.findIndex((chapter) => chapter.id === selectedChapter.id) ?? -1) + 1}
                            </span>
                            <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-950 dark:text-slate-50">
                              {selectedChapter.title}
                            </h2>
                            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-300">
                              <span>{selectedChapter.weekRange || "Weeks not set"}</span>
                              <span>·</span>
                              <span>{selectedChapter.lessonCount} lessons</span>
                              <span className="hidden lg:inline">|</span>
                              <span className="max-w-xl">
                                {selectedSubject ? getSubjectSummary(selectedSubject) : ""}
                              </span>
                            </div>
                          </div>
                          {chapterHref ? (
                            <Button
                              asChild
                              className="h-12 rounded-2xl bg-[linear-gradient(135deg,#2f6fff_0%,#1d4ed8_100%)] px-5 text-white shadow-[0_20px_40px_-24px_rgba(37,99,235,0.92)] hover:brightness-105"
                            >
                              <Link href={chapterHref}>
                                <PlayCircle className="mr-2 h-4 w-4" />
                                Start with this chapter
                              </Link>
                            </Button>
                          ) : null}
                        </div>

                        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex flex-wrap gap-2">
                            {materialFilterOptions.map((option) => {
                              const active = materialFilter === option.key;

                              return (
                                <Button
                                  key={option.key}
                                  type="button"
                                  variant="outline"
                                  onClick={() => setMaterialFilter(option.key)}
                                  className={cn(
                                    "h-10 rounded-full px-4 text-sm shadow-none",
                                    active
                                      ? "border-[#2f6fff] bg-[#2f6fff] text-white hover:bg-[#2f6fff]"
                                      : "border-[#d9e1ef] bg-white text-slate-600 hover:border-[#c6d4f3] hover:bg-[#f7faff] hover:text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                                  )}
                                >
                                  {option.label}
                                </Button>
                              );
                            })}
                          </div>
                          <div className="relative w-full lg:max-w-[21rem]">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                              value={materialSearchQuery}
                              onChange={(event) => setMaterialSearchQuery(event.target.value)}
                              placeholder="Search materials in this chapter..."
                              className="h-11 rounded-full border-[#d9e1ef] bg-white pl-10 shadow-none dark:border-slate-700 dark:bg-slate-950"
                            />
                          </div>
                        </div>

                        {selectedChapterMaterialRows.length > 0 ? (
                          <div className="mt-4 overflow-hidden rounded-[22px] border border-[#e4ebf7] dark:border-slate-800">
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-left">
                                <thead className="border-b border-[#e8eef8] bg-[#fbfcff] dark:border-slate-800 dark:bg-slate-900/70">
                                  <tr className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                                    <th className="px-5 py-4">Material</th>
                                    <th className="px-4 py-4">Type</th>
                                    <th className="px-4 py-4">Updated</th>
                                    <th className="px-4 py-4">Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {selectedChapterMaterialRows.map(({ material, kind }) => (
                                    <tr key={material.id} className="border-b border-[#eef2f8] last:border-b-0 dark:border-slate-800">
                                      <td className="px-5 py-4">
                                        <div className="flex items-start gap-3">
                                          <span
                                            className={cn(
                                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px]",
                                              kind === "lesson-plan" && "bg-[#eef4ff] text-[#2f6fff]",
                                              kind === "worksheet" && "bg-[#ecfbf3] text-[#159a61]",
                                              kind === "quiz" && "bg-[#fff1e7] text-[#f97316]",
                                              kind === "slides" && "bg-[#f5efff] text-[#8b5cf6]"
                                            )}
                                          >
                                            <FileText className="h-5 w-5" />
                                          </span>
                                          <span>
                                            <span className="block text-sm font-bold text-slate-950 dark:text-slate-50">
                                              {material.title}
                                            </span>
                                            <span className="mt-1 block text-xs text-slate-500 dark:text-slate-300">
                                              {material.description}
                                            </span>
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-4 py-4">
                                        <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold", materialKindChipClassNames[kind])}>
                                          {materialKindLabels[kind]}
                                        </span>
                                      </td>
                                      <td className="px-4 py-4 text-sm text-slate-500 dark:text-slate-300">
                                        {formatMaterialDate(material.updatedAt)}
                                      </td>
                                      <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                          <Button
                                            asChild
                                            variant="outline"
                                            className="h-9 rounded-full border-[#d9e1ef] bg-white px-4 text-sm font-semibold text-[#2f6fff] shadow-none hover:border-[#c6d4f3] hover:bg-[#f7faff] dark:border-slate-700 dark:bg-slate-950"
                                          >
                                            <Link href={`/${role}/materials/${material.id}`}>Open</Link>
                                          </Button>
                                          <button
                                            type="button"
                                            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-[#f3f7ff] hover:text-slate-700"
                                            aria-label={`More actions for ${material.title}`}
                                          >
                                            <EllipsisVertical className="h-4 w-4" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <div className="flex flex-col gap-3 border-t border-[#e8eef8] px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
                              <p className="text-slate-500 dark:text-slate-300">
                                Showing {selectedChapterMaterialRows.length} of {selectedChapterMaterialRows.length} materials
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  setMaterialFilter("all");
                                  setMaterialSearchQuery("");
                                }}
                                className="inline-flex items-center gap-2 font-semibold text-[#2f6fff]"
                              >
                                View all materials in this chapter
                                <ArrowRight className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4 rounded-[22px] border border-dashed border-[#d9e4f7] bg-[#f8fbff] p-8 text-center dark:border-slate-700 dark:bg-slate-900/60">
                            <p className="font-medium text-slate-900 dark:text-slate-50">No materials found in this chapter</p>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                              Try another chapter, filter, or search keyword.
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex min-h-[420px] items-center justify-center rounded-[22px] border border-dashed border-[#d9e4f7] bg-[#f8fbff] p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
                        Select a chapter to view its materials.
                      </div>
                    )}
                  </div>
                </section>

                <section className="flex flex-col gap-3 rounded-[24px] border border-[#dce7ff] bg-[#f8fbff] px-5 py-4 text-sm text-[#2451a6] shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900/82 dark:text-blue-200">
                  <span className="inline-flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#2f6fff]">
                      <Lightbulb className="h-4 w-4" />
                    </span>
                    <span>
                      <strong className="mr-2">Tip:</strong>
                      Explore other chapters in the list to find more materials aligned to your curriculum.
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setChapterSearchQuery("")}
                    className="inline-flex items-center gap-2 font-semibold text-[#2f6fff]"
                  >
                    Browse all {selectedSubject?.chapterCount ?? 0} chapters
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </section>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function StudentSidebarPromo() {
  return (
    <div className="rounded-[26px] border border-[#e4ebf7] bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] p-5 shadow-[0_24px_48px_-42px_rgba(15,23,42,0.35)]">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] bg-[radial-gradient(circle_at_top,rgba(255,228,179,0.8),rgba(255,255,255,0.96)_55%),linear-gradient(180deg,#eef4ff_0%,#ffffff_100%)] shadow-[0_24px_48px_-34px_rgba(37,99,235,0.28)]">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#eef4ff] text-[#2f6fff]">
          <BookOpen className="h-7 w-7" />
          <Sparkles className="absolute -right-1 -top-1 h-4 w-4 text-[#ff9b3d]" />
        </div>
      </div>
      <p className="mt-4 text-center text-[15px] font-semibold text-slate-900">Keep learning, keep growing!</p>
      <p className="mt-1 text-center text-sm leading-6 text-slate-500">You&apos;ve got this.</p>
    </div>
  );
}

function StudentMaterialsExperience({
  outlineLoading,
  outlineError,
  schools,
  selectedSchoolSlug,
  selectedYearSlug,
  selectedSubjectSlug,
  setSelectedSchoolSlug,
  setSelectedYearSlug,
  setSelectedSubjectSlug,
  selectedSchool,
  selectedYear,
  selectedSubject,
  years,
  subjects,
  selectedSubjectMaterials,
  subjectMaterialCounts,
}: {
  outlineLoading: boolean;
  outlineError: string;
  schools: CurriculumSchool[];
  selectedSchoolSlug: string;
  selectedYearSlug: string;
  selectedSubjectSlug: string;
  setSelectedSchoolSlug: (value: string) => void;
  setSelectedYearSlug: (value: string) => void;
  setSelectedSubjectSlug: (value: string) => void;
  selectedSchool: CurriculumSchool | null;
  selectedYear: CurriculumYear | null;
  selectedSubject: CurriculumSubject | null;
  years: CurriculumYear[];
  subjects: CurriculumSubject[];
  selectedSubjectMaterials: Material[];
  subjectMaterialCounts: Record<string, number>;
}) {
  const pathname = usePathname();
  const [subjectSearchQuery, setSubjectSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<StudentSubjectFilterKey>("all");
  const [materialSearchQuery, setMaterialSearchQuery] = useState("");

  useEffect(() => {
    setSubjectSearchQuery("");
    setSubjectFilter("all");
    setMaterialSearchQuery("");
  }, [selectedSchoolSlug, selectedYearSlug]);

  useEffect(() => {
    setMaterialSearchQuery("");
  }, [selectedSubjectSlug]);

  const filteredSubjects = useMemo(() => {
    const query = normalizeText(subjectSearchQuery);

    return subjects.filter((subject) => {
      const matchesFilter =
        subjectFilter === "all" || getStudentSubjectCategory(subject) === subjectFilter;
      const matchesQuery =
        !query ||
        normalizeText(`${subject.title} ${subject.description} ${subject.slug}`).includes(query);

      return matchesFilter && matchesQuery;
    });
  }, [subjectFilter, subjectSearchQuery, subjects]);

  const displayedSubjects = useMemo(() => {
    if (!selectedSubject) return filteredSubjects;

    const items = [...filteredSubjects];
    if (!items.some((subject) => subject.id === selectedSubject.id)) {
      items.unshift(selectedSubject);
    }

    return items.filter(
      (subject, index, collection) => collection.findIndex((entry) => entry.id === subject.id) === index
    );
  }, [filteredSubjects, selectedSubject]);

  const materialRows = useMemo(() => {
    const query = normalizeText(materialSearchQuery);

    return [...selectedSubjectMaterials]
      .filter((material) => {
        if (!query) return true;

        return normalizeText(`${material.title} ${material.description} ${material.subject}`).includes(query);
      })
      .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
      .map((material) => ({
        material,
        typePresentation: getStudentMaterialTypePresentation(material),
        relatedChapter: inferRelatedChapter(material, selectedSubject?.chapters ?? []),
      }));
  }, [materialSearchQuery, selectedSubject, selectedSubjectMaterials]);

  const schoolOptionsVisible = schools.length > 1;
  const yearOptionsVisible = years.length > 1;

  return (
    <div className="bg-[linear-gradient(180deg,#f8fbff_0%,#eef4ff_40%,#f9fbff_100%)] dark:bg-[linear-gradient(180deg,#020617_0%,#0f172a_55%,#020617_100%)]">
      <div className="portal-page-width flex gap-6 px-4 pb-12 pt-5 sm:px-6 lg:px-8 lg:pb-24">
        <aside className="sticky top-[5.25rem] hidden max-h-[calc(100vh-6.5rem)] w-[240px] shrink-0 flex-col gap-8 self-start overflow-y-auto rounded-[30px] border border-white/70 bg-white/88 p-5 shadow-[0_30px_80px_-58px_rgba(15,23,42,0.36)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/82 lg:flex">
          <div className="space-y-6">
            <div className="px-2">
              <h2 className="text-[1.5rem] font-semibold tracking-tight text-slate-950 dark:text-slate-50">
                Student Portal
              </h2>
            </div>

            <nav className="space-y-1">
              {studentPortalNavItems.map((item) => {
                const Icon = item.icon;
                const isDashboard = item.href === "/student";
                const isActive = isDashboard
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[linear-gradient(135deg,#2f6fff_0%,#1d4ed8_100%)] text-white shadow-[0_18px_36px_-24px_rgba(37,99,235,0.85)]"
                        : "text-slate-600 hover:bg-[#f5f8ff] hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                    )}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    {item.title}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto space-y-5">
            <StudentSidebarPromo />

            <div className="border-t border-[#e6edf8] px-2 pt-4 dark:border-slate-800">
              <p className="text-xl font-semibold text-slate-950 dark:text-slate-50">Edutindo</p>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">
                Empowering students. Enriching learning. Building brighter futures.
              </p>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 space-y-5">
          <section className="rounded-[30px] border border-white/70 bg-white/86 p-6 shadow-[0_34px_90px_-64px_rgba(37,99,235,0.34)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 sm:p-7">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-[linear-gradient(180deg,#eef4ff_0%,#dfe8ff_100%)] text-[#2f6fff] shadow-[0_20px_40px_-28px_rgba(37,99,235,0.68)] dark:bg-[linear-gradient(180deg,rgba(37,99,235,0.32)_0%,rgba(37,99,235,0.16)_100%)] dark:text-blue-200">
                <BookOpen className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-[2.8rem]">
                  Learning Materials
                </h1>
                <p className="max-w-3xl text-[15px] leading-7 text-slate-500 dark:text-slate-300">
                  Browse your learning materials by school, year, subject, chapter, and lesson.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.32)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/82">
            <div className="grid gap-4 xl:grid-cols-4">
              {[
                {
                  step: "check" as const,
                  title: "School",
                  detail: selectedSchool?.title ?? "EDUTINDO School",
                },
                {
                  step: "check" as const,
                  title: "Year",
                  detail: selectedYear?.title ?? "Year 7",
                },
                { step: 3 as const, title: "Subject", detail: "Choose a subject" },
                { step: 4 as const, title: "Chapters & Materials", detail: "Explore lessons" },
              ].map((item, index) => {
                const complete = item.step === "check";
                const active = item.step === 3;

                return (
                  <div key={item.title} className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                        complete || active
                          ? "bg-[#2f6fff] text-white shadow-[0_18px_36px_-24px_rgba(37,99,235,0.88)]"
                          : "border border-[#dfe7f5] bg-[#f4f7fb] text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      )}
                    >
                      {complete ? <Check className="h-4 w-4" /> : item.step}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <p className="truncate text-[15px] font-semibold text-slate-900 dark:text-slate-50">
                          {item.title}
                        </p>
                        {index < 3 && (
                          <div className="hidden h-px flex-1 bg-[#d7e2f6] xl:block dark:bg-slate-700" />
                        )}
                      </div>
                      <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {outlineLoading ? (
            <Card className="border-white/80 bg-white/88 shadow-[0_28px_70px_-58px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-900/80">
              <CardContent className="p-6 text-sm text-slate-500 dark:text-slate-300">
                Loading curriculum outline...
              </CardContent>
            </Card>
          ) : outlineError ? (
            <Card className="border-red-100 bg-white/88 shadow-[0_28px_70px_-58px_rgba(15,23,42,0.45)] dark:border-red-900/50 dark:bg-slate-900/80">
              <CardContent className="p-6 text-sm text-red-600 dark:text-red-300">
                {outlineError}
              </CardContent>
            </Card>
          ) : schools.length === 0 ? (
            <Card className="border-white/80 bg-white/88 shadow-[0_28px_70px_-58px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-900/80">
              <CardContent className="p-6 text-sm text-slate-500 dark:text-slate-300">
                No curriculum found yet. Create a school, then add years, subjects, chapters, and lessons in Curriculum Portal.
              </CardContent>
            </Card>
          ) : (
            <>
              <section className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-[26px] border border-white/70 bg-white/90 p-5 shadow-[0_28px_70px_-60px_rgba(15,23,42,0.32)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/82">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#eef4ff] text-[#2f6fff]">
                      <School className="h-7 w-7" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-500 dark:text-slate-400">School</p>
                      <p className="truncate text-[1.6rem] font-semibold tracking-tight text-slate-950 dark:text-slate-50">
                        {selectedSchool?.title ?? "Choose a school"}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#e8f9ec] px-3 py-1 text-xs font-semibold text-[#4ca860]">
                      Selected
                    </span>
                  </div>
                </div>

                <div className="rounded-[26px] border border-white/70 bg-white/90 p-5 shadow-[0_28px_70px_-60px_rgba(15,23,42,0.32)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/82">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#f3efff] text-[#7c3aed]">
                      <GraduationCap className="h-7 w-7" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-500 dark:text-slate-400">Year</p>
                      <p className="truncate text-[1.6rem] font-semibold tracking-tight text-slate-950 dark:text-slate-50">
                        {selectedYear?.title ?? "Choose a year"}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#e8f9ec] px-3 py-1 text-xs font-semibold text-[#4ca860]">
                      Selected
                    </span>
                  </div>
                </div>
              </section>

              {(schoolOptionsVisible || yearOptionsVisible) && (
                <section className="grid gap-4 lg:grid-cols-2">
                  {schoolOptionsVisible ? (
                    <div className="rounded-[24px] border border-dashed border-[#d9e4f7] bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                      <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-200">Switch school</p>
                      <div className="flex flex-wrap gap-2">
                        {schools.map((school) => (
                          <Button
                            key={school.id}
                            type="button"
                            variant={school.slug === selectedSchoolSlug ? "default" : "outline"}
                            onClick={() => setSelectedSchoolSlug(school.slug)}
                            className={cn(
                              "h-10 rounded-full px-4",
                              school.slug === selectedSchoolSlug
                                ? "bg-[linear-gradient(135deg,#2f6fff_0%,#1d4ed8_100%)] text-white"
                                : "border-[#d9e1ef] bg-white text-slate-700 shadow-none hover:border-[#c6d4f3] hover:bg-[#f7faff] hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                            )}
                          >
                            {school.title}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {yearOptionsVisible ? (
                    <div className="rounded-[24px] border border-dashed border-[#d9e4f7] bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                      <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-200">Switch year</p>
                      <div className="flex flex-wrap gap-2">
                        {years.map((year) => (
                          <Button
                            key={year.id}
                            type="button"
                            variant={year.slug === selectedYearSlug ? "default" : "outline"}
                            onClick={() => setSelectedYearSlug(year.slug)}
                            className={cn(
                              "h-10 rounded-full px-4",
                              year.slug === selectedYearSlug
                                ? "bg-[linear-gradient(135deg,#2f6fff_0%,#1d4ed8_100%)] text-white"
                                : "border-[#d9e1ef] bg-white text-slate-700 shadow-none hover:border-[#c6d4f3] hover:bg-[#f7faff] hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                            )}
                          >
                            {year.title}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </section>
              )}

              <section className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.32)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/82 sm:p-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-1">
                    <h2 className="text-[1.85rem] font-semibold tracking-tight text-slate-950 dark:text-slate-50">
                      Choose a Subject
                    </h2>
                    <p className="text-[15px] text-slate-500 dark:text-slate-300">
                      Select a subject to view chapters and materials.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 xl:items-end">
                    <div className="relative w-full xl:w-[18rem]">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        value={subjectSearchQuery}
                        onChange={(event) => setSubjectSearchQuery(event.target.value)}
                        placeholder="Search subjects..."
                        className="h-11 rounded-full border-[#d9e1ef] bg-white pl-10 shadow-none focus-visible:ring-[#bcd2ff] dark:border-slate-700 dark:bg-slate-900"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {studentSubjectFilterOptions.map((option) => {
                        const isActive = subjectFilter === option.key;

                        return (
                          <Button
                            key={option.key}
                            type="button"
                            variant="outline"
                            onClick={() => setSubjectFilter(option.key)}
                            className={cn(
                              "h-10 rounded-full border px-4 text-sm shadow-none",
                              isActive
                                ? "border-[#2f6fff] bg-[#2f6fff] text-white hover:bg-[#2f6fff]"
                                : "border-[#d9e1ef] bg-white text-slate-600 hover:border-[#c6d4f3] hover:bg-[#f7faff] hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                            )}
                          >
                            {option.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {displayedSubjects.map((subject) => {
                    const isActive = subject.slug === selectedSubjectSlug;
                    const materialCount = subjectMaterialCounts[subject.id] ?? 0;
                    const visual = getSubjectVisual(subject);
                    const Icon = visual.icon;

                    return (
                      <button
                        key={subject.id}
                        type="button"
                        onClick={() => setSelectedSubjectSlug(subject.slug)}
                        className={cn(
                          "rounded-[24px] border bg-white p-5 text-left shadow-[0_22px_48px_-42px_rgba(15,23,42,0.34)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#c6d4f3] hover:shadow-[0_30px_64px_-44px_rgba(37,99,235,0.28)] dark:bg-slate-900 dark:shadow-none",
                          isActive
                            ? "border-[#2f6fff] ring-2 ring-[#2f6fff]/15 dark:border-blue-500 dark:ring-blue-500/20"
                            : "border-[#e3ebf7] dark:border-slate-800"
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div
                            className={cn(
                              "flex h-12 w-12 items-center justify-center rounded-[18px]",
                              visual.iconClassName
                            )}
                          >
                            <Icon className="h-6 w-6" />
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <span className="inline-flex rounded-full bg-[#ffedd8] px-2.5 py-1 text-xs font-semibold text-[#ff7a1a]">
                              {materialCount} material{materialCount === 1 ? "" : "s"}
                            </span>
                            {isActive ? (
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2f6fff] text-white">
                                <Check className="h-3.5 w-3.5" />
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <h3 className="mt-5 text-[1.1rem] font-semibold leading-tight text-slate-950 dark:text-slate-50">
                          {subject.title}
                        </h3>
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500 dark:text-slate-300">
                          {getSubjectSummary(subject)}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {displayedSubjects.length === 0 ? (
                  <div className="mt-5 rounded-[24px] border border-dashed border-[#d9e4f7] bg-[#f8fbff] p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
                    No subjects match this filter yet.
                  </div>
                ) : null}
              </section>

              {selectedSchool && selectedYear && selectedSubject ? (
                <section className="rounded-[28px] border border-[#cae0ff] bg-[linear-gradient(180deg,#edf5ff_0%,#f6faff_100%)] p-5 shadow-[0_30px_80px_-60px_rgba(37,99,235,0.28)] dark:border-blue-900/50 dark:bg-[linear-gradient(180deg,rgba(30,64,175,0.18)_0%,rgba(15,23,42,0.82)_100%)] sm:p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-1">
                      <h2 className="text-[1.85rem] font-semibold tracking-tight text-slate-950 dark:text-slate-50">
                        {selectedSchool.title} · {selectedYear.title} {selectedSubject.title} Chapters
                      </h2>
                      <p className="text-[15px] text-slate-500 dark:text-slate-300">
                        Explore chapters and their lessons.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex rounded-full bg-[#ff7a1a] px-3 py-1 text-xs font-semibold text-white">
                        {selectedSubject.chapterCount} chapters
                      </span>
                      <span className="inline-flex rounded-full bg-[#ff7a1a] px-3 py-1 text-xs font-semibold text-white">
                        {selectedSubject.lessonCount} lessons
                      </span>
                    </div>
                  </div>

                  {selectedSubject.chapters.length > 0 ? (
                    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                      {selectedSubject.chapters.map((chapter, index) => (
                        <article
                          key={chapter.id}
                          className="rounded-[22px] border border-[#dbe7fb] bg-white p-4 shadow-[0_20px_44px_-38px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-900 dark:shadow-none"
                        >
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                            Chapter {index + 1}
                          </p>
                          <h3 className="mt-3 line-clamp-2 text-[1rem] font-semibold leading-tight text-slate-950 dark:text-slate-50">
                            {chapter.title}
                          </h3>
                          <p className="mt-2 text-xs text-slate-500 dark:text-slate-300">
                            {chapter.weekRange || "Week range not set"}
                          </p>
                          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                            {chapter.lessonCount} lesson{chapter.lessonCount === 1 ? "" : "s"}
                          </p>

                          <Button
                            asChild
                            className="mt-4 h-8 w-full rounded-full bg-[linear-gradient(135deg,#2f6fff_0%,#1d4ed8_100%)] px-3 text-xs font-medium text-white shadow-[0_18px_36px_-22px_rgba(37,99,235,0.92)] hover:brightness-105"
                          >
                            <Link
                              href={`/student/materials/curriculum/${selectedSchool.slug}/${selectedYear.slug}/${selectedSubject.slug}/${chapter.slug}`}
                            >
                              Open Chapter
                            </Link>
                          </Button>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-5 rounded-[24px] border border-dashed border-[#d9e4f7] bg-white/85 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
                      No chapters yet for this subject.
                    </div>
                  )}
                </section>
              ) : null}

              <section className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.32)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/82 sm:p-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-1">
                    <h2 className="text-[1.85rem] font-semibold tracking-tight text-slate-950 dark:text-slate-50">
                      {selectedSubject ? `${selectedSubject.title} Materials` : "Subject Materials"}
                    </h2>
                    <p className="text-[15px] text-slate-500 dark:text-slate-300">
                      Browse and open learning materials for the selected subject.
                    </p>
                  </div>

                  <div className="relative w-full xl:max-w-[18rem]">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={materialSearchQuery}
                      onChange={(event) => setMaterialSearchQuery(event.target.value)}
                      placeholder="Search materials..."
                      className="h-11 rounded-full border-[#d9e1ef] bg-white pl-10 shadow-none focus-visible:ring-[#bcd2ff] dark:border-slate-700 dark:bg-slate-900"
                    />
                  </div>
                </div>

                {materialRows.length > 0 ? (
                  <div className="mt-5 overflow-hidden rounded-[24px] border border-[#e4ebf7] bg-white dark:border-slate-800 dark:bg-slate-950/80">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left">
                        <thead className="border-b border-[#e8eef8] bg-[#fbfcff] dark:border-slate-800 dark:bg-slate-900/70">
                          <tr className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                            <th className="px-5 py-4">Material</th>
                            <th className="px-4 py-4">Type</th>
                            <th className="px-4 py-4">Related Chapter</th>
                            <th className="px-4 py-4">Updated</th>
                            <th className="px-4 py-4">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {materialRows.map(({ material, typePresentation, relatedChapter }) => (
                            <tr
                              key={material.id}
                              className="border-b border-[#eef2f8] last:border-b-0 dark:border-slate-800"
                            >
                              <td className="px-5 py-4">
                                <div className="flex items-start gap-3">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#eef4ff] text-[#2f6fff]">
                                    <FileText className="h-5 w-5" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[15px] font-semibold text-slate-950 dark:text-slate-50">
                                      {material.title}
                                    </p>
                                    <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-300">
                                      {material.description}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <span
                                  className={cn(
                                    "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
                                    typePresentation.className
                                  )}
                                >
                                  {typePresentation.label}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">
                                {relatedChapter ? relatedChapter.title : "Not mapped"}
                              </td>
                              <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">
                                {formatMaterialDate(material.updatedAt)}
                              </td>
                              <td className="px-4 py-4">
                                <Button
                                  asChild
                                  className="h-9 rounded-full bg-[linear-gradient(135deg,#2f6fff_0%,#1d4ed8_100%)] px-4 text-xs font-medium text-white shadow-[0_18px_36px_-24px_rgba(37,99,235,0.85)] hover:brightness-105"
                                >
                                  <Link href={`/student/materials/${material.id}`}>View Material</Link>
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="border-t border-[#e8eef8] px-5 py-4 text-center dark:border-slate-800">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setMaterialSearchQuery("")}
                        className="h-10 rounded-full border-[#d9e1ef] bg-white px-4 text-[#2f6fff] shadow-none hover:border-[#c6d4f3] hover:bg-[#f7faff] dark:border-slate-700 dark:bg-slate-900 dark:text-blue-200"
                      >
                        View all materials
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 rounded-[24px] border border-dashed border-[#d9e4f7] bg-[#f8fbff] p-8 text-center dark:border-slate-700 dark:bg-slate-900/60">
                    <p className="font-medium text-slate-900 dark:text-slate-50">No materials found</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                      Try another subject or search keyword.
                    </p>
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function LegacyPortalMaterialsExperience({
  role,
  outlineLoading,
  outlineError,
  schools,
  selectedSchoolSlug,
  selectedYearSlug,
  selectedSubjectSlug,
  setSelectedSchoolSlug,
  setSelectedYearSlug,
  setSelectedSubjectSlug,
  selectedSchool,
  selectedYear,
  selectedSubject,
  years,
  subjects,
  subjectMaterialCounts,
  filteredMaterials,
  searchQuery,
  setSearchQuery,
}: {
  role: LegacyPortalRole;
  outlineLoading: boolean;
  outlineError: string;
  schools: CurriculumSchool[];
  selectedSchoolSlug: string;
  selectedYearSlug: string;
  selectedSubjectSlug: string;
  setSelectedSchoolSlug: (value: string) => void;
  setSelectedYearSlug: (value: string) => void;
  setSelectedSubjectSlug: (value: string) => void;
  selectedSchool: CurriculumSchool | null;
  selectedYear: CurriculumYear | null;
  selectedSubject: CurriculumSubject | null;
  years: CurriculumYear[];
  subjects: CurriculumSubject[];
  subjectMaterialCounts: Record<string, number>;
  filteredMaterials: Material[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}) {
  const cardRole = role === "teacher" ? "teacher" : "student";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="flex">
        <aside className="sticky top-0 hidden min-h-screen w-64 border-r bg-card p-6 lg:block">
          <div className="mb-8">
            <h2 className="text-lg font-bold">{roleLabels[role]}</h2>
          </div>
          <SidebarNav role={role} />
        </aside>

        <main className="flex-1 p-6 lg:p-8">
          <div className="portal-page-width space-y-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Learning Materials</h1>
              <p className="mt-2 text-muted-foreground">
                Curriculum structure is loaded from Curriculum Portal (School -&gt; Year -&gt;
                Subject -&gt; Chapter -&gt; Lesson).
              </p>
            </div>

            {outlineLoading ? (
              <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">
                  Loading curriculum outline...
                </CardContent>
              </Card>
            ) : outlineError ? (
              <Card>
                <CardContent className="p-6 text-sm text-red-600">{outlineError}</CardContent>
              </Card>
            ) : schools.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">
                  No curriculum found yet. Create a school, then add years, subjects, chapters, and
                  lessons in Admin Curriculum Portal.
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Step 1: Choose School</CardTitle>
                    <CardDescription>Curriculum is organized by school first.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {schools.map((school) => (
                      <Button
                        key={school.id}
                        type="button"
                        variant={school.slug === selectedSchoolSlug ? "default" : "outline"}
                        onClick={() => setSelectedSchoolSlug(school.slug)}
                      >
                        {school.title}
                      </Button>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Step 2: Choose Year</CardTitle>
                    <CardDescription>
                      {selectedSchool
                        ? `All available year levels inside ${selectedSchool.title} are managed from Curriculum Portal.`
                        : "Select a school first."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {years.map((year) => (
                      <Button
                        key={year.id}
                        type="button"
                        variant={year.slug === selectedYearSlug ? "default" : "outline"}
                        onClick={() => setSelectedYearSlug(year.slug)}
                      >
                        {year.title}
                      </Button>
                    ))}
                    {years.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No years configured for this school yet.
                      </p>
                    )}
                  </CardContent>
                </Card>

                <section className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge className="border border-blue-200 bg-blue-100 text-blue-700 hover:bg-blue-100">
                      Step 3
                    </Badge>
                    <span className="text-muted-foreground">
                      Choose subject in {selectedSchool?.title ?? "selected school"}{" "}
                      {selectedYear ? `· ${selectedYear.title}` : ""}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <Badge className="border border-blue-200 bg-blue-100 text-blue-700 hover:bg-blue-100">
                      Step 4
                    </Badge>
                    <span className="text-muted-foreground">Open chapter lesson plan</span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {subjects.map((subject) => {
                      const isActive = subject.slug === selectedSubjectSlug;
                      const materialCount = subjectMaterialCounts[subject.id] ?? 0;

                      return (
                        <button
                          key={subject.id}
                          type="button"
                          onClick={() => setSelectedSubjectSlug(subject.slug)}
                          className={cn(
                            "rounded-2xl border bg-white p-5 text-left transition-all hover:shadow-sm",
                            isActive ? "border-primary ring-2 ring-primary/20" : "border-slate-200"
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                              <BookOpen className="h-5 w-5" />
                            </div>
                            <Badge variant="secondary">{materialCount} materials</Badge>
                          </div>
                          <h3 className="mt-4 text-lg font-bold text-slate-900">{subject.title}</h3>
                          <p className="mt-1 text-sm text-slate-600">
                            {subject.description || `${subject.chapterCount} chapters · ${subject.lessonCount} lessons`}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {selectedSchool && selectedYear && selectedSubject && (
                  <Card className="border-sky-200 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.18),_transparent_55%),linear-gradient(to_bottom_right,_#ffffff,_#f8fbff)]">
                    <CardHeader>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <CardTitle className="text-slate-900">
                            {selectedSchool.title} · {selectedYear.title} {selectedSubject.title}{" "}
                            Chapters
                          </CardTitle>
                          <CardDescription>
                            Lesson plans and ordering are fully managed from Curriculum Portal.
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="secondary">{selectedSubject.chapterCount} chapters</Badge>
                          <Badge variant="secondary">{selectedSubject.lessonCount} lessons</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {selectedSubject.chapters.length === 0 ? (
                        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                          No chapters yet for this subject.
                        </div>
                      ) : (
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                          {selectedSubject.chapters.map((chapter, index) => (
                            <Card key={chapter.id} className="border-slate-200">
                              <CardContent className="space-y-2 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                  Chapter {index + 1}
                                </p>
                                <p className="font-semibold leading-tight text-slate-900">
                                  {chapter.title}
                                </p>
                                <p className="text-xs text-slate-600">
                                  {chapter.weekRange || "Week range not set"}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {chapter.lessonCount} lessons
                                </p>
                                <Button asChild size="sm" className="mt-2 w-full">
                                  <Link
                                    href={`/${role}/materials/curriculum/${selectedSchool.slug}/${selectedYear.slug}/${selectedSubject.slug}/${chapter.slug}`}
                                  >
                                    Open Chapter
                                  </Link>
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedSubject ? `${selectedSubject.title} Materials` : "Subject Materials"}
                </CardTitle>
                <CardDescription>
                  Materials filtered by currently selected curriculum subject.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search subject materials..."
                    className="pl-10"
                  />
                </div>

                {filteredMaterials.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {filteredMaterials.map((material) => (
                      <MaterialCard
                        key={material.id}
                        material={material}
                        role={cardRole}
                        href={`/${role}/materials/${material.id}`}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed p-8 text-center">
                    <p className="font-medium text-slate-900">No materials found</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Try another subject or search keyword.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

export function PortalMaterialsClient({ role, materials, lockedSchoolSlug = null }: PortalMaterialsClientProps) {
  const searchParams = useSearchParams();
  const [legacySearchQuery, setLegacySearchQuery] = useState("");
  const [outlineLoading, setOutlineLoading] = useState(true);
  const [outlineError, setOutlineError] = useState("");
  const [schools, setSchools] = useState<CurriculumSchool[]>([]);
  const [defaultSchoolSlug, setDefaultSchoolSlug] = useState("");

  const [selectedSchoolSlug, setSelectedSchoolSlug] = useState("");
  const [selectedYearSlug, setSelectedYearSlug] = useState("");
  const [selectedSubjectSlug, setSelectedSubjectSlug] = useState("");
  const requestedSchoolSlug = searchParams.get("school")?.trim() ?? "";
  const requestedYearSlug = searchParams.get("year")?.trim() ?? "";
  const requestedSubjectSlug = searchParams.get("subject")?.trim() ?? "";

  useEffect(() => {
    let mounted = true;

    const loadOutline = async () => {
      setOutlineLoading(true);
      setOutlineError("");

      try {
        const response = await fetch("/api/curriculum/outline", { cache: "no-store" });
        const data = await response.json();

        if (!mounted) return;

        if (!response.ok || !data.ok) {
          setOutlineError(data.error || "Failed to load curriculum outline.");
          setSchools([]);
          setDefaultSchoolSlug("");
          return;
        }

        const allSchools: CurriculumSchool[] = Array.isArray(data.schools) ? data.schools : [];
        const visibleSchools =
          role === "student" && lockedSchoolSlug
            ? allSchools.filter((school) => school.slug === lockedSchoolSlug)
            : allSchools;

        setSchools(visibleSchools);
        setDefaultSchoolSlug(
          role === "student" && lockedSchoolSlug
            ? lockedSchoolSlug
            : typeof data.defaultSchoolSlug === "string"
              ? data.defaultSchoolSlug
              : ""
        );

        if (role === "student" && lockedSchoolSlug && visibleSchools.length === 0) {
          setOutlineError("Your assigned school is not available in the curriculum yet.");
        }
      } catch (error) {
        console.error(error);
        if (!mounted) return;
        setOutlineError("Failed to load curriculum outline.");
        setSchools([]);
        setDefaultSchoolSlug("");
      } finally {
        if (mounted) setOutlineLoading(false);
      }
    };

    loadOutline();

    return () => {
      mounted = false;
    };
  }, [lockedSchoolSlug, role]);

  useEffect(() => {
    if (schools.length === 0) {
      setSelectedSchoolSlug("");
      setSelectedYearSlug("");
      setSelectedSubjectSlug("");
      return;
    }

    if (role === "student" && lockedSchoolSlug && schools.some((school) => school.slug === lockedSchoolSlug)) {
      if (selectedSchoolSlug !== lockedSchoolSlug) {
        setSelectedSchoolSlug(lockedSchoolSlug);
      }
      return;
    }

    if (requestedSchoolSlug && schools.some((school) => school.slug === requestedSchoolSlug)) {
      if (selectedSchoolSlug !== requestedSchoolSlug) {
        setSelectedSchoolSlug(requestedSchoolSlug);
      }
      return;
    }

    if (!selectedSchoolSlug || !schools.some((school) => school.slug === selectedSchoolSlug)) {
      const preferredSchool =
        schools.find((school) => school.slug === defaultSchoolSlug) ?? schools[0];
      setSelectedSchoolSlug(preferredSchool?.slug ?? "");
    }
  }, [defaultSchoolSlug, lockedSchoolSlug, requestedSchoolSlug, role, schools, selectedSchoolSlug]);

  const selectedSchool = useMemo(
    () => schools.find((school) => school.slug === selectedSchoolSlug) ?? null,
    [schools, selectedSchoolSlug]
  );

  const years = useMemo(() => dedupeYearsByTitle(selectedSchool?.years ?? []), [selectedSchool]);

  useEffect(() => {
    if (years.length === 0) {
      setSelectedYearSlug("");
      setSelectedSubjectSlug("");
      return;
    }

    if (requestedYearSlug && years.some((year) => year.slug === requestedYearSlug)) {
      if (selectedYearSlug !== requestedYearSlug) {
        setSelectedYearSlug(requestedYearSlug);
      }
      return;
    }

    if (!selectedYearSlug || !years.some((year) => year.slug === selectedYearSlug)) {
      setSelectedYearSlug(years[0].slug);
    }
  }, [requestedYearSlug, selectedYearSlug, years]);

  const selectedYear = useMemo(
    () => years.find((year) => year.slug === selectedYearSlug) ?? null,
    [years, selectedYearSlug]
  );

  const subjects = useMemo(() => selectedYear?.subjects ?? [], [selectedYear]);

  useEffect(() => {
    if (subjects.length === 0) {
      setSelectedSubjectSlug("");
      return;
    }

    if (requestedSubjectSlug && subjects.some((subject) => subject.slug === requestedSubjectSlug)) {
      if (selectedSubjectSlug !== requestedSubjectSlug) {
        setSelectedSubjectSlug(requestedSubjectSlug);
      }
      return;
    }

    if (!selectedSubjectSlug || !subjects.some((subject) => subject.slug === selectedSubjectSlug)) {
      setSelectedSubjectSlug(subjects[0].slug);
    }
  }, [requestedSubjectSlug, selectedSubjectSlug, subjects]);

  const selectedSubject = useMemo(
    () => subjects.find((subject) => subject.slug === selectedSubjectSlug) ?? null,
    [subjects, selectedSubjectSlug]
  );

  const selectedSubjectMaterials = useMemo(() => {
    if (!selectedSubject) return [];
    return materials.filter((material) => subjectMatches(material.subject, selectedSubject));
  }, [materials, selectedSubject]);

  const filteredLegacyMaterials = useMemo(() => {
    const query = normalizeText(legacySearchQuery);

    if (!query) return selectedSubjectMaterials;

    return selectedSubjectMaterials.filter((material) =>
      [material.title, material.subject, material.description].some((value) =>
        normalizeText(value).includes(query)
      )
    );
  }, [legacySearchQuery, selectedSubjectMaterials]);

  const subjectMaterialCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    for (const school of schools) {
      for (const year of school.years) {
        for (const subject of year.subjects) {
          counts[subject.id] = materials.filter((material) => subjectMatches(material.subject, subject)).length;
        }
      }
    }

    return counts;
  }, [materials, schools]);

  if (role === "admin") {
    return (
      <AdminMaterialsExperience
        role={role}
        outlineLoading={outlineLoading}
        outlineError={outlineError}
        schools={schools}
        selectedSchoolSlug={selectedSchoolSlug}
        selectedYearSlug={selectedYearSlug}
        selectedSubjectSlug={selectedSubjectSlug}
        setSelectedSchoolSlug={setSelectedSchoolSlug}
        setSelectedYearSlug={setSelectedYearSlug}
        setSelectedSubjectSlug={setSelectedSubjectSlug}
        selectedSchool={selectedSchool}
        selectedYear={selectedYear}
        selectedSubject={selectedSubject}
        years={years}
        subjects={subjects}
        selectedSubjectMaterials={selectedSubjectMaterials}
        subjectMaterialCounts={subjectMaterialCounts}
      />
    );
  }

  if (role === "student") {
    return (
      <StudentMaterialsExperience
        outlineLoading={outlineLoading}
        outlineError={outlineError}
        schools={schools}
        selectedSchoolSlug={selectedSchoolSlug}
        selectedYearSlug={selectedYearSlug}
        selectedSubjectSlug={selectedSubjectSlug}
        setSelectedSchoolSlug={setSelectedSchoolSlug}
        setSelectedYearSlug={setSelectedYearSlug}
        setSelectedSubjectSlug={setSelectedSubjectSlug}
        selectedSchool={selectedSchool}
        selectedYear={selectedYear}
        selectedSubject={selectedSubject}
        years={years}
        subjects={subjects}
        selectedSubjectMaterials={selectedSubjectMaterials}
        subjectMaterialCounts={subjectMaterialCounts}
      />
    );
  }

  return (
    <LegacyPortalMaterialsExperience
      role={role}
      outlineLoading={outlineLoading}
      outlineError={outlineError}
      schools={schools}
      selectedSchoolSlug={selectedSchoolSlug}
      selectedYearSlug={selectedYearSlug}
      selectedSubjectSlug={selectedSubjectSlug}
      setSelectedSchoolSlug={setSelectedSchoolSlug}
      setSelectedYearSlug={setSelectedYearSlug}
      setSelectedSubjectSlug={setSelectedSubjectSlug}
      selectedSchool={selectedSchool}
      selectedYear={selectedYear}
      selectedSubject={selectedSubject}
      years={years}
      subjects={subjects}
      subjectMaterialCounts={subjectMaterialCounts}
      filteredMaterials={filteredLegacyMaterials}
      searchQuery={legacySearchQuery}
      setSearchQuery={setLegacySearchQuery}
    />
  );
}
