"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Loader2, Send, Sparkles, X } from "lucide-react";
import { ModuleMarkdown } from "@/components/module-markdown";
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
  contextKey?: string;
};

export function LessonFloatingTools({
  lessonTitle,
  contextTitle,
  contextBody,
  contextKey = contextTitle,
}: LessonFloatingToolsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const contextKeyRef = useRef(contextKey);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [isOpen, messages, isSubmitting, error]);

  useEffect(() => {
    contextKeyRef.current = contextKey;
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setQuestion("");
    setMessages([]);
    setError("");
    setIsSubmitting(false);
  }, [contextKey]);

  async function askQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isSubmitting) return;

    setQuestion("");
    setError("");
    setIsSubmitting(true);
    setMessages((current) => [...current, { role: "user", content: trimmedQuestion }]);

    try {
      const requestContextKey = contextKey;
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortController.signal,
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
      if (contextKeyRef.current !== requestContextKey) return;

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "AI request failed.");
      }

      setMessages((current) => [
        ...current,
        { role: "assistant", content: String(data.data?.reply || "") },
      ]);
    } catch (askError) {
      if (askError instanceof DOMException && askError.name === "AbortError") return;
      setError(askError instanceof Error ? askError.message : "AI request failed.");
    } finally {
      if (contextKeyRef.current === contextKey) {
        abortControllerRef.current = null;
        setIsSubmitting(false);
      }
    }
  }

  return (
    <>
      <button
        type="button"
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-[1px] transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setIsOpen(false)}
        aria-label="Close Ask AI chat"
      />

      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-[min(30rem,100vw)] translate-x-full flex-col border-l border-[#dce6ff] bg-white shadow-[0_32px_90px_-40px_rgba(15,23,42,0.55)] transition-transform duration-300 ease-out",
          isOpen && "translate-x-0"
        )}
        aria-hidden={!isOpen}
      >
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

          <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
            {messages.length === 0 ? (
              <div className="rounded-2xl bg-[#f7faff] px-4 py-3 text-sm leading-6 text-slate-600">
                Tanyakan materi di halaman ini. Jawaban akan tetap fokus pada isi pelajaran.
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={cn(
                    "overflow-hidden rounded-2xl px-4 py-3 text-sm leading-6",
                    message.role === "user"
                      ? "ml-8 bg-[#2f6fff] text-white"
                      : "mr-8 bg-[#f7faff] text-slate-700"
                  )}
                >
                  {message.role === "assistant" ? (
                    <ModuleMarkdown
                      content={message.content}
                      emptyFallback="Belum ada jawaban."
                      className="prose-sm text-slate-700 prose-p:my-2 prose-p:leading-6 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-li:leading-6 prose-headings:mb-2 prose-headings:mt-3 prose-strong:text-slate-900"
                    />
                  ) : (
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  )}
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
            <div ref={messagesEndRef} />
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
        </aside>

      <div className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 sm:bottom-6">
        <Button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          aria-expanded={isOpen}
          className="h-14 rounded-full bg-[#2f6fff] px-5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-[#1d4ed8]"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          Ask AI
        </Button>
        <FocusTimer
          triggerClassName="static bottom-auto right-auto"
          minimizedClassName="bottom-24 left-1/2 right-auto -translate-x-1/2"
        />
      </div>
    </>
  );
}
