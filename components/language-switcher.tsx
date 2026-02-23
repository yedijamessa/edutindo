"use client";

import { Languages } from "lucide-react";
import { cn } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={cn("inline-flex items-center gap-1 rounded-full border border-border bg-background p-1", className)}>
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Languages className="h-4 w-4" />
      </span>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={cn(
          "h-7 rounded-full px-3 text-xs font-semibold transition-colors",
          language === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="Switch language to English"
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage("id")}
        className={cn(
          "h-7 rounded-full px-3 text-xs font-semibold transition-colors",
          language === "id" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="Switch language to Indonesian"
      >
        ID
      </button>
    </div>
  );
}
