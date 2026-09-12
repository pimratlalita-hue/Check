"use client";

import React, { useState, useEffect } from "react";
import { Building2 } from "lucide-react";
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
} from "@/features/staff/actions";

interface DepartmentCrudDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: DepartmentDto | null;
  onSuccess: () => void;
}

interface DepartmentFormData {
  code: string;
  nameTh: string;
  nameEn: string;
  descriptionTh: string;
  descriptionEn: string;
  displayOrder: number;
  isActive: boolean;
}

const defaultFormData: DepartmentFormData = {
  code: "",
  nameTh: "",
  nameEn: "",
  descriptionTh: "",
  descriptionEn: "",
  displayOrder: 0,
  isActive: true,
};

export function DepartmentCrudDialog({
  open,
  onOpenChange,
  department,
  onSuccess,
}: DepartmentCrudDialogProps) {
  const t = useT();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<DepartmentFormData>(defaultFormData);

  useEffect(() => {
    if (department) {
      setFormData({
        code: department.code,
        nameTh: department.nameTh,
        nameEn: department.nameEn,
        descriptionTh: department.descriptionTh ?? "",
        descriptionEn: department.descriptionEn ?? "",
        displayOrder: department.displayOrder ?? 0,
        isActive: department.isActive ?? true,
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [department, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.nameTh.trim() || !formData.nameEn.trim()) {
      toast.error("กรุณากรอกรหัสและชื่อภาควิชาให้ครบถ้วน");
      return;
    }

    setIsSubmitting(true);
    try {
      if (department) {
        const res = await updateDepartmentAction({
          id: department.id,
          code: formData.code.trim().toUpperCase(),
          nameTh: formData.nameTh.trim(),
          nameEn: formData.nameEn.trim(),
          descriptionTh: formData.descriptionTh.trim() || null,
          descriptionEn: formData.descriptionEn.trim() || null,
          displayOrder: Number(formData.displayOrder) || 0,
          isActive: formData.isActive,
        });

        if (res.ok) {
          toast.success(t("curriculum.deptUpdatedSuccess"));
          onOpenChange(false);
          onSuccess();
        } else {
          toast.error(res.error.message || "เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
        }
      } else {
        const res = await createDepartmentAction({
          code: formData.code.trim().toUpperCase(),
          nameTh: formData.nameTh.trim(),
          nameEn: formData.nameEn.trim(),
          descriptionTh: formData.descriptionTh.trim() || null,
          descriptionEn: formData.descriptionEn.trim() || null,
          displayOrder: Number(formData.displayOrder) || 0,
          isActive: formData.isActive,
        });

        if (res.ok) {
          toast.success(t("curriculum.deptCreatedSuccess"));
          onOpenChange(false);
          onSuccess();
        } else {
          toast.error(res.error.message || "เกิดข้อผิดพลาดในการสร้างภาควิชา");
        }
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อระบบ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LiyonDialog open={open} onOpenChange={onOpenChange}>
      <LiyonDialogCloseButton label={t("common.close")} />
      <LiyonDialogHeader
        title={department ? t("curriculum.editDepartment") : t("curriculum.addDepartment")}
        description={t("curriculum.deptManageDesc")}
      />

      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <LiyonDialogBody>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {/* Code and Display Order */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <LiyonField label={t("curriculum.deptCode")}>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    placeholder="เช่น DFL, CPE, IT"
                    required
                    maxLength={50}
                  />
                </LiyonField>
              </div>

              <div>
                <LiyonField label={t("curriculum.deptOrder")}>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) =>
                      setFormData({ ...formData, displayOrder: parseInt(e.target.value, 10) || 0 })
                    }
                    placeholder="0"
                  />
                </LiyonField>
              </div>
            </div>

            {/* Name Thai and Name English */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <LiyonField label={t("curriculum.deptNameTh")}>
                  <input
                    type="text"
                    value={formData.nameTh}
                    onChange={(e) => setFormData({ ...formData, nameTh: e.target.value })}
                    placeholder="เช่น ภาควิชาภาษาต่างประเทศ"
                    required
                    maxLength={255}
                  />
                </LiyonField>
              </div>

              <div>
                <LiyonField label={t("curriculum.deptNameEn")}>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    placeholder="e.g. Department of Foreign Languages"
                    required
                    maxLength={255}
                  />
                </LiyonField>
              </div>
            </div>

            {/* Description Thai and English */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <LiyonField label={t("curriculum.deptDescTh")}>
                  <textarea
                    rows={3}
                    value={formData.descriptionTh}
                    onChange={(e) =>
                      setFormData({ ...formData, descriptionTh: e.target.value })
                    }
                    placeholder="รายละเอียดภาควิชา ขอบเขตภารกิจ..."
                  />
                </LiyonField>
              </div>

              <div>
                <LiyonField label={t("curriculum.deptDescEn")}>
                  <textarea
                    rows={3}
                    value={formData.descriptionEn}
                    onChange={(e) =>
                      setFormData({ ...formData, descriptionEn: e.target.value })
                    }
                    placeholder="Department mission, scope, and activities..."
                  />
                </LiyonField>
              </div>
            </div>

            {/* IsActive Toggle */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-slate-800">
                  {t("curriculum.deptIsActive")}
                </span>
                <p className="text-xs text-slate-500">
                  เปิดให้แสดงในระบบ และสามารถเลือกสังกัดหลักสูตรหรืออาจารย์ได้
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>
          </div>
        </LiyonDialogBody>

        <LiyonDialogFooter>
          <div className="flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-rose-600 hover:bg-rose-700 text-white shadow-sm flex items-center gap-1.5"
            >
              <Building2 className="h-4 w-4" />
              <span>{isSubmitting ? t("common.saving") : t("common.save")}</span>
            </Button>
          </div>
        </LiyonDialogFooter>
      </form>
    </LiyonDialog>
  );
}
