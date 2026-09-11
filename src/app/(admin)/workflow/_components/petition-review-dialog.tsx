"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  FileText,
  User,
  ExternalLink,
  MessageSquare,
  Send,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
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
import {
  type PetitionDto,
  type PetitionActivityDto,
  ThesisPrerequisiteWidget,
  DefenseEvaluationWidget,
} from "@/features/workflow";
import { processPetitionActionMutation } from "@/features/workflow/actions";
import { AdvisoryFeedbackAiWidget } from "@/features/ai";

interface PetitionReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  petition: PetitionDto | null;
  canManage: boolean;
  currentUserName: string;
  onSuccess: () => void;
}

export function PetitionReviewDialog({
  open,
  onOpenChange,
  petition,
  canManage,
  currentUserName,
  onSuccess,
}: PetitionReviewDialogProps) {
  const t = useT();
  const [action, setAction] = useState<"APPROVE" | "RETURN" | "REJECT">("APPROVE");
  const [reviewerName, setReviewerName] = useState(currentUserName || "ผู้พิจารณา");
  const [reviewerRole, setReviewerRole] = useState("ADVISOR");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!petition) return null;

  const getStatusTone = (status: string): StatusPillTone => {
    switch (status) {
      case "COMPLETED":
        return "ok";
      case "SUBMITTED":
      case "ADVISOR_APPROVED":
      case "CHAIR_APPROVED":
        return "info";
      case "RETURNED":
        return "warn";
      case "REJECTED":
      case "CANCELLED":
        return "bad";
      default:
        return "off";
    }
  };

  const isFinalized =
    petition.status === "COMPLETED" ||
    petition.status === "REJECTED" ||
    petition.status === "CANCELLED";

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const res = await processPetitionActionMutation({
        petitionId: petition.id,
        action,
        actorName: reviewerName.trim() || "ผู้พิจารณา",
        actorRole: reviewerRole,
        comment: comment.trim() || undefined,
      });

      if (res.ok) {
        toast.success(t("workflow.actionSuccess"));
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(res.error?.message || t("workflow.actionError"));
      }
    } catch {
      toast.error(t("workflow.actionError"));
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: t("workflow.step.1") },
    { num: 2, label: t("workflow.step.2") },
    { num: 3, label: t("workflow.step.3") },
    { num: 4, label: t("workflow.step.4") },
  ];

  return (
    <LiyonDialog open={open} onOpenChange={onOpenChange} wide>
      <LiyonDialogCloseButton label={t("workflow.cancel")} />
      <LiyonDialogHeader
        title={`${t("workflow.reviewDialogTitle")}: ${petition.trackingNo}`}
        description={petition.title}
      />

      <LiyonDialogBody>
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
          {/* Status & Stepper Visualizer */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {t("workflow.col.status")}:
                </span>
                <StatusPill tone={getStatusTone(petition.status)}>
                  {t(`workflow.status.${petition.status}`)}
                </StatusPill>
              </div>
              <div className="text-xs text-slate-500">
                {t("workflow.col.submittedAt")}: {new Date(petition.createdAt).toLocaleDateString()}
              </div>
            </div>

            {/* Stepper */}
            <div className="grid grid-cols-4 gap-2 pt-2">
              {steps.map((s) => {
                const isCompleted =
                  petition.status === "COMPLETED" || s.num < petition.currentStep;
                const isCurrent =
                  s.num === petition.currentStep && petition.status !== "COMPLETED";
                const isIssue =
                  isCurrent && (petition.status === "RETURNED" || petition.status === "REJECTED");

                return (
                  <div key={s.num} className="flex flex-col items-center text-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors mb-1.5 ${
                        isCompleted
                          ? "bg-emerald-600 text-white"
                          : isIssue
                          ? petition.status === "RETURNED"
                            ? "bg-amber-500 text-white"
                            : "bg-rose-600 text-white"
                          : isCurrent
                          ? "bg-rose-600 text-white ring-4 ring-rose-100"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : isIssue ? (
                        petition.status === "RETURNED" ? (
                          <AlertCircle className="w-5 h-5" />
                        ) : (
                          <XCircle className="w-5 h-5" />
                        )
                      ) : (
                        s.num
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        isCurrent
                          ? "text-rose-700 font-semibold"
                          : isCompleted
                          ? "text-emerald-700"
                          : "text-slate-500"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Warning / Alert Banners */}
            {petition.status === "RETURNED" && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>คำร้องนี้ถูกส่งกลับให้นิสิตปรับปรุงแก้ไขตามข้อเสนอแนะ</span>
              </div>
            )}
            {petition.status === "REJECTED" && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-sm">
                <XCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>คำร้องนี้ถูกปฏิเสธและสิ้นสุดกระบวนการแล้ว</span>
              </div>
            )}
            {petition.status === "COMPLETED" && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>คำร้องนี้ได้รับการอนุมัติเสร็จสมบูรณ์ทุกขั้นตอนแล้ว</span>
              </div>
            )}
          </div>

          {/* 2-Column Info: Applicant & Petition Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Student Card */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
              <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                <User className="w-4 h-4 text-rose-600" />
                {t("workflow.studentInfo")}
              </h4>
              <div className="space-y-1.5 text-xs text-slate-600">
                <div>
                  <span className="font-medium text-slate-500">{t("workflow.studentName")}:</span>{" "}
                  <strong className="text-slate-800">{petition.studentName}</strong> ({petition.studentId})
                </div>
                <div>
                  <span className="font-medium text-slate-500">{t("workflow.studentEmail")}:</span>{" "}
                  <a href={`mailto:${petition.studentEmail}`} className="text-rose-600 hover:underline">
                    {petition.studentEmail}
                  </a>
                </div>
                {petition.studentPhone && (
                  <div>
                    <span className="font-medium text-slate-500">{t("workflow.studentPhone")}:</span>{" "}
                    {petition.studentPhone}
                  </div>
                )}
                <div>
                  <span className="font-medium text-slate-500">{t("workflow.program")}:</span>{" "}
                  {petition.programNameTh || "-"}
                </div>
                <div>
                  <span className="font-medium text-slate-500">{t("workflow.advisor")}:</span>{" "}
                  <strong className="text-slate-800">{petition.advisorNameTh || "-"}</strong>
                </div>
              </div>
            </div>

            {/* Petition Info Card */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
              <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                <FileText className="w-4 h-4 text-rose-600" />
                {t("workflow.petitionDetails")}
              </h4>
              <div className="space-y-1.5 text-xs text-slate-600">
                <div>
                  <span className="font-medium text-slate-500">{t("workflow.col.type")}:</span>{" "}
                  <span className="font-semibold text-rose-700">{t(`workflow.type.${petition.type}`)}</span>
                </div>
                {petition.thesisTitleTh && (
                  <div>
                    <span className="font-medium text-slate-500">{t("workflow.thesisTitleTh")}:</span>{" "}
                    <div className="font-medium text-slate-800 mt-0.5">{petition.thesisTitleTh}</div>
                  </div>
                )}
                {petition.thesisTitleEn && (
                  <div>
                    <span className="font-medium text-slate-500">{t("workflow.thesisTitleEn")}:</span>{" "}
                    <div className="italic text-slate-700 mt-0.5">{petition.thesisTitleEn}</div>
                  </div>
                )}
                {petition.attachmentUrl && (
                  <div className="pt-1">
                    <a
                      href={petition.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-rose-600" />
                      {t("workflow.viewAttachment")}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Thesis Defense Pre-requisite Summary for Committee */}
          {petition.type === "DEFENSE_EXAM_REQUEST" && (
            <ThesisPrerequisiteWidget readOnly={true} />
          )}

          {/* Committee Evaluation & Scoring Panel */}
          {(petition.type === "DEFENSE_EXAM_REQUEST" ||
            petition.type === "THESIS_TOPIC_APPROVAL") && (
            <DefenseEvaluationWidget
              petitionType={petition.type}
              thesisTitle={petition.thesisTitleTh || petition.title}
              studentName={petition.studentName}
              advisorName={petition.advisorNameTh || undefined}
              readOnly={isFinalized || !canManage}
              onApplyVerdict={(summary, suggestedAction) => {
                setComment((prev) => (prev ? `${prev}\n\n${summary}` : summary));
                setAction(suggestedAction);
              }}
            />
          )}

          {/* Description & Justification */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              {t("workflow.descriptionLabel")}
            </h4>
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {petition.description}
            </p>
          </div>

          {/* Audit Activity Trail */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-600" />
              {t("workflow.actionHistory")}
            </h4>
            <div className="space-y-2.5">
              {petition.activities && petition.activities.length > 0 ? (
                petition.activities.map((act: PetitionActivityDto) => (
                  <div
                    key={act.id}
                    className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900">{act.actorName}</strong>
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">
                          {act.actorRole}
                        </span>
                        <StatusPill tone={getStatusTone(act.newStatus)}>
                          {act.action}
                        </StatusPill>
                      </div>
                      <span className="text-slate-400">
                        {new Date(act.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {act.comment && (
                      <div className="flex items-start gap-1.5 text-slate-600 pl-2 border-l-2 border-rose-300 mt-1">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{act.comment}</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">{t("workflow.noHistory")}</p>
              )}
            </div>
          </div>

          {/* Review Decision Form */}
          {canManage && !isFinalized && (
            <form
              onSubmit={handleActionSubmit}
              className="p-4 bg-rose-50/50 border border-rose-200 rounded-xl space-y-4"
            >
              <h4 className="text-sm font-semibold text-rose-950 flex items-center gap-2">
                <Send className="w-4 h-4 text-rose-600" />
                {t("workflow.reviewAction")}
              </h4>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAction("APPROVE")}
                  className={`p-2.5 rounded-lg border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    action === "APPROVE"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {t("workflow.action.approve")}
                </button>

                <button
                  type="button"
                  onClick={() => setAction("RETURN")}
                  className={`p-2.5 rounded-lg border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    action === "RETURN"
                      ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <AlertCircle className="w-4 h-4" />
                  {t("workflow.action.return")}
                </button>

                <button
                  type="button"
                  onClick={() => setAction("REJECT")}
                  className={`p-2.5 rounded-lg border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    action === "REJECT"
                      ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  {t("workflow.action.reject")}
                </button>
              </div>

              {/* Reviewer Role & Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    {t("workflow.reviewerName")}
                  </label>
                  <input
                    type="text"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    {t("workflow.reviewerRole")}
                  </label>
                  <select
                    value={reviewerRole}
                    onChange={(e) => setReviewerRole(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  >
                    <option value="ADVISOR">อาจารย์ที่ปรึกษา (Advisor)</option>
                    <option value="PROGRAM_CHAIR">ประธานหลักสูตร (Program Chair)</option>
                    <option value="DEAN_OFFICE">บัณฑิตวิทยาลัย / สำนักงานคณบดี (Dean / Grad)</option>
                    <option value="COMMITTEE">กรรมการวิชาการ (Academic Committee)</option>
                  </select>
                </div>
              </div>

              {/* Feedback Comment */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-slate-700">
                    {t("workflow.comment")}
                  </label>
                  <AdvisoryFeedbackAiWidget
                    petitionType={petition.type}
                    studentName={petition.studentName}
                    thesisTitleTh={petition.thesisTitleTh || petition.title}
                    thesisTitleEn={petition.thesisTitleEn}
                    action={action}
                    reviewerRole={reviewerRole}
                    onApply={(draft) => setComment(draft)}
                  />
                </div>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t("workflow.commentPlaceholder")}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              {/* Submit Review */}
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs px-4 py-2 flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {t("workflow.submitAction")}
                </Button>
              </div>
            </form>
          )}
        </div>
      </LiyonDialogBody>

      <LiyonDialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          className="text-xs"
        >
          {t("workflow.cancel")}
        </Button>
      </LiyonDialogFooter>
    </LiyonDialog>
  );
}
