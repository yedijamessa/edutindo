import { notFound } from "next/navigation";
import { SidebarNav } from "@/components/lms/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getMaterialById } from "@/lib/firestore-services";
import { ArrowLeft, FileText, Download, Clock } from "lucide-react";
import Link from "next/link";

export async function generateStaticParams() {
    // For static export, we'll generate params for existing materials
    // In production, you might want to fetch this from Firestore
    return [
        { id: 'math-101' },
        { id: 'science-101' },
        { id: 'english-101' },
    ];
}

export default async function MaterialDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const material = await getMaterialById(id);

    if (!material) {
        notFound();
    }

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
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="flex items-center gap-4">
                            <Link href="/student/materials">
                                <Button variant="outline" size="icon">
                                    <ArrowLeft className="w-4 h-4" />
                                </Button>
                            </Link>
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold">{material.title}</h1>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge>{material.subject}</Badge>
                                    <span className="text-sm text-muted-foreground">
                                        <Clock className="w-3 h-3 inline mr-1" />
                                        {material.createdAt.toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{material.description}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Content</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose dark:prose-invert max-w-none">
                                    <pre className="whitespace-pre-wrap font-sans">{material.content}</pre>
                                </div>
                            </CardContent>
                        </Card>

                        {material.attachments && material.attachments.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Attachments</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {material.attachments.map(attachment => (
                                        <div key={attachment.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-5 h-5 text-muted-foreground" />
                                                <div>
                                                    <p className="font-medium">{attachment.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {(attachment.size / 1000).toFixed(0)} KB
                                                    </p>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm">
                                                <Download className="w-4 h-4 mr-2" />
                                                Download
                                            </Button>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        <div className="flex gap-2">
                            <Button>Mark as Complete</Button>
                            <Button variant="outline">Add Note</Button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
