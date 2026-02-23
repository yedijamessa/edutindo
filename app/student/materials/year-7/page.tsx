import Link from "next/link";
import { ChevronRight, FlaskConical, Layers3, ArrowLeft } from "lucide-react";
import { SidebarNav } from "@/components/lms/sidebar-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { YEAR7_SCIENCE_TOTAL_LESSONS, year7ScienceChapters } from "@/lib/curriculum/year7/science";

export default function Year7MaterialsPage() {
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
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/student/materials" className="hover:text-foreground transition-colors">
                Learning Materials
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground font-medium">Year 7</span>
            </div>

            <section className="rounded-3xl border border-sky-100 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_45%),linear-gradient(to_bottom_right,_#f8fbff,_#f1f5f9)] p-8 md:p-10 shadow-sm">
              <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100 border border-sky-200">Portal / Learning Materials</Badge>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900">Year 7 Curriculum</h1>
              <p className="mt-3 max-w-3xl text-slate-600 text-lg leading-relaxed">
                Select a subject to view chapter-by-chapter materials. Each chapter has its own page so you can update content independently.
              </p>
            </section>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-sky-200 shadow-[0_20px_40px_-35px_rgba(2,132,199,0.65)]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                      <FlaskConical className="w-6 h-6" />
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <CardTitle className="text-2xl">Science</CardTitle>
                  <CardDescription>
                    Complete Year 7 Science plan with chapter pages and lesson breakdown.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-slate-100 p-3">
                      <p className="text-muted-foreground">Chapters</p>
                      <p className="text-xl font-bold">{year7ScienceChapters.length}</p>
                    </div>
                    <div className="rounded-xl bg-slate-100 p-3">
                      <p className="text-muted-foreground">Lessons</p>
                      <p className="text-xl font-bold">{YEAR7_SCIENCE_TOTAL_LESSONS}</p>
                    </div>
                  </div>

                  <Button asChild className="w-full">
                    <Link href="/student/materials/year-7/science">Open Year 7 Science</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-dashed">
                <CardHeader>
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <Layers3 className="w-6 h-6" />
                  </div>
                  <CardTitle>More Subjects</CardTitle>
                  <CardDescription>
                    Add additional Year 7 subjects here later using the same structure as Science.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This slot is ready for Maths, English, and other subjects when you are ready to add them.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Button asChild variant="outline" className="w-fit">
              <Link href="/student/materials">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Learning Materials
              </Link>
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
