import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { CurriculumPortal } from "@/components/admin/curriculum-portal";
import { Button } from "@/components/ui/button";
import { listCurriculumSchools, listCurriculumTree } from "@/lib/curriculum-portal";

export const dynamic = "force-dynamic";

type AdminSchoolSubjectCurriculumPageProps = {
  params: Promise<{ schoolSlug: string; subjectSlug: string }>;
};

export default async function AdminSchoolSubjectCurriculumPage({
  params,
}: AdminSchoolSubjectCurriculumPageProps) {
  const { schoolSlug, subjectSlug } = await params;
  const [schools, tree] = await Promise.all([listCurriculumSchools(), listCurriculumTree()]);
  const school = schools.find((item) => item.slug === schoolSlug) ?? null;

  if (!school) {
    notFound();
  }

  const subjectExists = tree.some(
    (node) => node.nodeType === "subject" && node.parentId === null && node.slug === subjectSlug
  );
  if (!subjectExists) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#f3f8ff_44%,#fbfdff_100%)] dark:bg-[linear-gradient(180deg,#020617_0%,#0f172a_52%,#020617_100%)]">
      <main className="w-full max-w-none px-4 pb-12 pt-5 sm:px-6 lg:px-8 lg:pb-16">
        <div className="space-y-5">
          <Button asChild variant="outline" className="rounded-full">
            <Link href={`/admin/curriculum/${school.slug}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to subjects
            </Link>
          </Button>

          <CurriculumPortal
            lockedSchoolSlug={school.slug}
            lockedSubjectSlug={subjectSlug}
            compactMode
          />
        </div>
      </main>
    </div>
  );
}
