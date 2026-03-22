import type { Metadata } from "next";
import { requirePortalAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requirePortalAccess("admin", "/admin");
  return <>{children}</>;
}
