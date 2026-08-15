import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminBreadcrumb } from "@/components/admin/admin-breadcrumb";
import { SchoolSubjectVisibilityClient } from "@/components/admin/school-subject-visibility-client";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import {
  canApproveCurriculumSubjectVisibility,
  listPendingCurriculumSubjectVisibilityRequests,
} from "@/lib/curriculum-subject-visibility";
import { listCurriculumSchools, listCurriculumTree, type CurriculumNode } from "@/lib/curriculum-portal";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type AdminSchoolCurriculumPageProps = {
  params: Promise<{ schoolSlug: string }>;
};

function countSubjectChildren(subject: CurriculumNode) {
  const chapters = subject.children.filter((node) => node.nodeType === "chapter");
  const lessonCount = chapters.reduce(
    (total, chapter) => total + chapter.children.filter((node) => node.nodeType === "lesson").length,
    0
  );

  return {
    chapterCount: chapters.length,
    lessonCount,
  };
}

export default async function AdminSchoolCurriculumPage({ params }: AdminSchoolCurriculumPageProps) {
  const { schoolSlug } = await params;
  const [schools, tree, user, pendingRequests] = await Promise.all([
    listCurriculumSchools(),
    listCurriculumTree(),
    getCurrentUser(),
    listPendingCurriculumSubjectVisibilityRequests(schoolSlug),
  ]);
  const school = schools.find((item) => item.slug === schoolSlug) ?? null;

  if (!school) {
    notFound();
  }

  const selectedSubjects = school.years
    .flatMap((year) => year.subjects)
    .filter((subject, index, collection) => collection.findIndex((item) => item.slug === subject.slug) === index)
    .sort((left, right) => left.title.localeCompare(right.title));
  const selectedSubjectSlugs = new Set(selectedSubjects.map((subject) => subject.slug));
  const allSubjects = tree
    .filter((node) => node.nodeType === "subject" && node.parentId === null)
    .map((subject) => {
      const counts = countSubjectChildren(subject);
      return {
        id: subject.id,
        title: subject.title,
        slug: subject.slug,
        chapterCount: counts.chapterCount,
        lessonCount: counts.lessonCount,
        isVisible: selectedSubjectSlugs.has(subject.slug),
      };
    })
    .sort((left, right) => {
      if (left.isVisible !== right.isVisible) return left.isVisible ? -1 : 1;
      return left.title.localeCompare(right.title);
    });
  const canApprove = canApproveCurriculumSubjectVisibility(user?.email);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#f3f8ff_44%,#fbfdff_100%)] dark:bg-[linear-gradient(180deg,#020617_0%,#0f172a_52%,#020617_100%)]">
      <main className="portal-page-width px-4 pb-12 pt-5 sm:px-6 lg:px-8 lg:pb-16">
        <div className="space-y-5">
          <AdminBreadcrumb
            items={[
              { label: "Home", href: "/admin" },
              { label: "Curriculum", href: "/admin/curriculum" },
              { label: school.title },
            ]}
          />

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

          <SchoolSubjectVisibilityClient
            schoolTitle={school.title}
            schoolSlug={school.slug}
            subjects={allSubjects}
            canApprove={canApprove}
            pendingRequests={pendingRequests.map((request) => ({
              id: request.id,
              schoolSlug: request.schoolSlug,
              subjectId: request.subjectId,
              subjectTitle: request.subjectTitle,
              action: request.action,
              requestedByEmail: request.requestedByEmail,
              createdAt: request.createdAt.toISOString(),
            }))}
          />
        </div>
      </main>
    </div>
  );
}
