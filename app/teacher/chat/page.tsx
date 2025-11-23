import { getConversations } from "@/lib/firestore-services";
import { SidebarNav } from "@/components/lms/sidebar-nav";
import ChatClient from "./chat-client";

export default async function TeacherChatPage() {
    const teacherId = 'teacher-1'; // Hardcoded for now
    const conversations = await getConversations(teacherId);

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
                    <ChatClient initialConversations={conversations} currentUserId={teacherId} currentUserName="Dr. Emily Watson" />
                </main>
            </div>
        </div>
    );
}
