"use client"

import { useState } from "react";
import { SidebarNav } from "@/components/lms/sidebar-nav";
import { MaterialCard } from "@/components/lms/material-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { mockMaterials } from "@/lib/mock-data";
import { Plus, Search } from "lucide-react";

export default function TeacherMaterialsPage() {
    const [isCreating, setIsCreating] = useState(false);
    const [materials, setMaterials] = useState(mockMaterials);

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
                    <div className="max-w-7xl mx-auto space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Material Management</h1>
                                <p className="text-muted-foreground mt-2">Create and manage your course materials</p>
                            </div>
                            <Button onClick={() => setIsCreating(!isCreating)}>
                                <Plus className="w-4 h-4 mr-2" />
                                New Material
                            </Button>
                        </div>

                        {/* Create Material Form */}
                        {isCreating && (
                            <Card className="border-primary">
                                <CardHeader>
                                    <CardTitle>Create New Material</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <Input placeholder="Material title..." />
                                        <Input placeholder="Subject (e.g., Mathematics)" />
                                    </div>
                                    <Textarea placeholder="Description..." rows={2} />
                                    <Textarea placeholder="Content (supports Markdown)..." rows={8} />
                                    <div className="flex gap-2">
                                        <Button>Publish Material</Button>
                                        <Button variant="outline">Save as Draft</Button>
                                        <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="Search materials..." className="pl-10" />
                        </div>

                        {/* Materials Grid */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold">Your Materials</h2>
                                <Badge>{materials.length}</Badge>
                            </div>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {materials.map(material => (
                                    <MaterialCard
                                        key={material.id}
                                        material={material}
                                        role="teacher"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
