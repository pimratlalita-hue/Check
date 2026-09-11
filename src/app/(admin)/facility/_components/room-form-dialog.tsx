"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useT } from "@/shared/lib/i18n/client";
import {
  LiyonDialog,
  LiyonDialogCloseButton,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type { FacilityRoomDto, RoomType } from "@/features/facility";
import { createRoomAction, updateRoomAction } from "@/features/facility/actions";

interface RoomFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: FacilityRoomDto | null;
  onSuccess: () => void;
}

interface RoomFormInnerProps {
  room: FacilityRoomDto | null;
  onClose: () => void;
  onSuccess: () => void;
}

function RoomFormInner({ room, onClose, onSuccess }: RoomFormInnerProps) {
  const t = useT();
  const [submitting, setSubmitting] = useState(false);

  const [code, setCode] = useState(room?.code ?? "");
  const [nameTh, setNameTh] = useState(room?.nameTh ?? "");
  const [nameEn, setNameEn] = useState(room?.nameEn ?? "");
  const [building, setBuilding] = useState(room?.building ?? "อาคารวิจัยและบัณฑิตศึกษา");
  const [floor, setFloor] = useState(room?.floor ?? 1);
  const [capacity, setCapacity] = useState(room?.capacity ?? 20);
  const [type, setType] = useState<RoomType>(room?.type ?? "EXAM_ROOM");
  const [facilitiesInput, setFacilitiesInput] = useState(
    room?.facilities ? room.facilities.join(", ") : "Projector, Zoom Room, Whiteboard"
  );
  const [imageUrl, setImageUrl] = useState(room?.imageUrl ?? "");
  const [description, setDescription] = useState(room?.description ?? "");
  const [isActive, setIsActive] = useState(room?.isActive ?? true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const facilities = facilitiesInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      if (room) {
        // Edit Mode
        const res = await updateRoomAction({
          id: room.id,
          code,
          nameTh,
          nameEn,
          building,
          floor,
          capacity,
          type,
          facilities,
          imageUrl: imageUrl || null,
          description: description || null,
          isActive,
        });

        if (res.ok) {
          toast.success(t("facility.roomUpdatedSuccess"));
          onClose();
          onSuccess();
        } else {
          toast.error(res.error.message || "เกิดข้อผิดพลาดในการบันทึก");
        }
      } else {
        // Create Mode
        const res = await createRoomAction({
          code,
          nameTh,
          nameEn,
          building,
          floor,
          capacity,
          type,
          facilities,
          imageUrl: imageUrl || null,
          description: description || null,
          isActive,
        });

        if (res.ok) {
          toast.success(t("facility.roomCreatedSuccess"));
          onClose();
          onSuccess();
        } else {
          toast.error(res.error.message || "เกิดข้อผิดพลาดในการบันทึก");
        }
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <LiyonDialogCloseButton label="ปิด" />
      <LiyonDialogHeader
        title={room ? t("facility.editRoom") : t("facility.createRoom")}
        description={room ? `${room.code} - ${room.nameTh}` : "เพิ่มห้องสอบ ห้องประชุม หรือแล็บใหม่ในระบบ"}
      />

      <LiyonDialogBody>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("facility.roomCode")} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="เช่น R-501"
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("facility.col.type")} <span className="text-rose-500">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as RoomType)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
              >
                <option value="EXAM_ROOM">{t("facility.roomType.EXAM_ROOM")}</option>
                <option value="MEETING_ROOM">{t("facility.roomType.MEETING_ROOM")}</option>
                <option value="LAB">{t("facility.roomType.LAB")}</option>
                <option value="AUDITORIUM">{t("facility.roomType.AUDITORIUM")}</option>
                <option value="SMART_CLASSROOM">{t("facility.roomType.SMART_CLASSROOM")}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("facility.roomNameTh")} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nameTh}
                onChange={(e) => setNameTh(e.target.value)}
                placeholder="เช่น ห้องสอบวิทยานิพนธ์ 1"
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("facility.roomNameEn")} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. Thesis Defense Room 1"
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("facility.building")} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                placeholder="เช่น อาคาร 3"
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("facility.floor")}
              </label>
              <input
                type="number"
                value={floor}
                onChange={(e) => setFloor(parseInt(e.target.value) || 1)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t("facility.capacity")} <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t("facility.facilitiesLabel")}
            </label>
            <input
              type="text"
              value={facilitiesInput}
              onChange={(e) => setFacilitiesInput(e.target.value)}
              placeholder="เช่น Projector, Zoom Room, Whiteboard (คั่นด้วยจุลภาค)"
              className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">คั่นอุปกรณ์แต่ละรายการด้วยเครื่องหมายจุลภาค (,)</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t("facility.imageUrl")}
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t("facility.descriptionLabel")}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="รายละเอียดเพิ่มเติมของห้อง..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
            />
            <label htmlFor="isActive" className="text-xs font-medium text-slate-700 cursor-pointer">
              {t("facility.statusLabel")} (เปิดให้จองใช้งาน)
            </label>
          </div>
        </div>
      </LiyonDialogBody>

      <LiyonDialogFooter>
        <div className="flex items-center justify-end gap-2 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={submitting}
          >
            ยกเลิก
          </Button>
          <Button
            type="submit"
            className="bg-rose-700 hover:bg-rose-800 text-white"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              "บันทึกข้อมูล"
            )}
          </Button>
        </div>
      </LiyonDialogFooter>
    </form>
  );
}

export function RoomFormDialog({
  open,
  onOpenChange,
  room,
  onSuccess,
}: RoomFormDialogProps) {
  return (
    <LiyonDialog open={open} onOpenChange={onOpenChange} wide>
      {open && (
        <RoomFormInner
          key={room ? room.id : "new"}
          room={room}
          onClose={() => onOpenChange(false)}
          onSuccess={onSuccess}
        />
      )}
    </LiyonDialog>
  );
}
