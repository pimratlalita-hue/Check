import { describe, it, expect, vi } from "vitest";
import type { Db } from "@/shared/lib/infra/prisma";
import {
  createProgramSchema,
  updateProgramSchema,
  createProgramCourseSchema,
  listProgramsQuerySchema,
} from "../schemas";
import {
  createProgram,
  updateProgram,
  deleteProgram,
  createProgramCourse,
  deleteProgramCourse,
} from "./curriculum.service";

describe("Curriculum Schemas Validation", () => {
  it("validate createProgramSchema สำเร็จเมื่อข้อมูลถูกต้อง", () => {
    const input = {
      code: "CS-BS-2565",
      nameTh: "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์",
      nameEn: "Bachelor of Science Program in Computer Science",
      degreeTh: "วิทยาศาสตรบัณฑิต (วิทยาการคอมพิวเตอร์)",
      degreeEn: "Bachelor of Science (Computer Science)",
      degreeShortTh: "วท.บ. (วิทยาการคอมพิวเตอร์)",
      degreeShortEn: "B.Sc. (Computer Science)",
      level: "BACHELOR" as const,
      type: "THAI" as const,
      status: "ACTIVE" as const,
      slug: "bachelor-computer-science",
      totalCredits: 128,
      studyDuration: "4 ปี (8 ภาคการศึกษา)",
      tuitionFee: "21,000 บาท / ภาคการศึกษา",
      careerPaths: ["Software Engineer", "Data Scientist"],
      learningOutcomes: [
        { code: "PLO1", descTh: "สามารถประยุกต์ใช้หลักการเขียนโปรแกรม" },
      ],
    };

    const parsed = createProgramSchema.parse(input);
    expect(parsed.code).toBe("CS-BS-2565");
    expect(parsed.totalCredits).toBe(128);
    expect(parsed.careerPaths).toHaveLength(2);
    expect(parsed.learningOutcomes).toHaveLength(1);
  });

  it("validate createProgramSchema ล้มเหลวเมื่อ slug มีอักขระพิเศษหรือพิมพ์ใหญ่", () => {
    const input = {
      code: "CS-BS-2565",
      nameTh: "หลักสูตรวิทยาการคอมพิวเตอร์",
      nameEn: "Computer Science",
      degreeTh: "วท.บ.",
      degreeEn: "B.Sc.",
      degreeShortTh: "วท.บ.",
      degreeShortEn: "B.Sc.",
      slug: "Bachelor Computer Science!", // invalid slug
      totalCredits: 128,
      studyDuration: "4 ปี",
    };

    expect(() => createProgramSchema.parse(input)).toThrow();
  });

  it("validate updateProgramSchema ต้องมี id เป็น UUID", () => {
    const valid = {
      id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      nameTh: "ชื่อใหม่",
    };
    expect(updateProgramSchema.parse(valid).id).toBe("9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d");

    const invalid = {
      id: "invalid-id",
      nameTh: "ชื่อใหม่",
    };
    expect(() => updateProgramSchema.parse(invalid)).toThrow();
  });

  it("validate createProgramCourseSchema สำเร็จเมื่อข้อมูลถูกต้อง", () => {
    const input = {
      programId: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      code: "01418111",
      nameTh: "การเขียนโปรแกรมคอมพิวเตอร์ 1",
      nameEn: "Computer Programming I",
      credits: 3,
      creditHours: "3(2-2-5)",
      category: "CORE_COURSE" as const,
      year: 1,
      semester: 1,
    };

    const parsed = createProgramCourseSchema.parse(input);
    expect(parsed.code).toBe("01418111");
    expect(parsed.credits).toBe(3);
    expect(parsed.category).toBe("CORE_COURSE");
  });

  it("validate listProgramsQuerySchema กำหนดค่าเริ่มต้น page=1 และ perPage=50", () => {
    const parsed = listProgramsQuerySchema.parse({});
    expect(parsed.page).toBe(1);
    expect(parsed.perPage).toBe(50);
  });
});

