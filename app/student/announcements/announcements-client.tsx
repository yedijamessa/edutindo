"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Announcement } from "@/types/lms";
import { Megaphone, Info, AlertTriangle, CheckCircle, Calendar } from "lucide-react";

interface AnnouncementsClientProps {
    announcements: Announcement[];
}

export default function AnnouncementsClient({ announcements }: AnnouncementsClientProps) {
    const getIcon = (type: Announcement['type']) => {
        switch (type) {
            case 'info': return <Info className="w-5 h-5 text-blue-500" />;
            case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'event': return <Calendar className="w-5 h-5 text-purple-500" />;
        }
    };

    const getBadgeVariant = (priority: Announcement['priority']) => {
        switch (priority) {
            case 'high': return 'destructive';
            case 'medium': return 'default';
            case 'low': return 'secondary';
        }
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <Megaphone className="w-8 h-8 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
                    <p className="text-muted-foreground mt-1">Stay updated with school news and events</p>
                </div>
            </div>

            {announcements.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Megaphone className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">No announcements yet</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {announcements.map((announcement) => (
                        <Card
                            key={announcement.id}
                            className="overflow-hidden hover:shadow-lg transition-shadow"
                        >
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                                <div className="flex gap-3 flex-1">
                                    <div className="mt-1">
                                        {getIcon(announcement.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <CardTitle className="text-xl">{announcement.title}</CardTitle>
                                            <Badge variant={getBadgeVariant(announcement.priority)}>
                                                {announcement.priority}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDate(announcement.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {announcement.content}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
