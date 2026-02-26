import Link from "next/link";
import { cn } from "@/components/ui/button";

interface AdminSidebarProps {
  activeSection?: "users" | "materials" | "curriculum";
}

const baseLinkClass =
  "block rounded-lg border px-3 py-2 font-medium transition-colors hover:bg-muted";

const activeLinkClass = "bg-primary text-primary-foreground hover:bg-primary/90";

export function AdminSidebar({ activeSection = "users" }: AdminSidebarProps) {
  return (
    <aside className="hidden lg:block w-64 border-r bg-card p-6 min-h-screen sticky top-0">
      <div className="mb-8">
        <h2 className="text-lg font-bold">Admin Portal</h2>
      </div>
      <nav className="space-y-2 text-sm">
        <Link
          className={cn(baseLinkClass, activeSection === "users" && activeLinkClass)}
          href="/admin"
        >
          User Access
        </Link>
        <Link
          className={cn(baseLinkClass, activeSection === "materials" && activeLinkClass)}
          href="/admin/materials"
        >
          Learning Materials
        </Link>
        <Link
          className={cn(baseLinkClass, activeSection === "curriculum" && activeLinkClass)}
          href="/admin/curriculum"
        >
          Curriculum Portal
        </Link>
        <Link className={baseLinkClass} href="/">
          Public Site
        </Link>
        <Link className={baseLinkClass} href="/student">
          Student Portal
        </Link>
        <Link className={baseLinkClass} href="/teacher">
          Teacher Portal
        </Link>
        <Link className={baseLinkClass} href="/parent">
          Parent Portal
        </Link>
        <Link className={baseLinkClass} href="/principal">
          Principal Portal
        </Link>
      </nav>
    </aside>
  );
}
