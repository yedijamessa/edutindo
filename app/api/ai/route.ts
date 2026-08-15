import { NextRequest, NextResponse } from "next/server";
import {
  type GenerateQuizParams,
  type AiChatMessage,
  type ModuleEditorAiContext,
  type ModuleEditorQuizRecommendation,
  type ModuleEditorSectionRecommendation,
} from "@/lib/ai-services";
import { generateStructuredObject, generateText } from "@/lib/server/ai";
import type { Question, QuestionType } from "@/types/lms";

export const runtime = "nodejs";

type ModuleEditorAction = "page-quiz" | "module-quiz" | "section";

const MODULE_EDITOR_QUIZ_TYPES = [
  "multiple-choice-single",
  "multiple-choice-multiple",
  "true-false",
  "short-answer",
  "fill-in-the-blank",
  "matching",
  "ordering",
  "essay",
] as const;

const QUIZ_GENERATION_TYPES = ["multiple-choice", "true-false", "short-answer", "essay"] as const;

const MODULE_EDITOR_QUIZ_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    quizType: { type: "string", enum: [...MODULE_EDITOR_QUIZ_TYPES] },
    focusTopic: { type: "string" },
    prompt: { type: "string" },
    options: {
      type: "array",
      items: { type: "string" },
    },
    correctOptionIndexes: {
      type: "array",
      items: { type: "integer" },
    },
    acceptableAnswers: {
      type: "array",
      items: { type: "string" },
    },
    matchingPairs: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          prompt: { type: "string" },
          match: { type: "string" },
        },
        required: ["prompt", "match"],
      },
    },
    orderingItems: {
      type: "array",
      items: { type: "string" },
    },
    explanation: { type: "string" },
  },
  required: [
    "quizType",
    "focusTopic",
    "prompt",
    "options",
    "correctOptionIndexes",
    "acceptableAnswers",
    "matchingPairs",
    "orderingItems",
    "explanation",
  ],
} as const;

const MODULE_EDITOR_SECTION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    focusTopic: { type: "string" },
    title: { type: "string" },
    body: { type: "string" },
  },
  required: ["focusTopic", "title", "body"],
} as const;

const QUIZ_GENERATION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    questions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          question: { type: "string" },
          type: { type: "string", enum: [...QUIZ_GENERATION_TYPES] },
          options: {
            type: "array",
            items: { type: "string" },
          },
          correctAnswer: {
            anyOf: [{ type: "string" }, { type: "integer" }],
          },
          points: { type: "integer" },
        },
        required: ["question", "type", "options", "correctAnswer", "points"],
      },
    },
  },
  required: ["questions"],
} as const;

