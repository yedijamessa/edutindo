import Link from "next/link";
import { ChevronRight } from "lucide-react";

type AdminBreadcrumbItem = {
  label: string;
  href?: string;
};

export function AdminBreadcrumb({ items }: { items: AdminBreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 overflow-x-auto text-sm text-slate-400">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={`${item.label}-${index}`} className="flex shrink-0 items-center gap-1.5">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="whitespace-nowrap font-medium transition-colors hover:text-slate-900 dark:hover:text-slate-100"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={
                  isLast
                    ? "whitespace-nowrap font-semibold text-slate-900 dark:text-slate-100"
                    : "whitespace-nowrap font-medium text-slate-500 dark:text-slate-300"
                }
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
            {!isLast ? <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600" /> : null}
          </span>
        );
      })}
    </nav>
  );
}
