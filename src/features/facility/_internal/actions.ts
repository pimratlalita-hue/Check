"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { FACILITY_P } from "../permissions";
import {
  createRoomSchema,
  updateRoomSchema,
  listRoomsQuerySchema,
  createBookingSchema,
  updateBookingStatusSchema,
  listBookingsQuerySchema,
  checkRoomAvailabilitySchema,
} from "./schemas";
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
  resolvePortalTenantId,
  listPublicRooms,
  getPublicRoomSchedule,
  type FacilityRoomDto,
  type RoomBookingDto,
  type FacilityStats,
  type RoomListResult,
  type BookingListResult,
} from "./services/facility.service";

// -----------------------------------------------------------------------------
// Admin Room Management Actions
// -----------------------------------------------------------------------------

export async function listRoomsAction(input?: unknown): Promise<ActionResult<RoomListResult>> {
  return runAction(async () => {
    const ctx = await requirePermission(FACILITY_P.facilityRead);
    const parsed = listRoomsQuerySchema.parse(input ?? {}, { error: zodErrorMap(await getLocale()) });
    return listRooms(ctx.tenantId, parsed);
  });
}

export async function getRoomByIdAction(id: string): Promise<ActionResult<FacilityRoomDto | null>> {
  return runAction(async () => {
    const ctx = await requirePermission(FACILITY_P.facilityRead);
    return getRoomById(ctx.tenantId, id);
  });
}

export async function createRoomAction(input: unknown): Promise<ActionResult<FacilityRoomDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(FACILITY_P.facilityManage);
    const parsed = createRoomSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createRoom(ctx.tenantId, parsed);
    revalidatePath("/facility");
    revalidatePath("/portal/facility");
    return result;
  });
}

export async function updateRoomAction(input: unknown): Promise<ActionResult<FacilityRoomDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(FACILITY_P.facilityManage);
    const parsed = updateRoomSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateRoom(ctx.tenantId, parsed);
    revalidatePath("/facility");
    revalidatePath("/portal/facility");
    return result;
  });
}

export async function deleteRoomAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(FACILITY_P.facilityManage);
    await deleteRoom(ctx.tenantId, id);
    revalidatePath("/facility");
    revalidatePath("/portal/facility");
  });
}

// -----------------------------------------------------------------------------
// Admin Booking & Schedule Actions
// -----------------------------------------------------------------------------

export async function listBookingsAction(input?: unknown): Promise<ActionResult<BookingListResult>> {
  return runAction(async () => {
    const ctx = await requirePermission(FACILITY_P.facilityRead);
    const parsed = listBookingsQuerySchema.parse(input ?? {}, { error: zodErrorMap(await getLocale()) });
    return listBookings(ctx.tenantId, parsed);
  });
}

export async function getFacilityStatsAction(): Promise<ActionResult<FacilityStats>> {
  return runAction(async () => {
    const ctx = await requirePermission(FACILITY_P.facilityRead);
    return getFacilityStats(ctx.tenantId);
  });
}

export async function createBookingAction(input: unknown): Promise<ActionResult<RoomBookingDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(FACILITY_P.facilityManage);
    const parsed = createBookingSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createBooking(ctx.tenantId, parsed);
    revalidatePath("/facility");
    revalidatePath("/portal/facility");
    return result;
  });
}

export async function updateBookingStatusAction(input: unknown): Promise<ActionResult<RoomBookingDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(FACILITY_P.facilityManage);
    const parsed = updateBookingStatusSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateBookingStatus(ctx.tenantId, parsed);
    revalidatePath("/facility");
    revalidatePath("/portal/facility");
    return result;
  });
}

export async function cancelBookingAction(bookingId: string): Promise<ActionResult<RoomBookingDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(FACILITY_P.facilityManage);
    const result = await cancelBooking(ctx.tenantId, bookingId);
    revalidatePath("/facility");
    revalidatePath("/portal/facility");
    return result;
  });
}

// -----------------------------------------------------------------------------
// Public Portal & Availability Actions
// -----------------------------------------------------------------------------

export async function checkRoomAvailabilityAction(
  input: unknown
): Promise<ActionResult<{ available: boolean; conflictingBooking?: RoomBookingDto }>> {
  return runAction(async () => {
    const tenantId = await resolvePortalTenantId();
    const parsed = checkRoomAvailabilitySchema.parse(input, { error: zodErrorMap(await getLocale()) });
    return checkRoomAvailability(tenantId, parsed);
  });
}

export async function createPublicBookingAction(input: unknown): Promise<ActionResult<RoomBookingDto>> {
  return runAction(async () => {
    const tenantId = await resolvePortalTenantId();
    const parsed = createBookingSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createBooking(tenantId, parsed);
    revalidatePath("/facility");
    revalidatePath("/portal/facility");
    return result;
  });
}

export async function getPublicRoomsAction(): Promise<ActionResult<FacilityRoomDto[]>> {
  return runAction(async () => {
    const tenantId = await resolvePortalTenantId();
    return listPublicRooms(tenantId);
  });
}

export async function getPublicRoomScheduleAction(
  roomId: string,
  dateStr?: string
): Promise<ActionResult<RoomBookingDto[]>> {
  return runAction(async () => {
    const tenantId = await resolvePortalTenantId();
    const date = dateStr ? new Date(dateStr) : new Date();
    return getPublicRoomSchedule(tenantId, roomId, date);
  });
}
