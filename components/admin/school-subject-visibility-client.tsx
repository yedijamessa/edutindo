"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Clock3, Eye, EyeOff, Loader2, Trash2, X } from "lucide-react";
import { Button, cn } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type SubjectVisibilityAction = "show" | "hide" | "remove";

type SubjectItem = {
  id: string;
  title: string;
  slug: string;
  chapterCount: number;
  lessonCount: number;
  isVisible: boolean;
};

type PendingRequest = {
  id: string;
  schoolSlug: string;
  subjectId: string;
  subjectTitle: string;
  action: SubjectVisibilityAction;
  requestedByEmail: string;
  createdAt: string;
};

interface SchoolSubjectVisibilityClientProps {
  schoolTitle: string;
  schoolSlug: string;
  subjects: SubjectItem[];
  pendingRequests: PendingRequest[];
  canApprove: boolean;
}

const approverLabel = "admin@edutindo.org, it@edutindo.org, or ymsp@edutindo.org";

function formatAction(action: SubjectVisibilityAction) {
  if (action === "show") return "show";
  if (action === "hide") return "hide";
  return "remove";
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

async function parseActionResponse(response: Response) {
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || "Action failed.");
  }

  return payload as { applied?: boolean; request?: PendingRequest };
}

export function SchoolSubjectVisibilityClient({
  schoolTitle,
  schoolSlug,
  subjects,
  pendingRequests,
  canApprove,
}: SchoolSubjectVisibilityClientProps) {
  const router = useRouter();
  const [busyKey, setBusyKey] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();

  const pendingBySubject = useMemo(() => {
    const map = new Map<string, PendingRequest[]>();

    for (const request of pendingRequests) {
      map.set(request.subjectId, [...(map.get(request.subjectId) ?? []), request]);
    }

    return map;
  }, [pendingRequests]);

  const visibleSubjects = subjects.filter((subject) => subject.isVisible);
  const hiddenSubjects = subjects.filter((subject) => !subject.isVisible);

  async function submitSubjectAction(subject: SubjectItem, action: SubjectVisibilityAction) {
    if (action === "remove") {
      const confirmed = window.confirm(`Remove "${subject.title}" from the curriculum?`);
      if (!confirmed) return;
    }

    setBusyKey(`${action}:${subject.id}`);
    setMessage("");
    setError("");

    try {
      const payload = await parseActionResponse(
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

      if (payload.applied) {
        setMessage(`${subject.title} ${action === "show" ? "shown" : action === "hide" ? "hidden" : "removed"}.`);
      } else {
        setMessage(`Request sent. ${approverLabel} must approve before ${subject.title} is changed.`);
      }

      startTransition(() => router.refresh());
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Action failed.");
    } finally {
      setBusyKey("");
    }
  }

  async function decideRequest(request: PendingRequest, decision: "approved" | "rejected") {
    setBusyKey(`${decision}:${request.id}`);
    setMessage("");
    setError("");

    try {
      await parseActionResponse(
        await fetch("/api/admin/curriculum/subject-visibility", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requestId: request.id,
            decision,
          }),
        })
      );

      setMessage(`Request ${decision}.`);
      startTransition(() => router.refresh());
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to decide request.");
    } finally {
      setBusyKey("");
    }
  }

  function renderSubjectCard(subject: SubjectItem) {
    const pending = pendingBySubject.get(subject.id) ?? [];
    const toggleAction: SubjectVisibilityAction = subject.isVisible ? "hide" : "show";
    const toggleBusy = busyKey === `${toggleAction}:${subject.id}`;
    const removeBusy = busyKey === `remove:${subject.id}`;

    return (
      <Card
        key={subject.id}
        className="rounded-[28px] border border-slate-200/80 bg-white/92 shadow-[0_24px_70px_-54px_rgba(15,23,42,0.28)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/84"
      >
        <CardContent className="p-6">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => void submitSubjectAction(subject, toggleAction)}
              disabled={Boolean(busyKey)}
              className={cn(
                "mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                subject.isVisible
                  ? "border-[#2f6fff] bg-[#eef4ff] text-[#2f6fff]"
                  : "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              )}
              aria-label={`${subject.isVisible ? "Hide" : "Show"} ${subject.title}`}
            >
              {toggleBusy ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : subject.isVisible ? (
                <Check className="h-6 w-6" />
              ) : (
                <span className="h-5 w-5 rounded border-2 border-current" />
              )}
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-xl font-semibold text-slate-950 dark:text-slate-50">{subject.title}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                    {subject.chapterCount} chapters, {subject.lessonCount} lessons
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-semibold",
                    subject.isVisible
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  )}
                >
                  {subject.isVisible ? "Shown" : "Hidden"}
                </span>
              </div>

              {pending.length > 0 ? (
                <div className="mt-4 space-y-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
                  {pending.map((request) => (
                    <p key={request.id} className="flex items-center gap-2">
                      <Clock3 className="h-3.5 w-3.5 shrink-0" />
                      Pending approval to {formatAction(request.action)}, requested by {request.requestedByEmail}.
                    </p>
                  ))}
                </div>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-2">
                <Button asChild className="rounded-full">
                  <Link href={`/admin/curriculum/${schoolSlug}/${subject.slug}`}>
                    Open subject
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void submitSubjectAction(subject, toggleAction)}
                  disabled={Boolean(busyKey)}
                  className="rounded-full"
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

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void submitSubjectAction(subject, "remove")}
                  disabled={Boolean(busyKey)}
                  className="rounded-full border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
                >
                  {removeBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                  Remove
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  function renderSection(title: string, description: string, items: SubjectItem[], empty: string) {
    return (
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950 dark:text-slate-50">{title}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{description}</p>
        </div>

        {items.length === 0 ? (
          <Card className="rounded-[28px] border border-dashed border-slate-300 bg-white/80 dark:border-slate-700 dark:bg-slate-900/70">
            <CardContent className="p-6 text-sm text-slate-500 dark:text-slate-300">{empty}</CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map(renderSubjectCard)}</div>
        )}
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[22px] border border-[#dbe5ff] bg-white/86 px-4 py-3 text-sm text-slate-600 shadow-sm">
        Tick a subject to show it for {schoolTitle}; untick it to hide it. Remove deletes the subject after approval unless an
        approver is making the change.
      </div>

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

      {canApprove && pendingRequests.length > 0 ? (
        <section className="space-y-3 rounded-[28px] border border-amber-200 bg-amber-50/80 p-5">
          <div>
            <h2 className="text-xl font-semibold text-amber-950">Pending approvals</h2>
            <p className="mt-1 text-sm text-amber-800">Approve or reject requested subject visibility changes.</p>
          </div>
          <div className="space-y-2">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-slate-950">
                    {request.subjectTitle}: {formatAction(request.action)}
                  </p>
                  <p className="text-xs font-medium text-slate-500">
                    Requested by {request.requestedByEmail} on {formatDate(request.createdAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => void decideRequest(request, "approved")}
                    disabled={Boolean(busyKey)}
                    className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    {busyKey === `approved:${request.id}` ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    Approve
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => void decideRequest(request, "rejected")}
                    disabled={Boolean(busyKey)}
                    className="rounded-full"
                  >
                    {busyKey === `rejected:${request.id}` ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <X className="mr-2 h-4 w-4" />
                    )}
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {renderSection(
        "Selected Subject",
        `Subjects currently shown for ${schoolTitle}.`,
        visibleSubjects,
        "No selected subjects yet for this school."
      )}

      {renderSection(
        "Unselected Subject",
        `Subjects currently hidden for ${schoolTitle}.`,
        hiddenSubjects,
        "All available subjects are already selected for this school."
      )}
    </div>
  );
}
