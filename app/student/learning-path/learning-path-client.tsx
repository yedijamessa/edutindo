"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Material } from "@/types/lms";
import { GitBranch, Lock, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface LearningPathClientProps {
    unlockedMaterials: Material[];
    lockedMaterials: Material[];
}

export default function LearningPathClient({ unlockedMaterials, lockedMaterials }: LearningPathClientProps) {
    const [filter, setFilter] = useState<string>('all');

    const subjects = Array.from(new Set([...unlockedMaterials, ...lockedMaterials].map(m => m.subject)));

    const filteredUnlocked = filter === 'all'
        ? unlockedMaterials
        : unlockedMaterials.filter(m => m.subject === filter);

    const filteredLocked = filter === 'all'
        ? lockedMaterials
        : lockedMaterials.filter(m => m.subject === filter);

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <GitBranch className="w-8 h-8 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Learning Path</h1>
                    <p className="text-muted-foreground mt-1">Progress through courses by completing prerequisites</p>
                </div>
            </div>

            {/* Subject Filter */}
            <div className="flex gap-2 flex-wrap">
                <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilter('all')}
                >
                    All Subjects
                </Button>
                {subjects.map(subject => (
                    <Button
                        key={subject}
                        variant={filter === subject ? 'default' : 'outline'}
                        onClick={() => setFilter(subject)}
                    >
                        {subject}
                    </Button>
                ))}
            </div>

            {/* Progress Stats */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-3xl font-bold">{unlockedMaterials.length}</div>
                            <p className="text-sm text-muted-foreground">Unlocked Courses</p>
                        </div>
                        <div>
                            <div className="text-3xl font-bold">{lockedMaterials.length}</div>
                            <p className="text-sm text-muted-foreground">Locked Courses</p>
                        </div>
                        <div>
                            <div className="text-3xl font-bold">
                                {Math.round((unlockedMaterials.length / (unlockedMaterials.length + lockedMaterials.length)) * 100)}%
                            </div>
                            <p className="text-sm text-muted-foreground">Progress</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Unlocked Materials */}
            {filteredUnlocked.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <h2 className="text-2xl font-bold">Unlocked Courses</h2>
                        <Badge variant="secondary">{filteredUnlocked.length}</Badge>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {filteredUnlocked.map(material => (
                            <Card key={material.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <Badge variant="outline" className="mb-2">{material.subject}</Badge>
                                            <CardTitle className="text-lg">{material.title}</CardTitle>
                                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                                {material.description}
                                            </p>
                                        </div>
                                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 ml-2" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Link href={`/student/materials/${material.id}`}>
                                        <Button className="w-full">
                                            Continue Learning
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Locked Materials */}
            {filteredLocked.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-muted-foreground" />
                        <h2 className="text-2xl font-bold">Locked Courses</h2>
                        <Badge variant="secondary">{filteredLocked.length}</Badge>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {filteredLocked.map(material => (
                            <Card key={material.id} className="opacity-75 border-l-4 border-l-gray-300">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <Badge variant="outline" className="mb-2">{material.subject}</Badge>
                                            <CardTitle className="text-lg">{material.title}</CardTitle>
                                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                                {material.description}
                                            </p>
                                        </div>
                                        <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0 ml-2" />
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {material.prerequisites && material.prerequisites.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium">Prerequisites:</p>
                                            {material.prerequisites.map((prereq, index) => (
                                                <div key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <ArrowRight className="w-3 h-3" />
                                                    Complete quiz with {prereq.requiredQuizScore}% or higher
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <Button className="w-full" disabled>
                                        <Lock className="w-4 h-4 mr-2" />
                                        Locked
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {filteredUnlocked.length === 0 && filteredLocked.length === 0 && (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        No courses found for this subject
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
