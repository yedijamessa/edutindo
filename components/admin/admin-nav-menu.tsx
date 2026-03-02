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
        <Button type="button" variant="outline" size="icon" className="h-9 w-9" aria-label="Open admin menu">
          <Menu className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="left-0 top-0 flex h-full w-[22rem] max-w-[86vw] translate-x-0 translate-y-0 flex-col gap-0 rounded-none rounded-r-2xl border-l-0 p-0 data-[state=closed]:slide-out-to-left-full data-[state=closed]:slide-out-to-top-0 data-[state=open]:slide-in-from-left-full data-[state=open]:slide-in-from-top-0">
        <DialogHeader className="shrink-0 border-b px-4 py-4">
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
                    "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "border-blue-200 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
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
