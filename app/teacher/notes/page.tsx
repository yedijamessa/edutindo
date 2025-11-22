"use client"

import { useState } from "react";
import { SidebarNav } from "@/components/lms/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, BookOpen } from "lucide-react";

export default function TeacherNotesPage() {
    const [isCreating, setIsCreating] = useState(false);

    const teacherNotes = [
        {
            id: '1',
            title: 'Lesson Plan - Algebra Basics',
            content: 'Focus on variables and simple equations. Use real-world examples.',
            materialId: 'math-101',
            createdAt: new Date('2024-01-15'),
        },
        {
            id: '2',
            title: 'Student Observation - Sarah',
            content: 'Excellent progress in math. Consider advanced materials.',
            createdAt: new Date('2024-01-18'),
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="flex">
                <aside className="hidden lg:block w-64 border-r bg-card p-6 min-h-screen sticky top-0">
                    <div className="mb-8">
                        <h2 className="text-lg font-bold">Teacher Portal</h2>
                    </div>
                    <SidebarNav role="teacher" />
                </aside>

                <main className="flex-1 p-6 lg:p-8">
                    <div className="max-w-5xl mx-auto space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Teaching Notes</h1>
                                <p className="text-muted-foreground mt-2">Lesson plans and student observations</p>
                            </div>
                            <Button onClick={() => setIsCreating(!isCreating)}>
                                <Plus className="w-4 h-4 mr-2" />
                                New Note
                            </Button>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="Search notes..." className="pl-10" />
                        </div>

                        {isCreating && (
                            <Card className="border-primary">
                                <CardHeader>
                                    <CardTitle>Create New Note</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Input placeholder="Note title..." />
                                    <Textarea placeholder="Write your note here..." rows={6} />
                                    <div className="flex gap-2">
                                        <Button>Save Note</Button>
                                        <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <div className="grid gap-4 md:grid-cols-2">
                            {teacherNotes.map(note => (
                                <Card key={note.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <CardTitle className="text-lg">{note.title}</CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            {note.createdAt.toLocaleDateString()}
                                        </p>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <p className="text-sm">{note.content}</p>
                                        {note.materialId && (
                                            <Badge variant="outline">
                                                <BookOpen className="w-3 h-3 mr-1" />
                                                Linked to material
                                            </Badge>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
