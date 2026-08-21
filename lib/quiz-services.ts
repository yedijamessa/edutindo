import type { Quiz } from "@/types/lms";
import {
  getQuizById as getPostgresQuizById,
  getQuizzes as getPostgresQuizzes,
} from "@/lib/db-services";

async function safely<T>(action: () => Promise<T>, fallback: T) {
  try {
    return await action();
  } catch (error) {
    console.error("quiz service source failed:", error);
    return fallback;
  }
}

export async function getQuizById(id: string): Promise<Quiz | null> {
  const quiz = await safely(() => getPostgresQuizById(id), null);
  return quiz as Quiz | null;
}

export async function getQuizzes(): Promise<Quiz[]> {
  const quizzes = await safely(() => getPostgresQuizzes(), []);
  return (quizzes as Quiz[]).sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
}
