"use client";

import React, { useState } from "react";
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Loader2,
  Trash2,
  Sparkles,
  ShieldAlert,
  Server,
  Calendar,
  Users,
  GraduationCap,
  Layers,
  ScanFace,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/shared/lib/i18n/client";
import { Button } from "@/components/ui/button";
import {
  LiyonDialog,
  LiyonDialogCloseButton,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  StatusPill,
} from "@/shared/components/liyon";
import type { SystemDataStats, GtmtsBackupPayload } from "@/features/backup";
import {
  getBackupStatsAction,
  exportBackupAction,
  validateBackupAction,
  importBackupAction,
  systemWipeAction,
} from "@/features/backup/actions";

interface BackupClientProps {
  initialStats: SystemDataStats;
  canExport: boolean;
  canImport: boolean;
  canWipe: boolean;
}

export function BackupClient({
  initialStats,
  canExport,
  canImport,
  canWipe,
}: BackupClientProps) {
  const t = useT();

  const [stats, setStats] = useState<SystemDataStats>(initialStats);
  const [refreshingStats, setRefreshingStats] = useState(false);

  // Export State
  const [exporting, setExporting] = useState(false);

  // Import State
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importJsonString, setImportJsonString] = useState<string>("");
  const [importPreview, setImportPreview] = useState<GtmtsBackupPayload | null>(null);
  const [importMode, setImportMode] = useState<"replace" | "merge">("replace");
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);

  // Factory Reset / Wipe State
  const [wipeModalOpen, setWipeModalOpen] = useState(false);
  const [wipeMode, setWipeMode] = useState<"seed" | "clean">("seed");
  const [confirmationInput, setConfirmationInput] = useState("");
  const [wiping, setWiping] = useState(false);

  // Refresh System Stats
  const handleRefreshStats = async () => {
    setRefreshingStats(true);
    try {
      const res = await getBackupStatsAction();
      if (res.ok) {
        setStats(res.data);
        toast.success("อัปเดตข้อมูลสถิติปัจจุบันเรียบร้อยแล้ว");
      }
    } catch {
      toast.error("ไม่สามารถดึงข้อมูลสถิติได้");
    } finally {
      setRefreshingStats(false);
    }
  };

  // Export Backup File
  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await exportBackupAction();
      if (res.ok) {
        const jsonStr = JSON.stringify(res.data, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const dateStr = new Date().toISOString().split("T")[0];
        a.href = url;
        a.download = `gtmts_backup_${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success(t("backup.exportSuccess"));
      } else {
        toast.error(res.error.message || "Failed to export backup");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred during export");
    } finally {
      setExporting(false);
    }
  };

  // Handle File Selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setValidating(true);
    setImportPreview(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      setImportJsonString(content);

      try {
        const res = await validateBackupAction(content);
        if (res.ok) {
          setImportPreview(res.data);
          toast.success(t("backup.importValidationSuccess"));
        } else {
          toast.error(res.error.message || "โครงสร้างไฟล์ JSON ไม่ถูกต้อง");
        }
      } catch (err: any) {
        toast.error(err.message || "เกิดข้อผิดพลาดในการตรวจสอบไฟล์");
      } finally {
        setValidating(false);
      }
    };
    reader.readAsText(file);
  };

  // Execute Import
  const handleExecuteImport = async () => {
    if (!importJsonString) return;

    setImporting(true);
    try {
      const res = await importBackupAction({
        jsonString: importJsonString,
        mode: importMode,
      });

      if (res.ok) {
        toast.success(res.data.message);
        setImportFile(null);
        setImportJsonString("");
        setImportPreview(null);
        await handleRefreshStats();
      } else {
        toast.error(res.error.message || "Failed to import backup");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred during import");
    } finally {
      setImporting(false);
    }
  };

  // Execute System Wipe / Factory Reset
  const handleExecuteWipe = async () => {
    setWiping(true);
    try {
      const res = await systemWipeAction({
        mode: wipeMode,
        confirmationText: confirmationInput.trim(),
      });

      if (res.ok) {
        toast.success(res.data.message);
        setWipeModalOpen(false);
        setConfirmationInput("");
        await handleRefreshStats();
      } else {
        toast.error(res.error.message || "Failed to wipe data");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred during factory reset");
    } finally {
      setWiping(false);
    }
  };

  const isConfirmationValid =
    confirmationInput.trim() === "CONFIRM_WIPE" || confirmationInput.trim() === "RESET";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 shadow-2xs">
              <Database className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {t("backup.title")}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t("backup.subtitle")}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleRefreshStats}
          disabled={refreshingStats}
          className="text-xs h-8 gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshingStats ? "animate-spin" : ""}`} />
          <span>รีเฟรชสถิติ</span>
        </Button>
      </div>

      {/* System Data Summary Cards */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Server className="w-4 h-4 text-rose-600" />
            <span>{t("backup.statsSummary")}</span>
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">
            Active Tenant Snapshot
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>{t("backup.statsNews")}</span>
            </div>
            <div className="text-lg font-bold text-slate-800 mt-0.5">{stats.newsCount}</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{t("backup.statsStaff")}</span>
            </div>
            <div className="text-lg font-bold text-slate-800 mt-0.5">{stats.staffCount}</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
              <span>{t("backup.statsPrograms")}</span>
            </div>
            <div className="text-lg font-bold text-slate-800 mt-0.5">{stats.programsCount}</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>{t("backup.statsPetitions")}</span>
            </div>
            <div className="text-lg font-bold text-slate-800 mt-0.5">{stats.petitionsCount}</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{t("backup.statsRooms")}</span>
            </div>
            <div className="text-lg font-bold text-slate-800 mt-0.5">{stats.roomsCount}</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{t("backup.statsBookings")}</span>
            </div>
            <div className="text-lg font-bold text-slate-800 mt-0.5">{stats.bookingsCount}</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
              <ScanFace className="w-3.5 h-3.5 text-slate-400" />
              <span>{t("backup.statsAttendance")}</span>
            </div>
            <div className="text-lg font-bold text-slate-800 mt-0.5">{stats.attendanceCount}</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
              <Server className="w-3.5 h-3.5 text-slate-400" />
              <span>ภาควิชา / สังกัด</span>
            </div>
            <div className="text-lg font-bold text-slate-800 mt-0.5">{stats.departmentsCount}</div>
          </div>
        </div>
      </div>

      {/* Main Operations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Export Data */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="inline-flex p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {t("backup.exportCardTitle")}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t("backup.exportCardDesc")}
            </p>
          </div>

          <div className="pt-2">
            <Button
              type="button"
              onClick={handleExport}
              disabled={exporting || !canExport}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold h-9 shadow-xs"
            >
              {exporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  <span>{t("backup.exporting")}</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  <span>{t("backup.exportButton")}</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Card 2: Import & Restore Data */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="inline-flex p-2.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {t("backup.importCardTitle")}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t("backup.importCardDesc")}
            </p>
          </div>

          {/* File Input Box */}
          <div className="space-y-3">
            <div className="border-2 border-dashed border-slate-200 hover:border-rose-400 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-50/50">
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
                id="backup-file-upload"
              />
              <label htmlFor="backup-file-upload" className="cursor-pointer block space-y-1">
                <FileText className="w-6 h-6 text-slate-400 mx-auto" />
                <div className="text-xs font-semibold text-slate-700">
                  {importFile ? importFile.name : t("backup.importSelectFile")}
                </div>
                <div className="text-[11px] text-slate-400">
                  {importFile
                    ? `${(importFile.size / 1024).toFixed(1)} KB`
                    : t("backup.importDragDrop")}
                </div>
              </label>
            </div>

            {validating && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 py-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                <span>กำลังตรวจสอบความถูกต้องของ Schema...</span>
              </div>
            )}

            {/* Preview Box */}
            {importPreview && (
              <div className="p-3 bg-sky-50/60 border border-sky-200 rounded-lg text-xs space-y-2">
                <div className="flex items-center justify-between font-semibold text-sky-900">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{t("backup.previewTitle")}</span>
                  </span>
                  <span className="text-[11px] text-sky-600">
                    v{importPreview.meta.version}
                  </span>
                </div>
                <div className="text-[11px] text-sky-800 space-y-0.5 font-mono">
                  <div>ระบบ: {importPreview.meta.system}</div>
                  <div>ส่งออกเมื่อ: {new Date(importPreview.meta.exportedAt).toLocaleString("th-TH")}</div>
                </div>

                {/* Import Mode Selection */}
                <div className="pt-2 border-t border-sky-200/80 space-y-1.5">
                  <label className="text-[11px] font-bold text-sky-900 block">
                    {t("backup.importModeLabel")}
                  </label>
                  <div className="space-y-1 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="importMode"
                        value="replace"
                        checked={importMode === "replace"}
                        onChange={() => setImportMode("replace")}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span className="font-medium text-slate-800">
                        {t("backup.importModeReplace")}
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="importMode"
                        value="merge"
                        checked={importMode === "merge"}
                        onChange={() => setImportMode("merge")}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span className="text-slate-600">
                        {t("backup.importModeMerge")}
                      </span>
                    </label>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleExecuteImport}
                  disabled={importing || !canImport}
                  className="w-full mt-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold h-8"
                >
                  {importing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                      <span>{t("backup.importing")}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1" />
                      <span>{t("backup.importButton")}</span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card 3: Danger Zone / Safe Wipe */}
      <div className="border border-red-200 rounded-xl p-6 bg-linear-to-r from-red-50/50 via-white to-rose-50/30 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <h3 className="text-base font-bold text-red-950">
                {t("backup.wipeCardTitle")}
              </h3>
            </div>
            <p className="text-xs text-red-700/80 leading-relaxed max-w-2xl">
              {t("backup.wipeCardDesc")}
            </p>
          </div>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => setWipeModalOpen(true)}
            disabled={!canWipe}
            className="text-xs font-semibold h-9 px-4 self-start sm:self-auto bg-red-600 hover:bg-red-700 shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            <span>{t("backup.wipeButton")}</span>
          </Button>
        </div>
      </div>

      {/* Safe Factory Reset Modal */}
      <LiyonDialog open={wipeModalOpen} onOpenChange={setWipeModalOpen}>
        <LiyonDialogCloseButton label="ปิด" />
        <LiyonDialogHeader
          title={t("backup.wipeModalTitle")}
          description={t("backup.wipeModalDesc")}
        />

        <LiyonDialogBody>
          <div className="space-y-4 text-xs">
            {/* Warning Banner */}
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 text-red-800 border border-red-200">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold">คำเตือนด้านความปลอดภัย:</span> ข้อมูลคำร้องวิทยานิพนธ์, การจองห้องสอบ, ประวัติเข้าสอบชีวมิติ, และข่าวสารทั้งหมดจะถูกดำเนินการตามโหมดที่ท่านเลือก
              </div>
            </div>

            {/* Mode Selection */}
            <div className="space-y-2">
              <label className="font-bold text-slate-800 block">
                {t("backup.wipeModeLabel")}
              </label>
              <div className="space-y-2">
                <label
                  onClick={() => setWipeMode("seed")}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${
                    wipeMode === "seed"
                      ? "border-rose-500 bg-rose-50/40 text-rose-950 font-medium"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="wipeMode"
                    value="seed"
                    checked={wipeMode === "seed"}
                    onChange={() => setWipeMode("seed")}
                    className="mt-0.5 text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <div className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                      <span>{t("backup.wipeModeSeed")}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      ล้างข้อมูลเก่าแล้วสร้างชุดข้อมูลตัวอย่างมาตรฐานบัณฑิตศึกษา (อาจารย์, ภาควิชา, หลักสูตร, นิสิต 10+ คน, ตารางสอบ) ทันที
                    </p>
                  </div>
                </label>

                <label
                  onClick={() => setWipeMode("clean")}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${
                    wipeMode === "clean"
                      ? "border-red-500 bg-red-50/40 text-red-950 font-medium"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="wipeMode"
                    value="clean"
                    checked={wipeMode === "clean"}
                    onChange={() => setWipeMode("clean")}
                    className="mt-0.5 text-red-600 focus:ring-red-500"
                  />
                  <div>
                    <div className="font-bold flex items-center gap-1.5 text-red-700">
                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      <span>{t("backup.wipeModeClean")}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      ล้างข้อมูลธุรกรรมทั้งหมดให้เป็นค่าว่างเปล่า (คงเหลือเฉพาะบัญชีผู้ดูแลระบบเพื่อเข้าสู่ระบบ)
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Confirmation Text Input */}
            <div className="space-y-1.5 pt-1">
              <label className="font-bold text-slate-800 block">
                {t("backup.wipeConfirmationLabel")}
              </label>
              <input
                type="text"
                value={confirmationInput}
                onChange={(e) => setConfirmationInput(e.target.value)}
                placeholder={t("backup.wipeConfirmationPlaceholder")}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>
          </div>
        </LiyonDialogBody>

        <LiyonDialogFooter>
          <div className="flex items-center justify-end gap-2 w-full pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setWipeModalOpen(false);
                setConfirmationInput("");
              }}
              className="text-xs"
            >
              ยกเลิก
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleExecuteWipe}
              disabled={wiping || !isConfirmationValid}
              className="text-xs font-semibold px-4 bg-red-600 hover:bg-red-700 text-white"
            >
              {wiping ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  <span>{t("backup.wipeExecuting")}</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  <span>ยืนยันดำเนินการล้าง/รีเซ็ต</span>
                </>
              )}
            </Button>
          </div>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
