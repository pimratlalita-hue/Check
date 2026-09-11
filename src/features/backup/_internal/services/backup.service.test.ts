import { describe, it, expect } from "vitest";
import { validateBackupPayload } from "./backup.service";
import {
  systemWipeInputSchema,
  importBackupInputSchema,
} from "../schemas";

describe("Backup Feature Service & Schema Tests", () => {
  const sampleValidPayload = {
    meta: {
      version: "1.0.0",
      exportedAt: "2026-09-11T07:00:00.000Z",
      system: "Graduate Thesis Management and Tracking System (GTMTS)",
      tenant: {
        code: "DEMO",
        nameTh: "องค์กรตัวอย่าง",
        nameEn: "Sample Organization",
      },
      stats: {
        newsArticles: 1,
        departments: 1,
        staffProfiles: 1,
        programs: 1,
        petitions: 1,
        facilityRooms: 1,
        roomBookings: 1,
        examAttendances: 1,
      },
    },
    newsArticles: [
      {
        slug: "news-test",
        titleTh: "ข่าวทดสอบ",
        titleEn: "Test News",
        contentTh: "เนื้อหาข่าว",
        contentEn: "News Content",
        category: "ACADEMIC",
        status: "PUBLISHED",
        isPinned: false,
        viewCount: 10,
      },
    ],
    departments: [
      {
        code: "CPE",
        nameTh: "วิศวกรรมคอมพิวเตอร์",
        nameEn: "Computer Engineering",
        isActive: true,
      },
    ],
    staffProfiles: [
      {
        firstNameTh: "อาจารย์",
        lastNameTh: "ทดสอบ",
        firstNameEn: "Test",
        lastNameEn: "Advisor",
        email: "advisor@test.ac.th",
        academicRank: "LECTURER",
        positionTh: "อาจารย์ประจำ",
        positionEn: "Lecturer",
        displayOrder: 1,
        isActive: true,
      },
    ],
    programs: [
      {
        code: "M.Sc. CS",
        slug: "msc-cs",
        nameTh: "วิทยาศาสตรมหาบัณฑิต วิทยาการคอมพิวเตอร์",
        nameEn: "Master of Science in Computer Science",
        degreeTh: "วท.ม.",
        degreeEn: "M.Sc.",
        degreeShortTh: "วท.ม.",
        degreeShortEn: "M.Sc.",
        level: "MASTER",
        totalCredits: 36,
        studyDuration: "2 ปี",
        courses: [
          {
            code: "CS101",
            nameTh: "ระเบียบวิธีวิจัย",
            nameEn: "Research Methodology",
            credits: 3,
            category: "CORE_COURSE",
          },
        ],
      },
    ],
    petitions: [
      {
        trackingNo: "PET-001",
        type: "THESIS_TOPIC_APPROVAL",
        status: "SUBMITTED",
        title: "คำร้องทดสอบ",
        description: "รายละเอียดคำร้อง",
        studentId: "66010001",
        studentName: "นายนพดล",
        studentEmail: "nopadol@test.ac.th",
        activities: [],
      },
    ],
    facilityRooms: [
      {
        code: "ROOM-101",
        nameTh: "ห้อง 101",
        nameEn: "Room 101",
        building: "อาคาร 1",
        floor: 1,
        capacity: 20,
        type: "EXAM_ROOM",
        isActive: true,
      },
    ],
    roomBookings: [
      {
        title: "การสอบเค้าโครง",
        roomCode: "ROOM-101",
        startTime: "2026-09-15T09:00:00Z",
        endTime: "2026-09-15T12:00:00Z",
        type: "EXAM_DEFENSE",
        platform: "ON_SITE",
        status: "CONFIRMED",
        bookedByName: "อาจารย์ทดสอบ",
        bookedByEmail: "advisor@test.ac.th",
      },
    ],
    examAttendances: [
      {
        studentCode: "66010001",
        studentName: "นายนพดล",
        examType: "PROPOSAL_DEFENSE",
        faceHash: "abcdef1234567890abcdef1234567890",
        confidenceScore: 98.5,
        status: "VERIFIED",
        pdpaConsent: true,
      },
    ],
  };

  it("should validate and parse a well-formed GTMTS backup JSON payload", () => {
    const jsonStr = JSON.stringify(sampleValidPayload);
    const parsed = validateBackupPayload(jsonStr);

    expect(parsed.meta.system).toContain("GTMTS");
    expect(parsed.newsArticles.length).toBe(1);
    expect(parsed.departments.length).toBe(1);
    expect(parsed.staffProfiles.length).toBe(1);
    expect(parsed.programs.length).toBe(1);
    expect(parsed.petitions.length).toBe(1);
    expect(parsed.facilityRooms.length).toBe(1);
    expect(parsed.roomBookings.length).toBe(1);
    expect(parsed.examAttendances.length).toBe(1);
  });

  it("should reject corrupted JSON string with descriptive error", () => {
    expect(() => validateBackupPayload("{ corrupted json: true ")).toThrowError(
      /รูปแบบไฟล์ไม่ถูกต้อง/
    );
  });

  it("should reject backup payload missing required metadata fields", () => {
    const invalidPayload = { ...sampleValidPayload, meta: undefined };
    expect(() => validateBackupPayload(JSON.stringify(invalidPayload))).toThrow();
  });

  it("should validate import options schema correctly", () => {
    const validMerge = importBackupInputSchema.parse({
      jsonString: "{}",
      mode: "merge",
    });
    expect(validMerge.mode).toBe("merge");

    const validReplace = importBackupInputSchema.parse({
      jsonString: "{}",
      mode: "replace",
    });
    expect(validReplace.mode).toBe("replace");

    expect(() =>
      importBackupInputSchema.parse({ jsonString: "{}", mode: "invalid" as any })
    ).toThrow();
  });

  it("should enforce double confirmation keyword on system wipe", () => {
    expect(
      systemWipeInputSchema.parse({ mode: "seed", confirmationText: "CONFIRM_WIPE" })
    ).toBeDefined();

    expect(
      systemWipeInputSchema.parse({ mode: "clean", confirmationText: "RESET" })
    ).toBeDefined();

    expect(() =>
      systemWipeInputSchema.parse({ mode: "clean", confirmationText: "CONFIRM" })
    ).toThrowError(/Invalid confirmation text/);

    expect(() =>
      systemWipeInputSchema.parse({ mode: "clean", confirmationText: "" })
    ).toThrowError();
  });
});
