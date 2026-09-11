# Database Schema & Data Modeling: Curriculum Feature

---

## 1. ข้อมูลระดับและประเภทหลักสูตร (Enums)

```prisma
enum DegreeLevel {
  BACHELOR     // ปริญญาตรี
  MASTER       // ปริญญาโท
  DOCTORAL     // ปริญญาเอก
  CERTIFICATE  // ประกาศนียบัตร / Non-degree
}

enum ProgramType {
  THAI           // หลักสูตรภาษาไทย
  INTERNATIONAL  // หลักสูตรนานาชาติ
  BILINGUAL      // หลักสูตรสองภาษา
}

enum ProgramStatus {
  DRAFT
  ACTIVE
  REVISED
  ARCHIVED
}

enum CourseCategory {
  GENERAL_EDUCATION  // หมวดวิชาศึกษาทั่วไป
  CORE_COURSE        // หมวดวิชาแกน / บังคับ
  MAJOR_ELECTIVE     // หมวดวิชาเลือกเฉพาะสาขา
  FREE_ELECTIVE      // หมวดวิชาเลือกเสรี
  THESIS             // วิทยานิพนธ์ / สารนิพนธ์
}
```

---

## 2. โมเดลหลักสูตร (Program Model)

```prisma
model Program {
  id              String         @id @default(cuid())
  tenantId        String         @map("tenant_id")
  code            String         @db.VarChar(50)       // e.g. "CS-BS-2565"
  nameTh          String         @map("name_th") @db.VarChar(255)
  nameEn          String         @map("name_en") @db.VarChar(255)
  degreeTh        String         @map("degree_th") @db.VarChar(255)  // เช่น "วิทยาศาสตรบัณฑิต (วิทยาการคอมพิวเตอร์)"
  degreeEn        String         @map("degree_en") @db.VarChar(255)  // เช่น "Bachelor of Science (Computer Science)"
  degreeShortTh   String         @map("degree_short_th") @db.VarChar(100) // เช่น "วท.บ. (วิทยาการคอมพิวเตอร์)"
  degreeShortEn   String         @map("degree_short_en") @db.VarChar(100) // เช่น "B.Sc. (Computer Science)"
  level           DegreeLevel    @default(BACHELOR)
  type            ProgramType    @default(THAI)
  status          ProgramStatus  @default(ACTIVE)
  slug            String         @db.VarChar(100)
  totalCredits    Int            @map("total_credits")
  studyDuration   String         @map("study_duration") @db.VarChar(100) // เช่น "4 ปี (8 ภาคการศึกษา)"
  tuitionFee      String?        @map("tuition_fee") @db.VarChar(255)   // เช่น "21,000 บาท / ภาคการศึกษา"
  descriptionTh   String?        @map("description_th") @db.Text
  descriptionEn   String?        @map("description_en") @db.Text
  philosophyTh    String?        @map("philosophy_th") @db.Text         // ปรัชญาของหลักสูตร
  philosophyEn    String?        @map("philosophy_en") @db.Text
  careerPaths     String?        @map("career_paths") @db.Text          // แนวทางประกอบอาชีพ (JSON array หรือ newline-separated)
  learningOutcomes String?       @map("learning_outcomes") @db.Text     // PLOs (JSON array หรือ text)
  handbookUrl     String?        @map("handbook_url") @db.VarChar(500)  // ลิงก์ดาวน์โหลด มคอ.2 PDF
  imageUrl        String?        @map("image_url") @db.VarChar(500)
  departmentId    String?        @map("department_id")
  displayOrder    Int            @default(0) @map("display_order")
  createdAt       DateTime       @default(now()) @map("created_at")
  updatedAt       DateTime       @updatedAt @map("updated_at")

  tenant          Tenant         @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  department      Department?    @relation(fields: [departmentId], references: [id], onDelete: SetNull)
  courses         ProgramCourse[]

  @@unique([tenantId, code])
  @@unique([tenantId, slug])
  @@index([tenantId, level, status])
  @@map("programs")
}
```

---

## 3. โมเดลรายวิชาในโครงสร้างหลักสูตร (ProgramCourse Model)

```prisma
model ProgramCourse {
  id           String         @id @default(cuid())
  programId    String         @map("program_id")
  code         String         @db.VarChar(20)      // e.g. "01418111"
  nameTh       String         @map("name_th") @db.VarChar(255)
  nameEn       String         @map("name_en") @db.VarChar(255)
  credits      Int            @default(3)
  creditHours  String?        @map("credit_hours") @db.VarChar(50) // e.g. "3(2-2-5)"
  category     CourseCategory @default(CORE_COURSE)
  semester     Int?           // แนะนำเรียนภาคการศึกษาที่ 1 หรือ 2
  year         Int?           // แนะนำเรียนชั้นปีที่ 1, 2, 3, หรือ 4
  descriptionTh String?       @map("description_th") @db.Text
  descriptionEn String?       @map("description_en") @db.Text
  prerequisite String?        @db.VarChar(255)
  displayOrder Int            @default(0) @map("display_order")
  createdAt    DateTime       @default(now()) @map("created_at")
  updatedAt    DateTime       @updatedAt @map("updated_at")

  program      Program        @relation(fields: [programId], references: [id], onDelete: Cascade)

  @@index([programId, category])
  @@map("program_courses")
}
```
