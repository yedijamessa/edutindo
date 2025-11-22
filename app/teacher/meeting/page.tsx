import { SidebarNav } from "@/components/lms/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockCalendarEvents } from "@/lib/mock-data";
import { Video, Calendar, Clock, Users, Plus } from "lucide-react";

export default function TeacherMeetingPage() {
    const teacherId = 'teacher-1';
    const meetings = mockCalendarEvents.filter(e =>
        e.createdBy === teacherId && (e.type === 'class' || e.type === 'meeting')
    );

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
                                <h1 className="text-3xl font-bold tracking-tight">Meeting Room</h1>
                                <p className="text-muted-foreground mt-2">Manage your classes and meetings</p>
                            </div>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Schedule Meeting
                            </Button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {meetings.map(meeting => (
                                <Card key={meeting.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-start justify-between gap-2">
                                            <CardTitle className="text-lg">{meeting.title}</CardTitle>
                                            <Badge>{meeting.type}</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {meeting.description && (
                                            <p className="text-sm text-muted-foreground">{meeting.description}</p>
                                        )}

                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(meeting.startTime).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Clock className="w-4 h-4" />
                                                {new Date(meeting.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Users className="w-4 h-4" />
                                                {meeting.participants.length} participants
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            {meeting.meetingLink ? (
                                                <Button asChild className="flex-1">
                                                    <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer">
                                                        <Video className="w-4 h-4 mr-2" />
                                                        Start Meeting
                                                    </a>
                                                </Button>
                                            ) : (
                                                <Button className="flex-1" disabled>
                                                    <Video className="w-4 h-4 mr-2" />
                                                    No Link
                                                </Button>
                                            )}
                                            <Button variant="outline">Edit</Button>
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
