import { describe, it, expect } from "vitest";
import { prisma } from "@/shared/lib/infra/prisma";
import { seedCore } from "../../../../../prisma/lib/seed-core";
import {
  createProgram,
  updateProgram,
  deleteProgram,
  listPrograms,
  getProgramById,
  getProgramBySlug,
  createProgramCourse,
  updateProgramCourse,
  deleteProgramCourse,
  listProgramCourses,
  listPublicPrograms,
  getPublicProgramDetail,
} from "./curriculum.service";

describe("curriculum.service (integration)", () => {
  it("สามารถสร้างหลักสูตร, จัดการรายวิชา, ค้นหา, ดึงข้อมูลหน้า Public Portal และลบข้อมูลบน DB จริงได้", async () => {
    const core = await seedCore(prisma, {
      tenantCode: "CURR_INT",
      nameTh: "คณะทดสอบหลักสูตร",
      nameEn: "Test Curriculum Faculty",
    });

    // 1. Create Program
    const program = await createProgram(core.tenantId, {
      code: "CS-BS-2565",
      nameTh: "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์",
      nameEn: "Bachelor of Science Program in Computer Science",
      degreeTh: "วิทยาศาสตรบัณฑิต (วิทยาการคอมพิวเตอร์)",
      degreeEn: "Bachelor of Science (Computer Science)",
      degreeShortTh: "วท.บ. (วิทยาการคอมพิวเตอร์)",
      degreeShortEn: "B.Sc. (Computer Science)",
      level: "BACHELOR",
      type: "THAI",
      status: "ACTIVE",
      slug: "bachelor-computer-science",
      totalCredits: 128,
      studyDuration: "4 ปี (8 ภาคการศึกษา)",
      tuitionFee: "21,000 บาท / ภาคการศึกษา",
      philosophyTh: "มุ่งเน้นการผลิตบัณฑิตที่มีความรู้ความเชี่ยวชาญด้านวิทยาการคอมพิวเตอร์",
      philosophyEn: "Focus on producing graduates with expertise in computer science",
      careerPaths: ["Software Engineer", "DevOps Engineer", "Data Scientist"],
      learningOutcomes: [
        { code: "PLO1", descTh: "เข้าใจหลักการเขียนโปรแกรมเชิงวัตถุ", descEn: "Understand OOP" },
        { code: "PLO2", descTh: "สามารถออกแบบสถาปัตยกรรมซอฟต์แวร์ได้", descEn: "Design software" },
      ],
      handbookUrl: "https://example.com/cs-handbook.pdf",
      displayOrder: 1,
    });

    expect(program.id).toBeDefined();
    expect(program.code).toBe("CS-BS-2565");
    expect(program.careerPaths).toHaveLength(3);
    expect(program.learningOutcomes).toHaveLength(2);

    // 2. Add Courses to Program
    const course1 = await createProgramCourse(core.tenantId, {
      programId: program.id,
      code: "01418111",
      nameTh: "การเขียนโปรแกรมคอมพิวเตอร์ 1",
      nameEn: "Computer Programming I",
      credits: 3,
      creditHours: "3(2-2-5)",
      category: "CORE_COURSE",
      year: 1,
      semester: 1,
    });
    expect(course1.id).toBeDefined();
    expect(course1.code).toBe("01418111");

    const course2 = await createProgramCourse(core.tenantId, {
      programId: program.id,
      code: "01418112",
      nameTh: "การเขียนโปรแกรมคอมพิวเตอร์ 2",
      nameEn: "Computer Programming II",
      credits: 3,
      creditHours: "3(2-2-5)",
      category: "CORE_COURSE",
      year: 1,
      semester: 2,
      prerequisite: "01418111",
    });
    expect(course2.id).toBeDefined();

    // 3. List courses
    const courses = await listProgramCourses(core.tenantId, program.id);
    expect(courses).toHaveLength(2);

    // 4. Update Course
    const updatedCourse = await updateProgramCourse(core.tenantId, {
      id: course2.id,
      nameTh: "การเขียนโปรแกรมคอมพิวเตอร์ขั้นสูง",
    });
    expect(updatedCourse.nameTh).toBe("การเขียนโปรแกรมคอมพิวเตอร์ขั้นสูง");

    // 5. Update Program
    const updatedProg = await updateProgram(core.tenantId, {
      id: program.id,
      totalCredits: 130,
    });
    expect(updatedProg.totalCredits).toBe(130);

    // 6. List Programs in Admin
    const listResult = await listPrograms(core.tenantId, {
      search: "CS-BS",
      level: "BACHELOR",
    });
    expect(listResult.items).toHaveLength(1);
    expect(listResult.items[0].id).toBe(program.id);
    expect(listResult.items[0].courseCount).toBe(2);

    // 7. Get Program by ID and Slug
    const byId = await getProgramById(core.tenantId, program.id);
    expect(byId?.id).toBe(program.id);
    expect(byId?.courses).toHaveLength(2);

    const bySlug = await getProgramBySlug(core.tenantId, "bachelor-computer-science");
    expect(bySlug?.id).toBe(program.id);

    // 8. Public Queries
    const publicList = await listPublicPrograms(core.tenantId);
    expect(publicList).toHaveLength(1);

    const publicDetail = await getPublicProgramDetail(core.tenantId, "bachelor-computer-science");
    expect(publicDetail?.id).toBe(program.id);
    expect(publicDetail?.courses).toHaveLength(2);

    // 9. Delete Course
    await deleteProgramCourse(core.tenantId, course1.id);
    const coursesAfterDel = await listProgramCourses(core.tenantId, program.id);
    expect(coursesAfterDel).toHaveLength(1);

    // 10. Delete Program
    await deleteProgram(core.tenantId, program.id);
    const listAfterDel = await listPrograms(core.tenantId, {});
    expect(listAfterDel.items).toHaveLength(0);
  });
});
