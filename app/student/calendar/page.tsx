import { SidebarNav } from "@/components/lms/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getStudentEvents } from "@/lib/mock-data";
import { Calendar as CalendarIcon, Clock, Video, MapPin } from "lucide-react";

export default function StudentCalendarPage() {
    const studentId = 'student-1';
    const events = getStudentEvents(studentId);

    const upcomingEvents = events.filter(e => new Date(e.startTime) > new Date());
    const pastEvents = events.filter(e => new Date(e.startTime) <= new Date());

    const getEventColor = (type: string) => {
        switch (type) {
            case 'class': return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
            case 'meeting': return 'border-l-green-500 bg-green-50 dark:bg-green-900/20';
            case 'deadline': return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
            default: return 'border-l-purple-500 bg-purple-50 dark:bg-purple-900/20';
        }
    };

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
                            <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
                            <p className="text-muted-foreground mt-2">View your schedule and upcoming events</p>
                        </div>

                        {/* Upcoming Events */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold">Upcoming Events</h2>
                                <Badge>{upcomingEvents.length}</Badge>
                            </div>

                            {upcomingEvents.length === 0 ? (
                                <Card>
                                    <CardContent className="py-12 text-center text-muted-foreground">
                                        No upcoming events scheduled
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-3">
                                    {upcomingEvents.map(event => (
                                        <Card key={event.id} className={`border-l-4 ${getEventColor(event.type)}`}>
                                            <CardContent className="p-6">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1 space-y-3">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <h3 className="font-semibold text-lg">{event.title}</h3>
                                                                <Badge variant="outline">{event.type}</Badge>
                                                            </div>
                                                            {event.description && (
                                                                <p className="text-sm text-muted-foreground">{event.description}</p>
                                                            )}
                                                        </div>

                                                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <CalendarIcon className="w-4 h-4" />
                                                                {new Date(event.startTime).toLocaleDateString('en-US', {
                                                                    weekday: 'long',
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric'
                                                                })}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-4 h-4" />
                                                                {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                {' - '}
                                                                {new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {event.meetingLink && (
                                                        <Button asChild>
                                                            <a href={event.meetingLink} target="_blank" rel="noopener noreferrer">
                                                                <Video className="w-4 h-4 mr-2" />
                                                                Join
                                                            </a>
                                                        </Button>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Past Events */}
                        {pastEvents.length > 0 && (
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold">Past Events</h2>
                                <div className="space-y-3">
                                    {pastEvents.map(event => (
                                        <Card key={event.id} className="opacity-60">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="font-medium">{event.title}</h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            {new Date(event.startTime).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <Badge variant="outline">{event.type}</Badge>
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
