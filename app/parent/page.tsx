import { SidebarNav } from "@/components/lms/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockMaterials, mockProgress, mockStudents } from "@/lib/mock-data";
import { BarChart3, Users } from "lucide-react";

export default function ParentDashboard() {
    const parentId = 'parent-1';
    const parentName = 'Robert Johnson';
    const studentId = 'student-1'; // Child
    const student = mockStudents.find(s => s.id === studentId);

    const studentProgress = mockProgress.filter(p => p.studentId === studentId);
    const overallProgress = studentProgress.length > 0
        ? Math.round(studentProgress.reduce((sum, p) => sum + p.progress, 0) / studentProgress.length)
        : 0;
    const completedCount = studentProgress.filter(p => p.completed).length;
    const totalMaterials = mockMaterials.length;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="flex">
                <aside className="hidden lg:block w-64 border-r bg-card p-6 min-h-screen sticky top-0">
                    <div className="mb-8">
                        <h2 className="text-lg font-bold">Parent Portal</h2>
                        <p className="text-sm text-muted-foreground">{parentName}</p>
                    </div>
                    <SidebarNav role="parent" />
                </aside>

                <main className="flex-1 p-6 lg:p-8">
                    <div className="max-w-5xl mx-auto space-y-8">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Welcome, {parentName}! 👨‍👩‍👧</h1>
                            <p className="text-muted-foreground mt-2">Monitor your child's learning progress</p>
                        </div>

                        {/* Student Selector */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-2xl">
                                        {student?.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold">{student?.name}</h2>
                                        <p className="text-muted-foreground">{student?.email}</p>
                                    </div>
                                    <Badge className="text-lg px-4 py-2">{overallProgress}% Complete</Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Stats Grid */}
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
                                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
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
                                    <CardTitle className="text-sm font-medium">Materials Completed</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{completedCount}/{totalMaterials}</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {totalMaterials - completedCount} remaining
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Average Quiz Score</CardTitle>
                                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">85%</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Above class average
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Progress by Material */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Progress by Material</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {mockMaterials.map(material => {
                                        const progress = studentProgress.find(p => p.materialId === material.id);
                                        const progressValue = progress?.progress || 0;

                                        return (
                                            <div key={material.id} className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="font-medium">{material.title}</p>
                                                        <p className="text-sm text-muted-foreground">{material.subject}</p>
                                                    </div>
                                                    <Badge variant={progress?.completed ? "default" : "outline"}>
                                                        {progressValue}%
                                                    </Badge>
                                                </div>
                                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary transition-all"
                                                        style={{ width: `${progressValue}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 rounded-lg border">
                                        <div>
                                            <p className="font-medium">Completed Algebra Quiz</p>
                                            <p className="text-sm text-muted-foreground">Score: 85%</p>
                                        </div>
                                        <span className="text-sm text-muted-foreground">2 days ago</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg border">
                                        <div>
                                            <p className="font-medium">Finished Scientific Method material</p>
                                            <p className="text-sm text-muted-foreground">30 minutes spent</p>
                                        </div>
                                        <span className="text-sm text-muted-foreground">3 days ago</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
