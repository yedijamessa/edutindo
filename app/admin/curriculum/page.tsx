import { CurriculumPortal } from "@/components/admin/curriculum-portal";

export const dynamic = "force-dynamic";

export default function AdminCurriculumPage() {
  return (
    <div className="bg-[linear-gradient(180deg,#f7faff_0%,#eef4ff_48%,#f9fbff_100%)] dark:bg-[linear-gradient(180deg,#020617_0%,#0f172a_52%,#020617_100%)]">
      <main className="mx-auto w-full max-w-[1180px] px-4 pb-12 pt-5 sm:px-6 lg:px-8 lg:pb-16">
        <div className="space-y-5">
          <CurriculumPortal />
        </div>
      </main>
    </div>
  );
}
