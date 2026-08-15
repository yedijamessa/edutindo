"use client";

import Link from "next/link";
import { useEffect, useState, type DragEvent, type MouseEvent } from "react";
import {
  BookOpen,
  ChevronDown,
  ClipboardList,
  FileClock,
  FolderPlus,
  GripVertical,
  Layers3,
  LayoutGrid,
  NotebookTabs,
  School,
  ShieldCheck,
  type LucideIcon,
  Users,
} from "lucide-react";

interface AdminDashboardProps {
  adminEmail: string;
  canManageAccessControls: boolean;
}

const adminTools = [
  {
    title: "Curriculum Portal",
    href: "/admin/curriculum",
    description: "Organize school, year, subject, chapter, and module structure.",
    icon: LayoutGrid,
  },
  {
    title: "Learning Materials",
    href: "/admin/materials",
    description: "Manage the master subject, chapter, and module catalog.",
    icon: BookOpen,
  },
  {
    title: "Module Editor",
    href: "/admin/module-editor",
    description: "Choose a subject, chapter, and module to build or update content.",
    icon: NotebookTabs,
  },
  {
    title: "Module Library",
    href: "/admin/modules",
    description: "Assign reusable modules to lessons and send selected modules to students.",
    icon: Layers3,
  },
  {
    title: "Admin Access Control",
    href: "/admin/access",
    description: "Manage which users can open each portal.",
    icon: ShieldCheck,
  },
];

const creationTools = [
  {
    title: "Create Curriculum",
    href: "/admin/content-sandbox/curriculum",
    description: "Build curriculum, choose chapters and modules, create new items, and assign them to schools.",
    icon: FolderPlus,
  },
  {
    title: "Create Chapter",
    href: "/admin/content-sandbox/chapter",
    description: "Create a chapter, attach existing modules, or create new modules for a curriculum.",
    icon: Layers3,
  },
  {
    title: "Create Module",
    href: "/admin/content-sandbox/module",
    description: "Create module content first, then assign it into any chapter from the module library.",
    icon: NotebookTabs,
  },
  {
    title: "Check Logs",
    href: "/admin/logs",
    description: "Review recent curriculum, chapter, module, assignment, and edit activity.",
    icon: FileClock,
  },
];

const crossPortalLinks = [
  {
    title: "Curriculum Assign Portal",
    href: "/curriculum-assign-portal",
    description: "Assign curriculum access across schools, years, and subjects.",
    icon: ClipboardList,
  },
  {
    title: "Student Portal",
    href: "/student",
    description: "Preview the learner workspace and material experience.",
    icon: BookOpen,
  },
  {
    title: "Teacher Portal",
    href: "/teacher",
    description: "Open teacher tools for materials, students, notes, and meetings.",
    icon: Users,
  },
  {
    title: "Parent Portal",
    href: "/parent",
    description: "View the parent-facing portal experience.",
    icon: Users,
  },
  {
    title: "Principal Portal",
    href: "/principal",
    description: "Open school leadership views for materials and bookings.",
    icon: School,
  },
];

interface DashboardTool {
  title: string;
  href: string;
  description: string;
  icon: LucideIcon;
}

type DashboardGroupId = "content-sandbox" | "admin-portals" | "other-portals";

interface DashboardGroup {
  id: DashboardGroupId;
  title: string;
  description: string;
  icon: LucideIcon;
  tools: DashboardTool[];
}

type ToolOrderByGroup = Partial<Record<DashboardGroupId, string[]>>;

function orderTools(tools: DashboardTool[], order?: string[]) {
  if (!order?.length) return tools;

  const toolsByHref = new Map(tools.map((tool) => [tool.href, tool]));
  const orderedTools = order.flatMap((href) => {
    const tool = toolsByHref.get(href);
    if (!tool) return [];

    toolsByHref.delete(href);
    return [tool];
  });

  return [...orderedTools, ...toolsByHref.values()];
}

