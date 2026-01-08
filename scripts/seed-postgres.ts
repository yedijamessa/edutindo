
import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import * as schema from '../db/schema';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Use sql directly to avoid pool config issues during scripting, or rely on POSTGRES_URL env var auto-pickup
const db = drizzle(sql, { schema });

async function seed() {
    console.log('🚀 Seeding Postgres...');

    try {
        // --- Users ---
        console.log('👤 Seeding Users...');
        await db.insert(schema.users).values([
            { id: 'user-001', name: 'Sarah Johnson', email: 'sarah@example.com', role: 'student', avatar: '/avatars/student1.png' },
            { id: 'user-002', name: 'Dr. Emily Watson', email: 'emily@edutindo.org', role: 'teacher', avatar: '/avatars/teacher1.png' },
            { id: 'user-003', name: 'Robert Johnson', email: 'robert@example.com', role: 'parent', avatar: '/avatars/parent1.png' }
        ]).onConflictDoNothing();

        // --- Materials ---
        console.log('📚 Seeding Materials...');
        const materials = [
            // === Computer Science Track ===
            {
                id: 'cs-101',
                title: 'Intro to Computational Thinking',
                subject: 'Computer Science',
                description: 'Understand how computers solve problems.',
                content: '# Computational Thinking\n\nDecomposition, Pattern Recognition, Abstraction, and Algorithms.',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=vfliJFqjjoA',
                prerequisites: [],
                published: true,
                createdBy: 'user-002'
            },
            {
                id: 'cs-102',
                title: 'Python Basics: Variables & Loops',
                subject: 'Computer Science',
                description: 'Write your first Python program.',
                content: '# Python Basics\n\n```python\nprint("Hello World")\n```',
                type: 'document',
                prerequisites: [{ materialId: 'cs-101', requiredQuizScore: 80 }],
                published: true,
                createdBy: 'user-002'
            },
            {
                id: 'cs-103',
                title: 'Data Structures: Arrays & Lists',
                subject: 'Computer Science',
                description: 'Organizing data efficiently.',
                content: '# Data Structures\n\nLists are ordered collections...',
                type: 'pdf',
                prerequisites: [{ materialId: 'cs-102', requiredQuizScore: 75 }],
                published: true,
                createdBy: 'user-002'
            },
            // === Mathematics Track ===
            {
                id: 'math-101',
                title: 'Algebra: Linear Equations',
                subject: 'Mathematics',
                description: 'Solving for X in one variable.',
                content: '# Linear Equations\n\nBalance the equation.',
                type: 'document',
                prerequisites: [],
                published: true,
                createdBy: 'user-002'
            },
            {
                id: 'math-102',
                title: 'Geometry: Triangles & Circles',
                subject: 'Mathematics',
                description: 'Properties of shapes and calculating area.',
                content: '# Geometry\n\nPythagorean theorem.',
                type: 'pdf',
                prerequisites: [{ materialId: 'math-101', requiredQuizScore: 60 }],
                published: true,
                createdBy: 'user-002'
            }
        ];

        for (const m of materials) {
            await db.insert(schema.materials).values(m).onConflictDoNothing();
        }

        // --- Quizzes ---
        console.log('📝 Seeding Quizzes...');
        const quizzes = [
            {
                id: 'quiz-cs-101',
                materialId: 'cs-101',
                title: 'Computational Thinking Check',
                description: 'Assessment for Computational Thinking',
                questions: [
                    { id: 'q1', type: 'multiple-choice', question: 'Which is NOT a pillar of computational thinking?', options: ['Decomposition', 'Abstraction', 'Memorization', 'Pattern Recognition'], correctAnswer: 2, points: 10 },
                    { id: 'q2', type: 'true-false', question: 'Abstraction means hiding complex details.', options: ['True', 'False'], correctAnswer: 0, points: 10 }
                ],
                passingScore: 80,
                createdBy: 'user-002'
            },
            {
                id: 'quiz-math-101',
                materialId: 'math-101',
                title: 'Algebra Basics',
                description: 'Assessment for Algebra',
                questions: [
                    { id: 'q1', type: 'multiple-choice', question: 'Solve: 2x = 10', options: ['2', '5', '8', '20'], correctAnswer: 1, points: 10 }
                ],
                passingScore: 60,
                createdBy: 'user-002'
            }
        ];

        for (const q of quizzes) {
            await db.insert(schema.quizzes).values(q).onConflictDoNothing();
        }

        // --- Progress ---
        console.log('📈 Seeding Progress...');
        const progressData = [
            {
                studentId: 'user-001',
                materialId: 'cs-101',
                completed: true,
                progress: 100,
                quizScores: [{ quizId: 'quiz-cs-101', score: 100, attempts: 1, lastAttempt: new Date() }],
                timeSpent: 45
            },
            {
                studentId: 'user-001',
                materialId: 'math-101',
                completed: true,
                progress: 100,
                quizScores: [{ quizId: 'quiz-math-101', score: 100, attempts: 1, lastAttempt: new Date() }],
                timeSpent: 30
            }
        ];

        for (const p of progressData) {
            await db.insert(schema.progress).values(p).onConflictDoNothing();
        }

        // --- Mindmaps ---
        console.log('🧠 Seeding Mindmaps...');
        await db.insert(schema.mindmaps).values({
            id: 'mm-cs-1',
            title: 'My Coding Journey',
            subject: 'Computer Science',
            nodes: {
                root: { id: 'root', text: 'Programming', x: 500, y: 300, color: 'bg-blue-600', children: ['n1', 'n2'] },
                n1: { id: 'n1', text: 'Frontend', x: 300, y: 200, color: 'bg-pink-500', children: ['n3'] },
                n2: { id: 'n2', text: 'Backend', x: 700, y: 200, color: 'bg-purple-500', children: [] },
                n3: { id: 'n3', text: 'React', x: 200, y: 100, color: 'bg-cyan-500', children: [] }
            },
            createdBy: 'user-001'
        }).onConflictDoNothing();

        console.log('✨ Seed complete!');
    } catch (error) {
        console.error('❌ Error seeding:', error);
        process.exit(1);
    }
}

seed().then(() => process.exit(0));
