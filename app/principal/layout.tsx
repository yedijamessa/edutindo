import { requirePortalAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PrincipalLayout({ children }: { children: React.ReactNode }) {
  await requirePortalAccess("principal", "/principal");
  return <>{children}</>;
}
