import Image from "next/image";
import Link from "next/link";
import { StudentSidebarPanel } from "@/components/lms/student-sidebar-panel";
import { getCurrentUser } from "@/lib/auth";
import { listCurriculumSchools } from "@/lib/curriculum-portal";
import { getCalendarEvents, getMaterials, getStudentProgress } from "@/lib/db-services";
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

const fallbackMaterials = [
  {
    id: "science-cells",
    title: "Year 7 Science: Cells and Systems",
    subject: "Science",
    description: "Build confidence with cell structures, microscopy, and short retrieval checks.",
    createdAt: new Date("2026-05-14"),
  },
  {
    id: "english-stories",
    title: "English: Reading for Meaning",
    subject: "English",
    description: "Close-reading practice with vocabulary support and comprehension prompts.",
    createdAt: new Date("2026-05-13"),
  },
  {
    id: "numeracy-ratio",
    title: "Numeracy: Ratios and Patterns",
    subject: "Numeracy",
    description: "Applied practice sets for ratio, sequences, and comparison problems.",
    createdAt: new Date("2026-05-12"),
  },
];

const tasks = [
  { label: "Complete microscopy recap", done: false, subject: "Science" },
  { label: "Read story extract chapter 2", done: true, subject: "English" },
  { label: "Finish ratio warm-up", done: false, subject: "Numeracy" },
];

