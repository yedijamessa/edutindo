"use client"

import { useState } from "react";
import { SidebarNav } from "@/components/lms/sidebar-nav";
import { QuizCard } from "@/components/lms/quiz-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { mockQuizzes } from "@/lib/mock-data";
import { Award, Clock, Plus, X, Trash2 } from "lucide-react";

type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';

interface Question {
    id: string;
    type: QuestionType;
    question: string;
    options?: string[];
    correctAnswer?: string | number;
    points: number;
}

export default function StudentQuizzesPage() {
    const [isCreating, setIsCreating] = useState(false);
    const [quizTitle, setQuizTitle] = useState('');
    const [quizDescription, setQuizDescription] = useState('');
    const [quizSubject, setQuizSubject] = useState('');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<Question>({
        id: Date.now().toString(),
        type: 'multiple-choice',
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        points: 1
    });

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

    const questionTypes = [
        { value: 'multiple-choice', label: 'Multiple Choice' },
        { value: 'true-false', label: 'True/False' },
        { value: 'short-answer', label: 'Short Answer' },
        { value: 'essay', label: 'Essay' },
    ];

    const addQuestion = () => {
        if (!currentQuestion.question.trim()) return;
        setQuestions([...questions, { ...currentQuestion, id: Date.now().toString() }]);
        setCurrentQuestion({
            id: Date.now().toString(),
            type: 'multiple-choice',
            question: '',
            options: ['', '', '', ''],
            correctAnswer: 0,
            points: 1
        });
    };

    const removeQuestion = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    const handleCreateQuiz = () => {
        console.log('Creating quiz:', { quizTitle, quizDescription, quizSubject, questions });
        alert(`Quiz "${quizTitle}" created with ${questions.length} questions! 📝`);
        setIsCreating(false);
        setQuizTitle('');
        setQuizDescription('');
        setQuizSubject('');
        setQuestions([]);
    };

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
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Quizzes</h1>
                                <p className="text-muted-foreground mt-2">Test your knowledge and track your progress</p>
                            </div>
                            <Button onClick={() => setIsCreating(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Quiz
                            </Button>
                        </div>

                        {/* Create Quiz Form */}
                        {isCreating && (
                            <Card className="border-primary">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Create New Quiz</CardTitle>
                                        <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)}>
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Quiz Details */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold">Quiz Details</h3>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Title</label>
                                                <Input
                                                    placeholder="e.g., Algebra Basics Quiz"
                                                    value={quizTitle}
                                                    onChange={(e) => setQuizTitle(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Subject</label>
                                                <Input
                                                    placeholder="e.g., Mathematics"
                                                    value={quizSubject}
                                                    onChange={(e) => setQuizSubject(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Description</label>
                                            <Textarea
                                                placeholder="Brief description of the quiz..."
                                                value={quizDescription}
                                                onChange={(e) => setQuizDescription(e.target.value)}
                                                rows={2}
                                            />
                                        </div>
                                    </div>

                                    {/* Added Questions */}
                                    {questions.length > 0 && (
                                        <div className="space-y-4">
                                            <h3 className="font-semibold">Questions ({questions.length})</h3>
                                            <div className="space-y-2">
                                                {questions.map((q, index) => (
                                                    <div key={q.id} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium">Q{index + 1}: {q.question}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {questionTypes.find(t => t.value === q.type)?.label} • {q.points} point{q.points > 1 ? 's' : ''}
                                                            </p>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeQuestion(q.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Add Question */}
                                    <div className="space-y-4 border-t pt-4">
                                        <h3 className="font-semibold">Add Question</h3>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Question Type</label>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                {questionTypes.map(type => (
                                                    <Button
                                                        key={type.value}
                                                        variant={currentQuestion.type === type.value ? 'default' : 'outline'}
                                                        size="sm"
                                                        onClick={() => setCurrentQuestion({
                                                            ...currentQuestion,
                                                            type: type.value as QuestionType,
                                                            options: type.value === 'multiple-choice' ? ['', '', '', ''] :
                                                                type.value === 'true-false' ? ['True', 'False'] : undefined
                                                        })}
                                                    >
                                                        {type.label}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Question</label>
                                            <Textarea
                                                placeholder="Enter your question..."
                                                value={currentQuestion.question}
                                                onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                                                rows={2}
                                            />
                                        </div>

                                        {/* Multiple Choice Options */}
                                        {currentQuestion.type === 'multiple-choice' && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Options</label>
                                                {currentQuestion.options?.map((option, index) => (
                                                    <div key={index} className="flex gap-2">
                                                        <Input
                                                            placeholder={`Option ${index + 1}`}
                                                            value={option}
                                                            onChange={(e) => {
                                                                const newOptions = [...(currentQuestion.options || [])];
                                                                newOptions[index] = e.target.value;
                                                                setCurrentQuestion({ ...currentQuestion, options: newOptions });
                                                            }}
                                                        />
                                                        <Button
                                                            variant={currentQuestion.correctAnswer === index ? 'default' : 'outline'}
                                                            onClick={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: index })}
                                                        >
                                                            {currentQuestion.correctAnswer === index ? '✓ Correct' : 'Mark Correct'}
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* True/False Options */}
                                        {currentQuestion.type === 'true-false' && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Correct Answer</label>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant={currentQuestion.correctAnswer === 0 ? 'default' : 'outline'}
                                                        onClick={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: 0 })}
                                                        className="flex-1"
                                                    >
                                                        True
                                                    </Button>
                                                    <Button
                                                        variant={currentQuestion.correctAnswer === 1 ? 'default' : 'outline'}
                                                        onClick={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: 1 })}
                                                        className="flex-1"
                                                    >
                                                        False
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Short Answer / Essay */}
                                        {(currentQuestion.type === 'short-answer' || currentQuestion.type === 'essay') && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Model Answer (Optional)</label>
                                                <Textarea
                                                    placeholder="Enter a model answer for reference..."
                                                    value={currentQuestion.correctAnswer as string || ''}
                                                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                                                    rows={currentQuestion.type === 'essay' ? 4 : 2}
                                                />
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Points</label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={currentQuestion.points}
                                                onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) || 1 })}
                                                className="w-32"
                                            />
                                        </div>

                                        <Button onClick={addQuestion} variant="outline">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Question
                                        </Button>
                                    </div>

                                    <div className="flex gap-2 border-t pt-4">
                                        <Button onClick={handleCreateQuiz} disabled={questions.length === 0}>
                                            Create Quiz ({questions.length} question{questions.length !== 1 ? 's' : ''})
                                        </Button>
                                        <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

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
