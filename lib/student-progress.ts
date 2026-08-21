import "@/lib/server-only";

import { sqlQuery } from "@/lib/postgres-query";
import type { Progress, QuizAttemptReview, QuizQuestionReview, QuestionType } from "@/types/lms";

type ProgressRow = {
  id: number;
  student_id: string;
  material_id: string;
  completed: boolean;
  progress: number;
  quiz_scores: unknown;
  last_accessed: Date | string | null;
  time_spent: number | null;
};

type SaveProgressInput = {
  studentId: string;
  studentEmail?: string;
  studentName?: string;
  materialId: string;
  materialTitle?: string;
  completed: boolean;
  progress: number;
  timeSpent: number;
  quizAttempt?: QuizAttemptReview | null;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function toDate(value: unknown, fallback = new Date()) {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? fallback : date;
  }

  const record = asRecord(value);
  if (typeof record.seconds === "number") {
    return new Date(record.seconds * 1000);
  }

  return fallback;
}

function toNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function toQuestionType(value: unknown): QuestionType {
  return value === "true-false" || value === "short-answer" || value === "essay"
    ? value
    : "multiple-choice";
}

function normalizeQuestionResults(value: unknown): QuizQuestionReview[] {
  if (!Array.isArray(value)) return [];

  return value.map((item, index) => {
    const record = asRecord(item);
    const correctAnswer = typeof record.correctAnswer === "number" || typeof record.correctAnswer === "string"
      ? record.correctAnswer
      : "";
    const studentAnswer = typeof record.studentAnswer === "number" || typeof record.studentAnswer === "string"
      ? record.studentAnswer
      : null;

    return {
      questionId: typeof record.questionId === "string" ? record.questionId : String(index),
      questionText: typeof record.questionText === "string" ? record.questionText : `Question ${index + 1}`,
      questionType: toQuestionType(record.questionType),
      options: Array.isArray(record.options) ? record.options.map(String) : [],
      correctAnswer,
      studentAnswer,
      isCorrect: Boolean(record.isCorrect),
      points: Math.max(0, toNumber(record.points, 1)),
      earnedPoints: Math.max(0, toNumber(record.earnedPoints, 0)),
    };
  });
}

function normalizeAttempt(value: unknown, materialId: string): QuizAttemptReview | null {
  const record = asRecord(value);
  const quizId = typeof record.quizId === "string" ? record.quizId : "";
  if (!quizId) return null;

  const completedAt = toDate(record.completedAt);
  const startedAt = toDate(record.startedAt, completedAt);

  return {
    attemptId: typeof record.attemptId === "string" ? record.attemptId : `${quizId}-${completedAt.getTime()}`,
    quizId,
    quizTitle: typeof record.quizTitle === "string" ? record.quizTitle : quizId,
    materialId: typeof record.materialId === "string" ? record.materialId : materialId,
    score: Math.max(0, Math.min(100, Math.round(toNumber(record.score, 0)))),
    earnedPoints: Math.max(0, toNumber(record.earnedPoints, 0)),
    totalPoints: Math.max(0, toNumber(record.totalPoints, 0)),
    passed: Boolean(record.passed),
    startedAt,
    completedAt,
    timeSpentSeconds: Math.max(0, Math.round(toNumber(record.timeSpentSeconds, 0))),
    questionResults: normalizeQuestionResults(record.questionResults),
  };
}

function normalizeQuizScores(value: unknown, materialId: string): NonNullable<Progress["quizScores"]> {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    const record = asRecord(item);
    const quizId = typeof record.quizId === "string" ? record.quizId : "";
    if (!quizId) return [];

    const lastAttempt = toDate(record.lastAttempt);
    const attemptHistory = Array.isArray(record.attemptHistory)
      ? record.attemptHistory.flatMap((attempt) => normalizeAttempt(attempt, materialId) ?? [])
      : [];

    return [{
      quizId,
      quizTitle: typeof record.quizTitle === "string" ? record.quizTitle : undefined,
      score: Math.max(0, Math.min(100, Math.round(toNumber(record.score, 0)))),
      attempts: Math.max(1, Math.round(toNumber(record.attempts, attemptHistory.length || 1))),
      lastAttempt,
      earnedPoints: typeof record.earnedPoints === "number" ? record.earnedPoints : undefined,
      totalPoints: typeof record.totalPoints === "number" ? record.totalPoints : undefined,
      passed: typeof record.passed === "boolean" ? record.passed : undefined,
      attemptHistory,
    }];
  });
}

function mapProgressRow(row: ProgressRow): Progress {
  return {
    studentId: row.student_id,
    materialId: row.material_id,
    completed: row.completed,
    progress: row.progress,
    lastAccessed: toDate(row.last_accessed),
    timeSpent: row.time_spent ?? 0,
    quizScores: normalizeQuizScores(row.quiz_scores, row.material_id),
  };
}

