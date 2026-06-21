"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
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
    School
} from "lucide-react";

interface NavItem {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
}

interface SidebarNavProps {
    role: 'student' | 'teacher' | 'parent' | 'principal';
}

const studentNav: NavItem[] = [
    { title: 'Dashboard', href: '/student', icon: LayoutDashboard },
    { title: 'Materials', href: '/student/materials', icon: BookOpen },
    { title: 'Learning Path', href: '/student/learning-path', icon: GitBranch },
    { title: 'Quizzes', href: '/student/quizzes', icon: HelpCircle },
    { title: 'Notes', href: '/student/notes', icon: StickyNote },
    { title: 'Progress', href: '/student/progress', icon: BarChart3 },
    { title: 'Announcements', href: '/student/announcements', icon: Sparkles },
    { title: 'Digital Locker', href: '/student/locker', icon: HardDrive },
    { title: 'Tutoring', href: '/student/tutoring', icon: Users },
    { title: 'Whiteboard', href: '/student/whiteboard', icon: Palette },
    { title: 'Annotations', href: '/student/annotations', icon: MessageCircle },
    { title: 'Oral Exam', href: '/student/oral-exam', icon: Video },
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

export function SidebarNav({ role }: SidebarNavProps) {
    const pathname = usePathname();

    const navItems =
        role === 'student'
            ? studentNav
            : role === 'teacher'
                ? teacherNav
                : role === 'principal'
                    ? principalNav
                    : parentNav;

    return (
        <>
            <nav className={role === "student" ? "space-y-1.5" : "space-y-1"}>
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
                                role === "student"
                                    ? "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors"
                                    : "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                role === "student"
                                    ? isActive
                                        ? "bg-[#eef4ff] text-[#2f6fff]"
                                        : "text-slate-500 hover:bg-[#f7faff] hover:text-slate-800"
                                    : isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            <Icon className={role === "student" ? "h-4 w-4" : "h-5 w-5"} />
                            {item.title}
                        </Link>
                    );
                })}
            </nav>
            {role === 'student' && (
                <div className="mt-6 border-t border-[#edf2f8] pt-5">
                    <FocusTimer />
                </div>
            )}
        </>
    );
}
