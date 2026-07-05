import { EmailPasswordAuthForm } from "@/components/auth/email-otp-auth-form";

type StudentLoginPageProps = {
  searchParams: Promise<{ next?: string; verified?: string; reason?: string; email?: string }>;
};

export default async function StudentLoginPage({ searchParams }: StudentLoginPageProps) {
  const { next, verified, reason, email } = await searchParams;

  const verificationStatus =
    verified === "1" ? "success" : verified === "0" ? "error" : undefined;

  return (
    <EmailPasswordAuthForm
      mode="login"
      nextPath={next || "/student"}
      presetEmail={email}
      verificationStatus={verificationStatus}
      verificationReason={reason}
    />
  );
}
