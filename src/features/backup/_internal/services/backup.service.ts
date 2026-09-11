import { prisma } from "@/shared/lib/infra/prisma";
import { writeAudit } from "@/features/identity/server";
import {
  gtmtsBackupPayloadSchema,
  type GtmtsBackupPayload,
} from "../schemas";

export interface SystemDataStats {
  newsCount: number;
  departmentsCount: number;
  staffCount: number;
  programsCount: number;
  petitionsCount: number;
  roomsCount: number;
  bookingsCount: number;
  attendanceCount: number;
}

/** ดึงข้อมูลสถิติปัจจุบันของ Tenant เพื่อแสดงผลในหน้าต่างควบคุม */
export async function getSystemDataStats(tenantId: string): Promise<SystemDataStats> {
  const [
    newsCount,
    departmentsCount,
    staffCount,
    programsCount,
    petitionsCount,
    roomsCount,
    bookingsCount,
    attendanceCount,
  ] = await Promise.all([
    prisma.newsArticle.count({ where: { tenantId } }),
    prisma.department.count({ where: { tenantId } }),
    prisma.staffProfile.count({ where: { tenantId } }),
    prisma.program.count({ where: { tenantId } }),
    prisma.petition.count({ where: { tenantId } }),
    prisma.facilityRoom.count({ where: { tenantId } }),
    prisma.roomBooking.count({ where: { tenantId } }),
    prisma.examAttendance.count({ where: { tenantId } }),
  ]);

  return {
    newsCount,
    departmentsCount,
    staffCount,
    programsCount,
    petitionsCount,
    roomsCount,
    bookingsCount,
    attendanceCount,
  };
}

