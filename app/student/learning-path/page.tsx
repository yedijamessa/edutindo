import { StudentSidebarPanel } from "@/components/lms/student-sidebar-panel";
import { getCurrentUser } from "@/lib/auth";
import { listCurriculumSchools } from "@/lib/curriculum-portal";
import { listStudentAssignedModuleLessons } from "@/lib/module-editor";
import LearningPathClient from "./learning-path-client";

export const dynamic = "force-dynamic";

export default async function LearningPathPage() {
  const user = await getCurrentUser();
  const studentName = user ? `${user.firstName} ${user.lastName}`.trim() || user.email : "Student";
  const schools = user?.schoolSlugs && user.schoolSlugs.length > 0 ? await listCurriculumSchools() : [];
  const assignedSchoolTitles = (user?.schoolSlugs ?? [])
    .map((schoolSlug) => schools.find((school) => school.slug === schoolSlug)?.title)
    .filter((title): title is string => Boolean(title));
  const schoolTitle =
    assignedSchoolTitles.length <= 1
      ? assignedSchoolTitles[0] ?? null
      : `${assignedSchoolTitles.length} schools assigned`;
  const assignedLessons = await listStudentAssignedModuleLessons(user);

  return (
    <div className="min-h-screen bg-[#f4f8fc] text-slate-900">
      <div className="portal-page-width flex min-h-screen">
        <StudentSidebarPanel heading={studentName} subheading="Student portal" detail={schoolTitle} />
        <main className="min-w-0 flex-1 p-6 lg:p-8">
          <LearningPathClient assignedLessons={assignedLessons} />
        </main>
      </div>
    </div>
  );
}
