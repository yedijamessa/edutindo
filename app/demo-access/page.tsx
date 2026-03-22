import type { Metadata } from "next";
import { DemoAccessForm } from "@/components/auth/demo-access-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Portal Access",
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

type DemoAccessPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function DemoAccessPage({ searchParams }: DemoAccessPageProps) {
  const { next } = await searchParams;

  return <DemoAccessForm nextPath={next} />;
}
