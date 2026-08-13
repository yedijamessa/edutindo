import Image from "next/image";
import Link from "next/link";
import { StudentSidebarPanel } from "@/components/lms/student-sidebar-panel";
import { getCurrentUser } from "@/lib/auth";
import { listCurriculumSchools } from "@/lib/curriculum-portal";
import { getCalendarEvents } from "@/lib/db-services";
import { listStudentAssignedModuleLessons } from "@/lib/module-editor";
import {
  CalendarDays,
  CheckSquare,
  ChevronRight,
  HelpCircle,
  Play,
  Search,
  Sparkles,
  Square,
  Target,
  TrendingUp,
} from "lucide-react";

export const dynamic = "force-dynamic";

const subjectColors: Record<string, { bg: string; text: string }> = {
  literature: { bg: "bg-[#fff3e6]", text: "text-[#c2410c]" },
  literasi: { bg: "bg-[#fff3e6]", text: "text-[#c2410c]" },
  numerasi: { bg: "bg-[#fff0f0]", text: "text-[#dc2626]" },
  numeracy: { bg: "bg-[#fff0f0]", text: "text-[#dc2626]" },
  science: { bg: "bg-[#e8f5e9]", text: "text-[#159a61]" },
  english: { bg: "bg-[#e8f0fe]", text: "text-[#2563eb]" },
  math: { bg: "bg-[#fef3c7]", text: "text-[#b45309]" },
};

