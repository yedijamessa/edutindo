import { EmailOtpAuthForm } from "@/components/auth/email-otp-auth-form";

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;
  return <EmailOtpAuthForm mode="login" nextPath={next} />;
}
