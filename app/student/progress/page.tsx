import { SidebarNav } from "@/components/lms/sidebar-nav";
import { ProgressChart } from "@/components/lms/progress-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockMaterials, getStudentProgress } from "@/lib/mock-data";
import { Trophy, Target, Clock, TrendingUp } from "lucide-react";

export default function StudentProgressPage() {
    const studentId = 'student-1';
    const studentProgress = getStudentProgress(studentId);

    const totalTimeSpent = studentProgress.reduce((sum, p) => sum + p.timeSpent, 0);
    const completedCount = studentProgress.filter(p => p.completed).length;
    const overallProgress = studentProgress.length > 0
        ? Math.round(studentProgress.reduce((sum, p) => sum + p.progress, 0) / studentProgress.length)
        : 0;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="flex">
                <aside className="hidden lg:block w-64 border-r bg-card p-6 min-h-screen sticky top-0">
                    <div className="mb-8">
                        <h2 className="text-lg font-bold">Student Portal</h2>
                    </div>
                    <SidebarNav role="student" />
                </aside>

                <main className="flex-1 p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">My Progress</h1>
                            <p className="text-muted-foreground mt-2">Track your learning journey and achievements</p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
                                    <Target className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{overallProgress}%</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Keep going!
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Completed</CardTitle>
                                    <Trophy className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{completedCount}</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Materials finished
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Time Spent</CardTitle>
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{totalTimeSpent}m</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        This month
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Streak</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">7 days</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Keep it up! 🔥
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Progress Charts */}
                        <ProgressChart
                            progressData={studentProgress}
                            materials={mockMaterials}
                        />

                        {/* Achievements */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Trophy className="w-5 h-5" />
                                    Achievements
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="flex items-center gap-3 p-4 rounded-lg border bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
                                        <div className="text-3xl">🏆</div>
                                        <div>
                                            <p className="font-semibold">First Quiz</p>
                                            <p className="text-xs text-muted-foreground">Completed your first quiz</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 rounded-lg border bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                                        <div className="text-3xl">📚</div>
                                        <div>
                                            <p className="font-semibold">Bookworm</p>
                                            <p className="text-xs text-muted-foreground">Read 5 materials</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 rounded-lg border bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                                        <div className="text-3xl">⭐</div>
                                        <div>
                                            <p className="font-semibold">Perfect Score</p>
                                            <p className="text-xs text-muted-foreground">Got 100% on a quiz</p>
                                        </div>
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
