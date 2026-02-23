import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, PencilLine } from "lucide-react";
import { SidebarNav } from "@/components/lms/sidebar-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getYear7ScienceChapterBySlug, year7ScienceChapters } from "@/lib/curriculum/year7/science";

const chapterTheme: Record<string, string> = {
  Introduction: "bg-amber-100 text-amber-800 border-amber-200",
  "Biological Science": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Chemical Science": "bg-sky-100 text-sky-800 border-sky-200",
  "Physical Science": "bg-violet-100 text-violet-800 border-violet-200",
  Project: "bg-orange-100 text-orange-800 border-orange-200",
};

type ChapterPageProps = {
  params: Promise<{ chapterSlug: string }>;
};

export function generateStaticParams() {
  return year7ScienceChapters.map((chapter) => ({ chapterSlug: chapter.slug }));
}

export default async function Year7ScienceChapterPage({ params }: ChapterPageProps) {
  const { chapterSlug } = await params;
  const chapter = getYear7ScienceChapterBySlug(chapterSlug);

  if (!chapter) {
    notFound();
  }

  const chapterIndex = year7ScienceChapters.findIndex((item) => item.slug === chapter.slug);
  const previousChapter = chapterIndex > 0 ? year7ScienceChapters[chapterIndex - 1] : null;
  const nextChapter = chapterIndex < year7ScienceChapters.length - 1 ? year7ScienceChapters[chapterIndex + 1] : null;

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
            <div className="flex items-center gap-2 text-sm text-muted-foreground overflow-auto">
              <Link href="/student/materials" className="hover:text-foreground transition-colors whitespace-nowrap">
                Learning Materials
              </Link>
              <ChevronRight className="w-4 h-4 shrink-0" />
              <Link href="/student/materials/year-7" className="hover:text-foreground transition-colors whitespace-nowrap">
                Year 7
              </Link>
              <ChevronRight className="w-4 h-4 shrink-0" />
              <Link href="/student/materials/year-7/science" className="hover:text-foreground transition-colors whitespace-nowrap">
                Science
              </Link>
              <ChevronRight className="w-4 h-4 shrink-0" />
              <span className="text-foreground font-medium whitespace-nowrap">Chapter {chapter.order}</span>
            </div>

            <section className="rounded-3xl border border-slate-200 bg-white p-8 md:p-10 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className={chapterTheme[chapter.strand]}>{chapter.strand}</Badge>
                <Badge variant="secondary">{chapter.weekRange}</Badge>
              </div>

              <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900">
                Chapter {chapter.order}: {chapter.shortTitle}
              </h1>
              <p className="mt-3 text-lg text-slate-600 max-w-4xl">{chapter.unitTitle}</p>

              <div className="mt-6 inline-flex items-center gap-2 rounded-xl border bg-slate-50 px-3 py-2 text-sm text-slate-600">
                <PencilLine className="w-4 h-4" />
                Edit this chapter in <code className="font-mono text-xs">{chapter.sourceFile}</code>
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Lesson Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[460px] text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="pb-3 pr-3 font-semibold text-slate-700">Week</th>
                          <th className="pb-3 pr-3 font-semibold text-slate-700">Lesson</th>
                          <th className="pb-3 font-semibold text-slate-700">Title</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chapter.lessons.map((lesson) => (
                          <tr key={lesson.lessonCode} className="border-b last:border-b-0">
                            <td className="py-3 pr-3 text-slate-600">{lesson.week}</td>
                            <td className="py-3 pr-3 font-medium text-slate-800">{lesson.lessonCode}</td>
                            <td className="py-3 text-slate-700">{lesson.title}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Learning Outcomes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {chapter.learningOutcomes.map((outcome, index) => (
                    <div key={index} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                      <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                        {index + 1}
                      </span>
                      <p className="text-sm leading-relaxed text-slate-700">{outcome}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              {previousChapter ? (
                <Button asChild variant="outline">
                  <Link href={`/student/materials/year-7/science/${previousChapter.slug}`}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Chapter {previousChapter.order}
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="outline">
                  <Link href="/student/materials/year-7/science">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    All Chapters
                  </Link>
                </Button>
              )}

              {nextChapter ? (
                <Button asChild>
                  <Link href={`/student/materials/year-7/science/${nextChapter.slug}`}>
                    Chapter {nextChapter.order}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/student/materials/year-7/science">Back to Chapters</Link>
                </Button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
