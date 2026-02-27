import { CurriculumPortal } from "@/components/admin/curriculum-portal";

export const dynamic = "force-dynamic";

export default function AdminCurriculumPage() {
  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden bg-slate-50 dark:bg-slate-950">
      <main className="h-full p-4 lg:p-6">
        <div className="mx-auto h-full max-w-7xl">
          <CurriculumPortal />
        </div>
      </main>
    </div>
  );
}
