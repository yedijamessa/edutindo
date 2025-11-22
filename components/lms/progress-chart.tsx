"use client"

import { Progress } from "@/types/lms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProgressChartProps {
    progressData: Progress[];
    materials: { id: string; title: string; subject: string }[];
}

export function ProgressChart({ progressData, materials }: ProgressChartProps) {
    const overallProgress = progressData.length > 0
        ? Math.round(progressData.reduce((sum, p) => sum + p.progress, 0) / progressData.length)
        : 0;

    const completedCount = progressData.filter(p => p.completed).length;
    const totalMaterials = materials.length;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Overall Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-3xl font-bold">{overallProgress}%</span>
                            <span className="text-muted-foreground">
                                {completedCount} of {totalMaterials} completed
                            </span>
                        </div>
                        <div className="h-4 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
                                style={{ width: `${overallProgress}%` }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Progress by Material</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {materials.map(material => {
                            const progress = progressData.find(p => p.materialId === material.id);
                            const progressValue = progress?.progress || 0;

                            return (
                                <div key={material.id} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">{material.title}</span>
                                        <span className="text-muted-foreground">{progressValue}%</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all"
                                            style={{ width: `${progressValue}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