function mergeQuizAttempt(
  scores: NonNullable<Progress["quizScores"]>,
  attempt: QuizAttemptReview
): NonNullable<Progress["quizScores"]> {
  const scoreIndex = scores.findIndex((score) => score.quizId === attempt.quizId);

  if (scoreIndex === -1) {
    return [
      ...scores,
      {
        quizId: attempt.quizId,
        quizTitle: attempt.quizTitle,
        score: attempt.score,
        attempts: 1,
        lastAttempt: attempt.completedAt,
        earnedPoints: attempt.earnedPoints,
        totalPoints: attempt.totalPoints,
        passed: attempt.passed,
        attemptHistory: [attempt],
      },
    ];
  }

  return scores.map((score, index) => {
    if (index !== scoreIndex) return score;
    const attemptHistory = Array.isArray(score.attemptHistory) ? score.attemptHistory : [];

    return {
      ...score,
      quizTitle: attempt.quizTitle,
      score: attempt.score,
      attempts: Math.max(0, score.attempts ?? 0) + 1,
      lastAttempt: attempt.completedAt,
      earnedPoints: attempt.earnedPoints,
      totalPoints: attempt.totalPoints,
      passed: attempt.passed,
      attemptHistory: [...attemptHistory, attempt],
    };
  });
}

async function ensureMaterial(materialId: string, materialTitle?: string) {
  await sqlQuery`
    INSERT INTO materials (id, title, description, subject, content, type, published)
    VALUES (
      ${materialId},
      ${materialTitle?.trim() || materialId},
      'Curriculum module progress record',
      'Curriculum',
      '',
      'document',
      true
    )
    ON CONFLICT (id) DO NOTHING
  `;
}

async function ensureProgressUser(input: {
  studentId: string;
  studentEmail?: string;
  studentName?: string;
}) {
  const bridgeEmail = `${input.studentId}@progress.edutindo.local`;
  const name = input.studentName?.trim() || input.studentEmail?.trim().toLowerCase() || bridgeEmail;
  const existing = await sqlQuery<{ id: string }>`
    SELECT id
    FROM users
    WHERE id = ${input.studentId}
    LIMIT 1
  `;

  if (existing.rows[0]) {
    await sqlQuery`
      UPDATE users
      SET name = ${name},
          role = 'student',
          updated_at = NOW()
      WHERE id = ${input.studentId}
    `;
    return;
  }

  await sqlQuery`
    INSERT INTO users (id, name, email, role, updated_at)
    VALUES (${input.studentId}, ${name}, ${bridgeEmail}, 'student', NOW())
    ON CONFLICT (id) DO UPDATE
    SET name = EXCLUDED.name,
        role = EXCLUDED.role,
        updated_at = NOW()
  `;
}

async function getProgressRow(studentId: string, materialId: string) {
  const result = await sqlQuery<ProgressRow>`
    SELECT id, student_id, material_id, completed, progress, quiz_scores, last_accessed, time_spent
    FROM progress
    WHERE student_id = ${studentId} AND material_id = ${materialId}
    ORDER BY id DESC
    LIMIT 1
  `;

  return result.rows[0] ?? null;
}

export async function getStudentProgress(studentId: string): Promise<Progress[]> {
  const result = await sqlQuery<ProgressRow>`
    SELECT id, student_id, material_id, completed, progress, quiz_scores, last_accessed, time_spent
    FROM progress
    WHERE student_id = ${studentId}
    ORDER BY last_accessed DESC NULLS LAST, id DESC
  `;

  return result.rows.map(mapProgressRow);
}

export async function saveStudentModuleProgress(input: SaveProgressInput) {
  await ensureProgressUser(input);
  await ensureMaterial(input.materialId, input.materialTitle);

  const existing = await getProgressRow(input.studentId, input.materialId);
  const quizScores = input.quizAttempt
    ? mergeQuizAttempt(normalizeQuizScores(existing?.quiz_scores, input.materialId), input.quizAttempt)
    : normalizeQuizScores(existing?.quiz_scores, input.materialId);
  const quizScoresJson = JSON.stringify(quizScores);

  if (existing) {
    await sqlQuery`
      UPDATE progress
      SET completed = ${input.completed},
          progress = ${input.progress},
          time_spent = ${input.timeSpent},
          quiz_scores = ${quizScoresJson}::jsonb,
          last_accessed = NOW()
      WHERE id = ${existing.id}
    `;
    return;
  }

  await sqlQuery`
    INSERT INTO progress (student_id, material_id, completed, progress, time_spent, quiz_scores, last_accessed)
    VALUES (
      ${input.studentId},
      ${input.materialId},
      ${input.completed},
      ${input.progress},
      ${input.timeSpent},
      ${quizScoresJson}::jsonb,
      NOW()
    )
  `;
}

export async function saveStudentQuizAttempt(input: {
  studentId: string;
  studentEmail?: string;
  studentName?: string;
  attempt: QuizAttemptReview;
}) {
  const { attempt, studentId } = input;
  await ensureProgressUser(input);
  await ensureMaterial(attempt.materialId, attempt.quizTitle);

  const existing = await getProgressRow(studentId, attempt.materialId);
  const quizScores = mergeQuizAttempt(normalizeQuizScores(existing?.quiz_scores, attempt.materialId), attempt);
  const quizScoresJson = JSON.stringify(quizScores);

  if (existing) {
    await sqlQuery`
      UPDATE progress
      SET quiz_scores = ${quizScoresJson}::jsonb,
          last_accessed = NOW()
      WHERE id = ${existing.id}
    `;
    return;
  }

  await sqlQuery`
    INSERT INTO progress (student_id, material_id, completed, progress, time_spent, quiz_scores, last_accessed)
    VALUES (${studentId}, ${attempt.materialId}, false, 0, 0, ${quizScoresJson}::jsonb, NOW())
  `;
}
