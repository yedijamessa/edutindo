// Simplified Firestore Database Migration Script
// This version is more robust and handles edge cases better

// Load environment variables from .env.local
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local file
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, Timestamp } from 'firebase/firestore';

// Check if environment variables are set
const requiredEnvVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`❌ Error: ${envVar} is not set in .env.local`);
        process.exit(1);
    }
}

// Firebase config
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log('🔧 Initializing Firebase...');
console.log(`📍 Project ID: ${firebaseConfig.projectId}\n`);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper function to clean data (remove undefined values)
function cleanData(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(cleanData).filter(item => item !== undefined);
    }

    if (obj && typeof obj === 'object' && !(obj instanceof Timestamp)) {
        const cleaned: any = {};
        for (const [key, value] of Object.entries(obj)) {
            if (value !== undefined) {
                cleaned[key] = cleanData(value);
            }
        }
        return cleaned;
    }

    return obj;
}

// Migration function
async function migrateData() {
    console.log('🚀 Starting Firestore migration...\n');

    try {
        // 1. Create Users
        console.log('📦 Migrating users...');
        await setDoc(doc(db, 'users', 'user-001'), cleanData({
            uid: 'firebase-auth-uid-123',
            email: 'sarah@example.com',
            name: 'Sarah Johnson',
            role: 'student',
            avatar: '/avatars/student1.png',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        }));
        console.log('  ✓ Created users/user-001');

        await setDoc(doc(db, 'users', 'user-002'), cleanData({
            uid: 'firebase-auth-uid-456',
            email: 'emily@edutindo.org',
            name: 'Dr. Emily Watson',
            role: 'teacher',
            avatar: '/avatars/teacher1.png',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        }));
        console.log('  ✓ Created users/user-002');

        await setDoc(doc(db, 'users', 'user-003'), cleanData({
            uid: 'firebase-auth-uid-789',
            email: 'robert@example.com',
            name: 'Robert Johnson',
            role: 'parent',
            avatar: '/avatars/parent1.png',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        }));
        console.log('  ✓ Created users/user-003');
        console.log('✅ users migration complete!\n');

        // 2. Create Students
        console.log('📦 Migrating students...');
        await setDoc(doc(db, 'students', 'student-1'), cleanData({
            userId: 'user-001',
            name: 'Sarah Johnson',
            email: 'sarah@example.com',
            avatar: '/avatars/student1.png',
            enrolledCourses: ['math-101', 'science-101'],
            parentId: 'parent-1',
            grade: '10',
            createdAt: Timestamp.now(),
        }));
        console.log('  ✓ Created students/student-1');
        console.log('✅ students migration complete!\n');

        // 3. Create Teachers
        console.log('📦 Migrating teachers...');
        await setDoc(doc(db, 'teachers', 'teacher-1'), cleanData({
            userId: 'user-002',
            name: 'Dr. Emily Watson',
            email: 'emily@edutindo.org',
            avatar: '/avatars/teacher1.png',
            subjects: ['Mathematics', 'Physics'],
            createdAt: Timestamp.now(),
        }));
        console.log('  ✓ Created teachers/teacher-1');
        console.log('✅ teachers migration complete!\n');

        // 4. Create Parents
        console.log('📦 Migrating parents...');
        await setDoc(doc(db, 'parents', 'parent-1'), cleanData({
            userId: 'user-003',
            name: 'Robert Johnson',
            email: 'robert@example.com',
            children: ['student-1'],
            createdAt: Timestamp.now(),
        }));
        console.log('  ✓ Created parents/parent-1');
        console.log('✅ parents migration complete!\n');

        // 5. Create Materials
        console.log('📦 Migrating materials...');
        await setDoc(doc(db, 'materials', 'math-101'), cleanData({
            title: 'Introduction to Algebra',
            description: 'Learn the fundamentals of algebraic expressions and equations.',
            subject: 'Mathematics',
            content: '# Introduction to Algebra\n\n## What is Algebra?\n\nAlgebra is a branch of mathematics.',
            type: 'document',
            url: '',
            attachments: [{
                id: 'att-1',
                name: 'Algebra Worksheet.pdf',
                url: '/materials/algebra-worksheet.pdf',
                type: 'pdf',
                size: 245000,
            }],
            createdBy: 'teacher-1',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            published: true,
        }));
        console.log('  ✓ Created materials/math-101');

        await setDoc(doc(db, 'materials', 'science-101'), cleanData({
            title: 'The Scientific Method',
            description: 'Understanding how scientists investigate the natural world.',
            subject: 'Science',
            content: '# The Scientific Method\n\n## Steps\n\n1. Ask a Question\n2. Research',
            type: 'document',
            url: '',
            attachments: [],
            createdBy: 'teacher-1',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            published: true,
        }));
        console.log('  ✓ Created materials/science-101');

        await setDoc(doc(db, 'materials', 'english-101'), cleanData({
            title: 'Essay Writing Basics',
            description: 'Learn how to structure and write effective essays.',
            subject: 'English',
            content: '# Essay Writing Basics\n\n## Structure\n\n1. Introduction\n2. Body\n3. Conclusion',
            type: 'document',
            url: '',
            attachments: [],
            createdBy: 'teacher-1',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            published: true,
        }));
        console.log('  ✓ Created materials/english-101');
        console.log('✅ materials migration complete!\n');

        // 6. Create Quizzes
        console.log('📦 Migrating quizzes...');
        await setDoc(doc(db, 'quizzes', 'quiz-1'), cleanData({
            materialId: 'math-101',
            title: 'Algebra Basics Quiz',
            description: 'Test your understanding of basic algebra concepts.',
            questions: [
                {
                    id: 'q1',
                    question: 'What is x if x + 7 = 15?',
                    type: 'multiple-choice',
                    options: ['6', '7', '8', '9'],
                    correctAnswer: 2,
                    points: 10,
                },
                {
                    id: 'q2',
                    question: 'Algebra uses letters to represent unknown values.',
                    type: 'true-false',
                    options: ['True', 'False'],
                    correctAnswer: 0,
                    points: 5,
                },
            ],
            timeLimit: 15,
            passingScore: 70,
            createdBy: 'teacher-1',
            createdAt: Timestamp.now(),
        }));
        console.log('  ✓ Created quizzes/quiz-1');
        console.log('✅ quizzes migration complete!\n');

        // 7. Create Progress
        console.log('📦 Migrating progress...');
        await setDoc(doc(db, 'progress', 'student-1_math-101'), cleanData({
            studentId: 'student-1',
            materialId: 'math-101',
            completed: true,
            progress: 100,
            lastAccessed: Timestamp.now(),
            timeSpent: 45,
            quizScores: [{
                quizId: 'quiz-1',
                score: 85,
                attempts: 2,
                lastAttempt: Timestamp.now(),
            }],
        }));
        console.log('  ✓ Created progress/student-1_math-101');
        console.log('✅ progress migration complete!\n');

        // 8. Create Calendar Events
        console.log('📦 Migrating calendar_events...');
        await setDoc(doc(db, 'calendar_events', 'event-1'), cleanData({
            title: 'Math Class - Algebra',
            description: 'Weekly algebra lesson',
            type: 'class',
            startTime: Timestamp.fromDate(new Date('2024-02-01T10:00:00')),
            endTime: Timestamp.fromDate(new Date('2024-02-01T11:00:00')),
            participants: ['student-1', 'teacher-1'],
            meetingLink: 'https://meet.example.com/math-class',
            createdBy: 'teacher-1',
            createdAt: Timestamp.now(),
        }));
        console.log('  ✓ Created calendar_events/event-1');
        console.log('✅ calendar_events migration complete!\n');

        // 9. Create Notes
        console.log('📦 Migrating notes...');
        await setDoc(doc(db, 'notes', 'note-1'), cleanData({
            title: 'Algebra Key Points',
            content: 'Remember: always isolate the variable on one side of the equation.',
            materialId: 'math-101',
            createdBy: 'student-1',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            tags: ['algebra', 'math'],
        }));
        console.log('  ✓ Created notes/note-1');
        console.log('✅ notes migration complete!\n');

        // 10. Create Mind Maps
        console.log('📦 Migrating mindmaps...');
        await setDoc(doc(db, 'mindmaps', 'mindmap-1'), cleanData({
            title: 'Algebra Concepts',
            subject: 'Mathematics',
            rootNodeId: 'root',
            nodes: {
                root: {
                    id: 'root',
                    text: 'Algebra',
                    x: 800,
                    y: 400,
                    color: 'bg-blue-500',
                    children: ['variables'],
                },
                variables: {
                    id: 'variables',
                    text: 'Variables',
                    x: 400,
                    y: 250,
                    color: 'bg-green-500',
                    children: [],
                },
            },
            createdBy: 'student-1',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        }));
        console.log('  ✓ Created mindmaps/mindmap-1');
        console.log('✅ mindmaps migration complete!\n');

        // 11. Create Bookings
        console.log('📦 Migrating bookings...');
        await setDoc(doc(db, 'bookings', 'booking-1'), cleanData({
            roomName: 'Conference Room A',
            title: 'Parent-Teacher Meeting',
            description: 'Discuss student progress',
            startTime: Timestamp.fromDate(new Date('2024-02-05T14:00:00')),
            endTime: Timestamp.fromDate(new Date('2024-02-05T14:30:00')),
            bookedBy: 'teacher-1',
            participants: ['teacher-1', 'parent-1'],
            status: 'confirmed',
            createdAt: Timestamp.now(),
        }));
        console.log('  ✓ Created bookings/booking-1');
        console.log('✅ bookings migration complete!\n');

        // 12. Create Gamification
        console.log('📦 Migrating gamification...');
        await setDoc(doc(db, 'gamification', 'student-1'), cleanData({
            studentId: 'student-1',
            points: 1250,
            level: 5,
            streak: 7,
            achievements: [{
                id: 'first-quiz',
                name: 'First Quiz Master',
                description: 'Complete your first quiz',
                icon: '🎯',
                unlockedAt: Timestamp.now(),
            }],
            badges: ['early-bird', 'quiz-master'],
            lastActivity: Timestamp.now(),
        }));
        console.log('  ✓ Created gamification/student-1');
        console.log('✅ gamification migration complete!\n');

        console.log('🎉 All data migrated successfully!');
        console.log('\n📊 Summary:');
        console.log('  - 3 users');
        console.log('  - 1 student');
        console.log('  - 1 teacher');
        console.log('  - 1 parent');
        console.log('  - 3 materials');
        console.log('  - 1 quiz');
        console.log('  - 1 progress record');
        console.log('  - 1 calendar event');
        console.log('  - 1 note');
        console.log('  - 1 mindmap');
        console.log('  - 1 booking');
        console.log('  - 1 gamification record');
        console.log('\n✨ Total: 12 collections created!');

    } catch (error: any) {
        console.error('\n❌ Migration failed!');
        console.error('Error:', error.message);
        if (error.code) {
            console.error('Error code:', error.code);
        }
        throw error;
    }
}

// Run migration
migrateData()
    .then(() => {
        console.log('\n✅ Migration complete! Check your Firebase Console.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Fatal error during migration');
        process.exit(1);
    });
