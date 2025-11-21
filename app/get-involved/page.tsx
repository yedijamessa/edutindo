"use client";

import { useState, FormEvent } from "react";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Section } from "@/components/ui/section";

const AREAS = [
  "Volunteer as a mentor / teacher",
  "Help with events & media",
  "Pray regularly for the ministry",
  "Partner as a monthly supporter",
  "Other",
];

export default function GetInvolvedPage() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);

    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone") || "",
      area: formData.get("area") || "",
      linkedin: formData.get("linkedin") || "",
      instagram: formData.get("instagram") || "",
      message: formData.get("message") || "",
    };

    try {
      const res = await fetch("/api/get-involved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit form");
      }

      setStatus("success");
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMessage(err.message || "Something went wrong. Please try again.");
    } finally {
      setTimeout(() => {
        if (status !== "success") setStatus("idle");
      }, 3000);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Section>
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight">Get Involved with Edutindo</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              There are many ways to serve. Whether you&apos;d like to mentor, help with events, pray, or partner financially, we&apos;d love to hear from you.
            </p>
          </div>

          <Card className="border-none shadow-xl">
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
                    <Input id="name" name="name" required placeholder="Your full name" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email <span className="text-red-500">*</span></label>
                    <Input id="email" name="email" type="email" required placeholder="you@example.com" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">Phone / WhatsApp</label>
                    <Input id="phone" name="phone" placeholder="+44 ..." />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="area" className="text-sm font-medium">I&apos;m interested in</label>
                    <select
                      id="area"
                      name="area"
                      defaultValue=""
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="" disabled>Choose an option</option>
                      {AREAS.map((area) => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="linkedin" className="text-sm font-medium">LinkedIn (optional)</label>
                    <Input id="linkedin" name="linkedin" placeholder="https://linkedin.com/in/..." />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="instagram" className="text-sm font-medium">Instagram (optional)</label>
                    <Input id="instagram" name="instagram" placeholder="@username" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">Tell us a bit more</label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={4}
                    placeholder="Share how you’d like to get involved, your skills, availability, or any questions."
                  />
                </div>

                {status === "success" && (
                  <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    Thank you! We&apos;ve received your details and will get in touch.
                  </div>
                )}

                {status === "error" && (
                  <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errorMessage || "Something went wrong. Please try again later."}
                  </div>
                )}

                <Button type="submit" disabled={status === "submitting"} className="w-full" size="lg">
                  {status === "submitting" ? "Sending..." : "Send my details"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground flex flex-wrap justify-center gap-4">
            <span>📞 Phone / WhatsApp: +44 (example)</span>
            <span>✉️ Email: hello@edutindo.org</span>
          </div>
        </div>
      </Section>
    </div>
  );
}
