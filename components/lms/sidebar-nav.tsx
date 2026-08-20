"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";
import { cn } from "@/components/ui/button";
import {
    LayoutDashboard,
    BookOpen,
    BarChart3,
    Calendar,
    Video,
    Users,
    StickyNote,
    HelpCircle,
    Trophy,
    GitBranch,
    Sparkles,
    DoorOpen,
    HardDrive,
    MessageCircle,
    Palette,
    School,
    Lock,
    Loader2,
    Minimize2,
    Maximize2,
} from "lucide-react";

interface NavItem {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    inProgress?: boolean;
}

interface SidebarNavProps {
    role: 'student' | 'teacher' | 'parent' | 'principal';
    canOpenLockedItems?: boolean;
}

const studentNav: NavItem[] = [
    { title: 'Dashboard', href: '/student', icon: LayoutDashboard },
    { title: 'Materials', href: '/student/materials', icon: BookOpen },
    { title: 'Learning Path', href: '/student/learning-path', icon: GitBranch },
    { title: 'Quizzes', href: '/student/quizzes', icon: HelpCircle, inProgress: true },
    { title: 'Notes', href: '/student/notes', icon: StickyNote, inProgress: true },
    { title: 'Progress', href: '/student/progress', icon: BarChart3, inProgress: true },
    { title: 'Announcements', href: '/student/announcements', icon: Sparkles, inProgress: true },
    { title: 'Digital Locker', href: '/student/locker', icon: HardDrive, inProgress: true },
    { title: 'Tutoring', href: '/student/tutoring', icon: Users, inProgress: true },
    { title: 'Whiteboard', href: '/student/whiteboard', icon: Palette, inProgress: true },
    { title: 'Annotations', href: '/student/annotations', icon: MessageCircle, inProgress: true },
    { title: 'Oral Exam', href: '/student/oral-exam', icon: Video, inProgress: true },
    { title: 'Gamification', href: '/student/gamification', icon: Trophy, inProgress: true },
    { title: 'Mind Map', href: '/student/mindmap', icon: GitBranch, inProgress: true },
    { title: 'AI Assistant', href: '/student/ai-assistant', icon: Sparkles, inProgress: true },
    { title: 'Calendar', href: '/student/calendar', icon: Calendar, inProgress: true },
    { title: 'Meeting Room', href: '/student/meeting', icon: Video, inProgress: true },
    { title: 'Book Room', href: '/student/booking', icon: DoorOpen, inProgress: true },
];

const greenStudentHrefs = new Set([
    "/student",
    "/student/materials",
    "/student/learning-path",
]);

