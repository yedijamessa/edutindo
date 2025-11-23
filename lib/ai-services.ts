// AI Service for generating content
// In a real app, this would call OpenAI/Gemini API

import { Question, QuestionType } from "@/types/lms";

interface GenerateQuizParams {
    topic: string;
    difficulty: 'easy' | 'medium' | 'hard';
    questionCount: number;
    types: QuestionType[];
}

export async function generateQuizQuestions({
    topic,
    difficulty,
    questionCount,
    types
}: GenerateQuizParams): Promise<Question[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const questions: Question[] = [];

    for (let i = 0; i < questionCount; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const id = `ai-q-${Date.now()}-${i}`;

        if (type === 'multiple-choice') {
            questions.push({
                id,
                type: 'multiple-choice',
                question: `What is a key concept in ${topic} related to ${difficulty} level? (Question ${i + 1})`,
                options: [
                    `Concept A related to ${topic}`,
                    `Concept B related to ${topic}`,
                    `Concept C related to ${topic}`,
                    `Concept D related to ${topic}`
                ],
                correctAnswer: 0,
                points: 10
            });
        } else if (type === 'true-false') {
            questions.push({
                id,
                type: 'true-false',
                question: `True or False: ${topic} is a fundamental part of modern science. (Question ${i + 1})`,
                options: ['True', 'False'],
                correctAnswer: 0,
                points: 10
            });
        } else if (type === 'short-answer') {
            questions.push({
                id,
                type: 'short-answer',
                question: `Explain the importance of ${topic} in your own words. (Question ${i + 1})`,
                correctAnswer: '',
                points: 15
            });
        } else if (type === 'essay') {
            questions.push({
                id,
                type: 'essay',
                question: `Write a detailed essay about the history and future of ${topic}. (Question ${i + 1})`,
                correctAnswer: '',
                points: 20
            });
        }
    }

    return questions;
}
