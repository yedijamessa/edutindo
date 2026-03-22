"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface DemoAccessFormProps {
  nextPath?: string;
}

type DemoAccessResponse = {
  ok: boolean;
  code?: string;
  error?: string;
  message?: string;
  redirectTo?: string;
};

export function DemoAccessForm({ nextPath }: DemoAccessFormProps) {
  const router = useRouter();

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    setError(null);
    setInfo(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/demo/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, nextPath }),
      });

      const data: DemoAccessResponse = await response.json();

      if (!response.ok || !data.ok) {
        setError(data.error || "Invalid demo code.");
        return;
      }

      setInfo(data.message || "Access granted.");
      router.push(data.redirectTo || "/student");
      router.refresh();
    } catch (submitError) {
      console.error(submitError);
      setError("Unable to verify demo code right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-200 shadow-xl">
        <CardHeader className="space-y-3">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <KeyRound className="w-5 h-5" />
          </div>
          <CardTitle className="text-2xl">Demo Portal Access</CardTitle>
          <CardDescription>
            Enter the demo code to access this portal without logging in.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Demo code</label>
            <Input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Enter access code"
              autoComplete="off"
            />
          </div>

          <p className="text-xs text-muted-foreground">
            Use the demo code shared by the Edutindo team.
          </p>

          <Button className="w-full" onClick={submit} disabled={isSubmitting || !code.trim()}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                Continue to Portal
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {info && <p className="text-sm text-green-700">{info}</p>}

          <div className="pt-2 text-sm text-muted-foreground">
            Want full access?{" "}
            <Link className="text-primary font-medium hover:underline" href="/login">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
