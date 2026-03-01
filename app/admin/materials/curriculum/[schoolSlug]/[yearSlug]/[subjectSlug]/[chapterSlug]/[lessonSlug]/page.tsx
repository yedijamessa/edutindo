import { CurriculumLessonPage } from "@/components/lms/curriculum-lesson-page";

export const dynamic = "force-dynamic";

type LessonPageProps = {
  params: Promise<{
    schoolSlug: string;
    yearSlug: string;
    subjectSlug: string;
    chapterSlug: string;
    lessonSlug: string;
  }>;
};

export default async function AdminSchoolCurriculumLessonPage({ params }: LessonPageProps) {
  const { schoolSlug, yearSlug, subjectSlug, chapterSlug, lessonSlug } = await params;

  return (
    <CurriculumLessonPage
      schoolSlug={schoolSlug}
      yearSlug={yearSlug}
      subjectSlug={subjectSlug}
      chapterSlug={chapterSlug}
      lessonSlug={lessonSlug}
      role="admin"
    />
  );
}
