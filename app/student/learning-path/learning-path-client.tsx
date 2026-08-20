"use client";

import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, CheckCircle, GitBranch, Layers3, LockKeyhole } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingLessonLink } from "@/components/lms/loading-lesson-link";
import type { StudentAssignedModuleLesson } from "@/lib/module-editor";

interface LearningPathClientProps {
  assignedLessons: StudentAssignedModuleLesson[];
}

type ChapterGroup = {
  key: string;
  schoolTitle: string;
  yearTitle: string;
  subject: string;
  chapterTitle: string;
  chapterPosition: number;
  lessons: StudentAssignedModuleLesson[];
};

function groupLessonsByChapter(lessons: StudentAssignedModuleLesson[]) {
  const groups = new Map<string, ChapterGroup>();

  for (const lesson of lessons) {
    const key = [
      lesson.schoolSlug,
      lesson.yearSlug,
      lesson.subjectSlug,
      lesson.chapterSlug,
      lesson.chapterTitle,
    ].join(":");
    const group =
      groups.get(key) ??
      ({
        key,
        schoolTitle: lesson.schoolTitle,
        yearTitle: lesson.yearTitle,
        subject: lesson.subject,
        chapterTitle: lesson.chapterTitle || "General",
        chapterPosition: lesson.chapterPosition,
        lessons: [],
      } satisfies ChapterGroup);

    group.lessons.push(lesson);
    groups.set(key, group);
  }

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      lessons: [...group.lessons].sort((left, right) => {
        if (left.lessonPosition !== right.lessonPosition) {
          return left.lessonPosition - right.lessonPosition;
        }
        return (left.lessonCode || left.lessonTitle).localeCompare(right.lessonCode || right.lessonTitle);
      }),
    }))
    .sort((left, right) => {
      const scopedOrder = [
        left.schoolTitle.localeCompare(right.schoolTitle),
        left.yearTitle.localeCompare(right.yearTitle),
        left.subject.localeCompare(right.subject),
        left.chapterPosition - right.chapterPosition,
        left.chapterTitle.localeCompare(right.chapterTitle),
      ].find((value) => value !== 0);

      return scopedOrder ?? 0;
    });
}

export default function LearningPathClient({ assignedLessons }: LearningPathClientProps) {
  const [filter, setFilter] = useState("all");
  const [selectedChapter, setSelectedChapter] = useState<ChapterGroup | null>(null);

  const subjects = useMemo(
    () => Array.from(new Set(assignedLessons.map((lesson) => lesson.subject).filter(Boolean))).sort(),
    [assignedLessons]
  );
  const filteredLessons = useMemo(
    () => (filter === "all" ? assignedLessons : assignedLessons.filter((lesson) => lesson.subject === filter)),
    [assignedLessons, filter]
  );
  const chapters = useMemo(() => groupLessonsByChapter(filteredLessons), [filteredLessons]);

  return (
    <div className="portal-page-width space-y-6">
      <div className="flex items-center gap-3">
        <GitBranch className="h-8 w-8 text-[#2f6fff]" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Learning Path</h1>
          <p className="mt-1 text-slate-500">Lessons from the student&apos;s assigned school curriculum.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
          All Subjects
        </Button>
        {subjects.map((subject) => (
          <Button
            key={subject}
            variant={filter === subject ? "default" : "outline"}
            onClick={() => setFilter(subject)}
          >
            {subject}
          </Button>
        ))}
      </div>

      {chapters.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <h2 className="text-2xl font-bold">Chapters</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {chapters.map((chapter) => {
              const openCount = chapter.lessons.filter((lesson) => !lesson.isLocked).length;

              return (
                <button
                  key={chapter.key}
                  type="button"
                  onClick={() => setSelectedChapter(chapter)}
                  className="rounded-[24px] border border-[#dbe7fb] bg-white p-5 text-left shadow-sm transition hover:border-[#2f6fff] hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="mb-3 flex flex-wrap gap-2">
                        <Badge variant="outline">{chapter.subject}</Badge>
                        <Badge variant="secondary">{chapter.yearTitle}</Badge>
                      </div>
                      <h3 className="truncate text-xl font-bold text-slate-950">{chapter.chapterTitle}</h3>
                      <p className="mt-2 text-sm font-medium text-[#64789c]">
                        {chapter.schoolTitle} / {chapter.yearTitle} / {chapter.subject}
                      </p>
                    </div>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#2f6fff]">
                      <Layers3 className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between rounded-2xl bg-[#f7faff] px-4 py-3 text-sm font-semibold text-[#64789c]">
                    <span>{chapter.lessons.length} modules</span>
                    <span>{openCount} open</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-[24px] border border-dashed border-[#dbe7fb] bg-white p-10 text-center text-slate-500">
          No curriculum chapters found for this student.
        </div>
      )}

      <Dialog open={Boolean(selectedChapter)} onOpenChange={(open) => !open && setSelectedChapter(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedChapter?.chapterTitle ?? "Chapter modules"}</DialogTitle>
            <DialogDescription>
              {selectedChapter
                ? `${selectedChapter.schoolTitle} / ${selectedChapter.yearTitle} / ${selectedChapter.subject}`
                : "Modules in this chapter"}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[68vh] space-y-3 overflow-y-auto pr-1">
            {selectedChapter?.lessons.map((lesson) => (
              <div key={`${lesson.id}:${lesson.href}`} className="rounded-2xl border border-[#edf2f8] bg-[#fbfdff] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap gap-2">
                      {lesson.lessonCode ? <Badge variant="outline">{lesson.lessonCode}</Badge> : null}
                      {lesson.isLocked ? <Badge variant="secondary">Locked</Badge> : <Badge variant="secondary">Open</Badge>}
                    </div>
                    <p className="truncate text-base font-bold text-slate-950">{lesson.moduleTitle}</p>
                  </div>

                  {lesson.isLocked ? (
                    <Button disabled variant="outline" className="shrink-0 rounded-full">
                      <LockKeyhole className="mr-2 h-4 w-4" />
                      Locked
                    </Button>
                  ) : (
                    <LoadingLessonLink
                      href={lesson.href}
                      className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#2f6fff] px-5 text-sm font-bold text-white shadow-[0_18px_38px_-22px_rgba(37,99,235,0.8)] transition-colors hover:bg-[#1d4ed8]"
                    >
                      <BookOpen className="h-4 w-4" />
                      Open Module
                      <ArrowRight className="h-4 w-4" />
                    </LoadingLessonLink>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
