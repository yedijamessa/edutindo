
import { db } from './db';
import { materials, quizzes, progress, mindmaps, users } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { CalendarEvent } from '@/types/lms';

// --- Materials ---
export async function getMaterials() {
    const data = await db.select().from(materials).orderBy(desc(materials.createdAt));
    return data.map(m => ({
        ...m,
        prerequisites: m.prerequisites as any,
        type: m.type as any,
        url: m.url || undefined,
        createdBy: m.createdBy || '',
        content: m.content || '',
    }));
}

export async function getMaterial(id: string) {
    const result = await db.select().from(materials).where(eq(materials.id, id));
    if (!result[0]) return null;
    return {
        ...result[0],
        prerequisites: result[0].prerequisites as any,
        type: result[0].type as any,
        url: result[0].url || undefined,
        createdBy: result[0].createdBy || '',
        content: result[0].content || '',
    };
}

// --- Quizzes ---
export async function getQuizForMaterial(materialId: string) {
    const result = await db.select().from(quizzes).where(eq(quizzes.materialId, materialId));
    if (!result[0]) return null;
    return {
        ...result[0],
        questions: result[0].questions as any[],
        timeLimit: result[0].timeLimit || undefined,
    };
}

export async function getQuizzes() {
    const data = await db.select().from(quizzes).orderBy(desc(quizzes.createdAt));
    return data.map(q => ({
        ...q,
        questions: q.questions as any[], // Cast jsonb
        description: q.description || '',
        createdBy: q.createdBy || '',
        timeLimit: q.timeLimit || undefined,
    }));
}

// --- Learning Path Logic ---
export async function getLearningPath(userId: string) {
    const allMaterials = await db.select().from(materials);
    const userProgress = await db.select().from(progress).where(eq(progress.studentId, userId));

    const unlocked: any[] = [];
    const locked: any[] = [];

    for (const material of allMaterials) {
        let isUnlocked = true;

        if (material.prerequisites && Array.isArray(material.prerequisites)) {
            for (const prereq of material.prerequisites as any[]) {
                const requiredMaterialId = prereq.materialId;
                const requiredScore = prereq.requiredQuizScore;

                const progressRecord = userProgress.find(p => p.materialId === requiredMaterialId);

                // Logic: Must have completed material AND passed quiz with sufficient score
                if (!progressRecord || !progressRecord.completed) {
                    isUnlocked = false;
                    break;
                }

                // Check quiz score if needed
                const scores = progressRecord.quizScores as any[] || [];
                const bestScore = scores.reduce((max, s) => Math.max(max, s.score || 0), 0);

                if (bestScore < requiredScore) {
                    isUnlocked = false;
                    break;
                }
            }
        }

        if (isUnlocked) {
            unlocked.push(material);
        } else {
            locked.push(material);
        }
    }

    return { unlocked, locked };
}

// --- Progress ---
export async function saveQuizResults(userId: string, materialId: string, quizId: string, score: number) {
    // Check existing progress
    const existing = await db.select().from(progress).where(
        and(eq(progress.studentId, userId), eq(progress.materialId, materialId))
    );

    const newScoreEntry = { quizId, score, attempts: 1, lastAttempt: new Date() };

    if (existing.length > 0) {
        const current = existing[0];
        const scores = (current.quizScores as any[]) || [];
        scores.push(newScoreEntry);

        await db.update(progress).set({
            quizScores: scores,
            lastAccessed: new Date(),
        }).where(eq(progress.id, current.id));
    } else {
        await db.insert(progress).values({
            studentId: userId,
            materialId: materialId,
            quizScores: [newScoreEntry],
            completed: false,
            progress: 0,
            lastAccessed: new Date()
        });
    }
}

export async function getStudentProgress(userId: string) {
    const data = await db.select().from(progress).where(eq(progress.studentId, userId));
    return data.map(p => ({
        ...p,
        quizScores: p.quizScores as any[]
    }));
}

export async function getCalendarEvents(userId: string): Promise<CalendarEvent[]> {
    return Promise.resolve([]);
}