/** ส่งออกข้อมูลสำรองทั้งระบบของ Tenant เป็น GtmtsBackupPayload */
export async function exportTenantBackup(
  tenantId: string,
  actorId: string | null
): Promise<GtmtsBackupPayload> {
  const tenant = await prisma.tenant.findUniqueOrThrow({
    where: { id: tenantId },
  });

  const [
    newsArticles,
    departments,
    staffProfiles,
    programs,
    petitions,
    rooms,
    bookings,
    attendances,
  ] = await Promise.all([
    prisma.newsArticle.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.department.findMany({
      where: { tenantId },
      orderBy: { code: "asc" },
    }),
    prisma.staffProfile.findMany({
      where: { tenantId },
      include: { department: true },
      orderBy: { displayOrder: "asc" },
    }),
    prisma.program.findMany({
      where: { tenantId },
      include: { courses: true },
      orderBy: { code: "asc" },
    }),
    prisma.petition.findMany({
      where: { tenantId },
      include: {
        program: true,
        advisor: true,
        activities: { orderBy: { createdAt: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.facilityRoom.findMany({
      where: { tenantId },
      orderBy: { code: "asc" },
    }),
    prisma.roomBooking.findMany({
      where: { tenantId },
      include: { room: true },
      orderBy: { startTime: "asc" },
    }),
    prisma.examAttendance.findMany({
      where: { tenantId },
      orderBy: { verifiedAt: "desc" },
    }),
  ]);

  const stats: Record<string, number> = {
    newsArticles: newsArticles.length,
    departments: departments.length,
    staffProfiles: staffProfiles.length,
    programs: programs.length,
    petitions: petitions.length,
    facilityRooms: rooms.length,
    roomBookings: bookings.length,
    examAttendances: attendances.length,
  };

  const payload: GtmtsBackupPayload = {
    meta: {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      system: "Graduate Thesis Management and Tracking System (GTMTS)",
      tenant: {
        id: tenant.id,
        code: tenant.code,
        nameTh: tenant.nameTh,
        nameEn: tenant.nameEn,
      },
      stats,
    },
    newsArticles: newsArticles.map((n) => ({
      slug: n.slug,
      titleTh: n.titleTh,
      titleEn: n.titleEn,
      summaryTh: n.summaryTh,
      summaryEn: n.summaryEn,
      contentTh: n.contentTh,
      contentEn: n.contentEn,
      category: n.category,
      status: n.status,
      isPinned: n.isPinned,
      viewCount: n.viewCount,
      coverImageUrl: n.coverImageUrl,
      publishedAt: n.publishedAt ? n.publishedAt.toISOString() : null,
    })),
    departments: departments.map((d) => ({
      code: d.code,
      nameTh: d.nameTh,
      nameEn: d.nameEn,
      descriptionTh: d.descriptionTh,
      descriptionEn: d.descriptionEn,
      isActive: d.isActive,
    })),
    staffProfiles: staffProfiles.map((s) => ({
      prefixTh: s.prefixTh,
      prefixEn: s.prefixEn,
      firstNameTh: s.firstNameTh,
      lastNameTh: s.lastNameTh,
      firstNameEn: s.firstNameEn,
      lastNameEn: s.lastNameEn,
      email: s.email,
      phone: s.phone,
      academicRank: s.academicRank,
      positionTh: s.positionTh,
      positionEn: s.positionEn,
      departmentCode: s.department?.code ?? null,
      expertise: s.expertise,
      displayOrder: s.displayOrder,
      isActive: s.isActive,
    })),
    programs: programs.map((p) => ({
      code: p.code,
      slug: p.slug,
      nameTh: p.nameTh,
      nameEn: p.nameEn,
      degreeTh: p.degreeTh,
      degreeEn: p.degreeEn,
      degreeShortTh: p.degreeShortTh,
      degreeShortEn: p.degreeShortEn,
      level: p.level,
      totalCredits: p.totalCredits,
      studyDuration: p.studyDuration,
      descriptionTh: p.descriptionTh,
      descriptionEn: p.descriptionEn,
      courses: p.courses.map((c) => ({
        code: c.code,
        nameTh: c.nameTh,
        nameEn: c.nameEn,
        credits: c.credits,
        category: c.category,
        descriptionTh: c.descriptionTh,
        descriptionEn: c.descriptionEn,
      })),
    })),
    petitions: petitions.map((pet) => ({
      trackingNo: pet.trackingNo,
      type: pet.type,
      status: pet.status,
      title: pet.title,
      description: pet.description,
      studentId: pet.studentId,
      studentName: pet.studentName,
      studentEmail: pet.studentEmail,
      studentPhone: pet.studentPhone,
      thesisTitleTh: pet.thesisTitleTh,
      thesisTitleEn: pet.thesisTitleEn,
      programCode: pet.program?.code ?? null,
      advisorEmail: pet.advisor?.email ?? null,
      currentStep: pet.currentStep,
      activities: pet.activities.map((a) => ({
        action: a.action,
        previousStatus: a.previousStatus,
        newStatus: a.newStatus,
        comment: a.comment,
        actorName: a.actorName,
        actorRole: a.actorRole,
        createdAt: a.createdAt.toISOString(),
      })),
    })),
    facilityRooms: rooms.map((r) => ({
      code: r.code,
      nameTh: r.nameTh,
      nameEn: r.nameEn,
      building: r.building,
      floor: r.floor,
      capacity: r.capacity,
      type: r.type,
      facilities: r.facilities,
      description: r.description,
      isActive: r.isActive,
    })),
    roomBookings: bookings.map((b) => ({
      title: b.title,
      roomCode: b.room.code,
      purpose: b.purpose,
      type: b.type,
      platform: b.platform,
      meetingUrl: b.meetingUrl,
      startTime: b.startTime.toISOString(),
      endTime: b.endTime.toISOString(),
      status: b.status,
      bookedByName: b.bookedByName,
      bookedByEmail: b.bookedByEmail,
      bookedByPhone: b.bookedByPhone,
      attendeeCount: b.attendeeCount,
    })),
    examAttendances: attendances.map((ea) => ({
      studentCode: ea.studentCode,
      studentName: ea.studentName,
      examType: ea.examType,
      faceHash: ea.faceHash,
      confidenceScore: ea.confidenceScore,
      status: ea.status,
      pdpaConsent: ea.pdpaConsent,
      notes: ea.notes,
      verifiedAt: ea.verifiedAt.toISOString(),
    })),
  };

  await writeAudit({
    tenantId,
    actorId,
    action: "backup.export",
    entity: "backup",
    entityId: tenantId,
    after: stats,
  });

  return payload;
}

/** ตรวจสอบรูปแบบและความสมบูรณ์ของไฟล์ JSON ก่อนนำเข้า */
export function validateBackupPayload(jsonString: string): GtmtsBackupPayload {
  let raw: unknown;
  try {
    raw = JSON.parse(jsonString);
  } catch (err: any) {
    throw new Error(`รูปแบบไฟล์ไม่ถูกต้อง (Invalid JSON format): ${err.message}`);
  }

  return gtmtsBackupPayloadSchema.parse(raw);
}

/** ล้างข้อมูลธุรกรรมของ tenant ก่อนกู้คืน */
async function clearTenantData(tx: any, tenantId: string) {
  await tx.examAttendance.deleteMany({ where: { tenantId } });
  await tx.roomBooking.deleteMany({ where: { tenantId } });
  await tx.facilityRoom.deleteMany({ where: { tenantId } });
  await tx.petitionActivity.deleteMany({ where: { petition: { tenantId } } });
  await tx.petition.deleteMany({ where: { tenantId } });
  await tx.programCourse.deleteMany({ where: { program: { tenantId } } });
  await tx.program.deleteMany({ where: { tenantId } });
  await tx.staffProfile.deleteMany({ where: { tenantId } });
  await tx.department.deleteMany({ where: { tenantId } });
  await tx.newsArticle.deleteMany({ where: { tenantId } });
}

/** นำเข้าข้อมูลสำรองเข้าสู่ระบบ */
export async function importTenantBackup(
  tenantId: string,
  actorId: string | null,
  payload: GtmtsBackupPayload,
  mode: "merge" | "replace"
): Promise<{ success: boolean; message: string; stats: Record<string, number> }> {
  return await prisma.$transaction(async (tx) => {
    if (mode === "replace") {
      await clearTenantData(tx, tenantId);
    }

    // 1. Departments
    const deptMap = new Map<string, string>(); // code -> id
    for (const d of payload.departments) {
      const dept = await tx.department.upsert({
        where: { tenantId_code: { tenantId, code: d.code } },
        create: {
          tenantId,
          code: d.code,
          nameTh: d.nameTh,
          nameEn: d.nameEn,
          descriptionTh: d.descriptionTh ?? null,
          descriptionEn: d.descriptionEn ?? null,
          isActive: d.isActive,
        },
        update: {
          nameTh: d.nameTh,
          nameEn: d.nameEn,
          descriptionTh: d.descriptionTh ?? null,
          descriptionEn: d.descriptionEn ?? null,
          isActive: d.isActive,
        },
      });
      deptMap.set(d.code, dept.id);
    }

    // 2. Staff Profiles
    const staffEmailMap = new Map<string, string>(); // email -> id
    for (const s of payload.staffProfiles) {
      const departmentId = s.departmentCode ? deptMap.get(s.departmentCode) ?? null : null;
      const existing = await tx.staffProfile.findFirst({
        where: { tenantId, email: s.email },
      });

      if (existing) {
        await tx.staffProfile.update({
          where: { id: existing.id },
          data: {
            prefixTh: s.prefixTh ?? null,
            prefixEn: s.prefixEn ?? null,
            firstNameTh: s.firstNameTh,
            lastNameTh: s.lastNameTh,
            firstNameEn: s.firstNameEn,
            lastNameEn: s.lastNameEn,
            academicRank: s.academicRank,
            positionTh: s.positionTh,
            positionEn: s.positionEn,
            departmentId,
            phone: s.phone ?? null,
            expertise: s.expertise ?? undefined,
            displayOrder: s.displayOrder,
            isActive: s.isActive,
          },
        });
        staffEmailMap.set(s.email, existing.id);
      } else {
        const created = await tx.staffProfile.create({
          data: {
            tenantId,
            prefixTh: s.prefixTh ?? null,
            prefixEn: s.prefixEn ?? null,
            firstNameTh: s.firstNameTh,
            lastNameTh: s.lastNameTh,
            firstNameEn: s.firstNameEn,
            lastNameEn: s.lastNameEn,
            email: s.email,
            academicRank: s.academicRank,
            positionTh: s.positionTh,
            positionEn: s.positionEn,
            departmentId,
            phone: s.phone ?? null,
            expertise: s.expertise ?? undefined,
            displayOrder: s.displayOrder,
            isActive: s.isActive,
          },
        });
        staffEmailMap.set(s.email, created.id);
      }
    }

    // 3. News Articles
    for (const n of payload.newsArticles) {
      await tx.newsArticle.upsert({
        where: { tenantId_slug: { tenantId, slug: n.slug } },
        create: {
          tenantId,
          slug: n.slug,
          titleTh: n.titleTh,
          titleEn: n.titleEn,
          summaryTh: n.summaryTh ?? null,
          summaryEn: n.summaryEn ?? null,
          contentTh: n.contentTh,
          contentEn: n.contentEn,
          category: n.category,
          status: n.status,
          isPinned: n.isPinned,
          viewCount: n.viewCount,
          coverImageUrl: n.coverImageUrl ?? null,
          publishedAt: n.publishedAt ? new Date(n.publishedAt) : null,
        },
        update: {
          titleTh: n.titleTh,
          titleEn: n.titleEn,
          summaryTh: n.summaryTh ?? null,
          summaryEn: n.summaryEn ?? null,
          contentTh: n.contentTh,
          contentEn: n.contentEn,
          category: n.category,
          status: n.status,
          isPinned: n.isPinned,
          viewCount: n.viewCount,
          coverImageUrl: n.coverImageUrl ?? null,
          publishedAt: n.publishedAt ? new Date(n.publishedAt) : null,
        },
      });
    }

    // 4. Programs & Courses
    const progMap = new Map<string, string>(); // code -> id
    for (const p of payload.programs) {
      const prog = await tx.program.upsert({
        where: { tenantId_code: { tenantId, code: p.code } },
        create: {
          tenantId,
          code: p.code,
          slug: p.slug,
          nameTh: p.nameTh,
          nameEn: p.nameEn,
          degreeTh: p.degreeTh,
          degreeEn: p.degreeEn,
          degreeShortTh: p.degreeShortTh,
          degreeShortEn: p.degreeShortEn,
          level: p.level,
          totalCredits: p.totalCredits,
          studyDuration: p.studyDuration,
          descriptionTh: p.descriptionTh ?? null,
          descriptionEn: p.descriptionEn ?? null,
        },
        update: {
          nameTh: p.nameTh,
          nameEn: p.nameEn,
          degreeTh: p.degreeTh,
          degreeEn: p.degreeEn,
          totalCredits: p.totalCredits,
          studyDuration: p.studyDuration,
          descriptionTh: p.descriptionTh ?? null,
          descriptionEn: p.descriptionEn ?? null,
        },
      });
      progMap.set(p.code, prog.id);

      // Clean existing courses for program before inserting imported courses
      await tx.programCourse.deleteMany({ where: { programId: prog.id } });
      for (const c of p.courses) {
        await tx.programCourse.create({
          data: {
            programId: prog.id,
            code: c.code,
            nameTh: c.nameTh,
            nameEn: c.nameEn,
            credits: c.credits,
            category: c.category,
            descriptionTh: c.descriptionTh ?? null,
            descriptionEn: c.descriptionEn ?? null,
          },
        });
      }
    }

    // 5. Facility Rooms
    const roomMap = new Map<string, string>(); // code -> id
    for (const r of payload.facilityRooms) {
      const room = await tx.facilityRoom.upsert({
        where: { tenantId_code: { tenantId, code: r.code } },
        create: {
          tenantId,
          code: r.code,
          nameTh: r.nameTh,
          nameEn: r.nameEn,
          building: r.building,
          floor: r.floor,
          capacity: r.capacity,
          type: r.type,
          facilities: r.facilities ?? undefined,
          description: r.description ?? null,
          isActive: r.isActive,
        },
        update: {
          nameTh: r.nameTh,
          nameEn: r.nameEn,
          building: r.building,
          floor: r.floor,
          capacity: r.capacity,
          type: r.type,
          description: r.description ?? null,
          isActive: r.isActive,
        },
      });
      roomMap.set(r.code, room.id);
    }

    // 6. Room Bookings
    for (const b of payload.roomBookings) {
      const roomId = roomMap.get(b.roomCode);
      if (roomId) {
        await tx.roomBooking.create({
          data: {
            tenantId,
            roomId,
            title: b.title,
            purpose: b.purpose ?? null,
            type: b.type,
            platform: b.platform,
            meetingUrl: b.meetingUrl ?? null,
            startTime: new Date(b.startTime),
            endTime: new Date(b.endTime),
            status: b.status,
            bookedByName: b.bookedByName,
            bookedByEmail: b.bookedByEmail,
            bookedByPhone: b.bookedByPhone ?? null,
            attendeeCount: b.attendeeCount ?? null,
          },
        });
      }
    }

    // 7. Petitions & Activities
    for (const pet of payload.petitions) {
      const programId = pet.programCode ? progMap.get(pet.programCode) ?? null : null;
      const advisorId = pet.advisorEmail ? staffEmailMap.get(pet.advisorEmail) ?? null : null;

      const createdPet = await tx.petition.upsert({
        where: { tenantId_trackingNo: { tenantId, trackingNo: pet.trackingNo } },
        create: {
          tenantId,
          trackingNo: pet.trackingNo,
          type: pet.type,
          status: pet.status,
          title: pet.title,
          description: pet.description,
          studentId: pet.studentId,
          studentName: pet.studentName,
          studentEmail: pet.studentEmail,
          studentPhone: pet.studentPhone ?? null,
          thesisTitleTh: pet.thesisTitleTh ?? null,
          thesisTitleEn: pet.thesisTitleEn ?? null,
          programId,
          advisorId,
          currentStep: pet.currentStep,
        },
        update: {
          status: pet.status,
          title: pet.title,
          description: pet.description,
          thesisTitleTh: pet.thesisTitleTh ?? null,
          thesisTitleEn: pet.thesisTitleEn ?? null,
          programId,
          advisorId,
          currentStep: pet.currentStep,
        },
      });

      if (pet.activities && pet.activities.length > 0) {
        await tx.petitionActivity.deleteMany({ where: { petitionId: createdPet.id } });
        for (const act of pet.activities) {
          await tx.petitionActivity.create({
            data: {
              petitionId: createdPet.id,
              action: act.action,
              previousStatus: act.previousStatus ?? null,
              newStatus: act.newStatus,
              comment: act.comment ?? null,
              actorName: act.actorName,
              actorRole: act.actorRole,
              createdAt: act.createdAt ? new Date(act.createdAt) : new Date(),
            },
          });
        }
      }
    }

    // 8. Exam Attendances
    for (const ea of payload.examAttendances) {
      await tx.examAttendance.create({
        data: {
          tenantId,
          studentCode: ea.studentCode,
          studentName: ea.studentName,
          examType: ea.examType,
          faceHash: ea.faceHash,
          confidenceScore: ea.confidenceScore,
          status: ea.status,
          pdpaConsent: ea.pdpaConsent,
          notes: ea.notes ?? null,
          verifiedAt: ea.verifiedAt ? new Date(ea.verifiedAt) : new Date(),
        },
      });
    }

    const importedStats = {
      departments: payload.departments.length,
      staffProfiles: payload.staffProfiles.length,
      newsArticles: payload.newsArticles.length,
      programs: payload.programs.length,
      petitions: payload.petitions.length,
      facilityRooms: payload.facilityRooms.length,
      roomBookings: payload.roomBookings.length,
      examAttendances: payload.examAttendances.length,
    };

    await writeAudit({
      tenantId,
      actorId,
      action: "backup.import",
      entity: "backup",
      entityId: tenantId,
      after: { mode, stats: importedStats },
    }, tx);

    return {
      success: true,
      message: `นำเข้าข้อมูลเรียบร้อยแล้ว (${mode === "replace" ? "โหมด Replace" : "โหมด Merge"})`,
      stats: importedStats,
    };
  });
}

/** ดำเนินการล้างข้อมูลทั้งระบบ (Factory Reset) หรือรีเซ็ตเป็นชุดข้อมูลเริ่มต้น */
export async function performSystemWipe(
  tenantId: string,
  actorId: string | null,
  mode: "seed" | "clean"
): Promise<{ success: boolean; message: string }> {
  return await prisma.$transaction(async (tx) => {
    // ล้างข้อมูลธุรกรรมเดิม
    await clearTenantData(tx, tenantId);

    if (mode === "seed") {
      // 1. Seed ภาควิชา
      const d1 = await tx.department.create({
        data: {
          tenantId,
          code: "CPE",
          nameTh: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
          nameEn: "Department of Computer Engineering",
          descriptionTh: "มุ่งเน้นการวิจัยด้านระบบอัจฉริยะ ซอฟต์แวร์ และโครงสร้างพื้นฐานดิจิทัล",
        },
      });
      const d2 = await tx.department.create({
        data: {
          tenantId,
          code: "DS",
          nameTh: "ภาควิชาวิทยาการข้อมูลและปัญญาประดิษฐ์",
          nameEn: "Department of Data Science & AI",
          descriptionTh: "ศูนย์กลางความเป็นเลิศด้านปัญญาประดิษฐ์ โมเดลภาษาขนาดใหญ่ และวิทยาการข้อมูล",
        },
      });

      // 2. Seed คณาจารย์
      const s1 = await tx.staffProfile.create({
        data: {
          tenantId,
          departmentId: d1.id,
          prefixTh: "ศ.ดร.",
          prefixEn: "Prof. Dr.",
          firstNameTh: "สมชาย",
          lastNameTh: "ทรงปรีชา",
          firstNameEn: "Somchai",
          lastNameEn: "Songpreecha",
          email: "somchai.s@faculty.ac.th",
          academicRank: "PROFESSOR",
          positionTh: "ศาสตราจารย์ประจำภาควิชาวิศวกรรมคอมพิวเตอร์",
          positionEn: "Professor of Computer Engineering",
          expertise: ["Distributed Systems", "Cloud Computing", "Software Architecture"],
          displayOrder: 1,
        },
      });

      const s2 = await tx.staffProfile.create({
        data: {
          tenantId,
          departmentId: d2.id,
          prefixTh: "รศ.ดร.",
          prefixEn: "Assoc. Prof. Dr.",
          firstNameTh: "ศิริพร",
          lastNameTh: "รัตนมงคล",
          firstNameEn: "Siriporn",
          lastNameEn: "Rattanamongkol",
          email: "siriporn.r@faculty.ac.th",
          academicRank: "ASSOCIATE_PROFESSOR",
          positionTh: "รองศาสตราจารย์ประจำภาควิชาวิทยาการข้อมูลและปัญญาประดิษฐ์",
          positionEn: "Associate Professor of Data Science",
          expertise: ["Generative AI", "Natural Language Processing", "Machine Learning"],
          displayOrder: 2,
        },
      });

      // 3. Seed ข่าวสาร
      await tx.newsArticle.create({
        data: {
          tenantId,
          slug: "grad-thesis-welcome-2026",
          titleTh: "ยินดีต้อนรับนิสิตระดับบัณฑิตศึกษา เข้าสู่ระบบบริหารจัดการวิทยานิพนธ์ (GTMTS)",
          titleEn: "Welcome Graduate Students to the Graduate Thesis Management and Tracking System",
          summaryTh: "ระบบสารสนเทศบัณฑิตวิทยาลัยยุคใหม่ เพื่อการติดตามเค้าโครงและสอบวิทยานิพนธ์",
          summaryEn: "Next-generation Graduate Thesis Tracking and Defense Platform.",
          contentTh: "ระบบ GTMTS รองรับการยื่นขออนุมัติหัวข้อ เค้าโครง จัดตารางห้องสอบ และตรวจสอบอัตลักษณ์บุคคลเข้าห้องสอบอย่างปลอดภัย",
          contentEn: "GTMTS supports thesis lifecycle tracking, proposal examinations, defense scheduling, and biometrics attendance.",
          category: "ACADEMIC",
          status: "PUBLISHED",
          isPinned: true,
          publishedAt: new Date(),
        },
      });

      // 4. Seed หลักสูตร
      const prog = await tx.program.create({
        data: {
          tenantId,
          departmentId: d2.id,
          code: "M.Sc. AI",
          slug: "msc-artificial-intelligence",
          nameTh: "หลักสูตรวิทยาศาสตรมหาบัณฑิต สาขาวิชาปัญญาประดิษฐ์",
          nameEn: "Master of Science in Artificial Intelligence",
          degreeTh: "วิทยาศาสตรมหาบัณฑิต (ปัญญาประดิษฐ์)",
          degreeEn: "Master of Science (Artificial Intelligence)",
          degreeShortTh: "วท.ม. (ปัญญาประดิษฐ์)",
          degreeShortEn: "M.Sc. (AI)",
          level: "MASTER",
          totalCredits: 36,
          studyDuration: "2 ปี (2 Years)",
        },
      });

      await tx.programCourse.create({
        data: {
          programId: prog.id,
          code: "AI-701",
          nameTh: "วิทยานิพนธ์ระดับมหาบัณฑิต",
          nameEn: "Master's Thesis",
          credits: 12,
          category: "THESIS",
        },
      });

      // 5. Seed ห้องสอบ
      await tx.facilityRoom.create({
        data: {
          tenantId,
          code: "DEF-401",
          nameTh: "ห้องสอบวิทยานิพนธ์ 401 (Smart Defense Room)",
          nameEn: "Thesis Defense Room 401 (Smart Defense Room)",
          building: "อาคารนวัตกรรมวิชาการ",
          floor: 4,
          capacity: 15,
          type: "EXAM_ROOM",
          facilities: ["Projector 4K", "Hybrid Audio/Video", "Biometric Camera"],
          isActive: true,
        },
      });

      // 6. Seed คำร้องตัวอย่าง
      const petition = await tx.petition.create({
        data: {
          tenantId,
          trackingNo: "PET-2026-0001",
          type: "THESIS_TOPIC_APPROVAL",
          status: "ADVISOR_APPROVED",
          title: "ขออนุมัติหัวข้อวิทยานิพนธ์: ระบบ AI คุ้มครองข้อมูลส่วนบุคคลในกระบวนการสอบออนไลน์",
          description: "นิสิตยื่นขออนุมัติหัวข้อและแต่งตั้งอาจารย์ที่ปรึกษาวิทยานิพนธ์",
          studentId: "66010001",
          studentName: "นายนพดล ปัญญาไว",
          studentEmail: "nopadol.p@student.ac.th",
          studentPhone: "081-234-5678",
          thesisTitleTh: "การพัฒนาระบบปัญญาประดิษฐ์คุ้มครองข้อมูลส่วนบุคคลในกระบวนการสอบวิทยานิพนธ์",
          thesisTitleEn: "Development of AI Privacy-Preserving System in Graduate Defense Examinations",
          programId: prog.id,
          advisorId: s2.id,
          currentStep: 2,
        },
      });

      await tx.petitionActivity.create({
        data: {
          petitionId: petition.id,
          action: "SUBMIT",
          newStatus: "SUBMITTED",
          comment: "ยื่นคำร้องขออนุมัติหัวข้อวิทยานิพนธ์",
          actorName: "นายนพดล ปัญญาไว",
          actorRole: "STUDENT",
        },
      });

      await tx.petitionActivity.create({
        data: {
          petitionId: petition.id,
          action: "APPROVE",
          previousStatus: "SUBMITTED",
          newStatus: "ADVISOR_APPROVED",
          comment: "เห็นชอบในหัวข้อวิทยานิพนธ์และระเบียบวิธีวิจัยเบื้องต้น แนะนำให้นำเสนอต่อประธานหลักสูตร",
          actorName: "รศ.ดร.ศิริพร รัตนมงคล",
          actorRole: "ADVISOR",
        },
      });

      // 7. Seed การเข้าสอบชีวมิติ
      await tx.examAttendance.create({
        data: {
          tenantId,
          studentCode: "66010001",
          studentName: "นายนพดล ปัญญาไว",
          examType: "PROPOSAL_DEFENSE",
          faceHash: "a7b8c9d0e1f234567890abcdef1234567890abcdef1234567890abcdef123456",
          confidenceScore: 98.4,
          status: "VERIFIED",
          pdpaConsent: true,
          notes: "Initial seed verified record",
        },
      });
    }

    await writeAudit({
      tenantId,
      actorId,
      action: "backup.wipe",
      entity: "backup",
      entityId: tenantId,
      after: { mode },
    }, tx);

    return {
      success: true,
      message:
        mode === "seed"
          ? "ล้างข้อมูลและรีเซ็ตระบบกลับเป็นชุดข้อมูลมาตรฐานบัณฑิตวิทยาลัยเรียบร้อยแล้ว"
          : "ล้างข้อมูลธุรกรรมทั้งหมดในระบบเรียบร้อยแล้ว (Clean Wipe)",
    };
  });
}
