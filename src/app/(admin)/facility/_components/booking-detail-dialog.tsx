"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Mail,
  Phone,
  Video,
  CheckCircle2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useT } from "@/shared/lib/i18n/client";
import {
  LiyonDialog,
  LiyonDialogCloseButton,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  StatusPill,
  type StatusPillTone,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import { type RoomBookingDto, downloadBookingIcs } from "@/features/facility";
import {
  updateBookingStatusAction,
  cancelBookingAction,
} from "@/features/facility/actions";

interface BookingDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: RoomBookingDto | null;
  canManage: boolean;
  onSuccess: () => void;
}

export function BookingDetailDialog({
  open,
  onOpenChange,
  booking,
  canManage,
  onSuccess,
}: BookingDetailDialogProps) {
  const t = useT();
  const [submitting, setSubmitting] = useState(false);

  if (!booking) return null;

  const getStatusTone = (status: string): StatusPillTone => {
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

  const handleUpdateStatus = async (status: "CONFIRMED" | "REJECTED") => {
    setSubmitting(true);
    try {
      const res = await updateBookingStatusAction({
        bookingId: booking.id,
        status,
      });

      if (res.ok) {
        toast.success(
          status === "CONFIRMED"
            ? t("facility.status.CONFIRMED")
            : t("facility.status.REJECTED")
        );
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(res.error.message || "เกิดข้อผิดพลาด");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการจองนี้?")) return;

    setSubmitting(true);
    try {
      const res = await cancelBookingAction(booking.id);
      if (res.ok) {
        toast.success(t("facility.bookingCancelledSuccess"));
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(res.error.message || "เกิดข้อผิดพลาด");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setSubmitting(false);
    }
  };

  const start = new Date(booking.startTime);
  const end = new Date(booking.endTime);

  return (
    <LiyonDialog open={open} onOpenChange={onOpenChange} wide>
      <div className="space-y-4">
        <LiyonDialogCloseButton label="ปิด" />
        <LiyonDialogHeader
          title={booking.title}
          description={`${booking.roomCode || ""} - ${booking.roomNameTh || ""}`}
        />

        <LiyonDialogBody>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1 text-sm text-slate-700">
            {/* Status & Type Bar */}
            <div className="flex items-center justify-between pb-1">
              <StatusPill tone={getStatusTone(booking.status)}>
                {t(`facility.status.${booking.status}`)}
              </StatusPill>
              <span className="text-xs text-slate-500 font-medium">
                {t(`facility.bookingType.${booking.type}`)}
              </span>
            </div>

            {/* Room & Location */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
              <MapPin className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold text-slate-800">
                  {booking.roomCode} - {booking.roomNameTh}
                </div>
                <div className="text-xs text-slate-500">
                  {booking.building}
                </div>
              </div>
            </div>

            {/* Time Slot */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>{start.toLocaleDateString("th-TH", { dateStyle: "long" })}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>
                  {start.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} -{" "}
                  {end.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.
                </span>
              </div>
            </div>

            {/* Platform & Online Link */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <Video className="w-4 h-4 text-slate-500" />
                <span>รูปแบบ: {t(`facility.platform.${booking.platform}`)}</span>
              </div>
              {booking.meetingUrl && (
                <div className="pt-1">
                  <a
                    href={booking.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-rose-700 hover:text-rose-800 underline font-medium"
                  >
                    <span>เข้าร่วมการประชุมออนไลน์</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Purpose */}
            {booking.purpose && (
              <div>
                <div className="text-xs font-semibold text-slate-500 mb-1">
                  {t("facility.bookingPurpose")}
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs leading-relaxed text-slate-700">
                  {booking.purpose}
                </div>
              </div>
            )}

            {/* Booker Information */}
            <div>
              <div className="text-xs font-semibold text-slate-500 mb-1">
                {t("facility.col.bookedBy")}
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1.5 text-xs">
                <div className="flex items-center gap-2 font-medium text-slate-800">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>{booking.bookedByName}</span>
                  {booking.attendeeCount && (
                    <span className="text-slate-500 font-normal">
                      ({booking.attendeeCount} {t("facility.seats")})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{booking.bookedByEmail}</span>
                </div>
                {booking.bookedByPhone && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{booking.bookedByPhone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </LiyonDialogBody>

        <LiyonDialogFooter>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  downloadBookingIcs(booking);
                  toast.success("ดาวน์โหลดไฟล์ปฏิทิน (.ics) เรียบร้อยแล้ว");
                }}
                className="text-slate-700 border-slate-300 hover:bg-slate-50 text-xs flex items-center gap-1.5"
                title="ส่งออกปฏิทินเพื่อบันทึกลงใน Google Calendar, Apple Calendar หรือ MS Outlook"
              >
                <Calendar className="w-3.5 h-3.5 text-rose-600" />
                <span>{t("facility.action.exportIcs")}</span>
              </Button>

              {canManage && booking.status === "CONFIRMED" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={submitting}
                  className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs"
                >
                  {t("facility.action.cancel")}
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                ปิด
              </Button>

              {canManage && booking.status === "PENDING" && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateStatus("REJECTED")}
                    disabled={submitting}
                    className="text-slate-600 border-slate-300 hover:bg-slate-50 text-xs"
                  >
                    {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : t("facility.action.reject")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleUpdateStatus("CONFIRMED")}
                    disabled={submitting}
                    className="bg-rose-700 hover:bg-rose-800 text-white text-xs"
                  >
                    {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                    {t("facility.action.approve")}
                  </Button>
                </>
              )}
            </div>
          </div>
        </LiyonDialogFooter>
      </div>
    </LiyonDialog>
  );
}
