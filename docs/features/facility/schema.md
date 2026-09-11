# Database Schema & Data Modeling: Facility Feature

---

## 1. ข้อมูลประเภทห้องและรูปแบบการจอง (Enums)

```prisma
enum RoomType {
  EXAM_ROOM        // ห้องสอบวิทยานิพนธ์ / สอบปากเปล่า
  MEETING_ROOM     // ห้องประชุมคณะกรรมการ / คณะทำงาน
  LAB              // ห้องปฏิบัติการคอมพิวเตอร์และปัญญาประดิษฐ์
  AUDITORIUM       // ห้องประชุมใหญ่ / หอประชุมคณะ
  SMART_CLASSROOM  // ห้องเรียนและสัมมนาอัจฉริยะ
}

enum BookingType {
  EXAM_DEFENSE       // สอบป้องกันวิทยานิพนธ์ / สอบเค้าโครง
  ACADEMIC_MEETING   // ประชุมวิชาการ / ประชุมหลักสูตร
  SEMINAR            // สัมมนา / บรรยายพิเศษ
  TEACHING           // การเรียนการสอน
  GENERAL            // ใช้งานทั่วไป
}

enum BookingStatus {
  CONFIRMED  // อนุมัติ / ยืนยันการจองแล้ว
  PENDING    // รอเจ้าหน้าที่ตรวจสอบอนุมัติ
  CANCELLED  // ยกเลิกการจอง
  REJECTED   // ปฏิเสธการจอง
}

enum MeetingPlatform {
  ON_SITE      // การใช้งานในสถานที่จริง
  ZOOM         // Zoom Meetings
  MS_TEAMS     // Microsoft Teams
  GOOGLE_MEET  // Google Meet
  HYBRID       // ผสมผสาน On-site และ Online
}
```

---

## 2. โมเดลห้องและสิ่งอำนวยความสะดวก (FacilityRoom Model)

```prisma
model FacilityRoom {
  id           String       @id @default(uuid()) @db.VarChar(36)
  tenantId     String       @map("tenant_id") @db.VarChar(36)
  code         String       @db.VarChar(50)       // e.g. "IF-401", "SC-205"
  nameTh       String       @map("name_th") @db.VarChar(255)
  nameEn       String       @map("name_en") @db.VarChar(255)
  building     String       @db.VarChar(100)      // e.g. "อาคารนวัตกรรมและเทคโนโลยี (IF)"
  floor        Int          @default(1)
  capacity     Int          @default(10)
  type         RoomType     @default(EXAM_ROOM)
  facilities   Json?        // List of amenities e.g. ["Projector", "Smart TV", "Microphone", "Video Conference"]
  imageUrl     String?      @map("image_url") @db.VarChar(500)
  description  String?      @db.Text
  isActive     Boolean      @default(true) @map("is_active")
  displayOrder Int          @default(0) @map("display_order")
  createdAt    DateTime     @default(now()) @map("created_at")
  updatedAt    DateTime     @updatedAt @map("updated_at")

  tenant       Tenant       @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  bookings     RoomBooking[]

  @@unique([tenantId, code])
  @@index([tenantId, type, isActive])
  @@map("facility_rooms")
}
```

---

## 3. โมเดลการจองห้อง (RoomBooking Model)

```prisma
model RoomBooking {
  id            String          @id @default(uuid()) @db.VarChar(36)
  tenantId      String          @map("tenant_id") @db.VarChar(36)
  roomId        String          @map("room_id") @db.VarChar(36)
  title         String          @db.VarChar(255)
  purpose       String?         @db.Text
  type          BookingType     @default(EXAM_DEFENSE)
  platform      MeetingPlatform @default(ON_SITE)
  meetingUrl    String?         @map("meeting_url") @db.VarChar(500)
  startTime     DateTime        @map("start_time")
  endTime       DateTime        @map("end_time")
  status        BookingStatus   @default(CONFIRMED)
  bookedByName  String          @map("booked_by_name") @db.VarChar(255)
  bookedByEmail String          @map("booked_by_email") @db.VarChar(255)
  bookedByPhone String?         @map("booked_by_phone") @db.VarChar(50)
  attendeeCount Int?            @map("attendee_count")
  petitionId    String?         @map("petition_id") @db.VarChar(36)
  createdAt     DateTime        @default(now()) @map("created_at")
  updatedAt     DateTime        @updatedAt @map("updated_at")

  tenant        Tenant          @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  room          FacilityRoom    @relation(fields: [roomId], references: [id], onDelete: Cascade)
  petition      Petition?       @relation(fields: [petitionId], references: [id], onDelete: SetNull)

  @@index([tenantId, roomId, startTime, endTime])
  @@index([tenantId, status])
  @@map("room_bookings")
}
```
