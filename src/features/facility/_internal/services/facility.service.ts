import { prisma, type Db } from "@/shared/lib/infra/prisma";
import { errors } from "@/shared/lib/errors";
import { Prisma } from "@/generated/prisma";
import type {
  FacilityRoom,
  RoomBooking,
  RoomType,
  BookingType,
  BookingStatus,
  MeetingPlatform,
} from "@/generated/prisma";
import type {
  CreateRoomInput,
  UpdateRoomInput,
  ListRoomsQueryInput,
  CreateBookingInput,
  UpdateBookingStatusInput,
  ListBookingsQueryInput,
  CheckRoomAvailabilityInput,
} from "../schemas";

export interface FacilityRoomDto {
  id: string;
  tenantId: string;
  code: string;
  nameTh: string;
  nameEn: string;
  building: string;
  floor: number;
  capacity: number;
  type: RoomType;
  facilities: string[];
  imageUrl: string | null;
  description: string | null;
  isActive: boolean;
  displayOrder: number;
  bookingCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoomBookingDto {
  id: string;
  tenantId: string;
  roomId: string;
  roomCode?: string;
  roomNameTh?: string;
  roomNameEn?: string;
  building?: string;
  title: string;
  purpose: string | null;
  type: BookingType;
  platform: MeetingPlatform;
  meetingUrl: string | null;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  bookedByName: string;
  bookedByEmail: string;
  bookedByPhone: string | null;
  attendeeCount: number | null;
  petitionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FacilityStats {
  totalRooms: number;
  todayBookings: number;
  examSessions: number;
  pendingApproval: number;
}

export interface RoomListResult {
  items: FacilityRoomDto[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface BookingListResult {
  items: RoomBookingDto[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

function mapRoomToDto(
  room: FacilityRoom & {
    _count?: { bookings: number };
  }
): FacilityRoomDto {
  let parsedFacilities: string[] = [];
  if (Array.isArray(room.facilities)) {
    parsedFacilities = room.facilities as string[];
  } else if (typeof room.facilities === "string") {
    try {
      parsedFacilities = JSON.parse(room.facilities);
    } catch {
      parsedFacilities = [];
    }
  }

  return {
    id: room.id,
    tenantId: room.tenantId,
    code: room.code,
    nameTh: room.nameTh,
    nameEn: room.nameEn,
    building: room.building,
    floor: room.floor,
    capacity: room.capacity,
    type: room.type,
    facilities: parsedFacilities,
    imageUrl: room.imageUrl,
    description: room.description,
    isActive: room.isActive,
    displayOrder: room.displayOrder,
    bookingCount: room._count?.bookings ?? 0,
    createdAt: room.createdAt.toISOString(),
    updatedAt: room.updatedAt.toISOString(),
  };
}

function mapBookingToDto(
  booking: RoomBooking & {
    room?: FacilityRoom | null;
  }
): RoomBookingDto {
  return {
    id: booking.id,
    tenantId: booking.tenantId,
    roomId: booking.roomId,
    roomCode: booking.room?.code,
    roomNameTh: booking.room?.nameTh,
    roomNameEn: booking.room?.nameEn,
    building: booking.room?.building,
    title: booking.title,
    purpose: booking.purpose,
    type: booking.type,
    platform: booking.platform,
    meetingUrl: booking.meetingUrl,
    startTime: booking.startTime.toISOString(),
    endTime: booking.endTime.toISOString(),
    status: booking.status,
    bookedByName: booking.bookedByName,
    bookedByEmail: booking.bookedByEmail,
    bookedByPhone: booking.bookedByPhone,
    attendeeCount: booking.attendeeCount,
    petitionId: booking.petitionId,
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
  };
}

// -----------------------------------------------------------------------------
// Room Management
// -----------------------------------------------------------------------------

export async function createRoom(
  tenantId: string,
  input: CreateRoomInput,
  db: Db = prisma
): Promise<FacilityRoomDto> {
  const existing = await db.facilityRoom.findFirst({
    where: { tenantId, code: input.code },
  });
  if (existing) {
    throw errors.conflict("รหัสห้องนี้มีอยู่ในระบบแล้ว");
  }

  const created = await db.facilityRoom.create({
    data: {
      tenantId,
      code: input.code,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      building: input.building,
      floor: input.floor,
      capacity: input.capacity,
      type: input.type,
      facilities: input.facilities ? (input.facilities as Prisma.InputJsonValue) : Prisma.JsonNull,
      imageUrl: input.imageUrl,
      description: input.description,
      isActive: input.isActive,
      displayOrder: input.displayOrder ?? 0,
    },
    include: {
      _count: { select: { bookings: true } },
    },
  });

  return mapRoomToDto(created);
}

export async function updateRoom(
  tenantId: string,
  input: UpdateRoomInput,
  db: Db = prisma
): Promise<FacilityRoomDto> {
  const room = await db.facilityRoom.findFirst({
    where: { id: input.id, tenantId },
  });
  if (!room) {
    throw errors.not_found("ไม่พบข้อมูลห้องที่ต้องการแก้ไข");
  }

  if (input.code && input.code !== room.code) {
    const duplicate = await db.facilityRoom.findFirst({
      where: { tenantId, code: input.code, id: { not: input.id } },
    });
    if (duplicate) {
      throw errors.conflict("รหัสห้องนี้มีอยู่ในระบบแล้ว");
    }
  }

  const updated = await db.facilityRoom.update({
    where: { id: input.id },
    data: {
      code: input.code,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      building: input.building,
      floor: input.floor,
      capacity: input.capacity,
      type: input.type,
      facilities: input.facilities !== undefined
        ? (input.facilities ? (input.facilities as Prisma.InputJsonValue) : Prisma.JsonNull)
        : undefined,
      imageUrl: input.imageUrl,
      description: input.description,
      isActive: input.isActive,
      displayOrder: input.displayOrder,
    },
    include: {
      _count: { select: { bookings: true } },
    },
  });

  return mapRoomToDto(updated);
}

export async function deleteRoom(
  tenantId: string,
  id: string,
  db: Db = prisma
): Promise<void> {
  const room = await db.facilityRoom.findFirst({
    where: { id, tenantId },
  });
  if (!room) {
    throw errors.not_found("ไม่พบข้อมูลห้องที่ต้องการลบ");
  }

  await db.facilityRoom.delete({ where: { id } });
}

export async function getRoomById(
  tenantId: string,
  id: string,
  db: Db = prisma
): Promise<FacilityRoomDto | null> {
  const room = await db.facilityRoom.findFirst({
    where: { id, tenantId },
    include: {
      _count: { select: { bookings: true } },
    },
  });
  if (!room) return null;
  return mapRoomToDto(room);
}

export async function listRooms(
  tenantId: string,
  query: Partial<ListRoomsQueryInput> = {},
  db: Db = prisma
): Promise<RoomListResult> {
  const page = query.page ?? 1;
  const perPage = query.perPage ?? 50;
  const skip = (page - 1) * perPage;

  const where: Prisma.FacilityRoomWhereInput = { tenantId };

  if (query.type) {
    where.type = query.type;
  }

  if (query.isActive !== undefined) {
    where.isActive = query.isActive;
  }

  if (query.search) {
    const s = query.search.trim();
    where.OR = [
      { code: { contains: s } },
      { nameTh: { contains: s } },
      { nameEn: { contains: s } },
      { building: { contains: s } },
    ];
  }

  const [total, items] = await Promise.all([
    db.facilityRoom.count({ where }),
    db.facilityRoom.findMany({
      where,
      skip,
      take: perPage,
      orderBy: [{ displayOrder: "asc" }, { code: "asc" }],
      include: {
        _count: { select: { bookings: true } },
      },
    }),
  ]);

  return {
    items: items.map(mapRoomToDto),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage) || 1,
  };
}

// -----------------------------------------------------------------------------
// Room Collision Engine & Bookings
// -----------------------------------------------------------------------------

/**
 * Check if a room is available during the specified interval
 * Formula: Existing.startTime < New.endTime AND Existing.endTime > New.startTime
 */
export async function checkRoomAvailability(
  tenantId: string,
  input: CheckRoomAvailabilityInput,
  db: Db = prisma
): Promise<{ available: boolean; conflictingBooking?: RoomBookingDto }> {
  const conflict = await db.roomBooking.findFirst({
    where: {
      tenantId,
      roomId: input.roomId,
      status: { in: ["CONFIRMED", "PENDING"] },
      id: input.excludeBookingId ? { not: input.excludeBookingId } : undefined,
      startTime: { lt: input.endTime },
      endTime: { gt: input.startTime },
    },
    include: { room: true },
  });

  if (conflict) {
    return {
      available: false,
      conflictingBooking: mapBookingToDto(conflict),
    };
  }

  return { available: true };
}

export async function createBooking(
  tenantId: string,
  input: CreateBookingInput,
  db: Db = prisma
): Promise<RoomBookingDto> {
  const room = await db.facilityRoom.findFirst({
    where: { id: input.roomId, tenantId },
  });
  if (!room) {
    throw errors.not_found("ไม่พบห้องที่ต้องการจอง");
  }
  if (!room.isActive) {
    throw errors.validation("ห้องนี้ปิดปรับปรุงหรือไม่พร้อมใช้งาน");
  }

  // Interval Overlap Collision Check
  const availability = await checkRoomAvailability(
    tenantId,
    {
      roomId: input.roomId,
      startTime: input.startTime,
      endTime: input.endTime,
    },
    db
  );

  if (!availability.available) {
    throw errors.conflict("ห้องนี้ถูกจองในช่วงเวลาดังกล่าวแล้ว กรุณาเลือกช่วงเวลาอื่น");
  }

  const created = await db.roomBooking.create({
    data: {
      tenantId,
      roomId: input.roomId,
      title: input.title,
      purpose: input.purpose,
      type: input.type,
      platform: input.platform,
      meetingUrl: input.meetingUrl,
      startTime: input.startTime,
      endTime: input.endTime,
      status: "CONFIRMED",
      bookedByName: input.bookedByName,
      bookedByEmail: input.bookedByEmail,
      bookedByPhone: input.bookedByPhone,
      attendeeCount: input.attendeeCount,
      petitionId: input.petitionId || null,
    },
    include: { room: true },
  });

  return mapBookingToDto(created);
}

export async function updateBookingStatus(
  tenantId: string,
  input: UpdateBookingStatusInput,
  db: Db = prisma
): Promise<RoomBookingDto> {
  const booking = await db.roomBooking.findFirst({
    where: { id: input.bookingId, tenantId },
  });
  if (!booking) {
    throw errors.not_found("ไม่พบข้อมูลการจอง");
  }

  const updated = await db.roomBooking.update({
    where: { id: input.bookingId },
    data: { status: input.status },
    include: { room: true },
  });

  return mapBookingToDto(updated);
}

export async function cancelBooking(
  tenantId: string,
  bookingId: string,
  db: Db = prisma
): Promise<RoomBookingDto> {
  return updateBookingStatus(tenantId, { bookingId, status: "CANCELLED" }, db);
}

export async function listBookings(
  tenantId: string,
  query: Partial<ListBookingsQueryInput> = {},
  db: Db = prisma
): Promise<BookingListResult> {
  const page = query.page ?? 1;
  const perPage = query.perPage ?? 50;
  const skip = (page - 1) * perPage;

  const where: Prisma.RoomBookingWhereInput = { tenantId };

  if (query.roomId) {
    where.roomId = query.roomId;
  }

  if (query.type) {
    where.type = query.type;
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.tab === "today") {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    where.startTime = { gte: todayStart, lte: todayEnd };
  } else if (query.tab === "confirmed") {
    where.status = "CONFIRMED";
  } else if (query.tab === "pending") {
    where.status = "PENDING";
  }

  if (query.search) {
    const s = query.search.trim();
    where.OR = [
      { title: { contains: s } },
      { bookedByName: { contains: s } },
      { room: { code: { contains: s } } },
      { room: { nameTh: { contains: s } } },
    ];
  }

  const [total, items] = await Promise.all([
    db.roomBooking.count({ where }),
    db.roomBooking.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { startTime: "desc" },
      include: { room: true },
    }),
  ]);

  return {
    items: items.map(mapBookingToDto),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage) || 1,
  };
}

export async function getFacilityStats(
  tenantId: string,
  db: Db = prisma
): Promise<FacilityStats> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [totalRooms, todayBookings, examSessions, pendingApproval] = await Promise.all([
    db.facilityRoom.count({ where: { tenantId, isActive: true } }),
    db.roomBooking.count({
      where: {
        tenantId,
        startTime: { gte: todayStart, lte: todayEnd },
        status: "CONFIRMED",
      },
    }),
    db.roomBooking.count({
      where: {
        tenantId,
        type: "EXAM_DEFENSE",
        status: "CONFIRMED",
      },
    }),
    db.roomBooking.count({
      where: {
        tenantId,
        status: "PENDING",
      },
    }),
  ]);

  return { totalRooms, todayBookings, examSessions, pendingApproval };
}

// -----------------------------------------------------------------------------
// Public Portal Queries
// -----------------------------------------------------------------------------

export async function resolvePortalTenantId(db: Db = prisma): Promise<string> {
  const tenant =
    (await db.tenant.findUnique({ where: { code: "DEMO" }, select: { id: true } })) ??
    (await db.tenant.findFirst({ where: { isActive: true }, orderBy: { createdAt: "asc" }, select: { id: true } }));
  if (!tenant) throw errors.not_found();
  return tenant.id;
}

export async function listPublicRooms(
  tenantId: string,
  type?: RoomType,
  db: Db = prisma
): Promise<FacilityRoomDto[]> {
  const where: Prisma.FacilityRoomWhereInput = {
    tenantId,
    isActive: true,
  };
  if (type) {
    where.type = type;
  }

  const rooms = await db.facilityRoom.findMany({
    where,
    orderBy: [{ displayOrder: "asc" }, { code: "asc" }],
    include: {
      _count: { select: { bookings: true } },
    },
  });

  return rooms.map(mapRoomToDto);
}

export async function getPublicRoomSchedule(
  tenantId: string,
  roomId: string,
  date: Date = new Date(),
  db: Db = prisma
): Promise<RoomBookingDto[]> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const bookings = await db.roomBooking.findMany({
    where: {
      tenantId,
      roomId,
      status: { in: ["CONFIRMED", "PENDING"] },
      startTime: { gte: startOfDay, lte: endOfDay },
    },
    orderBy: { startTime: "asc" },
    include: { room: true },
  });

  return bookings.map(mapBookingToDto);
}
