import { Year7ScienceChapterPage } from "@/components/lms/year7-science-chapter-page";
import { year7ScienceChapters } from "@/lib/curriculum/year7/science";

type ChapterPageProps = {
  params: Promise<{ chapterSlug: string }>;
};

export function generateStaticParams() {
  return year7ScienceChapters.map((chapter) => ({ chapterSlug: chapter.slug }));
}

export default async function StudentYear7ScienceChapterPage({ params }: ChapterPageProps) {
  const { chapterSlug } = await params;
  return <Year7ScienceChapterPage chapterSlug={chapterSlug} role="student" />;
}
