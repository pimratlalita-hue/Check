import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  computeSyntheticFaceHash,
  recordAttendance,
  listAttendances,
  getDailyAttendanceStats,
  updateAttendanceStatus,
} from "./biometrics.service";
import { prisma } from "@/shared/lib/infra/prisma";

vi.mock("@/shared/lib/infra/prisma", () => ({
  prisma: {
    examAttendance: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("biometrics.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("computeSyntheticFaceHash", () => {
    it("generates deterministic 64-character SHA-256 hash for landmark vector", () => {
      const landmarks = [0.12, 0.45, 0.78, 0.99, -0.34];
      const hash1 = computeSyntheticFaceHash(landmarks);
      const hash2 = computeSyntheticFaceHash(landmarks);

      expect(hash1).toHaveLength(64);
      expect(hash1).toBe(hash2);
      expect(typeof hash1).toBe("string");
    });

    it("generates different hash for different inputs", () => {
      const hash1 = computeSyntheticFaceHash([1, 2, 3]);
      const hash2 = computeSyntheticFaceHash([1, 2, 4]);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe("recordAttendance", () => {
    it("creates an attendance record with status VERIFIED when confidence >= 80", async () => {
      const mockResult = {
        id: "att-1",
        tenantId: "t-1",
        studentCode: "6570001234",
        studentName: "สมชาย ใจดี",
        examType: "PROPOSAL_DEFENSE",
        faceHash: "abc123hash",
        confidenceScore: 94.5,
        status: "VERIFIED",
        pdpaConsent: true,
      };

      (prisma.examAttendance.create as any).mockResolvedValue(mockResult);

      const res = await recordAttendance(
        "t-1",
        {
          studentCode: "6570001234",
          studentName: "สมชาย ใจดี",
          examType: "PROPOSAL_DEFENSE",
          faceHash: "abc123hash",
          confidenceScore: 94.5,
          pdpaConsent: true,
        },
        "อาจารย์คุมสอบ"
      );

      expect(prisma.examAttendance.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: "t-1",
            studentCode: "6570001234",
            status: "VERIFIED",
            verifiedBy: "อาจารย์คุมสอบ",
            pdpaConsent: true,
          }),
        })
      );
      expect(res.status).toBe("VERIFIED");
    });

    it("creates an attendance record with status FLAGGED when confidence < 80", async () => {
      const mockResult = {
        id: "att-2",
        tenantId: "t-1",
        studentCode: "6570009999",
        studentName: "สมหญิง นักศึกษา",
        confidenceScore: 68.0,
        status: "FLAGGED",
      };

      (prisma.examAttendance.create as any).mockResolvedValue(mockResult);

      const res = await recordAttendance("t-1", {
        studentCode: "6570009999",
        studentName: "สมหญิง นักศึกษา",
        examType: "FINAL_DEFENSE",
        faceHash: "lowconfidencehash",
        confidenceScore: 68.0,
        pdpaConsent: true,
      });

      expect(prisma.examAttendance.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: "FLAGGED",
          }),
        })
      );
      expect(res.status).toBe("FLAGGED");
    });
  });

  describe("getDailyAttendanceStats", () => {
    it("calculates daily counts and average confidence correctly", async () => {
      (prisma.examAttendance.findMany as any).mockResolvedValue([
        { status: "VERIFIED", confidenceScore: 96.0 },
        { status: "VERIFIED", confidenceScore: 94.0 },
        { status: "FLAGGED", confidenceScore: 65.0 },
        { status: "MANUAL_OVERRIDE", confidenceScore: 85.0 },
      ]);

      const stats = await getDailyAttendanceStats("t-1", new Date("2026-09-11T12:00:00Z"));

      expect(stats.total).toBe(4);
      expect(stats.verified).toBe(2);
      expect(stats.flagged).toBe(1);
      expect(stats.manual).toBe(1);
      expect(stats.avgConfidence).toBe(85.0);
    });

    it("returns 0 average confidence when no records exist", async () => {
      (prisma.examAttendance.findMany as any).mockResolvedValue([]);

      const stats = await getDailyAttendanceStats("t-1", new Date("2026-09-11T12:00:00Z"));

      expect(stats.total).toBe(0);
      expect(stats.avgConfidence).toBe(0);
    });
  });

  describe("updateAttendanceStatus", () => {
    it("updates attendance status and audit note", async () => {
      (prisma.examAttendance.update as any).mockResolvedValue({
        id: "att-1",
        status: "MANUAL_OVERRIDE",
        notes: "ตรวจสอบบัตรประจำตัวประชาชนแล้ว ตรงกัน",
      });

      const res = await updateAttendanceStatus(
        "t-1",
        "att-1",
        "MANUAL_OVERRIDE",
        "ตรวจสอบบัตรประจำตัวประชาชนแล้ว ตรงกัน",
        "Staff A"
      );

      expect(prisma.examAttendance.update).toHaveBeenCalledWith({
        where: { id: "att-1", tenantId: "t-1" },
        data: {
          status: "MANUAL_OVERRIDE",
          notes: "ตรวจสอบบัตรประจำตัวประชาชนแล้ว ตรงกัน",
          verifiedBy: "Staff A",
        },
      });
      expect(res.status).toBe("MANUAL_OVERRIDE");
    });
  });
});
