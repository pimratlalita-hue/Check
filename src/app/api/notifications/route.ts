import { NextRequest, NextResponse } from "next/server";
import {
  getNotificationsForUser,
  markNotificationAsRead,
  markAllAsRead,
} from "@/features/workflow/server";

export async function GET(req: NextRequest) {
  try {
    const role = req.nextUrl.searchParams.get("role") || undefined;
    const email = req.nextUrl.searchParams.get("email") || undefined;
    const result = await getNotificationsForUser(role, email);
    return NextResponse.json({ ok: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.action === "mark_read" && body.id) {
      await markNotificationAsRead(body.id);
      return NextResponse.json({ ok: true });
    }
    if (body.action === "mark_all_read") {
      await markAllAsRead();
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Error" }, { status: 500 });
  }
}
