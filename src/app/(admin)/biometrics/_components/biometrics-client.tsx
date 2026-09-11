"use client";

import React, { useState } from "react";
import {
  ScanFace,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Search,
  RefreshCw,
  Clock,
  ShieldCheck,
  Camera,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/shared/lib/i18n/client";
import {
  LiyonCard,
  StatusPill,
  type StatusPillTone,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import {
  FaceScannerModal,
  type AttendanceStatusType,
  type ExamTypeType,
} from "@/features/biometrics";
import {
  listAttendancesAction,
  getDailyAttendanceStatsAction,
  updateAttendanceStatusAction,
} from "@/features/biometrics/actions";

interface BiometricsClientProps {
  initialStats: {
    date: string;
    total: number;
    verified: number;
    flagged: number;
    manual: number;
    avgConfidence: number;
  };
  initialAttendances: {
    items: any[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  canVerify: boolean;
}

export function BiometricsClient({
  initialStats,
  initialAttendances,
  canVerify,
}: BiometricsClientProps) {
  const t = useT();
  const [stats, setStats] = useState(initialStats);
  const [attendances, setAttendances] = useState(initialAttendances.items);
  const [total, setTotal] = useState(initialAttendances.total);
  const [page, setPage] = useState(initialAttendances.page);
  const [totalPages, setTotalPages] = useState(initialAttendances.totalPages);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(false);

  // Scanner modal state
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerCandidate, setScannerCandidate] = useState<{
    studentCode: string;
    studentName: string;
    examType?: string;
  } | null>(null);

  // Manual Candidate input state for quick check-in modal
  const [manualCode, setManualCode] = useState("");
  const [manualName, setManualName] = useState("");
  const [manualExamType, setManualExamType] = useState<ExamTypeType>("PROPOSAL_DEFENSE");
  const [manualInputOpen, setManualInputOpen] = useState(false);

  const fetchAttendances = async (newPage = page) => {
    setIsLoading(true);
    try {
      const res = await listAttendancesAction({
        search: search || undefined,
        status: statusFilter === "ALL" ? undefined : (statusFilter as AttendanceStatusType),
        page: newPage,
        pageSize: 20,
      });

      if (res.ok) {
        setAttendances(res.data.items);
        setTotal(res.data.total);
        setPage(res.data.page);
        setTotalPages(res.data.totalPages);
      } else {
        toast.error(res.error.message || "Failed to load attendances");
      }

      // Also refresh stats
      const statsRes = await getDailyAttendanceStatsAction();
      if (statsRes.ok) {
        setStats(statsRes.data);
      }
    } catch {
      toast.error("Failed to connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartScan = (candidateData?: {
    studentCode: string;
    studentName: string;
    examType?: string;
  }) => {
    if (candidateData) {
      setScannerCandidate(candidateData);
      setScannerOpen(true);
    } else {
      setManualInputOpen(true);
    }
  };

  const handleStartCustomScan = () => {
    if (!manualCode.trim() || !manualName.trim()) {
      toast.error("กรุณาระบุรหัสนิสิตและชื่อ-นามสกุล");
      return;
    }
    setScannerCandidate({
      studentCode: manualCode.trim(),
      studentName: manualName.trim(),
      examType: manualExamType,
    });
    setManualInputOpen(false);
    setScannerOpen(true);
  };

  const handleStatusOverride = async (id: string, newStatus: AttendanceStatusType) => {
    try {
      const res = await updateAttendanceStatusAction({
        id,
        status: newStatus,
        notes: "กรรมการคุมสอบทำการยืนยันตัวตนด้วยตนเอง (Manual Override)",
      });
      if (res.ok) {
        toast.success("อัปเดตสถานะสำเร็จ");
        fetchAttendances();
      } else {
        toast.error(res.error.message || "Cannot update status");
      }
    } catch {
      toast.error("An error occurred");
    }
  };

  const getStatusTone = (status: AttendanceStatusType): StatusPillTone => {
    switch (status) {
      case "VERIFIED":
        return "ok";
      case "FLAGGED":
        return "warn";
      case "MANUAL_OVERRIDE":
        return "info";
      default:
        return "off";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ScanFace className="h-7 w-7 text-rose-600 dark:text-rose-400" />
            {t("biometrics.title")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t("biometrics.subtitle")}
          </p>
        </div>

        {canVerify && (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleStartScan()}
              className="bg-rose-600 hover:bg-rose-700 text-white shadow-sm flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              {t("biometrics.scanCandidate")}
            </Button>
          </div>
        )}
      </div>

      {/* PDPA Banner */}
      <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/40 rounded-xl flex items-start gap-3 text-xs text-rose-900 dark:text-rose-200">
        <ShieldCheck className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold">PDPA Compliance Guaranteed:</span>{" "}
          {t("biometrics.pdpaNotice")}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <LiyonCard className="p-4 bg-white dark:bg-slate-900 border-slate-200/80">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t("biometrics.todayTotal")}</span>
            <Layers className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {stats.total}
          </div>
        </LiyonCard>

        <LiyonCard className="p-4 bg-white dark:bg-slate-900 border-slate-200/80">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t("biometrics.todayVerified")}</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats.verified}
          </div>
        </LiyonCard>

        <LiyonCard className="p-4 bg-white dark:bg-slate-900 border-slate-200/80">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t("biometrics.flaggedCount")}</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {stats.flagged}
          </div>
        </LiyonCard>

        <LiyonCard className="p-4 bg-white dark:bg-slate-900 border-slate-200/80">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t("biometrics.averageConfidence")}</span>
            <UserCheck className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">
            {stats.avgConfidence}%
          </div>
        </LiyonCard>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchAttendances(1)}
              placeholder={t("biometrics.searchPlaceholder")}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
            }}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
          >
            <option value="ALL">{t("biometrics.filterStatus")}</option>
            <option value="VERIFIED">{t("biometrics.statusVerified")}</option>
            <option value="FLAGGED">{t("biometrics.statusFlagged")}</option>
            <option value="MANUAL_OVERRIDE">{t("biometrics.statusManual")}</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAttendances(1)}
            disabled={isLoading}
            className="text-xs border-slate-200"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "กำลังโหลด..." : "ค้นหา / รีเฟรช"}
          </Button>
        </div>
      </div>

      {/* Manual Input Candidate Modal (Quick Check-in Helper) */}
      {manualInputOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Camera className="h-5 w-5 text-rose-600" />
              ระบุข้อมูลนิสิตเพื่อสแกนใบหน้า
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  {t("biometrics.studentCode")} *
                </label>
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="เช่น 6570012345"
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  {t("biometrics.studentName")} *
                </label>
                <input
                  type="text"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="เช่น นายธนากร มั่นคง"
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  {t("biometrics.examType")}
                </label>
                <select
                  value={manualExamType}
                  onChange={(e) => setManualExamType(e.target.value as ExamTypeType)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-1 focus:ring-rose-500"
                >
                  <option value="PROPOSAL_DEFENSE">{t("biometrics.examProposal")}</option>
                  <option value="FINAL_DEFENSE">{t("biometrics.examFinal")}</option>
                  <option value="COMPREHENSIVE">{t("biometrics.examComprehensive")}</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setManualInputOpen(false)}
                className="text-xs"
              >
                ยกเลิก
              </Button>
              <Button
                size="sm"
                onClick={handleStartCustomScan}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs"
              >
                เปิดกล้องสแกน
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Face Scanner Modal */}
      <FaceScannerModal
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        candidate={scannerCandidate}
        onSuccess={() => {
          fetchAttendances();
        }}
      />

      {/* Attendance Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold">
                <th className="p-3 pl-4">{t("biometrics.studentName")}</th>
                <th className="p-3">{t("biometrics.examType")}</th>
                <th className="p-3">{t("biometrics.status")}</th>
                <th className="p-3">{t("biometrics.confidenceScore")}</th>
                <th className="p-3">{t("biometrics.faceHash")}</th>
                <th className="p-3">{t("biometrics.verifiedAt")}</th>
                <th className="p-3 text-right pr-4">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {attendances.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <ScanFace className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium">{t("biometrics.noAttendances")}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {t("biometrics.noAttendancesDesc")}
                    </p>
                  </td>
                </tr>
              ) : (
                attendances.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="p-3 pl-4">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {item.studentName}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {item.studentCode}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {t(`biometrics.exam${item.examType === "FINAL_DEFENSE" ? "Final" : item.examType === "COMPREHENSIVE" ? "Comprehensive" : "Proposal"}`)}
                      </span>
                    </td>
                    <td className="p-3">
                      <StatusPill tone={getStatusTone(item.status)}>
                        {t(`biometrics.status${item.status === "VERIFIED" ? "Verified" : item.status === "FLAGGED" ? "Flagged" : "Manual"}`)}
                      </StatusPill>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.confidenceScore >= 80 ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                            style={{ width: `${item.confidenceScore}%` }}
                          />
                        </div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {item.confidenceScore}%
                        </span>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-500">
                      <span
                        title={item.faceHash}
                        className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded"
                      >
                        {item.faceHash.slice(0, 8)}...{item.faceHash.slice(-8)}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">
                      <div className="flex items-center gap-1 text-[11px]">
                        <Clock className="h-3 w-3" />
                        {new Date(item.verifiedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(item.verifiedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-3 text-right pr-4">
                      {item.status === "FLAGGED" && canVerify && (
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => handleStatusOverride(item.id, "MANUAL_OVERRIDE")}
                          className="text-[11px] h-7 border-amber-300 text-amber-700 hover:bg-amber-50"
                        >
                          อนุมัติด้วยตนเอง
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <div>
              หน้า {page} จาก {totalPages} (ทั้งหมด {total} รายการ)
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => fetchAttendances(page - 1)}
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => fetchAttendances(page + 1)}
                className="h-7 w-7 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
