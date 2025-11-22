"use client"

import { useState } from "react";
import { SidebarNav } from "@/components/lms/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Quiz } from "@/types/lms";
import { ArrowLeft, Clock, Award } from "lucide-react";
import Link from "next/link";

export default function QuizTaker({ quiz }: { quiz: Quiz }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<number, any>>({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    const handleAnswer = (questionIndex: number, answer: any) => {
        setAnswers({ ...answers, [questionIndex]: answer });
    };

    const handleSubmit = () => {
        const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
        const earnedPoints = quiz.questions.reduce((sum, q, index) => {
            return sum + (answers[index] === q.correctAnswer ? q.points : 0);
        }, 0);
        setScore(Math.round((earnedPoints / totalPoints) * 100));
        setSubmitted(true);
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
                        <div className="max-w-2xl mx-auto space-y-6">
                            <Card className="text-center">
                                <CardContent className="p-12">
                                    <div className="w-20 h-20 mx-auto rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
                                        <Award className="w-10 h-10 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h2 className="text-3xl font-bold mb-2">Quiz Completed!</h2>
                                    <p className="text-muted-foreground mb-6">Great job on completing the quiz</p>
                                    <div className="text-6xl font-bold text-primary mb-6">{score}%</div>
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
                                        }}>
                                            Retry Quiz
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
                    <div className="max-w-3xl mx-auto space-y-6">
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
                                    disabled={Object.keys(answers).length !== quiz.questions.length}
                                >
                                    Submit Quiz
                                </Button>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
