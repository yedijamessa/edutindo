import "@/lib/server-only";

import type {
  ModuleEditorBlock,
  ModuleEditorDocument,
  ModuleEditorQuizBlock,
  ModuleEditorQuizType,
} from "@/types/module-editor";

export type ModuleExportFormat = "pdf" | "docx" | "odt";

type ExportLineKind = "title" | "heading" | "subheading" | "body" | "meta";

type ExportLine = {
  text: string;
  kind: ExportLineKind;
};

type ZipFile = {
  name: string;
  data: Buffer;
};

function sanitizeText(value: string) {
  return value.replace(/\r\n?/g, "\n").trim();
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

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
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

function splitParagraphs(value: string) {
  return sanitizeText(value)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\n/g, " ").trim())
    .filter(Boolean);
}

function renderQuizLines(block: ModuleEditorQuizBlock): ExportLine[] {
  const lines: ExportLine[] = [
    { text: getQuizTypeLabel(block.quizType), kind: "meta" },
    { text: block.prompt || "Quiz prompt", kind: "subheading" },
  ];

  if (
    block.quizType === "multiple-choice-single" ||
    block.quizType === "multiple-choice-multiple" ||
    block.quizType === "true-false"
  ) {
    for (const option of block.options) {
      const correct = block.correctOptionIds.includes(option.id) ? " (Correct)" : "";
      lines.push({ text: `- ${option.text}${correct}`, kind: "body" });
    }
  } else if (block.quizType === "short-answer" || block.quizType === "fill-in-the-blank") {
    const answers = block.acceptableAnswers.length > 0 ? block.acceptableAnswers.join(", ") : "No accepted answers added.";
    lines.push({ text: `Accepted answers: ${answers}`, kind: "body" });
  } else if (block.quizType === "matching") {
    if (block.matchingPairs.length === 0) {
      lines.push({ text: "No matching pairs added.", kind: "body" });
    }
    for (const pair of block.matchingPairs) {
      lines.push({ text: `${pair.prompt} -> ${pair.match}`, kind: "body" });
    }
  } else if (block.quizType === "ordering") {
    if (block.orderingItems.length === 0) {
      lines.push({ text: "No sequence steps added.", kind: "body" });
    }
    block.orderingItems.forEach((item, index) => {
      lines.push({ text: `${index + 1}. ${item.text}`, kind: "body" });
    });
  } else {
    lines.push({ text: block.explanation || "Add essay guidance or a marking rubric to this block.", kind: "body" });
  }

  if (block.explanation.trim() && block.quizType !== "essay") {
    lines.push({ text: `Explanation: ${block.explanation}`, kind: "body" });
  }

  return lines;
}

function renderBlockLines(block: ModuleEditorBlock): ExportLine[] {
  if (block.type === "text") {
    const lines: ExportLine[] = [];
    if (block.title.trim()) lines.push({ text: block.title, kind: "subheading" });
    const paragraphs = splitParagraphs(block.body);
    if (paragraphs.length === 0) {
      lines.push({ text: "No text added yet.", kind: "body" });
    } else {
      paragraphs.forEach((paragraph) => lines.push({ text: paragraph, kind: "body" }));
    }
    return lines;
  }

  if (block.type === "image") {
    return [
      { text: "Image", kind: "subheading" },
      { text: block.imageUrl.trim() ? `Image URL: ${block.imageUrl}` : "No image URL added yet.", kind: "body" },
      ...(block.caption.trim() ? [{ text: `Caption: ${block.caption}`, kind: "body" } as ExportLine] : []),
    ];
  }

  return renderQuizLines(block);
}

function getModuleExportLines(document: ModuleEditorDocument): ExportLine[] {
  const lines: ExportLine[] = [
    { text: document.title, kind: "title" },
    { text: "EDUTINDO Module Export", kind: "meta" },
    ...(document.moduleCode ? [{ text: `Module code: ${document.moduleCode}`, kind: "meta" } as ExportLine] : []),
    ...(document.uniqueIdentifier ? [{ text: `Unique identifier: ${document.uniqueIdentifier}`, kind: "meta" } as ExportLine] : []),
    ...(document.subjectTitle ? [{ text: `Subject: ${document.subjectTitle}`, kind: "meta" } as ExportLine] : []),
    ...(document.chapterTitle ? [{ text: `Chapter: ${document.chapterTitle}`, kind: "meta" } as ExportLine] : []),
    { text: `${document.pages.length} ${document.pages.length === 1 ? "page" : "pages"}`, kind: "meta" },
  ];

  document.pages.forEach((page, pageIndex) => {
    lines.push({ text: `Page ${pageIndex + 1}: ${page.title}`, kind: "heading" });
    if (page.description.trim()) {
      lines.push({ text: page.description, kind: "body" });
    }
    page.blocks.forEach((block) => {
      lines.push(...renderBlockLines(block));
    });
  });

  return lines;
}

