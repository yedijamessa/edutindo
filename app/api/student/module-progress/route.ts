import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateProgress } from "@/lib/firestore-services";
import type { Progress, QuizAttemptReview, QuizQuestionReview } from "@/types/lms";

function safeString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function safeNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeQuestionResults(value: unknown): QuizQuestionReview[] {
  if (!Array.isArray(value)) return [];

  return value.map((item, index) => {
    const record = item && typeof item === "object" ? item as Record<string, unknown> : {};
    const options = Array.isArray(record.options) ? record.options.map(String) : [];
    const correctAnswer = typeof record.correctAnswer === "number" || typeof record.correctAnswer === "string"
      ? record.correctAnswer
      : "";
    const studentAnswer = typeof record.studentAnswer === "number" || typeof record.studentAnswer === "string"
      ? record.studentAnswer
      : null;

    return {
      questionId: safeString(record.questionId, String(index)),
      questionText: safeString(record.questionText, `Question ${index + 1}`),
      questionType: record.questionType === "true-false" ||
        record.questionType === "short-answer" ||
        record.questionType === "essay"
        ? record.questionType
        : "multiple-choice",
      options,
      correctAnswer,
      studentAnswer,
      isCorrect: Boolean(record.isCorrect),
      points: Math.max(0, safeNumber(record.points, 1)),
      earnedPoints: Math.max(0, safeNumber(record.earnedPoints, 0)),
    };
  });
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
    }

    if (!user.isAdmin && !user.portals.includes("student")) {
      return NextResponse.json({ ok: false, error: "Forbidden." }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    const materialId = safeString(body?.materialId);
    const moduleId = safeString(body?.moduleId, materialId);
    const moduleTitle = safeString(body?.moduleTitle, "Module quiz");
    const score = Math.max(0, Math.min(100, Math.round(safeNumber(body?.score, 0))));
    const earnedPoints = Math.max(0, safeNumber(body?.earnedPoints, 0));
    const totalPoints = Math.max(0, safeNumber(body?.totalPoints, 0));
    const questionResults = normalizeQuestionResults(body?.questionResults);
    const completedAt = new Date();
    const startedAt = new Date(safeString(body?.startedAt));
    const safeStartedAt = Number.isNaN(startedAt.getTime()) ? completedAt : startedAt;
    const timeSpentSeconds = Math.max(0, Math.round((completedAt.getTime() - safeStartedAt.getTime()) / 1000));

    if (!materialId) {
      return NextResponse.json({ ok: false, error: "Module material ID is required." }, { status: 400 });
    }

    const quizAttempt: QuizAttemptReview | null =
      totalPoints > 0
        ? {
            attemptId: `${moduleId}-${user.id}-${completedAt.getTime()}`,
            quizId: moduleId,
            quizTitle: moduleTitle,
            materialId,
            score,
            earnedPoints,
            totalPoints,
            passed: true,
            startedAt: safeStartedAt,
            completedAt,
            timeSpentSeconds,
            questionResults,
          }
        : null;

    const progressUpdate: Partial<Progress> = {
      completed: true,
      progress: 100,
      timeSpent: Math.max(1, Math.round(timeSpentSeconds / 60)),
    };

    if (quizAttempt) {
      progressUpdate.quizScores = [{
        quizId: moduleId,
        quizTitle: moduleTitle,
        score,
        attempts: 1,
        lastAttempt: completedAt,
        earnedPoints,
        totalPoints,
        passed: true,
        attemptHistory: [quizAttempt],
      }];
    }

    await updateProgress(user.id, materialId, progressUpdate);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("student module progress POST error:", error);
    return NextResponse.json({ ok: false, error: "Failed to update module progress." }, { status: 500 });
  }
}
