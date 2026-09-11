import { describe, it, expect, vi } from "vitest";
import type { Db } from "@/shared/lib/infra/prisma";
import {
  createRoomSchema,
  createBookingSchema,
  checkRoomAvailabilitySchema,
  listRoomsQuerySchema,
  listBookingsQuerySchema,
} from "../schemas";
import {
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomById,
  listRooms,
  checkRoomAvailability,
  createBooking,
  updateBookingStatus,
  cancelBooking,
  listBookings,
  getFacilityStats,
} from "./facility.service";

describe("Facility Schemas Validation", () => {
  it("validate createRoomSchema สำเร็จเมื่อข้อมูลถูกต้อง", () => {
    const input = {
      code: "ROOM-501",
      nameTh: "ห้องสอบวิทยานิพนธ์ 1",
      nameEn: "Thesis Defense Room 1",
      building: "อาคารวิจัยและบัณฑิตศึกษา",
      floor: 5,
      capacity: 25,
      type: "EXAM_ROOM" as const,
      facilities: ["Projector", "Zoom Room", "Whiteboard"],
      imageUrl: "https://example.com/room-501.jpg",
      description: "ห้องสอบมาตรฐานความจุ 25 ที่นั่ง",
    };

    const parsed = createRoomSchema.parse(input);
    expect(parsed.code).toBe("ROOM-501");
    expect(parsed.nameTh).toBe("ห้องสอบวิทยานิพนธ์ 1");
    expect(parsed.capacity).toBe(25);
    expect(parsed.type).toBe("EXAM_ROOM");
    expect(parsed.facilities).toEqual(["Projector", "Zoom Room", "Whiteboard"]);
  });

  it("validate createRoomSchema ล้มเหลวเมื่อข้อมูลไม่ครบหรือ capacity < 1", () => {
    const input = {
      code: "",
      nameTh: "ห้องทดสอบ",
      nameEn: "Test Room",
      building: "ตึก 1",
      capacity: 0,
    };

    expect(() => createRoomSchema.parse(input)).toThrow();
  });

  it("validate createBookingSchema สำเร็จและ refine check ทำงานเมื่อเวลาถูกต้อง", () => {
    const now = new Date();
    const startTime = new Date(now.getTime() + 3600000);
    const endTime = new Date(now.getTime() + 7200000);

    const input = {
      roomId: "room-uuid-1",
      title: "สอบเค้าโครงวิทยานิพนธ์ นายสมชาย",
      purpose: "สอบวิทยานิพนธ์รอบบ่าย",
      type: "EXAM_DEFENSE" as const,
      platform: "HYBRID" as const,
      meetingUrl: "https://zoom.us/j/1234567890",
      startTime,
      endTime,
      bookedByName: "สมชาย ใจดี",
      bookedByEmail: "somchai@univ.ac.th",
      bookedByPhone: "0812345678",
      attendeeCount: 15,
    };

    const parsed = createBookingSchema.parse(input);
    expect(parsed.title).toBe("สอบเค้าโครงวิทยานิพนธ์ นายสมชาย");
    expect(parsed.platform).toBe("HYBRID");
  });

  it("validate createBookingSchema ล้มเหลวเมื่อ endTime <= startTime", () => {
    const now = new Date();
    const startTime = new Date(now.getTime() + 7200000);
    const endTime = new Date(now.getTime() + 3600000); // Earlier than start

    const input = {
      roomId: "room-uuid-1",
      title: "การประชุมวิชาการ",
      startTime,
      endTime,
      bookedByName: "อาจารย์ทดสอบ",
      bookedByEmail: "teacher@univ.ac.th",
    };

    expect(() => createBookingSchema.parse(input)).toThrow();
  });

  it("validate checkRoomAvailabilitySchema ผ่านเมื่อระบุ roomId และช่วงเวลา", () => {
    const now = new Date();
    const parsed = checkRoomAvailabilitySchema.parse({
      roomId: "room-123",
      startTime: now,
      endTime: new Date(now.getTime() + 3600000),
    });
    expect(parsed.roomId).toBe("room-123");
  });

  it("validate listRoomsQuerySchema และ listBookingsQuerySchema ให้ค่า default ถูกต้อง", () => {
    const roomQuery = listRoomsQuerySchema.parse({});
    expect(roomQuery.page).toBe(1);
    expect(roomQuery.perPage).toBe(50);

    const bookingQuery = listBookingsQuerySchema.parse({});
    expect(bookingQuery.page).toBe(1);
    expect(bookingQuery.perPage).toBe(50);
    expect(bookingQuery.tab).toBe("all");
  });
});

