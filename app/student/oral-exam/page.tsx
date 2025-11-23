import { SidebarNav } from "@/components/lms/sidebar-nav";
import OralExaminer from "@/components/lms/oral-examiner";
import { Mic } from "lucide-react";

export default function OralExamPage() {
    const question = "Explain the concept of photosynthesis and its importance to life on Earth.";
    const expectedAnswer = "Photosynthesis is the process by which plants convert sunlight into energy...";

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
                        <div className="flex items-center gap-3">
                            <Mic className="w-8 h-8 text-primary" />
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">AI Oral Examiner</h1>
                                <p className="text-muted-foreground mt-1">Practice speaking with AI feedback</p>
                            </div>
                        </div>

                        <OralExaminer question={question} expectedAnswer={expectedAnswer} />
                    </div>
                </main>
            </div>
        </div>
    );
}
