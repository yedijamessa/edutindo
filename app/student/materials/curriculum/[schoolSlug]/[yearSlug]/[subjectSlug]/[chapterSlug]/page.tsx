import { notFound } from "next/navigation";
import { CurriculumChapterPage } from "@/components/lms/curriculum-chapter-page";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

type ChapterPageProps = {
  params: Promise<{ schoolSlug: string; yearSlug: string; subjectSlug: string; chapterSlug: string }>;
};

export default async function StudentSchoolCurriculumChapterPage({ params }: ChapterPageProps) {
  const { schoolSlug, yearSlug, subjectSlug, chapterSlug } = await params;
  const user = await getCurrentUser();

  if (user?.schoolSlug && user.schoolSlug !== schoolSlug) {
    notFound();
  }

  return (
    <CurriculumChapterPage
      schoolSlug={schoolSlug}
      yearSlug={yearSlug}
      subjectSlug={subjectSlug}
      chapterSlug={chapterSlug}
      role="student"
    />
  );
}
