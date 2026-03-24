"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/ui/section";

type Status = "idle" | "submitting" | "success" | "error";
const CONTACT_AREAS = [
  "Help with teaching",
  "Contribute to campaign & events",
  "Partner financially",
  "Other",
];

export default function ContactPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const area = String(formData.get("area") || "").trim();
    const linkedin = String(formData.get("linkedin") || "").trim();
    const instagram = String(formData.get("instagram") || "").trim();
    const detailMessage = String(formData.get("message") || "").trim();

    const messageSections = [
      `Area of interest: ${area || "Not provided"}`,
      `LinkedIn: ${linkedin || "Not provided"}`,
      `Instagram: ${instagram || "Not provided"}`,
      "",
      "Details:",
      detailMessage,
    ];

    const payload = new FormData();
    payload.append("name", name);
    payload.append("email", email);
    payload.append("subject", "New get involved enquiry");
    payload.append("message", messageSections.join("\n"));

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: payload,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send message.");
      }

      setStatus("success");
      form.reset();
    } catch (err: unknown) {
      console.error(err);
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Section>
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight">Get Involved with Edutindo</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              There are different ways to support the vision. Whether you&apos;d like to help teaching, contribute to
              our campaign and events, or partner financially, we&apos;d love to hear from you. Let us know how you
              would like to contribute and we will reach you out.
            </p>
          </div>

          <Card className="border-none shadow-xl">
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <Input id="name" name="name" required placeholder="Your full name" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <Input id="email" name="email" type="email" required placeholder="you@example.com" />
                  </div>
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
                    {CONTACT_AREAS.map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
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
                  <label htmlFor="message" className="text-sm font-medium">
                    Tell us a bit more <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={4}
                    required
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
                    {error || "Something went wrong. Please try again."}
                  </div>
                )}

                <Button type="submit" disabled={status === "submitting"} className="w-full" size="lg">
                  {status === "submitting" ? "Sending..." : "Send my details"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground flex flex-wrap justify-center gap-4">
            <span>✉️ Email: hello@edutindo.org</span>
          </div>
        </div>
      </Section>
    </div>
  );
}
