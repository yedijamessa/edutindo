"use client"

import { useState } from "react";
import { SidebarNav } from "@/components/lms/sidebar-nav";
import { MaterialCard } from "@/components/lms/material-card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Material } from "@/types/lms";
import { Search, Plus, FileText, Video, Link as LinkIcon, File, X } from "lucide-react";
import { createMaterial } from "@/lib/firestore-services";
import { useRouter } from "next/navigation";

type MaterialType = 'pdf' | 'video' | 'document' | 'link';

interface MaterialsClientProps {
    materials: Material[];
}

export default function MaterialsClient({ materials }: MaterialsClientProps) {
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [newMaterial, setNewMaterial] = useState({
        title: '',
        subject: '',
        description: '',
        type: 'pdf' as MaterialType,
        url: '',
        file: null as File | null
    });

    const subjects = Array.from(new Set(materials.map(m => m.subject)));

    const materialTypes = [
        { value: 'pdf', label: 'PDF Document', icon: FileText },
        { value: 'video', label: 'Video', icon: Video },
        { value: 'document', label: 'Document', icon: File },
        { value: 'link', label: 'External Link', icon: LinkIcon },
    ];

    const handleCreateMaterial = async () => {
        if (!newMaterial.title || !newMaterial.subject || !newMaterial.description) {
            alert('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            await createMaterial({
                title: newMaterial.title,
                subject: newMaterial.subject,
                description: newMaterial.description,
                content: '',
                type: newMaterial.type,
                url: newMaterial.url,
                attachments: [],
                createdBy: 'student-1',
                published: true,
            });

            alert('Material created successfully! 📚');
            setIsCreating(false);
            setNewMaterial({
                title: '',
                subject: '',
                description: '',
                type: 'pdf',
                url: '',
                file: null
            });

            // Refresh the page to show new material
            router.refresh();
        } catch (error) {
            console.error('Error creating material:', error);
            alert('Failed to create material. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter materials based on search
    const filteredMaterials = materials.filter(material =>
        material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.description.toLowerCase().includes(searchQuery.toLowerCase())
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
                                <h1 className="text-3xl font-bold tracking-tight">Learning Materials</h1>
                                <p className="text-muted-foreground mt-2">Browse and access your course materials</p>
                            </div>
                            <Button onClick={() => setIsCreating(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Material
                            </Button>
                        </div>

                        {/* Create Material Form */}
                        {isCreating && (
                            <Card className="border-primary">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Add New Material</CardTitle>
                                        <Button variant="ghost" size="icon" onClick={() => setIsCreating(false)}>
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Title</label>
                                            <Input
                                                placeholder="e.g., Introduction to Calculus"
                                                value={newMaterial.title}
                                                onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Subject</label>
                                            <Input
                                                placeholder="e.g., Mathematics"
                                                value={newMaterial.subject}
                                                onChange={(e) => setNewMaterial({ ...newMaterial, subject: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Description</label>
                                        <Textarea
                                            placeholder="Brief description of the material..."
                                            value={newMaterial.description}
                                            onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                                            rows={3}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Material Type</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                            {materialTypes.map(type => {
                                                const Icon = type.icon;
                                                return (
                                                    <Button
                                                        key={type.value}
                                                        variant={newMaterial.type === type.value ? 'default' : 'outline'}
                                                        onClick={() => setNewMaterial({ ...newMaterial, type: type.value as MaterialType })}
                                                        className="h-auto py-3 flex-col gap-2"
                                                    >
                                                        <Icon className="w-5 h-5" />
                                                        <span className="text-xs">{type.label}</span>
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {newMaterial.type === 'link' ? (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">URL</label>
                                            <Input
                                                type="url"
                                                placeholder="https://example.com"
                                                value={newMaterial.url}
                                                onChange={(e) => setNewMaterial({ ...newMaterial, url: e.target.value })}
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Upload File</label>
                                            <Input
                                                type="file"
                                                accept={
                                                    newMaterial.type === 'pdf' ? '.pdf' :
                                                        newMaterial.type === 'video' ? 'video/*' :
                                                            '.doc,.docx,.txt'
                                                }
                                                onChange={(e) => setNewMaterial({ ...newMaterial, file: e.target.files?.[0] || null })}
                                            />
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <Button onClick={handleCreateMaterial} disabled={isSubmitting}>
                                            {isSubmitting ? 'Creating...' : 'Create Material'}
                                        </Button>
                                        <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Search and Filter */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input
                                    placeholder="Search materials..."
                                    className="pl-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {subjects.map(subject => (
                                    <Badge key={subject} variant="secondary" className="cursor-pointer">
                                        {subject}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Materials Grid */}
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredMaterials.map(material => (
                                <MaterialCard key={material.id} material={material} role="student" />
                            ))}
                        </div>

                        {filteredMaterials.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">No materials found</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
