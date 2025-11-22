"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, MapPin, School } from "lucide-react";

interface Booking {
    id: number;
    room: string;
    date: string;
    startTime: string;
    endTime: string;
    purpose: string;
    studentName: string;
    status: 'confirmed' | 'pending' | 'cancelled';
}

export default function ParentBookingPage() {
    const parentName = 'Robert Johnson';
    const studentName = 'Sarah Johnson';

    const [bookings] = useState<Booking[]>([
        {
            id: 1,
            room: "Meeting Room",
            date: "2024-01-28",
            startTime: "14:00",
            endTime: "14:30",
            purpose: "Parent-Teacher Conference",
            studentName: "Sarah Johnson",
            status: 'confirmed',
        },
    ]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="flex">
                <aside className="hidden lg:block w-64 border-r bg-card p-6 min-h-screen sticky top-0">
                    <div className="mb-8">
                        <h2 className="text-lg font-bold">Parent Portal</h2>
                        <p className="text-sm text-muted-foreground">{parentName}</p>
                    </div>
                    <nav className="space-y-1">
                        <a href="/parent" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent">
                            <School className="w-5 h-5" />
                            Dashboard
                        </a>
                        <a href="/parent/booking" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground">
                            <MapPin className="w-5 h-5" />
                            Meetings
                        </a>
                    </nav>
                </aside>

                <main className="flex-1 p-6 lg:p-8">
                    <div className="max-w-5xl mx-auto space-y-8">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Meeting Schedule 🚪</h1>
                            <p className="text-muted-foreground mt-2">View and manage parent-teacher conferences</p>
                        </div>

                        {/* Child Selector */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-lg">
                                        SJ
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold">Viewing schedule for:</h3>
                                        <p className="text-lg font-bold">{studentName}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Scheduled Meetings */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold">Scheduled Meetings</h2>
                            {bookings.length === 0 ? (
                                <Card>
                                    <CardContent className="py-12 text-center text-muted-foreground">
                                        No meetings scheduled yet
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid gap-4">
                                    {bookings.map(booking => (
                                        <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                                            <CardHeader>
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <CardTitle className="text-lg">{booking.purpose}</CardTitle>
                                                        <p className="text-sm text-muted-foreground mt-1">with {booking.studentName}'s teacher</p>
                                                        <Badge
                                                            variant={booking.status === 'confirmed' ? 'default' : booking.status === 'pending' ? 'secondary' : 'destructive'}
                                                            className="mt-2"
                                                        >
                                                            {booking.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Calendar className="w-4 h-4" />
                                                        {new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Clock className="w-4 h-4" />
                                                        {booking.startTime} - {booking.endTime}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <MapPin className="w-4 h-4" />
                                                        {booking.room}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 pt-2">
                                                    <Button variant="outline" size="sm" className="flex-1">Reschedule</Button>
                                                    <Button variant="destructive" size="sm" className="flex-1">Cancel</Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Request Meeting */}
                        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                            <CardHeader>
                                <CardTitle>Need to Schedule a Meeting?</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Contact your child's teacher to schedule a parent-teacher conference.
                                </p>
                                <Button>
                                    Request Meeting
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
