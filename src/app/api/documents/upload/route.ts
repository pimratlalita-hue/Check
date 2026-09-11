import { NextRequest, NextResponse } from "next/server";
import { storeDocumentFile } from "@/features/workflow/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ ok: false, error: "ไม่พบไฟล์ที่ต้องการอัปโหลด" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = (file as any).name || "document.pdf";
    const mimeType = file.type || "application/pdf";

    const docMeta = await storeDocumentFile(buffer, fileName, mimeType);

    return NextResponse.json({
      ok: true,
      fileId: docMeta.id,
      fileName: docMeta.originalName,
      fileSize: docMeta.fileSize,
      mimeType: docMeta.mimeType,
      url: `/api/documents/${docMeta.id}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "เกิดข้อผิดพลาดในการอัปโหลดเอกสาร" },
      { status: 500 }
    );
  }
}
