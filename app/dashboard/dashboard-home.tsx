"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bell, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DashboardUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  portals: string[];
};

interface DashboardHomeProps {
  user: DashboardUser;
  initialShowPendingPopup: boolean;
}

const portalMeta: Record<string, { title: string; href: string; description: string }> = {
  student: {
    title: "Student Portal",
    href: "/student",
    description: "Learning materials, assignments, quizzes, and progress tracking.",
  },
  teacher: {
    title: "Teacher Portal",
    href: "/teacher",
    description: "Classroom tools, materials, and student management.",
  },
  parent: {
    title: "Parent Portal",
    href: "/parent",
    description: "Monitor student progress and communicate with school.",
  },
  principal: {
    title: "Principal Portal",
    href: "/principal",
    description: "School-wide visibility, reports, and coordination.",
  },
  admin: {
    title: "Admin Portal",
    href: "/admin",
    description: "Open the admin dashboard and choose an admin tool.",
  },
};

export default function DashboardHome({ user, initialShowPendingPopup }: DashboardHomeProps) {
  const portalKeys = useMemo(() => {
    const seeded = user.isAdmin ? ["admin", ...user.portals] : user.portals;
    return Array.from(new Set(seeded));
  }, [user.isAdmin, user.portals]);

  const hasPortalAccess = portalKeys.length > 0;
  const [showPendingPopup, setShowPendingPopup] = useState(initialShowPendingPopup || !hasPortalAccess);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome, {user.firstName || user.email}</CardTitle>
            <CardDescription>
              {hasPortalAccess
                ? "Choose a portal below to continue."
                : "Your account is active, but no portal is enabled yet."}
            </CardDescription>
          </CardHeader>
        </Card>

        {!hasPortalAccess ? (
          <Card className="border-blue-200 bg-blue-50/60">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-blue-100 p-2 text-blue-700">
                  <Shield className="h-5 w-5" />
                </div>
                <div className="space-y-3">
                  <p className="font-medium text-slate-900">Portal access pending admin release</p>
                  <p className="text-sm text-slate-700">
                    Please notify your admin to release the portal view for your account.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild>
                      <Link href="mailto:admin@edutindo.org">Notify Admin</Link>
                    </Button>
                    <Button variant="outline" onClick={() => setShowPendingPopup(true)}>
                      Show Notice
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {portalKeys
              .filter((portal) => portalMeta[portal])
              .map((portal) => {
                const meta = portalMeta[portal];

                return (
                  <Card key={portal} className="border-slate-200 shadow-sm">
                    <CardHeader className="space-y-2">
                      <div className="inline-flex w-fit rounded-full bg-blue-100 p-2 text-blue-700">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <CardTitle className="text-lg">{meta.title}</CardTitle>
                      <CardDescription>{meta.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button asChild className="w-full">
                        <Link href={meta.href}>Open Portal</Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}
      </div>

      <Dialog open={showPendingPopup} onOpenChange={setShowPendingPopup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-700" />
              Access Pending
            </DialogTitle>
            <DialogDescription>
              Your account has been created, but no portal is visible yet. Please notify admin to release your portal view.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button asChild>
              <Link href="mailto:admin@edutindo.org">Notify Admin</Link>
            </Button>
            <Button variant="outline" onClick={() => setShowPendingPopup(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
