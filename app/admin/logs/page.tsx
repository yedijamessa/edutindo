import Link from "next/link";
import { ArrowLeft, Clock3, FileClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listAdminActivityLogs } from "@/lib/admin-activity";

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Unknown time";

  return parsed.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAction(action: string, itemType: string) {
  if (action === "assigned") return "Assigned module";
  return `${action[0]?.toUpperCase() ?? ""}${action.slice(1)} ${itemType}`;
}

export default async function AdminLogsPage() {
  const logs = await listAdminActivityLogs();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7faff_0%,#eef4ff_48%,#f9fbff_100%)] dark:bg-[linear-gradient(180deg,#020617_0%,#0f172a_52%,#020617_100%)]">
      <main className="portal-page-width px-4 pb-12 pt-5 sm:px-6 lg:px-8 lg:pb-16">
        <div className="space-y-5">
          <Button
            asChild
            variant="outline"
            className="h-11 w-fit border-[#d8cdb7] bg-white/80 px-5 text-slate-700 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.65)] backdrop-blur hover:border-[#cabb9f] hover:bg-white hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-900"
          >
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin
            </Link>
          </Button>

          <section className="rounded-[30px] border border-white/70 bg-white/92 p-6 shadow-[0_36px_90px_-68px_rgba(37,99,235,0.58)] dark:border-slate-800 dark:bg-slate-900/84">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-[linear-gradient(180deg,#eef4ff_0%,#dfe8ff_100%)] text-[#2f6fff]">
                  <FileClock className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Admin Logs</p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
                    Recent Content Activity
                  </h1>
                  <p className="mt-2 max-w-2xl text-[15px] leading-7 text-slate-500 dark:text-slate-300">
                    Latest curriculum, chapter, module, assignment, and edit records.
                  </p>
                </div>
              </div>
              <span className="inline-flex h-10 items-center rounded-full border border-[#dce7ff] bg-[#f4f8ff] px-4 text-sm font-semibold text-[#2f6fff]">
                {logs.length} records
              </span>
            </div>
          </section>

          <section className="overflow-x-auto rounded-[24px] border border-slate-200/80 bg-white/95 shadow-[0_24px_60px_-48px_rgba(15,23,42,0.5)] dark:border-slate-800 dark:bg-slate-900/84">
            <div className="grid min-w-[760px] grid-cols-[160px_minmax(0,1fr)_minmax(160px,0.7fr)_190px] gap-4 border-b border-slate-200 bg-[#f8fbff] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:border-slate-800 dark:bg-slate-950/70">
              <span>Action</span>
              <span>Item</span>
              <span>User</span>
              <span>Time</span>
            </div>

            {logs.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-300">
                No activity records found yet.
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="grid min-w-[760px] grid-cols-[160px_minmax(0,1fr)_minmax(160px,0.7fr)_190px] gap-4 border-b border-slate-100 px-5 py-4 text-sm last:border-b-0 dark:border-slate-800"
                >
                  <span className="font-semibold text-slate-900 dark:text-slate-50">
                    {formatAction(log.action, log.itemType)}
                  </span>
                  <span className="min-w-0 truncate text-slate-600 dark:text-slate-300">{log.title}</span>
                  <span className="min-w-0 truncate text-slate-500 dark:text-slate-400">{log.actorEmail}</span>
                  <span className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Clock3 className="h-4 w-4" />
                    {formatDate(log.occurredAt)}
                  </span>
                </div>
              ))
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
