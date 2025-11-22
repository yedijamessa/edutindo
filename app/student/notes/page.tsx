"use client"

import { useState } from "react";
import { SidebarNav } from "@/components/lms/sidebar-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { getStudentNotes } from "@/lib/mock-data";
import { Plus, Search, Tag, Trash2, Edit } from "lucide-react";

export default function StudentNotesPage() {
    const studentId = 'student-1';
    const [notes, setNotes] = useState(getStudentNotes(studentId));
    const [isCreating, setIsCreating] = useState(false);

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
                    <div className="max-w-5xl mx-auto space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">My Notes</h1>
                                <p className="text-muted-foreground mt-2">Organize your study notes and ideas</p>
                            </div>
                            <Button onClick={() => setIsCreating(!isCreating)}>
                                <Plus className="w-4 h-4 mr-2" />
                                New Note
                            </Button>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="Search notes..." className="pl-10" />
                        </div>

                        {/* Create Note Form */}
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

                        {/* Notes Grid */}
                        <div className="grid gap-4 md:grid-cols-2">
                            {notes.map(note => (
                                <Card key={note.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-start justify-between gap-2">
                                            <CardTitle className="text-lg">{note.title}</CardTitle>
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <CardDescription>
                                            {new Date(note.createdAt).toLocaleDateString()}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <p className="text-sm line-clamp-3">{note.content}</p>
                                        {note.tags && note.tags.length > 0 && (
                                            <div className="flex gap-2 flex-wrap">
                                                {note.tags.map(tag => (
                                                    <Badge key={tag} variant="secondary" className="text-xs">
                                                        <Tag className="w-3 h-3 mr-1" />
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {notes.length === 0 && !isCreating && (
                            <Card>
                                <CardContent className="py-12 text-center text-muted-foreground">
                                    <p>No notes yet. Create your first note to get started!</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