export function getModuleExportFileBaseName(document: ModuleEditorDocument) {
  return [
    document.subjectSlug,
    document.chapterSlug,
    document.moduleCode,
    document.uniqueIdentifier,
    document.title,
  ]
    .map((segment) => slugifyFileSegment(segment || ""))
    .filter(Boolean)
    .join("-")
    .slice(0, 180) || "edutindo-module";
}

function wrapText(text: string, maxLength: number) {
  const words = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if (!current) {
      current = word;
      continue;
    }

    if (`${current} ${word}`.length > maxLength) {
      lines.push(current);
      current = word;
    } else {
      current = `${current} ${word}`;
    }
  }

  if (current) lines.push(current);
  return lines.length > 0 ? lines : [""];
}

function escapePdfText(value: string) {
  return value
    .replace(/[^\x09\x0a\x0d\x20-\x7e]/g, "?")
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)");
}

function getPdfFontSize(kind: ExportLineKind) {
  if (kind === "title") return 22;
  if (kind === "heading") return 16;
  if (kind === "subheading") return 13;
  if (kind === "meta") return 10;
  return 11;
}

function getPdfLineGap(kind: ExportLineKind) {
  if (kind === "title") return 10;
  if (kind === "heading") return 8;
  if (kind === "subheading") return 5;
  return 3;
}

export function buildModulePdf(document: ModuleEditorDocument) {
  const rawLines = getModuleExportLines(document);
  const pages: string[][] = [];
  let currentPage: string[] = [];
  let y = 760;

  for (const line of rawLines) {
    const fontSize = getPdfFontSize(line.kind);
    const maxLength = line.kind === "title" ? 52 : line.kind === "heading" ? 64 : 92;
    const wrappedLines = wrapText(line.text, maxLength);
    const requiredHeight = wrappedLines.length * (fontSize + 4) + getPdfLineGap(line.kind) + 6;

    if (y - requiredHeight < 52 && currentPage.length > 0) {
      pages.push(currentPage);
      currentPage = [];
      y = 760;
    }

    y -= getPdfLineGap(line.kind);
    for (const wrappedLine of wrappedLines) {
      currentPage.push(`BT /F1 ${fontSize} Tf 52 ${y} Td (${escapePdfText(wrappedLine)}) Tj ET`);
      y -= fontSize + 4;
    }
    y -= 6;
  }

  if (currentPage.length > 0) pages.push(currentPage);

  const objects: string[] = [];
  const pageObjectNumbers: number[] = [];
  const catalogNumber = 1;
  const pagesNumber = 2;
  const fontNumber = 3;

  objects[catalogNumber] = `<< /Type /Catalog /Pages ${pagesNumber} 0 R >>`;
  objects[fontNumber] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`;

  pages.forEach((pageCommands) => {
    const content = pageCommands.join("\n");
    const contentNumber = objects.length;
    objects[contentNumber] = `<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}\nendstream`;
    const pageNumber = objects.length;
    objects[pageNumber] = `<< /Type /Page /Parent ${pagesNumber} 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontNumber} 0 R >> >> /Contents ${contentNumber} 0 R >>`;
    pageObjectNumbers.push(pageNumber);
  });

  objects[pagesNumber] = `<< /Type /Pages /Kids [${pageObjectNumbers.map((number) => `${number} 0 R`).join(" ")}] /Count ${pageObjectNumbers.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let index = 1; index < objects.length; index += 1) {
    offsets[index] = Buffer.byteLength(pdf, "utf8");
    pdf += `${index} 0 obj\n${objects[index]}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let index = 1; index < objects.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length} /Root ${catalogNumber} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "utf8");
}

function makeCrc32Table() {
  const table: number[] = [];
  for (let index = 0; index < 256; index += 1) {
    let crc = index;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
    table[index] = crc >>> 0;
  }
  return table;
}

const crc32Table = makeCrc32Table();

function crc32(buffer: Buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = crc32Table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createDosDateTime(date = new Date()) {
  const year = Math.max(1980, date.getFullYear());
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { dosDate, dosTime };
}

function createZip(files: ZipFile[]) {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;
  const { dosDate, dosTime } = createDosDateTime();

  for (const file of files) {
    const name = Buffer.from(file.name, "utf8");
    const data = file.data;
    const checksum = crc32(data);

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0x0800, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(dosTime, 10);
    localHeader.writeUInt16LE(dosDate, 12);
    localHeader.writeUInt32LE(checksum, 14);
    localHeader.writeUInt32LE(data.length, 18);
    localHeader.writeUInt32LE(data.length, 22);
    localHeader.writeUInt16LE(name.length, 26);
    localHeader.writeUInt16LE(0, 28);

    localParts.push(localHeader, name, data);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0x0800, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(dosTime, 12);
    centralHeader.writeUInt16LE(dosDate, 14);
    centralHeader.writeUInt32LE(checksum, 16);
    centralHeader.writeUInt32LE(data.length, 20);
    centralHeader.writeUInt32LE(data.length, 24);
    centralHeader.writeUInt16LE(name.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);

    centralParts.push(centralHeader, name);
    offset += localHeader.length + name.length + data.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralDirectory, end]);
}

function buildDocxDocumentXml(document: ModuleEditorDocument) {
  const body = getModuleExportLines(document)
    .map((line) => {
      const style =
        line.kind === "title"
          ? "Title"
          : line.kind === "heading"
            ? "Heading1"
            : line.kind === "subheading"
              ? "Heading2"
              : "";
      const styleXml = style ? `<w:pPr><w:pStyle w:val="${style}"/></w:pPr>` : "";
      return `<w:p>${styleXml}<w:r><w:t xml:space="preserve">${escapeXml(line.text)}</w:t></w:r></w:p>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${body}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;
}

