import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminDashboard from "./admin-dashboard";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();

  return (
    <div className="bg-[linear-gradient(180deg,#f7faff_0%,#eef4ff_48%,#f9fbff_100%)] dark:bg-[linear-gradient(180deg,#020617_0%,#0f172a_52%,#020617_100%)]">
      <main className="portal-page-width flex w-full flex-col gap-6 px-4 pb-12 pt-4 sm:px-6 lg:px-8 lg:pb-16">
        <div className="space-y-6 lg:space-y-7">
          <Button
            asChild
            variant="outline"
            className="h-11 w-fit border-[#d8cdb7] bg-white/80 px-5 text-slate-700 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.65)] backdrop-blur hover:border-[#cabb9f] hover:bg-white hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-900"
          >
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>

          <AdminDashboard adminEmail={user?.email || "admin@edutindo.org"} />
        </div>
      </main>
    </div>
  );
}
