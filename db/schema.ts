
import { pgTable, text, timestamp, boolean, jsonb, integer, serial } from 'drizzle-orm/pg-core';

// --- Users ---
export const users = pgTable('users', {
    id: text('id').primaryKey(), // Firebase UID or similar
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    role: text('role').notNull().default('student'), // 'student', 'teacher', 'parent'
    avatar: text('avatar'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- Materials ---
export const materials = pgTable('materials', {
    id: text('id').primaryKey(), // We can use slugs like 'math-101'
    title: text('title').notNull(),
    description: text('description').notNull(),
    subject: text('subject').notNull(),
    content: text('content'), // Markdown content
    type: text('type').notNull().default('document'), // 'video', 'pdf', 'document'
    url: text('url'), // For external links or video URLs
    prerequisites: jsonb('prerequisites'), // Array of { materialId, requiredQuizScore }
    published: boolean('published').default(false).notNull(),
    createdBy: text('created_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- Quizzes ---
export const quizzes = pgTable('quizzes', {
    id: text('id').primaryKey(),
    materialId: text('material_id').references(() => materials.id).notNull(),
    title: text('title').notNull(),
    description: text('description'),
    questions: jsonb('questions').notNull(), // Array of Question objects
    timeLimit: integer('time_limit'), // in minutes
    passingScore: integer('passing_score').default(70).notNull(),
    createdBy: text('created_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- Student Progress ---
export const progress = pgTable('progress', {
    id: serial('id').primaryKey(),
    studentId: text('student_id').references(() => users.id).notNull(),
    materialId: text('material_id').references(() => materials.id).notNull(),
    completed: boolean('completed').default(false).notNull(),
    progress: integer('progress').default(0).notNull(), // 0-100
    quizScores: jsonb('quiz_scores'), // Array of score history
    lastAccessed: timestamp('last_accessed').defaultNow(),
    timeSpent: integer('time_spent').default(0), // in minutes
});

// --- Resources/Mindmaps (Extra) ---
export const mindmaps = pgTable('mindmaps', {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    subject: text('subject'),
    nodes: jsonb('nodes').notNull(), // The complex node structure
    createdBy: text('created_by').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
