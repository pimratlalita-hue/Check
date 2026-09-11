"use client";

import React, { useState } from "react";
import {
  Send,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  FileText,
  User,
  Copy,
  ExternalLink,
  Loader2,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/shared/lib/i18n/client";
import { StatusPill, type StatusPillTone } from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import {
  type PetitionDto,
  type PetitionType,
  ThesisPrerequisiteWidget,
} from "@/features/workflow";
import {
  submitPublicPetitionAction,
  trackPublicPetitionAction,
} from "@/features/workflow/actions";
import { ThesisTitleAiWidget, ConceptNoteSummarizerWidget } from "@/features/ai";
import { DocumentUploadDropzone } from "@/components/documents/document-upload-dropzone";

interface ProgramOption {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string;
  degreeTh: string;
  level: string;
}

interface AdvisorOption {
  id: string;
  nameTh: string;
  nameEn: string;
  positionTh: string;
  departmentNameTh?: string | null;
}

interface PetitionsPortalViewProps {
  programs: ProgramOption[];
  advisors: AdvisorOption[];
}

export function PetitionsPortalView({ programs, advisors }: PetitionsPortalViewProps) {
  const t = useT();

  const [activeTab, setActiveTab] = useState<"submit" | "track">("submit");

  // Submission Form State
  const [formType, setFormType] = useState<PetitionType>("THESIS_TOPIC_APPROVAL");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [programId, setProgramId] = useState("");
  const [advisorId, setAdvisorId] = useState("");
  const [thesisTitleTh, setThesisTitleTh] = useState("");
  const [thesisTitleEn, setThesisTitleEn] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedPetition, setSubmittedPetition] = useState<PetitionDto | null>(null);
  const [copied, setCopied] = useState(false);

  // Tracking Search State
  const [trackQuery, setTrackQuery] = useState("");
  const [trackingResults, setTrackingResults] = useState<PetitionDto[] | null>(null);
  const [searching, setSearching] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const res = await submitPublicPetitionAction({
        type: formType,
        title,
        description,
        studentId,
        studentName,
        studentEmail,
        studentPhone: studentPhone || null,
        programId: programId || null,
        advisorId: advisorId || null,
        thesisTitleTh: thesisTitleTh || null,
        thesisTitleEn: thesisTitleEn || null,
        attachmentUrl: attachmentUrl || null,
      });

      if (res.ok) {
        toast.success(t("workflow.submittedSuccess"));
        setSubmittedPetition(res.data);
      } else {
        toast.error(res.error?.message || "เกิดข้อผิดพลาดในการยื่นคำร้อง");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการยื่นคำร้อง");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = trackQuery.trim();
    if (!q) return;

    setSearching(true);
    try {
      const res = await trackPublicPetitionAction({ query: q });
      if (res.ok) {
        setTrackingResults(res.data);
      } else {
        toast.error(res.error?.message || "ไม่สามารถค้นหาคำร้องได้");
      }
    } catch {
      toast.error("ไม่สามารถค้นหาคำร้องได้");
    } finally {
      setSearching(false);
    }
  };

  const handleCopyTrackingNo = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success(t("workflow.portal.copied"));
  };

  const handleTrackNow = (trackingNo: string) => {
    setSubmittedPetition(null);
    setActiveTab("track");
    setTrackQuery(trackingNo);
    setSearching(true);
    trackPublicPetitionAction({ query: trackingNo }).then((res) => {
      setSearching(false);
      if (res.ok) {
        setTrackingResults(res.data);
      }
    });
  };

  const handleResetForm = () => {
    setSubmittedPetition(null);
    setTitle("");
    setDescription("");
    setStudentId("");
    setStudentName("");
    setStudentEmail("");
    setStudentPhone("");
    setProgramId("");
    setAdvisorId("");
    setThesisTitleTh("");
    setThesisTitleEn("");
    setAttachmentUrl("");
  };

  const steps = [
    { num: 1, label: t("workflow.step.1") },
    { num: 2, label: t("workflow.step.2") },
    { num: 3, label: t("workflow.step.3") },
    { num: 4, label: t("workflow.step.4") },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-700 via-rose-600 to-pink-600 p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Digital e-Petition & Approval System</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t("workflow.portalTitle")}
          </h1>
          <p className="text-sm sm:text-base text-rose-100 leading-relaxed">
            {t("workflow.portalSubtitle")}
          </p>
        </div>

        {/* Decorative background shape */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("submit")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "submit"
              ? "border-rose-600 text-rose-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Send className="w-4 h-4" />
          <span>{t("workflow.portalTab.submit")}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("track")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "track"
              ? "border-rose-600 text-rose-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Search className="w-4 h-4" />
          <span>{t("workflow.portalTab.track")}</span>
        </button>
      </div>

      {/* TAB 1: SUBMISSION FORM */}
      {activeTab === "submit" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          {submittedPetition ? (
            /* Success Card */
            <div className="text-center py-8 space-y-6 max-w-lg mx-auto">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-900">
                  {t("workflow.portal.trackingSuccess")}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {t("workflow.portal.trackingSuccessDesc")}
                </p>
              </div>

              {/* Prominent Tracking Number Box */}
              <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                <div className="text-xs font-medium text-rose-700 uppercase tracking-wider">
                  {t("workflow.portal.yourTrackingNo")}
                </div>
                <div className="text-3xl font-mono font-extrabold text-rose-700 tracking-wider">
                  {submittedPetition.trackingNo}
                </div>
                <div className="pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyTrackingNo(submittedPetition.trackingNo)}
                    className="gap-1.5 text-xs border-rose-300 text-rose-700 hover:bg-rose-100"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? t("workflow.portal.copied") : t("workflow.portal.copyTrackingNo")}</span>
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button
                  onClick={() => handleTrackNow(submittedPetition.trackingNo)}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs px-5 py-2.5 flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>{t("workflow.portal.trackNow")}</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleResetForm}
                  className="text-xs px-5 py-2.5"
                >
                  {t("workflow.portal.submitAnother")}
                </Button>
              </div>
            </div>
          ) : (
            /* Online Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {t("workflow.portal.submitHeading")}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t("workflow.portal.submitDesc")}
                </p>
              </div>

              {/* Section 1: Applicant Info */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-rose-600" />
                  <span>1. {t("workflow.studentInfo")}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      {t("workflow.studentId")} *
                    </label>
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="เช่น 65010001"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      {t("workflow.studentName")} *
                    </label>
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="เช่น นายสมชาย ใจดี"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      {t("workflow.studentEmail")} *
                    </label>
                    <input
                      type="email"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      placeholder="เช่น somchai@univ.ac.th"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      {t("workflow.studentPhone")}
                    </label>
                    <input
                      type="tel"
                      value={studentPhone}
                      onChange={(e) => setStudentPhone(e.target.value)}
                      placeholder="เช่น 0812345678"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Academic Program & Advisor */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-rose-600" />
                  <span>2. หลักสูตรและอาจารย์ที่ปรึกษา</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      {t("workflow.program")}
                    </label>
                    <select
                      value={programId}
                      onChange={(e) => setProgramId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    >
                      <option value="">{t("workflow.selectProgram")}</option>
                      {programs.map((p) => (
                        <option key={p.id} value={p.id}>
                          [{p.code}] {p.nameTh} ({p.degreeTh})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      {t("workflow.advisor")}
                    </label>
                    <select
                      value={advisorId}
                      onChange={(e) => setAdvisorId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    >
                      <option value="">{t("workflow.selectAdvisor")}</option>
                      {advisors.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.nameTh} ({a.positionTh})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Petition Details */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-rose-600" />
                  <span>3. {t("workflow.petitionDetails")}</span>
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      {t("workflow.col.type")} *
                    </label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as PetitionType)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      required
                    >
                      <option value="THESIS_TOPIC_APPROVAL">{t("workflow.type.THESIS_TOPIC_APPROVAL")}</option>
                      <option value="DEFENSE_EXAM_REQUEST">{t("workflow.type.DEFENSE_EXAM_REQUEST")}</option>
                      <option value="LEAVE_OF_ABSENCE">{t("workflow.type.LEAVE_OF_ABSENCE")}</option>
                      <option value="EXTENSION_OF_STUDY">{t("workflow.type.EXTENSION_OF_STUDY")}</option>
                      <option value="GENERAL_PETITION">{t("workflow.type.GENERAL_PETITION")}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      {t("workflow.col.title")} *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="เช่น ขออนุมัติหัวข้อและเค้าโครงวิทยานิพนธ์"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      required
                    />
                  </div>

                  {/* Thesis Topic fields if thesis-related */}
                  {(formType === "THESIS_TOPIC_APPROVAL" || formType === "DEFENSE_EXAM_REQUEST") && (
                    <div className="space-y-2 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-medium text-slate-700 mb-1">
                            {t("workflow.thesisTitleTh")}
                          </label>
                          <input
                            type="text"
                            value={thesisTitleTh}
                            onChange={(e) => setThesisTitleTh(e.target.value)}
                            placeholder="ชื่อวิทยานิพนธ์ภาษาไทย"
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-slate-700 mb-1">
                            {t("workflow.thesisTitleEn")}
                          </label>
                          <input
                            type="text"
                            value={thesisTitleEn}
                            onChange={(e) => setThesisTitleEn(e.target.value)}
                            placeholder="Thesis Title in English"
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Gemini AI Thesis Title Validator & Bilingual Synchronizer */}
                      <ThesisTitleAiWidget
                        titleTh={thesisTitleTh}
                        titleEn={thesisTitleEn}
                        onApply={(suggestedTh, suggestedEn) => {
                          setThesisTitleTh(suggestedTh);
                          setThesisTitleEn(suggestedEn);
                        }}
                      />
                    </div>
                  )}

                  {/* Pre-requisite Checker for Final Defense Examination */}
                  {formType === "DEFENSE_EXAM_REQUEST" && (
                    <div className="pt-1">
                      <ThesisPrerequisiteWidget />
                    </div>
                  )}

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      {t("workflow.descriptionLabel")} *
                    </label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="ระบุเหตุผลความจำเป็นและรายละเอียดของคำร้อง..."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      required
                    />

                    {/* Gemini AI Concept Note & Abstract Summarizer */}
                    <ConceptNoteSummarizerWidget
                      title={thesisTitleTh || title}
                      description={description}
                      onApplySummary={(summary) => setDescription(summary)}
                    />
                  </div>

                  <DocumentUploadDropzone
                    value={attachmentUrl}
                    onChange={setAttachmentUrl}
                    label="เอกสารประกอบคำร้อง / ร่างเค้าโครงวิทยานิพนธ์ (Thesis Attachment)"
                    description="รองรับไฟล์ .pdf, .docx, .doc สูงสุด 50 MB พร้อมระบบตรวจสอบความถูกต้อง"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-6 py-2.5 rounded-lg shadow-sm flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t("workflow.portal.submitting")}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{t("workflow.portal.submitButton")}</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* TAB 2: REAL-TIME STATUS TRACKING */}
      {activeTab === "track" && (
        <div className="space-y-6">
          {/* Search Box */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="max-w-xl mx-auto text-center space-y-2 mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {t("workflow.portal.trackHeading")}
              </h2>
              <p className="text-xs text-slate-500">
                {t("workflow.portal.trackDesc")}
              </p>
            </div>

            <form onSubmit={handleTrackSubmit} className="max-w-xl mx-auto flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={trackQuery}
                  onChange={(e) => setTrackQuery(e.target.value)}
                  placeholder={t("workflow.portal.trackPlaceholder")}
                  className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:bg-white focus:outline-none"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={searching}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs px-5 py-2 flex items-center gap-1.5"
              >
                {searching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>{t("workflow.portal.trackButton")}</span>
              </Button>
            </form>
          </div>

          {/* Tracking Results */}
          {trackingResults !== null && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <span>{t("workflow.portal.searchResults")}</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-mono">
                  {trackingResults.length}
                </span>
              </h3>

              {trackingResults.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Search className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-semibold text-slate-800">
                    {t("workflow.portal.notFound")}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {t("workflow.portal.notFoundDesc")}
                  </p>
                </div>
              ) : (
                trackingResults.map((pet) => (
                  <div
                    key={pet.id}
                    className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono font-bold text-rose-700 px-2 py-0.5 bg-rose-50 rounded border border-rose-200">
                            {pet.trackingNo}
                          </span>
                          <span className="text-xs font-medium text-slate-500">
                            {t(`workflow.type.${pet.type}`)}
                          </span>
                        </div>
                        <h4 className="text-lg font-bold text-slate-900">{pet.title}</h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <StatusPill tone={getStatusTone(pet.status)}>
                          {t(`workflow.status.${pet.status}`)}
                        </StatusPill>
                      </div>
                    </div>

                    {/* Stepper 4 tiers */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                        {t("workflow.portal.stepperTitle")}
                      </div>
                      <div className="grid grid-cols-4 gap-2 pt-1">
                        {steps.map((s) => {
                          const isCompleted =
                            pet.status === "COMPLETED" || s.num < pet.currentStep;
                          const isCurrent =
                            s.num === pet.currentStep && pet.status !== "COMPLETED";
                          const isIssue =
                            isCurrent && (pet.status === "RETURNED" || pet.status === "REJECTED");

                          return (
                            <div key={s.num} className="flex flex-col items-center text-center">
                              <div
                                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs transition-colors mb-1.5 ${
                                  isCompleted
                                    ? "bg-emerald-600 text-white"
                                    : isIssue
                                    ? pet.status === "RETURNED"
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
                                  pet.status === "RETURNED" ? (
                                    <AlertCircle className="w-5 h-5" />
                                  ) : (
                                    <XCircle className="w-5 h-5" />
                                  )
                                ) : (
                                  s.num
                                )}
                              </div>
                              <span
                                className={`text-[11px] sm:text-xs font-medium ${
                                  isCurrent
                                    ? "text-rose-700 font-bold"
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

                      {/* Notice if returned or rejected */}
                      {pet.status === "RETURNED" && (
                        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
                          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                          <span>คำร้องนี้ถูกส่งกลับให้นิสิตปรับปรุงแก้ไขตามข้อคิดเห็นด้านล่าง</span>
                        </div>
                      )}
                      {pet.status === "REJECTED" && (
                        <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs">
                          <XCircle className="w-4 h-4 shrink-0 text-rose-600" />
                          <span>คำร้องนี้ถูกปฏิเสธและสิ้นสุดกระบวนการแล้ว</span>
                        </div>
                      )}
                      {pet.status === "COMPLETED" && (
                        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs">
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                          <span>คำร้องนี้ได้รับการอนุมัติเสร็จสมบูรณ์เรียบร้อยแล้ว</span>
                        </div>
                      )}
                    </div>

                    {/* Metadata Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-3 bg-slate-50 rounded-lg space-y-1 text-slate-600">
                        <div>
                          <span className="text-slate-400">{t("workflow.studentName")}:</span>{" "}
                          <strong className="text-slate-800">{pet.studentName}</strong> ({pet.studentId})
                        </div>
                        <div>
                          <span className="text-slate-400">{t("workflow.program")}:</span>{" "}
                          {pet.programNameTh || "-"}
                        </div>
                        <div>
                          <span className="text-slate-400">{t("workflow.advisor")}:</span>{" "}
                          <strong className="text-slate-800">{pet.advisorNameTh || "-"}</strong>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-lg space-y-1 text-slate-600">
                        <div>
                          <span className="text-slate-400">{t("workflow.col.submittedAt")}:</span>{" "}
                          {new Date(pet.createdAt).toLocaleDateString()}
                        </div>
                        {pet.thesisTitleTh && (
                          <div>
                            <span className="text-slate-400">{t("workflow.thesisTitleTh")}:</span>{" "}
                            <span className="text-slate-800">{pet.thesisTitleTh}</span>
                          </div>
                        )}
                        {pet.attachmentUrl && (
                          <div className="pt-1">
                            <a
                              href={pet.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-rose-600 hover:underline font-medium"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>{t("workflow.viewAttachment")}</span>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="text-xs text-slate-700 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                      <span className="font-semibold text-slate-600 block mb-1">
                        {t("workflow.descriptionLabel")}:
                      </span>
                      <p className="whitespace-pre-wrap">{pet.description}</p>
                    </div>

                    {/* Audit History Timeline */}
                    <div className="space-y-2.5 pt-2 border-t border-slate-100">
                      <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-rose-600" />
                        <span>{t("workflow.actionHistory")}</span>
                      </div>

                      <div className="space-y-2">
                        {pet.activities && pet.activities.length > 0 ? (
                          pet.activities.map((act) => (
                            <div
                              key={act.id}
                              className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between flex-wrap gap-1">
                                <div className="flex items-center gap-2">
                                  <strong className="text-slate-800">{act.actorName}</strong>
                                  <span className="px-1.5 py-0.5 rounded bg-white text-slate-600 font-mono text-[10px] border border-slate-200">
                                    {act.actorRole}
                                  </span>
                                  <StatusPill tone={getStatusTone(act.newStatus)}>
                                    {act.action}
                                  </StatusPill>
                                </div>
                                <span className="text-slate-400 text-[11px]">
                                  {new Date(act.createdAt).toLocaleString()}
                                </span>
                              </div>
                              {act.comment && (
                                <div className="flex items-start gap-1.5 text-slate-700 pl-2 border-l-2 border-rose-400 mt-1">
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
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
