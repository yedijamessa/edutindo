import { EmailPasswordAuthForm } from "@/components/auth/email-otp-auth-form";

type ParentLoginPageProps = {
  searchParams: Promise<{ next?: string; verified?: string; reason?: string; email?: string }>;
};

export default async function ParentLoginPage({ searchParams }: ParentLoginPageProps) {
  const { next, verified, reason, email } = await searchParams;

  const verificationStatus =
    verified === "1" ? "success" : verified === "0" ? "error" : undefined;

  return (
    <EmailPasswordAuthForm
      mode="login"
      nextPath={next || "/parent"}
      presetEmail={email}
      verificationStatus={verificationStatus}
      verificationReason={reason}
    />
  );
}
