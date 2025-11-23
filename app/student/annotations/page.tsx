import { SidebarNav } from "@/components/lms/sidebar-nav";
import AnnotationViewer from "@/components/lms/annotation-viewer";
import { FileText } from "lucide-react";

export default function AnnotationPage() {
    const documentId = 'doc-101';
    const userName = 'Sarah Johnson';

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
                        <div className="flex items-center gap-3">
                            <FileText className="w-8 h-8 text-primary" />
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Collaborative Annotation</h1>
                                <p className="text-muted-foreground mt-1">Annotate documents with your peers</p>
                            </div>
                        </div>

                        <AnnotationViewer documentId={documentId} userName={userName} />
                    </div>
                </main>
            </div>
        </div>
    );
}
