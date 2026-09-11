# Technical Architecture & Flow
## Feature: ทำเนียบบุคลากรและอาจารย์ (Faculty & Staff Directory)

---

## 1. โครงสร้างโฟลเดอร์ (Folder Structure)

```
src/
├── features/
│   └── staff/
│       ├── index.ts               # Public DTO Types & Client-safe helpers
│       ├── server.ts              # Public Server queries สำหรับ Server Components
│       ├── actions.ts             # Server Actions (Create, Update, Delete, ToggleActive, Departments)
│       ├── permissions.ts         # ทะเบียนสิทธิ์ Permission Constants (staff:read, staff:manage)
│       ├── messages.ts            # พจนานุกรมข้อความสองภาษา (TH/EN)
│       └── _internal/             # โค้ดภายในโมดูล (Private)
│           ├── schemas/
│           │   └── staff.schema.ts      # Zod validation schemas
│           ├── repositories/
│           │   └── staff.repository.ts  # Prisma Data Access Queries
│           └── services/
│               ├── staff.service.ts      # Business logic หลัก & Database operations
│               ├── staff.service.test.ts # Unit tests (Vitest)
│               └── staff.service.int.test.ts # Integration tests
├── app/
│   ├── (admin)/
│   │   └── staff/
│   │       ├── page.tsx           # หน้าจัดการบุคลากรหลังบ้าน (Admin Console)
│   │       └── _components/       # Client components สำหรับหน้า Admin
│   │           ├── staff-client.tsx
│   │           ├── staff-dialog.tsx
│   │           └── department-dialog.tsx
│   └── portal/
│       └── staff/
│           ├── page.tsx           # หน้ารายชื่อคณาจารย์สาธารณะ (Public Directory)
│           └── [id]/
│               └── page.tsx       # หน้ารายละเอียดโปรไฟล์อาจารย์รายบุคคล (Academic Profile)
```

---

## 2. แผนผังความสัมพันธ์ของข้อมูล (Data Entity Relationships)

```mermaid
erDiagram
    Tenant ||--o{ Department : "has"
    Tenant ||--o{ StaffProfile : "has"
    Department ||--o{ StaffProfile : "contains"
    User ||--o| StaffProfile : "linked to"

    Department {
        string id PK
        string tenantId FK
        string code
        string nameTh
        string nameEn
        int displayOrder
        boolean isActive
    }

    StaffProfile {
        string id PK
        string tenantId FK
        string departmentId FK
        string userId FK
        enum staffType
        enum academicRank
        string prefixTh
        string firstNameTh
        string lastNameTh
        string prefixEn
        string firstNameEn
        string lastNameEn
        string positionTh
        string positionEn
        boolean isExecutive
        string executiveRole
        int executiveOrder
        string email
        string phone
        string officeRoom
        string officeHours
        string avatarUrl
        json education
        json expertise
        text researchInterests
        string googleScholarUrl
        string scopusUrl
        string orcidId
        string websiteUrl
        text bioTh
        text bioEn
        int displayOrder
        boolean isActive
    }
```

---

## 3. Data Flow ของระบบ

### 3.1 การเข้าชมผ่านหน้า Public Portal (`/portal/staff`)
```mermaid
sequenceDiagram
    autonumber
    actor User as ผู้เข้าชมเว็บ (Guest / นิสิต)
    participant Page as Portal Staff Page (Server Component)
    participant Server as staff/server.ts
    participant Service as staff.service.ts
    participant DB as MySQL Database (ums_dev)

    User->>Page: เปิดหน้า /portal/staff
    Page->>Server: getPublicDirectoryData()
    Server->>Service: getPublicStaffDirectory(tenantId, filters)
    Service->>DB: query departments & active staff profiles
    DB-->>Service: return profiles + departments
    Service-->>Server: return DTOs
    Server-->>Page: render Executive Board + Department Tabs + Search Grid
    Page-->>User: แสดงผลหน้าจอพร้อมแท็บค้นหาและตัวกรอง
```

### 3.2 การจัดการบุคลากรใน Admin Console (`/staff`)
```mermaid
sequenceDiagram
    autonumber
    actor Admin as เจ้าหน้าที่ฝ่ายบุคคล (Staff / Admin)
    participant Client as StaffClient (React 19)
    participant Action as staff/actions.ts (Server Action)
    participant Service as staff.service.ts
    participant Audit as AuditLog Service
    participant DB as MySQL Database

    Admin->>Client: กรอกข้อมูลและกดบันทึกโปรไฟล์
    Client->>Action: createStaffAction(payload)
    Action->>Action: requirePermission(session, "staff:manage")
    Action->>Service: createStaffProfile(tenantId, data, actorId)
    Service->>DB: INSERT into staff_profiles
    Service->>Audit: writeAudit(STAFF_CREATED)
    DB-->>Service: return created record
    Service-->>Action: return result
    Action-->>Client: ActionResult.success(data)
    Client-->>Admin: แสดง Toast สำเร็จและรีเฟรชตาราง
```
