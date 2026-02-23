import { requirePortalAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  await requirePortalAccess("parent", "/parent");
  return <>{children}</>;
}
