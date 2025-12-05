"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Users, Star, Clock, Plus, X } from "lucide-react";

interface TutoringOffer {
    id: string;
    tutorId: string;
    tutorName: string;
    subject: string;
    description: string;
    rating: number;
    totalSessions: number;
    hourlyRate?: number;
    availability: string[];
    active: boolean;
    createdAt: string; // ISO string
}

interface TutoringRequest {
    id: string;
    studentId: string;
    studentName: string;
    subject: string;
    description: string;
    preferredTimes: string[];
    status: 'open' | 'matched' | 'completed' | 'cancelled';
    createdAt: string; // ISO string
}
import { createTutoringOffer, createTutoringRequest } from "@/lib/firestore-services";
import { useRouter } from "next/navigation";

interface TutoringClientProps {
    initialOffers: TutoringOffer[];
    initialRequests: TutoringRequest[];
    studentId: string;
    studentName: string;
}

export default function TutoringClient({ initialOffers, initialRequests, studentId, studentName }: TutoringClientProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'find' | 'offer' | 'requests'>('find');
    const [isCreatingOffer, setIsCreatingOffer] = useState(false);
    const [isCreatingRequest, setIsCreatingRequest] = useState(false);

    const [newOffer, setNewOffer] = useState({
        subject: '',
        description: '',
        availability: '',
        hourlyRate: 0
    });

    const [newRequest, setNewRequest] = useState({
        subject: '',
        description: '',
        preferredTimes: ''
    });

    const handleCreateOffer = async () => {
        if (!newOffer.subject || !newOffer.description) {
            alert('Please fill in subject and description');
            return;
        }

        try {
            await createTutoringOffer({
                tutorId: studentId,
                tutorName: studentName,
                subject: newOffer.subject,
                description: newOffer.description,
                availability: newOffer.availability.split(',').map(t => t.trim()),
                hourlyRate: newOffer.hourlyRate,
                active: true
            });

            setNewOffer({ subject: '', description: '', availability: '', hourlyRate: 0 });
            setIsCreatingOffer(false);
            router.refresh();
        } catch (error) {
            console.error('Failed to create offer:', error);
            alert('Failed to create offer');
        }
    };

    const handleCreateRequest = async () => {
        if (!newRequest.subject || !newRequest.description) {
            alert('Please fill in subject and description');
            return;
        }

        try {
            await createTutoringRequest({
                studentId,
                studentName,
                subject: newRequest.subject,
                description: newRequest.description,
                preferredTimes: newRequest.preferredTimes.split(',').map(t => t.trim())
            });

            setNewRequest({ subject: '', description: '', preferredTimes: '' });
            setIsCreatingRequest(false);
            router.refresh();
        } catch (error) {
            console.error('Failed to create request:', error);
            alert('Failed to create request');
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Peer Tutoring</h1>
                    <p className="text-muted-foreground mt-1">Find help or offer your expertise</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b">
                <button
                    onClick={() => setActiveTab('find')}
                    className={`px-4 py-2 border-b-2 transition-colors ${activeTab === 'find'
                        ? 'border-primary text-primary font-medium'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                >
                    Find a Tutor
                </button>
                <button
                    onClick={() => setActiveTab('offer')}
                    className={`px-4 py-2 border-b-2 transition-colors ${activeTab === 'offer'
                        ? 'border-primary text-primary font-medium'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                >
                    Offer Tutoring
                </button>
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`px-4 py-2 border-b-2 transition-colors ${activeTab === 'requests'
                        ? 'border-primary text-primary font-medium'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                >
                    Help Requests
                </button>
            </div>

            {/* Find Tutors Tab */}
            {activeTab === 'find' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Available Tutors</h2>
                        <Button onClick={() => setIsCreatingRequest(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Request Help
                        </Button>
                    </div>

                    {isCreatingRequest && (
                        <Card className="border-primary">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Request Tutoring Help</CardTitle>
                                    <Button variant="ghost" size="icon" onClick={() => setIsCreatingRequest(false)}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Input
                                    placeholder="Subject (e.g., Algebra, Chemistry)"
                                    value={newRequest.subject}
                                    onChange={(e) => setNewRequest({ ...newRequest, subject: e.target.value })}
                                />
                                <Textarea
                                    placeholder="Describe what you need help with..."
                                    rows={4}
                                    value={newRequest.description}
                                    onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                                />
                                <Input
                                    placeholder="Preferred times (comma separated)"
                                    value={newRequest.preferredTimes}
                                    onChange={(e) => setNewRequest({ ...newRequest, preferredTimes: e.target.value })}
                                />
                                <div className="flex gap-2">
                                    <Button onClick={handleCreateRequest}>Submit Request</Button>
                                    <Button variant="outline" onClick={() => setIsCreatingRequest(false)}>Cancel</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                        {initialOffers.map(offer => (
                            <Card key={offer.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle>{offer.subject}</CardTitle>
                                            <p className="text-sm text-muted-foreground mt-1">{offer.tutorName}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                            <span className="text-sm font-medium">{offer.rating.toFixed(1)}</span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-sm">{offer.description}</p>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="w-4 h-4" />
                                        <span>{offer.availability.join(', ')}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Badge variant={offer.hourlyRate === 0 ? 'secondary' : 'default'}>
                                            {offer.hourlyRate === 0 ? 'Free' : `$${offer.hourlyRate}/hr`}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {offer.totalSessions} sessions
                                        </span>
                                    </div>
                                    <Button className="w-full">Contact Tutor</Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {initialOffers.length === 0 && (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                No tutors available yet
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Offer Tutoring Tab */}
            {activeTab === 'offer' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Become a Tutor</h2>
                        {!isCreatingOffer && (
                            <Button onClick={() => setIsCreatingOffer(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Offer
                            </Button>
                        )}
                    </div>

                    {isCreatingOffer && (
                        <Card className="border-primary">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Create Tutoring Offer</CardTitle>
                                    <Button variant="ghost" size="icon" onClick={() => setIsCreatingOffer(false)}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Input
                                    placeholder="Subject (e.g., Mathematics, Physics)"
                                    value={newOffer.subject}
                                    onChange={(e) => setNewOffer({ ...newOffer, subject: e.target.value })}
                                />
                                <Textarea
                                    placeholder="Describe your expertise and teaching approach..."
                                    rows={4}
                                    value={newOffer.description}
                                    onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                                />
                                <Input
                                    placeholder="Availability (e.g., Monday 3-5pm, Wednesday 2-4pm)"
                                    value={newOffer.availability}
                                    onChange={(e) => setNewOffer({ ...newOffer, availability: e.target.value })}
                                />
                                <Input
                                    type="number"
                                    placeholder="Hourly rate (0 for free)"
                                    value={newOffer.hourlyRate}
                                    onChange={(e) => setNewOffer({ ...newOffer, hourlyRate: parseInt(e.target.value) || 0 })}
                                />
                                <div className="flex gap-2">
                                    <Button onClick={handleCreateOffer}>Create Offer</Button>
                                    <Button variant="outline" onClick={() => setIsCreatingOffer(false)}>Cancel</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Requests Tab */}
            {activeTab === 'requests' && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Students Seeking Help</h2>

                    <div className="grid gap-4">
                        {initialRequests.map(request => (
                            <Card key={request.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle>{request.subject}</CardTitle>
                                            <p className="text-sm text-muted-foreground mt-1">{request.studentName}</p>
                                        </div>
                                        <Badge>{request.status}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-sm">{request.description}</p>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="w-4 h-4" />
                                        <span>{request.preferredTimes.join(', ')}</span>
                                    </div>
                                    {request.status === 'open' && (
                                        <Button className="w-full">Offer to Help</Button>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {initialRequests.length === 0 && (
                        <Card>
                            <CardContent className="py-12 text-center text-muted-foreground">
                                No help requests yet
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}
