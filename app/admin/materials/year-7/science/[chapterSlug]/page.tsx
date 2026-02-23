import { Year7ScienceChapterPage } from "@/components/lms/year7-science-chapter-page";

export const dynamic = "force-dynamic";

type ChapterPageProps = {
  params: Promise<{ chapterSlug: string }>;
};

export default async function AdminYear7ScienceChapterPage({ params }: ChapterPageProps) {
  const { chapterSlug } = await params;
  return <Year7ScienceChapterPage chapterSlug={chapterSlug} role="admin" />;
}
