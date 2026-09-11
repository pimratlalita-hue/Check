import "server-only";

export {
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
} from "./_internal/services/facility.service";
export { FACILITY_P, FACILITY_PERMISSIONS } from "./permissions";
