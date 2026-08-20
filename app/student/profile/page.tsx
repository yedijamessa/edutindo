import { StudentProfileClient } from "./profile-client";
import { getCurrentUser } from "@/lib/auth";
import { listCurriculumSchools } from "@/lib/curriculum-portal";

export const dynamic = "force-dynamic";

export default async function StudentProfilePage() {
  const user = await getCurrentUser();
  const schools = user?.schoolSlugs && user.schoolSlugs.length > 0 ? await listCurriculumSchools() : [];
  const assignedSchools = (user?.schoolSlugs ?? [])
    .map((schoolSlug) => schools.find((school) => school.slug === schoolSlug))
    .filter((school): school is NonNullable<typeof school> => Boolean(school));
  const years = Array.from(
    new Set(assignedSchools.flatMap((school) => school.years.map((year) => year.title)).filter(Boolean))
  );
  const assignedSubjects = Array.from(
    new Set(
      assignedSchools.flatMap((school) =>
        school.years.flatMap((year) => year.subjects.map((subject) => subject.title))
      )
    )
  ).sort();
  const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || user?.email || "";

  return (
    <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">
      <StudentProfileClient
        initialProfile={{
          fullName,
          email: user?.email ?? "",
          mobilePhone: user?.mobilePhone ?? "",
          profilePhotoUrl: user?.profilePhotoUrl ?? "",
          studentId: user?.id ?? "",
        }}
        readonlyInfo={{
          schools: assignedSchools.map((school) => school.title),
          years,
          assignedSubjects,
        }}
      />
    </main>
  );
}