function subjectBadge(subject: string) {
  const key = subject.toLowerCase();
  return (
    Object.entries(subjectColors).find(([name]) => key.includes(name))?.[1] ?? {
      bg: "bg-slate-100",
      text: "text-slate-600",
    }
  );
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function StudentDashboard() {
  const user = await getCurrentUser();
  const studentName = user ? `${user.firstName} ${user.lastName}`.trim() || user.email : "Student";
  const schools = user?.schoolSlugs && user.schoolSlugs.length > 0 ? await listCurriculumSchools() : [];
  const assignedSchoolTitles = (user?.schoolSlugs ?? [])
    .map((schoolSlug) => schools.find((school) => school.slug === schoolSlug)?.title)
    .filter((title): title is string => Boolean(title));
  const schoolTitle =
    assignedSchoolTitles.length <= 1
      ? assignedSchoolTitles[0] ?? null
      : `${assignedSchoolTitles.length} schools assigned`;

  const [assignedLessons, studentEvents] = await Promise.all([
    listStudentAssignedModuleLessons(user),
    getCalendarEvents(user?.id ?? ""),
  ]);

  const visibleLessons = assignedLessons.slice(0, 3);
  const heroLesson = visibleLessons[0] ?? null;
  const nextLesson = visibleLessons[1] ?? null;
  const overallProgress = 0;
  const completedCount = 0;
  const upcomingEvents = studentEvents.slice(0, 2);

  return (
    <div className="min-h-screen bg-[#f4f8fc] text-slate-900">
      <div className="portal-page-width flex min-h-screen">
        <StudentSidebarPanel
          heading={studentName}
          subheading="Student portal"
          detail={schoolTitle}
          canOpenLockedItems={Boolean(user?.isAdmin)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-[#e5edf7] bg-white/80 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 flex-1 items-center gap-3 rounded-full border border-[#dfe8f5] bg-white px-4 shadow-sm sm:max-w-xl">
                  <Search className="h-4 w-4 text-slate-400" />
                  <span className="truncate text-sm text-slate-400">Search for assigned lessons or a topic</span>
                </div>
              </div>
              <Link
                href="/student/ai-assistant"
                className="inline-flex items-center gap-2 rounded-full bg-[#2f6fff] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_24px_-14px_rgba(47,111,255,0.75)] transition-colors hover:bg-[#1d4ed8]"
              >
                <Sparkles className="h-4 w-4" />
                Ask Tutor
              </Link>
            </div>
          </header>

          <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
            <div className="portal-page-width grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-5">
                <section className="overflow-hidden rounded-[2rem] border border-[#e6edf8] bg-white shadow-[0_22px_60px_-38px_rgba(15,23,42,0.3)]">
                  {heroLesson ? (
                    <div className="grid gap-0 lg:grid-cols-[220px_minmax(0,1fr)]">
                      <div className="relative min-h-[190px] bg-[#0b1d3a]">
                        <Image
                          src="/images/cells/microscope.png"
                          alt="Assigned lesson preview"
                          fill
                          className="object-cover opacity-90"
                        />
                      </div>
                      <div className="p-5 sm:p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#159a61]">
                              Assigned lesson
                            </p>
                            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                              {heroLesson.moduleTitle}
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                              {heroLesson.subject} / {heroLesson.chapterTitle}
                            </p>
                          </div>
                          <Link
                            href={heroLesson.href}
                            className="inline-flex items-center gap-2 rounded-full bg-[#2f6fff] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
                          >
                            <Play className="h-4 w-4" />
                            Open lesson
                          </Link>
                        </div>

                        <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-[#2f6fff]" style={{ width: `${overallProgress}%` }} />
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                          {[
                            { label: "Assigned lessons", value: `${assignedLessons.length}`, icon: CheckSquare },
                            { label: "Lessons done", value: `${completedCount}`, icon: TrendingUp },
                            { label: "Progress", value: `${overallProgress}%`, icon: Target },
                          ].map((item) => {
                            const Icon = item.icon;

                            return (
                              <div key={item.label} className="rounded-2xl bg-[#f7faff] p-3">
                                <Icon className="h-4 w-4 text-[#2f6fff]" />
                                <p className="mt-3 text-lg font-bold text-slate-900">{item.value}</p>
                                <p className="text-xs text-slate-400">{item.label}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2f6fff]">Assigned lessons</p>
                      <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">No lessons assigned yet</h1>
                      <p className="mt-2 text-sm text-slate-500">
                        When an admin sends a lesson assignment to this account, it will appear here.
                      </p>
                    </div>
                  )}
                </section>

                {nextLesson ? (
                  <section className="rounded-[2rem] border border-[#e6edf8] bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Next assigned lesson</p>
                        <h2 className="mt-1 text-xl font-bold text-slate-900">{nextLesson.moduleTitle}</h2>
                      </div>
                      <Link
                        href={nextLesson.href}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0b1d3a] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#15305b]"
                      >
                        Start learning
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </section>
                ) : null}

                <section className="rounded-[2rem] border border-[#e6edf8] bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Assignments</p>
                      <h2 className="mt-1 text-xl font-bold text-slate-900">Your assigned lessons</h2>
                    </div>
                    <Link href="/student/materials" className="text-sm font-semibold text-[#2f6fff] hover:underline">
                      See all
                    </Link>
                  </div>

                  <div className="mt-5 space-y-3">
                    {visibleLessons.length === 0 ? (
                      <div className="rounded-3xl border border-[#edf2f8] bg-[#fbfdff] p-4 text-sm text-slate-500">
                        No assigned lessons yet.
                      </div>
                    ) : (
                      visibleLessons.map((lesson, index) => {
                        const badge = subjectBadge(lesson.subject);
                        const action = index === 0 ? "Continue" : "Start";

                        return (
                          <div
                            key={lesson.id}
                            className="grid gap-4 rounded-3xl border border-[#edf2f8] bg-[#fbfdff] p-4 md:grid-cols-[minmax(0,1fr)_160px]"
                          >
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${badge.bg} ${badge.text}`}>
                                  {lesson.subject}
                                </span>
                                <span className="text-xs font-medium text-slate-400">Assigned</span>
                              </div>
                              <p className="mt-3 truncate text-sm font-bold text-slate-900">{lesson.moduleTitle}</p>
                              <p className="mt-1 text-xs leading-5 text-slate-500">{lesson.description}</p>
                            </div>
                            <div className="flex items-center justify-end">
                              <Link
                                href={lesson.href}
                                className="inline-flex w-full items-center justify-center rounded-full bg-[#2f6fff] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
                              >
                                {action}
                              </Link>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>

                <section className="rounded-[2rem] border border-[#e6edf8] bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Recent materials</p>
                      <h2 className="mt-1 text-xl font-bold text-slate-900">Latest assigned</h2>
                    </div>
                    <Link href="/student/materials" className="text-sm font-semibold text-[#2f6fff] hover:underline">
                      View all
                    </Link>
                  </div>

                  <div className="mt-5 overflow-hidden rounded-3xl border border-[#edf2f8]">
                    {visibleLessons.length === 0 ? (
                      <div className="px-4 py-4 text-sm text-slate-500">No assigned materials yet.</div>
                    ) : (
                      visibleLessons.map((lesson) => {
                        const badge = subjectBadge(lesson.subject);

                        return (
                          <div
                            key={lesson.id}
                            className="grid gap-3 border-b border-[#edf2f8] px-4 py-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_140px_110px]"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900">{lesson.moduleTitle}</p>
                              <p className="mt-1 truncate text-xs text-slate-400">{lesson.description}</p>
                            </div>
                            <div className="flex items-center">
                              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${badge.bg} ${badge.text}`}>
                                {lesson.subject}
                              </span>
                            </div>
                            <div className="flex items-center text-xs font-medium text-slate-400">
                              {formatDate(lesson.createdAt)}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>
              </div>

              <div className="space-y-5">
                <section className="rounded-[2rem] border border-[#e6edf8] bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Today</p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">Learning snapshot</h2>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    {[
                      { label: "Overall progress", value: `${overallProgress}%`, tone: "bg-[#eef4ff] text-[#2f6fff]" },
                      { label: "Assigned lessons", value: `${assignedLessons.length}`, tone: "bg-[#fff3e6] text-[#f97316]" },
                      { label: "Topics mastered", value: `${completedCount}`, tone: "bg-[#ecfbf3] text-[#159a61]" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-3xl bg-[#fbfdff] p-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${item.tone}`}>
                          {item.label}
                        </span>
                        <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-[2rem] border border-[#e6edf8] bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-[#2f6fff]" />
                    <h2 className="text-base font-bold text-slate-900">Upcoming events</h2>
                  </div>

                  <div className="mt-4 space-y-3">
                    {upcomingEvents.length === 0 ? (
                      <div className="rounded-3xl bg-[#fbfdff] p-3 text-sm text-slate-500">No upcoming events.</div>
                    ) : (
                      upcomingEvents.map((event) => {
                        const date = new Date(event.startTime);

                        return (
                          <div key={`${event.title}-${date.toISOString()}`} className="flex items-start gap-3 rounded-3xl bg-[#fbfdff] p-3">
                            <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl bg-[#eef4ff] text-[#2f6fff]">
                              <span className="text-[10px] font-bold uppercase">
                                {date.toLocaleString("en-GB", { month: "short" })}
                              </span>
                              <span className="text-lg font-black leading-none">{date.getDate()}</span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                              <p className="mt-1 text-xs text-slate-400">
                                {date.toLocaleString("en-GB", {
                                  weekday: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>

                <section className="rounded-[2rem] border border-[#e6edf8] bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-[#2f6fff]" />
                    <h2 className="text-base font-bold text-slate-900">Today&apos;s tasks</h2>
                  </div>

                  <div className="mt-4 space-y-3">
                    {visibleLessons.length === 0 ? (
                      <div className="rounded-3xl bg-[#fbfdff] p-3 text-sm text-slate-500">No assigned tasks yet.</div>
                    ) : (
                      visibleLessons.map((lesson) => {
                        const badge = subjectBadge(lesson.subject);

                        return (
                          <div key={lesson.id} className="flex items-center gap-3 rounded-3xl bg-[#fbfdff] p-3">
                            <Square className="h-4 w-4 shrink-0 text-slate-300" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm text-slate-700">{lesson.moduleTitle}</p>
                            </div>
                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${badge.bg} ${badge.text}`}>
                              {lesson.subject}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>

                <section className="rounded-[2rem] border border-[#dce7ff] bg-[#eef4ff] p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#2f6fff]">
                      <HelpCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Need help?</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Ask for a simpler explanation, a worked example, or a quick quiz on the current assigned topic.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/student/ai-assistant"
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-[#2f6fff] transition-colors hover:bg-[#f8fbff]"
                  >
                    Open tutor chat
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </section>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
