"use client"

import { useState } from "react";
import { SidebarNav } from "@/components/lms/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, Sparkles, BookOpen, HelpCircle } from "lucide-react";

// NOTE: In production, move these to environment variables (.env.local)
// NEXT_PUBLIC_OPENAI_API_KEY=your_key_here
// NEXT_PUBLIC_GEMINI_API_KEY=your_key_here

export default function StudentAIAssistantPage() {
    const studentName = 'Sarah Johnson';
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: 'assistant',
            content: "Hi! I'm your AI learning assistant. I can help you with homework, explain concepts, or answer questions about your materials. How can I help you today?",
            timestamp: new Date(),
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState<'gpt' | 'gemini'>('gpt');

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = {
            id: messages.length + 1,
            role: 'user' as const,
            content: input,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // TODO: Implement actual API calls
            // For OpenAI: https://platform.openai.com/docs/api-reference
            // For Gemini: https://ai.google.dev/tutorials/rest_quickstart

            // Simulated response for now
            setTimeout(() => {
                const aiResponse = {
                    id: messages.length + 2,
                    role: 'assistant' as const,
                    content: `I understand you're asking about "${input}". Let me help you with that! (This is a demo response. Connect to ${selectedModel === 'gpt' ? 'OpenAI GPT' : 'Google Gemini'} API for real responses.)`,
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, aiResponse]);
                setIsLoading(false);
            }, 1000);
        } catch (error) {
            console.error('Error calling AI API:', error);
            setIsLoading(false);
        }
    };

    const quickPrompts = [
        "Explain photosynthesis in simple terms",
        "Help me solve this algebra problem",
        "What is the scientific method?",
        "Summarize my recent materials",
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="flex">
                <aside className="hidden lg:block w-64 border-r bg-card p-6 min-h-screen sticky top-0">
                    <div className="mb-8">
                        <h2 className="text-lg font-bold">Student Portal</h2>
                        <p className="text-sm text-muted-foreground">{studentName}</p>
                    </div>
                    <SidebarNav role="student" />
                </aside>

                <main className="flex-1 p-6 lg:p-8">
                    <div className="max-w-5xl mx-auto space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                                    AI Assistant <Sparkles className="w-8 h-8 text-yellow-500" />
                                </h1>
                                <p className="text-muted-foreground mt-2">Your personal learning companion powered by AI</p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant={selectedModel === 'gpt' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedModel('gpt')}
                                >
                                    GPT-4
                                </Button>
                                <Button
                                    variant={selectedModel === 'gemini' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedModel('gemini')}
                                >
                                    Gemini
                                </Button>
                            </div>
                        </div>

                        {/* Chat Interface */}
                        <Card className="h-[600px] flex flex-col">
                            <CardHeader className="border-b">
                                <CardTitle className="flex items-center gap-2">
                                    <Bot className="w-5 h-5" />
                                    Chat with AI
                                    <Badge variant="secondary" className="ml-auto">
                                        {selectedModel === 'gpt' ? 'OpenAI GPT-4' : 'Google Gemini'}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>

                            {/* Messages */}
                            <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                                {messages.map(message => (
                                    <div
                                        key={message.id}
                                        className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {message.role === 'assistant' && (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                                                <Bot className="w-5 h-5 text-white" />
                                            </div>
                                        )}
                                        <div
                                            className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === 'user'
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted'
                                                }`}
                                        >
                                            <p className="text-sm">{message.content}</p>
                                            <p className="text-xs opacity-70 mt-1">
                                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        {message.role === 'user' && (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm">
                                                SJ
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                            <Bot className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="bg-muted rounded-2xl px-4 py-3">
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>

                            {/* Input */}
                            <div className="border-t p-4 space-y-3">
                                <div className="flex gap-2 flex-wrap">
                                    {quickPrompts.map((prompt, index) => (
                                        <Button
                                            key={index}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setInput(prompt)}
                                            className="text-xs"
                                        >
                                            {prompt}
                                        </Button>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Textarea
                                        placeholder="Ask me anything about your studies..."
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                sendMessage();
                                            }
                                        }}
                                        rows={2}
                                        className="resize-none"
                                    />
                                    <Button onClick={sendMessage} disabled={isLoading || !input.trim()} size="icon" className="h-auto">
                                        <Send className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        {/* Features */}
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardContent className="p-6 space-y-2">
                                    <BookOpen className="w-8 h-8 text-blue-500" />
                                    <h3 className="font-semibold">Study Help</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Get explanations and help with homework
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6 space-y-2">
                                    <HelpCircle className="w-8 h-8 text-green-500" />
                                    <h3 className="font-semibold">Q&A</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Ask questions about any topic
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6 space-y-2">
                                    <Sparkles className="w-8 h-8 text-yellow-500" />
                                    <h3 className="font-semibold">Smart Summaries</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Summarize materials and notes
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* API Info */}
                        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                            <CardContent className="p-4">
                                <p className="text-sm">
                                    <strong>Note:</strong> To enable AI features, add your API keys to <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">.env.local</code>:
                                </p>
                                <pre className="text-xs mt-2 bg-blue-100 dark:bg-blue-900 p-2 rounded overflow-x-auto">
                                    {`NEXT_PUBLIC_OPENAI_API_KEY=your_openai_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key`}
                                </pre>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
