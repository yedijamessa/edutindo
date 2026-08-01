import Link from "next/link";
import { ArrowLeft, LayoutGrid, LibraryBig } from "lucide-react";
import { CurriculumAssignPortalClient } from "@/components/admin/curriculum-assign-portal-client";
import { Button } from "@/components/ui/button";
import { requirePortalAccess } from "@/lib/auth";
import { listCurriculumAssignmentPortalData } from "@/lib/curriculum-assignment-portal";

export const dynamic = "force-dynamic";

export default async function CurriculumAssignPortalPage() {
  const user = await requirePortalAccess("admin", "/curriculum-assign-portal");
  const adminEmail = user?.email ?? "admin@edutindo.org";
  const data = await listCurriculumAssignmentPortalData();

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7faff_0%,#eef4ff_48%,#f9fbff_100%)]">
      <div className="portal-page-width flex w-full flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            asChild
            variant="outline"
            className="h-11 rounded-full border-[#d8e3fb] bg-white/85 px-5 text-slate-700 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.65)] hover:border-[#bcd0ff] hover:bg-white hover:text-slate-950"
          >
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="h-11 rounded-full border-[#d8e3fb] bg-white/85 px-5 text-slate-700 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.65)] hover:border-[#bcd0ff] hover:bg-white hover:text-slate-950"
          >
            <Link href="/admin/modules">
              <LibraryBig className="mr-2 h-4 w-4" />
              Module Library
            </Link>
          </Button>
        </div>

        <section className="rounded-[30px] border border-white/80 bg-white/92 p-5 shadow-[0_40px_90px_-64px_rgba(37,99,235,0.68)] backdrop-blur sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-[linear-gradient(180deg,#eef4ff_0%,#dfe8ff_100%)] text-[#2f6fff] shadow-[0_24px_48px_-34px_rgba(37,99,235,0.75)]">
                <LayoutGrid className="h-8 w-8" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#ea580c]">Admin</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-[2.45rem]">
                  Curriculum Assign Portal
                </h1>
                <p className="mt-2 text-[15px] font-medium text-[#64789c]">
                  Signed in as <span className="font-bold text-slate-900">{adminEmail}</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        <CurriculumAssignPortalClient initialData={data} />
      </div>
    </main>
  );
}
