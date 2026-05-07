import { SidebarNav } from "@/components/lms/sidebar-nav";
import { getCurrentUser } from "@/lib/auth";
import { getMaterials, getStudentProgress, getCalendarEvents } from "@/lib/db-services";
import {
  BookOpen,
  Award,
  Clock,
  TrendingUp,
  Calendar,
  CheckSquare,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  Play,
  Square,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

function StatCard({
  icon,
  iconBg,
  label,
  value,
  sub,
  progress,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string | number;
  sub?: string;
  progress?: number;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-[#edf0f7] bg-white p-5 shadow-sm">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <p className="mt-0.5 text-[1.75rem] font-bold leading-none text-slate-900">{value}</p>
        {progress !== undefined ? (
          <div className="mt-2">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[#2f6fff] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-slate-400">Keep it up!</p>
          </div>
        ) : (
          sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>
        )}
      </div>
    </div>
  );
}

// Subject badge colours
const subjectColors: Record<string, { bg: string; text: string }> = {
  literature: { bg: "bg-[#fff3e6]", text: "text-[#c2410c]" },
  numerasi: { bg: "bg-[#fff0f0]", text: "text-[#dc2626]" },
  science: { bg: "bg-[#e8f5e9]", text: "text-[#16a34a]" },
  english: { bg: "bg-[#e8f0fe]", text: "text-[#2563eb]" },
  math: { bg: "bg-[#fef3c7]", text: "text-[#b45309]" },
};

function subjectBadge(subject: string) {
  const key = subject.toLowerCase();
  const style = Object.entries(subjectColors).find(([k]) => key.includes(k))?.[1] ?? {
    bg: "bg-slate-100",
    text: "text-slate-600",
  };
  return style;
}

export default async function StudentDashboard() {
  const user = await getCurrentUser();
  const studentName = user ? `${user.firstName} ${user.lastName}`.trim() || user.email : "Student";
  const studentId = user?.id ?? "student-1";

  const [materials, studentProgress, studentEvents] = await Promise.all([
    getMaterials(),
    getStudentProgress(studentId),
    getCalendarEvents(studentId),
  ]);

  const enrolledMaterials = materials.slice(0, 3);
  const completedCount = studentProgress.filter((p) => p.completed).length;
  const totalMaterials = materials.length;
  const overallProgress =
    studentProgress.length > 0
      ? Math.round(studentProgress.reduce((s, p) => s + p.progress, 0) / studentProgress.length)
      : 68;
  const pendingQuizzes = 2;
  const achievements = 3;

  const recentMaterials = materials.slice(0, 3);
  const upcomingEvents = studentEvents.slice(0, 2);

  const tasks = [
    { label: "Complete Numerasi practice", done: false, tag: "Numerasi", tagColor: subjectBadge("numerasi") },
    { label: "Read short-story-chapter-2", done: true, tag: "Literature", tagColor: subjectBadge("literature") },
    { label: "Review Science lesson notes", done: false, tag: "Science", tagColor: subjectBadge("science") },
  ];

  return (
    <div className="flex min-h-screen bg-[#f7f8fc]">
      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <aside className="hidden w-64 shrink-0 border-r border-[#edf0f7] bg-white lg:flex lg:flex-col">
        {/* User info */}
        <div className="border-b border-[#edf0f7] px-5 py-5">
          <p className="text-sm font-bold text-slate-800">Student Portal</p>
          <p className="mt-0.5 text-xs text-slate-400">{studentName}</p>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <SidebarNav role="student" />
        </div>

        {/* Motivational card */}
        <div className="m-3 rounded-2xl bg-[#eef4ff] px-4 py-4 text-center">
          <p className="text-2xl">🐧✨</p>
          <p className="mt-2 text-sm font-bold text-slate-800">Keep going, {studentName.split(" ")[0]}! 🌟</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">Every small step brings you closer to your goals.</p>
          <button className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full border border-[#c7d9ff] bg-white py-2 text-xs font-semibold text-[#2f6fff] hover:bg-[#f0f6ff] transition-colors">
            <HelpCircle className="h-3.5 w-3.5" />
            Need Help?
          </button>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-6 py-7 lg:px-8">

          {/* Welcome */}
          <div>
            <h1 className="text-[1.9rem] font-black tracking-tight text-slate-900">
              Welcome back, {studentName}! 👋
            </h1>
            <p className="mt-1 text-sm text-slate-400">Here&apos;s what&apos;s happening with your learning today.</p>
          </div>

          {/* Stat cards */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              iconBg="bg-[#e8f0fe]"
              icon={<BookOpen className="h-6 w-6 text-[#2563eb]" />}
              label="Courses Enrolled"
              value={totalMaterials || 10}
              sub="Active courses"
            />
            <StatCard
              iconBg="bg-[#fff3e6]"
              icon={<Clock className="h-6 w-6 text-[#f97316]" />}
              label="Quizzes Pending"
              value={pendingQuizzes}
              sub="Due this week"
            />
            <StatCard
              iconBg="bg-[#e8f5e9]"
              icon={<TrendingUp className="h-6 w-6 text-[#16a34a]" />}
              label="Overall Progress"
              value={`${overallProgress}%`}
              progress={overallProgress}
            />
            <StatCard
              iconBg="bg-[#f3e8ff]"
              icon={<Award className="h-6 w-6 text-[#9333ea]" />}
              label="Achievements"
              value={achievements}
              sub="Badges earned"
            />
          </div>

          {/* Two-column layout */}
          <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
            {/* LEFT ─────────────────────────────────────── */}
            <div className="space-y-6">
              {/* Continue Learning */}
              <section>
                <div className="flex items-center justify-between">
                  <h2 className="text-[1.1rem] font-bold text-slate-900">Continue Learning</h2>
                  <Link href="/student/materials" className="flex items-center gap-1 text-xs font-semibold text-[#2f6fff] hover:underline">
                    View All <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {enrolledMaterials.length > 0 ? enrolledMaterials.map((material) => {
                    const prog = studentProgress.find((p) => p.materialId === material.id);
                    const pct = prog?.progress ?? Math.floor(Math.random() * 80 + 10);
                    const badge = subjectBadge(material.subject ?? "");
                    return (
                      <div key={material.id} className="flex flex-col overflow-hidden rounded-2xl border border-[#edf0f7] bg-white shadow-sm">
                        <div className="flex h-36 items-center justify-center bg-gradient-to-br from-[#eef4ff] to-[#dce8ff]">
                          <BookOpen className="h-14 w-14 text-[#93b4f7]" />
                        </div>
                        <div className="flex flex-1 flex-col p-4">
                          <span className={`self-start rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badge.bg} ${badge.text}`}>
                            {material.subject}
                          </span>
                          <p className="mt-2 text-sm font-bold leading-snug text-slate-900 line-clamp-2">{material.title}</p>
                          <p className="mt-1 text-[11px] leading-5 text-slate-400 line-clamp-2">{material.description}</p>
                          <div className="mt-auto pt-3">
                            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
                              <span>{pct}% complete</span>
                            </div>
                            <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100">
                              <div className="h-full rounded-full bg-[#2f6fff]" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                          <Link
                            href={`/student/materials/${material.id}`}
                            className="mt-3 flex items-center justify-center gap-1.5 rounded-full bg-[#2f6fff] py-2.5 text-xs font-semibold text-white hover:bg-[#1d4ed8] transition-colors"
                          >
                            <Play className="h-3.5 w-3.5" />
                            Resume Learning
                          </Link>
                        </div>
                      </div>
                    );
                  }) : (
                    // Placeholder cards when no materials yet
                    [{title:"Literatur Anak: Cerita Pendek", subject:"Literature", desc:"Bilingual short story reading and comprehension for junior high with playful themes.", pct:40},
                     {title:"Numerasi Dasar: Pola dan Perbandingan", subject:"Numerasi", desc:"Bilingual numeracy foundations for patterns, order, and comparisons with real-life examples.", pct:50},
                     {title:"Latihan Menghitung: 1-20", subject:"Science", desc:"Bilingual counting and basic operations for junior high with playful and formal lessons.", pct:60},
                    ].map((item) => {
                      const badge = subjectBadge(item.subject);
                      return (
                        <div key={item.title} className="flex flex-col overflow-hidden rounded-2xl border border-[#edf0f7] bg-white shadow-sm">
                          <div className="flex h-36 items-center justify-center bg-gradient-to-br from-[#eef4ff] to-[#dce8ff]">
                            <BookOpen className="h-14 w-14 text-[#93b4f7]" />
                          </div>
                          <div className="flex flex-1 flex-col p-4">
                            <span className={`self-start rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badge.bg} ${badge.text}`}>{item.subject}</span>
                            <p className="mt-2 text-sm font-bold leading-snug text-slate-900">{item.title}</p>
                            <p className="mt-1 text-[11px] leading-5 text-slate-400 line-clamp-2">{item.desc}</p>
                            <div className="mt-auto pt-3">
                              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
                                <span>{item.pct}% complete</span>
                              </div>
                              <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100">
                                <div className="h-full rounded-full bg-[#2f6fff]" style={{ width: `${item.pct}%` }} />
                              </div>
                            </div>
                            <Link href="/student/materials" className="mt-3 flex items-center justify-center gap-1.5 rounded-full bg-[#2f6fff] py-2.5 text-xs font-semibold text-white hover:bg-[#1d4ed8] transition-colors">
                              <Play className="h-3.5 w-3.5" />
                              Resume Learning
                            </Link>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>

              {/* Bottom row: Learning Activity + Recent Materials */}
              <div className="grid gap-5 lg:grid-cols-2">
                {/* Learning Activity */}
                <section className="rounded-2xl border border-[#edf0f7] bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-900">Learning Activity</h2>
                    <span className="text-xs text-slate-400">• This Week</span>
                  </div>
                  {/* Simple SVG sparkline */}
                  <div className="mt-4 h-28 w-full">
                    <svg viewBox="0 0 260 80" className="h-full w-full" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2f6fff" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#2f6fff" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d="M0,60 L37,50 L74,55 L111,40 L148,30 L185,35 L222,20 L260,25" fill="none" stroke="#2f6fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M0,60 L37,50 L74,55 L111,40 L148,30 L185,35 L222,20 L260,25 L260,80 L0,80 Z" fill="url(#actGrad)" />
                      {/* Highlight dot */}
                      <circle cx="148" cy="30" r="4.5" fill="#2f6fff" />
                      <text x="148" y="22" textAnchor="middle" fontSize="9" fill="#2f6fff" fontWeight="bold">2.4h</text>
                      {/* X labels */}
                      {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d,i) => (
                        <text key={d} x={i * 37 + (i === 6 ? 37 : 0)} y="78" textAnchor="middle" fontSize="8" fill="#94a3b8">{d}</text>
                      ))}
                    </svg>
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-[#f0f4fb] pt-3">
                    <p className="text-xs text-slate-400">Total study time</p>
                    <p className="text-sm font-bold text-[#2f6fff]">8h 45m</p>
                  </div>
                </section>

                {/* Recent Materials */}
                <section className="rounded-2xl border border-[#edf0f7] bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-900">Recent Materials</h2>
                    <Link href="/student/materials" className="flex items-center gap-0.5 text-xs font-semibold text-[#2f6fff] hover:underline">
                      View All <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  <table className="mt-3 w-full text-xs">
                    <thead>
                      <tr className="border-b border-[#f0f4fb]">
                        {["Title","Subject","Added","Action"].map(h => (
                          <th key={h} className="pb-2 text-left font-semibold text-slate-400">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(recentMaterials.length > 0 ? recentMaterials : [
                        {id:"1",title:"Pola dan Barisan Worksheet",subject:"Numerasi",createdAt:new Date("2026-05-15")},
                        {id:"2",title:"Cerita Pendek: Persahabatan (Chapter 2)",subject:"Literature",createdAt:new Date("2026-05-14")},
                        {id:"3",title:"Photosynthesis Basic PDF Notes",subject:"Science",createdAt:new Date("2026-05-13")},
                      ]).map((m: {id:string,title:string,subject:string,createdAt:Date}) => {
                        const badge = subjectBadge(m.subject ?? "");
                        return (
                          <tr key={m.id} className="border-b border-[#f7f9fc] last:border-b-0">
                            <td className="py-2.5 pr-2 font-medium text-slate-700 max-w-[120px] truncate">{m.title}</td>
                            <td className="py-2.5 pr-2">
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.bg} ${badge.text}`}>{m.subject}</span>
                            </td>
                            <td className="py-2.5 pr-2 text-slate-400">
                              {new Date(m.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
                            </td>
                            <td className="py-2.5">
                              <Link href={`/student/materials/${m.id}`} className="rounded-full bg-[#2f6fff] px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-[#1d4ed8]">View</Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </section>
              </div>
            </div>

            {/* RIGHT ────────────────────────────────────── */}
            <div className="space-y-4">
              {/* Upcoming Events */}
              <section className="rounded-2xl border border-[#edf0f7] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#2f6fff]" />
                    <h2 className="text-sm font-bold text-slate-900">Upcoming Events</h2>
                  </div>
                  <Link href="/student/calendar" className="text-xs font-semibold text-[#2f6fff] hover:underline">View All</Link>
                </div>
                <div className="mt-3 space-y-3">
                  {(upcomingEvents.length > 0 ? upcomingEvents.map(e => ({
                    month: new Date(e.startTime).toLocaleString("en-US",{month:"short"}).toUpperCase(),
                    day: new Date(e.startTime).getDate(),
                    title: e.title,
                    time: new Date(e.startTime).toLocaleString("en-US",{weekday:"short",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}),
                  })) : [
                    {month:"MAY",day:20,title:"Mathematics Quiz",time:"Tue, May 20, 2026 · 09:00 AM"},
                    {month:"MAY",day:27,title:"Literature Discussion",time:"Tue, May 27, 2026 · 02:00 PM"},
                  ]).map((ev,i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex w-10 shrink-0 flex-col items-center rounded-xl border border-[#edf0f7] bg-[#f7f8fc] py-1.5 text-center">
                        <span className="text-[9px] font-bold uppercase text-[#2f6fff]">{ev.month}</span>
                        <span className="text-base font-black leading-none text-slate-900">{ev.day}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{ev.title}</p>
                        <p className="text-xs text-slate-400">{ev.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/student/calendar" className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#2f6fff] hover:underline">
                  See calendar <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </section>

              {/* Today's Tasks */}
              <section className="rounded-2xl border border-[#edf0f7] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-[#2f6fff]" />
                  <h2 className="text-sm font-bold text-slate-900">Today&apos;s Tasks</h2>
                </div>
                <div className="mt-3 space-y-2.5">
                  {tasks.map((task, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      {task.done ? (
                        <CheckSquare className="h-4 w-4 shrink-0 text-[#2f6fff]" />
                      ) : (
                        <Square className="h-4 w-4 shrink-0 text-slate-300" />
                      )}
                      <p className={`flex-1 text-xs ${task.done ? "text-slate-400 line-through" : "text-slate-700"}`}>{task.label}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${task.tagColor.bg} ${task.tagColor.text}`}>{task.tag}</span>
                    </div>
                  ))}
                </div>
                <Link href="/student/notes" className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#2f6fff] hover:underline">
                  View all tasks <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </section>

              {/* Recent Achievement */}
              <section className="rounded-2xl border border-[#edf0f7] bg-white p-5 shadow-sm">
                <h2 className="text-sm font-bold text-slate-900">Recent Achievement</h2>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eef4ff]">
                    <Award className="h-6 w-6 text-[#2f6fff]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Great Starter</p>
                    <p className="text-xs text-slate-400">Completed your first quiz</p>
                    <p className="mt-0.5 text-xs text-slate-300">Earned on May 14, 2026</p>
                  </div>
                </div>
              </section>

              {/* Quick Links */}
              <section className="rounded-2xl border border-[#edf0f7] bg-white p-5 shadow-sm">
                <h2 className="text-sm font-bold text-slate-900">Quick Links</h2>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[
                    { label: "Materials", href: "/student/materials", icon: <BookOpen className="h-5 w-5 text-[#2f6fff]" /> },
                    { label: "Quizzes", href: "/student/quizzes", icon: <HelpCircle className="h-5 w-5 text-[#2f6fff]" /> },
                    { label: "Calendar", href: "/student/calendar", icon: <Calendar className="h-5 w-5 text-[#2f6fff]" /> },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex flex-col items-center gap-1.5 rounded-xl border border-[#edf0f7] bg-[#f7f8fc] py-3 text-center hover:bg-[#eef4ff] transition-colors"
                    >
                      {item.icon}
                      <span className="text-xs font-medium text-slate-600">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-[#edf0f7] py-4 text-center text-xs text-slate-400">
          © 2026 Edutindo. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
