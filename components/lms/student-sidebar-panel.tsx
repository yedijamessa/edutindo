import Link from "next/link";
import { UserRound } from "lucide-react";
import { SidebarNav } from "@/components/lms/sidebar-nav";

interface StudentSidebarPanelProps {
  heading?: string;
  subheading?: string;
  detail?: string | null;
  profilePhotoUrl?: string | null;
  canOpenLockedItems?: boolean;
}

export function StudentSidebarPanel({
  heading = "Student Portal",
  subheading = "Navigation",
  detail = null,
  profilePhotoUrl = null,
  canOpenLockedItems = false,
}: StudentSidebarPanelProps) {
  const initials = heading
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "S";

  return (
    <aside className="hidden w-[282px] shrink-0 border-r border-[#e5edf7] bg-white/90 lg:flex lg:flex-col">
      <div className="border-b border-[#edf2f8] px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{subheading}</p>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#eef4ff] text-sm font-black text-[#2f6fff]">
            {profilePhotoUrl ? (
              <img src={profilePhotoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <p className="min-w-0 text-lg font-bold leading-tight text-slate-900">{heading}</p>
        </div>
        {detail ? <p className="mt-1 text-sm text-slate-500">{detail}</p> : null}
        <Link
          href="/student/profile"
          className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#dce6ff] bg-white px-3 py-1.5 text-xs font-bold text-[#2f6fff] transition-colors hover:bg-[#f7faff]"
        >
          <UserRound className="h-3.5 w-3.5" />
          Edit Profile
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <SidebarNav role="student" canOpenLockedItems={canOpenLockedItems} />
      </div>
    </aside>
  );
}