describe("Curriculum Service Logic", () => {
  const tenantId = "test-tenant-uuid";

  it("createProgram: ปฏิเสธเมื่อรหัสหลักสูตรซ้ำใน tenant เดียวกัน", async () => {
    const mockDb = {
      program: {
        findFirst: vi.fn().mockImplementation(({ where }) => {
          if (where.code === "CS-BS-2565") return Promise.resolve({ id: "p1", code: "CS-BS-2565" });
          return Promise.resolve(null);
        }),
      },
    } as unknown as Db;

    await expect(
      createProgram(tenantId, {
        code: "CS-BS-2565",
        nameTh: "วิทยาการคอมพิวเตอร์",
        nameEn: "Computer Science",
        degreeTh: "วิทยาศาสตรบัณฑิต",
        degreeEn: "Bachelor of Science",
        degreeShortTh: "วท.บ.",
        degreeShortEn: "B.Sc.",
        level: "BACHELOR",
        type: "THAI",
        status: "ACTIVE",
        slug: "cs-bs",
        totalCredits: 128,
        studyDuration: "4 ปี",
        displayOrder: 1,
      }, mockDb)
    ).rejects.toThrow("รหัสหลักสูตรนี้มีอยู่ในระบบแล้ว");
  });

  it("createProgram: ปฏิเสธเมื่อ slug ซ้ำใน tenant เดียวกัน", async () => {
    const mockDb = {
      program: {
        findFirst: vi.fn().mockImplementation(({ where }) => {
          if (where.slug === "cs-bs") return Promise.resolve({ id: "p1", slug: "cs-bs" });
          return Promise.resolve(null);
        }),
      },
    } as unknown as Db;

    await expect(
      createProgram(tenantId, {
        code: "CS-NEW",
        nameTh: "วิทยาการคอมพิวเตอร์",
        nameEn: "Computer Science",
        degreeTh: "วิทยาศาสตรบัณฑิต",
        degreeEn: "Bachelor of Science",
        degreeShortTh: "วท.บ.",
        degreeShortEn: "B.Sc.",
        level: "BACHELOR",
        type: "THAI",
        status: "ACTIVE",
        slug: "cs-bs",
        totalCredits: 128,
        studyDuration: "4 ปี",
        displayOrder: 1,
      }, mockDb)
    ).rejects.toThrow("URL Slug นี้มีอยู่ในระบบแล้ว");
  });

  it("createProgram: สร้างสำเร็จเมื่อข้อมูลถูกต้องครบถ้วน", async () => {
    const now = new Date();
    const createdItem = {
      id: "new-program-id",
      tenantId,
      code: "CS-BS-2565",
      nameTh: "วิทยาการคอมพิวเตอร์",
      nameEn: "Computer Science",
      degreeTh: "วิทยาศาสตรบัณฑิต",
      degreeEn: "Bachelor of Science",
      degreeShortTh: "วท.บ.",
      degreeShortEn: "B.Sc.",
      level: "BACHELOR",
      type: "THAI",
      status: "ACTIVE",
      slug: "cs-bs-2565",
      totalCredits: 128,
      studyDuration: "4 ปี",
      tuitionFee: "21,000 บาท",
      descriptionTh: null,
      descriptionEn: null,
      philosophyTh: null,
      philosophyEn: null,
      careerPaths: ["Programmer"],
      learningOutcomes: [{ code: "PLO1", descTh: "Coding" }],
      handbookUrl: null,
      imageUrl: null,
      departmentId: null,
      displayOrder: 1,
      createdAt: now,
      updatedAt: now,
      department: null,
      _count: { courses: 0 },
    };

    const mockDb = {
      program: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue(createdItem),
      },
    } as unknown as Db;

    const result = await createProgram(tenantId, {
      code: "CS-BS-2565",
      nameTh: "วิทยาการคอมพิวเตอร์",
      nameEn: "Computer Science",
      degreeTh: "วิทยาศาสตรบัณฑิต",
      degreeEn: "Bachelor of Science",
      degreeShortTh: "วท.บ.",
      degreeShortEn: "B.Sc.",
      level: "BACHELOR",
      type: "THAI",
      status: "ACTIVE",
      slug: "cs-bs-2565",
      totalCredits: 128,
      studyDuration: "4 ปี",
      careerPaths: ["Programmer"],
      learningOutcomes: [{ code: "PLO1", descTh: "Coding" }],
      displayOrder: 1,
    }, mockDb);

    expect(result.id).toBe("new-program-id");
    expect(result.code).toBe("CS-BS-2565");
    expect(result.careerPaths).toEqual(["Programmer"]);
    expect(result.learningOutcomes).toEqual([{ code: "PLO1", descTh: "Coding" }]);
  });

  it("updateProgram: ปฏิเสธเมื่อไม่พบหลักสูตร", async () => {
    const mockDb = {
      program: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    } as unknown as Db;

    await expect(
      updateProgram(tenantId, {
        id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        nameTh: "ชื่อใหม่",
      }, mockDb)
    ).rejects.toThrow("ไม่พบข้อมูลหลักสูตร");
  });

  it("deleteProgram: ปฏิเสธเมื่อไม่พบหลักสูตร", async () => {
    const mockDb = {
      program: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    } as unknown as Db;

    await expect(
      deleteProgram(tenantId, "not-exist-id", mockDb)
    ).rejects.toThrow("ไม่พบข้อมูลหลักสูตร");
  });

  it("createProgramCourse: สร้างรายวิชาสำเร็จเมื่อพบหลักสูตร", async () => {
    const now = new Date();
    const mockDb = {
      program: {
        findFirst: vi.fn().mockResolvedValue({ id: "p1", tenantId }),
      },
      programCourse: {
        create: vi.fn().mockResolvedValue({
          id: "c1",
          programId: "p1",
          code: "01418111",
          nameTh: "การเขียนโปรแกรมคอมพิวเตอร์ 1",
          nameEn: "Computer Programming I",
          credits: 3,
          creditHours: "3(2-2-5)",
          category: "CORE_COURSE",
          semester: 1,
          year: 1,
          descriptionTh: null,
          descriptionEn: null,
          prerequisite: null,
          displayOrder: 1,
          createdAt: now,
          updatedAt: now,
        }),
      },
    } as unknown as Db;

    const result = await createProgramCourse(tenantId, {
      programId: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      code: "01418111",
      nameTh: "การเขียนโปรแกรมคอมพิวเตอร์ 1",
      nameEn: "Computer Programming I",
      credits: 3,
      creditHours: "3(2-2-5)",
      category: "CORE_COURSE",
      semester: 1,
      year: 1,
      displayOrder: 1,
    }, mockDb);

    expect(result.id).toBe("c1");
    expect(result.code).toBe("01418111");
    expect(result.credits).toBe(3);
  });

  it("deleteProgramCourse: ลบรายวิชาสำเร็จเมื่อพบวิชาใน tenant", async () => {
    const mockDb = {
      programCourse: {
        findFirst: vi.fn().mockResolvedValue({ id: "c1", program: { tenantId } }),
        delete: vi.fn().mockResolvedValue({ id: "c1" }),
      },
    } as unknown as Db;

    await expect(deleteProgramCourse(tenantId, "c1", mockDb)).resolves.toBeUndefined();
    expect(mockDb.programCourse.delete).toHaveBeenCalledWith({ where: { id: "c1" } });
  });
});
