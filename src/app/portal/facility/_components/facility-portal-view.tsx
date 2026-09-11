"use client";

import React, { useState } from "react";
import {
  Building2,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Search,
  ExternalLink,
  CalendarCheck,
  Check,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/shared/lib/i18n/client";
import { StatusPill } from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import {
  type FacilityRoomDto,
  type RoomBookingDto,
  type BookingType,
  type MeetingPlatform,
  downloadBookingIcs,
} from "@/features/facility";
import {
  checkRoomAvailabilityAction,
  createPublicBookingAction,
  getPublicRoomScheduleAction,
} from "@/features/facility/actions";

interface FacilityPortalViewProps {
  initialRooms: FacilityRoomDto[];
}

export function FacilityPortalView({ initialRooms }: FacilityPortalViewProps) {
  const t = useT();
  const [activeTab, setActiveTab] = useState<"rooms" | "book">("rooms");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Room Schedule Drawer / Modal
  const [scheduleRoom, setScheduleRoom] = useState<FacilityRoomDto | null>(null);
  const [roomSchedule, setRoomSchedule] = useState<RoomBookingDto[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  // Booking Form State
  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    initialRooms.length > 0 ? initialRooms[0].id : ""
  );
  const [title, setTitle] = useState("");
  const [purpose, setPurpose] = useState("");
  const [bookingType, setBookingType] = useState<BookingType>("EXAM_DEFENSE");
  const [platform, setPlatform] = useState<MeetingPlatform>("ON_SITE");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [bookingDate, setBookingDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [startTimeStr, setStartTimeStr] = useState("09:00");
  const [endTimeStr, setEndTimeStr] = useState("12:00");

  const [bookedByName, setBookedByName] = useState("");
  const [bookedByEmail, setBookedByEmail] = useState("");
  const [bookedByPhone, setBookedByPhone] = useState("");
  const [attendeeCount, setAttendeeCount] = useState(10);

  // Availability Check State
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState<{
    checked: boolean;
    available: boolean;
    conflictTitle?: string;
  } | null>(null);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<RoomBookingDto | null>(null);

  // Filtered Rooms
  const filteredRooms = initialRooms.filter((room) => {
    const matchesType = selectedType === "ALL" || room.type === selectedType;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      room.code.toLowerCase().includes(q) ||
      room.nameTh.toLowerCase().includes(q) ||
      room.nameEn.toLowerCase().includes(q) ||
      room.building.toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });

  const handleOpenSchedule = async (room: FacilityRoomDto) => {
    setScheduleRoom(room);
    setLoadingSchedule(true);
    try {
      const res = await getPublicRoomScheduleAction(room.id);
      if (res.ok) {
        setRoomSchedule(res.data);
      } else {
        setRoomSchedule([]);
      }
    } catch {
      setRoomSchedule([]);
    } finally {
      setLoadingSchedule(false);
    }
  };

  const handleSelectRoomForBooking = (roomId: string) => {
    setSelectedRoomId(roomId);
    setActiveTab("book");
    setAvailabilityResult(null);
  };

  const handleCheckAvailability = async () => {
    if (!selectedRoomId) {
      toast.error(t("facility.selectRoom"));
      return;
    }

    const start = new Date(`${bookingDate}T${startTimeStr}:00`);
    const end = new Date(`${bookingDate}T${endTimeStr}:00`);

    if (end <= start) {
      toast.error("เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น");
      return;
    }

    setCheckingAvailability(true);
    try {
      const res = await checkRoomAvailabilityAction({
        roomId: selectedRoomId,
        startTime: start,
        endTime: end,
      });

      if (res.ok) {
        setAvailabilityResult({
          checked: true,
          available: res.data.available,
          conflictTitle: res.data.conflictingBooking?.title,
        });
        if (res.data.available) {
          toast.success(t("facility.available"));
        } else {
          toast.error(t("facility.unavailable"));
        }
      } else {
        toast.error(res.error.message || "เกิดข้อผิดพลาดในการตรวจสอบ");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const start = new Date(`${bookingDate}T${startTimeStr}:00`);
    const end = new Date(`${bookingDate}T${endTimeStr}:00`);

    if (end <= start) {
      toast.error("เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createPublicBookingAction({
        roomId: selectedRoomId,
        title,
        purpose: purpose || null,
        type: bookingType,
        platform,
        meetingUrl: meetingUrl || null,
        startTime: start,
        endTime: end,
        bookedByName,
        bookedByEmail,
        bookedByPhone: bookedByPhone || null,
        attendeeCount: attendeeCount || null,
      });

      if (res.ok) {
        toast.success(t("facility.bookingSuccess"));
        setConfirmedBooking(res.data);
      } else {
        toast.error(res.error.message || "เกิดข้อผิดพลาดในการจองห้อง");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setConfirmedBooking(null);
    setTitle("");
    setPurpose("");
    setAvailabilityResult(null);
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Graduate Thesis & Research Facilities</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {t("facility.portalTitle")}
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            {t("facility.portalSubtitle")}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-8">
        <button
          type="button"
          onClick={() => setActiveTab("rooms")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "rooms"
              ? "border-rose-600 text-rose-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{t("facility.portalTab.rooms")}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("book");
            setConfirmedBooking(null);
          }}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "book"
              ? "border-rose-600 text-rose-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>{t("facility.portalTab.book")}</span>
        </button>
      </div>

      {/* Tab 1: Explore Rooms */}
      {activeTab === "rooms" && (
        <div className="space-y-6">
          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Room Type Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: "ALL", label: "ทั้งหมด" },
                { id: "EXAM_ROOM", label: t("facility.roomType.EXAM_ROOM") },
                { id: "MEETING_ROOM", label: t("facility.roomType.MEETING_ROOM") },
                { id: "LAB", label: t("facility.roomType.LAB") },
                { id: "AUDITORIUM", label: t("facility.roomType.AUDITORIUM") },
                { id: "SMART_CLASSROOM", label: t("facility.roomType.SMART_CLASSROOM") },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setSelectedType(pill.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedType === pill.id
                      ? "bg-rose-700 text-white shadow-xs"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อห้อง, รหัส, อาคาร..."
                className="h-9 pl-9 pr-3 w-64 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
              />
            </div>
          </div>

          {/* Rooms Grid */}
          {filteredRooms.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <div className="text-sm font-semibold text-slate-700">{t("facility.empty")}</div>
              <div className="text-xs text-slate-500 mt-1">{t("facility.emptyDesc")}</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Header Image or Placeholder Banner */}
                    <div className="h-36 bg-gradient-to-tr from-slate-800 to-slate-700 p-4 relative flex flex-col justify-between overflow-hidden">
                      <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-15">
                        <Building2 className="w-32 h-32 text-white" />
                      </div>
                      <div className="flex items-center justify-between z-10">
                        <span className="px-2 py-0.5 rounded bg-white/20 backdrop-blur-xs text-white text-[11px] font-mono font-semibold">
                          {room.code}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-rose-500/80 backdrop-blur-xs text-white text-[11px] font-medium flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{room.capacity} ที่นั่ง</span>
                        </span>
                      </div>
                      <div className="z-10">
                        <div className="text-white font-bold text-base line-clamp-1">
                          {room.nameTh}
                        </div>
                        <div className="text-slate-300 text-xs line-clamp-1">
                          {room.nameEn}
                        </div>
                      </div>
                    </div>

                    {/* Room Details */}
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{room.building} (ชั้น {room.floor})</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <span className="font-semibold text-rose-700">
                          {t(`facility.roomType.${room.type}`)}
                        </span>
                      </div>

                      {/* Amenities Tags */}
                      {room.facilities && room.facilities.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {room.facilities.map((fac, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700"
                            >
                              {fac}
                            </span>
                          ))}
                        </div>
                      )}

                      {room.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {room.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenSchedule(room)}
                      className="text-xs text-slate-600 hover:text-slate-900"
                    >
                      <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      <span>ตารางวันนี้</span>
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => handleSelectRoomForBooking(room.id)}
                      className="bg-rose-700 hover:bg-rose-800 text-white text-xs gap-1"
                    >
                      <span>จองห้องนี้</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Today's Schedule Modal */}
          {scheduleRoom && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      ตารางการใช้ห้อง: {scheduleRoom.code}
                    </h3>
                    <p className="text-xs text-slate-500">{scheduleRoom.nameTh}</p>
                  </div>
                  <button
                    onClick={() => setScheduleRoom(null)}
                    className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {loadingSchedule ? (
                    <div className="py-8 text-center text-xs text-slate-500">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-rose-600" />
                      กำลังโหลดตาราง...
                    </div>
                  ) : roomSchedule.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg">
                      <CalendarCheck className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                      ไม่มีการจองห้องในวันนี้ (ห้องว่าง)
                    </div>
                  ) : (
                    roomSchedule.map((b) => (
                      <div
                        key={b.id}
                        className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-1"
                      >
                        <div className="font-semibold text-slate-800">{b.title}</div>
                        <div className="text-slate-500 flex items-center gap-2">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>
                            {new Date(b.startTime).toLocaleTimeString("th-TH", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            -{" "}
                            {new Date(b.endTime).toLocaleTimeString("th-TH", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          จองโดย: {b.bookedByName}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setScheduleRoom(null)}
                  >
                    ปิด
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      const rId = scheduleRoom.id;
                      setScheduleRoom(null);
                      handleSelectRoomForBooking(rId);
                    }}
                    className="bg-rose-700 hover:bg-rose-800 text-white"
                  >
                    จองห้องนี้
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Book a Room Online */}
      {activeTab === "book" && (
        <div className="max-w-2xl mx-auto">
          {confirmedBooking ? (
            /* Booking Confirmation Card */
            <div className="bg-white rounded-2xl border border-emerald-200 shadow-md p-6 sm:p-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                <Check className="w-8 h-8 stroke-[2.5]" />
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-slate-900">
                  {t("facility.bookingSuccess")}
                </h2>
                <p className="text-xs text-slate-500">
                  ระบบได้บันทึกและยืนยันการจองห้องของท่านเรียบร้อยแล้ว
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">สถานะการจอง:</span>
                  <StatusPill tone="ok">
                    {t(`facility.status.${confirmedBooking.status}`)}
                  </StatusPill>
                </div>

                <div>
                  <span className="text-slate-500">หัวข้อ:</span>
                  <div className="font-semibold text-slate-900 mt-0.5">{confirmedBooking.title}</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500">ห้องที่จอง:</span>
                    <div className="font-semibold text-rose-700 mt-0.5">
                      {confirmedBooking.roomCode} - {confirmedBooking.roomNameTh}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">รูปแบบการประชุม:</span>
                    <div className="font-medium text-slate-800 mt-0.5">
                      {t(`facility.platform.${confirmedBooking.platform}`)}
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500">วัน-เวลา:</span>
                  <div className="font-medium text-slate-800 mt-0.5">
                    {new Date(confirmedBooking.startTime).toLocaleDateString("th-TH", {
                      dateStyle: "long",
                    })}{" "}
                    ({new Date(confirmedBooking.startTime).toLocaleTimeString("th-TH", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {new Date(confirmedBooking.endTime).toLocaleTimeString("th-TH", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })} น.)
                  </div>
                </div>

                {confirmedBooking.meetingUrl && (
                  <div>
                    <span className="text-slate-500">ลิงก์การประชุมออนไลน์:</span>
                    <div className="mt-0.5">
                      <a
                        href={confirmedBooking.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-rose-700 underline font-medium inline-flex items-center gap-1"
                      >
                        <span>{confirmedBooking.meetingUrl}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 text-slate-500">
                  ผู้จอง: <span className="font-medium text-slate-800">{confirmedBooking.bookedByName}</span> ({confirmedBooking.bookedByEmail})
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    downloadBookingIcs(confirmedBooking);
                    toast.success("ดาวน์โหลดไฟล์ปฏิทิน (.ics) เรียบร้อยแล้ว");
                  }}
                  className="text-xs text-rose-700 border-rose-200 hover:bg-rose-50 flex items-center gap-1.5 font-medium"
                >
                  <Calendar className="w-3.5 h-3.5 text-rose-600" />
                  <span>{t("facility.action.exportIcs")}</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("rooms")}
                  className="text-xs"
                >
                  กลับไปหน้ารายการห้อง
                </Button>
                <Button
                  onClick={resetForm}
                  className="bg-rose-700 hover:bg-rose-800 text-white text-xs"
                >
                  จองห้องอื่นเพิ่มเติม
                </Button>
              </div>
            </div>
          ) : (
            /* Reservation Form Card */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  แบบฟอร์มจองห้องสอบและห้องประชุมออนไลน์
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  กรอกข้อมูลการใช้งานและตรวจสอบเวลาว่างด้วยระบบ Real-time Conflict Engine
                </p>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-4">
                {/* Room Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t("facility.selectRoom")} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedRoomId}
                    onChange={(e) => {
                      setSelectedRoomId(e.target.value);
                      setAvailabilityResult(null);
                    }}
                    required
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                  >
                    {initialRooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.code} - {r.nameTh} ({r.building}, {r.capacity} ที่นั่ง)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title & Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t("facility.bookingTitle")} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="เช่น สอบเค้าโครงวิทยานิพนธ์ นายสมชาย"
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t("facility.col.type")} <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={bookingType}
                      onChange={(e) => setBookingType(e.target.value as BookingType)}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                    >
                      <option value="EXAM_DEFENSE">{t("facility.bookingType.EXAM_DEFENSE")}</option>
                      <option value="ACADEMIC_MEETING">{t("facility.bookingType.ACADEMIC_MEETING")}</option>
                      <option value="SEMINAR">{t("facility.bookingType.SEMINAR")}</option>
                      <option value="TEACHING">{t("facility.bookingType.TEACHING")}</option>
                      <option value="GENERAL">{t("facility.bookingType.GENERAL")}</option>
                    </select>
                  </div>
                </div>

                {/* Platform & Meeting URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t("facility.col.platform")} <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value as MeetingPlatform)}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                    >
                      <option value="ON_SITE">{t("facility.platform.ON_SITE")}</option>
                      <option value="ZOOM">{t("facility.platform.ZOOM")}</option>
                      <option value="MS_TEAMS">{t("facility.platform.MS_TEAMS")}</option>
                      <option value="GOOGLE_MEET">{t("facility.platform.GOOGLE_MEET")}</option>
                      <option value="HYBRID">{t("facility.platform.HYBRID")}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t("facility.meetingUrl")}
                    </label>
                    <input
                      type="url"
                      value={meetingUrl}
                      onChange={(e) => setMeetingUrl(e.target.value)}
                      placeholder="https://zoom.us/j/..."
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                {/* Date & Time Slot */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-rose-600" />
                    <span>กำหนดวันและเวลาที่ต้องการใช้งาน</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        วันที่
                      </label>
                      <input
                        type="date"
                        required
                        value={bookingDate}
                        onChange={(e) => {
                          setBookingDate(e.target.value);
                          setAvailabilityResult(null);
                        }}
                        className="w-full h-9 px-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        {t("facility.startTime")}
                      </label>
                      <input
                        type="time"
                        required
                        value={startTimeStr}
                        onChange={(e) => {
                          setStartTimeStr(e.target.value);
                          setAvailabilityResult(null);
                        }}
                        className="w-full h-9 px-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        {t("facility.endTime")}
                      </label>
                      <input
                        type="time"
                        required
                        value={endTimeStr}
                        onChange={(e) => {
                          setEndTimeStr(e.target.value);
                          setAvailabilityResult(null);
                        }}
                        className="w-full h-9 px-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCheckAvailability}
                      disabled={checkingAvailability}
                      className="text-xs border-slate-300 hover:bg-white gap-1.5"
                    >
                      {checkingAvailability ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                      )}
                      <span>{t("facility.checkAvailability")}</span>
                    </Button>

                    {availabilityResult && (
                      <div className="text-xs">
                        {availabilityResult.available ? (
                          <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{t("facility.available")}</span>
                          </span>
                        ) : (
                          <span className="text-rose-600 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            <span>{t("facility.unavailable")}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Purpose */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t("facility.bookingPurpose")}
                  </label>
                  <textarea
                    rows={2}
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="ระบุวัตถุประสงค์ หรืออุปกรณ์พิเศษที่ต้องการ..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                {/* Booker Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t("facility.bookedByName")} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={bookedByName}
                      onChange={(e) => setBookedByName(e.target.value)}
                      placeholder="เช่น สมชาย ใจดี"
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t("facility.bookedByEmail")} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={bookedByEmail}
                      onChange={(e) => setBookedByEmail(e.target.value)}
                      placeholder="student@univ.ac.th"
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t("facility.bookedByPhone")}
                    </label>
                    <input
                      type="tel"
                      value={bookedByPhone}
                      onChange={(e) => setBookedByPhone(e.target.value)}
                      placeholder="081-234-5678"
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t("facility.attendeeCount")}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={attendeeCount}
                      onChange={(e) => setAttendeeCount(parseInt(e.target.value) || 1)}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4 flex items-center justify-end">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto bg-rose-700 hover:bg-rose-800 text-white text-xs px-6 py-2.5 shadow-sm"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        กำลังดำเนินการ...
                      </>
                    ) : (
                      <>
                        <CalendarCheck className="w-4 h-4 mr-2" />
                        {t("facility.bookNow")}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
