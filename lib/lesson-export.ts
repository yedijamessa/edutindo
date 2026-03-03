import type { CurriculumLessonContext } from "@/lib/curriculum-portal";
import type { CurriculumLessonContent } from "@/lib/curriculum-lesson-content";
import type {
  ModuleEditorBlock,
  ModuleEditorDocument,
  ModuleEditorPage,
  ModuleEditorQuizBlock,
  ModuleEditorQuizType,
} from "@/types/module-editor";

type LessonExportFormat = "pdf" | "word";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderRichText(value: string) {
  const cleaned = value.trim();
  if (!cleaned) return "";

  return escapeHtml(cleaned)
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replaceAll("\n", "<br />")}</p>`)
    .join("");
}

function slugifyFileSegment(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getQuizTypeLabel(quizType: ModuleEditorQuizType) {
  switch (quizType) {
    case "multiple-choice-single":
      return "Multiple Choice (select one)";
    case "multiple-choice-multiple":
      return "Multiple Choice (select several)";
    case "true-false":
      return "True or False";
    case "short-answer":
      return "Short Answer";
    case "fill-in-the-blank":
      return "Fill in the Blank";
    case "matching":
      return "Matching";
    case "ordering":
      return "Ordering / Sequence";
    case "essay":
      return "Essay / Long response";
    default:
      return "Quiz";
  }
}

function renderTextBlock(block: Extract<ModuleEditorBlock, { type: "text" }>) {
  return `
    <section class="block">
      ${block.title.trim() ? `<h4>${escapeHtml(block.title)}</h4>` : ""}
      ${renderRichText(block.body) || "<p>No text added yet.</p>"}
    </section>
  `;
}

function renderImageBlock(block: Extract<ModuleEditorBlock, { type: "image" }>) {
  return `
    <section class="block">
      <h4>Image</h4>
      ${
        block.imageUrl.trim()
          ? `<img class="content-image" src="${escapeHtml(block.imageUrl)}" alt="${escapeHtml(block.altText || block.caption || "Lesson image")}" />`
          : "<p>No image URL added yet.</p>"
      }
      ${block.caption.trim() ? `<p class="caption">${escapeHtml(block.caption)}</p>` : ""}
    </section>
  `;
}

function renderQuizAnswers(block: ModuleEditorQuizBlock) {
  if (
    block.quizType === "multiple-choice-single" ||
    block.quizType === "multiple-choice-multiple" ||
    block.quizType === "true-false"
  ) {
    return `
      <ul class="answer-list">
        ${block.options
          .map((option) => {
            const isCorrect = block.correctOptionIds.includes(option.id);
            return `<li class="${isCorrect ? "correct-answer" : ""}">${escapeHtml(option.text)}${
              isCorrect ? ' <span class="answer-tag">Correct</span>' : ""
            }</li>`;
          })
          .join("")}
      </ul>
    `;
  }

  if (block.quizType === "short-answer" || block.quizType === "fill-in-the-blank") {
    return block.acceptableAnswers.length > 0
      ? `
        <div class="answer-chip-row">
          ${block.acceptableAnswers
            .map((answer) => `<span class="answer-chip">${escapeHtml(answer)}</span>`)
            .join("")}
        </div>
      `
      : "<p>No accepted answers added yet.</p>";
  }

  if (block.quizType === "matching") {
    return block.matchingPairs.length > 0
      ? `
        <table class="matching-table">
          <thead>
            <tr>
              <th>Prompt</th>
              <th>Match</th>
            </tr>
          </thead>
          <tbody>
            ${block.matchingPairs
              .map(
                (pair) => `
                  <tr>
                    <td>${escapeHtml(pair.prompt)}</td>
                    <td>${escapeHtml(pair.match)}</td>
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>
      `
      : "<p>No matching pairs added yet.</p>";
  }

  if (block.quizType === "ordering") {
    return block.orderingItems.length > 0
      ? `
        <ol class="ordered-list">
          ${block.orderingItems.map((item) => `<li>${escapeHtml(item.text)}</li>`).join("")}
        </ol>
      `
      : "<p>No sequence steps added yet.</p>";
  }

  return block.explanation.trim()
    ? `<p>${escapeHtml(block.explanation)}</p>`
    : "<p>Add essay guidance or a marking rubric to this block.</p>";
}

function renderQuizBlock(block: ModuleEditorQuizBlock) {
  return `
    <section class="block quiz-block">
      <div class="quiz-meta">${escapeHtml(getQuizTypeLabel(block.quizType))}</div>
      <h4>${escapeHtml(block.prompt || "Quiz prompt")}</h4>
      ${renderQuizAnswers(block)}
      ${block.explanation.trim() ? `<p class="explanation"><strong>Explanation:</strong> ${escapeHtml(block.explanation)}</p>` : ""}
    </section>
  `;
}

