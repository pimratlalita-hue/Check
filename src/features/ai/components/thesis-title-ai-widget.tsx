"use client";

import React, { useState } from "react";
import { Sparkles, Check, ArrowRight, Loader2, Info, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/shared/lib/i18n/client";
import { Button } from "@/components/ui/button";
import type { ThesisTitleValidationResult } from "../_internal/schemas";
import { validateThesisTitleAction } from "../actions";

interface ThesisTitleAiWidgetProps {
  titleTh: string;
  titleEn: string;
  onApply: (suggestedTh: string, suggestedEn: string) => void;
}

export function ThesisTitleAiWidget({
  titleTh,
  titleEn,
  onApply,
}: ThesisTitleAiWidgetProps) {
  const t = useT();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ThesisTitleValidationResult | null>(null);
  const [expanded, setExpanded] = useState(false);

  const handleValidate = async () => {
    if (!titleTh || titleTh.trim().length < 3) {
      toast.error("กรุณาระบุชื่อวิทยานิพนธ์ภาษาไทยอย่างน้อย 3 ตัวอักษร");
      return;
    }

    setLoading(true);
    try {
      const res = await validateThesisTitleAction({
        titleTh: titleTh.trim(),
        titleEn: titleEn.trim() || undefined,
      });

      if (res.ok) {
        setResult(res.data);
        setExpanded(true);
        toast.success("Gemini AI วิเคราะห์ชื่อวิทยานิพนธ์เรียบร้อยแล้ว");
      } else {
        toast.error(res.error.message || "ไม่สามารถวิเคราะห์ได้ในขณะนี้");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    onApply(result.suggestedTitleTh, result.suggestedTitleEn);
    toast.success("นำชื่อที่ AI แนะนำไปใส่ในแบบฟอร์มแล้ว");
    setExpanded(false);
  };

  return (
    <div className="pt-2">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleValidate}
          disabled={loading || !titleTh || titleTh.trim().length < 3}
          className="h-8 px-3 text-xs bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 border-rose-200 hover:bg-rose-100 hover:text-rose-800 flex items-center gap-1.5 shadow-2xs font-medium"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
              <span>{t("ai.validating")}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              <span>{t("ai.validateTitle")}</span>
            </>
          )}
        </Button>

        {result && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
          >
            <span>{expanded ? "ซ่อนผลการวิเคราะห์" : "ดูผลวิเคราะห์ AI"}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Result Card */}
      {result && expanded && (
        <div className="mt-3 p-4 bg-gradient-to-br from-rose-50/70 via-white to-pink-50/50 border border-rose-200/80 rounded-xl shadow-xs space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
          {/* Header & Score */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900">
                  {t("ai.title")}
                </span>
                <div className="text-[10px] text-slate-500">Gemini 1.5 Academic Evaluator</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
              <span>{t("ai.titleScore")}:</span>
              <span className="text-sm font-bold">{result.score}/100</span>
            </div>
          </div>

          {/* Suggestions */}
          <div className="space-y-2 pt-1">
            <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-1">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {t("ai.suggestionTh")}
              </div>
              <div className="text-xs font-medium text-slate-900 leading-relaxed">
                {result.suggestedTitleTh}
              </div>
            </div>

            <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-1">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {t("ai.suggestionEn")}
              </div>
              <div className="text-xs font-medium text-slate-900 leading-relaxed font-sans">
                {result.suggestedTitleEn}
              </div>
            </div>
          </div>

          {/* Alignment Analysis */}
          <div className="p-3 bg-white/80 border border-rose-100 rounded-lg space-y-1 text-xs text-slate-600 leading-relaxed">
            <div className="flex items-center gap-1 text-rose-700 font-semibold">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>{t("ai.feedbackTh")}</span>
            </div>
            <p className="text-[11px]">{result.alignmentAnalysis}</p>
          </div>

          {/* Grammar Notes */}
          {result.grammarNotes.length > 0 && (
            <div className="space-y-1">
              <div className="text-[11px] font-semibold text-slate-600">
                {t("ai.grammarNotes")}:
              </div>
              <ul className="text-[11px] text-slate-600 space-y-0.5 list-disc list-inside">
                {result.grammarNotes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Keywords */}
          {result.keywords.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-500">{t("ai.keywords")}:</span>
              {result.keywords.map((kw, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium"
                >
                  {kw}
                </span>
              ))}
            </div>
          )}

          {/* Action Bar */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-rose-100">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(false)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              {t("ai.close")}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleApply}
              className="bg-rose-700 hover:bg-rose-800 text-white text-xs gap-1.5 shadow-2xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{t("ai.applySuggestion")}</span>
              <ArrowRight className="w-3 h-3 ml-0.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
