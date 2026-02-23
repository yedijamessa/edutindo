import { EmailPasswordAuthForm } from "@/components/auth/email-otp-auth-form";

type SignupPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const { next } = await searchParams;
  return <EmailPasswordAuthForm mode="signup" nextPath={next} />;
}
