"use client";

import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

const moduleFontSizeClasses = {
  "module-font-size-xs": "text-xs leading-relaxed",
  "module-font-size-sm": "text-sm leading-relaxed",
  "module-font-size-base": "text-base leading-relaxed",
  "module-font-size-lg": "text-lg leading-relaxed",
  "module-font-size-xl": "text-xl leading-relaxed",
};

const moduleMarkdownSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    "span",
    "u",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
  ],
  attributes: {
    ...defaultSchema.attributes,
    span: [
      [
        "className",
        "module-font-size-xs",
        "module-font-size-sm",
        "module-font-size-base",
        "module-font-size-lg",
        "module-font-size-xl",
      ],
    ],
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
        components={{
          span: ({ className, children }) => {
            const sizeClassName = String(className ?? "")
              .split(/\s+/)
              .find((name): name is keyof typeof moduleFontSizeClasses => name in moduleFontSizeClasses);

            return <span className={sizeClassName ? moduleFontSizeClasses[sizeClassName] : undefined}>{children}</span>;
          },
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto rounded-[14px] border border-[#dfe7f5] bg-white">
              <table className="my-0 min-w-full border-collapse text-left text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-[#f7faff] text-slate-900">{children}</thead>,
          th: ({ children }) => (
            <th className="border-b border-r border-[#dfe7f5] px-3 py-2 font-semibold last:border-r-0">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-r border-[#e8eef8] px-3 py-2 align-top last:border-r-0">
              {children}
            </td>
          ),
          tr: ({ children }) => <tr className="last:[&_td]:border-b-0">{children}</tr>,
        }}
      >
        {content || emptyFallback}
      </ReactMarkdown>
    </div>
  );
}