describe("Facility Room Management Service", () => {
  const tenantId = "tenant-test-123";

  it("createRoom: ปฏิเสธเมื่อรหัสห้องซ้ำ (duplicate code)", async () => {
    const mockDb = {
      facilityRoom: {
        findFirst: vi.fn().mockResolvedValue({ id: "existing-room", code: "R-101" }),
      },
    } as unknown as Db;

    await expect(
      createRoom(
        tenantId,
        {
          code: "R-101",
          nameTh: "ห้อง 101",
          nameEn: "Room 101",
          building: "วิศวะ",
          floor: 1,
          capacity: 20,
          type: "EXAM_ROOM",
          isActive: true,
        },
        mockDb
      )
    ).rejects.toThrow("รหัสห้องนี้มีอยู่ในระบบแล้ว");
  });

  it("createRoom: สร้างห้องสำเร็จเมื่อรหัสไม่ซ้ำ", async () => {
    const now = new Date();
    const mockDb = {
      facilityRoom: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({
          id: "room-created-id",
          tenantId,
          code: "R-101",
          nameTh: "ห้อง 101",
          nameEn: "Room 101",
          building: "วิศวะ",
          floor: 1,
          capacity: 20,
          type: "EXAM_ROOM",
          facilities: ["Projector"],
          imageUrl: null,
          description: "ห้องสอบ",
          isActive: true,
          displayOrder: 1,
          createdAt: now,
          updatedAt: now,
          _count: { bookings: 0 },
        }),
      },
    } as unknown as Db;

    const result = await createRoom(
      tenantId,
      {
        code: "R-101",
        nameTh: "ห้อง 101",
        nameEn: "Room 101",
        building: "วิศวะ",
        floor: 1,
        capacity: 20,
        type: "EXAM_ROOM",
        facilities: ["Projector"],
        isActive: true,
        displayOrder: 1,
      },
      mockDb
    );

    expect(result.id).toBe("room-created-id");
    expect(result.code).toBe("R-101");
    expect(result.facilities).toEqual(["Projector"]);
  });

  it("updateRoom: แจ้งข้อผิดพลาดเมื่อไม่พบห้อง", async () => {
    const mockDb = {
      facilityRoom: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    } as unknown as Db;

    await expect(
      updateRoom(tenantId, { id: "not-found", nameTh: "ชื่อใหม่" }, mockDb)
    ).rejects.toThrow("ไม่พบข้อมูลห้องที่ต้องการแก้ไข");
  });

  it("updateRoom: ตรวจสอบและปฏิเสธหากเปลี่ยนรหัสห้องไปซ้ำกับห้องอื่น", async () => {
    const mockDb = {
      facilityRoom: {
        findFirst: vi
          .fn()
          .mockResolvedValueOnce({ id: "room-1", code: "R-101" }) // existing room
          .mockResolvedValueOnce({ id: "room-2", code: "R-102" }), // duplicate code check
      },
    } as unknown as Db;

    await expect(
      updateRoom(tenantId, { id: "room-1", code: "R-102" }, mockDb)
    ).rejects.toThrow("รหัสห้องนี้มีอยู่ในระบบแล้ว");
  });

  it("deleteRoom: ลบห้องสำเร็จเมื่อมีห้องอยู่ในระบบ", async () => {
    const mockDb = {
      facilityRoom: {
        findFirst: vi.fn().mockResolvedValue({ id: "room-1" }),
        delete: vi.fn().mockResolvedValue({ id: "room-1" }),
      },
    } as unknown as Db;

    await expect(deleteRoom(tenantId, "room-1", mockDb)).resolves.not.toThrow();
  });

  it("getRoomById: คืนค่าห้องเมื่อพบ และคืนค่า null เมื่อไม่พบ", async () => {
    const now = new Date();
    const mockDb = {
      facilityRoom: {
        findFirst: vi.fn().mockImplementation(({ where }) => {
          if (where.id === "exists") {
            return Promise.resolve({
              id: "exists",
              tenantId,
              code: "R-1",
              nameTh: "ห้อง 1",
              nameEn: "Room 1",
              building: "อาคาร 1",
              floor: 1,
              capacity: 10,
              type: "EXAM_ROOM",
              facilities: ["TV"],
              imageUrl: null,
              description: null,
              isActive: true,
              displayOrder: 0,
              createdAt: now,
              updatedAt: now,
              _count: { bookings: 2 },
            });
          }
          return Promise.resolve(null);
        }),
      },
    } as unknown as Db;

    const found = await getRoomById(tenantId, "exists", mockDb);
    expect(found?.code).toBe("R-1");
    expect(found?.bookingCount).toBe(2);

    const notFound = await getRoomById(tenantId, "not-found", mockDb);
    expect(notFound).toBeNull();
  });

  it("listRooms: รองรับการค้นหาและแบ่งหน้า", async () => {
    const now = new Date();
    const mockDb = {
      facilityRoom: {
        count: vi.fn().mockResolvedValue(1),
        findMany: vi.fn().mockResolvedValue([
          {
            id: "room-1",
            tenantId,
            code: "R-101",
            nameTh: "ห้อง 101",
            nameEn: "Room 101",
            building: "วิศวะ",
            floor: 1,
            capacity: 20,
            type: "EXAM_ROOM",
            facilities: [],
            imageUrl: null,
            description: null,
            isActive: true,
            displayOrder: 0,
            createdAt: now,
            updatedAt: now,
            _count: { bookings: 1 },
          },
        ]),
      },
    } as unknown as Db;

    const res = await listRooms(tenantId, { search: "101", page: 1, perPage: 10 }, mockDb);
    expect(res.total).toBe(1);
    expect(res.items.length).toBe(1);
    expect(res.items[0].code).toBe("R-101");
  });
});

