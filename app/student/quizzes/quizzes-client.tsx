"use client"

import { useState } from "react";
import { SidebarNav } from "@/components/lms/sidebar-nav";
import { QuizCard } from "@/components/lms/quiz-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Quiz, Question, QuestionType } from "@/types/lms";
import { Search, Plus, X, CheckCircle2, HelpCircle, AlignLeft, Type } from "lucide-react";
import { createQuiz } from "@/lib/firestore-services";
import { generateQuizQuestions } from "@/lib/ai-services";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";

interface QuizzesClientProps {
    quizzes: Quiz[];
}

export default function QuizzesClient({ quizzes }: QuizzesClientProps) {
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [aiPrompt, setAiPrompt] = useState({
        topic: '',
        difficulty: 'medium' as 'easy' | 'medium' | 'hard',
        questionCount: 5
    });

    // Quiz Creation State
    const [newQuiz, setNewQuiz] = useState<Partial<Quiz>>({
        title: '',
        description: '',
        timeLimit: 30,
        passingScore: 70,
        questions: []
    });

    const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({
        question: '',
        type: 'multiple-choice',
        points: 10,
        options: ['', '', '', ''],
        correctAnswer: 0
    });

    const questionTypes = [
        { value: 'multiple-choice', label: 'Multiple Choice', icon: CheckCircle2 },
        { value: 'true-false', label: 'True/False', icon: HelpCircle },
        { value: 'short-answer', label: 'Short Answer', icon: Type },
        { value: 'essay', label: 'Essay', icon: AlignLeft },
    ];

    const handleAddQuestion = () => {
        if (!currentQuestion.question) {
            alert('Please enter a question text');
            return;
        }

        const question: Question = {
            id: `q-${Date.now()}`,
            question: currentQuestion.question!,
            type: currentQuestion.type as QuestionType,
            points: currentQuestion.points || 10,
            options: currentQuestion.type === 'multiple-choice' ? currentQuestion.options :
                currentQuestion.type === 'true-false' ? ['True', 'False'] : undefined,
            correctAnswer: currentQuestion.correctAnswer ?? 0
        };

        setNewQuiz({
            ...newQuiz,
            questions: [...(newQuiz.questions || []), question]
        });

        // Reset current question
        setCurrentQuestion({
            question: '',
            type: 'multiple-choice',
            points: 10,
            options: ['', '', '', ''],
            correctAnswer: 0
        });
    };

    const handleRemoveQuestion = (questionId: string) => {
        setNewQuiz({
            ...newQuiz,
            questions: newQuiz.questions?.filter(q => q.id !== questionId)
        });
    };

    const handleCreateQuiz = async () => {
        if (!newQuiz.title || !newQuiz.description || (newQuiz.questions?.length || 0) === 0) {
            alert('Please fill in all fields and add at least one question');
            return;
        }

        setIsSubmitting(true);
        try {
            await createQuiz({
                title: newQuiz.title!,
                description: newQuiz.description!,
                materialId: 'general', // Default or select from materials
                questions: newQuiz.questions!,
                timeLimit: newQuiz.timeLimit || 30,
                passingScore: newQuiz.passingScore || 70,
                createdBy: 'student-1', // Hardcoded for now
            });

            alert('Quiz created successfully! 📝');
            setIsCreating(false);
            setNewQuiz({
                title: '',
                description: '',
                timeLimit: 30,
                passingScore: 70,
                questions: []
            });

            router.refresh();
        } catch (error) {
            console.error('Error creating quiz:', error);
            alert('Failed to create quiz');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGenerateAI = async () => {
        if (!aiPrompt.topic) {
            alert('Please enter a topic');
            return;
        }

        setIsGenerating(true);
        try {
            const questions = await generateQuizQuestions({
                topic: aiPrompt.topic,
                difficulty: aiPrompt.difficulty,
                questionCount: aiPrompt.questionCount,
                types: ['multiple-choice', 'true-false', 'short-answer']
            });

            setNewQuiz({
                ...newQuiz,
                title: `Quiz: ${aiPrompt.topic}`,
                description: `AI-generated quiz about ${aiPrompt.topic} (${aiPrompt.difficulty} difficulty)`,
                questions: [...(newQuiz.questions || []), ...questions]
            });

            // Reset AI prompt but keep modal open to review questions
            setAiPrompt({ ...aiPrompt, topic: '' });
        } catch (error) {
            console.error('Error generating quiz:', error);
            alert('Failed to generate quiz questions');
        } finally {
            setIsGenerating(false);
        }
    };

    const filteredQuizzes = quizzes.filter(quiz =>
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.description.toLowerCase().includes(searchQuery.toLowerCase())
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
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Quizzes & Assessments</h1>
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
                                    <CardDescription>Build a custom quiz to test yourself or others</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Basic Info */}
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Title</label>
                                            <Input
                                                value={newQuiz.title}
                                                onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                                                placeholder="e.g., Algebra Final Review"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Time Limit (minutes)</label>
                                            <Input
                                                type="number"
                                                value={newQuiz.timeLimit}
                                                onChange={(e) => setNewQuiz({ ...newQuiz, timeLimit: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Description</label>
                                        <Textarea
                                            value={newQuiz.description}
                                            onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })}
                                            placeholder="What is this quiz about?"
                                        />
                                    </div>

                                    {/* AI Generator Section */}
                                    <div className="p-4 border rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Sparkles className="w-5 h-5 text-indigo-500" />
                                            <h3 className="font-semibold text-indigo-700 dark:text-indigo-300">Generate with AI</h3>
                                        </div>
                                        <div className="flex gap-4 items-end">
                                            <div className="flex-1 space-y-2">
                                                <label className="text-xs font-medium">Topic</label>
                                                <Input
                                                    placeholder="e.g., Photosynthesis, World War II"
                                                    value={aiPrompt.topic}
                                                    onChange={(e) => setAiPrompt({ ...aiPrompt, topic: e.target.value })}
                                                />
                                            </div>
                                            <div className="w-32 space-y-2">
                                                <label className="text-xs font-medium">Difficulty</label>
                                                <select
                                                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                    value={aiPrompt.difficulty}
                                                    onChange={(e) => setAiPrompt({ ...aiPrompt, difficulty: e.target.value as any })}
                                                >
                                                    <option value="easy">Easy</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="hard">Hard</option>
                                                </select>
                                            </div>
                                            <Button
                                                onClick={handleGenerateAI}
                                                disabled={isGenerating || !aiPrompt.topic}
                                                className="bg-indigo-600 hover:bg-indigo-700"
                                            >
                                                {isGenerating ? (
                                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                                                ) : (
                                                    <><Sparkles className="w-4 h-4 mr-2" /> Generate</>
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="border-t pt-6">
                                        <h3 className="text-lg font-semibold mb-4">Add Questions</h3>

                                        {/* Question Type Selector */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                                            {questionTypes.map(type => {
                                                const Icon = type.icon;
                                                return (
                                                    <Button
                                                        key={type.value}
                                                        variant={currentQuestion.type === type.value ? 'default' : 'outline'}
                                                        onClick={() => setCurrentQuestion({ ...currentQuestion, type: type.value as QuestionType })}
                                                        className="h-auto py-3 flex-col gap-2"
                                                    >
                                                        <Icon className="w-5 h-5" />
                                                        <span className="text-xs">{type.label}</span>
                                                    </Button>
                                                )
                                            })}
                                        </div>

                                        {/* Question Editor */}
                                        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Question Text</label>
                                                <Input
                                                    value={currentQuestion.question}
                                                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                                                    placeholder="Enter your question here..."
                                                />
                                            </div>

                                            {currentQuestion.type === 'multiple-choice' && (
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Options (Select correct answer)</label>
                                                    {currentQuestion.options?.map((option, index) => (
                                                        <div key={index} className="flex gap-2">
                                                            <Button
                                                                variant={currentQuestion.correctAnswer === index ? "default" : "outline"}
                                                                size="icon"
                                                                onClick={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: index })}
                                                            >
                                                                {String.fromCharCode(65 + index)}
                                                            </Button>
                                                            <Input
                                                                value={option}
                                                                onChange={(e) => {
                                                                    const newOptions = [...currentQuestion.options!];
                                                                    newOptions[index] = e.target.value;
                                                                    setCurrentQuestion({ ...currentQuestion, options: newOptions });
                                                                }}
                                                                placeholder={`Option ${index + 1}`}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {currentQuestion.type === 'true-false' && (
                                                <div className="flex gap-4">
                                                    <Button
                                                        variant={currentQuestion.correctAnswer === 0 ? "default" : "outline"}
                                                        onClick={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: 0 })}
                                                    >
                                                        True
                                                    </Button>
                                                    <Button
                                                        variant={currentQuestion.correctAnswer === 1 ? "default" : "outline"}
                                                        onClick={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: 1 })}
                                                    >
                                                        False
                                                    </Button>
                                                </div>
                                            )}

                                            <div className="flex justify-end">
                                                <Button onClick={handleAddQuestion}>Add Question</Button>
                                            </div>
                                        </div>

                                        {/* Added Questions List */}
                                        <div className="mt-6 space-y-2">
                                            {newQuiz.questions?.map((q, i) => (
                                                <div key={q.id} className="flex items-center justify-between p-3 bg-card border rounded-md">
                                                    <div className="flex items-center gap-3">
                                                        <Badge variant="outline">{i + 1}</Badge>
                                                        <div>
                                                            <p className="font-medium">{q.question}</p>
                                                            <p className="text-xs text-muted-foreground capitalize">{q.type.replace('-', ' ')} • {q.points} pts</p>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveQuestion(q.id)}>
                                                        <X className="w-4 h-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-4">
                                        <Button onClick={handleCreateQuiz} disabled={isSubmitting} className="w-full md:w-auto">
                                            {isSubmitting ? 'Creating...' : 'Create Quiz'}
                                        </Button>
                                        <Button variant="outline" onClick={() => setIsCreating(false)} className="w-full md:w-auto">
                                            Cancel
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Search quizzes..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Quizzes Grid */}
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredQuizzes.map(quiz => (
                                <QuizCard key={quiz.id} quiz={quiz} role="student" />
                            ))}
                        </div>

                        {filteredQuizzes.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">No quizzes found</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
