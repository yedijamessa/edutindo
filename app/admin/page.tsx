import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminDashboard from "./admin-dashboard";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="flex">
        <aside className="hidden lg:block w-64 border-r bg-card p-6 min-h-screen sticky top-0">
          <div className="mb-8">
            <h2 className="text-lg font-bold">Admin Portal</h2>
          </div>
          <nav className="space-y-2 text-sm">
            <Link className="block rounded-lg border px-3 py-2 font-medium hover:bg-muted" href="/admin">
              User Access
            </Link>
            <Link className="block rounded-lg border px-3 py-2 font-medium hover:bg-muted" href="/">
              Public Site
            </Link>
            <Link className="block rounded-lg border px-3 py-2 font-medium hover:bg-muted" href="/student">
              Student Portal
            </Link>
          </nav>
        </aside>

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
