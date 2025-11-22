import { SidebarNav } from "@/components/lms/sidebar-nav";
import { MaterialCard } from "@/components/lms/material-card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { mockMaterials, getStudentProgress } from "@/lib/mock-data";
import { Search } from "lucide-react";

export default function StudentMaterialsPage() {
    const studentId = 'student-1';
    const studentProgress = getStudentProgress(studentId);

    const subjects = Array.from(new Set(mockMaterials.map(m => m.subject)));

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
                    <div className="max-w-7xl mx-auto space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Learning Materials</h1>
                            <p className="text-muted-foreground mt-2">Browse and access all your course materials</p>
                        </div>

                        {/* Search and Filter */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search materials..."
                                    className="pl-10"
                                />
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <Badge variant="outline" className="cursor-pointer hover:bg-accent">All</Badge>
                                {subjects.map(subject => (
                                    <Badge key={subject} variant="outline" className="cursor-pointer hover:bg-accent">
                                        {subject}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Materials Grid */}
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {mockMaterials.map(material => {
                                const progress = studentProgress.find(p => p.materialId === material.id);
                                return (
                                    <MaterialCard
                                        key={material.id}
                                        material={material}
                                        progress={progress?.progress}
                                        role="student"
                                    />
                                );
                            })}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
