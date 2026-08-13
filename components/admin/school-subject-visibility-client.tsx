"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Clock3, Eye, EyeOff, Loader2, Trash2, X } from "lucide-react";
import { Button, cn } from "@/components/ui/button";

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

  function renderSubjectRow(subject: SubjectItem) {
    const pending = pendingBySubject.get(subject.id) ?? [];
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
              {pending.length > 0 ? (
                <div className="mt-2 space-y-1 text-xs font-semibold text-amber-700">
                  {pending.map((request) => (
                    <p key={request.id} className="flex items-center gap-1.5">
                      <Clock3 className="h-3.5 w-3.5 shrink-0" />
                      Pending {formatAction(request.action)}
                    </p>
                  ))}
                </div>
              ) : null}
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

      <section className="overflow-hidden rounded-[24px] border border-[#dbe5ff] bg-white/92 shadow-sm dark:border-slate-800 dark:bg-slate-900/84">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left">
            <thead className="bg-[#f8fbff] text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Open subject</th>
                <th className="px-4 py-3">Hide</th>
                <th className="px-4 py-3">Remove</th>
              </tr>
            </thead>
            <tbody>
              {subjects.length === 0 ? (
                <tr className="border-t border-[#e7edf8]">
                  <td className="px-4 py-8 text-sm text-slate-500" colSpan={4}>
                    No subjects available for {schoolTitle}.
                  </td>
                </tr>
              ) : (
                subjects.map(renderSubjectRow)
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
