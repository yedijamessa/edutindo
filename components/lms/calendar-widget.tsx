"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video } from "lucide-react";
import Link from "next/link";

interface CalendarEvent {
    id: string;
    title: string;
    description?: string; // Optional
    startTime: string | Date; // ISO string from server
    endTime: string | Date;   // ISO string from server
    type: string;
    location?: string;
    participants: string[];
    meetingLink?: string; // Optional
    createdBy?: string; // Optional
}

interface CalendarWidgetProps {
    events: CalendarEvent[];
}

const formatDate = (isoString: string | Date) => {
    return new Intl.DateTimeFormat('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(new Date(isoString));
};

const formatTime = (isoString: string | Date) => {
    return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC',
    }).format(new Date(isoString));
};

export function CalendarWidget({ events }: CalendarWidgetProps) {
    const today = new Date();
    const upcomingEvents = events
        .filter(e => new Date(e.startTime) > today)
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        .slice(0, 5);

    const getEventColor = (type: CalendarEvent['type']) => {
        switch (type) {
            case 'class': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'meeting': return 'bg-green-100 text-green-700 border-green-200';
            case 'deadline': return 'bg-red-100 text-red-700 border-red-200';
            case 'event': return 'bg-purple-100 text-purple-700 border-purple-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Upcoming Events
                    </CardTitle>
                    <Button asChild variant="ghost" size="sm">
                        <Link href="/student/calendar">View All</Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {upcomingEvents.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No upcoming events</p>
                ) : (
                    <div className="space-y-3">
                        {upcomingEvents.map(event => (
                            <div
                                key={event.id}
                                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                            >
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium text-sm">{event.title}</h4>
                                        <Badge className={getEventColor(event.type)} variant="outline">
                                            {event.type}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {formatDate(event.startTime)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatTime(event.startTime)}
                                        </span>
                                    </div>
                                </div>
                                {event.meetingLink && (
                                    <Button asChild size="sm" variant="outline">
                                        <a href={event.meetingLink} target="_blank" rel="noopener noreferrer">
                                            <Video className="w-4 h-4" />
                                        </a>
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
