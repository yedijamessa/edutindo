import { Material, Quiz, Student, Teacher, Parent, CalendarEvent, Progress, Note } from '@/types/lms';

// Mock Students
export const mockStudents: Student[] = [
    {
        id: 'student-1',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        avatar: '/avatars/student1.png',
        enrolledCourses: ['math-101', 'science-101'],
        parentId: 'parent-1',
    },
    {
        id: 'student-2',
        name: 'Michael Chen',
        email: 'michael@example.com',
        avatar: '/avatars/student2.png',
        enrolledCourses: ['math-101', 'english-101'],
        parentId: 'parent-2',
    },
];

// Mock Teachers
export const mockTeachers: Teacher[] = [
    {
        id: 'teacher-1',
        name: 'Dr. Emily Watson',
        email: 'emily@edutindo.org',
        avatar: '/avatars/teacher1.png',
        subjects: ['Mathematics', 'Physics'],
    },
];

// Mock Parents
export const mockParents: Parent[] = [
    {
        id: 'parent-1',
        name: 'Robert Johnson',
        email: 'robert@example.com',
        children: ['student-1'],
    },
    {
        id: 'parent-2',
        name: 'Lisa Chen',
        email: 'lisa@example.com',
        children: ['student-2'],
    },
];

// Mock Materials
export const mockMaterials: Material[] = [
    {
        id: 'math-101',
        title: 'Introduction to Algebra',
        description: 'Learn the fundamentals of algebraic expressions and equations.',
        subject: 'Mathematics',
        content: `# Introduction to Algebra

## What is Algebra?

Algebra is a branch of mathematics that uses symbols and letters to represent numbers and quantities in formulas and equations.

## Key Concepts

1. **Variables**: Letters that represent unknown values
2. **Expressions**: Combinations of variables and numbers
3. **Equations**: Mathematical statements that two expressions are equal

## Example

If x + 5 = 10, what is x?

Solution: x = 5`,
        attachments: [
            {
                id: 'att-1',
                name: 'Algebra Worksheet.pdf',
                url: '/materials/algebra-worksheet.pdf',
                type: 'pdf',
                size: 245000,
            },
        ],
        createdBy: 'teacher-1',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        published: true,
    },
    {
        id: 'science-101',
        title: 'The Scientific Method',
        description: 'Understanding how scientists investigate the natural world.',
        subject: 'Science',
        content: `# The Scientific Method

## Steps of the Scientific Method

1. **Ask a Question**
2. **Do Background Research**
3. **Construct a Hypothesis**
4. **Test with an Experiment**
5. **Analyze Data**
6. **Draw Conclusions**

## Example Experiment

Question: Does the amount of sunlight affect plant growth?`,
        createdBy: 'teacher-1',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20'),
        published: true,
    },
    {
        id: 'english-101',
        title: 'Essay Writing Basics',
        description: 'Learn how to structure and write effective essays.',
        subject: 'English',
        content: `# Essay Writing Basics

## Essay Structure

1. **Introduction**: Hook, background, thesis statement
2. **Body Paragraphs**: Topic sentence, evidence, analysis
3. **Conclusion**: Restate thesis, summarize points, closing thought

## Tips for Success

- Start with an outline
- Use clear topic sentences
- Support claims with evidence
- Proofread carefully`,
        createdBy: 'teacher-1',
        createdAt: new Date('2024-01-25'),
        updatedAt: new Date('2024-01-25'),
        published: true,
    },
];

// Mock Quizzes
export const mockQuizzes: Quiz[] = [
    {
        id: 'quiz-1',
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
            {
                id: 'q3',
                question: 'Solve: 2x = 10',
                type: 'short-answer',
                correctAnswer: '5',
                points: 10,
            },
        ],
        timeLimit: 15,
        passingScore: 70,
        createdBy: 'teacher-1',
        createdAt: new Date('2024-01-16'),
    },
];

// Mock Progress
export const mockProgress: Progress[] = [
    {
        studentId: 'student-1',
        materialId: 'math-101',
        completed: true,
        progress: 100,
        lastAccessed: new Date('2024-01-20'),
        timeSpent: 45,
    },
    {
        studentId: 'student-1',
        materialId: 'science-101',
        completed: false,
        progress: 60,
        lastAccessed: new Date('2024-01-22'),
        timeSpent: 30,
    },
    {
        studentId: 'student-2',
        materialId: 'math-101',
        completed: false,
        progress: 75,
        lastAccessed: new Date('2024-01-21'),
        timeSpent: 35,
    },
];

// Mock Calendar Events
export const mockCalendarEvents: CalendarEvent[] = [
    {
        id: 'event-1',
        title: 'Math Class - Algebra',
        description: 'Weekly algebra lesson',
        type: 'class',
        startTime: new Date('2024-01-25T10:00:00'),
        endTime: new Date('2024-01-25T11:00:00'),
        participants: ['student-1', 'student-2', 'teacher-1'],
        meetingLink: 'https://meet.example.com/math-class',
        createdBy: 'teacher-1',
    },
    {
        id: 'event-2',
        title: 'Science Project Deadline',
        description: 'Submit your scientific method project',
        type: 'deadline',
        startTime: new Date('2024-01-30T23:59:00'),
        endTime: new Date('2024-01-30T23:59:00'),
        participants: ['student-1'],
        createdBy: 'teacher-1',
    },
    {
        id: 'event-3',
        title: 'Parent-Teacher Meeting',
        description: 'Discuss student progress',
        type: 'meeting',
        startTime: new Date('2024-01-28T14:00:00'),
        endTime: new Date('2024-01-28T14:30:00'),
        participants: ['parent-1', 'teacher-1'],
        meetingLink: 'https://meet.example.com/parent-teacher',
        createdBy: 'teacher-1',
    },
];

// Mock Notes
export const mockNotes: Note[] = [
    {
        id: 'note-1',
        title: 'Algebra Key Points',
        content: 'Remember: always isolate the variable on one side of the equation.',
        materialId: 'math-101',
        createdBy: 'student-1',
        createdAt: new Date('2024-01-18'),
        updatedAt: new Date('2024-01-18'),
        tags: ['algebra', 'math'],
    },
    {
        id: 'note-2',
        title: 'Scientific Method Steps',
        content: 'The 6 steps: Question, Research, Hypothesis, Experiment, Analysis, Conclusion',
        materialId: 'science-101',
        createdBy: 'student-1',
        createdAt: new Date('2024-01-22'),
        updatedAt: new Date('2024-01-22'),
        tags: ['science', 'method'],
    },
];

// Helper functions
export function getMaterialById(id: string): Material | undefined {
    return mockMaterials.find(m => m.id === id);
}

export function getStudentProgress(studentId: string): Progress[] {
    return mockProgress.filter(p => p.studentId === studentId);
}

export function getStudentEvents(studentId: string): CalendarEvent[] {
    return mockCalendarEvents.filter(e => e.participants.includes(studentId));
}

export function getStudentNotes(studentId: string): Note[] {
    return mockNotes.filter(n => n.createdBy === studentId);
}
