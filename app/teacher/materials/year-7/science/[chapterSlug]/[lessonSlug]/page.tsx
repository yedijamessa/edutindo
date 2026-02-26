import { CurriculumLessonPage } from "@/components/lms/curriculum-lesson-page";

export const dynamic = "force-dynamic";

type LessonPageProps = {
  params: Promise<{ chapterSlug: string; lessonSlug: string }>;
};

export default async function TeacherYear7ScienceLessonPage({ params }: LessonPageProps) {
  const { chapterSlug, lessonSlug } = await params;

  return (
    <CurriculumLessonPage
      yearSlug="year-7"
      subjectSlug="science"
      chapterSlug={chapterSlug}
      lessonSlug={lessonSlug}
      role="teacher"
    />
  );
}
