// Firestore service functions for LMS
// This file contains all database operations for the LMS

import { db } from "./firebase";
import {
    collection,
    getDocs,
    doc,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp,
    setDoc,
    limit,
    onSnapshot
} from "firebase/firestore";
import {
    Material,
    Quiz,
    Question,
    StudentProgress,
    Note,
    MindMap,
    CalendarEvent,
    GamificationProfile,
    Announcement,
    StudentFile,
    Conversation,
    Message,
    TutoringOffer,
    TutoringRequest,
    Equipment,
    Donation
} from "@/types/lms";

// ==================== MATERIALS ====================

export async function getMaterials(): Promise<Material[]> {
    const materialsRef = collection(db, 'materials');
    // Simple query to avoid composite index - filter published on client
    const q = query(materialsRef, orderBy('createdAt', 'desc'));

    const snapshot = await getDocs(q);

    let materials = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Material[];

    // Client-side filtering for published materials
    materials = materials.filter(m => m.published === true);

    return materials;
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

export async function getStudentProgress(studentId: string): Promise<StudentProgress[]> {
    const progressRef = collection(db, 'progress');
    const q = query(progressRef, where('studentId', '==', studentId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any),
        lastAccessed: doc.data().lastAccessed?.toDate() || new Date(),
    })) as StudentProgress[];
}

export async function updateProgress(
    studentId: string,
    materialId: string,
    data: Partial<StudentProgress>
): Promise<void> {
    const progressId = `${studentId}_${materialId} `;
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
    const progressId = `${studentId}_${materialId} `;
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
    const q = query(notesRef, where('createdBy', '==', studentId));
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

export async function getMindmaps(studentId: string): Promise<MindMap[]> {
    const mindmapsRef = collection(db, 'mindmaps');
    const q = query(mindmapsRef, where('createdBy', '==', studentId), orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as MindMap[];
}

export async function getMindmapById(id: string): Promise<MindMap | null> {
    const docRef = doc(db, 'mindmaps', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
        updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
    } as MindMap;
}

export async function saveMindmap(id: string, data: Partial<MindMap>): Promise<void> {
    const docRef = doc(db, 'mindmaps', id);
    await setDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
    }, { merge: true });
}

export async function createMindmap(data: Omit<MindMap, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const mindmapsRef = collection(db, 'mindmaps');
    const docRef = await addDoc(mindmapsRef, {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    });
    return docRef.id;
}

// ==================== CALENDAR ====================

export async function getCalendarEvents(studentId: string): Promise<CalendarEvent[]> {
    const eventsRef = collection(db, 'calendar_events');
    // Simple query to avoid composite index - filter participants on client
    const q = query(eventsRef, orderBy('startTime', 'desc'));

    const snapshot = await getDocs(q);

    let events = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            title: data.title,
            description: data.description,
            startTime: data.startTime?.toDate() || new Date(),
            endTime: data.endTime?.toDate() || new Date(),
            type: data.type,
            location: data.location,
            participants: data.participants || [],
            meetingLink: data.meetingLink,
            createdBy: data.createdBy,
            // Don't include createdAt to avoid Timestamp serialization issues
        } as CalendarEvent;
    });

    // Client-side filtering for events that include this student
    events = events.filter(event =>
        event.participants && event.participants.includes(studentId)
    );

    return events;
}

// ==================== GAMIFICATION ====================

