"use client";

import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/shared/lib/i18n/client";
import {
  LiyonDialog,
  LiyonDialogCloseButton,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonField,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type { DepartmentDto } from "@/features/staff";
import {
  createDepartmentAction,
  updateDepartmentAction,
  deleteDepartmentAction,
} from "@/features/staff/actions";
import { emptyDepartmentForm, type DepartmentFormData } from "./types";

interface DepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: DepartmentDto[];
  onRefresh: () => void;
}

export function DepartmentDialog({
  open,
  onOpenChange,
  departments,
  onRefresh,
}: DepartmentDialogProps) {
  const t = useT();
  const [editingDept, setEditingDept] = useState<DepartmentFormData | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenCreate = () => {
    setEditingDept({ ...emptyDepartmentForm });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (dept: DepartmentDto) => {
    setEditingDept({
      id: dept.id,
      code: dept.code,
      nameTh: dept.nameTh,
      nameEn: dept.nameEn,
      descriptionTh: dept.descriptionTh ?? "",
      descriptionEn: dept.descriptionEn ?? "",
      displayOrder: dept.displayOrder,
      isActive: dept.isActive,
    });
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;
    setIsSubmitting(true);

    try {
      if (editingDept.id) {
        const res = await updateDepartmentAction({
          id: editingDept.id,
          code: editingDept.code,
          nameTh: editingDept.nameTh,
          nameEn: editingDept.nameEn,
          descriptionTh: editingDept.descriptionTh || null,
          descriptionEn: editingDept.descriptionEn || null,
          displayOrder: Number(editingDept.displayOrder) || 0,
          isActive: editingDept.isActive,
        });
        if (!res.ok) throw new Error(res.error.message);
        toast.success(t("staff.deptUpdatedSuccess"));
      } else {
        const res = await createDepartmentAction({
          code: editingDept.code,
          nameTh: editingDept.nameTh,
          nameEn: editingDept.nameEn,
          descriptionTh: editingDept.descriptionTh || null,
          descriptionEn: editingDept.descriptionEn || null,
          displayOrder: Number(editingDept.displayOrder) || 0,
          isActive: editingDept.isActive,
        });
        if (!res.ok) throw new Error(res.error.message);
        toast.success(t("staff.deptCreatedSuccess"));
      }
      setIsFormOpen(false);
      setEditingDept(null);
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving department";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("staff.deleteConfirm"))) return;
    try {
      const res = await deleteDepartmentAction(id);
      if (!res.ok) throw new Error(res.error.message);
      toast.success(t("staff.deletedSuccess"));
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting department";
      toast.error(msg);
    }
  };

  return (
    <LiyonDialog open={open} onOpenChange={onOpenChange} wide>
      <LiyonDialogCloseButton label={t("staff.cancel")} />
      <LiyonDialogHeader
        title={t("staff.departmentsManage")}
        description={t("staff.description")}
      />

      <LiyonDialogBody>
        <div className="space-y-4 py-2">
          {isFormOpen && editingDept ? (
            <form onSubmit={handleSave} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="font-semibold text-sm text-slate-800">
                {editingDept.id ? t("staff.edit") : t("staff.departmentsManage")}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <LiyonField label={t("staff.departmentCode")}>
                  <input
                    type="text"
                    value={editingDept.code}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditingDept({ ...editingDept, code: e.target.value.toUpperCase() })
                    }
                    placeholder="e.g. CPE"
                    required
                  />
                </LiyonField>
                <div className="md:col-span-2">
                  <LiyonField label={t("staff.order")}>
                    <input
                      type="number"
                      value={editingDept.displayOrder}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEditingDept({ ...editingDept, displayOrder: parseInt(e.target.value) || 0 })
                      }
                    />
                  </LiyonField>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <LiyonField label={t("staff.departmentNameTh")}>
                  <input
                    type="text"
                    value={editingDept.nameTh}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditingDept({ ...editingDept, nameTh: e.target.value })
                    }
                    placeholder="ภาควิชาวิศวกรรมคอมพิวเตอร์"
                    required
                  />
                </LiyonField>
                <LiyonField label={t("staff.departmentNameEn")}>
                  <input
                    type="text"
                    value={editingDept.nameEn}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditingDept({ ...editingDept, nameEn: e.target.value })
                    }
                    placeholder="Department of Computer Engineering"
                    required
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
                    setEditingDept(null);
                  }}
                >
                  {t("staff.cancel")}
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting}>
                  {t("staff.save")}
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex justify-end">
              <Button size="sm" onClick={handleOpenCreate} className="gap-1 text-xs">
                <Plus className="h-3.5 w-3.5" />
                <span>{t("staff.departmentsManage")}</span>
              </Button>
            </div>
          )}

          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
            {departments.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">
                {t("staff.empty")}
              </div>
            ) : (
              departments.map((dept) => (
                <div
                  key={dept.id}
                  className="p-3.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-md">
                        {dept.code}
                      </span>
                      <span className="font-medium text-slate-800 text-sm">{dept.nameTh}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{dept.nameEn}</div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900"
                      onClick={() => handleOpenEdit(dept)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      onClick={() => handleDelete(dept.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </LiyonDialogBody>

      <LiyonDialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          {t("staff.cancel")}
        </Button>
      </LiyonDialogFooter>
    </LiyonDialog>
  );
}
