import Link from "next/link";
import { ArrowRight, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listCurriculumSchools } from "@/lib/curriculum-portal";

export const dynamic = "force-dynamic";

export default async function AdminCurriculumPage() {
  const schools = await listCurriculumSchools();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#f3f8ff_44%,#fbfdff_100%)] dark:bg-[linear-gradient(180deg,#020617_0%,#0f172a_52%,#020617_100%)]">
      <main className="portal-page-width px-4 pb-12 pt-5 sm:px-6 lg:px-8 lg:pb-16">
        <div className="space-y-5">
          <Card className="rounded-[28px] border border-slate-200/80 bg-white/92 shadow-[0_24px_70px_-54px_rgba(15,23,42,0.38)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/84">
            <CardHeader>
              <CardTitle className="text-3xl">Select School</CardTitle>
              <CardDescription>
                Choose one school first, then manage that school&apos;s subjects, chapters, and modules.
              </CardDescription>
            </CardHeader>
          </Card>

          {schools.length === 0 ? (
            <Card className="rounded-[28px] border border-dashed border-slate-300 bg-white/80 dark:border-slate-700 dark:bg-slate-900/70">
              <CardContent className="p-6 text-sm text-slate-500 dark:text-slate-300">
                No schools found yet. Add a school in the curriculum data first.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {schools.map((school) => (
                <Card
                  key={school.id}
                  className="rounded-[28px] border border-slate-200/80 bg-white/92 shadow-[0_24px_70px_-54px_rgba(15,23,42,0.28)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/84"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[#eef4ff] text-[#2f6fff]">
                        <School className="h-6 w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xl font-semibold text-slate-950 dark:text-slate-50">{school.title}</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                          {school.years.length} year groups available
                        </p>
                        <Button asChild className="mt-5 rounded-full">
                          <Link href={`/admin/curriculum/${school.slug}`}>
                            Open curriculum
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
        </div>
      </main>
    </div>
  );
}
