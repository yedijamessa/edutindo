"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/components/ui/button";

type LoadingLessonLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
  loadingLabel?: string;
};

export function LoadingLessonLink({
  href,
  className,
  children,
  loadingLabel = "Opening...",
}: LoadingLessonLinkProps) {
  const [isLoading, setIsLoading] = useState(false);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }

    setIsLoading(true);
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      aria-busy={isLoading}
      className={cn(isLoading && "pointer-events-none opacity-85", className)}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingLabel}
        </>
      ) : (
        children
      )}
    </Link>
  );
}
