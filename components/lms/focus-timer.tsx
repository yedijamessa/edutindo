"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Timer, Play, Pause, RotateCcw, X, Minimize2, Maximize2 } from "lucide-react";
import { cn } from "@/components/ui/button";

export function FocusTimer() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'focus' | 'break'>('focus');

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            // Play sound or notification here
            if (mode === 'focus') {
                alert("Focus session complete! Take a break.");
                setMode('break');
                setTimeLeft(5 * 60);
            } else {
                alert("Break over! Ready to focus?");
                setMode('focus');
                setTimeLeft(25 * 60);
            }
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft, mode]);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(mode === 'focus' ? 25 * 60 : 5 * 60);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isOpen) {
        return (
            <Button
                className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-50"
                onClick={() => setIsOpen(true)}
            >
                <Timer className="w-6 h-6" />
            </Button>
        );
    }

    if (isMinimized) {
        return (
            <Card className="fixed bottom-6 right-6 w-48 shadow-lg z-50 border-primary/20">
                <div className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full animate-pulse", isActive ? "bg-green-500" : "bg-yellow-500")} />
                        <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
                    </div>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsMinimized(false)}>
                            <Maximize2 className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
                            <X className="w-3 h-3" />
                        </Button>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Timer className="w-5 h-5 text-primary" />
                        Focus Timer
                    </CardTitle>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setIsMinimized(true)}>
                            <Minimize2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-8 text-center py-8">
                    <div className="space-y-2">
                        <h3 className="text-lg font-medium text-muted-foreground uppercase tracking-widest">
                            {mode === 'focus' ? 'Focus Time' : 'Break Time'}
                        </h3>
                        <div className="text-7xl font-bold font-mono tracking-tighter tabular-nums">
                            {formatTime(timeLeft)}
                        </div>
                    </div>

                    <div className="flex justify-center gap-4">
                        <Button
                            size="lg"
                            className={cn("w-32 h-12 text-lg", isActive ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600")}
                            onClick={toggleTimer}
                        >
                            {isActive ? (
                                <><Pause className="w-5 h-5 mr-2" /> Pause</>
                            ) : (
                                <><Play className="w-5 h-5 mr-2" /> Start</>
                            )}
                        </Button>
                        <Button size="lg" variant="outline" className="w-32 h-12 text-lg" onClick={resetTimer}>
                            <RotateCcw className="w-5 h-5 mr-2" /> Reset
                        </Button>
                    </div>

                    <div className="flex justify-center gap-2">
                        <Button
                            variant={mode === 'focus' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => { setMode('focus'); setTimeLeft(25 * 60); setIsActive(false); }}
                        >
                            Pomodoro (25m)
                        </Button>
                        <Button
                            variant={mode === 'break' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => { setMode('break'); setTimeLeft(5 * 60); setIsActive(false); }}
                        >
                            Short Break (5m)
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
