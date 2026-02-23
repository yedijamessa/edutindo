"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type AuthMode = "login" | "signup";

interface EmailPasswordAuthFormProps {
  mode: AuthMode;
  nextPath?: string;
  presetEmail?: string;
  verificationStatus?: "success" | "error";
  verificationReason?: string;
}

type ApiResponse = {
  ok: boolean;
  code?: string;
  error?: string;
  message?: string;
  redirectTo?: string;
};

function getVerificationError(reason: string | undefined) {
  if (!reason) return "Email verification failed. Please request a new link.";

  switch (reason) {
    case "TOKEN_EXPIRED":
      return "Your verification link expired. Please request a new verification email.";
    case "INVALID_TOKEN":
      return "Verification link is invalid or already used.";
    default:
      return "Email verification failed. Please request a new link.";
  }
}

export function EmailPasswordAuthForm({
  mode,
  nextPath,
  presetEmail,
  verificationStatus,
  verificationReason,
}: EmailPasswordAuthFormProps) {
  const router = useRouter();

  const [email, setEmail] = useState(presetEmail || "");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(
    verificationStatus === "success"
      ? "Email verified. You can now log in."
      : verificationStatus === "error"
      ? getVerificationError(verificationReason)
      : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const isLogin = mode === "login";
  const cardIcon = useMemo(() => (isLogin ? <ShieldCheck className="w-5 h-5" /> : <Mail className="w-5 h-5" />), [isLogin]);

  const submitSignup = async () => {
    setError(null);
    setErrorCode(null);
    setInfo(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName, lastName, password }),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.ok) {
        setErrorCode(data.code || null);
        setError(data.error || "Failed to create account.");
        return;
      }

      setInfo(data.message || "Verification email sent. Please check your inbox.");
      setPassword("");
    } catch (signupError) {
      console.error(signupError);
      setError("Unable to create account right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitLogin = async () => {
    setError(null);
    setErrorCode(null);
    setInfo(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, nextPath }),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.ok) {
        setErrorCode(data.code || null);
        setError(data.error || "Failed to log in.");
        return;
      }

      setInfo("Signed in successfully.");
      router.push(data.redirectTo || "/dashboard");
      router.refresh();
    } catch (loginError) {
      console.error(loginError);
      setError("Unable to log in right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendVerification = async () => {
    setError(null);
    setErrorCode(null);
    setInfo(null);
    setIsResending(true);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.ok) {
        setErrorCode(data.code || null);
        setError(data.error || "Failed to resend verification email.");
        return;
      }

      setInfo(data.message || "Verification email sent.");
    } catch (resendError) {
      console.error(resendError);
      setError("Unable to resend verification email right now.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-200 shadow-xl">
        <CardHeader className="space-y-3">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            {cardIcon}
          </div>
          <CardTitle className="text-2xl">{isLogin ? "Log In" : "Create Account"}</CardTitle>
          <CardDescription>
            {isLogin
              ? "Use your email and password to access your dashboard."
              : "Enter your details. We will send a verification email before you can log in."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {!isLogin && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">First name</label>
                <Input
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder="First name"
                  autoComplete="given-name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last name</label>
                <Input
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder="Last name"
                  autoComplete="family-name"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Email address</label>
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={isLogin ? "Enter your password" : "At least 8 characters"}
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
          </div>

          <Button
            className="w-full"
            onClick={isLogin ? submitLogin : submitSignup}
            disabled={
              isSubmitting ||
              !email.trim() ||
              !password ||
              (!isLogin && (!firstName.trim() || !lastName.trim()))
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isLogin ? "Signing in..." : "Creating account..."}
              </>
            ) : (
              <>
                {isLogin ? "Log In" : "Create Account"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>

          {isLogin && errorCode === "EMAIL_NOT_VERIFIED" && (
            <Button
              variant="outline"
              className="w-full"
              onClick={resendVerification}
              disabled={isResending || !email.trim()}
            >
              {isResending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Resend verification email"
              )}
            </Button>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
          {info && (
            <p className={`text-sm ${verificationStatus === "error" ? "text-red-600" : "text-green-700"}`}>
              {info}
            </p>
          )}

          <div className="pt-2 text-sm text-muted-foreground">
            {isLogin ? (
              <>
                No account yet?{" "}
                <Link className="text-primary font-medium hover:underline" href="/signup">
                  Sign up
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link className="text-primary font-medium hover:underline" href="/login">
                  Log in
                </Link>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