function renderModuleBlock(block: ModuleEditorBlock) {
  if (block.type === "text") return renderTextBlock(block);
  if (block.type === "image") return renderImageBlock(block);
  return renderQuizBlock(block);
}

function renderModulePage(page: ModuleEditorPage, index: number) {
  return `
    <section class="page">
      <div class="page-kicker">Page ${index + 1}</div>
      <h2>${escapeHtml(page.title)}</h2>
      ${page.description.trim() ? `<p class="page-description">${escapeHtml(page.description)}</p>` : ""}
      <div class="page-blocks">
        ${page.blocks.map(renderModuleBlock).join("")}
      </div>
    </section>
  `;
}

function renderModuleDocument(document: ModuleEditorDocument | null) {
  if (!document || document.pages.length === 0) {
    return "";
  }

  return `
    <section class="section">
      <div class="section-kicker">Saved Module</div>
      <h2>${escapeHtml(document.title)}</h2>
      ${document.pages.map(renderModulePage).join("")}
    </section>
  `;
}

function renderFallbackLessonContent(content: CurriculumLessonContent) {
  return `
    <section class="section">
      <div class="section-kicker">Lesson Overview</div>
      ${renderRichText(content.overview)}
    </section>

    <section class="section">
      <div class="section-kicker">Lesson Focus</div>
      <ul class="bullet-list">
        ${content.focus.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </section>

    <section class="section">
      <div class="section-kicker">Suggested Activities</div>
      <ul class="bullet-list">
        ${content.activities.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </section>
  `;
}

export function getLessonExportFileBaseName(context: CurriculumLessonContext) {
  return [
    context.school.slug,
    context.year.slug,
    context.subject.slug,
    context.chapter.slug,
    context.lesson.lessonCode || context.lesson.slug,
    context.lesson.slug,
  ]
    .map((segment) => slugifyFileSegment(segment))
    .filter((segment) => segment.length > 0)
    .join("-");
}

