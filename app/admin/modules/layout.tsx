import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function ModulesLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/admin/modules");
  }

  const canAccess =
    user.isAdmin ||
    user.portals.includes("admin") ||
    user.portals.includes("curriculum");

  if (!canAccess) {
    redirect("/");
  }

  return <>{children}</>;
}
