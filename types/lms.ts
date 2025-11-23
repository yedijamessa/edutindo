// Core LMS Types

export interface Material {
    id: string;
    title: string;
    description: string;
    subject: string;
    content: string;
    attachments?: Attachment[];
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    published: boolean;
    prerequisites?: MaterialPrerequisite[]; // For adaptive learning
}

export interface MaterialPrerequisite {
    materialId: string;
    requiredQuizScore: number; // Minimum score (0-100) required
}

export interface Attachment {
    id: string;
    name: string;
    url: string;
    type: 'pdf' | 'video' | 'image' | 'document';
    size: number;
}

export interface Quiz {
    id: string;
    materialId: string;
    title: string;
    description: string;
    questions: Question[];
    timeLimit?: number; // in minutes
    passingScore: number;
    createdBy: string;
    createdAt: Date;
}

export type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';

export interface Question {
    id: string;
    question: string;
    type: QuestionType;
    options?: string[];
    correctAnswer: string | number;
    points: number;
}

export interface QuizAttempt {
    id: string;
    quizId: string;
    studentId: string;
    answers: Record<string, string | number>;
    score: number;
    completedAt: Date;
    timeSpent: number; // in minutes
}

export interface Note {
    id: string;
    title: string;
    content: string;
    materialId?: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    tags?: string[];
}

export interface Progress {
    studentId: string;
    materialId: string;
    completed: boolean;
    progress: number; // 0-100
    lastAccessed: Date;
    timeSpent: number; // in minutes
}

export interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    type: 'class' | 'meeting' | 'deadline' | 'event';
    startTime: Date;
    endTime: Date;
    participants: string[];
    meetingLink?: string;
    createdBy: string;
}

export interface Student {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    enrolledCourses: string[];
    parentId?: string;
}

export interface Teacher {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    subjects: string[];
}

export interface Parent {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    children: string[]; // student IDs
}

export type UserRole = 'student' | 'teacher' | 'parent';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
}

export type StudentProgress = Progress;

export interface MindMapNode {
    id: string;
    text: string;
    x: number;
    y: number;
    color: string;
    children: string[];
}

export interface MindMap {
    id: string;
    title: string;
    subject: string;
    rootNodeId: string;
    nodes: Record<string, MindMapNode>;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt: Date;
}

export interface GamificationProfile {
    studentId: string;
    points: number;
    level: number;
    streak: number;
    achievements: Achievement[];
    badges: string[];
    lastActivity: Date;
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    type: 'info' | 'warning' | 'success' | 'event';
    targetAudience: string[]; // 'all', 'student', 'teacher', 'parent'
    authorId: string;
    priority: 'low' | 'medium' | 'high';
    createdAt: Date;
}

export interface StudentFile {
    id: string;
    studentId: string;
    fileName: string;
    fileType: string; // mime type
    fileSize: number; // bytes
    storagePath: string; // Firebase Storage path
    folder?: string; // optional folder name
    uploadedAt: Date;
}

export interface Conversation {
    id: string;
    participants: string[]; // user IDs
    participantNames: Record<string, string>; // userId -> name
    lastMessage: string;
    lastMessageTime: Date;
    unreadCount: Record<string, number>; // userId -> count
    createdAt: Date;
}

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    senderName: string;
    content: string;
    timestamp: Date;
    read: boolean;
}

export interface TutoringOffer {
    id: string;
    tutorId: string;
    tutorName: string;
    subject: string;
    description: string;
    availability: string[];
    hourlyRate: number; // 0 for free
    rating: number;
    totalSessions: number;
    active: boolean;
    createdAt: Date;
}

export interface TutoringRequest {
    id: string;
    studentId: string;
    studentName: string;
    subject: string;
    description: string;
    preferredTimes: string[];
    status: 'open' | 'matched' | 'completed' | 'cancelled';
    matchedTutorId?: string;
    createdAt: Date;
}
