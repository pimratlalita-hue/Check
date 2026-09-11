import { describe, it, expect, vi } from "vitest";
import type { Db } from "@/shared/lib/infra/prisma";
import {
  createDepartmentSchema,
  createStaffSchema,
  updateStaffSchema,
  listStaffQuerySchema,
} from "../schemas";
import {
  createDepartment,
  createStaffProfile,
  toggleStaffActive,
  deleteStaffProfile,
} from "./staff.service";

describe("Staff Schemas Validation", () => {
  it("validate createDepartmentSchema สำเร็จเมื่อข้อมูลถูกต้อง", () => {
    const input = {
      code: "CPE",
      nameTh: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
      nameEn: "Department of Computer Engineering",
      displayOrder: 1,
    };
    const parsed = createDepartmentSchema.parse(input);
    expect(parsed.code).toBe("CPE");
    expect(parsed.displayOrder).toBe(1);
    expect(parsed.isActive).toBe(true);
  });

  it("validate createStaffSchema สำเร็จเมื่อข้อมูลครบถ้วน", () => {
    const input = {
      firstNameTh: "สมชาย",
      lastNameTh: "ใจดี",
      firstNameEn: "Somchai",
      lastNameEn: "Jaidee",
      prefixTh: "รศ.ดร.",
      prefixEn: "Assoc. Prof. Dr.",
      positionTh: "รองคณบดีฝ่ายวิชาการ",
      positionEn: "Associate Dean for Academic Affairs",
      academicRank: "ASSOCIATE_PROFESSOR" as const,
      staffType: "ACADEMIC" as const,
      email: "somchai@faculty.ac.th",
      isExecutive: true,
      executiveRole: "รองคณบดีฝ่ายวิชาการ",
      executiveOrder: 2,
      expertise: ["Artificial Intelligence", "Machine Learning"],
      education: ["Ph.D. in Computer Science", "M.Sc. in IT", "B.Sc. in CS"],
    };
    const parsed = createStaffSchema.parse(input);
    expect(parsed.firstNameTh).toBe("สมชาย");
    expect(parsed.email).toBe("somchai@faculty.ac.th");
    expect(parsed.expertise).toHaveLength(2);
    expect(parsed.education).toHaveLength(3);
  });

  it("validate createStaffSchema ล้มเหลวเมื่ออีเมลไม่ถูกต้อง", () => {
    const input = {
      firstNameTh: "สมชาย",
      lastNameTh: "ใจดี",
      firstNameEn: "Somchai",
      lastNameEn: "Jaidee",
      positionTh: "อาจารย์",
      positionEn: "Lecturer",
      email: "not-an-email",
    };
    expect(() => createStaffSchema.parse(input)).toThrow();
  });

  it("validate updateStaffSchema ต้องมี id เป็น UUID", () => {
    const valid = {
      id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      positionTh: "หัวหน้าภาควิชา",
    };
    expect(updateStaffSchema.parse(valid).id).toBe("9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d");

    const invalid = {
      id: "not-a-uuid",
      positionTh: "หัวหน้าภาควิชา",
    };
    expect(() => updateStaffSchema.parse(invalid)).toThrow();
  });

  it("validate listStaffQuerySchema มีค่า default page=1 และ perPage=50", () => {
    const parsed = listStaffQuerySchema.parse({});
    expect(parsed.page).toBe(1);
    expect(parsed.perPage).toBe(50);
  });
});

