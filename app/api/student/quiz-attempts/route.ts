import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getQuizById } from "@/lib/quiz-services";
import { saveQuizAttempt } from "@/lib/firestore-services";
import type { Question, QuizAttemptReview } from "@/types/lms";

type SubmittedAnswer = string | number | null;

function normalizeText(value: unknown) {
  return String(value ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

function normalizeSubmittedAnswer(value: unknown): SubmittedAnswer {
  if (typeof value === "number" || typeof value === "string") return value;
  return null;
}

function getAnswerForQuestion(answers: Record<string, unknown>, question: Question, index: number) {
  return normalizeSubmittedAnswer(answers[question.id] ?? answers[String(index)] ?? answers[index]);
}

function isAnswerCorrect(question: Question, studentAnswer: SubmittedAnswer) {
  if (studentAnswer === null) return false;

  if (typeof question.correctAnswer === "number") {
    return Number(studentAnswer) === question.correctAnswer;
  }

  return normalizeText(studentAnswer) === normalizeText(question.correctAnswer);
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

    const body = await req.json();
    const quizId = String(body?.quizId ?? "").trim();
    const startedAt = new Date(String(body?.startedAt ?? ""));
    const completedAt = new Date();
    const answers = body?.answers && typeof body.answers === "object" ? body.answers as Record<string, unknown> : {};

    if (!quizId) {
      return NextResponse.json({ ok: false, error: "Quiz ID is required." }, { status: 400 });
    }

    const quiz = await getQuizById(quizId);
    if (!quiz) {
      return NextResponse.json({ ok: false, error: "Quiz not found." }, { status: 404 });
    }

    const questionResults = quiz.questions.map((question, index) => {
      const studentAnswer = getAnswerForQuestion(answers, question, index);
      const isCorrect = isAnswerCorrect(question, studentAnswer);

      return {
        questionId: question.id || String(index),
        questionText: question.question,
        questionType: question.type,
        options: question.options,
        correctAnswer: question.correctAnswer,
        studentAnswer,
        isCorrect,
        points: question.points,
        earnedPoints: isCorrect ? question.points : 0,
      };
    });

    const totalPoints = questionResults.reduce((sum, question) => sum + question.points, 0);
    const earnedPoints = questionResults.reduce((sum, question) => sum + question.earnedPoints, 0);
    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const safeStartedAt = Number.isNaN(startedAt.getTime()) ? completedAt : startedAt;
    const attempt: QuizAttemptReview = {
      attemptId: `${quiz.id}-${user.id}-${completedAt.getTime()}`,
      quizId: quiz.id,
      quizTitle: quiz.title,
      materialId: quiz.materialId || "general",
      score,
      earnedPoints,
      totalPoints,
      passed: score >= quiz.passingScore,
      startedAt: safeStartedAt,
      completedAt,
      timeSpentSeconds: Math.max(0, Math.round((completedAt.getTime() - safeStartedAt.getTime()) / 1000)),
      questionResults,
    };

    await saveQuizAttempt(user.id, attempt);

    return NextResponse.json({ ok: true, attempt });
  } catch (error) {
    console.error("student quiz attempt POST error:", error);
    return NextResponse.json({ ok: false, error: "Failed to record quiz attempt." }, { status: 500 });
  }
}
