import { Year7ScienceLessonPage } from "@/components/lms/year7-science-lesson-page";

export const dynamic = "force-dynamic";

type LessonPageProps = {
  params: Promise<{ chapterSlug: string; lessonSlug: string }>;
};

export default async function AdminYear7ScienceLessonPage({ params }: LessonPageProps) {
  const { chapterSlug, lessonSlug } = await params;

  return <Year7ScienceLessonPage chapterSlug={chapterSlug} lessonSlug={lessonSlug} role="admin" />;
}
