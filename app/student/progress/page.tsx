import { SidebarNav } from "@/components/lms/sidebar-nav";
import { ProgressChart } from "@/components/lms/progress-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStudentProgress, getMaterials } from "@/lib/firestore-services";
import { getCurrentUser } from "@/lib/auth";
import { CheckCircle2, Trophy, Target, Clock, TrendingUp, XCircle } from "lucide-react";

function formatAttemptDate(value: Date) {
    return new Date(value).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default async function StudentProgressPage() {
    const user = await getCurrentUser();
    const studentId = user?.id ?? 'student-1';
    const [studentProgress, materials] = await Promise.all([
        getStudentProgress(studentId),
        getMaterials()
    ]);

    const totalTimeSpent = studentProgress.reduce((sum, p) => sum + p.timeSpent, 0);
    const completedCount = studentProgress.filter(p => p.completed).length;
    const overallProgress = studentProgress.length > 0
        ? Math.round(studentProgress.reduce((sum, p) => sum + p.progress, 0) / studentProgress.length)
        : 0;
    const quizAttempts = studentProgress
        .flatMap((progress) =>
            (progress.quizScores ?? []).flatMap((score) =>
                (score.attemptHistory ?? []).map((attempt) => ({
                    ...attempt,
                    materialId: progress.materialId,
                }))
            )
        )
        .sort((left, right) => new Date(right.completedAt).getTime() - new Date(left.completedAt).getTime());

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
                    <div className="portal-page-width space-y-8">
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
                            materials={materials}
                        />

                        <Card>
                            <CardHeader>
                                <CardTitle>Quiz Attempt History</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {quizAttempts.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No quiz attempts recorded yet.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {quizAttempts.map((attempt) => (
                                            <div
                                                key={attempt.attemptId}
                                                className="rounded-xl border bg-white p-4 dark:bg-slate-900"
                                            >
                                                <div className="flex flex-wrap items-start justify-between gap-3">
                                                    <div>
                                                        <p className="font-semibold text-slate-900 dark:text-slate-50">
                                                            {attempt.quizTitle}
                                                        </p>
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            {formatAttemptDate(attempt.completedAt)} · {attempt.timeSpentSeconds}s
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-2xl font-bold text-primary">{attempt.score}%</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {attempt.earnedPoints}/{attempt.totalPoints} points
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-4 space-y-2">
                                                    {attempt.questionResults.map((question, index) => (
                                                        <details
                                                            key={`${attempt.attemptId}-${question.questionId}`}
                                                            className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950"
                                                        >
                                                            <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-medium">
                                                                <span>{index + 1}. {question.questionText}</span>
                                                                <span className={question.isCorrect ? "text-green-600" : "text-red-600"}>
                                                                    {question.isCorrect ? (
                                                                        <CheckCircle2 className="h-4 w-4" />
                                                                    ) : (
                                                                        <XCircle className="h-4 w-4" />
                                                                    )}
                                                                </span>
                                                            </summary>
                                                            <div className="mt-3 grid gap-2 text-xs md:grid-cols-2">
                                                                <div className="rounded-md bg-white p-3 dark:bg-slate-900">
                                                                    <p className="font-semibold uppercase text-muted-foreground">Student answer</p>
                                                                    <p className="mt-1 text-slate-800 dark:text-slate-100">
                                                                        {question.studentAnswer ?? "No answer"}
                                                                    </p>
                                                                </div>
                                                                <div className="rounded-md bg-blue-50 p-3 dark:bg-blue-950/40">
                                                                    <p className="font-semibold uppercase text-blue-600 dark:text-blue-300">Correct answer</p>
                                                                    <p className="mt-1 text-slate-800 dark:text-slate-100">
                                                                        {typeof question.correctAnswer === "number" && question.options?.[question.correctAnswer]
                                                                            ? question.options[question.correctAnswer]
                                                                            : question.correctAnswer}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </details>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

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
