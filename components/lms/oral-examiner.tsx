"use client"

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, Square, Play, Download, Sparkles } from "lucide-react";

interface OralExamProps {
    question: string;
    expectedAnswer: string;
}

export default function OralExaminer({ question, expectedAnswer }: OralExamProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [hasRecording, setHasRecording] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [feedback, setFeedback] = useState<any>(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startRecording = () => {
        setIsRecording(true);
        setHasRecording(false);
        setFeedback(null);
        setRecordingTime(0);

        timerRef.current = setInterval(() => {
            setRecordingTime(prev => prev + 1);
        }, 1000);
    };

    const stopRecording = () => {
        setIsRecording(false);
        setHasRecording(true);
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    };

    const analyzeRecording = async () => {
        setIsAnalyzing(true);

        // Simulate AI analysis
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock AI feedback
        setFeedback({
            score: 85,
            pronunciation: 90,
            fluency: 82,
            grammar: 88,
            vocabulary: 83,
            suggestions: [
                "Great pronunciation of complex words!",
                "Try to maintain a more consistent pace",
                "Consider using more varied vocabulary",
                "Strong grasp of grammar structures"
            ],
            strengths: ["Clear articulation", "Good pacing", "Confident delivery"],
            improvements: ["Add more examples", "Reduce filler words"]
        });

        setIsAnalyzing(false);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="space-y-6">
            {/* Question Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Question</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-lg">{question}</p>
                </CardContent>
            </Card>

            {/* Recording Controls */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Voice Recorder</span>
                        {isRecording && (
                            <Badge variant="destructive" className="animate-pulse">
                                Recording {formatTime(recordingTime)}
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-center py-12">
                        {!isRecording && !hasRecording && (
                            <Button size="lg" onClick={startRecording} className="h-24 w-24 rounded-full">
                                <Mic className="w-12 h-12" />
                            </Button>
                        )}

                        {isRecording && (
                            <Button size="lg" variant="destructive" onClick={stopRecording} className="h-24 w-24 rounded-full">
                                <Square className="w-12 h-12" />
                            </Button>
                        )}

                        {hasRecording && !isRecording && (
                            <div className="flex gap-4">
                                <Button size="lg" variant="outline" onClick={startRecording} className="h-20 w-20 rounded-full">
                                    <Mic className="w-8 h-8" />
                                </Button>
                                <Button size="lg" onClick={() => {/* Play recording */ }} className="h-20 w-20 rounded-full">
                                    <Play className="w-8 h-8" />
                                </Button>
                            </div>
                        )}
                    </div>

                    {hasRecording && !feedback && (
                        <Button
                            className="w-full"
                            size="lg"
                            onClick={analyzeRecording}
                            disabled={isAnalyzing}
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
                        </Button>
                    )}
                </CardContent>
            </Card>

            {/* AI Feedback */}
            {feedback && (
                <Card className="border-primary">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary" />
                            AI Feedback
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Overall Score */}
                        <div className="text-center">
                            <div className="text-5xl font-bold text-primary">{feedback.score}%</div>
                            <p className="text-muted-foreground mt-2">Overall Score</p>
                        </div>

                        {/* Detailed Scores */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium">Pronunciation</span>
                                    <span className="text-sm">{feedback.pronunciation}%</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all"
                                        style={{ width: `${feedback.pronunciation}%` }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium">Fluency</span>
                                    <span className="text-sm">{feedback.fluency}%</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all"
                                        style={{ width: `${feedback.fluency}%` }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium">Grammar</span>
                                    <span className="text-sm">{feedback.grammar}%</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all"
                                        style={{ width: `${feedback.grammar}%` }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium">Vocabulary</span>
                                    <span className="text-sm">{feedback.vocabulary}%</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all"
                                        style={{ width: `${feedback.vocabulary}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Strengths */}
                        <div>
                            <h4 className="font-semibold mb-2 text-green-600">✨ Strengths</h4>
                            <ul className="space-y-1">
                                {feedback.strengths.map((strength: string, idx: number) => (
                                    <li key={idx} className="text-sm flex items-start gap-2">
                                        <span className="text-green-600">•</span>
                                        <span>{strength}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Areas for Improvement */}
                        <div>
                            <h4 className="font-semibold mb-2 text-amber-600">💡 Areas for Improvement</h4>
                            <ul className="space-y-1">
                                {feedback.improvements.map((improvement: string, idx: number) => (
                                    <li key={idx} className="text-sm flex items-start gap-2">
                                        <span className="text-amber-600">•</span>
                                        <span>{improvement}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Suggestions */}
                        <div>
                            <h4 className="font-semibold mb-2">📝 Suggestions</h4>
                            <ul className="space-y-1">
                                {feedback.suggestions.map((suggestion: string, idx: number) => (
                                    <li key={idx} className="text-sm flex items-start gap-2">
                                        <span>•</span>
                                        <span>{suggestion}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-4 border-t">
                            <Button variant="outline" className="flex-1">
                                <Download className="w-4 h-4 mr-2" />
                                Download Report
                            </Button>
                            <Button onClick={() => { setFeedback(null); setHasRecording(false); }} className="flex-1">
                                Try Again
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
