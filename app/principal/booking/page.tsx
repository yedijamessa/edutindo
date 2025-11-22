"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, MapPin, Plus, X, School } from "lucide-react";

interface Booking {
    id: number;
    room: string;
    date: string;
    startTime: string;
    endTime: string;
    purpose: string;
    attendees: number;
    status: 'confirmed' | 'pending' | 'cancelled';
}

export default function PrincipalBookingPage() {
    const principalName = 'Principal Admin';
    const [showBookingForm, setShowBookingForm] = useState(false);

    const [bookings, setBookings] = useState<Booking[]>([
        {
            id: 1,
            room: "Conference Room",
            date: "2024-01-26",
            startTime: "10:00",
            endTime: "12:00",
            purpose: "Staff Meeting - Curriculum Review",
            attendees: 15,
            status: 'confirmed',
        },
        {
            id: 2,
            room: "Meeting Room",
            date: "2024-01-29",
            startTime: "14:00",
            endTime: "16:00",
            purpose: "Partnership Discussion - Edutindo",
            attendees: 6,
            status: 'pending',
        },
    ]);

    const availableRooms = [
        { id: 1, name: "Conference Room", capacity: 30, facilities: ["Projector", "Video Conference", "Whiteboard"] },
        { id: 2, name: "Meeting Room", capacity: 12, facilities: ["Video Conference", "Whiteboard"] },
        { id: 3, name: "Study Room A", capacity: 6, facilities: ["Whiteboard", "WiFi"] },
        { id: 4, name: "Study Room B", capacity: 8, facilities: ["Projector", "WiFi"] },
        { id: 5, name: "Computer Lab 1", capacity: 20, facilities: ["Computers", "Projector"] },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="flex">
                <aside className="hidden lg:block w-64 border-r bg-card p-6 min-h-screen sticky top-0">
                    <div className="mb-8">
                        <h2 className="text-lg font-bold">Principal Portal</h2>
                        <p className="text-sm text-muted-foreground">{principalName}</p>
                    </div>
                    <nav className="space-y-1">
                        <a href="/principal" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent">
                            <School className="w-5 h-5" />
                            Dashboard
                        </a>
                        <a href="/principal/booking" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground">
                            <MapPin className="w-5 h-5" />
                            Book Room
                        </a>
                    </nav>
                </aside>

                <main className="flex-1 p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto space-y-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Facility Booking 🚪</h1>
                                <p className="text-muted-foreground mt-2">Manage school facility reservations</p>
                            </div>
                            <Button onClick={() => setShowBookingForm(!showBookingForm)}>
                                {showBookingForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                                {showBookingForm ? 'Cancel' : 'New Booking'}
                            </Button>
                        </div>

                        {/* Booking Form */}
                        {showBookingForm && (
                            <Card className="border-primary">
                                <CardHeader>
                                    <CardTitle>Create New Booking</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Room</label>
                                            <select className="w-full px-3 py-2 border rounded-lg bg-background">
                                                <option>Select a room...</option>
                                                {availableRooms.map(room => (
                                                    <option key={room.id} value={room.id}>
                                                        {room.name} (Capacity: {room.capacity})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Date</label>
                                            <Input type="date" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Start Time</label>
                                            <Input type="time" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">End Time</label>
                                            <Input type="time" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Purpose</label>
                                            <Input placeholder="e.g., Staff meeting, Partnership discussion..." />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Expected Attendees</label>
                                            <Input type="number" min="1" placeholder="Number of attendees" />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button>Submit Booking</Button>
                                        <Button variant="outline" onClick={() => setShowBookingForm(false)}>Cancel</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* My Bookings */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold">Scheduled Bookings</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                {bookings.map(booking => (
                                    <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <CardTitle className="text-lg">{booking.room}</CardTitle>
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
                                                    <Users className="w-4 h-4" />
                                                    {booking.attendees} attendees
                                                </div>
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <MapPin className="w-4 h-4" />
                                                    {booking.purpose}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 pt-2">
                                                <Button variant="outline" size="sm" className="flex-1">Edit</Button>
                                                <Button variant="destructive" size="sm" className="flex-1">Cancel</Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Available Rooms */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold">Available Facilities</h2>
                            <div className="grid gap-4 md:grid-cols-3">
                                {availableRooms.map(room => (
                                    <Card key={room.id}>
                                        <CardHeader>
                                            <CardTitle className="text-lg">{room.name}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Users className="w-4 h-4" />
                                                <span>Capacity: {room.capacity} people</span>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">Facilities:</p>
                                                <div className="flex gap-2 flex-wrap">
                                                    {room.facilities.map((facility, index) => (
                                                        <Badge key={index} variant="outline" className="text-xs">
                                                            {facility}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                            <Button variant="outline" className="w-full" onClick={() => setShowBookingForm(true)}>
                                                Book This Room
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