export function buildModuleDocx(document: ModuleEditorDocument) {
  const files: ZipFile[] = [
    {
      name: "[Content_Types].xml",
      data: Buffer.from(
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`,
        "utf8"
      ),
    },
    {
      name: "_rels/.rels",
      data: Buffer.from(
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`,
        "utf8"
      ),
    },
    {
      name: "docProps/core.xml",
      data: Buffer.from(
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${escapeXml(document.title)}</dc:title>
  <dc:creator>Edutindo</dc:creator>
  <dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created>
</cp:coreProperties>`,
        "utf8"
      ),
    },
    {
      name: "docProps/app.xml",
      data: Buffer.from(
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
  <Application>Edutindo</Application>
</Properties>`,
        "utf8"
      ),
    },
    {
      name: "word/document.xml",
      data: Buffer.from(buildDocxDocumentXml(document), "utf8"),
    },
  ];

  return createZip(files);
}

export function buildModuleOdt(document: ModuleEditorDocument) {
  const paragraphs = getModuleExportLines(document)
    .map((line) => {
      if (line.kind === "title") return `<text:h text:outline-level="1">${escapeXml(line.text)}</text:h>`;
      if (line.kind === "heading") return `<text:h text:outline-level="2">${escapeXml(line.text)}</text:h>`;
      if (line.kind === "subheading") return `<text:h text:outline-level="3">${escapeXml(line.text)}</text:h>`;
      return `<text:p>${escapeXml(line.text)}</text:p>`;
    })
    .join("");

  const files: ZipFile[] = [
    {
      name: "mimetype",
      data: Buffer.from("application/vnd.oasis.opendocument.text", "utf8"),
    },
    {
      name: "META-INF/manifest.xml",
      data: Buffer.from(
        `<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2">
  <manifest:file-entry manifest:full-path="/" manifest:media-type="application/vnd.oasis.opendocument.text"/>
  <manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>
</manifest:manifest>`,
        "utf8"
      ),
    },
    {
      name: "content.xml",
      data: Buffer.from(
        `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" office:version="1.2">
  <office:body>
    <office:text>
      ${paragraphs}
    </office:text>
  </office:body>
</office:document-content>`,
        "utf8"
      ),
    },
  ];

  return createZip(files);
}
