import { BookOpenText, CircleHelp, FileText, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ModuleEditorDocument, ModuleEditorPage, ModuleEditorQuizBlock, ModuleEditorQuizType } from "@/types/module-editor";

function getQuizTypeLabel(quizType: ModuleEditorQuizType) {
  switch (quizType) {
    case "multiple-choice-single":
      return "Multiple Choice";
    case "multiple-choice-multiple":
      return "Multiple Answer";
    case "true-false":
      return "True / False";
    case "short-answer":
      return "Short Answer";
    case "fill-in-the-blank":
      return "Fill in the Blank";
    case "matching":
      return "Matching";
    case "ordering":
      return "Ordering";
    case "essay":
      return "Extended Response";
    default:
      return "Quiz";
  }
}

function renderParagraphs(value: string) {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0)
    .map((paragraph, index) => (
      <p key={index} className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
        {paragraph}
      </p>
    ));
}

function QuestionBlock({
  block,
  showAnswers,
}: {
  block: ModuleEditorQuizBlock;
  showAnswers: boolean;
}) {
  const hasVisibleAcceptedAnswers =
    showAnswers &&
    (block.quizType === "short-answer" || block.quizType === "fill-in-the-blank") &&
    block.acceptableAnswers.some((answer) => answer.trim().length > 0);

  return (
    <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="border-amber-300 bg-white text-amber-800">
          {getQuizTypeLabel(block.quizType)}
        </Badge>
        <span className="text-xs font-medium text-amber-700">
          {showAnswers ? "Answer key visible" : "Practice prompt"}
        </span>
      </div>

      <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-900">
        {block.prompt || "Quiz prompt"}
      </p>

      {(block.quizType === "multiple-choice-single" ||
        block.quizType === "multiple-choice-multiple" ||
        block.quizType === "true-false") && (
        <div className="mt-3 space-y-2">
          {block.options.map((option) => {
            const isCorrect = showAnswers && block.correctOptionIds.includes(option.id);
            return (
              <div
                key={option.id}
                className={cn(
                  "rounded-2xl border px-3 py-2 text-sm",
                  isCorrect
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-white text-slate-700"
                )}
              >
                {option.text || "Untitled option"}
              </div>
            );
          })}
        </div>
      )}

      {block.quizType === "matching" && (
        <div className="mt-3 space-y-2">
          {showAnswers ? (
            block.matchingPairs.map((pair, index) => (
              <div
                key={pair.id}
                className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-3 md:grid-cols-[1fr_auto_1fr]"
              >
                <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  {pair.prompt || `Prompt ${index + 1}`}
                </div>
                <div className="flex items-center justify-center text-slate-400">=</div>
                <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  {pair.match || `Match ${index + 1}`}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-amber-300 bg-white px-4 py-3 text-sm text-slate-700">
              Match each prompt with the correct answer as a partner or notebook task.
            </div>
          )}
        </div>
      )}

      {block.quizType === "ordering" && (
        <div className="mt-3 space-y-2">
          {showAnswers ? (
            block.orderingItems.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                  {index + 1}
                </span>
                <span>{item.text || `Step ${index + 1}`}</span>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-amber-300 bg-white px-4 py-3 text-sm text-slate-700">
              Reorder the steps in your own notes before checking with your teacher.
            </div>
          )}
        </div>
      )}

      {hasVisibleAcceptedAnswers && (
        <div className="mt-3 space-y-2">
          {block.acceptableAnswers
            .filter((answer) => answer.trim().length > 0)
            .map((answer, index) => (
              <div
                key={`${block.id}-${index}`}
                className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
              >
                {answer}
              </div>
            ))}
        </div>
      )}

      {!showAnswers &&
        (block.quizType === "short-answer" || block.quizType === "fill-in-the-blank" || block.quizType === "essay") && (
          <div className="mt-3 rounded-2xl border border-dashed border-amber-300 bg-white px-4 py-3 text-sm text-slate-700">
            Write your response before reviewing the answer key with your teacher.
          </div>
        )}

      {showAnswers && block.explanation.trim() ? (
        <div className="mt-3 rounded-2xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
          {block.explanation}
        </div>
      ) : null}
    </div>
  );
}

function ModulePage({
  page,
  index,
  showAnswers,
}: {
  page: ModuleEditorPage;
  index: number;
  showAnswers: boolean;
}) {
  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-slate-50/80">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Page {index + 1}</Badge>
          <Badge variant="outline">{page.blocks.length} block{page.blocks.length === 1 ? "" : "s"}</Badge>
        </div>
        <CardTitle className="text-2xl">{page.title}</CardTitle>
        {page.description.trim() ? (
          <CardDescription className="max-w-3xl text-sm leading-relaxed text-slate-600">
            {page.description}
          </CardDescription>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-4 p-6">
        {page.blocks.map((block) => {
          if (block.type === "text") {
            return (
              <div key={block.id} className="rounded-3xl border border-slate-200 bg-white p-5">
                <div className="mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-500" />
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Text
                  </span>
                </div>
                {block.title.trim() ? (
                  <h3 className="mb-3 text-lg font-semibold text-slate-900">{block.title}</h3>
                ) : null}
                <div className="space-y-3">{renderParagraphs(block.body || "Add content to this page.")}</div>
              </div>
            );
          }

          if (block.type === "image") {
            return (
              <div key={block.id} className="rounded-3xl border border-slate-200 bg-white p-5">
                <div className="mb-3 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-slate-500" />
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Image
                  </span>
                </div>
                {block.imageUrl.trim() ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={block.imageUrl}
                    alt={block.altText || block.caption || "Module illustration"}
                    className="max-h-[32rem] w-full rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
                    No image has been added yet.
                  </div>
                )}
                {block.caption.trim() ? (
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{block.caption}</p>
                ) : null}
              </div>
            );
          }

          return <QuestionBlock key={block.id} block={block} showAnswers={showAnswers} />;
        })}
      </CardContent>
    </Card>
  );
}

export function ModuleDocumentView({
  document,
  showAnswers = false,
}: {
  document: ModuleEditorDocument;
  showAnswers?: boolean;
}) {
  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Saved Module</Badge>
            <Badge variant="outline">{document.pages.length} page{document.pages.length === 1 ? "" : "s"}</Badge>
            <Badge variant="outline">{showAnswers ? "Teacher View" : "Student View"}</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <BookOpenText className="h-5 w-5 text-blue-600" />
            {document.title}
          </CardTitle>
          <CardDescription className="flex items-center gap-2 text-sm text-slate-600">
            <CircleHelp className="h-4 w-4" />
            {showAnswers
              ? "Answer keys and explanations are visible in this view."
              : "Use the prompts below as guided lesson content and practice."}
          </CardDescription>
        </CardHeader>
      </Card>

      {document.pages.map((page, index) => (
        <ModulePage key={page.id} page={page} index={index} showAnswers={showAnswers} />
      ))}
    </div>
  );
}
