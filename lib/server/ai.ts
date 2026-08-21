type AiProvider = "openai" | "gemini";

interface GenerateTextParams {
  systemPrompt: string;
  userPrompt: string;
  requestedProvider?: AiProvider;
  maxOutputTokens?: number;
}

interface GenerateStructuredObjectParams extends GenerateTextParams {
  schemaName: string;
  schema: Record<string, unknown>;
}

interface AiGenerationSuccess<T> {
  data: T;
  provider: AiProvider;
  model: string;
}

const OPENAI_MODEL = process.env.OPENAI_MODEL?.trim() || "gpt-5";
const GEMINI_MODEL = process.env.GEMINI_MODEL?.trim() || "gemini-3.5-flash";

function getOpenAiReasoningEffort(model: string) {
  const normalized = model.trim().toLowerCase();

  if (!normalized.startsWith("gpt-5") && !/^o\d/.test(normalized)) {
    return null;
  }

  if (normalized.includes("pro")) {
    return "high";
  }

  if (normalized.startsWith("gpt-5.1")) {
    return "none";
  }

  return "minimal";
}

function shouldUseOpenAiVerbosity(model: string) {
  return model.trim().toLowerCase().startsWith("gpt-5");
}

function clampMaxOutputTokens(value: number | undefined, fallback: number) {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(64, Math.min(4096, Math.floor(Number(value))));
}

function getAvailableProviders(requestedProvider?: AiProvider) {
  const configuredProviders: AiProvider[] = [];

  if (process.env.OPENAI_API_KEY?.trim()) {
    configuredProviders.push("openai");
  }

  if (process.env.GEMINI_API_KEY?.trim()) {
    configuredProviders.push("gemini");
  }

  if (configuredProviders.length === 0) {
    throw new Error("No AI API key is configured on the server.");
  }

  if (requestedProvider) {
    const requestedFirst = configuredProviders.includes(requestedProvider)
      ? [requestedProvider]
      : [];
    const remaining = configuredProviders.filter((provider) => provider !== requestedProvider);
    return [...requestedFirst, ...remaining];
  }

  return configuredProviders;
}

function sanitizeJsonText(value: string) {
  const trimmed = value.trim();

  if (trimmed.startsWith("```")) {
    return trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  }

  return trimmed;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getRecordArray(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function extractOpenAiText(payload: unknown): string {
  if (!isRecord(payload)) return "";

  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const parts: string[] = [];

  for (const item of getRecordArray(payload.output)) {
    for (const contentPart of getRecordArray(item.content)) {
      if (typeof contentPart.text === "string" && contentPart.text.trim()) {
        parts.push(contentPart.text);
      }
    }
  }

  return parts.join("\n").trim();
}

function extractGeminiText(payload: unknown): string {
  if (!isRecord(payload)) return "";

  const parts: string[] = [];

  for (const candidate of getRecordArray(payload.candidates)) {
    const content = isRecord(candidate.content) ? candidate.content : {};

    for (const contentPart of getRecordArray(content.parts)) {
      if (typeof contentPart.text === "string" && contentPart.text.trim()) {
        parts.push(contentPart.text);
      }
    }
  }

  return parts.join("\n").trim();
}

function parseStructuredResult<T>(rawText: string): T {
  return JSON.parse(sanitizeJsonText(rawText)) as T;
}

async function callOpenAiText(params: GenerateTextParams): Promise<AiGenerationSuccess<string>> {
  const reasoningEffort = getOpenAiReasoningEffort(OPENAI_MODEL);
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      instructions: params.systemPrompt,
      input: params.userPrompt,
      max_output_tokens: clampMaxOutputTokens(params.maxOutputTokens, 900),
      ...(reasoningEffort ? { reasoning: { effort: reasoningEffort } } : {}),
      ...(shouldUseOpenAiVerbosity(OPENAI_MODEL) ? { text: { verbosity: "low" } } : {}),
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error?.message || "OpenAI request failed.");
  }

  const text = extractOpenAiText(payload);

  if (!text) {
    throw new Error("OpenAI returned an empty response.");
  }

  return {
    data: text,
    provider: "openai",
    model: OPENAI_MODEL,
  };
}

async function callOpenAiStructured<T>(
  params: GenerateStructuredObjectParams
): Promise<AiGenerationSuccess<T>> {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      instructions: params.systemPrompt,
      input: params.userPrompt,
      text: {
        format: {
          type: "json_schema",
          name: params.schemaName,
          schema: params.schema,
          strict: true,
        },
      },
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error?.message || "OpenAI structured request failed.");
  }

  const text = extractOpenAiText(payload);

  if (!text) {
    throw new Error("OpenAI returned an empty structured response.");
  }

  return {
    data: parseStructuredResult<T>(text),
    provider: "openai",
    model: OPENAI_MODEL,
  };
}

async function callGeminiText(params: GenerateTextParams): Promise<AiGenerationSuccess<string>> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": String(process.env.GEMINI_API_KEY),
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: params.systemPrompt }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: params.userPrompt }],
          },
        ],
        generationConfig: {
          maxOutputTokens: clampMaxOutputTokens(params.maxOutputTokens, 900),
        },
      }),
    }
  );

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error?.message || "Gemini request failed.");
  }

  const text = extractGeminiText(payload);

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return {
    data: text,
    provider: "gemini",
    model: GEMINI_MODEL,
  };
}

async function callGeminiStructured<T>(
  params: GenerateStructuredObjectParams
): Promise<AiGenerationSuccess<T>> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": String(process.env.GEMINI_API_KEY),
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: params.systemPrompt }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: params.userPrompt }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseJsonSchema: params.schema,
        },
      }),
    }
  );

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error?.message || "Gemini structured request failed.");
  }

  const text = extractGeminiText(payload);

  if (!text) {
    throw new Error("Gemini returned an empty structured response.");
  }

  return {
    data: parseStructuredResult<T>(text),
    provider: "gemini",
    model: GEMINI_MODEL,
  };
}

export async function generateText(params: GenerateTextParams): Promise<AiGenerationSuccess<string>> {
  const errors: string[] = [];

  for (const provider of getAvailableProviders(params.requestedProvider)) {
    try {
      if (provider === "openai") {
        return await callOpenAiText(params);
      }

      return await callGeminiText(params);
    } catch (error) {
      errors.push(`${provider}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  throw new Error(errors.join(" | "));
}

export async function generateStructuredObject<T>(
  params: GenerateStructuredObjectParams
): Promise<AiGenerationSuccess<T>> {
  const errors: string[] = [];

  for (const provider of getAvailableProviders(params.requestedProvider)) {
    try {
      if (provider === "openai") {
        return await callOpenAiStructured(params);
      }

      return await callGeminiStructured(params);
    } catch (error) {
      errors.push(`${provider}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  throw new Error(errors.join(" | "));
}
