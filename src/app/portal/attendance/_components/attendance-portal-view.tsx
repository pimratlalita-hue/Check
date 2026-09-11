"use client";

import React, { useState } from "react";
import {
  ScanFace,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  User,
  GraduationCap,
  Sparkles,
  RefreshCw,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/shared/lib/i18n/client";
import { Button } from "@/components/ui/button";
import {
  FaceScannerModal,
  type ExamTypeType,
} from "@/features/biometrics";

export function AttendancePortalView() {
  const t = useT();

  const [studentCode, setStudentCode] = useState("");
  const [studentName, setStudentName] = useState("");
  const [examType, setExamType] = useState<ExamTypeType>("PROPOSAL_DEFENSE");

  const [scannerOpen, setScannerOpen] = useState(false);
  const [verifiedRecord, setVerifiedRecord] = useState<any | null>(null);

  const handleStartScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentCode.trim() || !studentName.trim()) {
      toast.error("กรุณาระบุรหัสนิสิตและชื่อ-นามสกุลให้ครบถ้วน");
      return;
    }
    setScannerOpen(true);
  };

  const handleReset = () => {
    setVerifiedRecord(null);
    setStudentCode("");
    setStudentName("");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Banner */}
      <div className="relative rounded-3xl bg-linear-to-r from-rose-600 via-rose-500 to-slate-800 p-8 text-white shadow-xl overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10">
          <ScanFace className="w-64 h-64" />
        </div>
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md">
            <ShieldCheck className="w-4 h-4" />
            <span>PDPA Compliant Biometric Check-in</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t("biometrics.portalTitle")}
          </h1>
          <p className="text-rose-100 text-sm leading-relaxed">
            {t("biometrics.portalSubtitle")}
          </p>
        </div>
      </div>

      {/* Main Check-in Card */}
      {verifiedRecord ? (
        /* Verified Receipt Card */
        <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-8 shadow-lg text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full">
              {t("biometrics.statusVerified")}
            </span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white pt-2">
              {t("biometrics.verifiedSuccess")}
            </h2>
            <p className="text-sm text-slate-500">
              บันทึกการเข้าสอบวิทยานิพนธ์ของท่านเข้าสู่ระบบเรียบร้อยแล้ว
            </p>
          </div>

          {/* Details Table */}
          <div className="max-w-md mx-auto bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700/60 text-xs text-left space-y-2.5 font-medium">
            <div className="flex justify-between border-b border-slate-200 dark:border-slate-700/50 pb-2">
              <span className="text-slate-500">{t("biometrics.studentName")}:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {verifiedRecord.studentName}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200 dark:border-slate-700/50 pb-2">
              <span className="text-slate-500">{t("biometrics.studentCode")}:</span>
              <span className="font-mono text-rose-600 dark:text-rose-400">
                {verifiedRecord.studentCode}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200 dark:border-slate-700/50 pb-2">
              <span className="text-slate-500">{t("biometrics.examType")}:</span>
              <span className="text-slate-700 dark:text-slate-200">
                {t(`biometrics.exam${verifiedRecord.examType === "FINAL_DEFENSE" ? "Final" : verifiedRecord.examType === "COMPREHENSIVE" ? "Comprehensive" : "Proposal"}`)}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200 dark:border-slate-700/50 pb-2">
              <span className="text-slate-500">{t("biometrics.confidenceScore")}:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {verifiedRecord.confidenceScore}%
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200 dark:border-slate-700/50 pb-2">
              <span className="text-slate-500">{t("biometrics.verifiedAt")}:</span>
              <span className="text-slate-600 dark:text-slate-300">
                {new Date(verifiedRecord.verifiedAt).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-500">{t("biometrics.faceHash")}:</span>
              <span className="font-mono text-[11px] text-slate-400 truncate max-w-[180px]">
                {verifiedRecord.faceHash}
              </span>
            </div>
          </div>

          <div className="p-3 bg-rose-50 dark:bg-rose-950/20 rounded-xl text-xs text-rose-900 dark:text-rose-200 max-w-md mx-auto">
            📌 กรุณาแสดงหน้านี้แก่คณะกรรมการคุมสอบก่อนเริ่มการสอบปากเปล่าหรือการนำเสนอเค้าโครง
          </div>

          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-xs border-slate-300"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              เช็คชื่อนิสิตท่านอื่น
            </Button>
          </div>
        </div>
      ) : (
        /* Form Card */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="h-5 w-5 text-rose-600" />
              ข้อมูลผู้เข้าสอบ
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              กรอกข้อมูลส่วนบุคคลเพื่อเปิดใช้งานกล้องสแกนยืนยันตัวตน
            </p>
          </div>

          <form onSubmit={handleStartScan} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t("biometrics.studentCode")} *
                </label>
                <input
                  type="text"
                  required
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  placeholder="เช่น 6570012345"
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t("biometrics.studentName")} *
                </label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="เช่น นายธนากร มั่นคง"
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t("biometrics.examType")} *
              </label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value as ExamTypeType)}
                className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="PROPOSAL_DEFENSE">{t("biometrics.examProposal")}</option>
                <option value="FINAL_DEFENSE">{t("biometrics.examFinal")}</option>
                <option value="COMPREHENSIVE">{t("biometrics.examComprehensive")}</option>
              </select>
            </div>

            {/* PDPA Reminder Box */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-rose-600" />
                การคุ้มครองข้อมูลส่วนบุคคล (PDPA Protection)
              </div>
              <p className="leading-relaxed">
                ระบบคำนวณและส่งต่อเฉพาะข้อความแฮช (Synthetic Landmark Text Hash) บนเครื่องของท่านโดยตรงเท่านั้น ไม่มีการบันทึกภาพถ่ายจริงหรือไฟล์วิดีโอใดๆ ทั้งสิ้น
              </p>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-sm shadow-md flex items-center justify-center gap-2"
              >
                <ScanFace className="h-4 w-4" />
                เริ่มสแกนใบหน้าเพื่อยืนยันตัวตน
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Face Scanner Modal */}
      <FaceScannerModal
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        candidate={{
          studentCode,
          studentName,
          examType,
        }}
        onSuccess={(record) => {
          setVerifiedRecord(record);
        }}
      />
    </div>
  );
}
