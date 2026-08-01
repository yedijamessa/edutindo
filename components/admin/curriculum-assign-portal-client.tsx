"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Plus,
  Search,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, cn } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  CurriculumAssignmentOption,
  CurriculumAssignmentPortalData,
  CurriculumAssignmentStudent,
} from "@/types/curriculum-assignments";

type BusyState = "assign" | `delete:${string}` | null;

interface CurriculumAssignPortalClientProps {
  initialData: CurriculumAssignmentPortalData;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function getStatusClass(status: CurriculumAssignmentStudent["status"]) {
  if (status === "active") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "pending") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

function getStudentSearchText(student: CurriculumAssignmentStudent) {
  return [
    student.name,
    student.email,
    student.status,
    student.portals.join(" "),
    student.schoolSlugs.join(" "),
    ...student.assignments.flatMap((assignment) => [
      assignment.moduleTitle,
      assignment.lessonTitle,
      assignment.subjectTitle,
      assignment.chapterTitle,
    ]),
  ]
    .join(" ")
    .toLowerCase();
}

async function parseMutationResponse(response: Response) {
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || "Action failed.");
  }

  return payload.data as CurriculumAssignmentPortalData;
}

export function CurriculumAssignPortalClient({ initialData }: CurriculumAssignPortalClientProps) {
  const [data, setData] = useState(initialData);
  const [query, setQuery] = useState("");
  const [selectedUserKey, setSelectedUserKey] = useState(initialData.users[0]?.key ?? "");
  const [selectedPlacementId, setSelectedPlacementId] = useState(initialData.moduleOptions[0]?.id ?? "");
  const [busy, setBusy] = useState<BusyState>(null);
  const [message, setMessage] = useState("");

  const filteredUsers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return data.users;

    return data.users.filter((student) => getStudentSearchText(student).includes(needle));
  }, [data.users, query]);

  const selectedUser = useMemo(
    () => data.users.find((student) => student.key === selectedUserKey) ?? data.users[0] ?? null,
    [data.users, selectedUserKey]
  );

  const selectedPlacement = useMemo(
    () => data.moduleOptions.find((option) => option.id === selectedPlacementId) ?? data.moduleOptions[0] ?? null,
    [data.moduleOptions, selectedPlacementId]
  );

  const assignedUsersCount = data.users.filter((student) => student.assignments.length > 0).length;
  const totalAssignments = data.users.reduce((total, student) => total + student.assignments.length, 0);
  const pendingUsersCount = data.users.filter((student) => student.status === "pending").length;

  useEffect(() => {
    if (selectedUserKey && data.users.some((student) => student.key === selectedUserKey)) return;
    setSelectedUserKey(data.users[0]?.key ?? "");
  }, [data.users, selectedUserKey]);

  useEffect(() => {
    if (selectedPlacementId && data.moduleOptions.some((option) => option.id === selectedPlacementId)) return;
    setSelectedPlacementId(data.moduleOptions[0]?.id ?? "");
  }, [data.moduleOptions, selectedPlacementId]);

  async function assignSelectedPlacement() {
    if (!selectedUser || !selectedPlacement || busy) return;

    setBusy("assign");
    setMessage("");

    try {
      const nextData = await parseMutationResponse(
        await fetch("/api/admin/curriculum-assignments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: selectedUser.userId,
            email: selectedUser.email,
            moduleId: selectedPlacement.moduleId,
            lessonId: selectedPlacement.lessonId,
          }),
        })
      );

      setData(nextData);
      setMessage(`Assigned ${selectedPlacement.moduleTitle} to ${selectedUser.email}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to assign module.");
    } finally {
      setBusy(null);
    }
  }

  async function removeAssignment(assignmentId: string) {
    if (busy) return;
    const shouldRemove = window.confirm("Remove this assignment from the student?");
    if (!shouldRemove) return;

    setBusy(`delete:${assignmentId}`);
    setMessage("");

    try {
      const nextData = await parseMutationResponse(
        await fetch("/api/admin/curriculum-assignments", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assignmentId }),
        })
      );

      setData(nextData);
      setMessage("Assignment removed.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to remove assignment.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-3 md:grid-cols-4">
        {[
          { label: "Users", value: data.users.length, icon: Users },
          { label: "Assigned users", value: assignedUsersCount, icon: CheckCircle2 },
          { label: "Assignments", value: totalAssignments, icon: BookOpen },
          { label: "Pending invites", value: pendingUsersCount, icon: UserRound },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-[24px] border border-[#dce6ff] bg-white/92 p-4 shadow-[0_24px_60px_-48px_rgba(37,99,235,0.55)]"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7184a6]">{item.label}</p>
                <Icon className="h-5 w-5 text-[#2f6fff]" />
              </div>
              <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{item.value}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(18rem,24rem)_1fr]">
        <div className="rounded-[28px] border border-[#dce6ff] bg-white/95 p-4 shadow-[0_32px_80px_-58px_rgba(37,99,235,0.58)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-950">Users</h2>
              <p className="text-sm font-medium text-[#7184a6]">{filteredUsers.length} shown</p>
            </div>
            <Badge className="border border-[#dce6ff] bg-[#f7faff] text-[#2f6fff]">{totalAssignments}</Badge>
          </div>

          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8da0bf]" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search users..."
              className="h-11 rounded-2xl border-[#dce6ff] bg-[#f8fbff] pl-9 text-[15px] shadow-none"
            />
          </div>

          <div className="mt-4 max-h-[34rem] space-y-2 overflow-y-auto pr-1">
            {filteredUsers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#dce6ff] p-4 text-sm font-medium text-[#7184a6]">
                No users found.
              </div>
            ) : (
              filteredUsers.map((student) => {
                const active = selectedUser?.key === student.key;

                return (
                  <button
                    key={student.key}
                    type="button"
                    onClick={() => setSelectedUserKey(student.key)}
                    className={cn(
                      "w-full rounded-2xl border p-3 text-left transition-colors",
                      active
                        ? "border-[#2f6fff] bg-[#eef4ff] text-slate-950"
                        : "border-[#e4ecfb] bg-white text-slate-800 hover:border-[#bcd0ff] hover:bg-[#f7faff]"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{student.name}</p>
                        <p className="truncate text-xs font-medium text-[#7184a6]">{student.email}</p>
                      </div>
                      <Badge className={cn("shrink-0 border", getStatusClass(student.status))}>{student.status}</Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2 text-xs font-semibold text-[#7184a6]">
                      <span>{student.assignments.length} assigned</span>
                      <span>{student.schoolSlugs[0] || "no school"}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-[28px] border border-[#dce6ff] bg-white/95 p-4 shadow-[0_32px_80px_-58px_rgba(37,99,235,0.58)] sm:p-5">
          {selectedUser ? (
            <div className="space-y-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-black tracking-tight text-slate-950">{selectedUser.name}</h2>
                    <Badge className={cn("border", getStatusClass(selectedUser.status))}>{selectedUser.status}</Badge>
                  </div>
                  <p className="mt-1 break-all text-sm font-medium text-[#7184a6]">{selectedUser.email}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.portals.map((portal) => (
                    <Badge key={portal} className="border border-[#dce6ff] bg-[#f7faff] text-[#53688f]">
                      {portal}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 rounded-[24px] border border-[#dce6ff] bg-[#f8fbff] p-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <select
                  value={selectedPlacementId}
                  onChange={(event) => setSelectedPlacementId(event.target.value)}
                  className="h-12 min-w-0 rounded-2xl border border-[#dce6ff] bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#2f6fff] focus:ring-2 focus:ring-[#2f6fff]/15"
                >
                  {data.moduleOptions.length === 0 ? (
                    <option value="">No module placements</option>
                  ) : (
                    data.moduleOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))
                  )}
                </select>
                <Button
                  type="button"
                  onClick={() => void assignSelectedPlacement()}
                  disabled={!selectedPlacement || busy === "assign"}
                  className="h-12 gap-2 rounded-2xl bg-[#2f6fff] px-5 text-sm font-bold text-white shadow-[0_22px_46px_-28px_rgba(37,99,235,0.9)] hover:bg-[#1d4ed8]"
                >
                  {busy === "assign" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Assign
                </Button>
              </div>

              {message ? (
                <div className="rounded-2xl border border-[#dce6ff] bg-white px-4 py-3 text-sm font-semibold text-[#53688f]">
                  {message}
                </div>
              ) : null}

              <div className="overflow-hidden rounded-[24px] border border-[#dce6ff]">
                <div className="hidden grid-cols-[1.1fr_1fr_1fr_0.8fr_auto] gap-3 border-b border-[#e5ecfb] bg-[#f8fbff] px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#7184a6] lg:grid">
                  <span>Curriculum</span>
                  <span>Chapter</span>
                  <span>Module</span>
                  <span>Assigned</span>
                  <span className="text-right">Action</span>
                </div>

                {selectedUser.assignments.length === 0 ? (
                  <div className="p-6 text-sm font-medium text-[#7184a6]">No assignments yet.</div>
                ) : (
                  <div className="divide-y divide-[#edf2fb]">
                    {selectedUser.assignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="grid gap-3 px-4 py-4 text-sm text-slate-800 lg:grid-cols-[1.1fr_1fr_1fr_0.8fr_auto] lg:items-center"
                      >
                        <div className="min-w-0">
                          <p className="font-bold text-slate-950">
                            {assignment.schoolTitle} / {assignment.yearTitle || assignment.yearSlug}
                          </p>
                          <p className="truncate text-xs font-medium text-[#7184a6]">
                            {assignment.subjectTitle || assignment.subjectSlug}
                          </p>
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-950">{assignment.chapterTitle || "Unlinked chapter"}</p>
                          <p className="truncate text-xs font-medium text-[#7184a6]">{assignment.lessonTitle}</p>
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-950">{assignment.moduleTitle}</p>
                          {assignment.href ? (
                            <a
                              href={assignment.href}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-[#2f6fff]"
                            >
                              Open <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : null}
                        </div>
                        <div className="text-xs font-semibold text-[#7184a6]">
                          <p>{formatDate(assignment.assignedAt)}</p>
                          {assignment.assignedByEmail ? <p>by {assignment.assignedByEmail}</p> : null}
                        </div>
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => void removeAssignment(assignment.id)}
                            disabled={busy === `delete:${assignment.id}`}
                            className="h-10 rounded-2xl border-red-100 bg-red-50 px-3 text-red-600 hover:border-red-200 hover:bg-red-100 hover:text-red-700"
                            aria-label={`Remove ${assignment.moduleTitle}`}
                          >
                            {busy === `delete:${assignment.id}` ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex min-h-[28rem] items-center justify-center rounded-[24px] border border-dashed border-[#dce6ff] text-sm font-semibold text-[#7184a6]">
              Select a user <ArrowRight className="ml-2 h-4 w-4" />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
