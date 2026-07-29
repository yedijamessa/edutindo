import type { ModuleEditorPage, ModuleEditorQuizType } from "@/types/module-editor";
import type { Question, QuestionType } from "@/types/lms";

export interface GenerateQuizParams {
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  questionCount: number;
  types: QuestionType[];
}

export interface ModuleEditorQuizRecommendation {
  quizType: ModuleEditorQuizType;
  focusTopic: string;
  prompt: string;
  options: string[];
  correctOptionIndexes: number[];
  acceptableAnswers?: string[];
  matchingPairs?: Array<{ prompt: string; match: string }>;
  orderingItems?: string[];
  explanation: string;
}

export interface ModuleEditorSectionRecommendation {
  focusTopic: string;
  title: string;
  body: string;
}

export interface ModuleEditorAiContext {
  page?: ModuleEditorPage | null;
  pages?: ModuleEditorPage[];
  moduleTitle?: string;
  subjectTitle?: string;
  chapterTitle?: string;
}

export interface AiChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AiApiSuccess<T> {
  ok: true;
  data: T;
  provider: string;
  model: string;
}

interface AiApiFailure {
  ok: false;
  error: string;
}

type AiApiResponse<T> = AiApiSuccess<T> | AiApiFailure;

async function postAiRequest<T>(payload: unknown): Promise<T> {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => null)) as AiApiResponse<T> | null;

  if (!response.ok || !data || !data.ok) {
    throw new Error(data && "error" in data ? data.error : "AI request failed.");
  }

  return data.data;
}

export async function generateQuizQuestions(params: GenerateQuizParams): Promise<Question[]> {
  return postAiRequest<Question[]>({
    task: "quiz-generator",
    ...params,
  });
}

export async function recommendQuizForPage(
  context: ModuleEditorAiContext
): Promise<ModuleEditorQuizRecommendation> {
  return postAiRequest<ModuleEditorQuizRecommendation>({
    task: "module-editor",
    action: "page-quiz",
    context,
  });
}

export async function recommendQuizForModule(
  context: ModuleEditorAiContext
): Promise<ModuleEditorQuizRecommendation> {
  return postAiRequest<ModuleEditorQuizRecommendation>({
    task: "module-editor",
    action: "module-quiz",
    context,
  });
}

export async function recommendSectionExpansion(
  context: ModuleEditorAiContext
): Promise<ModuleEditorSectionRecommendation> {
  return postAiRequest<ModuleEditorSectionRecommendation>({
    task: "module-editor",
    action: "section",
    context,
  });
}

export async function generateAiChatReply(messages: AiChatMessage[]): Promise<string> {
  const result = await postAiRequest<{ reply: string }>({
    task: "chat",
    messages,
  });

  return result.reply;
}
