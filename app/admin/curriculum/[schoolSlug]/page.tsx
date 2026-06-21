import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listCurriculumSchools, listCurriculumTree } from "@/lib/curriculum-portal";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type AdminSchoolCurriculumPageProps = {
  params: Promise<{ schoolSlug: string }>;
};

export default async function AdminSchoolCurriculumPage({ params }: AdminSchoolCurriculumPageProps) {
  const { schoolSlug } = await params;
  const [schools, tree] = await Promise.all([listCurriculumSchools(), listCurriculumTree()]);
  const school = schools.find((item) => item.slug === schoolSlug) ?? null;

  if (!school) {
    notFound();
  }

  const selectedSubjects = school.years
    .flatMap((year) => year.subjects)
    .filter((subject, index, collection) => collection.findIndex((item) => item.slug === subject.slug) === index)
    .sort((left, right) => left.title.localeCompare(right.title));
  const selectedSubjectSlugs = new Set(selectedSubjects.map((subject) => subject.slug));
  const unselectedSubjects = tree
    .filter((node) => node.nodeType === "subject" && node.parentId === null)
    .filter((subject) => !selectedSubjectSlugs.has(subject.slug))
    .sort((left, right) => left.title.localeCompare(right.title));

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#f3f8ff_44%,#fbfdff_100%)] dark:bg-[linear-gradient(180deg,#020617_0%,#0f172a_52%,#020617_100%)]">
      <main className="portal-page-width px-4 pb-12 pt-5 sm:px-6 lg:px-8 lg:pb-16">
        <div className="space-y-5">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/admin/curriculum">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Select another school
            </Link>
          </Button>

          <Card className="rounded-[28px] border border-slate-200/80 bg-white/92 shadow-[0_24px_70px_-54px_rgba(15,23,42,0.38)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/84">
            <CardHeader>
              <CardTitle className="text-3xl">{school.title}</CardTitle>
              <CardDescription>
                Select a subject to manage this school&apos;s chapters and modules.
              </CardDescription>
            </CardHeader>
          </Card>

          <section className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950 dark:text-slate-50">Selected Subject</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                Subjects already in use for {school.title}.
              </p>
            </div>

            {selectedSubjects.length === 0 ? (
              <Card className="rounded-[28px] border border-dashed border-slate-300 bg-white/80 dark:border-slate-700 dark:bg-slate-900/70">
                <CardContent className="p-6 text-sm text-slate-500 dark:text-slate-300">
                  No selected subjects yet for this school.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {selectedSubjects.map((subject) => (
                  <Card
                    key={subject.id}
                    className="rounded-[28px] border border-slate-200/80 bg-white/92 shadow-[0_24px_70px_-54px_rgba(15,23,42,0.28)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/84"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[#eef4ff] text-[#2f6fff]">
                          <BookOpen className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xl font-semibold text-slate-950 dark:text-slate-50">{subject.title}</p>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                            {subject.chapterCount} chapters, {subject.lessonCount} lessons
                          </p>
                          <Button asChild className="mt-5 rounded-full">
                            <Link href={`/admin/curriculum/${school.slug}/${subject.slug}`}>
                              Open subject
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950 dark:text-slate-50">Unselected Subject</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                Subjects not yet used for {school.title}. Select one to start building it for this school.
              </p>
            </div>

            {unselectedSubjects.length === 0 ? (
              <Card className="rounded-[28px] border border-dashed border-slate-300 bg-white/80 dark:border-slate-700 dark:bg-slate-900/70">
                <CardContent className="p-6 text-sm text-slate-500 dark:text-slate-300">
                  All available subjects are already selected for this school.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {unselectedSubjects.map((subject) => (
                  <Card
                    key={subject.id}
                    className="rounded-[28px] border border-slate-200/80 bg-white/92 shadow-[0_24px_70px_-54px_rgba(15,23,42,0.28)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/84"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                          <BookOpen className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xl font-semibold text-slate-950 dark:text-slate-50">{subject.title}</p>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                            Not yet selected for this school.
                          </p>
                          <Button asChild variant="outline" className="mt-5 rounded-full">
                            <Link href={`/admin/curriculum/${school.slug}/${subject.slug}`}>
                              Select and open
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
