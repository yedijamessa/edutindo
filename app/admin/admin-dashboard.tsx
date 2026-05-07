import Link from "next/link";
import { BookOpen, LayoutGrid, NotebookTabs, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminDashboardProps {
  adminEmail: string;
}

const adminTools = [
  {
    title: "Curriculum Portal",
    href: "/admin/curriculum",
    description: "Organize school, year, subject, chapter, and module structure.",
    icon: LayoutGrid,
  },
  {
    title: "Learning Materials",
    href: "/admin/materials",
    description: "Review curriculum-linked materials and content pages.",
    icon: BookOpen,
  },
  {
    title: "Module Editor",
    href: "/admin/module-editor",
    description: "Build chapter and module pages with text, images, and quizzes.",
    icon: NotebookTabs,
  },
  {
    title: "Admin Access Control",
    href: "/admin/access",
    description: "Manage which users can open each portal.",
    icon: ShieldCheck,
  },
];

const crossPortalLinks = [
  { title: "Student Portal", href: "/student" },
  { title: "Teacher Portal", href: "/teacher" },
  { title: "Parent Portal", href: "/parent" },
  { title: "Principal Portal", href: "/principal" },
];

function AdminHeroArtwork() {
  return (
    <div className="relative hidden h-[124px] lg:block" aria-hidden="true">
      <div className="absolute inset-y-1 right-0 w-[150px] rounded-[24px] border border-[#dbe5ff] bg-[linear-gradient(180deg,rgba(225,234,255,0.94),rgba(250,252,255,0.98))] shadow-[0_28px_56px_-36px_rgba(37,99,235,0.75)]">
        <div className="flex items-center gap-1.5 border-b border-[#e3ebff] px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#c9d8ff]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#d4e0ff]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#dfe7ff]" />
        </div>
        <div className="space-y-2.5 px-4 py-4">
          <div className="h-3 rounded-full bg-[#d4dfff]" />
          <div className="grid grid-cols-[1.2fr_1fr] gap-2">
            <div className="h-8 rounded-2xl bg-[#e6edff]" />
            <div className="h-8 rounded-2xl bg-[#edf2ff]" />
          </div>
          <div className="h-3 rounded-full bg-[#e4ebff]" />
          <div className="h-3 w-4/5 rounded-full bg-[#eef3ff]" />
        </div>
      </div>
      <div className="absolute bottom-3 right-[116px] flex h-[84px] w-[84px] items-center justify-center rounded-[28px] border border-[#dbe5ff] bg-[linear-gradient(180deg,rgba(238,243,255,0.98),rgba(248,250,255,0.98))] text-[#4b7bff] shadow-[0_28px_56px_-36px_rgba(37,99,235,0.75)]">
        <ShieldCheck className="h-10 w-10" strokeWidth={1.8} />
      </div>
      <div className="absolute bottom-5 left-2 h-8 w-16 rounded-full border-4 border-transparent border-l-[#75a3ff] border-t-[#75a3ff] opacity-70" />
      <div className="absolute bottom-2 left-5 h-3.5 w-[5.5rem] rounded-full bg-[#dbe7ff]" />
      <div className="absolute bottom-0 right-1 h-14 w-12 rounded-[999px_999px_0_999px] bg-[linear-gradient(180deg,rgba(227,235,255,0.88),rgba(255,255,255,0))]" />
      <div className="absolute bottom-3 right-6 h-10 w-16 rounded-full bg-[#dbe7ff]/80 blur-xl" />
    </div>
  );
}

export default function AdminDashboard({ adminEmail }: AdminDashboardProps) {
  return (
    <div className="space-y-6 lg:space-y-7">
      <section className="relative overflow-hidden rounded-[30px] border border-white/70 bg-white/88 p-5 shadow-[0_40px_90px_-64px_rgba(37,99,235,0.68)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/78 sm:p-7">
        <div className="absolute inset-y-0 right-0 hidden w-80 bg-[radial-gradient(circle_at_center,rgba(147,197,253,0.24),transparent_68%)] lg:block dark:bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),transparent_68%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
          <div className="flex items-start gap-4 sm:gap-6">
            <div className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-[24px] bg-[linear-gradient(180deg,#eef4ff_0%,#dfe8ff_100%)] text-[#2f6fff] shadow-[0_24px_48px_-34px_rgba(37,99,235,0.75)] dark:bg-[linear-gradient(180deg,rgba(37,99,235,0.32)_0%,rgba(37,99,235,0.16)_100%)] dark:text-blue-200">
              <LayoutGrid className="h-8 w-8" strokeWidth={1.8} />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-[2.35rem]">
                Admin Dashboard
              </h1>
              <p className="max-w-2xl text-[15px] leading-7 text-slate-500 dark:text-slate-300">
                Signed in as{" "}
                <span className="font-semibold text-slate-900 dark:text-white">{adminEmail}</span>
                . Choose which admin portal you want to open.
              </p>
            </div>
          </div>
          <AdminHeroArtwork />
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
            Admin Portals
          </h2>
          <p className="text-[15px] text-slate-500 dark:text-slate-300">
            Access and manage key areas of the Edutindo platform.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {adminTools.map((tool) => {
            const Icon = tool.icon;

            return (
              <article
                key={tool.href}
                className="flex h-full flex-col rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.5)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_32px_70px_-44px_rgba(37,99,235,0.36)] dark:border-slate-800 dark:bg-slate-900/84 dark:shadow-none"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[18px] bg-[linear-gradient(180deg,#eef4ff_0%,#dfe8ff_100%)] text-[#2f6fff] dark:bg-[linear-gradient(180deg,rgba(37,99,235,0.32)_0%,rgba(37,99,235,0.16)_100%)] dark:text-blue-200">
                  <Icon className="h-6 w-6" strokeWidth={1.9} />
                </div>
                <h3 className="text-[1.4rem] font-semibold leading-tight tracking-tight text-slate-950 dark:text-slate-50">
                  {tool.title}
                </h3>
                <p className="mt-3 text-[15px] leading-7 text-slate-500 dark:text-slate-300">
                  {tool.description}
                </p>
                <Button
                  asChild
                  className="mt-8 h-11 w-full rounded-full bg-[linear-gradient(135deg,#2f6fff_0%,#1d4ed8_100%)] text-[15px] font-medium text-white shadow-[0_20px_40px_-24px_rgba(37,99,235,0.92)] hover:brightness-105"
                >
                  <Link href={tool.href}>Open</Link>
                </Button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-[30px] border border-white/70 bg-white/88 p-5 shadow-[0_40px_90px_-64px_rgba(37,99,235,0.58)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/78 sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-[linear-gradient(180deg,#eef4ff_0%,#dfe8ff_100%)] text-[#2f6fff] dark:bg-[linear-gradient(180deg,rgba(37,99,235,0.32)_0%,rgba(37,99,235,0.16)_100%)] dark:text-blue-200">
            <Users className="h-6 w-6" strokeWidth={1.9} />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
              Other Portals
            </h2>
            <p className="text-[15px] text-slate-500 dark:text-slate-300">
              Jump into the user-facing portals from the admin dashboard.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {crossPortalLinks.map((item) => (
            <Button
              key={item.href}
              asChild
              variant="outline"
              className="h-11 justify-center rounded-full border-[#d9e0ec] bg-white/90 text-[15px] font-medium text-slate-700 shadow-none hover:border-[#c6d4f3] hover:bg-[#f7faff] hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-slate-900"
            >
              <Link href={item.href}>{item.title}</Link>
            </Button>
          ))}
        </div>
      </section>
    </div>
  );
}
