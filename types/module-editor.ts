export type ModuleEditorNodeType = "chapter" | "lesson";

export type ModuleEditorBlockType = "text" | "image" | "quiz";

export interface ModuleEditorTextBlock {
  id: string;
  type: "text";
  title: string;
  body: string;
}

export interface ModuleEditorImageBlock {
  id: string;
  type: "image";
  imageUrl: string;
  altText: string;
  caption: string;
}

export interface ModuleEditorQuizOption {
  id: string;
  text: string;
}

export type ModuleEditorQuizType =
  | "multiple-choice-single"
  | "multiple-choice-multiple"
  | "true-false"
  | "short-answer"
  | "fill-in-the-blank";

export interface ModuleEditorQuizBlock {
  id: string;
  type: "quiz";
  quizType: ModuleEditorQuizType;
  prompt: string;
  options: ModuleEditorQuizOption[];
  correctOptionIds: string[];
  acceptableAnswers: string[];
  explanation: string;
}

export type ModuleEditorBlock =
  | ModuleEditorTextBlock
  | ModuleEditorImageBlock
  | ModuleEditorQuizBlock;

export interface ModuleEditorPage {
  id: string;
  title: string;
  description: string;
  blocks: ModuleEditorBlock[];
}

export interface ModuleEditorBreadcrumb {
  id: string;
  title: string;
  slug: string;
  nodeType: "school" | "year" | "subject" | "chapter" | "lesson";
}

export interface ModuleEditorTarget {
  id: string;
  title: string;
  slug: string;
  nodeType: ModuleEditorNodeType;
  parentId: string | null;
  metadata: Record<string, unknown>;
  breadcrumbs: ModuleEditorBreadcrumb[];
}

export interface ModuleEditorDocument {
  nodeId: string;
  nodeType: ModuleEditorNodeType;
  title: string;
  pages: ModuleEditorPage[];
  updatedAt: string | null;
}
