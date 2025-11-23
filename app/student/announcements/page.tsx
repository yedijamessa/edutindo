import { SidebarNav } from "@/components/lms/sidebar-nav";
import { getAnnouncements } from "@/lib/firestore-services";
import AnnouncementsClient from "./announcements-client";

export default async function AnnouncementsPage() {
    const announcements = await getAnnouncements('student');

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
                    <AnnouncementsClient announcements={announcements} />
                </main>
            </div>
        </div>
    );
}
