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
  { label: "User Access", href: "/admin" },
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
      <DialogContent className="max-w-sm p-0">
        <DialogHeader className="border-b px-4 py-3">
          <DialogTitle className="text-base">Admin Navigation</DialogTitle>
        </DialogHeader>
        <nav className="grid gap-1 p-3">
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
