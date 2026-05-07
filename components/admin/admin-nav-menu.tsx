"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const adminMenuItems = [
  { label: "Admin Dashboard", href: "/admin" },
  { label: "Admin Access Control", href: "/admin/access" },
  { label: "Learning Materials", href: "/admin/materials" },
  { label: "Curriculum Portal", href: "/admin/curriculum" },
  { label: "Module Editor", href: "/admin/module-editor" },
  { label: "Public Site", href: "/" },
  { label: "Student Portal", href: "/student" },
  { label: "Teacher Portal", href: "/teacher" },
  { label: "Parent Portal", href: "/parent" },
  { label: "Principal Portal", href: "/principal" },
];

export function AdminNavMenu() {
  const pathname = usePathname();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-11 w-11 border-[#d8cdb7] bg-white/60 text-slate-700 shadow-[0_14px_28px_-18px_rgba(78,58,38,0.42)] hover:border-[#cabb9f] hover:bg-white/85 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-900"
          aria-label="Open admin menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="left-0 top-0 flex h-full w-[22rem] max-w-[86vw] translate-x-0 translate-y-0 flex-col gap-0 rounded-none rounded-r-[1.75rem] border-l-0 border-r border-r-[#e6dbc6] bg-[#fffaf0] p-0 data-[state=closed]:slide-out-to-left-full data-[state=closed]:slide-out-to-top-0 data-[state=open]:slide-in-from-left-full data-[state=open]:slide-in-from-top-0 dark:border-r-slate-800 dark:bg-slate-950">
        <DialogHeader className="shrink-0 border-b border-[#eadfc9] px-4 py-4 dark:border-slate-800">
          <DialogTitle className="text-base">Admin Navigation</DialogTitle>
        </DialogHeader>
        <nav className="grid flex-1 content-start gap-1 overflow-y-auto p-3">
          {adminMenuItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : item.href.startsWith("/admin")
                  ? pathname.startsWith(item.href)
                  : pathname === item.href;

            return (
              <DialogClose asChild key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "rounded-2xl border px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/80 dark:bg-blue-950/60 dark:text-blue-200"
                      : "border-[#e4d9c7] bg-white text-slate-700 hover:bg-[#fbf6eb] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                  )}
                >
                  {item.label}
                </Link>
              </DialogClose>
            );
          })}
        </nav>
      </DialogContent>
    </Dialog>
  );
}
