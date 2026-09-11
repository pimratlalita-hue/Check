import type { Dictionary } from "@/shared/lib/i18n/translate";

export const MESSAGES: Dictionary = {
  // Navigation & titles
  "workflow.nav": { th: "คำร้องและอนุมัติ", en: "Workflow & Petitions" },
  "workflow.title": { th: "ระบบคำร้องและกระบวนการขออนุมัติเอกสารออนไลน์", en: "Academic Petitions & Approval Workflow" },
  "workflow.description": {
    th: "จัดการ ตรวจสอบ และพิจารณาคำร้องวิชาการตามลำดับขั้น พร้อมติดตามสถานะแบบเรียลไทม์",
    en: "Manage, review, and process academic petitions through hierarchical approval workflow",
  },
  "workflow.portalTitle": { th: "บริการคำร้องวิชาการออนไลน์", en: "Online Academic Petitions" },
  "workflow.portalSubtitle": {
    th: "ยื่นคำร้อง ติดตามสถานะ และตรวจสอบผลการพิจารณาคำร้องวิชาการและวิทยานิพนธ์ คณะวิทยาการและเทคโนโลยีสารสนเทศ",
    en: "Submit, track, and monitor academic petitions and thesis approvals, Faculty of Science & Information Technology",
  },

  // Tabs & Filters
  "workflow.tab.all": { th: "คำร้องทั้งหมด", en: "All Petitions" },
  "workflow.tab.pending": { th: "รอการพิจารณา", en: "Pending Review" },
  "workflow.tab.completed": { th: "อนุมัติเสร็จสมบูรณ์", en: "Completed" },
  "workflow.tab.issues": { th: "ส่งกลับแก้ไข / ปฏิเสธ", en: "Returned / Rejected" },
  "workflow.portalTab.submit": { th: "ยื่นคำร้องออนไลน์", en: "Submit Online Petition" },
  "workflow.portalTab.track": { th: "ติดตามสถานะคำร้อง", en: "Track Petition Status" },

  // KPI Stats
  "workflow.stats.total": { th: "คำร้องทั้งหมด", en: "Total Petitions" },
  "workflow.stats.pending": { th: "รอการพิจารณา", en: "Pending Review" },
  "workflow.stats.completed": { th: "อนุมัติเสร็จสิ้น", en: "Completed" },
  "workflow.stats.issues": { th: "ส่งกลับ / ปฏิเสธ", en: "Returned / Rejected" },

  // Search & Table
  "workflow.searchPlaceholder": {
    th: "ค้นหาด้วยรหัสคำร้อง, รหัสนิสิต, ชื่อผู้ยื่น, หรือหัวข้อ...",
    en: "Search by tracking no, student ID, name, or title...",
  },
  "workflow.filterByType": { th: "ประเภทคำร้อง", en: "Petition Type" },
  "workflow.filterByStatus": { th: "สถานะ", en: "Status" },
  "workflow.empty": { th: "ไม่พบข้อมูลคำร้อง", en: "No petitions found" },
  "workflow.emptyDesc": {
    th: "ยังไม่มีรายการคำร้องที่ตรงกับเงื่อนไขการค้นหาในระบบ",
    en: "There are no petitions matching your search criteria",
  },
  "workflow.col.trackingNo": { th: "รหัสคำร้อง", en: "Tracking No." },
  "workflow.col.student": { th: "ผู้ยื่นคำร้อง", en: "Student" },
  "workflow.col.type": { th: "ประเภทคำร้อง", en: "Petition Type" },
  "workflow.col.title": { th: "หัวข้อคำร้อง", en: "Petition Title" },
  "workflow.col.advisor": { th: "อาจารย์ที่ปรึกษา", en: "Advisor" },
  "workflow.col.submittedAt": { th: "วันที่ยื่น", en: "Submitted At" },
  "workflow.col.status": { th: "สถานะ", en: "Status" },
  "workflow.col.step": { th: "ขั้นตอนปัจจุบัน", en: "Current Step" },
  "workflow.col.actions": { th: "จัดการ", en: "Actions" },
  "workflow.review": { th: "พิจารณาคำร้อง", en: "Review Petition" },

  // Types & Enums
  "workflow.type.THESIS_TOPIC_APPROVAL": { th: "ขออนุมัติหัวข้อและเค้าโครงวิทยานิพนธ์", en: "Thesis Topic & Proposal Approval" },
  "workflow.type.DEFENSE_EXAM_REQUEST": { th: "ขอสอบปากเปล่า/สอบจบวิทยานิพนธ์", en: "Final Defense Examination Request" },
  "workflow.type.LEAVE_OF_ABSENCE": { th: "ขอลาพักการศึกษา / รักษาสถานภาพ", en: "Leave of Absence / Status Retention" },
  "workflow.type.EXTENSION_OF_STUDY": { th: "ขอขยายเวลาการศึกษา", en: "Study Period Extension Request" },
  "workflow.type.GENERAL_PETITION": { th: "คำร้องทั่วไป / ขอหนังสือรับรอง", en: "General Academic Petition" },

  // Statuses
  "workflow.status.SUBMITTED": { th: "ยื่นคำร้องแล้ว (รออาจารย์ที่ปรึกษา)", en: "Submitted (Pending Advisor)" },
  "workflow.status.ADVISOR_APPROVED": { th: "อาจารย์เห็นชอบแล้ว (รอประธานหลักสูตร)", en: "Advisor Approved (Pending Chair)" },
  "workflow.status.CHAIR_APPROVED": { th: "ประธานหลักสูตรเห็นชอบแล้ว (รอบัณฑิตวิทยาลัย)", en: "Chair Approved (Pending Dean/Grad)" },
  "workflow.status.COMPLETED": { th: "อนุมัติเสร็จสมบูรณ์", en: "Completed & Approved" },
  "workflow.status.RETURNED": { th: "ส่งกลับให้นิสิตแก้ไข", en: "Returned for Revision" },
  "workflow.status.REJECTED": { th: "ปฏิเสธคำร้อง", en: "Rejected" },
  "workflow.status.CANCELLED": { th: "ยกเลิกคำร้อง", en: "Cancelled" },

  // Stepper 4 tiers
  "workflow.step.1": { th: "1. ยื่นคำร้อง", en: "1. Submission" },
  "workflow.step.2": { th: "2. อาจารย์ที่ปรึกษา", en: "2. Advisor Review" },
  "workflow.step.3": { th: "3. ประธานหลักสูตร", en: "3. Program Chair" },
  "workflow.step.4": { th: "4. บัณฑิตวิทยาลัย/คณบดี", en: "4. Dean / Graduate School" },

  // Review Dialog & Actions
  "workflow.reviewDialogTitle": { th: "พิจารณาคำร้องวิชาการ", en: "Review Academic Petition" },
  "workflow.reviewDialogDesc": {
    th: "ตรวจสอบเอกสารหลักฐาน ประวัติการพิจารณา และระบุผลการตัดสินใจ",
    en: "Review petition details, documents, history and submit review decision",
  },
  "workflow.petitionDetails": { th: "รายละเอียดคำร้อง", en: "Petition Details" },
  "workflow.studentInfo": { th: "ข้อมูลผู้ยื่นคำร้อง", en: "Student Information" },
  "workflow.studentId": { th: "รหัสนิสิต", en: "Student ID" },
  "workflow.studentName": { th: "ชื่อ-นามสกุล", en: "Full Name" },
  "workflow.studentEmail": { th: "อีเมล", en: "Email" },
  "workflow.studentPhone": { th: "เบอร์โทรศัพท์", en: "Phone Number" },
  "workflow.program": { th: "หลักสูตร", en: "Academic Program" },
  "workflow.selectProgram": { th: "-- เลือกหลักสูตร --", en: "-- Select Program --" },
  "workflow.advisor": { th: "อาจารย์ที่ปรึกษา", en: "Advisor" },
  "workflow.selectAdvisor": { th: "-- เลือกอาจารย์ที่ปรึกษา --", en: "-- Select Advisor --" },
  "workflow.selectType": { th: "-- เลือกประเภทคำร้อง --", en: "-- Select Petition Type --" },
  "workflow.thesisTitleTh": { th: "ชื่อหัวข้อวิทยานิพนธ์ (ภาษาไทย)", en: "Thesis Title (Thai)" },
  "workflow.thesisTitleEn": { th: "ชื่อหัวข้อวิทยานิพนธ์ (ภาษาอังกฤษ)", en: "Thesis Title (English)" },
  "workflow.attachment": { th: "เอกสารแนบประกอบคำร้อง", en: "Attachment URL" },
  "workflow.viewAttachment": { th: "เปิดดูเอกสารแนบ", en: "Open Attachment" },
  "workflow.noAttachment": { th: "ไม่มีเอกสารแนบ", en: "No attachment provided" },
  "workflow.descriptionLabel": { th: "รายละเอียดและเหตุผลความจำเป็น", en: "Description & Justification" },
  "workflow.actionHistory": { th: "ประวัติการดำเนินการ (Audit Timeline)", en: "Audit Activity Trail" },
  "workflow.noHistory": { th: "ยังไม่มีประวัติการดำเนินการ", en: "No activity history yet" },
  "workflow.reviewAction": { th: "ผลการพิจารณา", en: "Review Decision" },
  "workflow.action.approve": { th: "อนุมัติ / ให้ความเห็นชอบ", en: "Approve / Endorse" },
  "workflow.action.return": { th: "ส่งกลับให้นิสิตแก้ไข", en: "Return for Revision" },
  "workflow.action.reject": { th: "ปฏิเสธคำร้อง", en: "Reject Petition" },
  "workflow.comment": { th: "ความคิดเห็น / ข้อเสนอแนะ", en: "Comments & Feedback" },
  "workflow.commentPlaceholder": {
    th: "ระบุข้อคิดเห็นหรือคำแนะนำเพิ่มเติมสำหรับผู้ยื่นคำร้อง...",
    en: "Enter feedback, notes, or instructions for the student...",
  },
  "workflow.reviewerName": { th: "ชื่อผู้พิจารณา", en: "Reviewer Name" },
  "workflow.reviewerRole": { th: "ตำแหน่งผู้พิจารณา", en: "Reviewer Role" },
  "workflow.submitAction": { th: "บันทึกผลการพิจารณา", en: "Submit Decision" },
  "workflow.cancel": { th: "ปิดหน้าต่าง", en: "Close" },

  // Public Portal
  "workflow.portal.submitHeading": { th: "แบบฟอร์มยื่นคำร้องทางวิชาการออนไลน์", en: "Online Academic Petition Form" },
  "workflow.portal.submitDesc": {
    th: "กรอกข้อมูลรายละเอียดคำร้องให้ครบถ้วนเพื่อส่งให้อาจารย์ที่ปรึกษาและหลักสูตรพิจารณา",
    en: "Fill in the required details to submit your petition for academic approval",
  },
  "workflow.portal.trackHeading": { th: "ติดตามสถานะคำร้องและวิทยานิพนธ์", en: "Track Petition & Thesis Progress" },
  "workflow.portal.trackDesc": {
    th: "กรอกรหัสคำร้อง (Tracking Number) หรือรหัสนิสิต เพื่อตรวจสอบสถานะปัจจุบันแบบเรียลไทม์",
    en: "Enter your tracking number or student ID to check real-time progress",
  },
  "workflow.portal.trackPlaceholder": { th: "เช่น REQ-2026-0001 หรือ 65010001", en: "e.g. REQ-2026-0001 or 65010001" },
  "workflow.portal.trackButton": { th: "ค้นหาคำร้อง", en: "Track Status" },
  "workflow.portal.trackingSuccess": { th: "ยื่นคำร้องสำเร็จแล้ว!", en: "Petition Submitted Successfully!" },
  "workflow.portal.trackingSuccessDesc": {
    th: "ระบบได้สร้างหมายเลขติดตามคำร้องของท่านเรียบร้อยแล้ว โปรดบันทึกรหัสนี้เพื่อใช้ติดตามสถานะ",
    en: "Your tracking number has been generated. Please keep this number to monitor your petition status.",
  },
  "workflow.portal.yourTrackingNo": { th: "หมายเลขคำร้องของคุณคือ", en: "Your Tracking Number is" },
  "workflow.portal.copyTrackingNo": { th: "คัดลอกรหัสคำร้อง", en: "Copy Tracking Number" },
  "workflow.portal.copied": { th: "คัดลอกแล้ว", en: "Copied!" },
  "workflow.portal.trackNow": { th: "ไปที่หน้าติดตามสถานะทันที", en: "Track Status Now" },
  "workflow.portal.submitAnother": { th: "ยื่นคำร้องฉบับอื่น", en: "Submit Another Petition" },
  "workflow.portal.notFound": { th: "ไม่พบข้อมูลคำร้องตามที่ระบุ", en: "No petition found for the provided query" },
  "workflow.portal.notFoundDesc": {
    th: "กรุณาตรวจสอบความถูกต้องของรหัสคำร้อง (เช่น REQ-2026-0001) หรือรหัสนิสิตอีกครั้ง",
    en: "Please verify your tracking number (e.g. REQ-2026-0001) or student ID",
  },
  "workflow.portal.currentStatus": { th: "สถานะปัจจุบัน", en: "Current Status" },
  "workflow.portal.stepperTitle": { th: "ขั้นตอนกระบวนการพิจารณา", en: "Hierarchical Approval Path" },
  "workflow.portal.submitButton": { th: "ส่งคำร้องวิชาการ", en: "Submit Academic Petition" },
  "workflow.portal.submitting": { th: "กำลังส่งคำร้อง...", en: "Submitting Petition..." },
  "workflow.portal.tracking": { th: "กำลังค้นหา...", en: "Searching..." },
  "workflow.portal.searchResults": { th: "ผลการค้นหาคำร้อง", en: "Search Results" },

  // Notifications / Toasts
  "workflow.submittedSuccess": { th: "ยื่นคำร้องเรียบร้อยแล้ว", en: "Petition submitted successfully" },
  "workflow.actionSuccess": { th: "บันทึกผลการพิจารณาเรียบร้อยแล้ว", en: "Review decision recorded successfully" },
  "workflow.actionError": { th: "เกิดข้อผิดพลาดในการบันทึกผลการพิจารณา", en: "Failed to record review decision" },

  // Pre-requisites Verification
  "workflow.prereq.title": { th: "การตรวจสอบคุณสมบัติก่อนขอสอบจบวิทยานิพนธ์ (Pre-requisite Validation)", en: "Thesis Final Defense Pre-requisite Validation" },
  "workflow.prereq.degreeLevel": { th: "ระดับการศึกษา", en: "Degree Level" },
  "workflow.prereq.englishTest": { th: "การทดสอบภาษาอังกฤษมาตรฐาน", en: "Standard English Proficiency Test" },
  "workflow.prereq.englishScore": { th: "คะแนนที่ได้รับ", en: "Test Score Achieved" },
  "workflow.prereq.publication": { th: "ผลงานทางวิชาการที่ได้รับการเผยแพร่", en: "Academic Publication Status" },
  "workflow.prereq.passed": { th: "ผ่านเกณฑ์คุณสมบัติครบถ้วน", en: "All Prerequisites Passed" },
  "workflow.prereq.notPassed": { th: "ยังไม่ผ่านเกณฑ์คุณสมบัติ", en: "Prerequisites Incomplete" },


  // Role permissions UI
  "roles.module.workflow": { th: "ระบบคำร้องและกระบวนการอนุมัติเอกสารออนไลน์", en: "Document & Approval Workflow Module" },
  "perm.workflow:read": { th: "ดูรายการคำร้องและประวัติการพิจารณาในระบบหลังบ้าน", en: "View admin petitions and approval history" },
  "perm.workflow:manage": { th: "พิจารณาอนุมัติ ส่งกลับแก้ไข หรือปฏิเสธคำร้องวิชาการ", en: "Review, approve, return, or reject academic petitions" },
};
