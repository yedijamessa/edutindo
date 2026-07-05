import { EmailPasswordAuthForm } from "@/components/auth/email-otp-auth-form";

type PrincipalLoginPageProps = {
  searchParams: Promise<{ next?: string; verified?: string; reason?: string; email?: string }>;
};

export default async function PrincipalLoginPage({ searchParams }: PrincipalLoginPageProps) {
  const { next, verified, reason, email } = await searchParams;

  const verificationStatus =
    verified === "1" ? "success" : verified === "0" ? "error" : undefined;

  return (
    <EmailPasswordAuthForm
      mode="login"
      nextPath={next || "/principal"}
      presetEmail={email}
      verificationStatus={verificationStatus}
      verificationReason={reason}
    />
  );
}
