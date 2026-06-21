"use client";

import { usePathname } from "next/navigation";
import { StudentSidebarPanel } from "@/components/lms/student-sidebar-panel";

type StudentRouteShellProps = {
  children: React.ReactNode;
  studentName?: string;
  schoolTitle?: string | null;
};

export function StudentRouteShell({ children, studentName = "Student Portal", schoolTitle = null }: StudentRouteShellProps) {
  const pathname = usePathname();

  if (pathname === "/student") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#f4f8fc] text-slate-900">
      <div className="portal-page-width flex min-h-screen">
        <StudentSidebarPanel heading={studentName} subheading="Student portal" detail={schoolTitle} />

        <div className="min-w-0 flex-1 [&_aside]:hidden lg:[&_aside]:hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
