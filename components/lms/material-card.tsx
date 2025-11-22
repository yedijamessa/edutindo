import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Material } from "@/types/lms";
import { BookOpen, Clock, FileText } from "lucide-react";
import Link from "next/link";

interface MaterialCardProps {
    material: Material;
    progress?: number;
    role?: 'student' | 'teacher';
    href?: string;
}

export function MaterialCard({ material, progress, role = 'student', href }: MaterialCardProps) {
    const cardHref = href || `/${role}/materials/${material.id}`;

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-1">{material.title}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                            {material.description}
                        </CardDescription>
                    </div>
                    <Badge variant="secondary">{material.subject}</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{material.attachments?.length || 0} files</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(material.updatedAt).toLocaleDateString()}</span>
                    </div>
                </div>

                {progress !== undefined && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{progress}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                <Button asChild className="w-full">
                    <Link href={cardHref}>
                        <FileText className="w-4 h-4 mr-2" />
                        {role === 'teacher' ? 'Manage' : 'View'} Material
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
