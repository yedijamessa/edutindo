import { DemoAccessForm } from "@/components/auth/demo-access-form";

export const dynamic = "force-dynamic";

type DemoAccessPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function DemoAccessPage({ searchParams }: DemoAccessPageProps) {
  const { next } = await searchParams;

  return <DemoAccessForm nextPath={next} />;
}