function toErrorResponse(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function safeTrim(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function truncate(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength - 1)}…` : value;
}

function summarizeModuleContext(context: ModuleEditorAiContext) {
  const pageSummary = context.page
    ? [
        `Selected page title: ${context.page.title || "Untitled page"}`,
        `Selected page intro: ${context.page.description || "None"}`,
        `Selected page blocks:`,
        ...context.page.blocks.map((block, index) => {
          if (block.type === "text") {
            return `${index + 1}. Text block. Heading: ${block.title || "None"}. Body: ${truncate(block.body || "", 700)}`;
          }

          if (block.type === "image") {
            return `${index + 1}. Image block. Alt text: ${block.altText || "None"}. Caption: ${truncate(block.caption || "", 300)}`;
          }

          return `${index + 1}. Quiz block. Type: ${block.quizType}. Prompt: ${truncate(block.prompt || "", 300)}.`;
        }),
      ].join("\n")
    : "No selected page details were supplied.";

  const otherPageSummary = (context.pages ?? [])
    .slice(0, 12)
    .map((page, index) => `${index + 1}. ${page.title || `Page ${index + 1}`}: ${truncate(page.description || "", 180)}`)
    .join("\n");

  return [
    `Subject: ${context.subjectTitle || "Unknown subject"}`,
    `Chapter: ${context.chapterTitle || "Unknown chapter"}`,
    `Module title: ${context.moduleTitle || "Untitled module"}`,
    `Total pages: ${context.pages?.length ?? (context.page ? 1 : 0)}`,
    pageSummary,
    otherPageSummary ? `Module page list:\n${otherPageSummary}` : "Module page list: not available.",
  ].join("\n\n");
}

function buildModuleEditorPrompts(action: ModuleEditorAction, context: ModuleEditorAiContext) {
  const sharedSystemPrompt =
    "You are an expert curriculum designer for school learning materials. Return only valid JSON that matches the schema exactly. Keep outputs classroom-ready, specific to the supplied lesson content, and easy for teachers to edit.";
  const contextSummary = summarizeModuleContext(context);

  if (action === "page-quiz") {
    return {
      systemPrompt: sharedSystemPrompt,
      userPrompt: [
        "Create one quiz recommendation for the selected page.",
        "Use the page content as the main source of truth.",
        "Prefer a clear, high-quality question that checks understanding rather than memorization.",
        "If you choose multiple-choice or true-false, include strong distractors.",
        "If the page supports short-answer, matching, ordering, or fill-in-the-blank better, you may choose that type.",
        contextSummary,
      ].join("\n\n"),
    };
  }

  if (action === "module-quiz") {
    return {
      systemPrompt: sharedSystemPrompt,
      userPrompt: [
        "Create one quiz recommendation for the whole module.",
        "Use the module title as the strongest signal for the main learning objective.",
        "The quiz should feel appropriate as a module-level checkpoint, not just a page-level check.",
        "Make sure the recommended quiz clearly aligns with the module title even if page details vary.",
        contextSummary,
      ].join("\n\n"),
    };
  }

  return {
    systemPrompt: sharedSystemPrompt,
    userPrompt: [
      "Recommend one additional text section that should be explained better on the selected page.",
      "Identify the most useful missing explanation, misconception, example, or supporting idea.",
      "Return a title and a concise markdown body the editor can insert directly as a text block.",
      "Use bullet points when helpful, but keep the content actionable and teacher-friendly.",
      contextSummary,
    ].join("\n\n"),
  };
}

function buildQuizGenerationPrompts(params: GenerateQuizParams) {
  return {
    systemPrompt:
      "You are an assessment writer for school learners. Return only valid JSON matching the schema. Write clear questions, avoid ambiguous wording, and keep answers educationally sound.",
    userPrompt: [
      `Topic: ${params.topic}`,
      `Difficulty: ${params.difficulty}`,
      `Question count: ${params.questionCount}`,
      `Allowed question types: ${params.types.join(", ")}`,
      "For multiple-choice questions, provide 4 options and set correctAnswer to the zero-based index of the correct option.",
      "For true-false questions, provide options [\"True\", \"False\"] and set correctAnswer to 0 or 1.",
      "For short-answer and essay questions, set correctAnswer to a short model answer string.",
      "Use sensible point values between 10 and 20 depending on difficulty and type.",
    ].join("\n"),
  };
}

function buildChatPrompts(messages: AiChatMessage[]) {
  const transcript = messages
    .slice(-12)
    .map((message) => `${message.role === "user" ? "Student" : "Assistant"}: ${message.content}`)
    .join("\n");

  return {
    systemPrompt:
      "You are Edutindo's friendly AI learning assistant. Be warm, concise, and helpful. Explain concepts clearly, guide the student step by step when useful, and avoid pretending you know classroom-specific facts that were not provided.",
    userPrompt: transcript || "Student: Hello",
  };
}

function normalizeQuestion(question: Omit<Question, "id">, index: number): Question {
  return {
    id: `ai-q-${Date.now()}-${index}`,
    question: question.question,
    type: question.type,
    options: question.type === "multiple-choice"
      ? Array.isArray(question.options) && question.options.length >= 2
        ? question.options.slice(0, 6)
        : ["Option A", "Option B", "Option C", "Option D"]
      : question.type === "true-false"
        ? ["True", "False"]
        : undefined,
    correctAnswer:
      question.type === "multiple-choice" || question.type === "true-false"
        ? typeof question.correctAnswer === "number"
          ? question.correctAnswer
          : 0
        : typeof question.correctAnswer === "string"
          ? question.correctAnswer
          : "",
    points: Math.max(1, Math.min(100, Number(question.points) || 10)),
  };
}

function isValidQuestionType(value: unknown): value is QuestionType {
  return typeof value === "string" && QUIZ_GENERATION_TYPES.includes(value as QuestionType);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return toErrorResponse("Invalid AI request body.");
    }

    if (body.task === "module-editor") {
      const action = body.action as ModuleEditorAction;
      const context = (body.context ?? {}) as ModuleEditorAiContext;

      if (!action || !["page-quiz", "module-quiz", "section"].includes(action)) {
        return toErrorResponse("Invalid module editor AI action.");
      }

      const prompts = buildModuleEditorPrompts(action, context);

      if (action === "section") {
        const result = await generateStructuredObject<ModuleEditorSectionRecommendation>({
          ...prompts,
          schemaName: "module_editor_section_recommendation",
          schema: MODULE_EDITOR_SECTION_SCHEMA,
        });

        return NextResponse.json({ ok: true, data: result.data, provider: result.provider, model: result.model });
      }

      const result = await generateStructuredObject<ModuleEditorQuizRecommendation>({
        ...prompts,
        schemaName:
          action === "page-quiz" ? "module_editor_page_quiz_recommendation" : "module_editor_module_quiz_recommendation",
        schema: MODULE_EDITOR_QUIZ_SCHEMA,
      });

      return NextResponse.json({ ok: true, data: result.data, provider: result.provider, model: result.model });
    }

    if (body.task === "quiz-generator") {
      const params: GenerateQuizParams = {
        topic: safeTrim(body.topic),
        difficulty: body.difficulty,
        questionCount: Number(body.questionCount) || 5,
        types: Array.isArray(body.types) ? body.types.filter(isValidQuestionType) : [],
      };

      if (!params.topic) {
        return toErrorResponse("Quiz topic is required.");
      }

      if (!["easy", "medium", "hard"].includes(params.difficulty)) {
        return toErrorResponse("Quiz difficulty is invalid.");
      }

      if (params.types.length === 0) {
        return toErrorResponse("At least one valid quiz type is required.");
      }

      const prompts = buildQuizGenerationPrompts(params);
      const result = await generateStructuredObject<{ questions: Array<Omit<Question, "id">> }>({
        ...prompts,
        schemaName: "quiz_question_set",
        schema: QUIZ_GENERATION_SCHEMA,
      });

      const questions = result.data.questions
        .filter((question) => isValidQuestionType(question.type))
        .slice(0, params.questionCount)
        .map((question, index) => normalizeQuestion(question, index));

      return NextResponse.json({ ok: true, data: questions, provider: result.provider, model: result.model });
    }

    if (body.task === "chat") {
      const messages = Array.isArray(body.messages)
        ? (body.messages as AiChatMessage[]).filter(
            (message) =>
              message &&
              (message.role === "user" || message.role === "assistant") &&
              typeof message.content === "string" &&
              message.content.trim().length > 0
          )
        : [];

      if (messages.length === 0) {
        return toErrorResponse("At least one chat message is required.");
      }

      const prompts = buildChatPrompts(messages);
      const result = await generateText(prompts);

      return NextResponse.json({
        ok: true,
        data: { reply: result.data },
        provider: result.provider,
        model: result.model,
      });
    }

    return toErrorResponse("Unsupported AI task.");
  } catch (error) {
    console.error("[POST /api/ai]", error);
    return toErrorResponse(error instanceof Error ? error.message : "AI request failed.", 500);
  }
}
