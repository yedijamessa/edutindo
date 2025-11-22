import { SidebarNav } from "@/components/lms/sidebar-nav";
import { QuizCard } from "@/components/lms/quiz-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockQuizzes } from "@/lib/mock-data";
import { Award, Clock } from "lucide-react";

export default function StudentQuizzesPage() {
    // Mock quiz attempts
    const quizAttempts = [
        { quizId: 'quiz-1', score: 85, attempts: 2 }
    ];

    const availableQuizzes = mockQuizzes.filter(q =>
        !quizAttempts.find(a => a.quizId === q.id)
    );

    const completedQuizzes = mockQuizzes.filter(q =>
        quizAttempts.find(a => a.quizId === q.id)
    );

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
                            <h1 className="text-3xl font-bold tracking-tight">Quizzes</h1>
                            <p className="text-muted-foreground mt-2">Test your knowledge and track your progress</p>
                        </div>

                        {/* Stats */}
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Available Quizzes</CardTitle>
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{availableQuizzes.length}</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Completed</CardTitle>
                                    <Award className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{completedQuizzes.length}</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                                    <Award className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">85%</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Available Quizzes */}
                        {availableQuizzes.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-2xl font-bold">Available Quizzes</h2>
                                    <Badge>{availableQuizzes.length}</Badge>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {availableQuizzes.map(quiz => (
                                        <QuizCard key={quiz.id} quiz={quiz} role="student" />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Completed Quizzes */}
                        {completedQuizzes.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-2xl font-bold">Completed Quizzes</h2>
                                    <Badge variant="secondary">{completedQuizzes.length}</Badge>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {completedQuizzes.map(quiz => {
                                        const attempt = quizAttempts.find(a => a.quizId === quiz.id);
                                        return (
                                            <QuizCard
                                                key={quiz.id}
                                                quiz={quiz}
                                                score={attempt?.score}
                                                attempts={attempt?.attempts}
                                                role="student"
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
