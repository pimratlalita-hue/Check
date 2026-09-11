import { describe, it, expect } from "vitest";
import { prisma } from "@/shared/lib/infra/prisma";
import { seedCore } from "../../../../../prisma/lib/seed-core";
import {
  submitPublicPetition,
  processPetitionAction,
  trackPublicPetition,
  getPublicPetitionDetail,
  listPetitions,
  getWorkflowStats,
} from "./workflow.service";

describe("workflow.service (integration)", () => {
  it("สามารถยื่นคำร้อง, อนุมัติตามลำดับขั้น 4 ระดับ, ส่งกลับแก้ไข, และค้นหาติดตามสถานะบน DB จริงได้", async () => {
    const core = await seedCore(prisma, {
      tenantCode: "WORK_INT",
      nameTh: "คณะทดสอบระบบคำร้อง",
      nameEn: "Test Workflow Faculty",
    });

    // 1. Submit a thesis proposal petition
    const petition1 = await submitPublicPetition(core.tenantId, {
      type: "THESIS_TOPIC_APPROVAL",
      title: "ขออนุมัติหัวข้อและเค้าโครงวิทยานิพนธ์",
      description: "เสนอหัวข้อการวิจัยเรื่อง ระบบประมวลผลภาษาธรรมชาติสำหรับภาษาไทย",
      studentId: "65019999",
      studentName: "น.ส.วิไลลักษณ์ มั่นคง",
      studentEmail: "wilailak@univ.ac.th",
      studentPhone: "0891234567",
      thesisTitleTh: "ระบบประมวลผลภาษาธรรมชาติสำหรับภาษาไทย",
      thesisTitleEn: "Natural Language Processing System for Thai Language",
      attachmentUrl: "https://storage.univ.ac.th/thesis/proposal-65019999.pdf",
    });

    expect(petition1.id).toBeDefined();
    expect(petition1.status).toBe("SUBMITTED");
    expect(petition1.currentStep).toBe(1);
    expect(petition1.trackingNo).toMatch(/^REQ-\d{4}-\d{4}$/);
    expect(petition1.activities).toHaveLength(1);
    expect(petition1.activities?.[0].action).toBe("SUBMIT");

    // 2. Step 1 -> Step 2: Advisor Approves
    const step2 = await processPetitionAction(core.tenantId, {
      petitionId: petition1.id,
      action: "APPROVE",
      actorName: "ศ.ดร.สมศักดิ์ ปัญญาดี",
      actorRole: "ADVISOR",
      comment: "เห็นชอบกับเค้าโครงวิจัย สามารถดำเนินการต่อได้",
    });

    expect(step2.status).toBe("ADVISOR_APPROVED");
    expect(step2.currentStep).toBe(2);
    expect(step2.activities).toHaveLength(2);

    // 3. Step 2 -> Step 3: Program Chair Approves
    const step3 = await processPetitionAction(core.tenantId, {
      petitionId: petition1.id,
      action: "APPROVE",
      actorName: "รศ.ดร.อานนท์ วิชาการ",
      actorRole: "PROGRAM_CHAIR",
      comment: "หลักสูตรเห็นชอบและผ่านการพิจารณา",
    });

    expect(step3.status).toBe("CHAIR_APPROVED");
    expect(step3.currentStep).toBe(3);
    expect(step3.activities).toHaveLength(3);

    // 4. Step 3 -> Step 4: Dean's Office / Graduate School Final Approval
    const step4 = await processPetitionAction(core.tenantId, {
      petitionId: petition1.id,
      action: "APPROVE",
      actorName: "ศ.ดร.วิชัย บัณฑิต",
      actorRole: "DEAN_OFFICE",
      comment: "อนุมัติแต่งตั้งคณะกรรมการและหัวข้อวิทยานิพนธ์เรียบร้อย",
    });

    expect(step4.status).toBe("COMPLETED");
    expect(step4.currentStep).toBe(4);
    expect(step4.activities).toHaveLength(4);

    // 5. Submit a second petition to test RETURN flow
    const petition2 = await submitPublicPetition(core.tenantId, {
      type: "DEFENSE_EXAM_REQUEST",
      title: "ขอสอบปากเปล่าวิทยานิพนธ์",
      description: "ขอยื่นสอบปากเปล่าประจำภาคการศึกษาที่ 2/2569",
      studentId: "65019999",
      studentName: "น.ส.วิไลลักษณ์ มั่นคง",
      studentEmail: "wilailak@univ.ac.th",
    });

    expect(petition2.status).toBe("SUBMITTED");

    // Return petition2 for revision
    const returned = await processPetitionAction(core.tenantId, {
      petitionId: petition2.id,
      action: "RETURN",
      actorName: "ศ.ดร.สมศักดิ์ ปัญญาดี",
      actorRole: "ADVISOR",
      comment: "ขอให้แนบผลคะแนนการทดสอบภาษาอังกฤษและเล่มฉบับสมบูรณ์เพิ่มเติม",
    });

    expect(returned.status).toBe("RETURNED");
    expect(returned.currentStep).toBe(1);

    // 6. Test Public Tracking
    const trackedByStudentId = await trackPublicPetition(core.tenantId, "65019999");
    expect(trackedByStudentId).toHaveLength(2);

    const trackedByTrackingNo = await trackPublicPetition(core.tenantId, petition1.trackingNo);
    expect(trackedByTrackingNo).toHaveLength(1);
    expect(trackedByTrackingNo[0].id).toBe(petition1.id);

    const publicDetail = await getPublicPetitionDetail(core.tenantId, petition1.trackingNo);
    expect(publicDetail).not.toBeNull();
    expect(publicDetail?.status).toBe("COMPLETED");

    // 7. Test Admin List & Stats
    const stats = await getWorkflowStats(core.tenantId);
    expect(stats.total).toBe(2);
    expect(stats.completed).toBe(1);
    expect(stats.issues).toBe(1); // 1 RETURNED
    expect(stats.pending).toBe(0);

    const listAll = await listPetitions(core.tenantId, { tab: "all" });
    expect(listAll.items).toHaveLength(2);

    const listCompleted = await listPetitions(core.tenantId, { tab: "completed" });
    expect(listCompleted.items).toHaveLength(1);
    expect(listCompleted.items[0].id).toBe(petition1.id);

    const listIssues = await listPetitions(core.tenantId, { tab: "issues" });
    expect(listIssues.items).toHaveLength(1);
    expect(listIssues.items[0].id).toBe(petition2.id);
  });
});
