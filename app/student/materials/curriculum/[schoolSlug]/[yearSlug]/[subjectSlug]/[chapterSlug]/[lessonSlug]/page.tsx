import { notFound } from "next/navigation";
import { CurriculumLessonPage } from "@/components/lms/curriculum-lesson-page";
import { getCurrentUser } from "@/lib/auth";

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

export default async function StudentSchoolCurriculumLessonPage({ params }: LessonPageProps) {
  const { schoolSlug, yearSlug, subjectSlug, chapterSlug, lessonSlug } = await params;
  const user = await getCurrentUser();

  if (user?.schoolSlug && user.schoolSlug !== schoolSlug) {
    notFound();
  }

  return (
    <CurriculumLessonPage
      schoolSlug={schoolSlug}
      yearSlug={yearSlug}
      subjectSlug={subjectSlug}
      chapterSlug={chapterSlug}
      lessonSlug={lessonSlug}
      role="student"
    />
  );
}
