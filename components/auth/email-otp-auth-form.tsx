"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type AuthMode = "login" | "signup";

interface EmailOtpAuthFormProps {
  mode: AuthMode;
  nextPath?: string;
}

type RequestOtpResponse = {
  ok: boolean;
  error?: string;
};

type VerifyOtpResponse = {
  ok: boolean;
  error?: string;
  redirectTo?: string;
};

export function EmailOtpAuthForm({ mode, nextPath }: EmailOtpAuthFormProps) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLogin = mode === "login";

  const requestOtp = async () => {
    setError(null);
    setInfo(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, mode }),
      });

      const data: RequestOtpResponse = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.error || "Failed to send passcode.");
        return;
      }

      setStep("otp");
      setInfo("Passcode sent. Check your email.");
    } catch (requestError) {
      console.error(requestError);
      setError("Unable to send passcode right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyOtp = async () => {
    setError(null);
    setInfo(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp, mode, nextPath }),
      });

      const data: VerifyOtpResponse = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.error || "Invalid passcode.");
        return;
      }

      setInfo("Signed in successfully.");
      router.push(data.redirectTo || (isLogin ? "/student" : "/student"));
      router.refresh();
    } catch (verifyError) {
      console.error(verifyError);
      setError("Unable to verify passcode right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-200 shadow-xl">
        <CardHeader className="space-y-3">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            {step === "email" ? <Mail className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
          </div>
          <CardTitle className="text-2xl">{isLogin ? "Log In" : "Create Account"}</CardTitle>
          <CardDescription>
            {step === "email"
              ? "Use your email and we will send a one-time passcode."
              : `Enter the 6-digit passcode sent to ${email}.`}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {step === "email" ? (
            <>
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
              <Button
                className="w-full"
                onClick={requestOtp}
                disabled={isSubmitting || !email.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Passcode
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">One-time passcode</label>
                <Input
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  placeholder="123456"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                />
              </div>
              <Button
                className="w-full"
                onClick={verifyOtp}
                disabled={isSubmitting || otp.trim().length !== 6}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Continue"
                )}
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                disabled={isSubmitting}
                onClick={requestOtp}
              >
                Resend passcode
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={isSubmitting}
                onClick={() => {
                  setStep("email");
                  setOtp("");
                }}
              >
                Use a different email
              </Button>
            </>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
          {info && <p className="text-sm text-green-700">{info}</p>}

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
