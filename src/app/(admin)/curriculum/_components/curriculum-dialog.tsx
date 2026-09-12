"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  GraduationCap,
  BookOpen,
  Target,
  Plus,
  Trash2,
  Upload,
  FileText,
  Download,
  FileCode,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/shared/lib/i18n/client";
import {
  LiyonDialog,
  LiyonDialogCloseButton,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonField,
  LiyonSelect,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type {
  ProgramDto,
  DegreeLevel,
  ProgramType,
  ProgramStatus,
  LearningOutcome,
} from "@/features/curriculum";
import { createProgramAction, updateProgramAction } from "@/features/curriculum/actions";
import { emptyProgramForm, type ProgramFormData } from "./types";

interface DepartmentOption {
  id: string;
  nameTh: string;
  nameEn: string;
}

interface CurriculumDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  program: ProgramDto | null;
  departments: DepartmentOption[];
  onSuccess: () => void;
}

type TabType = "general" | "details" | "outcomes";

function getInitialProgramFormData(program: ProgramDto | null): ProgramFormData {
  if (!program) return emptyProgramForm;
  return {
    id: program.id,
    code: program.code,
    nameTh: program.nameTh,
    nameEn: program.nameEn,
    degreeTh: program.degreeTh,
    degreeEn: program.degreeEn,
    degreeShortTh: program.degreeShortTh,
    degreeShortEn: program.degreeShortEn,
    level: program.level,
    type: program.type,
    status: program.status,
    slug: program.slug,
    totalCredits: program.totalCredits,
    studyDuration: program.studyDuration,
    tuitionFee: program.tuitionFee ?? "",
    descriptionTh: program.descriptionTh ?? "",
    descriptionEn: program.descriptionEn ?? "",
    philosophyTh: program.philosophyTh ?? "",
    philosophyEn: program.philosophyEn ?? "",
    careerPaths: program.careerPaths ?? [],
    learningOutcomes: program.learningOutcomes ?? [],
    handbookUrl: program.handbookUrl ?? "",
    imageUrl: program.imageUrl ?? "",
    departmentId: program.departmentId ?? "",
    displayOrder: program.displayOrder,
  };
}

