
import { db } from './db';
import { materials, quizzes, progress, mindmaps, users } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';

// --- Materials ---
export async function getMaterials() {
    return await db.select().from(materials).orderBy(desc(materials.createdAt));
}

export async function getMaterial(id: string) {
    const result = await db.select().from(materials).where(eq(materials.id, id));
    return result[0];
}

// --- Quizzes ---
export async function getQuizForMaterial(materialId: string) {
    const result = await db.select().from(quizzes).where(eq(quizzes.materialId, materialId));
    return result[0];
}

export async function getQuizzes() {
    return await db.select().from(quizzes).orderBy(desc(quizzes.createdAt));
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
    return await db.select().from(progress).where(eq(progress.studentId, userId));
}

export async function getCalendarEvents(userId: string) {
    return Promise.resolve([]);
}
