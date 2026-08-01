import { notFound, redirect } from "next/navigation";
import { CurriculumLessonPage } from "@/components/lms/curriculum-lesson-page";
import { getCurrentUser } from "@/lib/auth";
import { listStudentAssignedModuleLessons } from "@/lib/module-editor";

export const dynamic = "force-dynamic";

type LessonPageProps = {
  params: Promise<{
    schoolSlug: string;
    yearSlug: string;
    subjectSlug: string;
    chapterSlug: string;
    lessonSlug: string;
  }>;
  searchParams: Promise<{ assignedEmail?: string }>;
};

function normalizeAssignedEmail(value: string | undefined) {
  return (value ?? "").trim().toLowerCase();
}

export default async function StudentSchoolCurriculumLessonPage({ params, searchParams }: LessonPageProps) {
  const { schoolSlug, yearSlug, subjectSlug, chapterSlug, lessonSlug } = await params;
  const { assignedEmail } = await searchParams;
  const user = await getCurrentUser();
  const normalizedAssignedEmail = normalizeAssignedEmail(assignedEmail);

  if (normalizedAssignedEmail && user?.email.toLowerCase() !== normalizedAssignedEmail) {
    const nextPath =
      `/student/materials/curriculum/${schoolSlug}/${yearSlug}/${subjectSlug}/${chapterSlug}/${lessonSlug}` +
      `?assignedEmail=${encodeURIComponent(normalizedAssignedEmail)}`;

    redirect(
      `/student-login?${new URLSearchParams({
        email: normalizedAssignedEmail,
        next: nextPath,
      }).toString()}`
    );
  }

  if (user?.schoolSlugs && user.schoolSlugs.length > 0 && !user.schoolSlugs.includes(schoolSlug)) {
    notFound();
  }

  const requestedHref = `/student/materials/curriculum/${schoolSlug}/${yearSlug}/${subjectSlug}/${chapterSlug}/${lessonSlug}`;
  const assignedLessons = await listStudentAssignedModuleLessons(user);
  const isAssignedToStudent = assignedLessons.some((lesson) => lesson.href === requestedHref);

  if (!isAssignedToStudent) {
    redirect("/student/materials");
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
