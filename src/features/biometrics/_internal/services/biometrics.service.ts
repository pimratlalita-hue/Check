import crypto from "crypto";
import { prisma } from "@/shared/lib/infra/prisma";
import type { RecordAttendanceInput, ListAttendanceQuery, AttendanceStatusType } from "../schemas";

/**
 * คำนวณ Face Signature Hash จากเวกเตอร์พิกัดจุดบนใบหน้า (Synthetic Landmark Vector)
 * สอดคล้องตามมาตรฐาน PDPA: แฮชเป็น SHA-256 Text String เสมอ ไม่มีภาพถ่ายจริง
 */
export function computeSyntheticFaceHash(landmarks: number[] | string): string {
  const data = typeof landmarks === "string" ? landmarks : JSON.stringify(landmarks);
  return crypto.createHash("sha256").update(data).digest("hex");
}

export async function resolvePortalTenantId(): Promise<string> {
  const tenant = await prisma.tenant.findFirst({
    where: { isActive: true },
    select: { id: true },
  });
  if (!tenant) throw new Error("No active tenant found for portal");
  return tenant.id;
}

export async function recordAttendance(
  tenantId: string,
  input: RecordAttendanceInput,
  verifiedBy?: string
) {
  if (!input.pdpaConsent) {
    throw new Error("PDPA Consent is mandatory before recording biometric attendance.");
  }

  // หากคะแนนความเชื่อมั่นต่ำกว่า 80% ให้ทำเครื่องหมาย FLAGGED เพื่อให้กรรมการตรวจสอบซ้ำ
  const status: AttendanceStatusType = input.confidenceScore >= 80.0 ? "VERIFIED" : "FLAGGED";

  const attendance = await prisma.examAttendance.create({
    data: {
      tenantId,
      bookingId: input.bookingId ?? null,
      studentCode: input.studentCode,
      studentName: input.studentName,
      examType: input.examType,
      faceHash: input.faceHash,
      confidenceScore: input.confidenceScore,
      status,
      pdpaConsent: true,
      pdpaConsentAt: new Date(),
      verifiedAt: new Date(),
      verifiedBy: verifiedBy ?? null,
      notes: input.notes ?? null,
    },
    include: {
      booking: {
        include: {
          room: true,
        },
      },
    },
  });

  return attendance;
}

export async function listAttendances(tenantId: string, query: ListAttendanceQuery = { page: 1, pageSize: 20 }) {
  const { search, status, examType, bookingId, date, page = 1, pageSize = 20 } = query;
  const where: any = { tenantId };

  if (status) {
    where.status = status;
  }
  if (examType) {
    where.examType = examType;
  }
  if (bookingId) {
    where.bookingId = bookingId;
  }
  if (date) {
    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);
    where.verifiedAt = {
      gte: startOfDay,
      lte: endOfDay,
    };
  }
  if (search) {
    where.OR = [
      { studentCode: { contains: search } },
      { studentName: { contains: search } },
      { faceHash: { contains: search } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.examAttendance.findMany({
      where,
      orderBy: { verifiedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        booking: {
          include: {
            room: true,
          },
        },
      },
    }),
    prisma.examAttendance.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
}

export async function getDailyAttendanceStats(tenantId: string, targetDate?: Date) {
  const d = targetDate ?? new Date();
  const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
  const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

  const attendances = await prisma.examAttendance.findMany({
    where: {
      tenantId,
      verifiedAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    select: {
      status: true,
      confidenceScore: true,
    },
  });

  const total = attendances.length;
  const verified = attendances.filter((a) => a.status === "VERIFIED").length;
  const flagged = attendances.filter((a) => a.status === "FLAGGED").length;
  const manual = attendances.filter((a) => a.status === "MANUAL_OVERRIDE").length;

  const avgConfidence =
    total > 0
      ? Number((attendances.reduce((acc, curr) => acc + curr.confidenceScore, 0) / total).toFixed(1))
      : 0;

  return {
    date: startOfDay.toISOString().split("T")[0],
    total,
    verified,
    flagged,
    manual,
    avgConfidence,
  };
}

export async function updateAttendanceStatus(
  tenantId: string,
  id: string,
  status: AttendanceStatusType,
  notes?: string,
  verifiedBy?: string
) {
  return prisma.examAttendance.update({
    where: { id, tenantId },
    data: {
      status,
      notes: notes !== undefined ? notes : undefined,
      verifiedBy: verifiedBy !== undefined ? verifiedBy : undefined,
    },
  });
}
