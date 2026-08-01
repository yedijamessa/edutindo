import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

type ChapterPageProps = {
  params: Promise<{ schoolSlug: string; yearSlug: string; subjectSlug: string; chapterSlug: string }>;
};

export default async function StudentSchoolCurriculumChapterPage({ params }: ChapterPageProps) {
  const { schoolSlug } = await params;
  const user = await getCurrentUser();

  if (user?.schoolSlugs && user.schoolSlugs.length > 0 && !user.schoolSlugs.includes(schoolSlug)) {
    notFound();
  }

  redirect("/student/materials");
}
