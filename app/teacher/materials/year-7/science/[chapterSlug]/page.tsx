import { CurriculumChapterPage } from "@/components/lms/curriculum-chapter-page";

export const dynamic = "force-dynamic";

type ChapterPageProps = {
  params: Promise<{ chapterSlug: string }>;
};

export default async function TeacherYear7ScienceChapterPage({ params }: ChapterPageProps) {
  const { chapterSlug } = await params;

  return (
    <CurriculumChapterPage
      yearSlug="year-7"
      subjectSlug="science"
      chapterSlug={chapterSlug}
      role="teacher"
    />
  );
}
