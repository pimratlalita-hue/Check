# Database Schema & Data Models
## Feature: ทำเนียบบุคลากรและอาจารย์ (Faculty & Staff Directory)

---

## 1. นิยาม Enums ใน Prisma Schema

```prisma
enum StaffType {
  ACADEMIC    // สายวิชาการ / อาจารย์ประจำ
  SUPPORT     // สายสนับสนุนวิชาการ / เจ้าหน้าที่
  EXECUTIVE   // ผู้บริหารคณะ
}

enum AcademicRank {
  PROFESSOR            // ศาสตราจารย์ (ศ.)
  ASSOCIATE_PROFESSOR  // รองศาสตราจารย์ (รศ.)
  ASSISTANT_PROFESSOR  // ผู้ช่วยศาสตราจารย์ (ผศ.)
  LECTURER             // อาจารย์ (อ.)
  NONE                 // ไม่มีตำแหน่งทางวิชาการ
}
```

---

## 2. โครงสร้างตาราง (Table Definitions)

### 2.1 ตาราง `departments` (ภาควิชา / สายงาน / ฝ่าย)
| ฟิลด์ (Field) | ชนิดข้อมูล (Data Type) | ข้อจำกัด (Constraints) | คำอธิบาย (Description) |
|---|---|---|---|
| `id` | `VARCHAR(36)` | PK, UUID | รหัสประจำรายการ |
| `tenant_id` | `VARCHAR(36)` | FK -> `tenants.id`, Cascade | รหัสองค์กร/คณะ |
| `code` | `VARCHAR(50)` | NOT NULL | รหัสภาควิชา เช่น `CPE`, `IT`, `DS` |
| `name_th` | `VARCHAR(255)` | NOT NULL | ชื่อภาษาไทย เช่น "ภาควิชาวิศวกรรมคอมพิวเตอร์" |
| `name_en` | `VARCHAR(255)` | NOT NULL | ชื่อภาษาอังกฤษ เช่น "Department of Computer Engineering" |
| `description_th` | `TEXT` | NULL | คำอธิบายภาควิชา (TH) |
| `description_en` | `TEXT` | NULL | คำอธิบายภาควิชา (EN) |
| `display_order` | `INT` | DEFAULT 0 | ลำดับการแสดงผล |
| `is_active` | `BOOLEAN` | DEFAULT TRUE | สถานะเปิดใช้งาน |
| `created_at` | `DATETIME` | DEFAULT NOW() | วันเวลาที่สร้าง |
| `updated_at` | `DATETIME` | ON UPDATE | วันเวลาที่แก้ไขล่าสุด |

**ดัชนี (Indexes):**
- `@@unique([tenant_id, code])`
- `@@index([tenant_id, is_active, display_order])`

---

### 2.2 ตาราง `staff_profiles` (ข้อมูลประวัติคณาจารย์และบุคลากร)
| ฟิลด์ (Field) | ชนิดข้อมูล (Data Type) | ข้อจำกัด (Constraints) | คำอธิบาย (Description) |
|---|---|---|---|
| `id` | `VARCHAR(36)` | PK, UUID | รหัสประจำรายการ |
| `tenant_id` | `VARCHAR(36)` | FK -> `tenants.id`, Cascade | รหัสองค์กร/คณะ |
| `department_id` | `VARCHAR(36)` | FK -> `departments.id`, SetNull | ภาควิชา/ฝ่ายที่สังกัด |
| `user_id` | `VARCHAR(36)` | FK -> `users.id`, SetNull | บัญชีผู้ใช้ในระบบ (ถ้ามี) |
| `staff_type` | `ENUM(StaffType)` | DEFAULT 'ACADEMIC' | ประเภทบุคลากร |
| `academic_rank` | `ENUM(AcademicRank)` | DEFAULT 'NONE' | ตำแหน่งทางวิชาการ |
| `prefix_th` | `VARCHAR(50)` | NULL | คำนำหน้านามภาษาไทย เช่น "ผศ.ดร.", "อ." |
| `prefix_en` | `VARCHAR(50)` | NULL | คำนำหน้านามภาษาอังกฤษ เช่น "Asst. Prof. Dr." |
| `first_name_th` | `VARCHAR(100)` | NOT NULL | ชื่อภาษาไทย |
| `last_name_th` | `VARCHAR(100)` | NOT NULL | นามสกุลภาษาไทย |
| `first_name_en` | `VARCHAR(100)` | NOT NULL | ชื่อภาษาอังกฤษ |
| `last_name_en` | `VARCHAR(100)` | NOT NULL | นามสกุลภาษาอังกฤษ |
| `position_th` | `VARCHAR(255)` | NOT NULL | ตำแหน่งงานภาษาไทย เช่น "คณบดี", "อาจารย์ประจำ" |
| `position_en` | `VARCHAR(255)` | NOT NULL | ตำแหน่งงานภาษาอังกฤษ เช่น "Dean", "Lecturer" |
| `is_executive` | `BOOLEAN` | DEFAULT FALSE | ธงระบุว่าเป็นผู้บริหารคณะ |
| `executive_role` | `VARCHAR(255)` | NULL | ตำแหน่งผู้บริหาร เช่น "คณบดี", "รองคณบดีฝ่ายวิชาการ" |
| `executive_order` | `INT` | NULL | ลำดับการจัดวางในทำเนียบผู้บริหาร |
| `email` | `VARCHAR(255)` | NOT NULL | อีเมลติดต่อ |
| `phone` | `VARCHAR(50)` | NULL | เบอร์โทรศัพท์ภายใน/ติดต่อ |
| `office_room` | `VARCHAR(100)` | NULL | ห้องทำงาน เช่น "อาคาร 1 ชั้น 3 ห้อง 301" |
| `office_hours` | `VARCHAR(255)` | NULL | เวลาให้คำปรึกษาแก่นักศึกษา |
| `avatar_url` | `VARCHAR(500)` | NULL | URL รูปถ่ายโปรไฟล์ |
| `education` | `JSON` | NULL | ประวัติการศึกษา (Array of degrees) |
| `expertise` | `JSON` | NULL | หัวข้อความเชี่ยวชาญ (Array of strings) |
| `research_interests`| `TEXT` | NULL | ข้อมูลความสนใจด้านการวิจัย |
| `google_scholar_url`| `VARCHAR(500)` | NULL | ลิงก์ Google Scholar Profile |
| `scopus_url` | `VARCHAR(500)` | NULL | ลิงก์ Scopus Profile |
| `orcid_id` | `VARCHAR(50)` | NULL | หมายเลข ORCID เช่น 0000-0002-1825-0097 |
| `website_url` | `VARCHAR(500)` | NULL | เว็บไซต์ส่วนตัว หรือห้องวิจัย |
| `bio_th` | `TEXT` | NULL | ประวัติและผลงานโดยย่อ (TH) |
| `bio_en` | `TEXT` | NULL | ประวัติและผลงานโดยย่อ (EN) |
| `display_order` | `INT` | DEFAULT 0 | ลำดับการแสดงผลทั่วไป |
| `is_active` | `BOOLEAN` | DEFAULT TRUE | สถานะเปิดแสดงผลในหน้าเว็บ |
| `created_at` | `DATETIME` | DEFAULT NOW() | วันเวลาที่สร้าง |
| `updated_at` | `DATETIME` | ON UPDATE | วันเวลาที่แก้ไขล่าสุด |

**ดัชนี (Indexes):**
- `@@index([tenant_id, staff_type, is_active])`
- `@@index([tenant_id, department_id])`
- `@@index([tenant_id, is_executive, executive_order])`
