import { SidebarNav } from "@/components/lms/sidebar-nav";
import { getTutoringOffers, getTutoringRequests } from "@/lib/firestore-services";
import TutoringClient from "./tutoring-client";

export default async function TutoringPage() {
    const studentId = 'student-1';
    const studentName = 'Sarah Johnson';

    const [offers, requests] = await Promise.all([
        getTutoringOffers(),
        getTutoringRequests()
    ]);

    // Serialize dates to ISO strings for client component
    const serializedOffers = offers.map(offer => ({
        ...offer,
        createdAt: offer.createdAt.toISOString()
    }));

    const serializedRequests = requests.map(request => ({
        ...request,
        createdAt: request.createdAt.toISOString()
    }));

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
                    <TutoringClient
                        initialOffers={serializedOffers}
                        initialRequests={serializedRequests}
                        studentId={studentId}
                        studentName={studentName}
                    />
                </main>
            </div>
        </div>
    );
}
