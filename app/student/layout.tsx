import type { Metadata } from "next";
import { StudentRouteShell } from "@/components/lms/student-route-shell";
import { listCurriculumSchools } from "@/lib/curriculum-portal";
import { requirePortalAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePortalAccess("student", "/student");
  const studentName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || user?.email || "Student Portal";
  const schools = user?.schoolSlugs && user.schoolSlugs.length > 0 ? await listCurriculumSchools() : [];
  const assignedSchoolTitles = (user?.schoolSlugs ?? [])
    .map((schoolSlug) => schools.find((school) => school.slug === schoolSlug)?.title)
    .filter((title): title is string => Boolean(title));
  const schoolTitle =
    assignedSchoolTitles.length <= 1
      ? assignedSchoolTitles[0] ?? null
      : `${assignedSchoolTitles.length} schools assigned`;

  return (
    <StudentRouteShell studentName={studentName} schoolTitle={schoolTitle} canOpenLockedItems={Boolean(user?.isAdmin)}>
      {children}
    </StudentRouteShell>
  );
}
