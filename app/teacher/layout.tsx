import { requirePortalAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  await requirePortalAccess("teacher", "/teacher");
  return <>{children}</>;
}
