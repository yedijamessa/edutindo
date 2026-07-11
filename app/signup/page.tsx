import { EmailPasswordAuthForm } from "@/components/auth/email-otp-auth-form";
import { getAccountInvitePreview } from "@/lib/auth";

type SignupPageProps = {
  searchParams: Promise<{ next?: string; invite?: string }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const { next, invite } = await searchParams;
  const invitePreview = invite ? await getAccountInvitePreview(invite) : null;

  return (
    <EmailPasswordAuthForm
      mode="signup"
      nextPath={next}
      inviteToken={invite}
      invitePreview={
        invitePreview?.ok
          ? {
              email: invitePreview.email,
              firstName: invitePreview.firstName,
              lastName: invitePreview.lastName,
              schoolSlug: invitePreview.schoolSlug,
              portals: invitePreview.portals,
              expiresAt: invitePreview.expiresAt,
            }
          : null
      }
      inviteError={invitePreview && !invitePreview.ok ? invitePreview.error : null}
    />
  );
}
