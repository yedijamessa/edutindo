"use client";

import { FormEvent, useState } from "react";
import { Loader2, Send, Sparkles, X } from "lucide-react";
import { Button, cn } from "@/components/ui/button";
import { FocusTimer } from "@/components/lms/focus-timer";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type LessonFloatingToolsProps = {
  lessonTitle: string;
  contextTitle: string;
  contextBody: string;
};

export function LessonFloatingTools({
  lessonTitle,
  contextTitle,
  contextBody,
}: LessonFloatingToolsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function askQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isSubmitting) return;

    setQuestion("");
    setError("");
    setIsSubmitting(true);
    setMessages((current) => [...current, { role: "user", content: trimmedQuestion }]);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "page-chat",
          question: trimmedQuestion,
          context: {
            title: contextTitle,
            body: contextBody,
          },
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "AI request failed.");
      }

      setMessages((current) => [
        ...current,
        { role: "assistant", content: String(data.data?.reply || "") },
      ]);
    } catch (askError) {
      setError(askError instanceof Error ? askError.message : "AI request failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {isOpen ? (
        <section className="fixed bottom-24 right-6 z-50 w-[min(28rem,calc(100vw-2rem))] rounded-[24px] border border-[#dce6ff] bg-white shadow-[0_28px_70px_-38px_rgba(15,23,42,0.45)]">
          <div className="flex items-start justify-between gap-3 border-b border-[#edf2fb] px-5 py-4">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold text-slate-950">
                <Sparkles className="h-4 w-4 text-[#2f6fff]" />
                Ask AI
              </p>
              <p className="mt-1 line-clamp-1 text-xs font-medium text-slate-400">{lessonTitle}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setIsOpen(false)}
              aria-label="Close Ask AI"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="max-h-80 space-y-3 overflow-y-auto px-5 py-4">
            {messages.length === 0 ? (
              <div className="rounded-2xl bg-[#f7faff] px-4 py-3 text-sm leading-6 text-slate-600">
                Ask about this lesson page. I will stay within the current lesson content.
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm leading-6",
                    message.role === "user"
                      ? "ml-8 bg-[#2f6fff] text-white"
                      : "mr-8 bg-[#f7faff] text-slate-700"
                  )}
                >
                  {message.content}
                </div>
              ))
            )}
            {isSubmitting ? (
              <div className="mr-8 flex items-center gap-2 rounded-2xl bg-[#f7faff] px-4 py-3 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking...
              </div>
            ) : null}
            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            ) : null}
          </div>

          <form className="border-t border-[#edf2fb] p-4" onSubmit={askQuestion}>
            <div className="flex gap-2">
              <input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask about this lesson..."
                className="min-w-0 flex-1 rounded-full border border-[#dce6ff] bg-[#fbfdff] px-4 py-2 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-[#2f6fff] focus:ring-2 focus:ring-[#c9d9ff]"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!question.trim() || isSubmitting}
                className="h-10 w-10 rounded-full"
                aria-label="Send question"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </form>
        </section>
      ) : null}

      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        <Button
          type="button"
          onClick={() => setIsOpen(true)}
          className="h-14 rounded-full bg-[#2f6fff] px-5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-[#1d4ed8]"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          Ask AI
        </Button>
        <FocusTimer triggerClassName="static bottom-auto right-auto" />
      </div>
    </>
  );
}
