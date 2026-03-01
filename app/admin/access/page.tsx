import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { AccessControl } from "./access-control";

export const dynamic = "force-dynamic";

export default async function AdminAccessPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <main className="p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <Button asChild variant="outline" className="w-fit">
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin Dashboard
            </Link>
          </Button>

          <AccessControl adminEmail={user?.email || "admin@edutindo.org"} />
        </div>
      </main>
    </div>
  );
}
