import Link from "next/link";
import { BookOpen, CalendarDays, ChevronRight, Layers3, LibraryBig } from "lucide-react";
import { StudentSidebarPanel } from "@/components/lms/student-sidebar-panel";
import { getCurrentUser } from "@/lib/auth";
import { listCurriculumSchools } from "@/lib/curriculum-portal";
import { listStudentAssignedModuleLessons, type StudentAssignedModuleLesson } from "@/lib/module-editor";

export const dynamic = "force-dynamic";

const subjectColors: Record<string, { bg: string; text: string; border: string }> = {
  literature: { bg: "bg-[#fff3e6]", text: "text-[#c2410c]", border: "border-[#fed7aa]" },
  literasi: { bg: "bg-[#fff3e6]", text: "text-[#c2410c]", border: "border-[#fed7aa]" },
  numerasi: { bg: "bg-[#fff0f0]", text: "text-[#dc2626]", border: "border-[#fecaca]" },
  numeracy: { bg: "bg-[#fff0f0]", text: "text-[#dc2626]", border: "border-[#fecaca]" },
  science: { bg: "bg-[#e8f5e9]", text: "text-[#159a61]", border: "border-[#bbf7d0]" },
  english: { bg: "bg-[#e8f0fe]", text: "text-[#2563eb]", border: "border-[#bfdbfe]" },
  math: { bg: "bg-[#fef3c7]", text: "text-[#b45309]", border: "border-[#fde68a]" },
};

function subjectBadge(subject: string) {
  const key = subject.toLowerCase();
  return (
    Object.entries(subjectColors).find(([name]) => key.includes(name))?.[1] ?? {
      bg: "bg-slate-100",
      text: "text-slate-600",
      border: "border-slate-200",
    }
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function groupAssignedLessons(lessons: StudentAssignedModuleLesson[]) {
  const groups = new Map<string, StudentAssignedModuleLesson[]>();

  for (const lesson of lessons) {
    const key = lesson.subject || "Assigned";
    const existing = groups.get(key) ?? [];
    existing.push(lesson);
    groups.set(key, existing);
  }

  return Array.from(groups.entries()).sort(([left], [right]) => left.localeCompare(right));
}

export default async function StudentMaterialsPage() {
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

  const assignedLessons = await listStudentAssignedModuleLessons(user);
  const groupedLessons = groupAssignedLessons(assignedLessons);
  const latestAssigned = assignedLessons[0] ?? null;
  const chapterCount = new Set(assignedLessons.map((lesson) => lesson.chapterTitle).filter(Boolean)).size;
  const subjectCount = new Set(assignedLessons.map((lesson) => lesson.subject).filter(Boolean)).size;

  return (
    <div className="min-h-screen bg-[#f4f8fc] text-slate-900">
      <div className="portal-page-width flex min-h-screen">
        <StudentSidebarPanel heading={studentName} subheading="Student portal" detail={schoolTitle} />

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <div className="portal-page-width space-y-5">
            <section className="rounded-[2rem] border border-white/80 bg-white/95 p-5 shadow-[0_32px_80px_-58px_rgba(37,99,235,0.58)] sm:p-7">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-[#eef4ff] text-[#2f6fff]">
                    <BookOpen className="h-8 w-8" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#ea580c]">Assigned Materials</p>
                    <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-[2.45rem]">
                      Learning Materials
                    </h1>
                    <p className="mt-2 max-w-2xl text-[15px] font-medium leading-7 text-[#64789c]">
                      Only lessons assigned to this student are shown here.
                    </p>
                  </div>
                </div>

                <Link
                  href="/student/learning-path"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#dce6ff] bg-white px-5 text-sm font-bold text-[#2f6fff] shadow-sm transition-colors hover:bg-[#f7faff]"
                >
                  Learning Path
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </section>

            <section className="grid gap-3 md:grid-cols-3">
              {[
                { label: "Assigned lessons", value: assignedLessons.length, icon: LibraryBig },
                { label: "Assigned subjects", value: subjectCount, icon: BookOpen },
                { label: "Assigned chapters", value: chapterCount, icon: Layers3 },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-[24px] border border-[#dce6ff] bg-white/95 p-4 shadow-[0_24px_60px_-48px_rgba(37,99,235,0.55)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7184a6]">{item.label}</p>
                      <Icon className="h-5 w-5 text-[#2f6fff]" />
                    </div>
                    <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{item.value}</p>
                  </div>
                );
              })}
            </section>

            {latestAssigned ? (
              <section className="rounded-[2rem] border border-[#dce6ff] bg-white/95 p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#159a61]">Latest assignment</p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                      {latestAssigned.moduleTitle}
                    </h2>
                    <p className="mt-1 text-sm font-medium text-[#64789c]">{latestAssigned.description}</p>
                  </div>
                  <Link
                    href={latestAssigned.href}
                    className="inline-flex h-12 items-center justify-center rounded-full bg-[#2f6fff] px-6 text-sm font-bold text-white shadow-[0_18px_38px_-22px_rgba(37,99,235,0.8)] transition-colors hover:bg-[#1d4ed8]"
                  >
                    Open Lesson
                  </Link>
                </div>
              </section>
            ) : null}

            {assignedLessons.length === 0 ? (
              <section className="rounded-[2rem] border border-dashed border-[#dce6ff] bg-white/88 p-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#eef4ff] text-[#2f6fff]">
                  <BookOpen className="h-8 w-8" />
                </div>
                <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950">No assigned materials yet</h2>
                <p className="mx-auto mt-2 max-w-xl text-sm font-medium leading-6 text-[#64789c]">
                  When an admin sends a module or lesson assignment to this student, it will appear here.
                </p>
              </section>
            ) : (
              <section className="space-y-5">
                {groupedLessons.map(([subject, lessons]) => {
                  const badge = subjectBadge(subject);

                  return (
                    <div
                      key={subject}
                      className="overflow-hidden rounded-[2rem] border border-[#dce6ff] bg-white/95 shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf2fb] px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className={`rounded-full border px-3 py-1 text-xs font-bold ${badge.bg} ${badge.text} ${badge.border}`}>
                            {subject}
                          </span>
                          <h2 className="text-xl font-black tracking-tight text-slate-950">Assigned lessons</h2>
                        </div>
                        <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-bold text-[#2f6fff]">
                          {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
                        </span>
                      </div>

                      <div className="divide-y divide-[#edf2fb]">
                        {lessons.map((lesson) => (
                          <article
                            key={`${lesson.moduleId}:${lesson.lessonId}`}
                            className="grid gap-4 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
                          >
                            <div className="min-w-0">
                              <h3 className="truncate text-lg font-black tracking-tight text-slate-950">
                                {lesson.moduleTitle}
                              </h3>
                              <p className="mt-1 text-sm font-medium text-[#64789c]">
                                {lesson.chapterTitle ? `${lesson.chapterTitle} / ` : ""}
                                {lesson.lessonTitle}
                              </p>
                              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-[#7184a6]">
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#f7faff] px-2.5 py-1">
                                  <CalendarDays className="h-3.5 w-3.5" />
                                  Assigned {formatDate(lesson.createdAt)}
                                </span>
                              </div>
                            </div>

                            <Link
                              href={lesson.href}
                              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#2f6fff] px-5 text-sm font-bold text-white transition-colors hover:bg-[#1d4ed8]"
                            >
                              Open Lesson
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </article>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
