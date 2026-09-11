export { FACILITY_P, FACILITY_PERMISSIONS } from "./permissions";
export {
  roomTypeEnum,
  bookingTypeEnum,
  bookingStatusEnum,
  meetingPlatformEnum,
  type RoomType,
  type BookingType,
  type BookingStatus,
  type MeetingPlatform,
  type CreateRoomInput,
  type UpdateRoomInput,
  type ListRoomsQueryInput,
  type CreateBookingInput,
  type UpdateBookingStatusInput,
  type ListBookingsQueryInput,
  type CheckRoomAvailabilityInput,
} from "./_internal/schemas";
export type {
  FacilityRoomDto,
  RoomBookingDto,
  FacilityStats,
  RoomListResult,
  BookingListResult,
} from "./_internal/services/facility.service";
export {
  generateBookingIcs,
  downloadBookingIcs,
  formatIcsDateTime,
  escapeIcsText,
} from "./_internal/services/ical.service";

