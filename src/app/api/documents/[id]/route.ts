import { NextRequest, NextResponse } from "next/server";
import { getDocumentFile } from "@/features/workflow/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const result = await getDocumentFile(id);

    if (!result) {
      return new NextResponse("File Not Found", { status: 404 });
    }

    const { buffer, metadata } = result;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": metadata.mimeType || "application/octet-stream",
        "Content-Disposition": `inline; filename="${encodeURIComponent(metadata.originalName)}"`,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err: any) {
    return new NextResponse("Error fetching document", { status: 500 });
  }
}
