import { Year7ScienceLessonPage } from "@/components/lms/year7-science-lesson-page";
import { getYear7ScienceLessonRouteParams } from "@/lib/curriculum/year7/science";

type LessonPageProps = {
  params: Promise<{ chapterSlug: string; lessonSlug: string }>;
};

export function generateStaticParams() {
  return getYear7ScienceLessonRouteParams();
}

export default async function StudentYear7ScienceLessonPage({ params }: LessonPageProps) {
  const { chapterSlug, lessonSlug } = await params;

  return <Year7ScienceLessonPage chapterSlug={chapterSlug} lessonSlug={lessonSlug} role="student" />;
}
