import { SidebarNav } from "@/components/lms/sidebar-nav";
import { CalendarWidget } from "@/components/lms/calendar-widget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockMaterials, mockStudents, mockCalendarEvents } from "@/lib/mock-data";
import { BookOpen, Users, Calendar, Plus, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function TeacherDashboard() {
    const teacherId = 'teacher-1';
    const teacherName = 'Dr. Emily Watson';

    const teacherEvents = mockCalendarEvents.filter(e => e.createdBy === teacherId);
    const totalStudents = mockStudents.length;
    const totalMaterials = mockMaterials.length;
    const upcomingClasses = teacherEvents.filter(e =>
        e.type === 'class' && new Date(e.startTime) > new Date()
    ).length;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="flex">
                {/* Sidebar */}
                <aside className="hidden lg:block w-64 border-r bg-card p-6 min-h-screen sticky top-0">
                    <div className="mb-8">
                        <h2 className="text-lg font-bold">Teacher Portal</h2>
                        <p className="text-sm text-muted-foreground">{teacherName}</p>
                    </div>
                    <SidebarNav role="teacher" />
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Welcome, {teacherName}! 👨‍🏫</h1>
                                <p className="text-muted-foreground mt-2">Manage your classes and track student progress</p>
                            </div>
                            <Button asChild>
                                <Link href="/teacher/materials">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Material
                                </Link>
                            </Button>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{totalStudents}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Active learners
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Materials</CardTitle>
                                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{totalMaterials}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Published
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Upcoming Classes</CardTitle>
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{upcomingClasses}</div>
                                    <p className="text-xs text-muted-foreground">
                                        This week
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">78%</div>
                                    <p className="text-xs text-muted-foreground">
                                        Class average
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Two Column Layout */}
                        <div className="grid gap-6 lg:grid-cols-3">
                            {/* Recent Activity */}
                            <div className="lg:col-span-2 space-y-4">
                                <h2 className="text-2xl font-bold">Recent Student Activity</h2>
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="space-y-4">
                                            {mockStudents.map(student => (
                                                <div key={student.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                                                            {student.name.split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{student.name}</p>
                                                            <p className="text-sm text-muted-foreground">Completed Algebra Quiz</p>
                                                        </div>
                                                    </div>
                                                    <Button asChild variant="ghost" size="sm">
                                                        <Link href="/teacher/students">View</Link>
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Calendar Widget */}
                            <div>
                                <CalendarWidget events={teacherEvents} />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
