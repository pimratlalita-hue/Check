"use client";

import React, { useState, useTransition } from "react";
import {
  DoorOpen,
  CalendarCheck,
  GraduationCap,
  Clock,
  Search,
  Plus,
  RefreshCw,
  Eye,
  Pencil,
  Trash2,
  Calendar,
  Building2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/shared/lib/i18n/client";
import {
  DataTable,
  StatusPill,
  type DataTableColumn,
  type StatusPillTone,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type {
  FacilityRoomDto,
  RoomBookingDto,
  FacilityStats,
  RoomListResult,
  BookingListResult,
  RoomType,
  BookingType,
  BookingStatus,
} from "@/features/facility";
import {
  listRoomsAction,
  listBookingsAction,
  getFacilityStatsAction,
  deleteRoomAction,
} from "@/features/facility/actions";
import { RoomFormDialog } from "./room-form-dialog";
import { BookingDetailDialog } from "./booking-detail-dialog";

interface FacilityClientProps {
  initialRooms: RoomListResult;
  initialBookings: BookingListResult;
  initialStats: FacilityStats;
  canManage: boolean;
  currentUserName: string;
}

export function FacilityClient({
  initialRooms,
  initialBookings,
  initialStats,
  canManage,
  currentUserName: _currentUserName,
}: FacilityClientProps) {
  const t = useT();
  const [isPending, startTransition] = useTransition();

  // Dual Main Tab: 'schedule' or 'rooms'
  const [mainTab, setMainTab] = useState<"schedule" | "rooms">("schedule");

  // State for Bookings
  const [bookings, setBookings] = useState<RoomBookingDto[]>(initialBookings.items);
  const [bookingTab, setBookingTab] = useState<"all" | "today" | "confirmed" | "pending">("all");
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingTypeFilter, setBookingTypeFilter] = useState<string>("");

  // State for Rooms
  const [rooms, setRooms] = useState<FacilityRoomDto[]>(initialRooms.items);
  const [roomSearch, setRoomSearch] = useState("");
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>("");

  // Stats
  const [stats, setStats] = useState<FacilityStats>(initialStats);

  // Modals
  const [selectedRoom, setSelectedRoom] = useState<FacilityRoomDto | null>(null);
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);

  const [selectedBooking, setSelectedBooking] = useState<RoomBookingDto | null>(null);
  const [isBookingDetailOpen, setIsBookingDetailOpen] = useState(false);

  const fetchBookings = (tab = bookingTab, type = bookingTypeFilter, search = bookingSearch) => {
    startTransition(async () => {
      const [listRes, statsRes] = await Promise.all([
        listBookingsAction({
          tab,
          type: type ? (type as BookingType) : undefined,
          search: search.trim() || undefined,
          page: 1,
          perPage: 100,
        }),
        getFacilityStatsAction(),
      ]);

      if (listRes.ok) {
        setBookings(listRes.data.items);
      }
      if (statsRes.ok) {
        setStats(statsRes.data);
      }
    });
  };

  const fetchRooms = (type = roomTypeFilter, search = roomSearch) => {
    startTransition(async () => {
      const [listRes, statsRes] = await Promise.all([
        listRoomsAction({
          type: type ? (type as RoomType) : undefined,
          search: search.trim() || undefined,
          page: 1,
          perPage: 100,
        }),
        getFacilityStatsAction(),
      ]);

      if (listRes.ok) {
        setRooms(listRes.data.items);
      }
      if (statsRes.ok) {
        setStats(statsRes.data);
      }
    });
  };

  const handleRefresh = () => {
    if (mainTab === "schedule") {
      fetchBookings(bookingTab, bookingTypeFilter, bookingSearch);
    } else {
      fetchRooms(roomTypeFilter, roomSearch);
    }
  };

  const handleDeleteRoom = async (room: FacilityRoomDto) => {
    if (!confirm(`${t("facility.deleteRoomConfirm")} (${room.code} - ${room.nameTh})`)) return;

    startTransition(async () => {
      const res = await deleteRoomAction(room.id);
      if (res.ok) {
        toast.success(t("facility.roomDeletedSuccess"));
        fetchRooms(roomTypeFilter, roomSearch);
      } else {
        toast.error(res.error.message || "เกิดข้อผิดพลาดในการลบห้อง");
      }
    });
  };

  const getStatusTone = (status: BookingStatus): StatusPillTone => {
    switch (status) {
      case "CONFIRMED":
        return "ok";
      case "PENDING":
        return "warn";
      case "CANCELLED":
      case "REJECTED":
        return "bad";
      default:
        return "off";
    }
  };

  // Columns for Bookings DataTable
  const bookingColumns: DataTableColumn<RoomBookingDto>[] = [
    {
      key: "time",
      header: t("facility.col.time"),
      render: (row) => {
        const start = new Date(row.startTime);
        const end = new Date(row.endTime);
        return (
          <div className="space-y-0.5 text-xs">
            <div className="font-medium text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>{start.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })}</span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
              <span>
                {start.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} -{" "}
                {end.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "room",
      header: t("facility.col.room"),
      render: (row) => (
        <div className="space-y-0.5 text-xs">
          <div className="font-semibold text-rose-700">{row.roomCode || "-"}</div>
          <div className="text-[11px] text-slate-600 truncate max-w-[140px]">{row.roomNameTh}</div>
        </div>
      ),
    },
    {
      key: "title",
      header: t("facility.col.title"),
      render: (row) => (
        <div className="space-y-1">
          <div className="text-xs font-medium text-slate-800 max-w-xs truncate" title={row.title}>
            {row.title}
          </div>
          <div>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
              {t(`facility.bookingType.${row.type}`)}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "platform",
      header: t("facility.col.platform"),
      render: (row) => (
        <div className="text-xs space-y-0.5">
          <span className="text-slate-700 font-medium">
            {t(`facility.platform.${row.platform}`)}
          </span>
          {row.meetingUrl && (
            <div>
              <a
                href={row.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-rose-700 hover:text-rose-800 flex items-center gap-1"
              >
                <span>เปิดลิงก์</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "bookedBy",
      header: t("facility.col.bookedBy"),
      render: (row) => (
        <div className="space-y-0.5 text-xs">
          <div className="font-medium text-slate-800">{row.bookedByName}</div>
          <div className="text-[11px] text-slate-500 truncate max-w-[120px]">{row.bookedByEmail}</div>
        </div>
      ),
    },
    {
      key: "status",
      header: t("facility.col.status"),
      render: (row) => (
        <StatusPill tone={getStatusTone(row.status)}>
          {t(`facility.status.${row.status}`)}
        </StatusPill>
      ),
    },
    {
      key: "actions",
      header: t("facility.col.actions"),
      render: (row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setSelectedBooking(row);
            setIsBookingDetailOpen(true);
          }}
          className="h-7 px-2.5 text-xs text-rose-700 hover:text-rose-800 hover:bg-rose-50 border-rose-200 flex items-center gap-1.5"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{t("facility.bookingDetails")}</span>
        </Button>
      ),
    },
  ];

  // Columns for Rooms DataTable
  const roomColumns: DataTableColumn<FacilityRoomDto>[] = [
    {
      key: "code",
      header: t("facility.roomCode"),
      render: (row) => (
        <div className="font-mono font-semibold text-rose-700 text-xs">
          {row.code}
        </div>
      ),
    },
    {
      key: "name",
      header: t("facility.col.room"),
      render: (row) => (
        <div className="space-y-0.5">
          <div className="font-medium text-slate-800 text-xs">{row.nameTh}</div>
          <div className="text-[11px] text-slate-500">{row.nameEn}</div>
        </div>
      ),
    },
    {
      key: "building",
      header: t("facility.col.building"),
      render: (row) => (
        <div className="text-xs text-slate-700">
          <span>{row.building}</span>
          <span className="text-slate-400 mx-1">/</span>
          <span className="text-slate-500">ชั้น {row.floor}</span>
        </div>
      ),
    },
    {
      key: "type",
      header: t("facility.col.type"),
      render: (row) => (
        <span className="text-xs text-slate-700 font-medium">
          {t(`facility.roomType.${row.type}`)}
        </span>
      ),
    },
    {
      key: "capacity",
      header: t("facility.col.capacity"),
      render: (row) => (
        <span className="text-xs font-semibold text-slate-800">
          {row.capacity} {t("facility.seats")}
        </span>
      ),
    },
    {
      key: "facilities",
      header: t("facility.facilitiesLabel"),
      render: (row) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {row.facilities && row.facilities.length > 0 ? (
            row.facilities.slice(0, 3).map((f, i) => (
              <span
                key={i}
                className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600"
              >
                {f}
              </span>
            ))
          ) : (
            <span className="text-slate-400 text-[11px]">-</span>
          )}
          {row.facilities && row.facilities.length > 3 && (
            <span className="text-[10px] text-slate-500">+{row.facilities.length - 3}</span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: t("facility.col.status"),
      render: (row) => (
        <StatusPill tone={row.isActive ? "ok" : "off"}>
          {row.isActive ? "พร้อมใช้งาน" : "ปิดปรับปรุง"}
        </StatusPill>
      ),
    },
    {
      key: "actions",
      header: t("facility.col.actions"),
      render: (row) => (
        <div className="flex items-center gap-1.5">
          {canManage && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedRoom(row);
                  setIsRoomDialogOpen(true);
                }}
                className="h-7 px-2 text-xs text-slate-700 hover:text-slate-900 border-slate-200"
                title={t("facility.editRoom")}
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDeleteRoom(row)}
                className="h-7 px-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                title={t("facility.deleteRoom")}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {t("facility.title")}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t("facility.description")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isPending}
            className="flex items-center gap-1.5 text-xs text-slate-600 border-slate-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPending ? "animate-spin" : ""}`} />
            <span>รีเฟรช</span>
          </Button>

          {canManage && mainTab === "rooms" && (
            <Button
              size="sm"
              onClick={() => {
                setSelectedRoom(null);
                setIsRoomDialogOpen(true);
              }}
              className="bg-rose-700 hover:bg-rose-800 text-white flex items-center gap-1.5 text-xs shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t("facility.createRoom")}</span>
            </Button>
          )}
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Rooms */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">
              {t("facility.stats.totalRooms")}
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {stats.totalRooms}
            </div>
          </div>
        </div>

        {/* Today Bookings */}
        <div className="p-4 bg-white border border-blue-200 rounded-xl shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-blue-600 font-medium">
              {t("facility.stats.todayBookings")}
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {stats.todayBookings}
            </div>
          </div>
        </div>

        {/* Defense Exams */}
        <div className="p-4 bg-white border border-emerald-200 rounded-xl shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-emerald-600 font-medium">
              {t("facility.stats.examSessions")}
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {stats.examSessions}
            </div>
          </div>
        </div>

        {/* Pending Approval */}
        <div className="p-4 bg-white border border-amber-200 rounded-xl shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-amber-600 font-medium">
              {t("facility.stats.pendingApproval")}
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {stats.pendingApproval}
            </div>
          </div>
        </div>
      </div>

      {/* Dual Main Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-6">
        <button
          type="button"
          onClick={() => setMainTab("schedule")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            mainTab === "schedule"
              ? "border-rose-600 text-rose-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          {t("facility.tab.schedule")}
        </button>

        <button
          type="button"
          onClick={() => setMainTab("rooms")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            mainTab === "rooms"
              ? "border-rose-600 text-rose-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          {t("facility.tab.rooms")}
        </button>
      </div>

      {/* Main Tab Content */}
      {mainTab === "schedule" ? (
        <div className="space-y-4">
          {/* Sub Filter Tabs & Search Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg w-fit">
              {(
                [
                  { id: "all", label: t("facility.tab.all") },
                  { id: "today", label: t("facility.tab.today") },
                  { id: "confirmed", label: t("facility.tab.confirmed") },
                  { id: "pending", label: t("facility.tab.pending") },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setBookingTab(tab.id);
                    fetchBookings(tab.id, bookingTypeFilter, bookingSearch);
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    bookingTab === tab.id
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={bookingTypeFilter}
                onChange={(e) => {
                  setBookingTypeFilter(e.target.value);
                  fetchBookings(bookingTab, e.target.value, bookingSearch);
                }}
                className="h-9 px-3 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="">{t("facility.selectRoomType")}</option>
                <option value="EXAM_DEFENSE">{t("facility.bookingType.EXAM_DEFENSE")}</option>
                <option value="ACADEMIC_MEETING">{t("facility.bookingType.ACADEMIC_MEETING")}</option>
                <option value="SEMINAR">{t("facility.bookingType.SEMINAR")}</option>
                <option value="TEACHING">{t("facility.bookingType.TEACHING")}</option>
                <option value="GENERAL">{t("facility.bookingType.GENERAL")}</option>
              </select>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  fetchBookings(bookingTab, bookingTypeFilter, bookingSearch);
                }}
                className="relative"
              >
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  placeholder={t("facility.searchPlaceholder")}
                  className="h-9 pl-9 pr-3 w-56 sm:w-64 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </form>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <DataTable<RoomBookingDto>
              headHeading={t("facility.tab.schedule")}
              headMeta={`${bookings.length} รายการ`}
              columns={bookingColumns}
              rows={bookings}
              getRowId={(row) => row.id}
              state={isPending ? "loading" : bookings.length === 0 ? "empty" : "data"}
              empty={{
                icon: <CalendarCheck className="w-8 h-8 text-slate-400" />,
                title: t("facility.empty"),
                description: t("facility.emptyDesc"),
              }}
              error={{
                icon: <Clock className="w-8 h-8 text-rose-500" />,
                title: "เกิดข้อผิดพลาดในการโหลดข้อมูล",
              }}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Rooms Filters & Search Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <select
                value={roomTypeFilter}
                onChange={(e) => {
                  setRoomTypeFilter(e.target.value);
                  fetchRooms(e.target.value, roomSearch);
                }}
                className="h-9 px-3 rounded-lg border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="">{t("facility.selectRoomType")}</option>
                <option value="EXAM_ROOM">{t("facility.roomType.EXAM_ROOM")}</option>
                <option value="MEETING_ROOM">{t("facility.roomType.MEETING_ROOM")}</option>
                <option value="LAB">{t("facility.roomType.LAB")}</option>
                <option value="AUDITORIUM">{t("facility.roomType.AUDITORIUM")}</option>
                <option value="SMART_CLASSROOM">{t("facility.roomType.SMART_CLASSROOM")}</option>
              </select>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchRooms(roomTypeFilter, roomSearch);
              }}
              className="relative"
            >
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={roomSearch}
                onChange={(e) => setRoomSearch(e.target.value)}
                placeholder="ค้นหาด้วยรหัสห้อง, ชื่อห้อง หรืออาคาร..."
                className="h-9 pl-9 pr-3 w-64 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </form>
          </div>

          {/* Rooms Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <DataTable<FacilityRoomDto>
              headHeading={t("facility.tab.rooms")}
              headMeta={`${rooms.length} ห้อง`}
              columns={roomColumns}
              rows={rooms}
              getRowId={(row) => row.id}
              state={isPending ? "loading" : rooms.length === 0 ? "empty" : "data"}
              empty={{
                icon: <DoorOpen className="w-8 h-8 text-slate-400" />,
                title: t("facility.empty"),
                description: t("facility.emptyDesc"),
              }}
              error={{
                icon: <DoorOpen className="w-8 h-8 text-rose-500" />,
                title: "เกิดข้อผิดพลาดในการโหลดข้อมูล",
              }}
            />
          </div>
        </div>
      )}

      {/* Dialogs */}
      <RoomFormDialog
        open={isRoomDialogOpen}
        onOpenChange={setIsRoomDialogOpen}
        room={selectedRoom}
        onSuccess={() => fetchRooms(roomTypeFilter, roomSearch)}
      />

      <BookingDetailDialog
        open={isBookingDetailOpen}
        onOpenChange={setIsBookingDetailOpen}
        booking={selectedBooking}
        canManage={canManage}
        onSuccess={() => fetchBookings(bookingTab, bookingTypeFilter, bookingSearch)}
      />
    </div>
  );
}
