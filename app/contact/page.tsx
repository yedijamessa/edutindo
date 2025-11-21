"use client";

import { useState, type FormEvent } from "react";
import { Mail, Send, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/section";

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send message.");
      }

      setStatus("success");
      form.reset();
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setError(err.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Section>
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="md:col-span-1 space-y-6">
              <div>
                <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">Contact Edutindo</Badge>
                <h1 className="text-3xl font-bold tracking-tight mb-4">We&apos;d love to hear from you</h1>
                <p className="text-muted-foreground leading-relaxed">
                  Have questions, testimonies, or want to partner with us? Send us a message and we&apos;ll get back to you.
                </p>
              </div>

              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Mail className="w-5 h-5" />
                    </div>
                    <span className="font-semibold">Email Us</span>
                  </div>
                  <a href="mailto:hello@edutindo.org" className="text-blue-600 hover:underline block pl-13">
                    hello@edutindo.org
                  </a>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <Card className="md:col-span-2 border-none shadow-xl">
              <CardContent className="p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <Input id="name" name="name" required placeholder="Your name" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <Input id="email" name="email" type="email" required placeholder="you@example.com" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Subject
                    </label>
                    <Input id="subject" name="subject" placeholder="Testimony, partnership, question, etc." />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <Textarea id="message" name="message" required rows={5} placeholder="How can we help you?" />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="attachment" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Attachment (optional)
                    </label>
                    <Input id="attachment" name="attachment" type="file" className="cursor-pointer file:cursor-pointer" />
                    <p className="text-xs text-muted-foreground">
                      PDFs, images, or Word documents.
                    </p>
                  </div>

                  {status === "success" && (
                    <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      Thank you! Your message has been sent.
                    </div>
                  )}

                  {status === "error" && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-2 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {error || "Something went wrong. Please try again."}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button type="submit" disabled={status === "submitting"} size="lg" className="w-full sm:w-auto">
                      {status === "submitting" ? (
                        "Sending..."
                      ) : (
                        <>Send Message <Send className="ml-2 w-4 h-4" /></>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>
    </div>
  );
}