export async function getGamificationProfile(studentId: string): Promise<GamificationProfile | null> {
    const gamificationRef = collection(db, 'gamification');
    const q = query(gamificationRef, where('studentId', '==', studentId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const docData = snapshot.docs[0].data();
    return {
        studentId: docData.studentId,
        ...docData,
        lastActivity: docData.lastActivity?.toDate() || new Date(),
        achievements: docData.achievements?.map((a: any) => ({
            ...a,
            unlockedAt: a.unlockedAt?.toDate() || new Date()
        })) || []
    } as GamificationProfile;
}

export async function updateGamification(studentId: string, data: Partial<GamificationProfile>) {
    const gamificationRef = collection(db, 'gamification');
    const q = query(gamificationRef, where('studentId', '==', studentId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        // Create new profile
        await addDoc(gamificationRef, {
            studentId,
            points: 0,
            level: 1,
            streak: 0,
            achievements: [],
            badges: [],
            lastActivity: Timestamp.now(),
            ...data
        });
    } else {
        const docId = snapshot.docs[0].id;
        await updateDoc(doc(db, 'gamification', docId), {
            ...data,
            lastActivity: Timestamp.now()
        });
    }
}

// ==================== ANNOUNCEMENTS ====================

export async function getAnnouncements(role: string = 'all'): Promise<Announcement[]> {
    const announcementsRef = collection(db, 'announcements');
    const q = query(announcementsRef, orderBy('createdAt', 'desc'), limit(20));
    const snapshot = await getDocs(q);

    const allAnnouncements = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Announcement[];

    return allAnnouncements.filter(a =>
        a.targetAudience.includes('all') || a.targetAudience.includes(role)
    );
}

export async function createAnnouncement(announcement: Omit<Announcement, 'id' | 'createdAt'>) {
    const announcementsRef = collection(db, 'announcements');
    await addDoc(announcementsRef, {
        ...announcement,
        createdAt: Timestamp.now()
    });
}

// ==================== STUDENT FILES ====================

export async function getStudentFiles(studentId: string): Promise<StudentFile[]> {
    const filesRef = collection(db, 'student_files');
    const q = query(filesRef, where('studentId', '==', studentId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any),
        uploadedAt: doc.data().uploadedAt?.toDate() || new Date(),
    })) as StudentFile[];
}

export async function saveFileMetadata(file: Omit<StudentFile, 'id' | 'uploadedAt'>) {
    const filesRef = collection(db, 'student_files');
    await addDoc(filesRef, {
        ...file,
        uploadedAt: Timestamp.now()
    });
}

export async function deleteFileMetadata(fileId: string) {
    await deleteDoc(doc(db, 'student_files', fileId));
}

export async function getStudentStorageUsage(studentId: string): Promise<number> {
    const files = await getStudentFiles(studentId);
    return files.reduce((total, file) => total + file.fileSize, 0);
}

// ==================== CHAT/MESSAGING ====================

export async function getConversations(userId: string): Promise<Conversation[]> {
    const conversationsRef = collection(db, 'conversations');
    const q = query(
        conversationsRef,
        where('participants', 'array-contains', userId)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any),
        lastMessageTime: doc.data().lastMessageTime?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Conversation[];
}

export async function getOrCreateConversation(
    participant1Id: string,
    participant1Name: string,
    participant2Id: string,
    participant2Name: string
): Promise<string> {
    // Conversation ID is consistent regardless of participant order
    const conversationId = [participant1Id, participant2Id].sort().join('_');
    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationSnap = await getDoc(conversationRef);

    if (!conversationSnap.exists()) {
        await setDoc(conversationRef, {
            participants: [participant1Id, participant2Id],
            participantNames: {
                [participant1Id]: participant1Name,
                [participant2Id]: participant2Name
            },
            lastMessage: '',
            lastMessageTime: Timestamp.now(),
            unreadCount: {
                [participant1Id]: 0,
                [participant2Id]: 0
            },
            createdAt: Timestamp.now()
        });
    }

    return conversationId;
}

export async function sendMessage(
    conversationId: string,
    senderId: string,
    senderName: string,
    content: string
): Promise<void> {
    // Add message
    const messagesRef = collection(db, 'messages');
    await addDoc(messagesRef, {
        conversationId,
        senderId,
        senderName,
        content,
        timestamp: Timestamp.now(),
        read: false
    });

    // Update conversation
    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationSnap = await getDoc(conversationRef);

    if (conversationSnap.exists()) {
        const participants = conversationSnap.data().participants as string[];
        const otherParticipant = participants.find(p => p !== senderId);

        if (otherParticipant) {
            await updateDoc(conversationRef, {
                lastMessage: content,
                lastMessageTime: Timestamp.now(),
                [`unreadCount.${otherParticipant}`]: (conversationSnap.data().unreadCount?.[otherParticipant] || 0) + 1
            });
        }
    }
}

export async function markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
        [`unreadCount.${userId}`]: 0
    });
}

