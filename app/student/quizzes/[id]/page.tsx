import { notFound } from "next/navigation";
import { getQuizById } from "@/lib/firestore-services";
import QuizTaker from "./quiz-taker";

export async function generateStaticParams() {
    // For static export, we'll generate params for existing quizzes
    // In production, you might want to fetch this from Firestore
    return [
        { id: 'quiz-1' },
    ];
}

export default async function QuizDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const quiz = await getQuizById(id);

    if (!quiz) {
        notFound();
    }

    return <QuizTaker quiz={quiz} />;
}