export function buildLessonExportHtml(input: {
  context: CurriculumLessonContext;
  lessonContent: CurriculumLessonContent;
  moduleDocument: ModuleEditorDocument | null;
  format: LessonExportFormat;
}) {
  const { context, lessonContent, moduleDocument, format } = input;
  const title = moduleDocument?.title || context.lesson.title;
  const subtitle = [context.subject.title, context.chapter.title].filter(Boolean).join(" · ");
  const content = moduleDocument ? renderModuleDocument(moduleDocument) : renderFallbackLessonContent(lessonContent);

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(title)}</title>
        <style>
          :root {
            color-scheme: light;
            --ink: #172033;
            --muted: #61708a;
            --line: #d8e0ec;
            --surface: #ffffff;
            --soft: #f5f7fb;
            --brand: #2563eb;
            --accent: #f97316;
          }

          * { box-sizing: border-box; }
          body {
            margin: 0;
            font-family: Georgia, "Times New Roman", serif;
            color: var(--ink);
            background: #eef3f8;
          }

          .screen-banner {
            display: ${format === "pdf" ? "block" : "none"};
            padding: 14px 18px;
            text-align: center;
            background: #172033;
            color: white;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 14px;
          }

          main {
            max-width: 920px;
            margin: 0 auto;
            padding: 28px 24px 56px;
          }

          .document {
            background: var(--surface);
            border: 1px solid var(--line);
            border-radius: 24px;
            overflow: hidden;
          }

          .hero {
            padding: 40px 40px 28px;
            background: linear-gradient(135deg, #eff6ff 0%, #fff7ed 100%);
            border-bottom: 1px solid var(--line);
          }

          .eyebrow {
            margin: 0 0 14px;
            color: var(--brand);
            font: 700 12px/1.2 Arial, Helvetica, sans-serif;
            letter-spacing: 0.18em;
            text-transform: uppercase;
          }

          h1, h2, h3, h4 {
            margin: 0;
            font-family: Arial, Helvetica, sans-serif;
            color: #111827;
          }

          h1 {
            font-size: 34px;
            line-height: 1.1;
          }

          h2 {
            font-size: 24px;
            margin-bottom: 10px;
          }

          h4 {
            font-size: 16px;
            margin-bottom: 10px;
          }

          p, li, td, th {
            font-size: 14px;
            line-height: 1.7;
          }

          .subtitle {
            margin: 12px 0 0;
            color: var(--muted);
            font-family: Arial, Helvetica, sans-serif;
            font-size: 16px;
          }

          .meta-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
            padding: 24px 40px;
            border-bottom: 1px solid var(--line);
            background: #fbfcfe;
          }

          .meta-card {
            padding: 14px 16px;
            border: 1px solid var(--line);
            border-radius: 16px;
            background: white;
          }

          .meta-label {
            display: block;
            margin-bottom: 4px;
            color: var(--muted);
            font: 700 11px/1.2 Arial, Helvetica, sans-serif;
            letter-spacing: 0.12em;
            text-transform: uppercase;
          }

          .meta-value {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 15px;
            font-weight: 600;
          }

          .content {
            padding: 32px 40px 40px;
          }

          .section,
          .page,
          .block {
            margin-bottom: 24px;
          }

          .section-kicker,
          .page-kicker,
          .quiz-meta {
            display: inline-block;
            margin-bottom: 10px;
            padding: 6px 10px;
            border-radius: 999px;
            background: #e8efff;
            color: var(--brand);
            font: 700 11px/1.2 Arial, Helvetica, sans-serif;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          .page {
            padding: 22px 24px;
            border: 1px solid var(--line);
            border-radius: 20px;
            background: var(--soft);
          }

          .page-description,
          .caption,
          .explanation {
            color: var(--muted);
          }

          .page-blocks {
            margin-top: 18px;
          }

          .block {
            padding: 18px;
            border: 1px solid var(--line);
            border-radius: 18px;
            background: white;
          }

          .quiz-block {
            background: #fffdf8;
          }

          .bullet-list,
          .answer-list,
          .ordered-list {
            margin: 10px 0 0;
            padding-left: 22px;
          }

          .answer-list li,
          .ordered-list li,
          .bullet-list li {
            margin-bottom: 8px;
          }

          .correct-answer {
            font-weight: 700;
          }

          .answer-tag,
          .answer-chip {
            display: inline-block;
            padding: 4px 9px;
            border-radius: 999px;
            background: #dcfce7;
            color: #166534;
            font: 700 11px/1.2 Arial, Helvetica, sans-serif;
            vertical-align: middle;
          }

          .answer-chip-row {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 12px;
          }

          .matching-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
          }

          .matching-table th,
          .matching-table td {
            border: 1px solid var(--line);
            padding: 10px 12px;
            text-align: left;
          }

          .content-image {
            max-width: 100%;
            height: auto;
            margin-top: 6px;
            border-radius: 14px;
            border: 1px solid var(--line);
          }

          @media print {
            @page { margin: 14mm; }

            body {
              background: white;
            }

            .screen-banner {
              display: none !important;
            }

            main {
              max-width: none;
              margin: 0;
              padding: 0;
            }

            .document {
              border: none;
              border-radius: 0;
            }

            .page,
            .block {
              break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="screen-banner">Print dialog will open automatically. Choose “Save as PDF”.</div>
        <main>
          <article class="document">
            <header class="hero">
              <p class="eyebrow">EDUTINDO Lesson Export</p>
              <h1>${escapeHtml(title)}</h1>
              <p class="subtitle">${escapeHtml(subtitle)}</p>
            </header>

            <section class="meta-grid">
              <div class="meta-card">
                <span class="meta-label">School</span>
                <span class="meta-value">${escapeHtml(context.school.title)}</span>
              </div>
              <div class="meta-card">
                <span class="meta-label">Year</span>
                <span class="meta-value">${escapeHtml(context.year.title)}</span>
              </div>
              <div class="meta-card">
                <span class="meta-label">Subject</span>
                <span class="meta-value">${escapeHtml(context.subject.title)}</span>
              </div>
              <div class="meta-card">
                <span class="meta-label">Chapter</span>
                <span class="meta-value">${escapeHtml(context.chapter.title)}</span>
              </div>
              <div class="meta-card">
                <span class="meta-label">Lesson</span>
                <span class="meta-value">${escapeHtml(context.lesson.title)}</span>
              </div>
              <div class="meta-card">
                <span class="meta-label">Lesson Code</span>
                <span class="meta-value">${escapeHtml(context.lesson.lessonCode || "-")}</span>
              </div>
            </section>

            <section class="content">
              ${content}
            </section>
          </article>
        </main>
        ${
          format === "pdf"
            ? `
              <script>
                window.addEventListener("load", function () {
                  setTimeout(function () {
                    window.print();
                  }, 250);
                });
              </script>
            `
            : ""
        }
      </body>
    </html>
  `;
}
