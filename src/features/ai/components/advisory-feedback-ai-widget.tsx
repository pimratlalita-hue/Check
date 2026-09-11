"use client";

import React, { useState } from "react";
import { Sparkles, Check, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/shared/lib/i18n/client";
import { Button } from "@/components/ui/button";
import type { AdvisoryFeedbackResult } from "../_internal/schemas";
import { generateAdvisoryFeedbackAction } from "../actions";

interface AdvisoryFeedbackAiWidgetProps {
  petitionType: string;
  studentName: string;
  thesisTitleTh: string;
  thesisTitleEn?: string | null;
  action: "APPROVE" | "RETURN" | "REJECT";
  reviewerRole: string;
  onApply: (commentText: string) => void;
}

export function AdvisoryFeedbackAiWidget({
  petitionType,
  studentName,
  thesisTitleTh,
  thesisTitleEn,
  action,
  reviewerRole,
  onApply,
}: AdvisoryFeedbackAiWidgetProps) {
  const t = useT();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AdvisoryFeedbackResult | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await generateAdvisoryFeedbackAction({
        petitionType,
        studentName,
        thesisTitleTh: thesisTitleTh || "หัวข้อวิทยานิพนธ์",
        thesisTitleEn: thesisTitleEn || null,
        action,
        reviewerRole,
      });

      if (res.ok) {
        setResult(res.data);
        toast.success("Gemini AI ช่วยร่างความเห็นวิชาการเรียบร้อยแล้ว");
      } else {
        toast.error(res.error.message || "ไม่สามารถร่างความเห็นได้ในขณะนี้");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    onApply(result.comment);
    toast.success(t("ai.applyDraft"));
    setResult(null);
  };

  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGenerate}
          disabled={loading}
          className="h-7 px-2.5 text-xs bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 flex items-center gap-1.5"
        >
          {loading ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin text-rose-600" />
              <span>{t("ai.advisorDrafting")}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3 h-3 text-rose-600" />
              <span>{t("ai.advisorDraft")}</span>
            </>
          )}
        </Button>
      </div>

      {result && (
        <div className="p-3 bg-rose-50/50 border border-rose-200 rounded-lg text-xs space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between font-semibold text-slate-800">
            <span className="flex items-center gap-1 text-rose-700">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ร่างข้อเสนอแนะโดย Gemini AI:</span>
            </span>
            <Button
              type="button"
              size="sm"
              onClick={handleApply}
              className="h-6 px-2 text-[11px] bg-rose-700 hover:bg-rose-800 text-white gap-1"
            >
              <Check className="w-3 h-3" />
              <span>{t("ai.applyDraft")}</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </Button>
          </div>

          <p className="text-slate-700 leading-relaxed bg-white p-2.5 rounded border border-rose-100 text-xs">
            {result.comment}
          </p>

          {result.pointsToImprove.length > 0 && (
            <div className="text-[11px] text-slate-600">
              <span className="font-semibold">ประเด็นที่เสนอแนะเพิ่มเติม:</span>
              <ul className="list-disc list-inside mt-0.5 space-y-0.5">
                {result.pointsToImprove.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
