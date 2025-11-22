"use client"

import { useState } from "react";
import { SidebarNav } from "@/components/lms/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit, GitBranch, Save } from "lucide-react";

export default function StudentMindmapPage() {
    const studentName = 'Sarah Johnson';

    const [mindmaps, setMindmaps] = useState([
        {
            id: 1,
            title: "Algebra Concepts",
            subject: "Mathematics",
            nodes: 12,
            lastEdited: new Date('2024-01-20'),
        },
        {
            id: 2,
            title: "Scientific Method Steps",
            subject: "Science",
            nodes: 8,
            lastEdited: new Date('2024-01-22'),
        },
    ]);

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
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Mind Maps 🧠</h1>
                                <p className="text-muted-foreground mt-2">Visualize your learning with interactive mind maps</p>
                            </div>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Mind Map
                            </Button>
                        </div>

                        {/* Mind Map Canvas Placeholder */}
                        <Card className="border-2 border-dashed">
                            <CardContent className="p-12">
                                <div className="text-center space-y-4">
                                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                        <GitBranch className="w-10 h-10 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">Interactive Mind Map Editor</h3>
                                        <p className="text-muted-foreground mt-2">
                                            Create visual connections between concepts and ideas
                                        </p>
                                    </div>
                                    <div className="flex gap-4 justify-center">
                                        <Button>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Central Node
                                        </Button>
                                        <Button variant="outline">
                                            <Save className="w-4 h-4 mr-2" />
                                            Save Mind Map
                                        </Button>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        💡 Tip: Click to add nodes, drag to connect ideas, and double-click to edit text
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Saved Mind Maps */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold">Your Mind Maps</h2>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {mindmaps.map(mindmap => (
                                    <Card key={mindmap.id} className="hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                    <CardTitle className="text-lg">{mindmap.title}</CardTitle>
                                                    <Badge variant="secondary" className="mt-2">{mindmap.subject}</Badge>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <GitBranch className="w-4 h-4" />
                                                <span>{mindmap.nodes} nodes</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Last edited: {mindmap.lastEdited.toLocaleDateString()}
                                            </p>
                                            <Button className="w-full" variant="outline">
                                                Open Mind Map
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Features Info */}
                        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
                            <CardHeader>
                                <CardTitle>Mind Map Features</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="space-y-2">
                                        <div className="text-2xl">🎨</div>
                                        <h3 className="font-semibold">Customizable Nodes</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Change colors, shapes, and styles to organize your thoughts
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-2xl">🔗</div>
                                        <h3 className="font-semibold">Smart Connections</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Link related concepts with arrows and labels
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-2xl">💾</div>
                                        <h3 className="font-semibold">Auto-Save</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Your work is automatically saved as you create
                                        </p>
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
