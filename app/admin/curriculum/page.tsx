import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { CurriculumPortal } from "@/components/admin/curriculum-portal";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function AdminCurriculumPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="flex">
        <AdminSidebar activeSection="curriculum" />

        <main className="flex-1 p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <Button asChild variant="outline" className="w-fit">
              <Link href="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Admin Dashboard
              </Link>
            </Button>

            <CurriculumPortal />
          </div>
        </main>
      </div>
    </div>
  );
}
