"use client";

import { FormEvent, useEffect, useId, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Eye, EyeOff, Loader2, Plus, Trash2 } from "lucide-react";
import { Button, cn } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type SubjectVisibilityAction = "show" | "hide" | "remove";

type SubjectItem = {
  id: string;
  title: string;
  slug: string;
  chapterCount: number;
  lessonCount: number;
  isVisible: boolean;
};

interface SchoolSubjectVisibilityClientProps {
  schoolTitle: string;
  schoolSlug: string;
  subjects: SubjectItem[];
}

async function parseActionResponse(response: Response) {
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || "Action failed.");
  }

  return payload as {
    applied?: boolean;
    node?: {
      id?: string;
      title?: string;
      slug?: string;
    };
  };
}

function sortSubjects(subjects: SubjectItem[]) {
  return [...subjects].sort((left, right) => {
    if (left.isVisible !== right.isVisible) return left.isVisible ? -1 : 1;
    return left.title.localeCompare(right.title);
  });
}

export function SchoolSubjectVisibilityClient({
  schoolTitle,
  schoolSlug,
  subjects,
}: SchoolSubjectVisibilityClientProps) {
  const router = useRouter();
  const subjectNameId = useId();
  const subjectCodeId = useId();
  const subjectDescriptionId = useId();
  const [localSubjects, setLocalSubjects] = useState(() => sortSubjects(subjects));
  const [busyKey, setBusyKey] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [subjectDescription, setSubjectDescription] = useState("");
  const [createError, setCreateError] = useState("");
  const [, startTransition] = useTransition();

  useEffect(() => {
    setLocalSubjects(sortSubjects(subjects));
  }, [subjects]);

  function handleCreateDialogChange(open: boolean) {
    if (busyKey === "create") return;

    setCreateDialogOpen(open);
    setCreateError("");
    if (!open) {
      setSubjectName("");
      setSubjectCode("");
      setSubjectDescription("");
    }
  }

  async function createSubject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = subjectName.trim();
    const curriculumCode = subjectCode.trim();
    const description = subjectDescription.trim();
    if (!title) {
      setCreateError("Enter a subject name.");
      return;
    }

    setBusyKey("create");
    setCreateError("");
    setMessage("");
    setError("");

    try {
      const payload = await parseActionResponse(
        await fetch("/api/admin/curriculum", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nodeType: "subject",
            parentId: null,
            title,
            metadata: {
              schoolSlug,
              curriculumCode,
              description,
              uniqueIdentifier: curriculumCode || title,
              assignmentTags: [{ schoolSlug, yearSlug: "year-7" }],
            },
          }),
        })
      );

      const createdSubject = payload.node;
      if (!createdSubject?.id || !createdSubject.slug) {
        throw new Error("The subject was created, but its details could not be loaded.");
      }

      setLocalSubjects((currentSubjects) =>
        sortSubjects([
          ...currentSubjects,
          {
            id: createdSubject.id!,
            title: createdSubject.title || title,
            slug: createdSubject.slug!,
            chapterCount: 0,
            lessonCount: 0,
            isVisible: true,
          },
        ])
      );
      setMessage(`${createdSubject.title || title} created for ${schoolTitle}.`);
      setCreateDialogOpen(false);
      setSubjectName("");
      setSubjectCode("");
      setSubjectDescription("");
      startTransition(() => router.refresh());
    } catch (caughtError) {
      setCreateError(caughtError instanceof Error ? caughtError.message : "Failed to create subject.");
    } finally {
      setBusyKey("");
    }
  }

  async function submitSubjectAction(subject: SubjectItem, action: SubjectVisibilityAction) {
    if (action === "remove") {
      const confirmed = window.confirm(`Remove "${subject.title}" from the curriculum?`);
      if (!confirmed) return;
    }

    setBusyKey(`${action}:${subject.id}`);
    setMessage("");
    setError("");

    try {
      await parseActionResponse(
        await fetch("/api/admin/curriculum/subject-visibility", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            schoolSlug,
            subjectId: subject.id,
            action,
          }),
        })
      );

      setLocalSubjects((currentSubjects) =>
        sortSubjects(
          action === "remove"
            ? currentSubjects.filter((item) => item.id !== subject.id)
            : currentSubjects.map((item) =>
                item.id === subject.id
                  ? { ...item, isVisible: action === "show" }
                  : item
              )
        )
      );
      setMessage(`${subject.title} ${action === "show" ? "shown" : action === "hide" ? "hidden" : "removed"}.`);

      startTransition(() => router.refresh());
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Action failed.");
    } finally {
      setBusyKey("");
    }
  }

  function renderSubjectRow(subject: SubjectItem) {
    const toggleAction: SubjectVisibilityAction = subject.isVisible ? "hide" : "show";
    const toggleBusy = busyKey === `${toggleAction}:${subject.id}`;
    const removeBusy = busyKey === `remove:${subject.id}`;

    return (
      <tr
        key={subject.id}
        className="border-t border-[#e7edf8] bg-white transition-colors hover:bg-[#f8fbff] dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
      >
        <td className="min-w-[220px] px-4 py-4 align-top">
          <div className="flex min-w-0 items-start gap-3">
            <span
              className={cn(
                "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border",
                subject.isVisible
                  ? "border-[#2f6fff] bg-[#eef4ff] text-[#2f6fff]"
                  : "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              )}
              aria-hidden="true"
            >
              {subject.isVisible ? <Check className="h-4 w-4" /> : <span className="h-3.5 w-3.5 rounded border-2 border-current" />}
            </span>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-slate-950 dark:text-slate-50">{subject.title}</p>
              <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-300">
                {subject.chapterCount} chapters, {subject.lessonCount} lessons
              </p>
            </div>
          </div>
        </td>
        <td className="px-4 py-4 align-top">
          <Button asChild className="h-9 rounded-full px-4 text-sm">
            <Link href={`/admin/curriculum/${schoolSlug}/${subject.slug}`}>
              Open subject
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </td>
        <td className="px-4 py-4 align-top">
          <Button
            type="button"
            variant="outline"
            onClick={() => void submitSubjectAction(subject, toggleAction)}
            disabled={Boolean(busyKey)}
            className="h-9 rounded-full px-4 text-sm"
          >
            {toggleBusy ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : subject.isVisible ? (
              <EyeOff className="mr-2 h-4 w-4" />
            ) : (
              <Eye className="mr-2 h-4 w-4" />
            )}
            {subject.isVisible ? "Hide" : "Show"}
          </Button>
        </td>
        <td className="px-4 py-4 align-top">
          <Button
            type="button"
            variant="outline"
            onClick={() => void submitSubjectAction(subject, "remove")}
            disabled={Boolean(busyKey)}
            className="h-9 rounded-full border-red-200 bg-red-50 px-4 text-sm text-red-700 hover:bg-red-100 hover:text-red-800"
          >
            {removeBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Remove
          </Button>
        </td>
      </tr>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-[22px] border border-[#dbe5ff] bg-white/86 px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          Use Show or Hide to control whether a subject appears for {schoolTitle}. Remove deletes the subject immediately.
        </p>
        <Button
          type="button"
          onClick={() => setCreateDialogOpen(true)}
          disabled={Boolean(busyKey)}
          className="h-10 shrink-0 self-start px-5 sm:self-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Subject
        </Button>
      </div>

      <Dialog open={createDialogOpen} onOpenChange={handleCreateDialogChange}>
        <DialogContent className="max-w-lg rounded-2xl">
          <form onSubmit={createSubject} className="space-y-5">
            <DialogHeader>
              <DialogTitle>Create Subject</DialogTitle>
              <DialogDescription>
                Add a new subject to {schoolTitle}. You can add chapters and lessons after it is created.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor={subjectNameId} className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Subject name
                </label>
                <Input
                  id={subjectNameId}
                  value={subjectName}
                  onChange={(event) => setSubjectName(event.target.value)}
                  placeholder="Example: Mathematics"
                  autoFocus
                  maxLength={180}
                  disabled={busyKey === "create"}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor={subjectCodeId} className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Subject code <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <Input
                  id={subjectCodeId}
                  value={subjectCode}
                  onChange={(event) => setSubjectCode(event.target.value)}
                  placeholder="Example: MATH"
                  maxLength={80}
                  disabled={busyKey === "create"}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor={subjectDescriptionId} className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Description <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <Textarea
                  id={subjectDescriptionId}
                  value={subjectDescription}
                  onChange={(event) => setSubjectDescription(event.target.value)}
                  placeholder="Briefly describe what this subject covers."
                  rows={3}
                  maxLength={280}
                  disabled={busyKey === "create"}
                />
              </div>
            </div>

            {createError ? (
              <p role="alert" className="text-sm font-semibold text-red-600">
                {createError}
              </p>
            ) : null}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleCreateDialogChange(false)}
                disabled={busyKey === "create"}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={busyKey === "create" || !subjectName.trim()}>
                {busyKey === "create" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                {busyKey === "create" ? "Creating..." : "Create Subject"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {message ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-[24px] border border-[#dbe5ff] bg-white/92 shadow-sm dark:border-slate-800 dark:bg-slate-900/84">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left">
            <thead className="bg-[#f8fbff] text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Open subject</th>
                <th className="px-4 py-3">Visibility</th>
                <th className="px-4 py-3">Remove</th>
              </tr>
            </thead>
            <tbody>
              {localSubjects.length === 0 ? (
                <tr className="border-t border-[#e7edf8]">
                  <td className="px-4 py-8 text-sm text-slate-500" colSpan={4}>
                    No subjects available for {schoolTitle}.
                  </td>
                </tr>
              ) : (
                localSubjects.map(renderSubjectRow)
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
