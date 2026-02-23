import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminDashboard from "./admin-dashboard";
import { getCurrentUser } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="flex">
        <AdminSidebar activeSection="users" />

        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <Button asChild variant="outline" className="w-fit">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>

            <AdminDashboard adminEmail={user?.email || "admin@edutindo.org"} />
          </div>
        </main>
      </div>
    </div>
  );
}
