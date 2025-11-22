// Firestore service functions for LMS
// This file contains all database operations for the LMS

import { db } from './firebase';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp,
    addDoc,
} from 'firebase/firestore';
import type { Material, Quiz, Progress, Note, CalendarEvent } from '@/types/lms';

// ==================== MATERIALS ====================

export async function getMaterials(): Promise<Material[]> {
    const materialsRef = collection(db, 'materials');
    const q = query(materialsRef, where('published', '==', true), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Material[];
}

export async function getMaterialById(id: string): Promise<Material | null> {
    const docRef = doc(db, 'materials', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
        updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
    } as Material;
}

export async function createMaterial(material: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const materialsRef = collection(db, 'materials');
    const docRef = await addDoc(materialsRef, {
        ...material,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    });
    return docRef.id;
}

// ==================== QUIZZES ====================

export async function getQuizzes(): Promise<Quiz[]> {
    const quizzesRef = collection(db, 'quizzes');
    const q = query(quizzesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Quiz[];
}

export async function getQuizById(id: string): Promise<Quiz | null> {
    const docRef = doc(db, 'quizzes', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
    } as Quiz;
}

export async function createQuiz(quiz: Omit<Quiz, 'id' | 'createdAt'>): Promise<string> {
    const quizzesRef = collection(db, 'quizzes');
    const docRef = await addDoc(quizzesRef, {
        ...quiz,
        createdAt: Timestamp.now(),
    });
    return docRef.id;
}

// ==================== PROGRESS ====================

export async function getStudentProgress(studentId: string): Promise<Progress[]> {
    const progressRef = collection(db, 'progress');
    const q = query(progressRef, where('studentId', '==', studentId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        ...doc.data(),
        lastAccessed: doc.data().lastAccessed?.toDate() || new Date(),
    })) as Progress[];
}

export async function updateProgress(
    studentId: string,
    materialId: string,
    data: Partial<Progress>
): Promise<void> {
    const progressId = `${studentId}_${materialId}`;
    const docRef = doc(db, 'progress', progressId);

    await setDoc(docRef, {
        studentId,
        materialId,
        ...data,
        lastAccessed: Timestamp.now(),
    }, { merge: true });
}

export async function saveQuizScore(
    studentId: string,
    materialId: string,
    quizId: string,
    score: number
): Promise<void> {
    const progressId = `${studentId}_${materialId}`;
    const docRef = doc(db, 'progress', progressId);
    const docSnap = await getDoc(docRef);

    const existingScores = docSnap.exists() ? docSnap.data().quizScores || [] : [];
    const quizScoreIndex = existingScores.findIndex((s: any) => s.quizId === quizId);

    if (quizScoreIndex >= 0) {
        existingScores[quizScoreIndex] = {
            quizId,
            score,
            attempts: existingScores[quizScoreIndex].attempts + 1,
            lastAttempt: Timestamp.now(),
        };
    } else {
        existingScores.push({
            quizId,
            score,
            attempts: 1,
            lastAttempt: Timestamp.now(),
        });
    }

    await setDoc(docRef, {
        studentId,
        materialId,
        quizScores: existingScores,
        lastAccessed: Timestamp.now(),
    }, { merge: true });
}

// ==================== NOTES ====================

export async function getNotes(studentId: string): Promise<Note[]> {
    const notesRef = collection(db, 'notes');
    const q = query(notesRef, where('createdBy', '==', studentId), orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Note[];
}

export async function createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const notesRef = collection(db, 'notes');
    const docRef = await addDoc(notesRef, {
        ...note,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    });
    return docRef.id;
}

export async function updateNote(id: string, data: Partial<Note>): Promise<void> {
    const docRef = doc(db, 'notes', id);
    await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
    });
}

export async function deleteNote(id: string): Promise<void> {
    const docRef = doc(db, 'notes', id);
    await deleteDoc(docRef);
}

// ==================== MINDMAPS ====================

export async function getMindmaps(studentId: string) {
    const mindmapsRef = collection(db, 'mindmaps');
    const q = query(mindmapsRef, where('createdBy', '==', studentId), orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    }));
}

export async function getMindmapById(id: string) {
    const docRef = doc(db, 'mindmaps', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
        updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
    };
}

export async function saveMindmap(id: string, data: any): Promise<void> {
    const docRef = doc(db, 'mindmaps', id);
    await setDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
    }, { merge: true });
}

export async function createMindmap(data: any): Promise<string> {
    const mindmapsRef = collection(db, 'mindmaps');
    const docRef = await addDoc(mindmapsRef, {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    });
    return docRef.id;
}

// ==================== CALENDAR EVENTS ====================

export async function getCalendarEvents(userId: string): Promise<CalendarEvent[]> {
    const eventsRef = collection(db, 'calendar_events');
    const q = query(eventsRef, where('participants', 'array-contains', userId), orderBy('startTime', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime?.toDate() || new Date(),
        endTime: doc.data().endTime?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as CalendarEvent[];
}

// ==================== GAMIFICATION ====================

export async function getGamification(studentId: string) {
    const docRef = doc(db, 'gamification', studentId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        // Return default gamification data
        return {
            studentId,
            points: 0,
            level: 1,
            streak: 0,
            achievements: [],
            badges: [],
            lastActivity: new Date(),
        };
    }

    return {
        ...docSnap.data(),
        lastActivity: docSnap.data().lastActivity?.toDate() || new Date(),
    };
}

export async function updateGamification(studentId: string, data: any): Promise<void> {
    const docRef = doc(db, 'gamification', studentId);
    await setDoc(docRef, {
        ...data,
        lastActivity: Timestamp.now(),
    }, { merge: true });
}