function getReorderedHrefs(
  tools: DashboardTool[],
  currentOrder: string[] | undefined,
  draggedHref: string,
  targetHref: string,
  placement: "before" | "after"
) {
  const orderedHrefs = orderTools(tools, currentOrder).map((tool) => tool.href);
  const draggedIndex = orderedHrefs.indexOf(draggedHref);
  const targetIndex = orderedHrefs.indexOf(targetHref);

  if (draggedIndex === -1 || targetIndex === -1 || draggedHref === targetHref) {
    return orderedHrefs;
  }

  orderedHrefs.splice(draggedIndex, 1);
  const nextTargetIndex = orderedHrefs.indexOf(targetHref);
  orderedHrefs.splice(placement === "after" ? nextTargetIndex + 1 : nextTargetIndex, 0, draggedHref);

  return orderedHrefs;
}

function AdminToolPanel({
  group,
  onReorder,
}: {
  group: DashboardGroup;
  onReorder: (groupId: DashboardGroupId, draggedHref: string, targetHref: string, placement: "before" | "after") => void;
}) {
  const GroupIcon = group.icon;
  const [loadingHref, setLoadingHref] = useState<string | null>(null);
  const [draggedHref, setDraggedHref] = useState<string | null>(null);
  const [dragTarget, setDragTarget] = useState<{ href: string; placement: "before" | "after" } | null>(null);

  function handleToolClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }

    setLoadingHref(href);
  }

  function getDropPlacement(event: DragEvent<HTMLElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    return event.clientY - bounds.top > bounds.height / 2 ? "after" : "before";
  }

  return (
    <details className="group rounded-[28px] border border-slate-200/80 bg-white/94 shadow-[0_28px_70px_-54px_rgba(15,23,42,0.58)] transition-shadow duration-200 open:shadow-[0_34px_76px_-48px_rgba(37,99,235,0.34)] dark:border-slate-800 dark:bg-slate-900/84 dark:shadow-none">
      <summary className="grid min-h-[12rem] cursor-pointer list-none grid-rows-[auto_1fr_auto] gap-4 p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950 [&::-webkit-details-marker]:hidden sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-[linear-gradient(180deg,#eef4ff_0%,#dfe8ff_100%)] text-[#2f6fff] dark:bg-[linear-gradient(180deg,rgba(37,99,235,0.32)_0%,rgba(37,99,235,0.16)_100%)] dark:text-blue-200">
            <GroupIcon className="h-6 w-6" strokeWidth={1.9} />
          </div>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d9e0ec] bg-white/85 text-slate-500 transition-transform duration-200 group-open:rotate-180 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300">
            <ChevronDown className="h-5 w-5" strokeWidth={2} />
          </span>
        </div>
        <div className="space-y-2">
          <h2 className="text-[1.5rem] font-semibold leading-tight tracking-tight text-slate-950 dark:text-slate-50">
            {group.title}
          </h2>
          <p className="text-[14px] leading-6 text-slate-500 dark:text-slate-300">
            {group.description}
          </p>
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-300">
          {group.tools.length} {group.tools.length === 1 ? "menu" : "menus"}
        </p>
      </summary>

      <div className="border-t border-slate-200/80 px-3 pb-3 dark:border-slate-800 sm:px-4 sm:pb-4">
        <div className="grid gap-2 pt-3">
          {group.tools.map((tool) => {
            const ToolIcon = tool.icon;
            const isLoading = loadingHref === tool.href;
            const isDragging = draggedHref === tool.href;
            const dropPlacement = dragTarget?.href === tool.href ? dragTarget.placement : null;

            return (
              <Link
                key={tool.href + tool.title}
                href={tool.href}
                aria-busy={isLoading}
                draggable
                onDragStart={(event) => {
                  setDraggedHref(tool.href);
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", tool.href);
                }}
                onDragEnd={() => {
                  setDraggedHref(null);
                  setDragTarget(null);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                  setDragTarget({ href: tool.href, placement: getDropPlacement(event) });
                }}
                onDragLeave={() => {
                  setDragTarget((current) => (current?.href === tool.href ? null : current));
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  const draggedToolHref = event.dataTransfer.getData("text/plain") || draggedHref;
                  const placement = getDropPlacement(event);

                  setDraggedHref(null);
                  setDragTarget(null);

                  if (!draggedToolHref) return;
                  onReorder(group.id, draggedToolHref, tool.href, placement);
                }}
                onClick={(event) => handleToolClick(event, tool.href)}
                className={`grid cursor-grab grid-cols-[2.75rem_1fr_auto] gap-3 rounded-[18px] px-3 py-3 text-left transition-colors active:cursor-grabbing hover:bg-[#f7faff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-slate-800/72 ${
                  isLoading ? "bg-[#f7faff] dark:bg-slate-800/72" : ""
                } ${isDragging ? "opacity-45" : ""} ${
                  dropPlacement === "before"
                    ? "shadow-[inset_0_3px_0_#2563eb]"
                    : dropPlacement === "after"
                      ? "shadow-[inset_0_-3px_0_#2563eb]"
                      : ""
                }`}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[#eef4ff] text-[#2f6fff] dark:bg-blue-950/42 dark:text-blue-200">
                  <ToolIcon className="h-5 w-5" strokeWidth={1.9} />
                </span>
                <span className="min-w-0 space-y-1">
                  <span className="block text-[15px] font-semibold leading-tight text-slate-950 dark:text-slate-50">
                    {tool.title}
                  </span>
                  <span className="block text-[13px] leading-5 text-slate-500 dark:text-slate-300">
                    {tool.description}
                  </span>
                  {isLoading && (
                    <span className="block pt-2" role="status" aria-live="polite">
                      <span className="mb-1 flex items-center text-[12px] font-semibold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-300">
                        Loading
                        <span className="admin-loading-dots ml-1" aria-hidden="true">
                          <span>.</span>
                          <span>.</span>
                          <span>.</span>
                        </span>
                      </span>
                      <span className="relative block h-1.5 overflow-hidden rounded-full bg-blue-100 dark:bg-blue-950/70">
                        <span className="admin-loading-bar absolute inset-y-0 left-0 w-1/2 rounded-full bg-[linear-gradient(90deg,#93c5fd_0%,#2563eb_52%,#1d4ed8_100%)]" />
                      </span>
                    </span>
                  )}
                </span>
                <span
                  className="flex h-9 w-5 items-center justify-center self-center text-slate-300 dark:text-slate-600"
                  title="Drag to reorder"
                  aria-hidden="true"
                >
                  <GripVertical className="h-4 w-4" strokeWidth={2} />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </details>
  );
}

function AdminHeroArtwork() {
  return (
    <div className="relative hidden h-[124px] lg:block" aria-hidden="true">
      <div className="absolute inset-y-1 right-0 w-[150px] rounded-[24px] border border-[#dbe5ff] bg-[linear-gradient(180deg,rgba(225,234,255,0.94),rgba(250,252,255,0.98))] shadow-[0_28px_56px_-36px_rgba(37,99,235,0.75)]">
        <div className="flex items-center gap-1.5 border-b border-[#e3ebff] px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#c9d8ff]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#d4e0ff]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#dfe7ff]" />
        </div>
        <div className="space-y-2.5 px-4 py-4">
          <div className="h-3 rounded-full bg-[#d4dfff]" />
          <div className="grid grid-cols-[1.2fr_1fr] gap-2">
            <div className="h-8 rounded-2xl bg-[#e6edff]" />
            <div className="h-8 rounded-2xl bg-[#edf2ff]" />
          </div>
          <div className="h-3 rounded-full bg-[#e4ebff]" />
          <div className="h-3 w-4/5 rounded-full bg-[#eef3ff]" />
        </div>
      </div>
      <div className="absolute bottom-3 right-[116px] flex h-[84px] w-[84px] items-center justify-center rounded-[28px] border border-[#dbe5ff] bg-[linear-gradient(180deg,rgba(238,243,255,0.98),rgba(248,250,255,0.98))] text-[#4b7bff] shadow-[0_28px_56px_-36px_rgba(37,99,235,0.75)]">
        <ShieldCheck className="h-10 w-10" strokeWidth={1.8} />
      </div>
      <div className="absolute bottom-5 left-2 h-8 w-16 rounded-full border-4 border-transparent border-l-[#75a3ff] border-t-[#75a3ff] opacity-70" />
      <div className="absolute bottom-2 left-5 h-3.5 w-[5.5rem] rounded-full bg-[#dbe7ff]" />
      <div className="absolute bottom-0 right-1 h-14 w-12 rounded-[999px_999px_0_999px] bg-[linear-gradient(180deg,rgba(227,235,255,0.88),rgba(255,255,255,0))]" />
      <div className="absolute bottom-3 right-6 h-10 w-16 rounded-full bg-[#dbe7ff]/80 blur-xl" />
    </div>
  );
}

export default function AdminDashboard({ adminEmail, canManageAccessControls }: AdminDashboardProps) {
  const storageKey = `edutindo:admin-dashboard-tool-order:${adminEmail.toLowerCase()}`;
  const [toolOrderByGroup, setToolOrderByGroup] = useState<ToolOrderByGroup>({});

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(storageKey);
      if (!storedValue) {
        setToolOrderByGroup({});
        return;
      }

      const parsedValue = JSON.parse(storedValue) as ToolOrderByGroup;
      setToolOrderByGroup(parsedValue && typeof parsedValue === "object" ? parsedValue : {});
    } catch {
      setToolOrderByGroup({});
    }
  }, [storageKey]);

  const visibleAdminTools = adminTools.filter(
    (tool) => tool.href !== "/admin/access" || canManageAccessControls
  );
  const dashboardGroups = [
    {
      id: "content-sandbox",
      title: "Content Sandbox",
      description: "Create and audit curriculum content from one place.",
      icon: FolderPlus,
      tools: orderTools(creationTools, toolOrderByGroup["content-sandbox"]),
    },
    {
      id: "admin-portals",
      title: "Admin Portals",
      description: "Access and manage key areas of the Edutindo platform.",
      icon: LayoutGrid,
      tools: orderTools(visibleAdminTools, toolOrderByGroup["admin-portals"]),
    },
    {
      id: "other-portals",
      title: "Other Portals",
      description: "Jump into the user-facing portals from the admin dashboard.",
      icon: Users,
      tools: orderTools(crossPortalLinks, toolOrderByGroup["other-portals"]),
    },
  ] satisfies DashboardGroup[];

  const toolsByGroup = {
    "content-sandbox": creationTools,
    "admin-portals": visibleAdminTools,
    "other-portals": crossPortalLinks,
  } satisfies Record<DashboardGroupId, DashboardTool[]>;

  function reorderTools(
    groupId: DashboardGroupId,
    draggedHref: string,
    targetHref: string,
    placement: "before" | "after"
  ) {
    setToolOrderByGroup((current) => {
      const nextOrder = getReorderedHrefs(
        toolsByGroup[groupId],
        current[groupId],
        draggedHref,
        targetHref,
        placement
      );
      const nextValue = { ...current, [groupId]: nextOrder };

      try {
        window.localStorage.setItem(storageKey, JSON.stringify(nextValue));
      } catch {
        // Keep the reordered state for this session even if browser storage is unavailable.
      }

      return nextValue;
    });
  }

  return (
    <div className="space-y-6 lg:space-y-7">
      <section className="relative overflow-hidden rounded-[30px] border border-white/70 bg-white/88 p-5 shadow-[0_40px_90px_-64px_rgba(37,99,235,0.68)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/78 sm:p-7">
        <div className="absolute inset-y-0 right-0 hidden w-80 bg-[radial-gradient(circle_at_center,rgba(147,197,253,0.24),transparent_68%)] lg:block dark:bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),transparent_68%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
          <div className="flex items-start gap-4 sm:gap-6">
            <div className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-[24px] bg-[linear-gradient(180deg,#eef4ff_0%,#dfe8ff_100%)] text-[#2f6fff] shadow-[0_24px_48px_-34px_rgba(37,99,235,0.75)] dark:bg-[linear-gradient(180deg,rgba(37,99,235,0.32)_0%,rgba(37,99,235,0.16)_100%)] dark:text-blue-200">
              <LayoutGrid className="h-8 w-8" strokeWidth={1.8} />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-[2.35rem]">
                Admin Dashboard
              </h1>
              <p className="max-w-2xl text-[15px] leading-7 text-slate-500 dark:text-slate-300">
                Signed in as{" "}
                <span className="font-semibold text-slate-900 dark:text-white">{adminEmail}</span>
                . Choose which admin portal you want to open.
              </p>
            </div>
          </div>
          <AdminHeroArtwork />
        </div>
      </section>

      <section className="grid items-start gap-4 lg:grid-cols-3">
        {dashboardGroups.map((group) => (
          <AdminToolPanel key={group.title} group={group} onReorder={reorderTools} />
        ))}
      </section>
    </div>
  );
}
