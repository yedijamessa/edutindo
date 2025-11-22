import { SidebarNav } from "@/components/lms/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockMaterials, mockStudents, mockTeachers } from "@/lib/mock-data";
import { School, Users, BookOpen, TrendingUp, Calendar, FileText } from "lucide-react";
import Link from "next/link";

export default function PrincipalDashboard() {
    const principalName = 'Principal Admin';

    const totalStudents = mockStudents.length;
    const totalTeachers = mockTeachers.length;
    const totalMaterials = mockMaterials.length;
    const activePrograms = 3; // Mock data

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="flex">
                {/* Sidebar */}
                <aside className="hidden lg:block w-64 border-r bg-card p-6 min-h-screen sticky top-0">
                    <div className="mb-8">
                        <h2 className="text-lg font-bold">Principal Portal</h2>
                        <p className="text-sm text-muted-foreground">{principalName}</p>
                    </div>
                    <nav className="space-y-1">
                        <Link
                            href="/principal"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground"
                        >
                            <School className="w-5 h-5" />
                            Dashboard
                        </Link>
                        <Link
                            href="/principal/teachers"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        >
                            <Users className="w-5 h-5" />
                            Teachers
                        </Link>
                        <Link
                            href="/principal/students"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        >
                            <Users className="w-5 h-5" />
                            Students
                        </Link>
                        <Link
                            href="/principal/curriculum"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        >
                            <BookOpen className="w-5 h-5" />
                            Curriculum
                        </Link>
                        <Link
                            href="/principal/reports"
                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        >
                            <FileText className="w-5 h-5" />
                            Reports
                        </Link>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Welcome, {principalName}! 🏫</h1>
                                <p className="text-muted-foreground mt-2">School administration and oversight dashboard</p>
                            </div>
                            <Button asChild>
                                <Link href="/contact">
                                    Request Partnership
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
                                        Enrolled learners
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Teaching Staff</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{totalTeachers}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Active teachers
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Curriculum Materials</CardTitle>
                                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{totalMaterials}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Available resources
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{activePrograms}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Running initiatives
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Overview Cards */}
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>School Performance Overview</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Average Student Progress</span>
                                            <span className="font-medium">78%</span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div className="h-full bg-primary" style={{ width: '78%' }} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Teacher Engagement</span>
                                            <span className="font-medium">92%</span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500" style={{ width: '92%' }} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Curriculum Completion</span>
                                            <span className="font-medium">65%</span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div className="h-full bg-orange-500" style={{ width: '65%' }} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>STEAM-C++ Implementation</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 rounded-lg border">
                                            <div>
                                                <p className="font-medium">Framework Integration</p>
                                                <p className="text-sm text-muted-foreground">Curriculum redesign in progress</p>
                                            </div>
                                            <Badge>Active</Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-lg border">
                                            <div>
                                                <p className="font-medium">Teacher Training</p>
                                                <p className="text-sm text-muted-foreground">Workshops and coaching</p>
                                            </div>
                                            <Badge variant="secondary">Scheduled</Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-lg border">
                                            <div>
                                                <p className="font-medium">Student Programs</p>
                                                <p className="text-sm text-muted-foreground">Clubs and projects</p>
                                            </div>
                                            <Badge>Active</Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                                        <Link href="/contact">
                                            <School className="w-6 h-6" />
                                            <span>Request Partnership</span>
                                        </Link>
                                    </Button>
                                    <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                                        <Link href="/principal/reports">
                                            <FileText className="w-6 h-6" />
                                            <span>View Reports</span>
                                        </Link>
                                    </Button>
                                    <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                                        <Link href="/contact">
                                            <Calendar className="w-6 h-6" />
                                            <span>Schedule Meeting</span>
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
