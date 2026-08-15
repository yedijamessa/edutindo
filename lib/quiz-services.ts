import type { Quiz } from "@/types/lms";
import {
  getQuizById as getSqlQuizById,
  getQuizzes as getSqlQuizzes,
} from "@/lib/db-services";
import {
  getQuizById as getFirestoreQuizById,
  getQuizzes as getFirestoreQuizzes,
} from "@/lib/firestore-services";

async function safely<T>(action: () => Promise<T>, fallback: T) {
  try {
    return await action();
  } catch (error) {
    console.error("quiz service source failed:", error);
    return fallback;
  }
}

export async function getQuizById(id: string): Promise<Quiz | null> {
  const sqlQuiz = await safely(() => getSqlQuizById(id), null);
  if (sqlQuiz) return sqlQuiz as Quiz;

  return safely(() => getFirestoreQuizById(id), null);
}

export async function getQuizzes(): Promise<Quiz[]> {
  const [sqlQuizzes, firestoreQuizzes] = await Promise.all([
    safely(() => getSqlQuizzes(), []),
    safely(() => getFirestoreQuizzes(), []),
  ]);
  const quizzesById = new Map<string, Quiz>();

  for (const quiz of [...sqlQuizzes, ...firestoreQuizzes]) {
    quizzesById.set(quiz.id, quiz as Quiz);
  }

  return Array.from(quizzesById.values()).sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
}