// Real-time listener for messages - returns unsubscribe function
export function subscribeToMessages(
    conversationId: string,
    callback: (messages: Message[]) => void
): () => void {
    const messagesRef = collection(db, 'messages');
    const q = query(
        messagesRef,
        where('conversationId', '==', conversationId),
        orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...(doc.data() as any),
            timestamp: doc.data().timestamp?.toDate() || new Date(),
        })) as Message[];

        callback(messages);
    });

    return unsubscribe;
}

// ==================== PEER-TO-PEER TUTORING ====================

export async function getTutoringOffers(subject?: string): Promise<TutoringOffer[]> {
    const offersRef = collection(db, 'tutoring_offers');
    // Simplified query to avoid composite index - filter active on client side
    let q = query(offersRef, orderBy('createdAt', 'desc'));

    const snapshot = await getDocs(q);

    let offers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as TutoringOffer[];

    // Client-side filtering
    offers = offers.filter(offer => offer.active);
    if (subject) {
        offers = offers.filter(offer => offer.subject === subject);
    }

    // Client-side sorting by rating
    offers.sort((a, b) => b.rating - a.rating);

    return offers;
}

export async function createTutoringOffer(offer: Omit<TutoringOffer, 'id' | 'createdAt' | 'rating' | 'totalSessions'>) {
    const offersRef = collection(db, 'tutoring_offers');
    await addDoc(offersRef, {
        ...offer,
        rating: 0,
        totalSessions: 0,
        createdAt: Timestamp.now()
    });
}

export async function getTutoringRequests(status?: string): Promise<TutoringRequest[]> {
    const requestsRef = collection(db, 'tutoring_requests');
    let q = query(requestsRef, orderBy('createdAt', 'desc'));

    if (status) {
        q = query(requestsRef, where('status', '==', status), orderBy('createdAt', 'desc'));
    }

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as TutoringRequest[];
}

export async function createTutoringRequest(request: Omit<TutoringRequest, 'id' | 'createdAt' | 'status'>) {
    const requestsRef = collection(db, 'tutoring_requests');
    await addDoc(requestsRef, {
        ...request,
        status: 'open',
        createdAt: Timestamp.now()
    });
}

export async function matchTutoringRequest(requestId: string, tutorId: string) {
    const requestRef = doc(db, 'tutoring_requests', requestId);
    await updateDoc(requestRef, {
        status: 'matched',
        matchedTutorId: tutorId
    });
}

// ==================== ADAPTIVE LEARNING PATHS ====================

export async function checkMaterialAccess(studentId: string, materialId: string): Promise<boolean> {
    const material = await getMaterialById(materialId);
    if (!material || !material.prerequisites || material.prerequisites.length === 0) {
        return true; // No prerequisites, always accessible
    }

    const progress = await getStudentProgress(studentId);

    for (const prereq of material.prerequisites) {
        const prereqProgress = progress.find(p => p.materialId === prereq.materialId);

        if (!prereqProgress) return false; // Prerequisite material not started

        // Check if any quiz score meets the requirement
        const hasPassingScore = prereqProgress.quizScores?.some(
            (qs: any) => qs.score >= prereq.requiredQuizScore
        );

        if (!hasPassingScore) return false;
    }

    return true; // All prerequisites met
}

export async function getAccessibleMaterials(studentId: string): Promise<Material[]> {
    const allMaterials = await getMaterials();
    const accessibleMaterials: Material[] = [];

    for (const material of allMaterials) {
        const hasAccess = await checkMaterialAccess(studentId, material.id);
        if (hasAccess) {
            accessibleMaterials.push(material);
        }
    }

    return accessibleMaterials;
}