describe("Room Collision Detection Engine & Booking Service", () => {
  const tenantId = "tenant-test-123";
  const now = new Date();

  it("checkRoomAvailability: คืนค่า available = false เมื่อมีช่วงเวลาทับซ้อนกัน", async () => {
    const mockDb = {
      roomBooking: {
        findFirst: vi.fn().mockResolvedValue({
          id: "existing-booking-1",
          tenantId,
          roomId: "room-1",
          title: "การสอบที่จองไว้แล้ว",
          purpose: null,
          type: "EXAM_DEFENSE",
          platform: "ON_SITE",
          meetingUrl: null,
          startTime: new Date("2026-09-15T09:00:00Z"),
          endTime: new Date("2026-09-15T12:00:00Z"),
          status: "CONFIRMED",
          bookedByName: "อ.สมศักดิ์",
          bookedByEmail: "somsak@univ.ac.th",
          bookedByPhone: null,
          attendeeCount: 10,
          petitionId: null,
          createdAt: now,
          updatedAt: now,
          room: {
            code: "R-101",
            nameTh: "ห้องสอบ 101",
          },
        }),
      },
    } as unknown as Db;

    // New requested time: 10:00 - 11:00 (overlaps)
    const result = await checkRoomAvailability(
      tenantId,
      {
        roomId: "room-1",
        startTime: new Date("2026-09-15T10:00:00Z"),
        endTime: new Date("2026-09-15T11:00:00Z"),
      },
      mockDb
    );

    expect(result.available).toBe(false);
    expect(result.conflictingBooking?.title).toBe("การสอบที่จองไว้แล้ว");
  });

  it("checkRoomAvailability: คืนค่า available = true เมื่อไม่มีช่วงเวลาทับซ้อน", async () => {
    const mockDb = {
      roomBooking: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    } as unknown as Db;

    const result = await checkRoomAvailability(
      tenantId,
      {
        roomId: "room-1",
        startTime: new Date("2026-09-15T13:00:00Z"),
        endTime: new Date("2026-09-15T15:00:00Z"),
      },
      mockDb
    );

    expect(result.available).toBe(true);
    expect(result.conflictingBooking).toBeUndefined();
  });

  it("createBooking: ปฏิเสธการจองเมื่อห้องปิดปรับปรุง (isActive = false)", async () => {
    const mockDb = {
      facilityRoom: {
        findFirst: vi.fn().mockResolvedValue({
          id: "room-closed",
          isActive: false,
        }),
      },
    } as unknown as Db;

    await expect(
      createBooking(
        tenantId,
        {
          roomId: "room-closed",
          title: "ขอใช้ห้อง",
          type: "GENERAL",
          platform: "ON_SITE",
          startTime: new Date("2026-09-15T10:00:00Z"),
          endTime: new Date("2026-09-15T12:00:00Z"),
          bookedByName: "ผู้ขอ",
          bookedByEmail: "user@univ.ac.th",
        },
        mockDb
      )
    ).rejects.toThrow("ห้องนี้ปิดปรับปรุงหรือไม่พร้อมใช้งาน");
  });

  it("createBooking: ปฏิเสธการจองเมื่อเวลาชนกับรายการอื่น", async () => {
    const mockDb = {
      facilityRoom: {
        findFirst: vi.fn().mockResolvedValue({
          id: "room-1",
          isActive: true,
        }),
      },
      roomBooking: {
        findFirst: vi.fn().mockResolvedValue({
          id: "existing-booking",
          title: "รายการชน",
          startTime: new Date("2026-09-15T09:00:00Z"),
          endTime: new Date("2026-09-15T12:00:00Z"),
          status: "CONFIRMED",
          createdAt: now,
          updatedAt: now,
        }),
      },
    } as unknown as Db;

    await expect(
      createBooking(
        tenantId,
        {
          roomId: "room-1",
          title: "ขอใช้ห้องซ้อน",
          type: "EXAM_DEFENSE",
          platform: "ON_SITE",
          startTime: new Date("2026-09-15T10:00:00Z"),
          endTime: new Date("2026-09-15T11:00:00Z"),
          bookedByName: "ผู้ขอ",
          bookedByEmail: "user@univ.ac.th",
        },
        mockDb
      )
    ).rejects.toThrow("ห้องนี้ถูกจองในช่วงเวลาดังกล่าวแล้ว");
  });

  it("createBooking: จองสำเร็จเมื่อห้องพร้อมและเวลาไม่ชน", async () => {
    const mockDb = {
      facilityRoom: {
        findFirst: vi.fn().mockResolvedValue({
          id: "room-1",
          isActive: true,
        }),
      },
      roomBooking: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({
          id: "booking-created-1",
          tenantId,
          roomId: "room-1",
          title: "สอบป้องกันวิทยานิพนธ์",
          purpose: "สอบจบ ป.โท",
          type: "EXAM_DEFENSE",
          platform: "HYBRID",
          meetingUrl: "https://meet.google.com/abc-defg-hij",
          startTime: new Date("2026-09-15T13:00:00Z"),
          endTime: new Date("2026-09-15T16:00:00Z"),
          status: "CONFIRMED",
          bookedByName: "นิสิตเก่งกาจ",
          bookedByEmail: "kengkard@univ.ac.th",
          bookedByPhone: "0891112233",
          attendeeCount: 12,
          petitionId: null,
          createdAt: now,
          updatedAt: now,
          room: {
            code: "R-501",
            nameTh: "ห้องสอบ 501",
          },
        }),
      },
    } as unknown as Db;

    const result = await createBooking(
      tenantId,
      {
        roomId: "room-1",
        title: "สอบป้องกันวิทยานิพนธ์",
        purpose: "สอบจบ ป.โท",
        type: "EXAM_DEFENSE",
        platform: "HYBRID",
        meetingUrl: "https://meet.google.com/abc-defg-hij",
        startTime: new Date("2026-09-15T13:00:00Z"),
        endTime: new Date("2026-09-15T16:00:00Z"),
        bookedByName: "นิสิตเก่งกาจ",
        bookedByEmail: "kengkard@univ.ac.th",
        bookedByPhone: "0891112233",
        attendeeCount: 12,
      },
      mockDb
    );

    expect(result.id).toBe("booking-created-1");
    expect(result.status).toBe("CONFIRMED");
    expect(result.meetingUrl).toBe("https://meet.google.com/abc-defg-hij");
  });

  it("updateBookingStatus และ cancelBooking: อัปเดตสถานะสำเร็จ", async () => {
    const mockDb = {
      roomBooking: {
        findFirst: vi.fn().mockResolvedValue({ id: "booking-1" }),
        update: vi.fn().mockImplementation(({ data }) =>
          Promise.resolve({
            id: "booking-1",
            tenantId,
            roomId: "room-1",
            title: "การสอบ",
            type: "EXAM_DEFENSE",
            platform: "ON_SITE",
            startTime: now,
            endTime: now,
            status: data.status,
            bookedByName: "ผู้จอง",
            bookedByEmail: "booker@univ.ac.th",
            createdAt: now,
            updatedAt: now,
          })
        ),
      },
    } as unknown as Db;

    const updated = await updateBookingStatus(tenantId, { bookingId: "booking-1", status: "CONFIRMED" }, mockDb);
    expect(updated.status).toBe("CONFIRMED");

    const cancelled = await cancelBooking(tenantId, "booking-1", mockDb);
    expect(cancelled.status).toBe("CANCELLED");
  });

  it("listBookings: รองรับการกรองตามเงื่อนไข", async () => {
    const mockDb = {
      roomBooking: {
        count: vi.fn().mockResolvedValue(1),
        findMany: vi.fn().mockResolvedValue([
          {
            id: "booking-1",
            tenantId,
            roomId: "room-1",
            title: "การสอบเค้าโครง",
            type: "EXAM_DEFENSE",
            platform: "ON_SITE",
            startTime: now,
            endTime: now,
            status: "CONFIRMED",
            bookedByName: "ผู้จอง 1",
            bookedByEmail: "b1@univ.ac.th",
            createdAt: now,
            updatedAt: now,
            room: { code: "R-1" },
          },
        ]),
      },
    } as unknown as Db;

    const res = await listBookings(tenantId, { tab: "confirmed", page: 1, perPage: 10 }, mockDb);
    expect(res.total).toBe(1);
    expect(res.items[0].title).toBe("การสอบเค้าโครง");
  });

  it("getFacilityStats: คืนค่าสถิติภาพรวมถูกต้อง", async () => {
    const mockDb = {
      facilityRoom: {
        count: vi.fn().mockResolvedValue(8),
      },
      roomBooking: {
        count: vi
          .fn()
          .mockResolvedValueOnce(3) // todayBookings
          .mockResolvedValueOnce(5) // examSessions
          .mockResolvedValueOnce(1), // pendingApproval
      },
    } as unknown as Db;

    const stats = await getFacilityStats(tenantId, mockDb);
    expect(stats.totalRooms).toBe(8);
    expect(stats.todayBookings).toBe(3);
    expect(stats.examSessions).toBe(5);
    expect(stats.pendingApproval).toBe(1);
  });
});
