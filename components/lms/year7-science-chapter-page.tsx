import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, ChevronLeft, ChevronRight, PencilLine } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChapterResourceManager } from "@/components/lms/chapter-resource-manager";
import { getYear7ScienceChapterBySlug, year7ScienceChapters } from "@/lib/curriculum/year7/science";

export type ChapterPortalRole = "student" | "teacher" | "principal" | "admin";

const chapterTheme: Record<string, string> = {
  Introduction: "bg-amber-100 text-amber-800 border-amber-200",
  "Biological Science": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Chemical Science": "bg-sky-100 text-sky-800 border-sky-200",
  "Physical Science": "bg-violet-100 text-violet-800 border-violet-200",
  Project: "bg-orange-100 text-orange-800 border-orange-200",
};

interface Year7ScienceChapterPageProps {
  chapterSlug: string;
  role: ChapterPortalRole;
}

export function Year7ScienceChapterPage({ chapterSlug, role }: Year7ScienceChapterPageProps) {
  const chapter = getYear7ScienceChapterBySlug(chapterSlug);

  if (!chapter) {
    notFound();
  }

  const chapterIndex = year7ScienceChapters.findIndex((item) => item.slug === chapter.slug);
  const previousChapter = chapterIndex > 0 ? year7ScienceChapters[chapterIndex - 1] : null;
  const nextChapter = chapterIndex < year7ScienceChapters.length - 1 ? year7ScienceChapters[chapterIndex + 1] : null;
  const chapterBasePath = `/${role}/materials/year-7/science`;
  const materialsPath = `/${role}/materials`;
  const canManageResources = role === "teacher" || role === "principal" || role === "admin";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <main className="p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground overflow-auto">
            <Link href={materialsPath} className="hover:text-foreground transition-colors whitespace-nowrap">
              Learning Materials
            </Link>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">Year 7</span>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">Science</span>
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
                      {chapter.lessons.map((lesson) => {
                        const lessonHref = lesson.slug
                          ? `${chapterBasePath}/${chapter.slug}/${lesson.slug}`
                          : null;

                        return (
                          <tr
                            key={lesson.lessonCode}
                            className={`border-b last:border-b-0 ${
                              lessonHref ? "transition-colors hover:bg-slate-50" : ""
                            }`}
                          >
                            <td className="py-3 pr-3 text-slate-600">{lesson.week}</td>
                            <td className="py-3 pr-3 font-medium text-slate-800">{lesson.lessonCode}</td>
                            <td className="py-3 text-slate-700">
                              {lessonHref ? (
                                <Link
                                  href={lessonHref}
                                  className="group inline-flex items-center gap-1.5 font-medium text-blue-700 hover:text-blue-900"
                                >
                                  <span>{lesson.title}</span>
                                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                </Link>
                              ) : (
                                lesson.title
                              )}
                            </td>
                          </tr>
                        );
                      })}
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

          <ChapterResourceManager
            chapterSlug={chapter.slug}
            subject="science"
            yearLevel={7}
            canManage={canManageResources}
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            {previousChapter ? (
              <Button asChild variant="outline">
                <Link href={`${chapterBasePath}/${previousChapter.slug}`}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Chapter {previousChapter.order}
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline">
                <Link href={materialsPath}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Materials
                </Link>
              </Button>
            )}

            {nextChapter ? (
              <Button asChild>
                <Link href={`${chapterBasePath}/${nextChapter.slug}`}>
                  Chapter {nextChapter.order}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href={materialsPath}>Back to Materials</Link>
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
