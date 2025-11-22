import { notFound } from "next/navigation";
import { mockQuizzes } from "@/lib/mock-data";
import QuizTaker from "./quiz-taker";

export function generateStaticParams() {
    return mockQuizzes.map((quiz) => ({
        id: quiz.id,
    }));
}

export default async function QuizDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const quiz = mockQuizzes.find(q => q.id === id);

    if (!quiz) {
        notFound();
    }

    return <QuizTaker quiz={quiz} />;
}
