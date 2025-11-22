"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui/button";
import {
    LayoutDashboard,
    BookOpen,
    FileText,
    BarChart3,
    Calendar,
    Video,
    Users,
    StickyNote,
    HelpCircle,
    Trophy,
    GitBranch,
    Sparkles,
    DoorOpen
} from "lucide-react";

interface NavItem {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
}

interface SidebarNavProps {
    role: 'student' | 'teacher' | 'parent';
}

const studentNav: NavItem[] = [
    { title: 'Dashboard', href: '/student', icon: LayoutDashboard },
    { title: 'Materials', href: '/student/materials', icon: BookOpen },
    { title: 'Quizzes', href: '/student/quizzes', icon: HelpCircle },
    { title: 'Notes', href: '/student/notes', icon: StickyNote },
    { title: 'Progress', href: '/student/progress', icon: BarChart3 },
    { title: 'Gamification', href: '/student/gamification', icon: Trophy },
    { title: 'Mind Map', href: '/student/mindmap', icon: GitBranch },
    { title: 'AI Assistant', href: '/student/ai-assistant', icon: Sparkles },
    { title: 'Calendar', href: '/student/calendar', icon: Calendar },
    { title: 'Meeting Room', href: '/student/meeting', icon: Video },
    { title: 'Book Room', href: '/student/booking', icon: DoorOpen },
];

const teacherNav: NavItem[] = [
    { title: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
    { title: 'Materials', href: '/teacher/materials', icon: BookOpen },
    { title: 'Students', href: '/teacher/students', icon: Users },
    { title: 'Notes', href: '/teacher/notes', icon: StickyNote },
    { title: 'Calendar', href: '/teacher/calendar', icon: Calendar },
    { title: 'Meeting Room', href: '/teacher/meeting', icon: Video },
    { title: 'Book Room', href: '/teacher/booking', icon: DoorOpen },
];

const parentNav: NavItem[] = [
    { title: 'Dashboard', href: '/parent', icon: LayoutDashboard },
    { title: 'Progress', href: '/parent/progress', icon: BarChart3 },
];

export function SidebarNav({ role }: SidebarNavProps) {
    const pathname = usePathname();

    const navItems = role === 'student' ? studentNav : role === 'teacher' ? teacherNav : parentNav;

    return (
        <nav className="space-y-1">
            {navItems.map((item) => {
                const Icon = item.icon;
                // For dashboard routes (ending with /student, /teacher, /parent), use exact match
                // For sub-routes, check if pathname starts with the href
                const isDashboard = item.href === `/${role}`;
                const isActive = isDashboard
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(item.href + '/');

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                            isActive
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                    >
                        <Icon className="w-5 h-5" />
                        {item.title}
                    </Link>
                );
            })}
        </nav>
    );
}
