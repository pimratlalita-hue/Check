"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileCheck,
  BookOpen,
  Award,
} from "lucide-react";
import { useT } from "@/shared/lib/i18n/client";
import {
  evaluateThesisPrerequisites,
  type DegreeLevel,
  type EnglishTestType,
  type PublicationType,
  type ThesisPrerequisitesResult,
  ENGLISH_MIN_SCORES,
} from "../_internal/services/prerequisite.service";

interface ThesisPrerequisiteWidgetProps {
  degreeLevel?: DegreeLevel;
  onValidityChange?: (valid: boolean, result: ThesisPrerequisitesResult) => void;
  className?: string;
  readOnly?: boolean;
}

export function ThesisPrerequisiteWidget({
  degreeLevel = "MASTER",
  onValidityChange,
  className,
  readOnly = false,
}: ThesisPrerequisiteWidgetProps) {
  const t = useT();

  const [level, setLevel] = useState<DegreeLevel>(degreeLevel);
  const [englishTestType, setEnglishTestType] = useState<EnglishTestType>("CU_TEP");
  const [englishScore, setEnglishScore] = useState<number>(75);
  const [publicationType, setPublicationType] = useState<PublicationType>("TCI_TIER_1");

  const result = evaluateThesisPrerequisites({
    degreeLevel: level,
    englishTestType,
    englishScore,
    publicationType,
  });

  useEffect(() => {
    if (onValidityChange) {
      onValidityChange(result.passed, result);
    }
  }, [result.passed, result.englishPassed, result.publicationPassed]);

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        result.passed
          ? "bg-emerald-50/50 border-emerald-200"
          : "bg-amber-50/50 border-amber-200"
      } ${className ?? ""}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck
            className={`w-4 h-4 ${result.passed ? "text-emerald-600" : "text-amber-600"}`}
          />
          <h4 className="font-semibold text-xs text-slate-900">
            {t("workflow.prereq.title")}
          </h4>
        </div>
        <span
          className={`inline-flex items-center gap-1 text-2xs px-2 py-0.5 rounded-full font-semibold border ${
            result.passed
              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
              : "bg-amber-100 text-amber-800 border-amber-300"
          }`}
        >
          {result.passed ? (
            <>
              <CheckCircle2 className="w-3 h-3" />
              <span>{t("workflow.prereq.passed")}</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-3 h-3" />
              <span>{t("workflow.prereq.notPassed")}</span>
            </>
          )}
        </span>
      </div>

      {/* Input Controls (if not readOnly) */}
      {!readOnly && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 bg-white/80 p-3 rounded-lg border border-slate-200 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              {t("workflow.prereq.degreeLevel")}
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as DegreeLevel)}
              className="w-full h-8 px-2 rounded-md border border-slate-200 text-xs bg-white focus:ring-1 focus:ring-rose-500"
            >
              <option value="MASTER">ปริญญาโท (Master&apos;s Degree)</option>
              <option value="DOCTORAL">ปริญญาเอก (Doctoral / Ph.D.)</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              {t("workflow.prereq.englishTest")}
            </label>
            <select
              value={englishTestType}
              onChange={(e) => {
                const test = e.target.value as EnglishTestType;
                setEnglishTestType(test);
                if (test === "IELTS") setEnglishScore(6.0);
                else if (test === "TOEFL_ITP") setEnglishScore(550);
                else if (test === "TOEFL_IBT") setEnglishScore(79);
                else if (test === "CU_TEP" || test === "TU_GET") setEnglishScore(75);
                else setEnglishScore(0);
              }}
              className="w-full h-8 px-2 rounded-md border border-slate-200 text-xs bg-white focus:ring-1 focus:ring-rose-500"
            >
              <option value="CU_TEP">CU-TEP (เกณฑ์ขั้นต่ำ 75)</option>
              <option value="TOEFL_IBT">TOEFL iBT (เกณฑ์ขั้นต่ำ 79)</option>
              <option value="TOEFL_ITP">TOEFL ITP (เกณฑ์ขั้นต่ำ 550)</option>
              <option value="IELTS">IELTS Academic (เกณฑ์ขั้นต่ำ 6.0)</option>
              <option value="TU_GET">TU-GET (เกณฑ์ขั้นต่ำ 75)</option>
              <option value="EXEMPT">ได้รับการยกเว้นตามระเบียบ</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              {t("workflow.prereq.englishScore")}
            </label>
            <input
              type="number"
              step="any"
              disabled={englishTestType === "EXEMPT"}
              value={englishScore}
              onChange={(e) => setEnglishScore(parseFloat(e.target.value) || 0)}
              className="w-full h-8 px-2 rounded-md border border-slate-200 text-xs bg-white focus:ring-1 focus:ring-rose-500 disabled:bg-slate-100"
            />
          </div>
        </div>
      )}

      {/* Publication selector (if not readOnly) */}
      {!readOnly && (
        <div className="mb-3 bg-white/80 p-3 rounded-lg border border-slate-200 text-xs">
          <label className="block font-medium text-slate-700 mb-1">
            {t("workflow.prereq.publication")}
          </label>
          <select
            value={publicationType}
            onChange={(e) => setPublicationType(e.target.value as PublicationType)}
            className="w-full h-8 px-2 rounded-md border border-slate-200 text-xs bg-white focus:ring-1 focus:ring-rose-500"
          >
            <option value="SCOPUS_ISI_JOURNAL">
              วารสารวิชาการระดับนานาชาติ (Scopus / ISI Web of Science) - ผ่านทุกระดับ
            </option>
            <option value="TCI_TIER_1">
              วารสารวิชาการระดับชาติ TCI กลุ่มที่ 1 (ผ่านเฉพาะปริญญาโท)
            </option>
            <option value="INTERNATIONAL_CONFERENCE">
              เอกสารการประชุมวิชาการระดับนานาชาติ (International Conference Proceedings)
            </option>
            <option value="NONE">ยังไม่มีผลงานตีพิมพ์ / อยู่ระหว่างเตรียมต้นฉบับ</option>
          </select>
        </div>
      )}

      {/* Verification Status Feedback Cards */}
      <div className="space-y-2 text-xs">
        {/* English Status */}
        <div
          className={`flex items-start gap-2 p-2.5 rounded-lg border ${
            result.englishPassed
              ? "bg-white/80 border-emerald-200 text-emerald-900"
              : "bg-white/80 border-rose-200 text-rose-900"
          }`}
        >
          {result.englishPassed ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="leading-tight">
            <span className="font-semibold">เกณฑ์ภาษาอังกฤษ: </span>
            <span>{result.englishDetails}</span>
          </div>
        </div>

        {/* Publication Status */}
        <div
          className={`flex items-start gap-2 p-2.5 rounded-lg border ${
            result.publicationPassed
              ? "bg-white/80 border-emerald-200 text-emerald-900"
              : "bg-white/80 border-rose-200 text-rose-900"
          }`}
        >
          {result.publicationPassed ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="leading-tight">
            <span className="font-semibold">เกณฑ์ผลงานตีพิมพ์: </span>
            <span>{result.publicationDetails}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
