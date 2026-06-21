import { SidebarNav } from "@/components/lms/sidebar-nav";

interface StudentSidebarPanelProps {
  heading?: string;
  subheading?: string;
  detail?: string | null;
}

export function StudentSidebarPanel({
  heading = "Student Portal",
  subheading = "Navigation",
  detail = null,
}: StudentSidebarPanelProps) {
  return (
    <aside className="hidden w-[282px] shrink-0 border-r border-[#e5edf7] bg-white/90 lg:flex lg:flex-col">
      <div className="border-b border-[#edf2f8] px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{subheading}</p>
        <p className="mt-2 text-lg font-bold text-slate-900">{heading}</p>
        {detail ? <p className="mt-1 text-sm text-slate-500">{detail}</p> : null}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <SidebarNav role="student" />
      </div>
    </aside>
  );
}
