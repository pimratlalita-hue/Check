# Database Schema & Data Modeling: Workflow Feature

---

## 1. ข้อมูลประเภทคำร้อง สถานะ และการกระทำ (Enums)

```prisma
enum PetitionType {
  THESIS_TOPIC_APPROVAL  // คำร้องขออนุมัติหัวข้อและเค้าโครงวิทยานิพนธ์
  DEFENSE_EXAM_REQUEST   // คำร้องขอสอบปากเปล่า/สอบจบวิทยานิพนธ์
  LEAVE_OF_ABSENCE       // คำร้องขอลาพักการศึกษา / รักษาสถานภาพ
  EXTENSION_OF_STUDY     // คำร้องขอขยายเวลาการศึกษา
  GENERAL_PETITION       // คำร้องทั่วไป / ขอหนังสือรับรอง
}

enum PetitionStatus {
  SUBMITTED         // ยื่นคำร้องแล้ว (รออาจารย์ที่ปรึกษาพิจารณา)
  ADVISOR_APPROVED  // อาจารย์ที่ปรึกษาเห็นชอบแล้ว (รอประธานหลักสูตร)
  CHAIR_APPROVED    // ประธานหลักสูตรเห็นชอบแล้ว (รอบัณฑิตวิทยาลัย/คณบดี)
  COMPLETED         // อนุมัติเสร็จสมบูรณ์
  RETURNED          // ส่งกลับให้นิสิตปรับปรุงแก้ไข
  REJECTED          // ปฏิเสธคำร้อง
  CANCELLED         // ยกเลิกคำร้อง
}

enum ApprovalAction {
  SUBMIT   // ยื่นคำร้อง
  APPROVE  // อนุมัติ / ให้ความเห็นชอบ
  RETURN   // ส่งกลับแก้ไข
  REJECT   // ปฏิเสธคำร้อง
  CANCEL   // ยกเลิก
}
```

---

## 2. โมเดลคำร้องวิชาการ (Petition Model)

```prisma
model Petition {
  id             String          @id @default(cuid())
  tenantId       String          @map("tenant_id")
  trackingNo     String          @map("tracking_no") @db.VarChar(50)
  type           PetitionType
  status         PetitionStatus  @default(SUBMITTED)
  title          String          @db.VarChar(255)
  description    String          @db.Text
  studentId      String          @map("student_id") @db.VarChar(50)
  studentName    String          @map("student_name") @db.VarChar(255)
  studentEmail   String          @map("student_email") @db.VarChar(255)
  studentPhone   String?         @map("student_phone") @db.VarChar(50)
  programId      String?         @map("program_id")
  advisorId      String?         @map("advisor_id")
  thesisTitleTh  String?         @map("thesis_title_th") @db.VarChar(500)
  thesisTitleEn  String?         @map("thesis_title_en") @db.VarChar(500)
  attachmentUrl  String?         @map("attachment_url") @db.VarChar(500)
  currentStep    Int             @default(1) @map("current_step") // 1: Advisor, 2: Chair, 3: Dean/Grad, 4: Completed
  createdAt      DateTime        @default(now()) @map("created_at")
  updatedAt      DateTime        @updatedAt @map("updated_at")

  tenant         Tenant          @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  program        Program?        @relation(fields: [programId], references: [id], onDelete: SetNull)
  advisor        StaffProfile?   @relation("AdvisedPetitions", fields: [advisorId], references: [id], onDelete: SetNull)
  activities     PetitionActivity[]

  @@unique([tenantId, trackingNo])
  @@index([tenantId, status])
  @@index([tenantId, studentId])
  @@index([tenantId, advisorId])
  @@map("petitions")
}
```

---

## 3. โมเดลประวัติการดำเนินการ (PetitionActivity Model)

```prisma
model PetitionActivity {
  id             String          @id @default(cuid())
  petitionId     String          @map("petition_id")
  actorName      String          @map("actor_name") @db.VarChar(255)
  actorRole      String          @map("actor_role") @db.VarChar(100)
  action         ApprovalAction
  previousStatus PetitionStatus? @map("previous_status")
  newStatus      PetitionStatus  @map("new_status")
  comment        String?         @db.Text
  createdAt      DateTime        @default(now()) @map("created_at")

  petition       Petition        @relation(fields: [petitionId], references: [id], onDelete: Cascade)

  @@index([petitionId, createdAt])
  @@map("petition_activities")
}
```
