import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  Mail,
  School,
  ShieldAlert,
  UserSearch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/button";
import { listCurriculumSchools } from "@/lib/curriculum-portal";
import { listStudentAssignedModuleLessons } from "@/lib/module-editor";
import { getStudentProgress } from "@/lib/student-progress";
import { listUsersWithPortals, type AuthUser } from "@/lib/auth";
import type { QuizAttemptReview, StudentProgress } from "@/types/lms";

export const dynamic = "force-dynamic";

type StudentUser = Awaited<ReturnType<typeof listUsersWithPortals>>[number];

type StudentAuditEvent = {
  id: string;
  occurredAt: Date;
  title: string;
  description: string;
  tone: "neutral" | "success" | "warning";
};

type StudentAuditSummary = {
  user: StudentUser;
  assignedLessonCount: number;
  completedLessonCount: number;
  overallProgress: number;
  totalTimeSpentMinutes: number;
  quizAttemptCount: number;
  averageQuizScore: number | null;
  lastActivityAt: Date | null;
  events: StudentAuditEvent[];
  loadError: string | null;
};

const UNASSIGNED_SCHOOL_SLUG = "__unassigned";

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "No activity yet";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Unknown time";

  return parsed.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(minutes: number) {
  if (minutes <= 0) return "0m";
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
}

function getStudentName(user: Pick<AuthUser, "firstName" | "lastName" | "email">) {
  const fullName = `${user.firstName} ${user.lastName}`.trim();
  return fullName || user.email;
}

function getStudentSchoolSlugs(user: StudentUser) {
  const slugs = user.schoolSlugs.length > 0 ? user.schoolSlugs : user.schoolSlug ? [user.schoolSlug] : [];
  const uniqueSlugs = Array.from(
    new Set(slugs.map((slug) => slug.trim().toLowerCase()).filter(Boolean))
  );

  return uniqueSlugs.length > 0 ? uniqueSlugs : [UNASSIGNED_SCHOOL_SLUG];
}

function collectQuizAttempts(progress: StudentProgress[]) {
  return progress
    .flatMap((record) => {
      return (record.quizScores ?? []).flatMap((score, scoreIndex) => {
        const history = score.attemptHistory ?? [];
        if (history.length > 0) {
          return history.map((attempt) => ({
            ...attempt,
            materialId: attempt.materialId || record.materialId,
          }));
        }

        const recordId =
          "id" in record && typeof record.id === "string" ? record.id : record.materialId;
        const attemptCount = Math.max(1, Number(score.attempts) || 0);
        const completedAt = score.lastAttempt ?? record.lastAccessed;
        return Array.from({ length: attemptCount }, (_, attemptIndex) => ({
          attemptId: `quiz-summary-${recordId}-${score.quizId}-${scoreIndex}-${attemptIndex}`,
          quizId: score.quizId,
          quizTitle: score.quizTitle ?? score.quizId,
          materialId: record.materialId,
          score: score.score,
          earnedPoints: score.earnedPoints ?? score.score,
          totalPoints: score.totalPoints ?? 100,
          passed: score.passed ?? (score.score >= 70),
          startedAt: completedAt,
          completedAt,
          timeSpentSeconds: 0,
          questionResults: [],
        }));
      });
    })
    .sort((left, right) => new Date(right.completedAt).getTime() - new Date(left.completedAt).getTime());
}

function buildProgressEvents(progress: StudentProgress[]): StudentAuditEvent[] {
  return progress.map((record): StudentAuditEvent => ({
    id: `progress-${record.materialId}`,
    occurredAt: new Date(record.lastAccessed),
    title: record.completed ? "Completed material" : "Opened material",
    description: `${record.materialId} · ${Math.round(record.progress ?? 0)}% progress`,
    tone: record.completed ? "success" : "neutral",
  }));
}

