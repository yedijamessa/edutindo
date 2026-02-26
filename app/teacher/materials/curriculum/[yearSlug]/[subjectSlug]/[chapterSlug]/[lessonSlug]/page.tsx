import { CurriculumLessonPage } from "@/components/lms/curriculum-lesson-page";

export const dynamic = "force-dynamic";

type LessonPageProps = {
  params: Promise<{ yearSlug: string; subjectSlug: string; chapterSlug: string; lessonSlug: string }>;
};

export default async function TeacherCurriculumLessonPage({ params }: LessonPageProps) {
  const { yearSlug, subjectSlug, chapterSlug, lessonSlug } = await params;

  return (
    <CurriculumLessonPage
      yearSlug={yearSlug}
      subjectSlug={subjectSlug}
      chapterSlug={chapterSlug}
      lessonSlug={lessonSlug}
      role="teacher"
    />
  );
}
