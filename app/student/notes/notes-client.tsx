"use client"

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Note } from "@/types/lms";
import { createNote, updateNote, deleteNote } from "@/lib/firestore-services";
import { Plus, Search, Tag, Trash2, Edit, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface NotesClientProps {
    initialNotes: Note[];
    studentId: string;
}

export default function NotesClient({ initialNotes, studentId }: NotesClientProps) {
    const router = useRouter();
    const [notes, setNotes] = useState(initialNotes);
    const [isCreating, setIsCreating] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [newNote, setNewNote] = useState({ title: '', content: '', tags: '' });

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateNote = async () => {
        if (!newNote.title || !newNote.content) {
            alert('Please fill in both title and content');
            return;
        }

        try {
            await createNote({
                title: newNote.title,
                content: newNote.content,
                createdBy: studentId,
                tags: newNote.tags ? newNote.tags.split(',').map(t => t.trim()) : []
            });

            setNewNote({ title: '', content: '', tags: '' });
            setIsCreating(false);
            router.refresh();
        } catch (error) {
            console.error('Failed to create note:', error);
            alert('Failed to create note');
        }
    };

    const handleUpdateNote = async () => {
        if (!editingNote) return;

        try {
            await updateNote(editingNote.id, {
                title: editingNote.title,
                content: editingNote.content,
                tags: editingNote.tags
            });

            setEditingNote(null);
            router.refresh();
        } catch (error) {
            console.error('Failed to update note:', error);
            alert('Failed to update note');
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        if (!confirm('Delete this note?')) return;

        try {
            await deleteNote(noteId);
            setNotes(notes.filter(n => n.id !== noteId));
        } catch (error) {
            console.error('Failed to delete note:', error);
            alert('Failed to delete note');
        }
    };

    return (
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
                <Input
                    placeholder="Search notes..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Create Note Form */}
            {isCreating && (
                <Card className="border-primary">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Create New Note</CardTitle>
                            <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            placeholder="Note title..."
                            value={newNote.title}
                            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                        />
                        <Textarea
                            placeholder="Write your note here..."
                            rows={6}
                            value={newNote.content}
                            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                        />
                        <Input
                            placeholder="Tags (comma separated)..."
                            value={newNote.tags}
                            onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
                        />
                        <div className="flex gap-2">
                            <Button onClick={handleCreateNote}>Save Note</Button>
                            <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Edit Note Modal */}
            {editingNote && (
                <Card className="border-primary">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Edit Note</CardTitle>
                            <Button variant="ghost" size="icon" onClick={() => setEditingNote(null)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            placeholder="Note title..."
                            value={editingNote.title}
                            onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                        />
                        <Textarea
                            placeholder="Write your note here..."
                            rows={6}
                            value={editingNote.content}
                            onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                        />
                        <Input
                            placeholder="Tags (comma separated)..."
                            value={editingNote.tags?.join(', ') || ''}
                            onChange={(e) => setEditingNote({
                                ...editingNote,
                                tags: e.target.value.split(',').map(t => t.trim())
                            })}
                        />
                        <div className="flex gap-2">
                            <Button onClick={handleUpdateNote}>Update Note</Button>
                            <Button variant="outline" onClick={() => setEditingNote(null)}>Cancel</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Notes Grid */}
            <div className="grid gap-4 md:grid-cols-2">
                {filteredNotes.map(note => (
                    <Card key={note.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-start justify-between gap-2">
                                <CardTitle className="text-lg">{note.title}</CardTitle>
                                <div className="flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => setEditingNote(note)}
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive"
                                        onClick={() => handleDeleteNote(note.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                            <CardDescription>
                                {new Date(note.createdAt).toLocaleDateString()}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm line-clamp-3 whitespace-pre-wrap">{note.content}</p>
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

            {filteredNotes.length === 0 && !isCreating && (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <p>No notes yet. Create your first note to get started!</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
