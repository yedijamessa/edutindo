"use client"

import { useState } from "react";
import { SidebarNav } from "@/components/lms/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Quiz, type QuizAttemptReview } from "@/types/lms";
import { ArrowLeft, Clock, Award, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

export default function QuizTaker({ quiz }: { quiz: Quiz }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<number, any>>({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [startedAt, setStartedAt] = useState(() => new Date().toISOString());
    const [attemptReview, setAttemptReview] = useState<QuizAttemptReview | null>(null);
    const [submitError, setSubmitError] = useState("");

    const handleAnswer = (questionIndex: number, answer: any) => {
        setAnswers({ ...answers, [questionIndex]: answer });
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSubmitError("");

        try {
            const response = await fetch("/api/student/quiz-attempts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    quizId: quiz.id,
                    answers,
                    startedAt,
                }),
            });
            const data = await response.json();

            if (!response.ok || !data.ok) {
                throw new Error(data.error || "Failed to submit quiz.");
            }

            setAttemptReview(data.attempt);
            setScore(data.attempt.score);
            setSubmitted(true);
        } catch (error) {
            console.error("Error saving quiz attempt:", error);
            setSubmitError(error instanceof Error ? error.message : "Failed to submit quiz.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
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
                        <div className="portal-page-width space-y-6">
                            <Card className="text-center">
                                <CardContent className="p-12">
                                    <div className="w-20 h-20 mx-auto rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
                                        <Award className="w-10 h-10 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h2 className="text-3xl font-bold mb-2">Quiz Completed!</h2>
                                    <p className="text-muted-foreground mb-6">Great job on completing the quiz</p>
                                    <div className="text-6xl font-bold text-primary mb-6">{score}%</div>
                                    {attemptReview && (
                                        <p className="mb-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                                            {attemptReview.earnedPoints}/{attemptReview.totalPoints} points recorded
                                        </p>
                                    )}
                                    <p className="text-lg mb-8">
                                        {score >= quiz.passingScore ? (
                                            <span className="text-green-600 dark:text-green-400">✓ Passed!</span>
                                        ) : (
                                            <span className="text-orange-600 dark:text-orange-400">Keep practicing!</span>
                                        )}
                                    </p>
                                    <div className="flex gap-2 justify-center">
                                        <Link href="/student/quizzes">
                                            <Button>Back to Quizzes</Button>
                                        </Link>
                                        <Button variant="outline" onClick={() => {
                                            setSubmitted(false);
                                            setAnswers({});
                                            setCurrentQuestion(0);
                                            setAttemptReview(null);
                                            setScore(0);
                                            setStartedAt(new Date().toISOString());
                                            setSubmitError("");
                                        }}>
                                            Retry Quiz
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {attemptReview && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Question Review</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {attemptReview.questionResults.map((result, index) => (
                                            <div
                                                key={result.questionId}
                                                className="rounded-lg border bg-white p-4 dark:bg-slate-900"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                                                            {index + 1}. {result.questionText}
                                                        </p>
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            {result.earnedPoints}/{result.points} points
                                                        </p>
                                                    </div>
                                                    {result.isCorrect ? (
                                                        <Badge className="bg-green-100 text-green-700">
                                                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                                                            Correct
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-red-100 text-red-700">
                                                            <XCircle className="mr-1 h-3.5 w-3.5" />
                                                            Review
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                                                    <div className="rounded-md bg-slate-50 p-3 dark:bg-slate-950">
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                            Your answer
                                                        </p>
                                                        <p className="mt-1 text-slate-800 dark:text-slate-100">
                                                            {result.studentAnswer ?? "No answer"}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-md bg-blue-50 p-3 dark:bg-blue-950/40">
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300">
                                                            Correct answer
                                                        </p>
                                                        <p className="mt-1 text-slate-800 dark:text-slate-100">
                                                            {typeof result.correctAnswer === "number" && result.options?.[result.correctAnswer]
                                                                ? result.options[result.correctAnswer]
                                                                : result.correctAnswer}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    const question = quiz.questions[currentQuestion];

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
                    <div className="portal-page-width space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link href="/student/quizzes">
                                    <Button variant="outline" size="icon">
                                        <ArrowLeft className="w-4 h-4" />
                                    </Button>
                                </Link>
                                <div>
                                    <h1 className="text-2xl font-bold">{quiz.title}</h1>
                                    <p className="text-sm text-muted-foreground">{quiz.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{quiz.timeLimit} min</span>
                            </div>
                        </div>

                        {/* Progress */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">
                                        Question {currentQuestion + 1} of {quiz.questions.length}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {Object.keys(answers).length} answered
                                    </span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                    <div
                                        className="bg-primary h-2 rounded-full transition-all"
                                        style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Question */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <CardTitle className="text-xl">{question.question}</CardTitle>
                                    <Badge variant="secondary">{question.points} pts</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {question.type === 'multiple-choice' || question.type === 'true-false' ? (
                                    question.options?.map((option, index) => (
                                        <Button
                                            key={index}
                                            variant={answers[currentQuestion] === index ? 'default' : 'outline'}
                                            className="w-full justify-start text-left h-auto py-3"
                                            onClick={() => handleAnswer(currentQuestion, index)}
                                        >
                                            <span className="mr-3 font-bold">{String.fromCharCode(65 + index)}.</span>
                                            {option}
                                        </Button>
                                    ))
                                ) : (
                                    <textarea
                                        className="w-full min-h-[150px] p-3 rounded-lg border bg-background"
                                        placeholder="Enter your answer..."
                                        value={answers[currentQuestion] || ''}
                                        onChange={(e) => handleAnswer(currentQuestion, e.target.value)}
                                    />
                                )}
                            </CardContent>
                        </Card>

                        {/* Navigation */}
                        <div className="flex items-center justify-between">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                                disabled={currentQuestion === 0}
                            >
                                Previous
                            </Button>
                            <div className="flex gap-1">
                                {quiz.questions.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentQuestion(index)}
                                        className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${index === currentQuestion
                                            ? 'bg-primary text-primary-foreground'
                                            : answers[index] !== undefined
                                                ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                                                : 'bg-muted text-muted-foreground hover:bg-accent'
                                            }`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </div>
                            {currentQuestion < quiz.questions.length - 1 ? (
                                <Button onClick={() => setCurrentQuestion(currentQuestion + 1)}>
                                    Next
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={Object.keys(answers).length !== quiz.questions.length || isSubmitting}
                                >
                                    {isSubmitting ? "Submitting..." : "Submit Quiz"}
                                </Button>
                            )}
                        </div>
                        {submitError && (
                            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                {submitError}
                            </p>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
