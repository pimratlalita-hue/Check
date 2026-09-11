import { describe, it, expect } from "vitest";
import { prisma } from "@/shared/lib/infra/prisma";
import { seedCore } from "../../../../../prisma/lib/seed-core";
import {
  createRoom,
  listRooms,
  checkRoomAvailability,
  createBooking,
  cancelBooking,
  getFacilityStats,
  listPublicRooms,
  getPublicRoomSchedule,
} from "./facility.service";

describe("facility.service (integration)", () => {
  it("สามารถจัดการห้อง, ตรวจจับการจองชนกัน (Collision Detection Engine), และอัปเดตสถานะบน DB จริงได้", async () => {
    const core = await seedCore(prisma, {
      tenantCode: "FAC_INT",
      nameTh: "คณะทดสอบระบบสิ่งอำนวยความสะดวก",
      nameEn: "Test Facility Faculty",
    });

    // 1. Create Rooms
    const room1 = await createRoom(core.tenantId, {
      code: "R-501",
      nameTh: "ห้องสอบวิทยานิพนธ์ 501",
      nameEn: "Thesis Defense Room 501",
      building: "อาคารวิจัยและบัณฑิตศึกษา",
      floor: 5,
      capacity: 25,
      type: "EXAM_ROOM",
      facilities: ["Zoom Room", "Dual Projectors", "Smart Board"],
      imageUrl: "https://example.com/r501.jpg",
      description: "ห้องสอบมาตรฐานพร้อมระบบ Hybrid Exam",
      isActive: true,
      displayOrder: 1,
    });

    expect(room1.id).toBeDefined();
    expect(room1.code).toBe("R-501");
    expect(room1.facilities).toContain("Zoom Room");

    const room2 = await createRoom(core.tenantId, {
      code: "LAB-302",
      nameTh: "ห้องปฏิบัติการ AI & Data Science",
      nameEn: "AI & Data Science Lab",
      building: "อาคารวิศวกรรมสารสนเทศ",
      floor: 3,
      capacity: 40,
      type: "LAB",
      facilities: ["GPU Workstations", "Smart Projector"],
      isActive: true,
      displayOrder: 2,
    });

    expect(room2.id).toBeDefined();

    // 2. Room Listing & Search
    const listResult = await listRooms(core.tenantId, { search: "501" });
    expect(listResult.total).toBe(1);
    expect(listResult.items[0].code).toBe("R-501");

    // 3. Interval Collision Engine: Create Booking 1
    const booking1Date = new Date("2026-10-15T09:00:00Z");
    const booking1End = new Date("2026-10-15T12:00:00Z");

    const booking1 = await createBooking(core.tenantId, {
      roomId: room1.id,
      title: "สอบเค้าโครงวิทยานิพนธ์ นายสมศักดิ์",
      purpose: "สอบเค้าโครงรอบเช้า",
      type: "EXAM_DEFENSE",
      platform: "HYBRID",
      meetingUrl: "https://zoom.us/j/9876543210",
      startTime: booking1Date,
      endTime: booking1End,
      bookedByName: "สมศักดิ์ ขยันยิ่ง",
      bookedByEmail: "somsak@univ.ac.th",
      bookedByPhone: "081-999-8877",
      attendeeCount: 15,
    });

    expect(booking1.id).toBeDefined();
    expect(booking1.status).toBe("CONFIRMED");
    expect(booking1.meetingUrl).toBe("https://zoom.us/j/9876543210");

    // 4. Collision Detection: Attempt overlapping time slot (10:00 - 11:30)
    const overlapStart = new Date("2026-10-15T10:00:00Z");
    const overlapEnd = new Date("2026-10-15T11:30:00Z");

    const checkOverlap = await checkRoomAvailability(core.tenantId, {
      roomId: room1.id,
      startTime: overlapStart,
      endTime: overlapEnd,
    });

    expect(checkOverlap.available).toBe(false);
    expect(checkOverlap.conflictingBooking?.id).toBe(booking1.id);

    // Creating overlapping booking should throw conflict error
    await expect(
      createBooking(core.tenantId, {
        roomId: room1.id,
        title: "จองเวลาทับซ้อน",
        type: "ACADEMIC_MEETING",
        platform: "ON_SITE",
        startTime: overlapStart,
        endTime: overlapEnd,
        bookedByName: "ผู้จองซ้อน",
        bookedByEmail: "conflict@univ.ac.th",
      })
    ).rejects.toThrow("ห้องนี้ถูกจองในช่วงเวลาดังกล่าวแล้ว");

    // 5. Non-overlapping time slot (13:00 - 16:00) should succeed
    const nonOverlapStart = new Date("2026-10-15T13:00:00Z");
    const nonOverlapEnd = new Date("2026-10-15T16:00:00Z");

    const checkFree = await checkRoomAvailability(core.tenantId, {
      roomId: room1.id,
      startTime: nonOverlapStart,
      endTime: nonOverlapEnd,
    });

    expect(checkFree.available).toBe(true);

    const booking2 = await createBooking(core.tenantId, {
      roomId: room1.id,
      title: "สอบป้องกันวิทยานิพนธ์ น.ส.วิไลพร",
      purpose: "สอบป้องกันวิทยานิพนธ์ระดับปริญญาเอก",
      type: "EXAM_DEFENSE",
      platform: "ON_SITE",
      startTime: nonOverlapStart,
      endTime: nonOverlapEnd,
      bookedByName: "วิไลพร มั่นคง",
      bookedByEmail: "wilaiporn@univ.ac.th",
      attendeeCount: 12,
    });

    expect(booking2.id).toBeDefined();

    // 6. Cancellation Releases the Slot
    // Cancel booking 1
    const cancelled = await cancelBooking(core.tenantId, booking1.id);
    expect(cancelled.status).toBe("CANCELLED");

    // After cancellation, 09:00 - 12:00 slot is available again!
    const recheckSlot = await checkRoomAvailability(core.tenantId, {
      roomId: room1.id,
      startTime: booking1Date,
      endTime: booking1End,
    });
    expect(recheckSlot.available).toBe(true);

    // 7. Stats & Public Portal Verification
    const stats = await getFacilityStats(core.tenantId);
    expect(stats.totalRooms).toBe(2);
    expect(stats.examSessions).toBe(1); // booking2 is CONFIRMED EXAM_DEFENSE, booking1 is CANCELLED

    const publicRooms = await listPublicRooms(core.tenantId);
    expect(publicRooms.length).toBe(2);

    const schedule = await getPublicRoomSchedule(
      core.tenantId,
      room1.id,
      new Date("2026-10-15T00:00:00Z")
    );
    // Only CONFIRMED or PENDING bookings appear in schedule
    expect(schedule.length).toBe(1);
    expect(schedule[0].id).toBe(booking2.id);
  });
});
