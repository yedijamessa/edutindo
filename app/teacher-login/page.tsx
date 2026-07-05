import { EmailPasswordAuthForm } from "@/components/auth/email-otp-auth-form";

type TeacherLoginPageProps = {
  searchParams: Promise<{ next?: string; verified?: string; reason?: string; email?: string }>;
};

export default async function TeacherLoginPage({ searchParams }: TeacherLoginPageProps) {
  const { next, verified, reason, email } = await searchParams;

  const verificationStatus =
    verified === "1" ? "success" : verified === "0" ? "error" : undefined;

  return (
    <EmailPasswordAuthForm
      mode="login"
      nextPath={next || "/teacher"}
      presetEmail={email}
      verificationStatus={verificationStatus}
      verificationReason={reason}
    />
  );
}
