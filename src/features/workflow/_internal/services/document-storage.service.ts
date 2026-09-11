import * as fs from "fs/promises";
import * as path from "path";
import * as crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "storage", "uploads", "documents");
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".doc"];

export interface StoredDocumentMetadata {
  id: string;
  originalName: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  uploaderId?: string;
}

/** Ensure storage directory exists */
async function ensureStorageDir(): Promise<void> {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch {}
}

const META_FILE = path.join(UPLOAD_DIR, "documents-meta.json");

async function loadMetadata(): Promise<Record<string, StoredDocumentMetadata>> {
  try {
    const data = await fs.readFile(META_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function saveMetadata(meta: Record<string, StoredDocumentMetadata>): Promise<void> {
  await fs.writeFile(META_FILE, JSON.stringify(meta, null, 2), "utf-8");
}

export async function storeDocumentFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  uploaderId?: string
): Promise<StoredDocumentMetadata> {
  await ensureStorageDir();

  // 1. File Size Validation
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(`ขนาดไฟล์เกินกำหนด (สูงสุดไม่เกิน 50 MB) ขนาดที่ส่งมา: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);
  }

  // 2. Extension Validation
  const ext = path.extname(originalName).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error(`ชนิดไฟล์ไม่ได้รับอนุญาต (รองรับเฉพาะไฟล์ .pdf, .docx, .doc เท่านั้น)`);
  }

  // 3. Magic Bytes Check for PDF
  if (ext === ".pdf") {
    const header = buffer.subarray(0, 5).toString("utf-8");
    if (!header.startsWith("%PDF")) {
      throw new Error("โครงสร้างไฟล์ PDF ไม่ถูกต้องหรือไฟล์อาจเสียหาย (Magic byte verification failed)");
    }
  }

  // 4. Generate Safe UUID file name
  const docId = `doc_${crypto.randomUUID()}`;
  const fileName = `${docId}${ext}`;
  const filePath = path.join(UPLOAD_DIR, fileName);

  await fs.writeFile(filePath, buffer);

  const docMeta: StoredDocumentMetadata = {
    id: docId,
    originalName: path.basename(originalName),
    fileName,
    fileSize: buffer.length,
    mimeType: mimeType || (ext === ".pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
    uploadedAt: new Date().toISOString(),
    uploaderId,
  };

  const allMeta = await loadMetadata();
  allMeta[docId] = docMeta;
  await saveMetadata(allMeta);

  return docMeta;
}

export async function getDocumentFile(
  docId: string
): Promise<{ buffer: Buffer; metadata: StoredDocumentMetadata } | null> {
  await ensureStorageDir();
  const allMeta = await loadMetadata();
  const meta = allMeta[docId];
  if (!meta) return null;

  const filePath = path.join(UPLOAD_DIR, meta.fileName);
  try {
    const buffer = await fs.readFile(filePath);
    return { buffer, metadata: meta };
  } catch {
    return null;
  }
}
