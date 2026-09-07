// Layer 1–3 of the pipeline: Document -> Text Extraction -> Text Cleaning -> Chunking.
// Each stage is a small pure function so the pipeline stays easy to reason about
// and easy to swap (e.g. replace extractPdf with a server-side OCR call later).

import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export const SUPPORTED_TYPES = [".pdf", ".txt", ".md", ".docx"];

export function isSupported(file) {
  const ext = "." + file.name.split(".").pop().toLowerCase();
  return SUPPORTED_TYPES.includes(ext);
}

async function extractPdf(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((it) => it.str).join(" ");
    pages.push(text);
  }
  return { text: pages.join("\n\n"), pageCount: pdf.numPages, pages };
}

async function extractDocx(file) {
  const mammoth = await import("mammoth");
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return { text: result.value, pageCount: null, pages: [result.value] };
}

async function extractPlainText(file) {
  const text = await file.text();
  return { text, pageCount: null, pages: [text] };
}

// Stage 2: Text Cleaning — collapse whitespace, drop boilerplate artifacts
// (page numbers, repeated headers/footers, hyphenation breaks) so downstream
// generation isn't working from noisy OCR/PDF text.
export function cleanText(raw) {
  return raw
    .replace(/\r/g, "")
    .replace(/-\n(?=[a-z])/g, "") // de-hyphenate line-wrapped words
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\s*\d+\s*$/gm, "") // stray page-number-only lines
    .trim();
}

// Stage 3: Content Chunking — split into study-sized sections so users can
// pick "just chapter 2" and so generation stays grounded in a bounded span
// of text rather than the whole document at once.
export function chunkText(text, { targetLength = 900 } = {}) {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const chunks = [];
  let current = "";
  let sectionCount = 0;

  const flush = () => {
    if (current.trim().length === 0) return;
    sectionCount += 1;
    const firstLine = current.trim().split("\n")[0].slice(0, 60);
    chunks.push({
      id: `sec_${sectionCount}`,
      title: `Section ${sectionCount} — ${firstLine}${firstLine.length >= 60 ? "…" : ""}`,
      text: current.trim(),
    });
    current = "";
  };

  for (const para of paragraphs) {
    if ((current + "\n\n" + para).length > targetLength && current) {
      flush();
    }
    current += (current ? "\n\n" : "") + para;
  }
  flush();

  return chunks.length ? chunks : [{ id: "sec_1", title: "Full document", text }];
}

export async function extractText(file) {
  const ext = "." + file.name.split(".").pop().toLowerCase();
  let result;
  if (ext === ".pdf") result = await extractPdf(file);
  else if (ext === ".docx") result = await extractDocx(file);
  else if (ext === ".txt" || ext === ".md") result = await extractPlainText(file);
  else throw new Error(`Unsupported file type: ${ext}`);

  const cleaned = cleanText(result.text);
  if (cleaned.length < 40) {
    throw new Error(
      "Couldn't find readable text in this file. If it's a scanned document, try uploading a text-based PDF instead."
    );
  }
  const chunks = chunkText(cleaned);
  return { ...result, text: cleaned, chunks };
}

export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
