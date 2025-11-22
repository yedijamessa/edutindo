import { SidebarNav } from "@/components/lms/sidebar-nav";
import { ProgressChart } from "@/components/lms/progress-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockStudents, mockMaterials, mockProgress } from "@/lib/mock-data";
import { Users, TrendingUp, Award, Clock } from "lucide-react";

export default function TeacherStudentsPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="flex">
                <aside className="hidden lg:block w-64 border-r bg-card p-6 min-h-screen sticky top-0">
                    <div className="mb-8">
                        <h2 className="text-lg font-bold">Teacher Portal</h2>
                    </div>
                    <SidebarNav role="teacher" />
                </aside>

                <main className="flex-1 p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
                            <p className="text-muted-foreground mt-2">Monitor student progress and performance</p>
                        </div>

                        {/* Class Stats */}
                        <div className="grid gap-4 md:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{mockStudents.length}</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">78%</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Avg. Quiz Score</CardTitle>
                                    <Award className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">85%</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Avg. Time Spent</CardTitle>
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">42m</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Student List */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold">Students</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                {mockStudents.map(student => {
                                    const studentProgress = mockProgress.filter(p => p.studentId === student.id);
                                    const avgProgress = studentProgress.length > 0
                                        ? Math.round(studentProgress.reduce((sum, p) => sum + p.progress, 0) / studentProgress.length)
                                        : 0;
                                    const completedCount = studentProgress.filter(p => p.completed).length;

                                    return (
                                        <Card key={student.id} className="hover:shadow-lg transition-shadow">
                                            <CardHeader>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-lg">
                                                            {student.name.split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-lg">{student.name}</CardTitle>
                                                            <p className="text-sm text-muted-foreground">{student.email}</p>
                                                        </div>
                                                    </div>
                                                    <Badge>{avgProgress}%</Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-muted-foreground">Completed</p>
                                                        <p className="font-semibold">{completedCount} materials</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">Quiz Avg</p>
                                                        <p className="font-semibold">85%</p>
                                                    </div>
                                                </div>
                                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary transition-all"
                                                        style={{ width: `${avgProgress}%` }}
                                                    />
                                                </div>
                                                <Button variant="outline" className="w-full">View Details</Button>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
