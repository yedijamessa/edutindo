"use client";

import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

const moduleMarkdownSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "u"],
  attributes: {
    ...defaultSchema.attributes,
    u: [],
  },
};

export function ModuleMarkdown({
  content,
  emptyFallback = "Content will appear here.",
  className,
}: {
  content: string;
  emptyFallback?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "prose prose-sm max-w-none text-slate-700 prose-p:leading-relaxed prose-headings:font-bold prose-headings:text-slate-900 prose-a:text-[#2f6fff] prose-a:no-underline hover:prose-a:underline prose-strong:font-bold prose-strong:text-slate-900 prose-ul:list-disc prose-ol:list-decimal prose-li:my-1 prose-img:float-right prose-img:ml-6 prose-img:w-[150px] sm:prose-img:w-[220px] prose-img:rounded-[12px] prose-img:object-cover prose-img:shadow-sm",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, moduleMarkdownSchema]]}
      >
        {content || emptyFallback}
      </ReactMarkdown>
    </div>
  );
}
