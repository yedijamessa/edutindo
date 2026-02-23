import Link from "next/link";
import { ArrowLeft, ChevronRight, FileText, FlaskConical } from "lucide-react";
import { SidebarNav } from "@/components/lms/sidebar-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { YEAR7_SCIENCE_TOTAL_LESSONS, year7ScienceChapters } from "@/lib/curriculum/year7/science";

const chapterTheme: Record<string, string> = {
  Introduction: "bg-amber-100 text-amber-800 border-amber-200",
  "Biological Science": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Chemical Science": "bg-sky-100 text-sky-800 border-sky-200",
  "Physical Science": "bg-violet-100 text-violet-800 border-violet-200",
  Project: "bg-orange-100 text-orange-800 border-orange-200",
};

export default function Year7SciencePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="flex">
        <aside className="hidden lg:block w-64 border-r bg-card p-6 min-h-screen sticky top-0">
          <div className="mb-8">
            <h2 className="text-lg font-bold">Student Portal</h2>
          </div>
          <SidebarNav role="student" />
        </aside>

        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/student/materials" className="hover:text-foreground transition-colors">
                Learning Materials
              </Link>
              <ChevronRight className="w-4 h-4" />
              <Link href="/student/materials/year-7" className="hover:text-foreground transition-colors">
                Year 7
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground font-medium">Science</span>
            </div>

            <section className="relative overflow-hidden rounded-3xl border border-sky-200 bg-white p-8 md:p-10 shadow-sm">
              <div className="pointer-events-none absolute -top-24 -right-12 h-56 w-56 rounded-full bg-sky-200/40 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-blue-200/35 blur-3xl" />
              <div className="relative">
                <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100 border border-sky-200">Year 7 / Science</Badge>
                <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900">Science Chapters</h1>
                <p className="mt-3 text-lg max-w-3xl text-slate-600">
                  Each chapter opens on its own page so you can edit content chapter-by-chapter without affecting the rest of the curriculum.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Badge variant="secondary" className="px-3 py-1">
                    {year7ScienceChapters.length} chapters
                  </Badge>
                  <Badge variant="secondary" className="px-3 py-1">
                    {YEAR7_SCIENCE_TOTAL_LESSONS} lessons
                  </Badge>
                </div>
              </div>
            </section>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {year7ScienceChapters.map((chapter) => (
                <Card
                  key={chapter.slug}
                  className="group border-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <Badge className={chapterTheme[chapter.strand]}>{chapter.strand}</Badge>
                      <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                        <FlaskConical className="w-4 h-4" />
                      </div>
                    </div>
                    <CardTitle className="text-xl leading-tight">
                      Chapter {chapter.order}: {chapter.shortTitle}
                    </CardTitle>
                    <CardDescription>{chapter.weekRange}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-600 line-clamp-2">{chapter.unitTitle}</p>

                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{chapter.lessons.length}</span> lessons
                    </div>

                    <Button asChild className="w-full">
                      <Link href={`/student/materials/year-7/science/${chapter.slug}`}>
                        <FileText className="w-4 h-4 mr-2" />
                        Open Chapter
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button asChild variant="outline" className="w-fit">
              <Link href="/student/materials/year-7">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Year 7
              </Link>
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
