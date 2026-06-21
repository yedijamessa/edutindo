import { CurriculumPortal } from "@/components/admin/curriculum-portal";

export const dynamic = "force-dynamic";

export default function AdminCurriculumPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#f3f8ff_44%,#fbfdff_100%)] dark:bg-[linear-gradient(180deg,#020617_0%,#0f172a_52%,#020617_100%)]">
      <main className="portal-page-width px-4 pb-12 pt-5 sm:px-6 lg:px-8 lg:pb-16">
        <div className="space-y-5">
          <CurriculumPortal />
        </div>
      </main>
    </div>
  );
}
