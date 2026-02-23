import { requirePortalAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  await requirePortalAccess("student", "/student");
  return <>{children}</>;
}
