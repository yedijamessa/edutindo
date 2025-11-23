"use client"

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Conversation, Message } from "@/types/lms";
import { subscribeToMessages, sendMessage, markMessagesAsRead, getOrCreateConversation } from "@/lib/firestore-services";
import { MessageCircle, Send, User } from "lucide-react";

interface ChatClientProps {
    initialConversations: Conversation[];
    currentUserId: string;
    currentUserName: string;
}

export default function ChatClient({ initialConversations, currentUserId, currentUserName }: ChatClientProps) {
    const [conversations, setConversations] = useState(initialConversations);
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Subscribe to messages when conversation is selected
    useEffect(() => {
        if (!selectedConversation) return;

        const unsubscribe = subscribeToMessages(selectedConversation, (newMessages) => {
            setMessages(newMessages);
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        });

        // Mark messages as read
        markMessagesAsRead(selectedConversation, currentUserId);

        return () => unsubscribe();
    }, [selectedConversation, currentUserId]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation || isSending) return;

        setIsSending(true);
        try {
            await sendMessage(selectedConversation, currentUserId, currentUserName, newMessage);
            setNewMessage('');
        } catch (error) {
            console.error('Failed to send message:', error);
            alert('Failed to send message');
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const selectedConv = conversations.find(c => c.id === selectedConversation);
    const otherParticipant = selectedConv?.participants.find(p => p !== currentUserId);
    const otherParticipantName = otherParticipant ? selectedConv?.participantNames[otherParticipant] : '';

    return (
        <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)]">
            <div className="flex items-center gap-3 mb-6">
                <MessageCircle className="w-8 h-8 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
                    <p className="text-muted-foreground mt-1">Chat with parents and teachers</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 h-[calc(100%-6rem)]">
                {/* Conversations List */}
                <Card className="col-span-1 overflow-hidden">
                    <CardHeader>
                        <CardTitle>Conversations</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-y-auto max-h-[calc(100vh-16rem)]">
                            {conversations.length === 0 ? (
                                <div className="p-4 text-center text-muted-foreground">
                                    No conversations yet
                                </div>
                            ) : (
                                conversations.map(conv => {
                                    const other = conv.participants.find(p => p !== currentUserId);
                                    const otherName = other ? conv.participantNames[other] : 'Unknown';
                                    const unread = conv.unreadCount?.[currentUserId] || 0;

                                    return (
                                        <button
                                            key={conv.id}
                                            onClick={() => setSelectedConversation(conv.id)}
                                            className={`w-full p-4 border-b text-left hover:bg-accent transition-colors ${selectedConversation === conv.id ? 'bg-accent' : ''
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4 flex-shrink-0" />
                                                        <span className="font-medium truncate">{otherName}</span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground truncate mt-1">
                                                        {conv.lastMessage || 'No messages yet'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {formatTime(conv.lastMessageTime)}
                                                    </p>
                                                </div>
                                                {unread > 0 && (
                                                    <Badge className="ml-2 flex-shrink-0">{unread}</Badge>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Chat Area */}
                <Card className="col-span-2 flex flex-col overflow-hidden">
                    {selectedConversation ? (
                        <>
                            <CardHeader className="border-b">
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    {otherParticipantName}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 p-4 overflow-y-auto">
                                <div className="space-y-4">
                                    {messages.map(msg => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[70%] rounded-lg px-4 py-2 ${msg.senderId === currentUserId
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'bg-accent'
                                                    }`}
                                            >
                                                <p className="text-sm">{msg.content}</p>
                                                <p className="text-xs opacity-70 mt-1">{formatTime(msg.timestamp)}</p>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            </CardContent>
                            <div className="p-4 border-t">
                                <div className="flex gap-2">
                                    <Input
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Type a message..."
                                        disabled={isSending}
                                    />
                                    <Button onClick={handleSendMessage} disabled={isSending || !newMessage.trim()}>
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <CardContent className="flex-1 flex items-center justify-center">
                            <div className="text-center text-muted-foreground">
                                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p>Select a conversation to start chatting</p>
                            </div>
                        </CardContent>
                    )}
                </Card>
            </div>
        </div>
    );
}
