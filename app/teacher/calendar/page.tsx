import { SidebarNav } from "@/components/lms/sidebar-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockCalendarEvents } from "@/lib/mock-data";
import { Calendar, Clock, Plus } from "lucide-react";

export default function TeacherCalendarPage() {
    const teacherId = 'teacher-1';
    const events = mockCalendarEvents.filter(e => e.createdBy === teacherId);

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
                    <div className="max-w-5xl mx-auto space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
                                <p className="text-muted-foreground mt-2">Manage your schedule and events</p>
                            </div>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Schedule Event
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {events.map(event => (
                                <Card key={event.id}>
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg">{event.title}</h3>
                                                {event.description && (
                                                    <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                                                )}
                                                <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {new Date(event.startTime).toLocaleDateString()}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm">Edit</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
