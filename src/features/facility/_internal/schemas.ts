import { z } from "zod";

export const roomTypeEnum = z.enum([
  "EXAM_ROOM",
  "MEETING_ROOM",
  "LAB",
  "AUDITORIUM",
  "SMART_CLASSROOM",
]);

export const bookingTypeEnum = z.enum([
  "EXAM_DEFENSE",
  "ACADEMIC_MEETING",
  "SEMINAR",
  "TEACHING",
  "GENERAL",
]);

export const bookingStatusEnum = z.enum([
  "CONFIRMED",
  "PENDING",
  "CANCELLED",
  "REJECTED",
]);

export const meetingPlatformEnum = z.enum([
  "ON_SITE",
  "ZOOM",
  "MS_TEAMS",
  "GOOGLE_MEET",
  "HYBRID",
]);

export type RoomType = z.infer<typeof roomTypeEnum>;
export type BookingType = z.infer<typeof bookingTypeEnum>;
export type BookingStatus = z.infer<typeof bookingStatusEnum>;
export type MeetingPlatform = z.infer<typeof meetingPlatformEnum>;

export const createRoomSchema = z.object({
  code: z.string().trim().min(1, "room_code_required").max(50),
  nameTh: z.string().trim().min(1, "room_name_required").max(255),
  nameEn: z.string().trim().min(1, "room_name_required").max(255),
  building: z.string().trim().min(1, "building_required").max(100),
  floor: z.coerce.number().int().default(1),
  capacity: z.coerce.number().int().min(1, "capacity_min_1").default(10),
  type: roomTypeEnum.default("EXAM_ROOM"),
  facilities: z.array(z.string()).optional().nullable(),
  imageUrl: z.string().trim().max(500).optional().nullable(),
  description: z.string().trim().optional().nullable(),
  isActive: z.boolean().default(true),
  displayOrder: z.coerce.number().int().default(0).optional(),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;

export const updateRoomSchema = createRoomSchema.partial().extend({
  id: z.string().min(1, "room_id_required"),
});

export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;

export const listRoomsQuerySchema = z.object({
  type: roomTypeEnum.optional(),
  search: z.string().trim().optional(),
  isActive: z.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(50),
});

export type ListRoomsQueryInput = z.infer<typeof listRoomsQuerySchema>;

export const createBookingSchema = z
  .object({
    roomId: z.string().min(1, "room_required"),
    title: z.string().trim().min(3, "title_too_short").max(255),
    purpose: z.string().trim().optional().nullable(),
    type: bookingTypeEnum.default("EXAM_DEFENSE"),
    platform: meetingPlatformEnum.default("ON_SITE"),
    meetingUrl: z.string().trim().max(500).optional().nullable(),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    bookedByName: z.string().trim().min(2, "name_required").max(255),
    bookedByEmail: z.string().trim().email("invalid_email"),
    bookedByPhone: z.string().trim().max(50).optional().nullable(),
    attendeeCount: z.coerce.number().int().positive().optional().nullable(),
    petitionId: z.string().trim().optional().nullable(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "end_time_must_be_after_start_time",
    path: ["endTime"],
  });

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const updateBookingStatusSchema = z.object({
  bookingId: z.string().min(1, "booking_id_required"),
  status: bookingStatusEnum,
});

export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;

export const listBookingsQuerySchema = z.object({
  roomId: z.string().optional(),
  type: bookingTypeEnum.optional(),
  status: bookingStatusEnum.optional(),
  tab: z.enum(["all", "today", "confirmed", "pending"]).default("all").optional(),
  date: z.coerce.date().optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(50),
});

export type ListBookingsQueryInput = z.infer<typeof listBookingsQuerySchema>;

export const checkRoomAvailabilitySchema = z.object({
  roomId: z.string().min(1, "room_required"),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  excludeBookingId: z.string().optional(),
});

export type CheckRoomAvailabilityInput = z.infer<typeof checkRoomAvailabilitySchema>;