export async function getLearningPath(studentId: string, subject?: string): Promise<{
    unlocked: Material[];
    locked: Material[];
}> {
    let allMaterials = await getMaterials();

    if (subject) {
        allMaterials = allMaterials.filter(m => m.subject === subject);
    }

    const unlocked: Material[] = [];
    const locked: Material[] = [];

    for (const material of allMaterials) {
        const hasAccess = await checkMaterialAccess(studentId, material.id);
        if (hasAccess) {
            unlocked.push(material);
        } else {
            locked.push(material);
        }
    }

    return { unlocked, locked };
}

// ==================== EQUIPMENT & DONATIONS ====================

export async function getEquipmentNeeds(status?: string): Promise<Equipment[]> {
    const equipmentRef = collection(db, 'equipment');
    let q = query(equipmentRef, orderBy('priority', 'desc'), orderBy('createdAt', 'desc'));

    const snapshot = await getDocs(q);

    let equipment = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Equipment[];

    // Client-side filtering by status if provided
    if (status) {
        equipment = equipment.filter(e => e.status === status);
    }

    return equipment;
}

export async function getEquipmentById(id: string): Promise<Equipment | null> {
    const docRef = doc(db, 'equipment', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
        updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
    } as Equipment;
}

export async function createEquipment(
    equipment: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt' | 'currentAmount'>
): Promise<string> {
    const equipmentRef = collection(db, 'equipment');
    const docRef = await addDoc(equipmentRef, {
        ...equipment,
        currentAmount: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    });
    return docRef.id;
}

export async function updateEquipment(id: string, data: Partial<Equipment>): Promise<void> {
    const docRef = doc(db, 'equipment', id);
    await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
    });
}

export async function createDonation(
    donation: Omit<Donation, 'id' | 'createdAt' | 'status'>
): Promise<string> {
    const donationsRef = collection(db, 'donations');
    const docRef = await addDoc(donationsRef, {
        ...donation,
        status: 'pending',
        createdAt: Timestamp.now(),
    });
    return docRef.id;
}

export async function getDonations(equipmentId?: string): Promise<Donation[]> {
    const donationsRef = collection(db, 'donations');
    let q = query(donationsRef, orderBy('createdAt', 'desc'));

    if (equipmentId) {
        q = query(donationsRef, where('equipmentId', '==', equipmentId), orderBy('createdAt', 'desc'));
    }

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        confirmedAt: doc.data().confirmedAt?.toDate() || undefined,
    })) as Donation[];
}

export async function confirmDonation(donationId: string): Promise<void> {
    const donationRef = doc(db, 'donations', donationId);
    const donationSnap = await getDoc(donationRef);

    if (!donationSnap.exists()) {
        throw new Error('Donation not found');
    }

    const donation = donationSnap.data() as Donation;

    // Update donation status
    await updateDoc(donationRef, {
        status: 'confirmed',
        confirmedAt: Timestamp.now(),
    });

    // Update equipment current amount
    const equipmentRef = doc(db, 'equipment', donation.equipmentId);
    const equipmentSnap = await getDoc(equipmentRef);

    if (equipmentSnap.exists()) {
        const equipment = equipmentSnap.data() as Equipment;
        const newAmount = equipment.currentAmount + donation.amount;
        const newStatus = newAmount >= equipment.targetAmount ? 'completed' : equipment.status;

        await updateDoc(equipmentRef, {
            currentAmount: newAmount,
            status: newStatus,
            updatedAt: Timestamp.now(),
        });
    }
}

export async function getRecentDonors(limitCount: number = 10): Promise<Donation[]> {
    const donationsRef = collection(db, 'donations');
    const q = query(
        donationsRef,
        where('isAnonymous', '==', false),
        where('status', '==', 'confirmed'),
        orderBy('confirmedAt', 'desc'),
        limit(limitCount)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        confirmedAt: doc.data().confirmedAt?.toDate() || undefined,
    })) as Donation[];
}