describe("Staff Service Logic", () => {
  const tenantId = "test-tenant-id";

  it("createDepartment: ปฏิเสธเมื่อรหัสภาควิชาซ้ำใน tenant เดียวกัน", async () => {
    const mockDb = {
      department: {
        findUnique: vi.fn().mockResolvedValue({ id: "existing-dept", code: "CPE" }),
      },
    } as unknown as Db;

    await expect(
      createDepartment(
        tenantId,
        {
          code: "CPE",
          nameTh: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
          nameEn: "Department of Computer Engineering",
          displayOrder: 1,
          isActive: true,
        },
        mockDb,
      ),
    ).rejects.toThrow("department_code_exists");
  });

  it("createStaffProfile: ปฏิเสธเมื่อไม่พบ departmentId ที่ระบุ", async () => {
    const mockDb = {
      department: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    } as unknown as Db;

    const input = {
      departmentId: "non-existent-dept",
      firstNameTh: "อาจารย์",
      lastNameTh: "ทดสอบ",
      firstNameEn: "Ajarn",
      lastNameEn: "Test",
      positionTh: "อาจารย์",
      positionEn: "Lecturer",
      email: "test@faculty.ac.th",
      staffType: "ACADEMIC" as const,
      academicRank: "LECTURER" as const,
      displayOrder: 0,
      isActive: true,
      isExecutive: false,
    };

    await expect(createStaffProfile(tenantId, input, mockDb)).rejects.toThrow(
      "department_not_found",
    );
  });

  it("createStaffProfile: สร้างสำเร็จและคำนวณชื่อ-สกุลเต็มสองภาษาอย่างถูกต้อง", async () => {
    const fakeRecord = {
      id: "staff-123",
      tenantId,
      departmentId: null,
      userId: null,
      staffType: "ACADEMIC",
      academicRank: "PROFESSOR",
      prefixTh: "ศ.ดร.",
      prefixEn: "Prof. Dr.",
      firstNameTh: "ประเสริฐ",
      lastNameTh: "วิริยะกุล",
      firstNameEn: "Prasert",
      lastNameEn: "Wiriyakul",
      positionTh: "คณบดี",
      positionEn: "Dean",
      isExecutive: true,
      executiveRole: "คณบดี",
      executiveOrder: 1,
      email: "dean@faculty.ac.th",
      phone: "02-123-4567",
      officeRoom: "Room 401",
      officeHours: "Mon 10:00-12:00",
      avatarUrl: "https://example.com/avatar.jpg",
      education: ["Ph.D. in CS"],
      expertise: ["AI", "Robotics"],
      researchInterests: "Intelligent Systems",
      googleScholarUrl: "https://scholar.google.com",
      scopusUrl: null,
      orcidId: "0000-0001-2345-6789",
      websiteUrl: null,
      bioTh: "ประวัติ...",
      bioEn: "Biography...",
      displayOrder: 0,
      isActive: true,
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-01T00:00:00Z"),
      department: null,
    };

    const mockDb = {
      staffProfile: {
        create: vi.fn().mockResolvedValue(fakeRecord),
      },
    } as unknown as Db;

    const res = await createStaffProfile(
      tenantId,
      {
        firstNameTh: "ประเสริฐ",
        lastNameTh: "วิริยะกุล",
        firstNameEn: "Prasert",
        lastNameEn: "Wiriyakul",
        prefixTh: "ศ.ดร.",
        prefixEn: "Prof. Dr.",
        positionTh: "คณบดี",
        positionEn: "Dean",
        academicRank: "PROFESSOR",
        staffType: "ACADEMIC",
        email: "dean@faculty.ac.th",
        isExecutive: true,
        executiveRole: "คณบดี",
        executiveOrder: 1,
        displayOrder: 0,
        isActive: true,
      },
      mockDb,
    );

    expect(res.fullNameTh).toBe("ศ.ดร. ประเสริฐ วิริยะกุล");
    expect(res.fullNameEn).toBe("Prof. Dr. Prasert Wiriyakul");
    expect(res.isExecutive).toBe(true);
    expect(res.email).toBe("dean@faculty.ac.th");
  });

  it("toggleStaffActive: สลับสถานะ isActive", async () => {
    const existing = {
      id: "staff-1",
      tenantId,
      isActive: true,
      prefixTh: null,
      prefixEn: null,
      firstNameTh: "สมศักดิ์",
      lastNameTh: "มั่งมี",
      firstNameEn: "Somsak",
      lastNameEn: "Mungmee",
      positionTh: "เจ้าหน้าที่",
      positionEn: "Officer",
      staffType: "SUPPORT",
      academicRank: "NONE",
      isExecutive: false,
      executiveRole: null,
      executiveOrder: null,
      email: "somsak@faculty.ac.th",
      phone: null,
      officeRoom: null,
      officeHours: null,
      avatarUrl: null,
      education: null,
      expertise: null,
      researchInterests: null,
      googleScholarUrl: null,
      scopusUrl: null,
      orcidId: null,
      websiteUrl: null,
      bioTh: null,
      bioEn: null,
      displayOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      department: null,
    };

    const updated = { ...existing, isActive: false };

    const mockDb = {
      staffProfile: {
        findFirst: vi.fn().mockResolvedValue(existing),
        update: vi.fn().mockResolvedValue(updated),
      },
    } as unknown as Db;

    const res = await toggleStaffActive(tenantId, "staff-1", mockDb);
    expect(res.isActive).toBe(false);
  });

  it("deleteStaffProfile: ลบข้อมูลสำเร็จเมื่อมีเรคอร์ด", async () => {
    const mockDb = {
      staffProfile: {
        findFirst: vi.fn().mockResolvedValue({ id: "staff-del", tenantId }),
        delete: vi.fn().mockResolvedValue({ id: "staff-del" }),
      },
    } as unknown as Db;

    await expect(deleteStaffProfile(tenantId, "staff-del", mockDb)).resolves.not.toThrow();
  });
});
