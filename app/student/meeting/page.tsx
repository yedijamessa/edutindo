import { SidebarNav } from "@/components/lms/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStudentEvents } from "@/lib/mock-data";
import { Video, Calendar, Clock, Users } from "lucide-react";

export default function StudentMeetingPage() {
    const studentId = 'student-1';
    const events = getStudentEvents(studentId);

    const meetings = events.filter(e => e.type === 'class' || e.type === 'meeting');
    const upcomingMeetings = meetings.filter(e => new Date(e.startTime) > new Date());
    const pastMeetings = meetings.filter(e => new Date(e.startTime) <= new Date());

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
                    <div className="max-w-5xl mx-auto space-y-8">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Meeting Room</h1>
                            <p className="text-muted-foreground mt-2">Join your classes and meetings</p>
                        </div>

                        {/* Upcoming Meetings */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold">Upcoming Meetings</h2>
                                <Badge>{upcomingMeetings.length}</Badge>
                            </div>

                            {upcomingMeetings.length === 0 ? (
                                <Card>
                                    <CardContent className="py-12 text-center text-muted-foreground">
                                        <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>No upcoming meetings scheduled</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2">
                                    {upcomingMeetings.map(meeting => (
                                        <Card key={meeting.id} className="hover:shadow-lg transition-shadow">
                                            <CardHeader>
                                                <div className="flex items-start justify-between gap-2">
                                                    <CardTitle className="text-lg">{meeting.title}</CardTitle>
                                                    <Badge variant={meeting.type === 'class' ? 'default' : 'secondary'}>
                                                        {meeting.type}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {meeting.description && (
                                                    <p className="text-sm text-muted-foreground">{meeting.description}</p>
                                                )}

                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Calendar className="w-4 h-4" />
                                                        {new Date(meeting.startTime).toLocaleDateString('en-US', {
                                                            weekday: 'short',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Clock className="w-4 h-4" />
                                                        {new Date(meeting.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        {' - '}
                                                        {new Date(meeting.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Users className="w-4 h-4" />
                                                        {meeting.participants.length} participants
                                                    </div>
                                                </div>

                                                {meeting.meetingLink ? (
                                                    <Button asChild className="w-full">
                                                        <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer">
                                                            <Video className="w-4 h-4 mr-2" />
                                                            Join Meeting
                                                        </a>
                                                    </Button>
                                                ) : (
                                                    <Button className="w-full" disabled>
                                                        <Video className="w-4 h-4 mr-2" />
                                                        Link Not Available
                                                    </Button>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Past Meetings */}
                        {pastMeetings.length > 0 && (
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold">Past Meetings</h2>
                                <div className="space-y-2">
                                    {pastMeetings.map(meeting => (
                                        <Card key={meeting.id} className="opacity-60">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="font-medium">{meeting.title}</h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            {new Date(meeting.startTime).toLocaleDateString()} at{' '}
                                                            {new Date(meeting.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                    <Button variant="outline" size="sm" disabled>
                                                        View Recording
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
