import { Year7ScienceChapterPage } from "@/components/lms/year7-science-chapter-page";

type ChapterPageProps = {
  params: Promise<{ chapterSlug: string }>;
};

export default async function TeacherYear7ScienceChapterPage({ params }: ChapterPageProps) {
  const { chapterSlug } = await params;
  return <Year7ScienceChapterPage chapterSlug={chapterSlug} role="teacher" />;
}
