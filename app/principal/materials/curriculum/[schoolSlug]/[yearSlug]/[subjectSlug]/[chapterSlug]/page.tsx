import { CurriculumChapterPage } from "@/components/lms/curriculum-chapter-page";

export const dynamic = "force-dynamic";

type ChapterPageProps = {
  params: Promise<{ schoolSlug: string; yearSlug: string; subjectSlug: string; chapterSlug: string }>;
};

export default async function PrincipalSchoolCurriculumChapterPage({ params }: ChapterPageProps) {
  const { schoolSlug, yearSlug, subjectSlug, chapterSlug } = await params;

  return (
    <CurriculumChapterPage
      schoolSlug={schoolSlug}
      yearSlug={yearSlug}
      subjectSlug={subjectSlug}
      chapterSlug={chapterSlug}
      role="principal"
    />
  );
}
