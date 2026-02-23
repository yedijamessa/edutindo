import { requirePortalAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requirePortalAccess("admin", "/admin");
  return <>{children}</>;
}
