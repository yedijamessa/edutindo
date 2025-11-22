import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Quiz } from "@/types/lms";
import { Clock, HelpCircle, Award } from "lucide-react";
import Link from "next/link";

interface QuizCardProps {
    quiz: Quiz;
    score?: number;
    attempts?: number;
    role?: 'student' | 'teacher';
}

export function QuizCard({ quiz, score, attempts = 0, role = 'student' }: QuizCardProps) {
    const passed = score !== undefined && score >= quiz.passingScore;

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-1">{quiz.title}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                            {quiz.description}
                        </CardDescription>
                    </div>
                    {score !== undefined && (
                        <Badge variant={passed ? "default" : "destructive"}>
                            {score}%
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <HelpCircle className="w-4 h-4" />
                        <span>{quiz.questions.length} questions</span>
                    </div>
                    {quiz.timeLimit && (
                        <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{quiz.timeLimit} min</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        <span>{quiz.passingScore}% to pass</span>
                    </div>
                </div>

                {attempts > 0 && (
                    <p className="text-sm text-muted-foreground">
                        Attempts: {attempts}
                    </p>
                )}

                <Button asChild className="w-full" variant={score !== undefined ? "outline" : "default"}>
                    <Link href={`/${role}/quizzes/${quiz.id}`}>
                        {score !== undefined ? 'Review Quiz' : 'Start Quiz'}
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
