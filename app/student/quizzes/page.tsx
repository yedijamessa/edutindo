// Server component - fetches quizzes from SQL and Firestore.
import { getQuizzes } from "@/lib/quiz-services";
import QuizzesClient from "./quizzes-client";

export default async function StudentQuizzesPage() {
    const quizzes = await getQuizzes();

    return <QuizzesClient quizzes={quizzes} />;
}
