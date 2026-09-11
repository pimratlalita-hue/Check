"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Check,
  ArrowRight,
  Loader2,
  FileText,
  AlertTriangle,
  Lightbulb,
  Tag,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/shared/lib/i18n/client";
import { Button } from "@/components/ui/button";
import type { ConceptNoteSummaryResult } from "../_internal/schemas";
import { summarizeConceptNoteAction } from "../actions";

interface ConceptNoteSummarizerWidgetProps {
  title: string;
  description: string;
  onApplySummary?: (summary: string) => void;
  className?: string;
}

export function ConceptNoteSummarizerWidget({
  title,
  description,
  onApplySummary,
  className,
}: ConceptNoteSummarizerWidgetProps) {
  const t = useT();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ConceptNoteSummaryResult | null>(null);
  const [expanded, setExpanded] = useState(false);

  const handleSummarize = async () => {
    const cleanTitle = (title || "").trim();
    const cleanDesc = (description || "").trim();

    if (!cleanTitle && !cleanDesc) {
      toast.error("กรุณาระบุหัวข้อวิทยานิพนธ์หรือรายละเอียดเบื้องต้นก่อนขอสรุป");
      return;
    }

    setLoading(true);
    try {
      const res = await summarizeConceptNoteAction({
        title: cleanTitle || "ข้อเสนอโครงการวิจัยวิทยานิพนธ์",
        description: cleanDesc || cleanTitle,
      });

      if (res.ok) {
        setResult(res.data);
        setExpanded(true);
        toast.success("Gemini AI สรุปสาระสำคัญของโครงร่างวิจัยเรียบร้อยแล้ว");
      } else {
        toast.error(res.error.message || "ไม่สามารถประมวลผลได้ในขณะนี้");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!result || !onApplySummary) return;
    onApplySummary(result.summary);
    toast.success("นำบทสรุปไปใส่ในรายละเอียดเรียบร้อยแล้ว");
    setExpanded(false);
  };

  const canSummarize = (title && title.trim().length >= 3) || (description && description.trim().length >= 10);

  return (
    <div className={`pt-2 ${className ?? ""}`}>
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSummarize}
          disabled={loading || !canSummarize}
          className="h-8 px-3 text-xs bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 border-rose-200 hover:bg-rose-100 hover:text-rose-800 flex items-center gap-1.5 shadow-2xs font-medium"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
              <span>{t("ai.summarizing")}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              <span>{t("ai.summarizeProposal")}</span>
            </>
          )}
        </Button>

        {result && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
          >
            <span>{expanded ? "ซ่อนบทสรุป AI" : "ดูบทสรุป AI"}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Result Display Card */}
      {result && expanded && (
        <div className="mt-3 p-4 bg-gradient-to-br from-rose-50/70 via-white to-pink-50/50 border border-rose-200/80 rounded-xl shadow-xs space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
          {/* Executive Summary Section */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-900">
              <FileText className="w-3.5 h-3.5 text-rose-600" />
              <span>{t("ai.conceptSummary")}</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed bg-white/80 p-3 rounded-lg border border-rose-100">
              {result.summary}
            </p>
          </div>

          {/* Suggested Methodology */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>{t("ai.suggestedMethodology")}</span>
            </div>
            <div className="text-xs text-slate-700 bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/60 leading-relaxed">
              {result.suggestedMethodology}
            </div>
          </div>

          {/* Potential Challenges */}
          {result.potentialChallenges && result.potentialChallenges.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                <span>{t("ai.potentialChallenges")}</span>
              </div>
              <ul className="space-y-1 text-xs text-slate-600 list-disc list-inside bg-white/70 p-2.5 rounded-lg border border-slate-200">
                {result.potentialChallenges.map((challenge, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {challenge}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Academic Keywords */}
          {result.keywords && result.keywords.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                <span>{t("ai.keywords")}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-medium bg-rose-100/70 text-rose-800 border border-rose-200"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Footer */}
          {onApplySummary && (
            <div className="pt-2 border-t border-rose-100 flex justify-end">
              <Button
                type="button"
                size="sm"
                onClick={handleApply}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-8 px-3.5 flex items-center gap-1.5 shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{t("ai.applySummary")}</span>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
