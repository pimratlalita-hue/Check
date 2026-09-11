"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, BookOpen, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/shared/lib/i18n/client";
import {
  LiyonDialog,
  LiyonDialogCloseButton,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonField,
  LiyonSelect,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type {
  ProgramDto,
  ProgramCourseDto,
  CourseCategory,
} from "@/features/curriculum";
import {
  listProgramCoursesAction,
  createProgramCourseAction,
  updateProgramCourseAction,
  deleteProgramCourseAction,
} from "@/features/curriculum/actions";
import { emptyCourseForm, type CourseFormData } from "./types";

interface CoursesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  program: ProgramDto | null;
  onCoursesUpdated?: () => void;
}

export function CoursesDialog({
  open,
  onOpenChange,
  program,
  onCoursesUpdated,
}: CoursesDialogProps) {
  const t = useT();
  const [courses, setCourses] = useState<ProgramCourseDto[]>([]);
  const [loading, setLoading] = useState(Boolean(program?.id));
  const [editingCourse, setEditingCourse] = useState<CourseFormData | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refreshCourses = useCallback(async () => {
    if (!program?.id) return;
    setLoading(true);
    try {
      const res = await listProgramCoursesAction(program.id);
      if (res.ok) {
        setCourses(res.data);
      } else {
        toast.error(res.error.message);
      }
    } finally {
      setLoading(false);
    }
  }, [program?.id]);

  useEffect(() => {
    let active = true;
    if (!open || !program?.id) return;

    listProgramCoursesAction(program.id).then((res) => {
      if (!active) return;
      if (res.ok) {
        setCourses(res.data);
      } else {
        toast.error(res.error.message);
      }
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [open, program?.id]);

  const handleOpenAddForm = () => {
    if (!program) return;
    setEditingCourse({
      ...emptyCourseForm,
      programId: program.id,
    });
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (course: ProgramCourseDto) => {
    setEditingCourse({
      id: course.id,
      programId: course.programId,
      code: course.code,
      nameTh: course.nameTh,
      nameEn: course.nameEn,
      credits: course.credits,
      creditHours: course.creditHours ?? "",
      category: course.category,
      semester: course.semester,
      year: course.year,
      descriptionTh: course.descriptionTh ?? "",
      descriptionEn: course.descriptionEn ?? "",
      prerequisite: course.prerequisite ?? "",
      displayOrder: course.displayOrder,
    });
    setIsFormOpen(true);
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm(t("curriculum.deleteCourseConfirm"))) return;
    try {
      const res = await deleteProgramCourseAction(id);
      if (res.ok) {
        toast.success(t("curriculum.courseDeletedSuccess"));
        refreshCourses();
        onCoursesUpdated?.();
      } else {
        toast.error(res.error.message);
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการลบรายวิชา");
    }
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse || !program) return;
    setIsSubmitting(true);

    try {
      const payload = {
        ...editingCourse,
        programId: program.id,
        creditHours: editingCourse.creditHours.trim() || null,
        descriptionTh: editingCourse.descriptionTh.trim() || null,
        descriptionEn: editingCourse.descriptionEn.trim() || null,
        prerequisite: editingCourse.prerequisite.trim() || null,
      };

      if (editingCourse.id) {
        const res = await updateProgramCourseAction(payload);
        if (res.ok) {
          toast.success(t("curriculum.courseUpdatedSuccess"));
          setIsFormOpen(false);
          setEditingCourse(null);
          refreshCourses();
          onCoursesUpdated?.();
        } else {
          toast.error(res.error.message);
        }
      } else {
        const res = await createProgramCourseAction(payload);
        if (res.ok) {
          toast.success(t("curriculum.courseCreatedSuccess"));
          setIsFormOpen(false);
          setEditingCourse(null);
          refreshCourses();
          onCoursesUpdated?.();
        } else {
          toast.error(res.error.message);
        }
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการบันทึกรายวิชา");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryLabels: Record<CourseCategory, string> = {
    GENERAL_EDUCATION: t("curriculum.category.GENERAL_EDUCATION"),
    CORE_COURSE: t("curriculum.category.CORE_COURSE"),
    MAJOR_ELECTIVE: t("curriculum.category.MAJOR_ELECTIVE"),
    FREE_ELECTIVE: t("curriculum.category.FREE_ELECTIVE"),
    THESIS: t("curriculum.category.THESIS"),
  };

  const groupedCourses = courses.reduce((acc, course) => {
    const cat = course.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(course);
    return acc;
  }, {} as Record<CourseCategory, ProgramCourseDto[]>);

  const categories: CourseCategory[] = [
    "GENERAL_EDUCATION",
    "CORE_COURSE",
    "MAJOR_ELECTIVE",
    "FREE_ELECTIVE",
    "THESIS",
  ];

  return (
    <LiyonDialog open={open} onOpenChange={onOpenChange} wide>
      <LiyonDialogCloseButton label={t("common.close")} />
      <LiyonDialogHeader
        title={`${t("curriculum.manageCourses")} - ${program?.nameTh ?? ""}`}
        description={`${program?.code ?? ""} (${courses.length} รายวิชา)`}
      />

      <LiyonDialogBody>
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
          {/* Top Toolbar */}
          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="text-sm">
              <span className="font-semibold text-slate-800">{program?.code}</span>
              <span className="text-slate-500 ml-2">
                ({courses.length} รายวิชา, รวม {courses.reduce((sum, c) => sum + c.credits, 0)} หน่วยกิต)
              </span>
            </div>
            {!isFormOpen && (
              <Button size="sm" onClick={handleOpenAddForm}>
                <Plus className="h-4 w-4 mr-1.5" />
                {t("curriculum.addCourse")}
              </Button>
            )}
          </div>

          {/* Inline Add/Edit Form */}
          {isFormOpen && editingCourse && (
            <form
              onSubmit={handleSaveCourse}
              className="bg-rose-50/50 p-4 rounded-xl border border-rose-200 space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between pb-2 border-b border-rose-200">
                <h4 className="text-sm font-semibold text-rose-900">
                  {editingCourse.id ? t("curriculum.editCourse") : t("curriculum.addCourse")}
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingCourse(null);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  {t("common.cancel")}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <LiyonField label={t("curriculum.courseCode")}>
                    <input
                      type="text"
                      value={editingCourse.code}
                      onChange={(e) => setEditingCourse({ ...editingCourse, code: e.target.value })}
                      placeholder="e.g. 01418111"
                      required
                    />
                  </LiyonField>
                </div>
                <div className="md:col-span-3">
                  <LiyonField label={t("curriculum.courseNameTh")}>
                    <input
                      type="text"
                      value={editingCourse.nameTh}
                      onChange={(e) => setEditingCourse({ ...editingCourse, nameTh: e.target.value })}
                      placeholder="ชื่อวิชาภาษาไทย"
                      required
                    />
                  </LiyonField>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <LiyonField label={t("curriculum.courseNameEn")}>
                    <input
                      type="text"
                      value={editingCourse.nameEn}
                      onChange={(e) => setEditingCourse({ ...editingCourse, nameEn: e.target.value })}
                      placeholder="Course name in English"
                      required
                    />
                  </LiyonField>
                </div>
                <div>
                  <LiyonField label={t("curriculum.courseCategory")}>
                    <LiyonSelect
                      value={editingCourse.category}
                      onChange={(e) =>
                        setEditingCourse({
                          ...editingCourse,
                          category: e.target.value as CourseCategory,
                        })
                      }
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {categoryLabels[c]}
                        </option>
                      ))}
                    </LiyonSelect>
                  </LiyonField>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <LiyonField label={t("curriculum.courseCredits")}>
                    <input
                      type="number"
                      value={editingCourse.credits}
                      onChange={(e) =>
                        setEditingCourse({ ...editingCourse, credits: parseInt(e.target.value) || 0 })
                      }
                      required
                    />
                  </LiyonField>
                </div>
                <div>
                  <LiyonField label={t("curriculum.courseCreditHours")}>
                    <input
                      type="text"
                      value={editingCourse.creditHours}
                      onChange={(e) =>
                        setEditingCourse({ ...editingCourse, creditHours: e.target.value })
                      }
                      placeholder="3(2-2-5)"
                    />
                  </LiyonField>
                </div>
                <div>
                  <LiyonField label={t("curriculum.courseYear")}>
                    <input
                      type="number"
                      min={1}
                      max={6}
                      value={editingCourse.year ?? ""}
                      onChange={(e) =>
                        setEditingCourse({
                          ...editingCourse,
                          year: e.target.value ? parseInt(e.target.value) : null,
                        })
                      }
                      placeholder="ปี 1, 2, 3, 4"
                    />
                  </LiyonField>
                </div>
                <div>
                  <LiyonField label={t("curriculum.courseSemester")}>
                    <input
                      type="number"
                      min={1}
                      max={3}
                      value={editingCourse.semester ?? ""}
                      onChange={(e) =>
                        setEditingCourse({
                          ...editingCourse,
                          semester: e.target.value ? parseInt(e.target.value) : null,
                        })
                      }
                      placeholder="ภาค 1 หรือ 2"
                    />
                  </LiyonField>
                </div>
              </div>

              <div>
                <LiyonField label={t("curriculum.coursePrerequisite")}>
                  <input
                    type="text"
                    value={editingCourse.prerequisite}
                    onChange={(e) =>
                      setEditingCourse({ ...editingCourse, prerequisite: e.target.value })
                    }
                    placeholder="เช่น 01418111 หรือ ไม่มี"
                  />
                </LiyonField>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingCourse(null);
                  }}
                >
                  {t("common.cancel")}
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? t("common.saving") : t("common.save")}
                </Button>
              </div>
            </form>
          )}

          {/* Courses List */}
          {loading ? (
            <div className="py-12 text-center text-slate-500">{t("common.loading")}</div>
          ) : courses.length === 0 ? (
            <div className="py-12 text-center text-slate-500 flex flex-col items-center">
              <AlertCircle className="h-10 w-10 text-slate-400 mb-2" />
              <p className="font-medium text-slate-700">ยังไม่มีรายวิชาในหลักสูตรนี้</p>
              <p className="text-xs text-slate-400 mt-1">
                คลิกปุ่ม &quot;เพิ่มรายวิชา&quot; ด้านบนเพื่อเพิ่มวิชาแรก
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {categories.map((cat) => {
                const catCourses = groupedCourses[cat] ?? [];
                if (catCourses.length === 0) return null;
                return (
                  <div key={cat} className="space-y-2">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-rose-500" />
                        {categoryLabels[cat]} ({catCourses.length})
                      </h4>
                      <span className="text-xs text-slate-500 font-medium">
                        รวม {catCourses.reduce((sum, c) => sum + c.credits, 0)} หน่วยกิต
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100 bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
                      {catCourses.map((c) => (
                        <div
                          key={c.id}
                          className="p-3 hover:bg-slate-50 flex items-center justify-between transition-colors gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                                {c.code}
                              </span>
                              <span className="text-sm font-semibold text-slate-800">
                                {c.nameTh}
                              </span>
                              <span className="text-xs text-slate-500 font-normal">
                                ({c.nameEn})
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                              <span>
                                <strong>{c.credits}</strong> หน่วยกิต{" "}
                                {c.creditHours ? `(${c.creditHours})` : ""}
                              </span>
                              {(c.year || c.semester) && (
                                <span>
                                  ชั้นปีที่ {c.year ?? "-"} ภาคการศึกษาที่ {c.semester ?? "-"}
                                </span>
                              )}
                              {c.prerequisite && (
                                <span className="text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded">
                                  วิชาบังคับก่อน: {c.prerequisite}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditForm(c)}
                              className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCourse(c.id)}
                              className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </LiyonDialogBody>
    </LiyonDialog>
  );
}
