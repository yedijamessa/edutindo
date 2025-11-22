import { SidebarNav } from "@/components/lms/sidebar-nav";
import { CalendarWidget } from "@/components/lms/calendar-widget";
import { MaterialCard } from "@/components/lms/material-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockMaterials, mockProgress, mockCalendarEvents, getStudentProgress, getStudentEvents } from "@/lib/mock-data";
import { BookOpen, Award, Clock, TrendingUp } from "lucide-react";

export default function StudentDashboard() {
    const studentId = 'student-1'; // In production, get from auth
    const studentName = 'Sarah Johnson';

    const studentProgress = getStudentProgress(studentId);
    const studentEvents = getStudentEvents(studentId);
    const enrolledMaterials = mockMaterials.slice(0, 3);

    const completedCount = studentProgress.filter(p => p.completed).length;
    const totalMaterials = enrolledMaterials.length;
    const overallProgress = studentProgress.length > 0
        ? Math.round(studentProgress.reduce((sum, p) => sum + p.progress, 0) / studentProgress.length)
        : 0;
    const pendingQuizzes = 2; // Mock data

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="flex">
                {/* Sidebar */}
                <aside className="hidden lg:block w-64 border-r bg-card p-6 min-h-screen sticky top-0">
                    <div className="mb-8">
                        <h2 className="text-lg font-bold">Student Portal</h2>
                        <p className="text-sm text-muted-foreground">{studentName}</p>
                    </div>
                    <SidebarNav role="student" />
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* Header */}
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Welcome back, {studentName}! 👋</h1>
                            <p className="text-muted-foreground mt-2">Here's what's happening with your learning today.</p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Courses Enrolled</CardTitle>
                                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{totalMaterials}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {completedCount} completed
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Quizzes Pending</CardTitle>
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{pendingQuizzes}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Due this week
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{overallProgress}%</div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden mt-2">
                                        <div
                                            className="h-full bg-primary transition-all"
                                            style={{ width: `${overallProgress}%` }}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Achievements</CardTitle>
                                    <Award className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">3</div>
                                    <p className="text-xs text-muted-foreground">
                                        Badges earned
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Two Column Layout */}
                        <div className="grid gap-6 lg:grid-cols-3">
                            {/* Recent Materials */}
                            <div className="lg:col-span-2 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold">Continue Learning</h2>
                                    <Badge variant="outline">In Progress</Badge>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {enrolledMaterials.map(material => {
                                        const progress = studentProgress.find(p => p.materialId === material.id);
                                        return (
                                            <MaterialCard
                                                key={material.id}
                                                material={material}
                                                progress={progress?.progress}
                                                role="student"
                                            />
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Calendar Widget */}
                            <div>
                                <CalendarWidget events={studentEvents} />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
