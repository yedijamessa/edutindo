import { redirect } from "next/navigation";
import { requireSignedIn } from "@/lib/auth";
import { resolveAuthenticatedHomePath } from "@/lib/auth-shared";
import DashboardHome from "./dashboard-home";

export const dynamic = "force-dynamic";

type DashboardPageProps = {
  searchParams: Promise<{ pending?: string }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await requireSignedIn("/dashboard");
  const { pending } = await searchParams;
  const homePath = resolveAuthenticatedHomePath(user, "");

  if (homePath) {
    redirect(homePath);
  }

  return (
    <DashboardHome
      user={{
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin,
        portals: user.portals,
      }}
      initialShowPendingPopup={pending === "1" || user.portals.length === 0}
    />
  );
}
