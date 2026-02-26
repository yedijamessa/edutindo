import { CurriculumChapterPage } from "@/components/lms/curriculum-chapter-page";

export const dynamic = "force-dynamic";

type ChapterPageProps = {
  params: Promise<{ yearSlug: string; subjectSlug: string; chapterSlug: string }>;
};

export default async function AdminCurriculumChapterPage({ params }: ChapterPageProps) {
  const { yearSlug, subjectSlug, chapterSlug } = await params;

  return (
    <CurriculumChapterPage
      yearSlug={yearSlug}
      subjectSlug={subjectSlug}
      chapterSlug={chapterSlug}
      role="admin"
    />
  );
}
