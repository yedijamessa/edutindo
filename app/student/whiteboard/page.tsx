import { SidebarNav } from "@/components/lms/sidebar-nav";
import Whiteboard from "@/components/lms/whiteboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video } from "lucide-react";

export default function WhiteboardPage() {
    const roomId = 'class-101';
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
                            <Video className="w-8 h-8 text-primary" />
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Live Whiteboard</h1>
                                <p className="text-muted-foreground mt-1">Collaborate in real-time with your class</p>
                            </div>
                        </div>

                        <Whiteboard roomId={roomId} userName={userName} />
                    </div>
                </main>
            </div>
        </div>
    );
}
