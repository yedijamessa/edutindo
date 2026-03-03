"use client";

import Link from "next/link";
import { BookOpen, LayoutGrid, NotebookTabs, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminDashboardProps {
  adminEmail: string;
}

const adminTools = [
  {
    title: "Curriculum Portal",
    href: "/admin/curriculum",
    description: "Organize school, year, subject, chapter, and module structure.",
    icon: LayoutGrid,
  },
  {
    title: "Learning Materials",
    href: "/admin/materials",
    description: "Review curriculum-linked materials and content pages.",
    icon: BookOpen,
  },
  {
    title: "Module Editor",
    href: "/admin/module-editor",
    description: "Build chapter and module pages with text, images, and quizzes.",
    icon: NotebookTabs,
  },
  {
    title: "Admin Access Control",
    href: "/admin/access",
    description: "Manage which users can open each portal.",
    icon: ShieldCheck,
  },
];

const crossPortalLinks = [
  { title: "Student Portal", href: "/student" },
  { title: "Teacher Portal", href: "/teacher" },
  { title: "Parent Portal", href: "/parent" },
  { title: "Principal Portal", href: "/principal" },
];

export default function AdminDashboard({ adminEmail }: AdminDashboardProps) {
  return (
    <div className="space-y-6">
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
          <CardDescription>
            Signed in as <span className="font-medium text-foreground">{adminEmail}</span>. Choose which admin portal you want to open.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {adminTools.map((tool) => {
          const Icon = tool.icon;

          return (
            <Card key={tool.href} className="border-slate-200 shadow-sm">
              <CardHeader className="space-y-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={tool.href}>Open</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <Users className="h-5 w-5" />
          </div>
          <CardTitle className="text-lg">Other Portals</CardTitle>
          <CardDescription>Jump into the user-facing portals from the admin dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {crossPortalLinks.map((item) => (
            <Button key={item.href} asChild variant="outline" className="justify-start">
              <Link href={item.href}>{item.title}</Link>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
