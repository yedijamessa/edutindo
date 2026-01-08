//Server component - fetches quizzes from Firestore
import { getQuizzes } from "@/lib/db-services";
import QuizzesClient from "./quizzes-client";

export default async function StudentQuizzesPage() {
    // Fetch quizzes from Firestore
    const quizzes = await getQuizzes();

    // Pass to client component
    return <QuizzesClient quizzes={quizzes} />;
}