export function CurriculumDialog({
  open,
  onOpenChange,
  program,
  departments,
  onSuccess,
}: CurriculumDialogProps) {
  const t = useT();
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCareer, setNewCareer] = useState("");
  const [newPloCode, setNewPloCode] = useState("");
  const [newPloTh, setNewPloTh] = useState("");
  const [newPloEn, setNewPloEn] = useState("");

  const [formData, setFormData] = useState<ProgramFormData>(() =>
    getInitialProgramFormData(program)
  );
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [rawJsonText, setRawJsonText] = useState("");
  const [isCopiedJson, setIsCopiedJson] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData(getInitialProgramFormData(program));
    }
  }, [open, program]);

  const getExportPayload = () => {
    return {
      code: formData.code,
      nameTh: formData.nameTh,
      nameEn: formData.nameEn,
      degreeTh: formData.degreeTh,
      degreeEn: formData.degreeEn,
      degreeShortTh: formData.degreeShortTh,
      degreeShortEn: formData.degreeShortEn,
      level: formData.level,
      type: formData.type,
      status: formData.status,
      slug: formData.slug,
      totalCredits: formData.totalCredits,
      studyDuration: formData.studyDuration,
      tuitionFee: formData.tuitionFee || "",
      descriptionTh: formData.descriptionTh || "",
      descriptionEn: formData.descriptionEn || "",
      philosophyTh: formData.philosophyTh || "",
      philosophyEn: formData.philosophyEn || "",
      careerPaths: formData.careerPaths || [],
      learningOutcomes: formData.learningOutcomes || [],
      handbookUrl: formData.handbookUrl || "",
      imageUrl: formData.imageUrl || "",
      departmentId: formData.departmentId || "",
      displayOrder: formData.displayOrder ?? 0,
    };
  };

  const handleExportJson = () => {
    try {
      const payload = getExportPayload();
      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(payload, null, 2));
      const downloadAnchor = document.createElement("a");
      const filename = `curriculum_${formData.code || formData.slug || "program"}.json`;
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success(t("curriculum.exportJsonSuccess"));
    } catch (err) {
      console.error("Export error:", err);
      toast.error("ไม่สามารถส่งออกไฟล์ JSON ได้");
    }
  };

  const applyJsonData = (raw: Record<string, unknown>): boolean => {
    if (!raw || typeof raw !== "object") {
      toast.error(t("curriculum.importJsonError"));
      return false;
    }

    let outcomes: LearningOutcome[] = [];
    if (Array.isArray(raw.learningOutcomes)) {
      outcomes = raw.learningOutcomes
        .filter((o): o is Record<string, unknown> => Boolean(o && typeof o === "object"))
        .map((o) => ({
          code: String(o.code || "").trim(),
          descTh: String(o.descTh || "").trim(),
          descEn: o.descEn ? String(o.descEn).trim() : null,
        }))
        .filter((o) => o.code && o.descTh);
    }

    let careers: string[] = [];
    if (Array.isArray(raw.careerPaths)) {
      careers = raw.careerPaths
        .map((c) => String(c || "").trim())
        .filter(Boolean);
    }

    const validLevels: DegreeLevel[] = ["BACHELOR", "MASTER", "DOCTORAL", "CERTIFICATE"];
    const level: DegreeLevel =
      typeof raw.level === "string" && validLevels.includes(raw.level as DegreeLevel)
        ? (raw.level as DegreeLevel)
        : formData.level || "BACHELOR";

    const validTypes: ProgramType[] = ["THAI", "INTERNATIONAL", "BILINGUAL"];
    const type: ProgramType =
      typeof raw.type === "string" && validTypes.includes(raw.type as ProgramType)
        ? (raw.type as ProgramType)
        : formData.type || "THAI";

    const validStatuses: ProgramStatus[] = ["DRAFT", "ACTIVE", "REVISED", "ARCHIVED"];
    const status: ProgramStatus =
      typeof raw.status === "string" && validStatuses.includes(raw.status as ProgramStatus)
        ? (raw.status as ProgramStatus)
        : formData.status || "ACTIVE";

    setFormData((prev) => ({
      ...prev,
      code: raw.code !== undefined ? String(raw.code) : prev.code,
      nameTh: raw.nameTh !== undefined ? String(raw.nameTh) : prev.nameTh,
      nameEn: raw.nameEn !== undefined ? String(raw.nameEn) : prev.nameEn,
      degreeTh: raw.degreeTh !== undefined ? String(raw.degreeTh) : prev.degreeTh,
      degreeEn: raw.degreeEn !== undefined ? String(raw.degreeEn) : prev.degreeEn,
      degreeShortTh: raw.degreeShortTh !== undefined ? String(raw.degreeShortTh) : prev.degreeShortTh,
      degreeShortEn: raw.degreeShortEn !== undefined ? String(raw.degreeShortEn) : prev.degreeShortEn,
      level,
      type,
      status,
      slug: raw.slug !== undefined ? String(raw.slug) : prev.slug,
      totalCredits:
        raw.totalCredits !== undefined ? Number(raw.totalCredits) || 0 : prev.totalCredits,
      studyDuration:
        raw.studyDuration !== undefined ? String(raw.studyDuration) : prev.studyDuration,
      tuitionFee: raw.tuitionFee !== undefined ? String(raw.tuitionFee) : prev.tuitionFee,
      descriptionTh:
        raw.descriptionTh !== undefined ? String(raw.descriptionTh) : prev.descriptionTh,
      descriptionEn:
        raw.descriptionEn !== undefined ? String(raw.descriptionEn) : prev.descriptionEn,
      philosophyTh:
        raw.philosophyTh !== undefined ? String(raw.philosophyTh) : prev.philosophyTh,
      philosophyEn:
        raw.philosophyEn !== undefined ? String(raw.philosophyEn) : prev.philosophyEn,
      careerPaths: raw.careerPaths !== undefined ? careers : prev.careerPaths,
      learningOutcomes: raw.learningOutcomes !== undefined ? outcomes : prev.learningOutcomes,
      handbookUrl: raw.handbookUrl !== undefined ? String(raw.handbookUrl) : prev.handbookUrl,
      imageUrl: raw.imageUrl !== undefined ? String(raw.imageUrl) : prev.imageUrl,
      departmentId:
        raw.departmentId !== undefined ? String(raw.departmentId) : prev.departmentId,
      displayOrder:
        raw.displayOrder !== undefined ? Number(raw.displayOrder) || 0 : prev.displayOrder,
    }));

    toast.success(t("curriculum.importJsonSuccess"));
    return true;
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        applyJsonData(parsed);
      } catch {
        toast.error(t("curriculum.importJsonError"));
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    reader.onerror = () => {
      toast.error(t("curriculum.importJsonError"));
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const openJsonEditor = () => {
    setRawJsonText(JSON.stringify(getExportPayload(), null, 2));
    setIsJsonModalOpen(true);
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(rawJsonText);
      setIsCopiedJson(true);
      toast.success(t("curriculum.copiedJson"));
      setTimeout(() => setIsCopiedJson(false), 2000);
    } catch {
      toast.error("ไม่สามารถคัดลอกข้อความได้");
    }
  };

  const handleApplyRawJson = () => {
    try {
      const parsed = JSON.parse(rawJsonText);
      if (applyJsonData(parsed)) {
        setIsJsonModalOpen(false);
      }
    } catch {
      toast.error(t("curriculum.importJsonError"));
    }
  };

  const handleUploadHandbook = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      toast.error("กรุณาเลือกไฟล์ PDF เท่านั้น");
      return;
    }

    setIsUploadingDoc(true);
    const body = new FormData();
    body.append("file", file);

    try {
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (data.ok && data.url) {
        setFormData((prev) => ({ ...prev, handbookUrl: data.url }));
        toast.success(`อัปโหลดเอกสาร มคอ.2 เรียบร้อยแล้ว (${file.name})`);
      } else {
        toast.error(data.error || "เกิดข้อผิดพลาดในการอัปโหลด");
      }
    } catch {
      toast.error("ไม่สามารถอัปโหลดไฟล์ได้");
    } finally {
      setIsUploadingDoc(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        departmentId: formData.departmentId || null,
        tuitionFee: formData.tuitionFee.trim() || null,
        descriptionTh: formData.descriptionTh.trim() || null,
        descriptionEn: formData.descriptionEn.trim() || null,
        philosophyTh: formData.philosophyTh.trim() || null,
        philosophyEn: formData.philosophyEn.trim() || null,
        handbookUrl: formData.handbookUrl.trim() || null,
        imageUrl: formData.imageUrl.trim() || null,
        careerPaths: formData.careerPaths.length > 0 ? formData.careerPaths : null,
        learningOutcomes: formData.learningOutcomes.length > 0 ? formData.learningOutcomes : null,
      };

      if (formData.id) {
        const res = await updateProgramAction(payload);
        if (res.ok) {
          toast.success(t("curriculum.updatedSuccess"));
          onSuccess();
          onOpenChange(false);
        } else {
          toast.error(res.error.message);
        }
      } else {
        const res = await createProgramAction(payload);
        if (res.ok) {
          toast.success(t("curriculum.createdSuccess"));
          onSuccess();
          onOpenChange(false);
        } else {
          toast.error(res.error.message);
        }
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addCareer = () => {
    if (!newCareer.trim()) return;
    setFormData({
      ...formData,
      careerPaths: [...formData.careerPaths, newCareer.trim()],
    });
    setNewCareer("");
  };

  const removeCareer = (index: number) => {
    setFormData({
      ...formData,
      careerPaths: formData.careerPaths.filter((_, i) => i !== index),
    });
  };

  const addPlo = () => {
    if (!newPloCode.trim() || !newPloTh.trim()) return;
    const newOutcome: LearningOutcome = {
      code: newPloCode.trim(),
      descTh: newPloTh.trim(),
      descEn: newPloEn.trim() || null,
    };
    setFormData({
      ...formData,
      learningOutcomes: [...formData.learningOutcomes, newOutcome],
    });
    setNewPloCode("");
    setNewPloTh("");
    setNewPloEn("");
  };

  const removePlo = (index: number) => {
    setFormData({
      ...formData,
      learningOutcomes: formData.learningOutcomes.filter((_, i) => i !== index),
    });
  };

  return (
    <>
      <LiyonDialog open={open} onOpenChange={onOpenChange} wide>
      <LiyonDialogCloseButton label={t("common.close")} />
      <LiyonDialogHeader
        title={formData.id ? t("curriculum.edit") : t("curriculum.create")}
        description={t("curriculum.description")}
      />

      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <LiyonDialogBody>
          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
            {/* Top Toolbar: Tabs + JSON Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportJsonFile}
                accept=".json,application/json"
                className="hidden"
              />
              {/* Tabs */}
              <div className="flex border-b-0">
                <button
                  type="button"
                  onClick={() => setActiveTab("general")}
                  className={`pb-2 px-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeTab === "general"
                      ? "border-rose-600 text-rose-600 font-semibold"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <GraduationCap className="h-4 w-4" />
                  <span>{t("curriculum.tab.general")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("details")}
                  className={`pb-2 px-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeTab === "details"
                      ? "border-rose-600 text-rose-600 font-semibold"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <BookOpen className="h-4 w-4" />
                  <span>{t("curriculum.tab.details")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("outcomes")}
                  className={`pb-2 px-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeTab === "outcomes"
                      ? "border-rose-600 text-rose-600 font-semibold"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <Target className="h-4 w-4" />
                  <span>{t("curriculum.tab.outcomes")}</span>
                </button>
              </div>

              {/* JSON Actions */}
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleExportJson}
                  className="h-8 text-xs font-medium text-slate-700 hover:text-rose-600 border-slate-200 hover:border-rose-300 flex items-center gap-1.5 shadow-2xs"
                  title={t("curriculum.exportJson")}
                >
                  <Download className="h-3.5 w-3.5 text-rose-600" />
                  <span>{t("curriculum.exportJson")}</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 text-xs font-medium text-slate-700 hover:text-rose-600 border-slate-200 hover:border-rose-300 flex items-center gap-1.5 shadow-2xs"
                  title={t("curriculum.importJson")}
                >
                  <Upload className="h-3.5 w-3.5 text-rose-600" />
                  <span>{t("curriculum.importJson")}</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={openJsonEditor}
                  className="h-8 text-xs font-medium text-slate-700 hover:text-rose-600 border-slate-200 hover:border-rose-300 flex items-center gap-1.5 shadow-2xs"
                  title={t("curriculum.editJson")}
                >
                  <FileCode className="h-3.5 w-3.5 text-rose-600" />
                  <span>{t("curriculum.editJson")}</span>
                </Button>
              </div>
            </div>

            {/* Tab 1: General Info */}
            {activeTab === "general" && (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <LiyonField label={t("curriculum.code")}>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        placeholder="e.g. CS-BS-2565"
                        required
                      />
                    </LiyonField>
                  </div>
                  <div>
                    <LiyonField label={t("curriculum.slug")}>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
                        placeholder="e.g. bachelor-computer-science"
                        required
                      />
                    </LiyonField>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <LiyonField label={t("curriculum.nameTh")}>
                      <input
                        type="text"
                        value={formData.nameTh}
                        onChange={(e) => setFormData({ ...formData, nameTh: e.target.value })}
                        placeholder="หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์"
                        required
                      />
                    </LiyonField>
                  </div>
                  <div>
                    <LiyonField label={t("curriculum.nameEn")}>
                      <input
                        type="text"
                        value={formData.nameEn}
                        onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                        placeholder="Bachelor of Science Program in Computer Science"
                        required
                      />
                    </LiyonField>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <LiyonField label={t("curriculum.degreeTh")}>
                      <input
                        type="text"
                        value={formData.degreeTh}
                        onChange={(e) => setFormData({ ...formData, degreeTh: e.target.value })}
                        placeholder="วิทยาศาสตรบัณฑิต (วิทยาการคอมพิวเตอร์)"
                        required
                      />
                    </LiyonField>
                  </div>
                  <div>
                    <LiyonField label={t("curriculum.degreeEn")}>
                      <input
                        type="text"
                        value={formData.degreeEn}
                        onChange={(e) => setFormData({ ...formData, degreeEn: e.target.value })}
                        placeholder="Bachelor of Science (Computer Science)"
                        required
                      />
                    </LiyonField>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <LiyonField label={t("curriculum.degreeShortTh")}>
                      <input
                        type="text"
                        value={formData.degreeShortTh}
                        onChange={(e) => setFormData({ ...formData, degreeShortTh: e.target.value })}
                        placeholder="วท.บ. (วิทยาการคอมพิวเตอร์)"
                        required
                      />
                    </LiyonField>
                  </div>
                  <div>
                    <LiyonField label={t("curriculum.degreeShortEn")}>
                      <input
                        type="text"
                        value={formData.degreeShortEn}
                        onChange={(e) => setFormData({ ...formData, degreeShortEn: e.target.value })}
                        placeholder="B.Sc. (Computer Science)"
                        required
                      />
                    </LiyonField>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <LiyonField label={t("curriculum.filterByLevel")}>
                      <LiyonSelect
                        value={formData.level}
                        onChange={(e) => setFormData({ ...formData, level: e.target.value as DegreeLevel })}
                      >
                        <option value="BACHELOR">{t("curriculum.level.BACHELOR")}</option>
                        <option value="MASTER">{t("curriculum.level.MASTER")}</option>
                        <option value="DOCTORAL">{t("curriculum.level.DOCTORAL")}</option>
                        <option value="CERTIFICATE">{t("curriculum.level.CERTIFICATE")}</option>
                      </LiyonSelect>
                    </LiyonField>
                  </div>
                  <div>
                    <LiyonField label={t("curriculum.filterByType")}>
                      <LiyonSelect
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as ProgramType })}
                      >
                        <option value="THAI">{t("curriculum.type.THAI")}</option>
                        <option value="INTERNATIONAL">{t("curriculum.type.INTERNATIONAL")}</option>
                        <option value="BILINGUAL">{t("curriculum.type.BILINGUAL")}</option>
                      </LiyonSelect>
                    </LiyonField>
                  </div>
                  <div>
                    <LiyonField label={t("curriculum.filterByStatus")}>
                      <LiyonSelect
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as ProgramStatus })}
                      >
                        <option value="ACTIVE">{t("curriculum.status.ACTIVE")}</option>
                        <option value="DRAFT">{t("curriculum.status.DRAFT")}</option>
                        <option value="REVISED">{t("curriculum.status.REVISED")}</option>
                        <option value="ARCHIVED">{t("curriculum.status.ARCHIVED")}</option>
                      </LiyonSelect>
                    </LiyonField>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <LiyonField label={t("curriculum.department")}>
                      <LiyonSelect
                        value={formData.departmentId}
                        onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                      >
                        <option value="">-- เลือกภาควิชา --</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.nameTh}
                          </option>
                        ))}
                      </LiyonSelect>
                    </LiyonField>
                  </div>
                  <div>
                    <LiyonField label={t("curriculum.order")}>
                      <input
                        type="number"
                        value={formData.displayOrder}
                        onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                      />
                    </LiyonField>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Details & Philosophy */}
            {activeTab === "details" && (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <LiyonField label={t("curriculum.credits")}>
                      <input
                        type="number"
                        value={formData.totalCredits}
                        onChange={(e) => setFormData({ ...formData, totalCredits: parseInt(e.target.value) || 0 })}
                        required
                      />
                    </LiyonField>
                  </div>
                  <div>
                    <LiyonField label={t("curriculum.studyDuration")}>
                      <input
                        type="text"
                        value={formData.studyDuration}
                        onChange={(e) => setFormData({ ...formData, studyDuration: e.target.value })}
                        placeholder="4 ปี (8 ภาคการศึกษา)"
                        required
                      />
                    </LiyonField>
                  </div>
                  <div>
                    <LiyonField label={t("curriculum.tuitionFee")}>
                      <input
                        type="text"
                        value={formData.tuitionFee}
                        onChange={(e) => setFormData({ ...formData, tuitionFee: e.target.value })}
                        placeholder="21,000 บาท / ภาคการศึกษา"
                      />
                    </LiyonField>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <LiyonField label={t("curriculum.philosophy") + " (ไทย)"}>
                      <textarea
                        rows={3}
                        value={formData.philosophyTh}
                        onChange={(e) => setFormData({ ...formData, philosophyTh: e.target.value })}
                        placeholder="ปรัชญาและความสำคัญของหลักสูตร..."
                      />
                    </LiyonField>
                  </div>
                  <div>
                    <LiyonField label={t("curriculum.philosophy") + " (อังกฤษ)"}>
                      <textarea
                        rows={3}
                        value={formData.philosophyEn}
                        onChange={(e) => setFormData({ ...formData, philosophyEn: e.target.value })}
                        placeholder="Program philosophy..."
                      />
                    </LiyonField>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <LiyonField label={t("curriculum.overview") + " (ไทย)"}>
                      <textarea
                        rows={3}
                        value={formData.descriptionTh}
                        onChange={(e) => setFormData({ ...formData, descriptionTh: e.target.value })}
                        placeholder="คำอธิบายภาพรวมหลักสูตร..."
                      />
                    </LiyonField>
                  </div>
                  <div>
                    <LiyonField label={t("curriculum.overview") + " (อังกฤษ)"}>
                      <textarea
                        rows={3}
                        value={formData.descriptionEn}
                        onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                        placeholder="Program description..."
                      />
                    </LiyonField>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <LiyonField label={t("curriculum.handbookUrl")}>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={formData.handbookUrl}
                            onChange={(e) => setFormData({ ...formData, handbookUrl: e.target.value })}
                            placeholder="https://example.com/handbook.pdf หรือกดอัปโหลด"
                            className="flex-1"
                          />
                          <label className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer shrink-0 transition-colors shadow-xs">
                            <Upload className="h-3.5 w-3.5 text-rose-600" />
                            <span>{isUploadingDoc ? "กำลังอัปโหลด..." : "อัปโหลด PDF"}</span>
                            <input
                              type="file"
                              accept=".pdf,application/pdf"
                              className="hidden"
                              disabled={isUploadingDoc}
                              onChange={handleUploadHandbook}
                            />
                          </label>
                        </div>
                        {formData.handbookUrl && (
                          <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200">
                            <FileText className="h-4 w-4 text-rose-600 shrink-0" />
                            <a
                              href={formData.handbookUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-rose-600 hover:underline truncate flex-1 font-mono text-[11px]"
                            >
                              {formData.handbookUrl}
                            </a>
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, handbookUrl: "" })}
                              className="text-slate-400 hover:text-red-600 text-xs px-1 font-semibold"
                            >
                              ลบ
                            </button>
                          </div>
                        )}
                      </div>
                    </LiyonField>
                  </div>
                  <div>
                    <LiyonField label={t("curriculum.imageUrl")}>
                      <input
                        type="text"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        placeholder="https://example.com/cover.jpg"
                      />
                    </LiyonField>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Outcomes & Career Paths */}
            {activeTab === "outcomes" && (
              <div className="space-y-6 pt-1">
                {/* Career paths */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                    <span>{t("curriculum.careerPaths")}</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 text-sm border border-slate-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-rose-500"
                      value={newCareer}
                      onChange={(e) => setNewCareer(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addCareer();
                        }
                      }}
                      placeholder="เช่น Software Engineer, Data Scientist, Systems Analyst..."
                    />
                    <Button type="button" variant="outline" size="sm" onClick={addCareer}>
                      <Plus className="h-4 w-4 mr-1" /> เพิ่มอาชีพ
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {formData.careerPaths.map((career, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full border border-slate-200"
                      >
                        {career}
                        <button
                          type="button"
                          onClick={() => removeCareer(idx)}
                          className="hover:text-rose-600 transition-colors"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* PLOs */}
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <label className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                    <span>{t("curriculum.learningOutcomes")}</span>
                  </label>

                  <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      <div>
                        <input
                          type="text"
                          className="w-full text-xs border border-slate-300 rounded px-2 py-1.5"
                          placeholder="รหัส เช่น PLO1"
                          value={newPloCode}
                          onChange={(e) => setNewPloCode(e.target.value)}
                        />
                      </div>
                      <div className="md:col-span-3">
                        <input
                          type="text"
                          className="w-full text-xs border border-slate-300 rounded px-2 py-1.5"
                          placeholder="คำอธิบายภาษาไทย..."
                          value={newPloTh}
                          onChange={(e) => setNewPloTh(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 text-xs border border-slate-300 rounded px-2 py-1.5"
                        placeholder="คำอธิบายภาษาอังกฤษ (ถ้ามี)..."
                        value={newPloEn}
                        onChange={(e) => setNewPloEn(e.target.value)}
                      />
                      <Button type="button" variant="outline" size="sm" onClick={addPlo}>
                        <Plus className="h-3.5 w-3.5 mr-1" /> เพิ่ม PLO
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {formData.learningOutcomes.map((plo, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between p-2.5 bg-white border border-slate-200 rounded-md text-xs"
                      >
                        <div className="space-y-0.5">
                          <span className="font-bold text-rose-600 mr-2">{plo.code}:</span>
                          <span className="text-slate-800 font-medium">{plo.descTh}</span>
                          {plo.descEn && (
                            <p className="text-slate-500 italic pl-4">{plo.descEn}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removePlo(idx)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </LiyonDialogBody>

        <LiyonDialogFooter>
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleExportJson}
                className="h-8 text-xs text-slate-600 hover:text-rose-600 hover:bg-rose-50 flex items-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5 text-rose-600" />
                <span>{t("curriculum.exportJson")}</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-8 text-xs text-slate-600 hover:text-rose-600 hover:bg-rose-50 flex items-center gap-1.5"
              >
                <Upload className="h-3.5 w-3.5 text-rose-600" />
                <span>{t("curriculum.importJson")}</span>
              </Button>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("common.saving") : t("common.save")}
              </Button>
            </div>
          </div>
        </LiyonDialogFooter>
      </form>
    </LiyonDialog>

    {/* JSON Viewer/Editor Dialog */}
    <LiyonDialog open={isJsonModalOpen} onOpenChange={setIsJsonModalOpen} wide>
      <LiyonDialogCloseButton label={t("common.close")} />
      <LiyonDialogHeader
        title={t("curriculum.jsonModalTitle")}
        description={t("curriculum.jsonModalDesc")}
      />
      <LiyonDialogBody>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              JSON Data
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyJson}
                className="h-7 text-xs flex items-center gap-1 border-slate-200 hover:text-rose-600"
              >
                {isCopiedJson ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-medium">
                      {t("curriculum.copiedJson")}
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-slate-500" />
                    <span>{t("curriculum.copyJson")}</span>
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExportJson}
                className="h-7 text-xs flex items-center gap-1 border-slate-200 hover:text-rose-600"
              >
                <Download className="h-3.5 w-3.5 text-slate-500" />
                <span>{t("curriculum.exportJson")}</span>
              </Button>
            </div>
          </div>
          <textarea
            value={rawJsonText}
            onChange={(e) => setRawJsonText(e.target.value)}
            rows={15}
            className="w-full font-mono text-xs p-3 bg-slate-900 text-emerald-400 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/50 resize-y shadow-inner leading-relaxed"
            placeholder="{ ... }"
            spellCheck={false}
          />
        </div>
      </LiyonDialogBody>
      <LiyonDialogFooter>
        <div className="flex w-full items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs"
          >
            <Upload className="h-3.5 w-3.5 mr-1 text-slate-500" />
            {t("curriculum.importJson")}
          </Button>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsJsonModalOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleApplyRawJson}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              <Check className="h-4 w-4 mr-1" />
              {t("curriculum.applyJson")}
            </Button>
          </div>
        </div>
      </LiyonDialogFooter>
    </LiyonDialog>
  </>
  );
}