const teacherNav: NavItem[] = [
    { title: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
    { title: 'Materials', href: '/teacher/materials', icon: BookOpen },
    { title: 'Students', href: '/teacher/students', icon: Users },
    { title: 'Notes', href: '/teacher/notes', icon: StickyNote },
    { title: 'Messages', href: '/teacher/chat', icon: MessageCircle },
    { title: 'Calendar', href: '/teacher/calendar', icon: Calendar },
    { title: 'Meeting Room', href: '/teacher/meeting', icon: Video },
    { title: 'Book Room', href: '/teacher/booking', icon: DoorOpen },
];

const parentNav: NavItem[] = [
    { title: 'Dashboard', href: '/parent', icon: LayoutDashboard },
    { title: 'Progress', href: '/parent/progress', icon: BarChart3 },
    { title: 'Messages', href: '/parent/chat', icon: MessageCircle },
];

const principalNav: NavItem[] = [
    { title: 'Dashboard', href: '/principal', icon: School },
    { title: 'Materials', href: '/principal/materials', icon: BookOpen },
    { title: 'Reports', href: '/principal/reports', icon: BarChart3 },
    { title: 'Book Room', href: '/principal/booking', icon: DoorOpen },
];

import { FocusTimer } from "@/components/lms/focus-timer";

// ... (existing imports)

export function SidebarNav({ role, canOpenLockedItems = false }: SidebarNavProps) {
    const pathname = usePathname();
    const [showLockedItems, setShowLockedItems] = useState(false);
    const [pendingHref, setPendingHref] = useState<string | null>(null);

    useEffect(() => {
        setPendingHref(null);
    }, [pathname]);

    const navItems =
        role === 'student'
            ? studentNav
            : role === 'teacher'
                ? teacherNav
                : role === 'principal'
                    ? principalNav
                    : parentNav;
    const visibleNavItems =
        role === "student" && !showLockedItems
            ? navItems.filter((item) => !item.inProgress)
            : navItems;

    const handleLockedClick = () => {
        window.alert("Still locked for user, please contact admin to unlock.");
    };

    const handleNavClick = (event: MouseEvent<HTMLAnchorElement>, href: string, isActive: boolean) => {
        if (
            isActive ||
            event.defaultPrevented ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            event.button !== 0
        ) {
            return;
        }

        setPendingHref(href);
    };

    return (
        <>
            <nav className={role === "student" ? "space-y-1.5" : "space-y-1"}>
                {visibleNavItems.map((item) => {
                    const Icon = item.icon;
                    // For dashboard routes (ending with /student, /teacher, /parent), use exact match
                    // For sub-routes, check if pathname starts with the href
                    const isDashboard = item.href === `/${role}`;
                    const isActive = isDashboard
                        ? pathname === item.href
                        : pathname === item.href || pathname.startsWith(item.href + '/');

                    const lockedForUser = role === "student" && item.inProgress && !canOpenLockedItems;
                    const isGreenStudentItem = role === "student" && greenStudentHrefs.has(item.href);
                    const isPending = pendingHref === item.href;
                    const className = cn(
                        role === "student"
                            ? "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold transition-colors"
                            : "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        role === "student"
                            ? item.inProgress
                                ? canOpenLockedItems
                                    ? isActive
                                        ? "border border-amber-200 bg-amber-100 text-amber-900"
                                        : "border border-amber-100 bg-amber-50 text-amber-900/80 hover:border-amber-200 hover:bg-amber-100 hover:text-amber-950"
                                    : isActive
                                        ? "border border-amber-200 bg-amber-100 text-amber-900"
                                        : "border border-amber-100 bg-amber-50 text-amber-900/80 hover:border-amber-200 hover:bg-amber-100 hover:text-amber-950"
                                : isActive && isGreenStudentItem
                                    ? "bg-emerald-50 text-emerald-700"
                                    : isGreenStudentItem
                                        ? "text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
                                        : isActive
                                            ? "bg-amber-100 text-amber-900"
                                            : "text-slate-500 hover:bg-amber-50 hover:text-amber-900"
                            : isActive
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    );

                    const content = (
                        <>
                            {isPending ? (
                                <Loader2 className={cn(role === "student" ? "h-4 w-4" : "h-5 w-5", "animate-spin")} />
                            ) : (
                                <Icon className={role === "student" ? "h-4 w-4" : "h-5 w-5"} />
                            )}
                            {item.title}
                            {lockedForUser ? <Lock className="ml-auto h-3.5 w-3.5" /> : null}
                        </>
                    );

                    return lockedForUser ? (
                        <button
                            key={item.href}
                            type="button"
                            className={className}
                            title={`${item.title} is locked`}
                            onClick={handleLockedClick}
                        >
                            {content}
                        </button>
                    ) : (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={className}
                            title={item.inProgress ? `${item.title} is in progress` : item.title}
                            onClick={(event) => handleNavClick(event, item.href, isActive)}
                        >
                            {content}
                        </Link>
                    );
                })}
            </nav>
            {role === "student" ? (
                <button
                    type="button"
                    onClick={() => setShowLockedItems((current) => !current)}
                    className={cn(
                        "mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-sm font-semibold transition-colors",
                        showLockedItems
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "border-[#edf2f8] bg-white text-slate-500 hover:bg-[#f8fbff] hover:text-slate-700"
                    )}
                >
                    {showLockedItems ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    {showLockedItems ? "Hide Other Features" : "Other Features"}
                </button>
            ) : null}
            {role === 'student' && (
                <div className="mt-6 border-t border-[#edf2f8] pt-5">
                    <FocusTimer />
                </div>
            )}
        </>
    );
}
