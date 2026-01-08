
import dotenv from 'dotenv';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, Timestamp, initializeFirestore } from 'firebase/firestore';

// Load .env.local file
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Configuration
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase with settings
const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, { ignoreUndefinedProperties: true });

// Helper to clean data (simplified since we have ignoreUndefinedProperties, but keeping for nested safety)
function cleanData(obj: any): any {
    return JSON.parse(JSON.stringify(obj, (key, value) => {
        if (value === undefined) return undefined;
        return value;
    }));
}

async function seedContent() {
    console.log('🚀 Starting Creative Content Seed...\n');

    try {
        // --- 1. Materials (Learning Paths) ---
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
                published: true
            },
            {
                id: 'cs-102',
                title: 'Python Basics: Variables & Loops',
                subject: 'Computer Science',
                description: 'Write your first Python program.',
                content: '# Python Basics\n\n```python\nprint("Hello World")\n```',
                type: 'document',
                prerequisites: [{ materialId: 'cs-101', requiredQuizScore: 80 }],
                published: true
            },
            {
                id: 'cs-103',
                title: 'Data Structures: Arrays & Lists',
                subject: 'Computer Science',
                description: 'Organizing data efficiently.',
                content: '# Data Structures\n\nLists are ordered collections...',
                type: 'pdf',
                prerequisites: [{ materialId: 'cs-102', requiredQuizScore: 75 }],
                published: true
            },
            {
                id: 'cs-104',
                title: 'Algorithms: Sorting & Searching',
                subject: 'Computer Science',
                description: 'Bubble sort, Merge sort, and Binary search.',
                content: '# Algorithms\n\nEfficiency matters.',
                type: 'video',
                prerequisites: [{ materialId: 'cs-103', requiredQuizScore: 70 }],
                published: true
            },
            {
                id: 'cs-105',
                title: 'Web Development: HTML & CSS',
                subject: 'Computer Science',
                description: 'Building the visual web.',
                content: '# HTML & CSS\n\nThe structure and style of the web.',
                type: 'link',
                url: 'https://developer.mozilla.org',
                prerequisites: [],
                published: true
            },
            {
                id: 'cs-106',
                title: 'React.js Fundamentals',
                subject: 'Computer Science',
                description: 'Modern UI development with Components.',
                content: '# React\n\nComponents, Props, and State.',
                type: 'video',
                prerequisites: [{ materialId: 'cs-105', requiredQuizScore: 80 }],
                published: true
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
                published: true
            },
            {
                id: 'math-102',
                title: 'Geometry: Triangles & Circles',
                subject: 'Mathematics',
                description: 'Properties of shapes and calculating area.',
                content: '# Geometry\n\nPythagorean theorem.',
                type: 'pdf',
                prerequisites: [{ materialId: 'math-101', requiredQuizScore: 60 }],
                published: true
            },
            {
                id: 'math-103',
                title: 'Trigonometry: SOH CAH TOA',
                subject: 'Mathematics',
                description: 'Sine, Cosine, and Tangent ratios.',
                content: '# Trigonometry\n\nRight-angled triangles.',
                type: 'document',
                prerequisites: [{ materialId: 'math-102', requiredQuizScore: 70 }],
                published: true
            },
            {
                id: 'math-104',
                title: 'Calculus: Limits & Derivatives',
                subject: 'Mathematics',
                description: 'The study of change.',
                content: '# Calculus\n\nSlope of a curve.',
                type: 'video',
                prerequisites: [{ materialId: 'math-103', requiredQuizScore: 80 }],
                published: true
            },

            // === Science Track ===
            {
                id: 'sci-101',
                title: 'Biology: The Cell',
                subject: 'Science',
                description: 'The building block of life.',
                content: '# The Cell\n\nMitochondria is the powerhouse.',
                type: 'document',
                prerequisites: [],
                published: true
            },
            {
                id: 'sci-102',
                title: 'Chemistry: The Periodic Table',
                subject: 'Science',
                description: 'Elements and their properties.',
                content: '# Periodic Table\n\nAtomic number and mass.',
                type: 'pdf',
                prerequisites: [],
                published: true
            },
            {
                id: 'sci-103',
                title: 'Physics: Newton\'s Laws',
                subject: 'Science',
                description: 'Motion and Force.',
                content: '# Newton\'s Laws\n\nForce = Mass x Acceleration.',
                type: 'video',
                prerequisites: [{ materialId: 'math-101', requiredQuizScore: 50 }], // Cross-subject prereq!
                published: true
            },
            {
                id: 'sci-104',
                title: 'Astronomy: The Solar System',
                subject: 'Science',
                description: 'Planets, stars, and galaxies.',
                content: '# Space\n\nThe final frontier.',
                type: 'video',
                prerequisites: [{ materialId: 'sci-103', requiredQuizScore: 70 }],
                published: true
            },

            // === Art & History (Enrichment) ===
            {
                id: 'art-101',
                title: 'Renaissance Art History',
                subject: 'Art',
                description: 'Da Vinci, Michelangelo, and Raphael.',
                content: '# Renaissance\n\nRebirth of culture.',
                type: 'document',
                prerequisites: [],
                published: true
            },
            {
                id: 'hist-101',
                title: 'World War II: Causes',
                subject: 'History',
                description: 'Global conflict in the 20th century.',
                content: '# WWII\n\nAllies vs Axis.',
                type: 'pdf',
                prerequisites: [],
                published: true
            }
        ];

        for (const m of materials) {
            try {
                // Manually clean to avoid JSON.stringify stripping Timestamps if they were embedded (they are not yet)
                const now = Timestamp.now();
                const data = {
                    ...m,
                    createdBy: 'teacher-1',
                    createdAt: now,
                    updatedAt: now,
                };
                // @ts-ignore
                if (data.prerequisites === undefined) delete data.prerequisites;

                await setDoc(doc(db, 'materials', m.id), data);
                console.log(`  ✓ Material: ${m.title}`);
            } catch (e: any) {
                console.error(`  ❌ Failed to seed material ${m.id}:`, e.message);
            }
        }

        // --- 2. Quizzes ---
        console.log('\n📝 Seeding Quizzes...');

        const quizzes = [
            {
                id: 'quiz-cs-101',
                materialId: 'cs-101',
                title: 'Computational Thinking Check',
                questions: [
                    { id: 'q1', type: 'multiple-choice', question: 'Which is NOT a pillar of computational thinking?', options: ['Decomposition', 'Abstraction', 'Memorization', 'Pattern Recognition'], correctAnswer: 2, points: 10 },
                    { id: 'q2', type: 'true-false', question: 'Abstraction means hiding complex details.', options: ['True', 'False'], correctAnswer: 0, points: 10 }
                ],
                passingScore: 80
            },
            {
                id: 'quiz-cs-102',
                materialId: 'cs-102',
                title: 'Python Syntax Quiz',
                questions: [
                    { id: 'q1', type: 'multiple-choice', question: 'How do you print in Python?', options: ['console.log()', 'print()', 'echo', 'System.out.println()'], correctAnswer: 1, points: 10 }
                ],
                passingScore: 75
            },
            {
                id: 'quiz-math-101',
                materialId: 'math-101',
                title: 'Algebra Basics',
                questions: [
                    { id: 'q1', type: 'multiple-choice', question: 'Solve: 2x = 10', options: ['2', '5', '8', '20'], correctAnswer: 1, points: 10 },
                    { id: 'q2', type: 'short-answer', question: 'What is the variable in 3y + 2?', options: [], correctAnswer: 'y', points: 10 }
                ],
                passingScore: 60
            },
            {
                id: 'quiz-math-102',
                materialId: 'math-102',
                title: 'Geometry Mastery',
                questions: [
                    { id: 'q1', type: 'multiple-choice', question: 'Area of a circle?', options: ['2πr', 'πr²', 'lw', '0.5bh'], correctAnswer: 1, points: 10 }
                ],
                passingScore: 70
            },
            {
                id: 'quiz-sci-103',
                materialId: 'sci-103',
                title: 'Physics Fundamentals',
                questions: [
                    { id: 'q1', type: 'true-false', question: 'F = ma is Newton\'s 2nd Law.', options: ['True', 'False'], correctAnswer: 0, points: 10 }
                ],
                passingScore: 50
            }
        ];

        for (const q of quizzes) {
            try {
                const now = Timestamp.now();
                const data = {
                    ...q,
                    description: `Assessment for ${q.title}`,
                    timeLimit: 20,
                    createdBy: 'teacher-1',
                    createdAt: now,
                };
                await setDoc(doc(db, 'quizzes', q.id), data);
                console.log(`  ✓ Quiz: ${q.title}`);
            } catch (e: any) {
                console.error(`  ❌ Failed to seed quiz ${q.id}:`, e.message);
            }
        }

        // --- 3. Progress (Student State) ---
        console.log('\n📈 Seeding Student Progress...');

        const progresses = [
            // CS: Finished 101, Passed 101 Quiz -> Unlocked 102. Finished 102, Failed 102 Quiz -> Locked 103? No, let's say passed 102 quiz.
            // Let's make it:
            // CS-101: Done (Quiz 100%)
            // CS-102: Done (Quiz 80%)
            // CS-103: In Progress (No quiz yet)
            // CS-104: Locked
            {
                studentId: 'student-1',
                materialId: 'cs-101',
                completed: true,
                progress: 100,
                quizScores: [{ quizId: 'quiz-cs-101', score: 100, attempts: 1, lastAttempt: Timestamp.now() }]
            },
            {
                studentId: 'student-1',
                materialId: 'cs-102',
                completed: true,
                progress: 100,
                quizScores: [{ quizId: 'quiz-cs-102', score: 80, attempts: 2, lastAttempt: Timestamp.now() }]
            },
            {
                studentId: 'student-1',
                materialId: 'cs-103',
                completed: false,
                progress: 45,
                quizScores: []
            },

            // Math: Stuck at 102
            // Math-101: Done (Quiz 90%)
            // Math-102: Done (Quiz 40% - FAIL) -> Math-103 should remain Locked
            {
                studentId: 'student-1',
                materialId: 'math-101',
                completed: true,
                progress: 100,
                quizScores: [{ quizId: 'quiz-math-101', score: 100, attempts: 1, lastAttempt: Timestamp.now() }]
            },
            {
                studentId: 'student-1',
                materialId: 'math-102',
                completed: true,
                progress: 100,
                quizScores: [{ quizId: 'quiz-math-102', score: 40, attempts: 1, lastAttempt: Timestamp.now() }] // Failed!
            }
        ];

        for (const p of progresses) {
            try {
                const now = Timestamp.now();
                const data = {
                    ...p,
                    lastAccessed: now,
                    timeSpent: Math.floor(Math.random() * 60) + 10
                };
                await setDoc(doc(db, 'progress', `${p.studentId}_${p.materialId}`), data);
                console.log(`  ✓ Progress: ${p.materialId}`);
            } catch (e: any) {
                console.error(`  ❌ Failed to seed progress ${p.materialId}:`, e.message);
            }
        }

        // --- 4. Extra: Mindmaps for "Creative" request ---
        console.log('\n🧠 Seeding Mindmaps...');
        try {
            const now = Timestamp.now();
            const data = {
                title: 'My Coding Journey',
                subject: 'Computer Science',
                rootNodeId: 'root',
                nodes: {
                    root: { id: 'root', text: 'Programming', x: 500, y: 300, color: 'bg-blue-600', children: ['n1', 'n2'] },
                    n1: { id: 'n1', text: 'Frontend', x: 300, y: 200, color: 'bg-pink-500', children: ['n3'] },
                    n2: { id: 'n2', text: 'Backend', x: 700, y: 200, color: 'bg-purple-500', children: [] },
                    n3: { id: 'n3', text: 'React', x: 200, y: 100, color: 'bg-cyan-500', children: [] }
                },
                createdBy: 'student-1',
                createdAt: now,
                updatedAt: now,
            };
            await setDoc(doc(db, 'mindmaps', 'mm-cs-1'), data);
            console.log('  ✓ Mindmap: My Coding Journey');
        } catch (e: any) {
            console.error('  ❌ Failed to seed mindmap:', e.message);
        }

        console.log('\n✨ Database populated with creative/mock content!');

    } catch (error) {
        console.error('❌ Error seeding content:', error);
        process.exit(1);
    }
}

seedContent().then(() => process.exit(0));

