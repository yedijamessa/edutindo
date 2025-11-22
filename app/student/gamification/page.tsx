"use client"

import { useState } from "react";
import { SidebarNav } from "@/components/lms/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Award, Zap, Target, TrendingUp } from "lucide-react";

export default function StudentGamificationPage() {
    const studentId = 'student-1';
    const studentName = 'Sarah Johnson';

    // Mock gamification data
    const points = 1250;
    const level = 5;
    const nextLevelPoints = 1500;
    const streak = 7;

    const achievements = [
        { id: 1, name: "First Quiz Master", description: "Completed your first quiz", icon: "🏆", unlocked: true },
        { id: 2, name: "Bookworm", description: "Read 5 materials", icon: "📚", unlocked: true },
        { id: 3, name: "Perfect Score", description: "Got 100% on a quiz", icon: "⭐", unlocked: true },
        { id: 4, name: "Week Warrior", description: "7-day learning streak", icon: "🔥", unlocked: true },
        { id: 5, name: "Math Genius", description: "Complete all math materials", icon: "🧮", unlocked: false },
        { id: 6, name: "Science Explorer", description: "Complete all science materials", icon: "🔬", unlocked: false },
    ];

    const leaderboard = [
        { rank: 1, name: "Alex Chen", points: 2100, avatar: "AC" },
        { rank: 2, name: "Maria Garcia", points: 1850, avatar: "MG" },
        { rank: 3, name: "Sarah Johnson", points: 1250, avatar: "SJ", isCurrentUser: true },
        { rank: 4, name: "James Wilson", points: 1100, avatar: "JW" },
        { rank: 5, name: "Emma Davis", points: 950, avatar: "ED" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="flex">
                <aside className="hidden lg:block w-64 border-r bg-card p-6 min-h-screen sticky top-0">
                    <div className="mb-8">
                        <h2 className="text-lg font-bold">Student Portal</h2>
                        <p className="text-sm text-muted-foreground">{studentName}</p>
                    </div>
                    <SidebarNav role="student" />
                </aside>

                <main className="flex-1 p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Gamification 🎮</h1>
                            <p className="text-muted-foreground mt-2">Track your progress and compete with friends!</p>
                        </div>

                        {/* Stats Overview */}
                        <div className="grid gap-4 md:grid-cols-4">
                            <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-none">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                                    <Star className="h-4 w-4" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{points}</div>
                                    <p className="text-xs text-blue-100 mt-1">
                                        {nextLevelPoints - points} to next level
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-none">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Level</CardTitle>
                                    <Trophy className="h-4 w-4" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{level}</div>
                                    <p className="text-xs text-purple-100 mt-1">
                                        Rising Star
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-none">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Streak</CardTitle>
                                    <Zap className="h-4 w-4" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{streak} days</div>
                                    <p className="text-xs text-orange-100 mt-1">
                                        Keep it up! 🔥
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-none">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Achievements</CardTitle>
                                    <Award className="h-4 w-4" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{achievements.filter(a => a.unlocked).length}/{achievements.length}</div>
                                    <p className="text-xs text-green-100 mt-1">
                                        Unlocked
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Progress to Next Level */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="w-5 h-5" />
                                    Level Progress
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Level {level}</span>
                                        <span>Level {level + 1}</span>
                                    </div>
                                    <div className="h-4 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
                                            style={{ width: `${(points / nextLevelPoints) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-sm text-muted-foreground text-center">
                                        {points} / {nextLevelPoints} points
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Two Column Layout */}
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Achievements */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Achievements</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-3">
                                        {achievements.map(achievement => (
                                            <div
                                                key={achievement.id}
                                                className={`flex items-center gap-3 p-3 rounded-lg border ${achievement.unlocked
                                                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800'
                                                        : 'bg-muted/50 opacity-60'
                                                    }`}
                                            >
                                                <div className="text-3xl">{achievement.icon}</div>
                                                <div className="flex-1">
                                                    <p className="font-semibold">{achievement.name}</p>
                                                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                                                </div>
                                                {achievement.unlocked && (
                                                    <Badge className="bg-yellow-500 text-white">Unlocked</Badge>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Leaderboard */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5" />
                                        Leaderboard
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {leaderboard.map(user => (
                                            <div
                                                key={user.rank}
                                                className={`flex items-center gap-3 p-3 rounded-lg ${user.isCurrentUser
                                                        ? 'bg-primary/10 border-2 border-primary'
                                                        : 'bg-muted/50'
                                                    }`}
                                            >
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${user.rank === 1 ? 'bg-yellow-500 text-white' :
                                                        user.rank === 2 ? 'bg-gray-400 text-white' :
                                                            user.rank === 3 ? 'bg-orange-600 text-white' :
                                                                'bg-muted text-foreground'
                                                    }`}>
                                                    {user.rank}
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                                                    {user.avatar}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium">{user.name}</p>
                                                    <p className="text-xs text-muted-foreground">{user.points} points</p>
                                                </div>
                                                {user.rank <= 3 && (
                                                    <div className="text-2xl">
                                                        {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : '🥉'}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
