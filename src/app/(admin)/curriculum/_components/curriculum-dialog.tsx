"use client";

import React, { useState } from "react";
import { GraduationCap, BookOpen, Target, Plus, Trash2 } from "lucide-react";
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
    <LiyonDialog open={open} onOpenChange={onOpenChange} wide>
      <LiyonDialogCloseButton label={t("common.close")} />
      <LiyonDialogHeader
        title={formData.id ? t("curriculum.edit") : t("curriculum.create")}
        description={t("curriculum.description")}
      />

      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <LiyonDialogBody>
          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
            {/* Tabs */}
            <div className="flex border-b border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab("general")}
                className={`pb-2.5 px-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
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
                className={`pb-2.5 px-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
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
                className={`pb-2.5 px-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === "outcomes"
                    ? "border-rose-600 text-rose-600 font-semibold"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Target className="h-4 w-4" />
                <span>{t("curriculum.tab.outcomes")}</span>
              </button>
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
                      <input
                        type="text"
                        value={formData.handbookUrl}
                        onChange={(e) => setFormData({ ...formData, handbookUrl: e.target.value })}
                        placeholder="https://example.com/handbook.pdf"
                      />
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
        </LiyonDialogFooter>
      </form>
    </LiyonDialog>
  );
}
