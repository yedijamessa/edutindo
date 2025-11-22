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

export interface Question {
    id: string;
    question: string;
    type: 'multiple-choice' | 'true-false' | 'short-answer';
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
