import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChapterResourceManager } from "@/components/lms/chapter-resource-manager";
import { getCurriculumChapterContext } from "@/lib/curriculum-portal";

export type ChapterPortalRole = "student" | "teacher" | "principal" | "admin";

interface CurriculumChapterPageProps {
  yearSlug: string;
  subjectSlug: string;
  chapterSlug: string;
  role: ChapterPortalRole;
}

function resolveYearLevel(title: string, fallback: number | null) {
  if (typeof fallback === "number" && Number.isFinite(fallback) && fallback > 0) {
    return fallback;
  }

  const match = title.match(/\d+/);
  const parsed = match ? Number(match[0]) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 7;
}

export async function CurriculumChapterPage({
  yearSlug,
  subjectSlug,
  chapterSlug,
  role,
}: CurriculumChapterPageProps) {
  const context = await getCurriculumChapterContext({
    yearSlug,
    subjectSlug,
    chapterSlug,
  });

  if (!context) {
    notFound();
  }

  const { year, subject, chapter, previousChapter, nextChapter } = context;
  const chapterBasePath = `/${role}/materials/curriculum/${year.slug}/${subject.slug}`;
  const materialsPath = `/${role}/materials`;
  const canManageResources = role === "teacher" || role === "principal" || role === "admin";
  const yearLevel = resolveYearLevel(year.title, year.yearLevel);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <main className="p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground overflow-auto">
            <Link href={materialsPath} className="hover:text-foreground transition-colors whitespace-nowrap">
              Learning Materials
            </Link>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">{year.title}</span>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">{subject.title}</span>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <span className="text-foreground font-medium whitespace-nowrap">{chapter.title}</span>
          </div>

          <section className="rounded-3xl border border-slate-200 bg-white p-8 md:p-10 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              {chapter.strand && <Badge>{chapter.strand}</Badge>}
              {chapter.weekRange && <Badge variant="secondary">{chapter.weekRange}</Badge>}
            </div>

            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900">{chapter.title}</h1>
            {chapter.unitTitle && <p className="mt-3 text-lg text-slate-600 max-w-4xl">{chapter.unitTitle}</p>}
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
                        const lessonHref = `${chapterBasePath}/${chapter.slug}/${lesson.slug}`;

                        return (
                          <tr
                            key={lesson.id}
                            className="border-b last:border-b-0 transition-colors hover:bg-slate-50"
                          >
                            <td className="py-3 pr-3 text-slate-600">{lesson.week || "-"}</td>
                            <td className="py-3 pr-3 font-medium text-slate-800">{lesson.lessonCode || "-"}</td>
                            <td className="py-3 text-slate-700">
                              <Link
                                href={lessonHref}
                                className="group inline-flex items-center gap-1.5 font-medium text-blue-700 hover:text-blue-900"
                              >
                                <span>{lesson.title}</span>
                                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                              </Link>
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
                {chapter.learningOutcomes.length > 0 ? (
                  chapter.learningOutcomes.map((outcome, index) => (
                    <div key={index} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                      <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                        {index + 1}
                      </span>
                      <p className="text-sm leading-relaxed text-slate-700">{outcome}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No learning outcomes added yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <ChapterResourceManager
            chapterSlug={chapter.slug}
            subject={subject.slug}
            yearLevel={yearLevel}
            canManage={canManageResources}
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            {previousChapter ? (
              <Button asChild variant="outline">
                <Link href={`${chapterBasePath}/${previousChapter.slug}`}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  {previousChapter.title}
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
                  {nextChapter.title}
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
