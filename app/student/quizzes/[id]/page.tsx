import { notFound } from "next/navigation";
import { getQuizById } from "@/lib/db-services";
import QuizTaker from "./quiz-taker";



export default async function QuizDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const quiz = await getQuizById(id);

    if (!quiz) {
        notFound();
    }

    return <QuizTaker quiz={quiz} />;
}
