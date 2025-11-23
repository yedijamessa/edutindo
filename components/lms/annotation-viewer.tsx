"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Plus, X, FileText } from "lucide-react";

interface Annotation {
    id: string;
    page: number;
    text: string;
    author: string;
    color: string;
    createdAt: Date;
}

interface AnnotationViewerProps {
    documentId: string;
    userName: string;
}

export default function AnnotationViewer({ documentId, userName }: AnnotationViewerProps) {
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [isAddingAnnotation, setIsAddingAnnotation] = useState(false);
    const [newAnnotation, setNewAnnotation] = useState('');
    const [selectedPage, setSelectedPage] = useState(1);
    const [selectedColor, setSelectedColor] = useState('#FFEB3B');

    const totalPages = 5; // Mock - would come from PDF
    const colors = ['#FFEB3B', '#FF9800', '#4CAF50', '#2196F3', '#9C27B0'];

    const handleAddAnnotation = () => {
        if (!newAnnotation.trim()) return;

        const annotation: Annotation = {
            id: Date.now().toString(),
            page: selectedPage,
            text: newAnnotation,
            author: userName,
            color: selectedColor,
            createdAt: new Date()
        };

        setAnnotations([...annotations, annotation]);
        setNewAnnotation('');
        setIsAddingAnnotation(false);
    };

    const handleDeleteAnnotation = (id: string) => {
        setAnnotations(annotations.filter(a => a.id !== id));
    };

    const pageAnnotations = annotations.filter(a => a.page === selectedPage);

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* PDF Viewer (Mock) */}
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Document Viewer
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedPage(Math.max(1, selectedPage - 1))}
                                    disabled={selectedPage === 1}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm">
                                    Page {selectedPage} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedPage(Math.min(totalPages, selectedPage + 1))}
                                    disabled={selectedPage === totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Mock PDF Display */}
                        <div className="relative bg-white border rounded-lg p-8" style={{ minHeight: '600px' }}>
                            <div className="text-center text-gray-400 py-20">
                                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p>PDF Page {selectedPage}</p>
                                <p className="text-sm">Document content would appear here</p>
                            </div>

                            {/* Annotation Markers */}
                            {pageAnnotations.map((annotation, index) => (
                                <div
                                    key={annotation.id}
                                    className="absolute rounded-full w-8 h-8 flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:scale-110 transition-transform"
                                    style={{
                                        backgroundColor: annotation.color,
                                        top: `${20 + index * 15}%`,
                                        right: '20px'
                                    }}
                                    title={annotation.text}
                                >
                                    {index + 1}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Annotations Panel */}
            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="w-5 h-5" />
                                Annotations
                            </CardTitle>
                            <Button size="sm" onClick={() => setIsAddingAnnotation(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Add Annotation Form */}
                        {isAddingAnnotation && (
                            <Card className="border-primary">
                                <CardContent className="p-4 space-y-3">
                                    <div className="flex gap-2">
                                        {colors.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setSelectedColor(color)}
                                                className={`w-8 h-8 rounded-full border-2 ${selectedColor === color ? 'border-primary scale-110' : 'border-gray-300'
                                                    } transition-all`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                    <Textarea
                                        placeholder="Write your annotation..."
                                        value={newAnnotation}
                                        onChange={(e) => setNewAnnotation(e.target.value)}
                                        rows={3}
                                    />
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={handleAddAnnotation}>Add</Button>
                                        <Button size="sm" variant="outline" onClick={() => setIsAddingAnnotation(false)}>
                                            Cancel
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Annotations List */}
                        <div className="space-y-3">
                            {pageAnnotations.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    No annotations on this page
                                </p>
                            ) : (
                                pageAnnotations.map((annotation, index) => (
                                    <Card key={annotation.id}>
                                        <CardContent className="p-3">
                                            <div className="flex items-start gap-2">
                                                <div
                                                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                                    style={{ backgroundColor: annotation.color }}
                                                >
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm">{annotation.text}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {annotation.author}
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 flex-shrink-0"
                                                    onClick={() => handleDeleteAnnotation(annotation.id)}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>

                        {/* Summary */}
                        <div className="pt-4 border-t">
                            <p className="text-sm text-muted-foreground">
                                Total annotations: <Badge variant="secondary">{annotations.length}</Badge>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
