"use client";

import { usePathname } from "next/navigation";
import { StudentSidebarPanel } from "@/components/lms/student-sidebar-panel";

type StudentRouteShellProps = {
  children: React.ReactNode;
  studentName?: string;
  schoolTitle?: string | null;
  profilePhotoUrl?: string | null;
  canOpenLockedItems?: boolean;
};

export function StudentRouteShell({
  children,
  studentName = "Student Portal",
  schoolTitle = null,
  profilePhotoUrl = null,
  canOpenLockedItems = false,
}: StudentRouteShellProps) {
  const pathname = usePathname();
  const isCurriculumLessonPage = /^\/student\/materials\/curriculum\/[^/]+\/[^/]+\/[^/]+\/[^/]+\/[^/]+\/?$/.test(pathname);

  if (pathname === "/student" || isCurriculumLessonPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#f4f8fc] text-slate-900">
      <div className="portal-page-width flex min-h-screen">
        <StudentSidebarPanel
          heading={studentName}
          subheading="Student portal"
          detail={schoolTitle}
          profilePhotoUrl={profilePhotoUrl}
          canOpenLockedItems={canOpenLockedItems}
        />

        <div className="min-w-0 flex-1 [&_aside]:hidden lg:[&_aside]:hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