function buildQuizEvents(attempts: (QuizAttemptReview & { materialId: string })[]): StudentAuditEvent[] {
  return attempts.map((attempt): StudentAuditEvent => ({
    id: `quiz-${attempt.attemptId}`,
    occurredAt: new Date(attempt.completedAt),
    title: attempt.passed ? "Passed quiz" : "Submitted quiz",
    description: `${attempt.quizTitle} · ${attempt.score}% · ${attempt.earnedPoints}/${attempt.totalPoints} points`,
    tone: attempt.passed ? "success" : "warning",
  }));
}

async function loadStudentAudit(user: StudentUser): Promise<StudentAuditSummary> {
  try {
    const [progress, assignedLessons] = await Promise.all([
      getStudentProgress(user.id),
      listStudentAssignedModuleLessons(user),
    ]);
    const progressByMaterial = new Map(progress.map((record) => [record.materialId, record]));
    const assignedProgressValues = assignedLessons.map((lesson) => progressByMaterial.get(lesson.lessonId)?.progress ?? 0);
    const fallbackProgressValues = progress.map((record) => record.progress ?? 0);
    const progressValues = assignedProgressValues.length > 0 ? assignedProgressValues : fallbackProgressValues;
    const overallProgress =
      progressValues.length > 0
        ? Math.round(progressValues.reduce((sum, value) => sum + value, 0) / progressValues.length)
        : 0;
    const assignedLessonIds = new Set(assignedLessons.map((lesson) => lesson.lessonId));
    const completedLessonCount =
      assignedLessonIds.size > 0
        ? Array.from(assignedLessonIds).filter((lessonId) => progressByMaterial.get(lessonId)?.completed).length
        : progress.filter((record) => record.completed).length;
    const quizAttempts = collectQuizAttempts(progress);
    const averageQuizScore =
      quizAttempts.length > 0
        ? Math.round(quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / quizAttempts.length)
        : null;
    const totalTimeSpentMinutes = progress.reduce((sum, record) => sum + (record.timeSpent ?? 0), 0);
    const activityDates = [
      ...progress.map((record) => new Date(record.lastAccessed)),
      ...quizAttempts.map((attempt) => new Date(attempt.completedAt)),
    ].filter((date) => !Number.isNaN(date.getTime()));
    const accountEvent: StudentAuditEvent = {
      id: `account-${user.id}`,
      occurredAt: user.createdAt,
      title: "Student account created",
      description: user.email,
      tone: "neutral",
    };
    const events: StudentAuditEvent[] = [
      accountEvent,
      ...buildProgressEvents(progress),
      ...buildQuizEvents(quizAttempts),
    ].sort((left, right) => right.occurredAt.getTime() - left.occurredAt.getTime());

    return {
      user,
      assignedLessonCount: assignedLessons.length,
      completedLessonCount,
      overallProgress,
      totalTimeSpentMinutes,
      quizAttemptCount: quizAttempts.length,
      averageQuizScore,
      lastActivityAt:
        activityDates.length > 0
          ? new Date(Math.max(...activityDates.map((date) => date.getTime())))
          : null,
      events,
      loadError: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load progress records.";

    return {
      user,
      assignedLessonCount: 0,
      completedLessonCount: 0,
      overallProgress: 0,
      totalTimeSpentMinutes: 0,
      quizAttemptCount: 0,
      averageQuizScore: null,
      lastActivityAt: null,
      events: [
        {
          id: `account-${user.id}`,
          occurredAt: user.createdAt,
          title: "Student account created",
          description: user.email,
          tone: "neutral",
        },
      ],
      loadError: message,
    };
  }
}

function getProgressTone(progress: number) {
  if (progress >= 80) return "text-emerald-600";
  if (progress >= 40) return "text-blue-600";
  return "text-orange-600";
}

export default async function AdminStudentAuditPage() {
  const [schools, users] = await Promise.all([listCurriculumSchools(), listUsersWithPortals()]);
  const students = users.filter((user) => user.portals.includes("student"));
  const studentAudits = await Promise.all(students.map(loadStudentAudit));
  const auditsByUserId = new Map(studentAudits.map((audit) => [audit.user.id, audit]));
  const knownSchools = new Map(schools.map((school) => [school.slug, school]));
  const schoolSlugs = new Set<string>(schools.map((school) => school.slug));

  for (const student of students) {
    for (const schoolSlug of getStudentSchoolSlugs(student)) {
      schoolSlugs.add(schoolSlug);
    }
  }

  const schoolGroups = Array.from(schoolSlugs)
    .map((schoolSlug) => {
      const school = knownSchools.get(schoolSlug);
      const groupStudents = students
        .filter((student) => getStudentSchoolSlugs(student).includes(schoolSlug))
        .map((student) => auditsByUserId.get(student.id))
        .filter((audit): audit is StudentAuditSummary => Boolean(audit))
        .sort((left, right) => getStudentName(left.user).localeCompare(getStudentName(right.user)));

      return {
        slug: schoolSlug,
        title: school?.title ?? (schoolSlug === UNASSIGNED_SCHOOL_SLUG ? "Unassigned Students" : schoolSlug),
        students: groupStudents,
        known: Boolean(school),
      };
    })
    .sort((left, right) => {
      if (left.slug === UNASSIGNED_SCHOOL_SLUG) return 1;
      if (right.slug === UNASSIGNED_SCHOOL_SLUG) return -1;
      return left.title.localeCompare(right.title);
    });

  const totalProgress =
    studentAudits.length > 0
      ? Math.round(studentAudits.reduce((sum, audit) => sum + audit.overallProgress, 0) / studentAudits.length)
      : 0;
  const totalQuizAttempts = studentAudits.reduce((sum, audit) => sum + audit.quizAttemptCount, 0);
  const totalCompleted = studentAudits.reduce((sum, audit) => sum + audit.completedLessonCount, 0);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7faff_0%,#eef4ff_48%,#f9fbff_100%)] dark:bg-[linear-gradient(180deg,#020617_0%,#0f172a_52%,#020617_100%)]">
      <main className="portal-page-width px-4 pb-12 pt-5 sm:px-6 lg:px-8 lg:pb-16">
        <div className="space-y-5">
          <Button
            asChild
            variant="outline"
            className="h-11 w-fit border-[#d8cdb7] bg-white/80 px-5 text-slate-700 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.65)] backdrop-blur hover:border-[#cabb9f] hover:bg-white hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-900"
          >
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin
            </Link>
          </Button>

          <section className="rounded-[30px] border border-white/70 bg-white/92 p-6 shadow-[0_36px_90px_-68px_rgba(37,99,235,0.58)] dark:border-slate-800 dark:bg-slate-900/84">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-[linear-gradient(180deg,#eef4ff_0%,#dfe8ff_100%)] text-[#2f6fff]">
                  <UserSearch className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Student Audit Trail</p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
                    Schools, Students, Progress, and Logs
                  </h1>
                  <p className="mt-2 max-w-3xl text-[15px] leading-7 text-slate-500 dark:text-slate-300">
                    Review every school, the students assigned there, each learner&apos;s curriculum progress, quiz results, and recent audit trail.
                  </p>
                </div>
              </div>
              <span className="inline-flex h-10 items-center rounded-full border border-[#dce7ff] bg-[#f4f8ff] px-4 text-sm font-semibold text-[#2f6fff]">
                {students.length} students
              </span>
            </div>
          </section>

          <section className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[22px] border border-slate-200/80 bg-white/92 p-5 shadow-[0_24px_60px_-50px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-900/84">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Average Progress</p>
              <p className={cn("mt-3 text-4xl font-bold", getProgressTone(totalProgress))}>{totalProgress}%</p>
            </div>
            <div className="rounded-[22px] border border-slate-200/80 bg-white/92 p-5 shadow-[0_24px_60px_-50px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-900/84">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Completed Lessons</p>
              <p className="mt-3 text-4xl font-bold text-slate-950 dark:text-slate-50">{totalCompleted}</p>
            </div>
            <div className="rounded-[22px] border border-slate-200/80 bg-white/92 p-5 shadow-[0_24px_60px_-50px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-900/84">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Quiz Attempts</p>
              <p className="mt-3 text-4xl font-bold text-slate-950 dark:text-slate-50">{totalQuizAttempts}</p>
            </div>
          </section>

          <section className="space-y-4">
            {schoolGroups.length === 0 ? (
              <div className="rounded-[24px] border border-slate-200/80 bg-white/95 px-5 py-10 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/84 dark:text-slate-300">
                No schools or student accounts found yet.
              </div>
            ) : (
              schoolGroups.map((school) => {
                const averageProgress =
                  school.students.length > 0
                    ? Math.round(
                        school.students.reduce((sum, audit) => sum + audit.overallProgress, 0) /
                          school.students.length
                      )
                    : 0;

                return (
                  <details
                    key={school.slug}
                    open={school.students.length > 0}
                    className="overflow-hidden rounded-[26px] border border-slate-200/80 bg-white/95 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.5)] dark:border-slate-800 dark:bg-slate-900/84"
                  >
                    <summary className="grid cursor-pointer list-none gap-4 border-b border-slate-200 bg-[#f8fbff] px-5 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-800 dark:bg-slate-950/70 sm:grid-cols-[minmax(0,1fr)_auto] [&::-webkit-details-marker]:hidden">
                      <span className="flex min-w-0 items-start gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-[#eef4ff] text-[#2f6fff]">
                          <School className="h-5 w-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-lg font-semibold text-slate-950 dark:text-slate-50">
                            {school.title}
                          </span>
                          <span className="mt-1 block text-sm text-slate-500 dark:text-slate-300">
                            {school.students.length} students · {averageProgress}% average progress
                          </span>
                          {!school.known && school.slug !== UNASSIGNED_SCHOOL_SLUG && (
                            <span className="mt-2 inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                              School slug has students but is not in curriculum
                            </span>
                          )}
                        </span>
                      </span>
                      <span className="inline-flex h-10 items-center justify-center rounded-full border border-[#dce7ff] bg-white px-4 text-sm font-semibold text-[#2f6fff] dark:border-slate-700 dark:bg-slate-900">
                        {school.students.length} learners
                      </span>
                    </summary>

                    {school.students.length === 0 ? (
                      <div className="px-5 py-8 text-sm text-slate-500 dark:text-slate-300">
                        No students assigned to this school yet.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {school.students.map((audit) => (
                          <details key={`${school.slug}-${audit.user.id}`} className="group">
                            <summary className="grid cursor-pointer list-none gap-4 px-5 py-5 hover:bg-[#fbfdff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-slate-950/45 md:grid-cols-[minmax(220px,1.1fr)_repeat(4,minmax(120px,0.55fr))] [&::-webkit-details-marker]:hidden">
                              <span className="min-w-0">
                                <span className="block truncate text-base font-semibold text-slate-950 dark:text-slate-50">
                                  {getStudentName(audit.user)}
                                </span>
                                <span className="mt-1 flex min-w-0 items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
                                  <Mail className="h-4 w-4 shrink-0" />
                                  <span className="truncate">{audit.user.email}</span>
                                </span>
                              </span>
                              <span>
                                <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                                  Progress
                                </span>
                                <span className={cn("mt-1 block text-2xl font-bold", getProgressTone(audit.overallProgress))}>
                                  {audit.overallProgress}%
                                </span>
                              </span>
                              <span>
                                <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                                  Lessons
                                </span>
                                <span className="mt-1 block text-sm font-semibold text-slate-900 dark:text-slate-50">
                                  {audit.completedLessonCount}/{audit.assignedLessonCount}
                                </span>
                              </span>
                              <span>
                                <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                                  Quiz Avg
                                </span>
                                <span className="mt-1 block text-sm font-semibold text-slate-900 dark:text-slate-50">
                                  {audit.averageQuizScore === null ? "No quiz" : `${audit.averageQuizScore}%`}
                                </span>
                              </span>
                              <span>
                                <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                                  Last Activity
                                </span>
                                <span className="mt-1 block text-sm font-semibold text-slate-900 dark:text-slate-50">
                                  {formatDate(audit.lastActivityAt)}
                                </span>
                              </span>
                            </summary>

                            <div className="grid gap-4 bg-[#f8fbff] px-5 pb-5 dark:bg-slate-950/35 lg:grid-cols-[280px_minmax(0,1fr)]">
                              <div className="rounded-[20px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                                <h3 className="text-sm font-semibold text-slate-950 dark:text-slate-50">Student Summary</h3>
                                <div className="mt-4 grid gap-3 text-sm">
                                  <span className="flex items-center justify-between gap-3">
                                    <span className="text-slate-500">Assigned lessons</span>
                                    <span className="font-semibold">{audit.assignedLessonCount}</span>
                                  </span>
                                  <span className="flex items-center justify-between gap-3">
                                    <span className="text-slate-500">Completed lessons</span>
                                    <span className="font-semibold">{audit.completedLessonCount}</span>
                                  </span>
                                  <span className="flex items-center justify-between gap-3">
                                    <span className="text-slate-500">Study time</span>
                                    <span className="font-semibold">{formatDuration(audit.totalTimeSpentMinutes)}</span>
                                  </span>
                                  <span className="flex items-center justify-between gap-3">
                                    <span className="text-slate-500">Quiz attempts</span>
                                    <span className="font-semibold">{audit.quizAttemptCount}</span>
                                  </span>
                                </div>
                                {audit.loadError && (
                                  <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-800">
                                    <ShieldAlert className="mr-2 inline h-4 w-4" />
                                    {audit.loadError}
                                  </div>
                                )}
                              </div>

                              <div className="rounded-[20px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                                <h3 className="text-sm font-semibold text-slate-950 dark:text-slate-50">Audit Trail</h3>
                                <div className="mt-4 space-y-3">
                                  {audit.events.length === 0 ? (
                                    <p className="text-sm text-slate-500 dark:text-slate-300">No audit events found yet.</p>
                                  ) : (
                                    audit.events.slice(0, 12).map((event) => (
                                      <div
                                        key={event.id}
                                        className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3 text-sm dark:border-slate-800 dark:bg-slate-950 sm:grid-cols-[1.25rem_minmax(0,1fr)_180px]"
                                      >
                                        <span
                                          className={cn(
                                            "mt-0.5 flex h-5 w-5 items-center justify-center rounded-full",
                                            event.tone === "success"
                                              ? "bg-emerald-50 text-emerald-600"
                                              : event.tone === "warning"
                                                ? "bg-orange-50 text-orange-600"
                                                : "bg-blue-50 text-blue-600"
                                          )}
                                        >
                                          {event.tone === "success" ? (
                                            <CheckCircle2 className="h-4 w-4" />
                                          ) : event.tone === "warning" ? (
                                            <ShieldAlert className="h-4 w-4" />
                                          ) : (
                                            <BookOpen className="h-4 w-4" />
                                          )}
                                        </span>
                                        <span className="min-w-0">
                                          <span className="block font-semibold text-slate-950 dark:text-slate-50">
                                            {event.title}
                                          </span>
                                          <span className="mt-1 block truncate text-slate-500 dark:text-slate-300">
                                            {event.description}
                                          </span>
                                        </span>
                                        <span className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                          <Clock3 className="h-4 w-4" />
                                          {formatDate(event.occurredAt)}
                                        </span>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            </div>
                          </details>
                        ))}
                      </div>
                    )}
                  </details>
                );
              })
            )}
          </section>

          <section className="rounded-[22px] border border-blue-100 bg-blue-50/80 px-5 py-4 text-sm leading-6 text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-100">
            This page uses saved student progress and quiz attempts as the audit trail. Login history and every click can be added later once those events are written to a dedicated audit table.
          </section>
        </div>
      </main>
    </div>
  );
}
