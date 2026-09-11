import { describe, it, expect } from "vitest";
import { prisma } from "@/shared/lib/infra/prisma";
import { seedCore } from "../../../../../prisma/lib/seed-core";
import {
  createDepartment,
  updateDepartment,
  deleteDepartment,
  createStaffProfile,
  updateStaffProfile,
  toggleStaffActive,
  deleteStaffProfile,
  listStaffProfiles,
  getPublicStaffDirectory,
  getPublicStaffDetail,
} from "./staff.service";

describe("staff.service (integration)", () => {
  it("สามารถจัดการภาควิชา, เพิ่มบุคลากร, แก้ไข, สลับสถานะ, ค้นหา และดึงข้อมูลทำเนียบบน DB จริงได้", async () => {
    const core = await seedCore(prisma, {
      tenantCode: "STAFF_INT",
      nameTh: "คณะทดสอบบุคลากร",
      nameEn: "Test Staff Faculty",
    });

    // 1. Create Department
    const dept = await createDepartment(core.tenantId, {
      code: "CPE_TEST",
      nameTh: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
      nameEn: "Department of Computer Engineering",
      displayOrder: 1,
      isActive: true,
    });
    expect(dept.id).toBeDefined();
    expect(dept.code).toBe("CPE_TEST");

    // 2. Create Staff Profile (Faculty Member / Academic)
    const staff = await createStaffProfile(core.tenantId, {
      departmentId: dept.id,
      staffType: "ACADEMIC",
      academicRank: "PROFESSOR",
      prefixTh: "ศ.ดร.",
      prefixEn: "Prof. Dr.",
      firstNameTh: "ธีรเดช",
      lastNameTh: "พัฒนพงศ์",
      firstNameEn: "Teeradej",
      lastNameEn: "Pattanapong",
      positionTh: "คณบดี",
      positionEn: "Dean",
      isExecutive: true,
      executiveRole: "คณบดี",
      executiveOrder: 1,
      email: "teeradej@faculty.test",
      phone: "02-999-8888",
      officeRoom: "Room 401",
      officeHours: "Wed 13:00-15:00",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
      education: ["Ph.D. in Computer Science", "M.Eng. in CE"],
      expertise: ["Artificial Intelligence", "High Performance Computing"],
      researchInterests: "Distributed Computing and Machine Learning",
      googleScholarUrl: "https://scholar.google.com/citations?user=123",
      orcidId: "0000-0001-2345-6789",
      bioTh: "ประวัติการทำงาน...",
      bioEn: "Career background...",
      displayOrder: 1,
      isActive: true,
    });

    expect(staff.id).toBeDefined();
    expect(staff.fullNameTh).toBe("ศ.ดร. ธีรเดช พัฒนพงศ์");
    expect(staff.fullNameEn).toBe("Prof. Dr. Teeradej Pattanapong");
    expect(staff.departmentCode).toBe("CPE_TEST");
    expect(staff.isExecutive).toBe(true);

    // 3. Update Staff Profile
    const updated = await updateStaffProfile(core.tenantId, {
      id: staff.id,
      positionTh: "คณบดีคณะวิทยาการสารสนเทศ",
      phone: "02-999-9999",
    });
    expect(updated.positionTh).toBe("คณบดีคณะวิทยาการสารสนเทศ");
    expect(updated.phone).toBe("02-999-9999");

    // 4. Toggle Active
    const toggledOff = await toggleStaffActive(core.tenantId, staff.id);
    expect(toggledOff.isActive).toBe(false);

    const toggledOn = await toggleStaffActive(core.tenantId, staff.id);
    expect(toggledOn.isActive).toBe(true);

    // 5. List Staff Profiles in Admin Console
    const listRes = await listStaffProfiles(core.tenantId, {
      search: "ธีรเดช",
    });
    expect(listRes.items).toHaveLength(1);
    expect(listRes.items[0].id).toBe(staff.id);

    // 6. Public Directory Query
    const directory = await getPublicStaffDirectory(core.tenantId);
    expect(directory.executives.some((e) => e.id === staff.id)).toBe(true);
    expect(directory.departments.some((d) => d.id === dept.id)).toBe(true);
    expect(directory.staffList.some((s) => s.id === staff.id)).toBe(true);

    // 7. Public Detail Query
    const detail = await getPublicStaffDetail(core.tenantId, staff.id);
    expect(detail).not.toBeNull();
    expect(detail?.id).toBe(staff.id);
    expect(detail?.expertise).toEqual(["Artificial Intelligence", "High Performance Computing"]);

    // 8. Delete Staff Profile
    await deleteStaffProfile(core.tenantId, staff.id);
    const afterStaffDelete = await getPublicStaffDetail(core.tenantId, staff.id);
    expect(afterStaffDelete).toBeNull();

    // 9. Update & Delete Department
    const updatedDept = await updateDepartment(core.tenantId, {
      id: dept.id,
      nameTh: "ภาควิชาวิศวกรรมคอมพิวเตอร์และปัญญาประดิษฐ์",
    });
    expect(updatedDept.nameTh).toBe("ภาควิชาวิศวกรรมคอมพิวเตอร์และปัญญาประดิษฐ์");

    await deleteDepartment(core.tenantId, dept.id);
  });
});