const subjectColors: Record<string, { bg: string; text: string }> = {
  literature: { bg: "bg-[#fff3e6]", text: "text-[#c2410c]" },
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
  const schools = user?.schoolSlug ? await listCurriculumSchools() : [];
  const schoolTitle = user?.schoolSlug
    ? schools.find((school) => school.slug === user.schoolSlug)?.title ?? null
    : null;
  const studentId = user?.id ?? "student-1";

  const [materials, studentProgress, studentEvents] = await Promise.all([
    getMaterials(),
    getStudentProgress(studentId),
    getCalendarEvents(studentId),
  ]);

  const currentMaterials = materials.length > 0 ? materials.slice(0, 3) : fallbackMaterials;
  const overallProgress =
    studentProgress.length > 0
      ? Math.round(studentProgress.reduce((sum, item) => sum + item.progress, 0) / studentProgress.length)
      : 68;
  const completedCount = studentProgress.filter((item) => item.completed).length;
  const upcomingEvents = studentEvents.length > 0 ? studentEvents.slice(0, 2) : [];
  const heroCourse = currentMaterials[0];
  const nextMaterial = currentMaterials[1] ?? currentMaterials[0];

  return (
    <div className="min-h-screen bg-[#f4f8fc] text-slate-900">
      <div className="portal-page-width flex min-h-screen">
        <StudentSidebarPanel heading={studentName} subheading="Student portal" detail={schoolTitle} />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-[#e5edf7] bg-white/80 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 flex-1 items-center gap-3 rounded-full border border-[#dfe8f5] bg-white px-4 shadow-sm sm:max-w-xl">
                  <Search className="h-4 w-4 text-slate-400" />
                  <span className="truncate text-sm text-slate-400">Search for notes, lessons, or a topic</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="rounded-full border border-[#dfe8f5] bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
                  Level 12
                </div>
                <Link
                  href="/student/ai-assistant"
                  className="inline-flex items-center gap-2 rounded-full bg-[#2f6fff] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_24px_-14px_rgba(47,111,255,0.75)] transition-colors hover:bg-[#1d4ed8]"
                >
                  <Sparkles className="h-4 w-4" />
                  Ask Tutor
                </Link>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
            <div className="portal-page-width grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-5">
                <section className="overflow-hidden rounded-[2rem] border border-[#e6edf8] bg-white shadow-[0_22px_60px_-38px_rgba(15,23,42,0.3)]">
                  <div className="grid gap-0 lg:grid-cols-[220px_minmax(0,1fr)]">
                    <div className="relative min-h-[190px] bg-[#0b1d3a]">
                      <Image
                        src="/images/cells/microscope.png"
                        alt="Microscope lesson preview"
                        fill
                        className="object-cover opacity-90"
                      />
                    </div>
                    <div className="p-5 sm:p-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#159a61]">
                            Continue learning
                          </p>
                          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                            {heroCourse.title}
                          </h1>
                          <p className="mt-1 text-sm text-slate-500">
                            {heroCourse.subject} course · {overallProgress}% complete
                          </p>
                        </div>
                        <Link
                          href={`/student/materials/${heroCourse.id}`}
                          className="inline-flex items-center gap-2 rounded-full bg-[#2f6fff] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
                        >
                          <Play className="h-4 w-4" />
                          Resume
                        </Link>
                      </div>

                      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-[#2f6fff]" style={{ width: `${overallProgress}%` }} />
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        {[
                          { label: "Lessons done", value: `${completedCount || 4}/10`, icon: CheckSquare },
                          { label: "Study streak", value: "5 days", icon: TrendingUp },
                          { label: "Next review", value: "Today", icon: Target },
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
                </section>

                <section className="rounded-[2rem] border border-[#e6edf8] bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Next topic</p>
                      <h2 className="mt-1 text-xl font-bold text-slate-900">Types of cells</h2>
                    </div>
                    <Link
                      href={`/student/materials/${nextMaterial.id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0b1d3a] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#15305b]"
                    >
                      Start learning
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    {[
                      { title: "Simplify this topic", detail: "Short explanation first" },
                      { title: "Explain in more detail", detail: "Step-by-step notes" },
                      { title: "I have a question", detail: "Ask the tutor directly" },
                    ].map((item) => (
                      <div key={item.title} className="rounded-2xl border border-[#e7edf7] bg-[#fbfdff] p-4">
                        <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                        <p className="mt-1 text-xs text-slate-400">{item.detail}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-[2rem] border border-[#e6edf8] bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Assignments</p>
                      <h2 className="mt-1 text-xl font-bold text-slate-900">Your work this week</h2>
                    </div>
                    <Link href="/student/quizzes" className="text-sm font-semibold text-[#2f6fff] hover:underline">
                      See all
                    </Link>
                  </div>

                  <div className="mt-5 space-y-3">
                    {currentMaterials.map((material, index) => {
                      const badge = subjectBadge(material.subject ?? "");
                      const dueCopy = index === 0 ? "Due today" : index === 1 ? "Due in 2 days" : "Due Friday";
                      const action = index === 0 ? "Continue" : "Start";

                      return (
                        <div
                          key={material.id}
                          className="grid gap-4 rounded-3xl border border-[#edf2f8] bg-[#fbfdff] p-4 md:grid-cols-[minmax(0,1fr)_160px]"
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${badge.bg} ${badge.text}`}>
                                {material.subject}
                              </span>
                              <span className="text-xs font-medium text-slate-400">{dueCopy}</span>
                            </div>
                            <p className="mt-3 truncate text-sm font-bold text-slate-900">{material.title}</p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">{material.description}</p>
                          </div>
                          <div className="flex items-center justify-end">
                            <Link
                              href={`/student/materials/${material.id}`}
                              className="inline-flex w-full items-center justify-center rounded-full bg-[#2f6fff] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
                            >
                              {action}
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section className="rounded-[2rem] border border-[#e6edf8] bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Recent materials</p>
                      <h2 className="mt-1 text-xl font-bold text-slate-900">Latest additions</h2>
                    </div>
                    <Link href="/student/materials" className="text-sm font-semibold text-[#2f6fff] hover:underline">
                      View all
                    </Link>
                  </div>

                  <div className="mt-5 overflow-hidden rounded-3xl border border-[#edf2f8]">
                    {currentMaterials.map((material) => {
                      const badge = subjectBadge(material.subject ?? "");

                      return (
                        <div
                          key={material.id}
                          className="grid gap-3 border-b border-[#edf2f8] px-4 py-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_140px_110px]"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">{material.title}</p>
                            <p className="mt-1 truncate text-xs text-slate-400">{material.description}</p>
                          </div>
                          <div className="flex items-center">
                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${badge.bg} ${badge.text}`}>
                              {material.subject}
                            </span>
                          </div>
                          <div className="flex items-center text-xs font-medium text-slate-400">
                            {formatDate(material.createdAt)}
                          </div>
                        </div>
                      );
                    })}
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
                      { label: "Assignments due", value: "3", tone: "bg-[#fff3e6] text-[#f97316]" },
                      { label: "Topics mastered", value: `${completedCount || 4}`, tone: "bg-[#ecfbf3] text-[#159a61]" },
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
                    {(upcomingEvents.length > 0
                      ? upcomingEvents.map((event) => ({
                          title: event.title,
                          date: new Date(event.startTime),
                        }))
                      : [
                          { title: "Science quiz", date: new Date("2026-05-20T09:00:00") },
                          { title: "Literature discussion", date: new Date("2026-05-27T14:00:00") },
                        ]
                    ).map((event) => (
                      <div key={`${event.title}-${event.date.toISOString()}`} className="flex items-start gap-3 rounded-3xl bg-[#fbfdff] p-3">
                        <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl bg-[#eef4ff] text-[#2f6fff]">
                          <span className="text-[10px] font-bold uppercase">
                            {event.date.toLocaleString("en-GB", { month: "short" })}
                          </span>
                          <span className="text-lg font-black leading-none">{event.date.getDate()}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                          <p className="mt-1 text-xs text-slate-400">
                            {event.date.toLocaleString("en-GB", {
                              weekday: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-[2rem] border border-[#e6edf8] bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-[#2f6fff]" />
                    <h2 className="text-base font-bold text-slate-900">Today&apos;s tasks</h2>
                  </div>

                  <div className="mt-4 space-y-3">
                    {tasks.map((task) => {
                      const badge = subjectBadge(task.subject);

                      return (
                        <div key={task.label} className="flex items-center gap-3 rounded-3xl bg-[#fbfdff] p-3">
                          {task.done ? (
                            <CheckSquare className="h-4 w-4 shrink-0 text-[#2f6fff]" />
                          ) : (
                            <Square className="h-4 w-4 shrink-0 text-slate-300" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className={`truncate text-sm ${task.done ? "text-slate-400 line-through" : "text-slate-700"}`}>
                              {task.label}
                            </p>
                          </div>
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${badge.bg} ${badge.text}`}>
                            {task.subject}
                          </span>
                        </div>
                      );
                    })}
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
                        Ask for a simpler explanation, a worked example, or a quick quiz on the current topic.
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
