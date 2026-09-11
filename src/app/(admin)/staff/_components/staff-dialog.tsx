"use client";

import React, { useState } from "react";
import { GraduationCap, Briefcase, Phone, BookOpen } from "lucide-react";
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
import type { DepartmentDto, StaffProfileDto, StaffType, AcademicRank } from "@/features/staff";
import { createStaffAction, updateStaffAction } from "@/features/staff/actions";
import { emptyStaffForm, type StaffFormData } from "./types";

interface StaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: StaffProfileDto | null;
  departments: DepartmentDto[];
  onSuccess: () => void;
}

type TabType = "general" | "academic" | "contact" | "portfolio";

function getInitialStaffFormData(staff: StaffProfileDto | null): StaffFormData {
  if (!staff) return emptyStaffForm;
  return {
    id: staff.id,
    departmentId: staff.departmentId ?? "",
    staffType: staff.staffType,
    academicRank: staff.academicRank,
    prefixTh: staff.prefixTh ?? "",
    prefixEn: staff.prefixEn ?? "",
    firstNameTh: staff.firstNameTh,
    lastNameTh: staff.lastNameTh,
    firstNameEn: staff.firstNameEn,
    lastNameEn: staff.lastNameEn,
    positionTh: staff.positionTh,
    positionEn: staff.positionEn,
    isExecutive: staff.isExecutive,
    executiveRole: staff.executiveRole ?? "",
    executiveOrder: staff.executiveOrder,
    email: staff.email,
    phone: staff.phone ?? "",
    officeRoom: staff.officeRoom ?? "",
    officeHours: staff.officeHours ?? "",
    avatarUrl: staff.avatarUrl ?? "",
    education: staff.education ?? [],
    expertise: staff.expertise ?? [],
    researchInterests: staff.researchInterests ?? "",
    googleScholarUrl: staff.googleScholarUrl ?? "",
    scopusUrl: staff.scopusUrl ?? "",
    orcidId: staff.orcidId ?? "",
    websiteUrl: staff.websiteUrl ?? "",
    bioTh: staff.bioTh ?? "",
    bioEn: staff.bioEn ?? "",
    displayOrder: staff.displayOrder,
    isActive: staff.isActive,
  };
}

export function StaffDialog({
  open,
  onOpenChange,
  staff,
  departments,
  onSuccess,
}: StaffDialogProps) {
  const t = useT();
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [formData, setFormData] = useState<StaffFormData>(() => getInitialStaffFormData(staff));
  const [educationInput, setEducationInput] = useState(() => (staff?.education ?? []).join("\n"));
  const [expertiseInput, setExpertiseInput] = useState(() => (staff?.expertise ?? []).join(", "));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const educationArray = educationInput
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const expertiseArray = expertiseInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const payload = {
        departmentId: formData.departmentId || null,
        staffType: formData.staffType,
        academicRank: formData.academicRank,
        prefixTh: formData.prefixTh || null,
        prefixEn: formData.prefixEn || null,
        firstNameTh: formData.firstNameTh.trim(),
        lastNameTh: formData.lastNameTh.trim(),
        firstNameEn: formData.firstNameEn.trim(),
        lastNameEn: formData.lastNameEn.trim(),
        positionTh: formData.positionTh.trim(),
        positionEn: formData.positionEn.trim(),
        isExecutive: formData.isExecutive,
        executiveRole: formData.isExecutive ? formData.executiveRole || null : null,
        executiveOrder: formData.isExecutive && formData.executiveOrder !== null ? Number(formData.executiveOrder) : null,
        email: formData.email.trim(),
        phone: formData.phone || null,
        officeRoom: formData.officeRoom || null,
        officeHours: formData.officeHours || null,
        avatarUrl: formData.avatarUrl || null,
        education: educationArray.length > 0 ? educationArray : null,
        expertise: expertiseArray.length > 0 ? expertiseArray : null,
        researchInterests: formData.researchInterests || null,
        googleScholarUrl: formData.googleScholarUrl || null,
        scopusUrl: formData.scopusUrl || null,
        orcidId: formData.orcidId || null,
        websiteUrl: formData.websiteUrl || null,
        bioTh: formData.bioTh || null,
        bioEn: formData.bioEn || null,
        displayOrder: Number(formData.displayOrder) || 0,
        isActive: formData.isActive,
      };

      if (formData.id) {
        const res = await updateStaffAction({ ...payload, id: formData.id });
        if (!res.ok) throw new Error(res.error.message);
        toast.success(t("staff.updatedSuccess"));
      } else {
        const res = await createStaffAction(payload);
        if (!res.ok) throw new Error(res.error.message);
        toast.success(t("staff.createdSuccess"));
      }

      onOpenChange(false);
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving staff";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LiyonDialog open={open} onOpenChange={onOpenChange} wide>
      <LiyonDialogCloseButton label={t("staff.cancel")} />
      <LiyonDialogHeader
        title={formData.id ? t("staff.edit") : t("staff.create")}
        description={t("staff.description")}
      />

      <form onSubmit={handleSubmit}>
        <LiyonDialogBody>
          <div className="space-y-4 py-2 max-h-[65vh] overflow-y-auto pr-1">
            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 gap-2">
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
                <span>{t("staff.tab.general")}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("academic")}
                className={`pb-2.5 px-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === "academic"
                    ? "border-rose-600 text-rose-600 font-semibold"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Briefcase className="h-4 w-4" />
                <span>{t("staff.tab.academic")}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("contact")}
                className={`pb-2.5 px-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === "contact"
                    ? "border-rose-600 text-rose-600 font-semibold"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Phone className="h-4 w-4" />
                <span>{t("staff.tab.contact")}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("portfolio")}
                className={`pb-2.5 px-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === "portfolio"
                    ? "border-rose-600 text-rose-600 font-semibold"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>{t("staff.tab.portfolio")}</span>
              </button>
            </div>

            {/* Tab 1: General Info */}
            {activeTab === "general" && (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <LiyonField label={t("staff.prefixTh")}>
                      <input
                        type="text"
                        value={formData.prefixTh}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFormData({ ...formData, prefixTh: e.target.value })
                        }
                        placeholder="ผศ.ดร. / อาจารย์"
                      />
                    </LiyonField>
                  </div>
                  <div className="md:col-span-2">
                    <LiyonField label={t("staff.firstNameTh")}>
                      <input
                        type="text"
                        value={formData.firstNameTh}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFormData({ ...formData, firstNameTh: e.target.value })
                        }
                        required
                      />
                    </LiyonField>
                  </div>
                  <div>
                    <LiyonField label={t("staff.lastNameTh")}>
                      <input
                        type="text"
                        value={formData.lastNameTh}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFormData({ ...formData, lastNameTh: e.target.value })
                        }
                        required
                      />
                    </LiyonField>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <LiyonField label={t("staff.prefixEn")}>
                      <input
                        type="text"
                        value={formData.prefixEn}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFormData({ ...formData, prefixEn: e.target.value })
                        }
                        placeholder="Asst. Prof. Dr."
                      />
                    </LiyonField>
                  </div>
                  <div className="md:col-span-2">
                    <LiyonField label={t("staff.firstNameEn")}>
                      <input
                        type="text"
                        value={formData.firstNameEn}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFormData({ ...formData, firstNameEn: e.target.value })
                        }
                        required
                      />
                    </LiyonField>
                  </div>
                  <div>
                    <LiyonField label={t("staff.lastNameEn")}>
                      <input
                        type="text"
                        value={formData.lastNameEn}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFormData({ ...formData, lastNameEn: e.target.value })
                        }
                        required
                      />
                    </LiyonField>
                  </div>
                </div>

                <LiyonField label={t("staff.avatar")}>
                  <input
                    type="text"
                    value={formData.avatarUrl}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, avatarUrl: e.target.value })
                    }
                    placeholder="https://images.unsplash.com/..."
                  />
                </LiyonField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <LiyonField label={t("staff.bioTh")}>
                    <textarea
                      className="w-full text-sm border border-slate-200 rounded-lg p-2.5 focus:border-rose-500 focus:outline-none min-h-[80px]"
                      value={formData.bioTh}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setFormData({ ...formData, bioTh: e.target.value })
                      }
                      placeholder="ประวัติการทำงาน หรือผลงานโดยสังเขป..."
                    />
                  </LiyonField>
                  <LiyonField label={t("staff.bioEn")}>
                    <textarea
                      className="w-full text-sm border border-slate-200 rounded-lg p-2.5 focus:border-rose-500 focus:outline-none min-h-[80px]"
                      value={formData.bioEn}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setFormData({ ...formData, bioEn: e.target.value })
                      }
                      placeholder="Brief background and career highlights..."
                    />
                  </LiyonField>
                </div>
              </div>
            )}

            {/* Tab 2: Academic & Position */}
            {activeTab === "academic" && (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <LiyonField label={t("staff.type")}>
                    <LiyonSelect
                      value={formData.staffType}
                      onChange={(e) => setFormData({ ...formData, staffType: e.target.value as StaffType })}
                    >
                      <option value="ACADEMIC">{t("staff.type.ACADEMIC")}</option>
                      <option value="SUPPORT">{t("staff.type.SUPPORT")}</option>
                      <option value="EXECUTIVE">{t("staff.type.EXECUTIVE")}</option>
                    </LiyonSelect>
                  </LiyonField>

                  <LiyonField label={t("staff.rank")}>
                    <LiyonSelect
                      value={formData.academicRank}
                      onChange={(e) => setFormData({ ...formData, academicRank: e.target.value as AcademicRank })}
                    >
                      <option value="PROFESSOR">{t("staff.rank.PROFESSOR")}</option>
                      <option value="ASSOCIATE_PROFESSOR">{t("staff.rank.ASSOCIATE_PROFESSOR")}</option>
                      <option value="ASSISTANT_PROFESSOR">{t("staff.rank.ASSISTANT_PROFESSOR")}</option>
                      <option value="LECTURER">{t("staff.rank.LECTURER")}</option>
                      <option value="NONE">{t("staff.rank.NONE")}</option>
                    </LiyonSelect>
                  </LiyonField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <LiyonField label={t("staff.department")}>
                    <LiyonSelect
                      value={formData.departmentId}
                      onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    >
                      <option value="">{t("staff.allDepartments")} (ไม่ระบุ)</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.nameTh} ({d.code})
                        </option>
                      ))}
                    </LiyonSelect>
                  </LiyonField>

                  <LiyonField label={t("staff.order")}>
                    <input
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })
                      }
                    />
                  </LiyonField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <LiyonField label={t("staff.positionTh")}>
                    <input
                      type="text"
                      value={formData.positionTh}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, positionTh: e.target.value })
                      }
                      placeholder="อาจารย์ประจำ / นักวิชาการคอมพิวเตอร์"
                      required
                    />
                  </LiyonField>
                  <LiyonField label={t("staff.positionEn")}>
                    <input
                      type="text"
                      value={formData.positionEn}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, positionEn: e.target.value })
                      }
                      placeholder="Lecturer / Computer Technical Officer"
                      required
                    />
                  </LiyonField>
                </div>

                {/* Executive Settings */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isExecutive}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, isExecutive: e.target.checked })
                      }
                      className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                    />
                    <span className="text-sm font-semibold text-slate-800">{t("staff.isExecutive")}</span>
                  </label>

                  {formData.isExecutive && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                      <div className="md:col-span-2">
                        <LiyonField label={t("staff.executiveRole")}>
                          <input
                            type="text"
                            value={formData.executiveRole}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setFormData({ ...formData, executiveRole: e.target.value })
                            }
                            placeholder="คณบดี / รองคณบดีฝ่ายวิชาการ"
                          />
                        </LiyonField>
                      </div>
                      <div>
                        <LiyonField label={t("staff.executiveOrder")}>
                          <input
                            type="number"
                            value={formData.executiveOrder ?? ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setFormData({
                                ...formData,
                                executiveOrder: e.target.value ? parseInt(e.target.value) : null,
                              })
                            }
                            placeholder="1, 2, 3..."
                          />
                        </LiyonField>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: Contact Info */}
            {activeTab === "contact" && (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <LiyonField label={t("staff.email")}>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="example@faculty.ac.th"
                      required
                    />
                  </LiyonField>
                  <LiyonField label={t("staff.phone")}>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="02-123-4567 ต่อ 1234"
                    />
                  </LiyonField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <LiyonField label={t("staff.officeRoom")}>
                    <input
                      type="text"
                      value={formData.officeRoom}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, officeRoom: e.target.value })
                      }
                      placeholder="อาคาร 1 ชั้น 4 ห้อง 1405"
                    />
                  </LiyonField>
                  <LiyonField label={t("staff.officeHours")}>
                    <input
                      type="text"
                      value={formData.officeHours}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, officeHours: e.target.value })
                      }
                      placeholder="จันทร์-พุธ 13:00 - 15:00 น."
                    />
                  </LiyonField>
                </div>
              </div>
            )}

            {/* Tab 4: Portfolio & Research */}
            {activeTab === "portfolio" && (
              <div className="space-y-4 pt-1">
                <LiyonField label={`${t("staff.education")} (1 บรรทัด = 1 วุฒิการศึกษา)`}>
                  <textarea
                    className="w-full text-sm border border-slate-200 rounded-lg p-2.5 focus:border-rose-500 focus:outline-none min-h-[90px]"
                    value={educationInput}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setEducationInput(e.target.value)
                    }
                    placeholder={"Ph.D. in Computer Science, Carnegie Mellon University, 2018\nวท.ม. วิทยาการคอมพิวเตอร์, จุฬาฯ, 2557\nวท.บ. วิศวกรรมซอฟต์แวร์, 2554"}
                  />
                </LiyonField>

                <LiyonField label={`${t("staff.expertise")} (คั่นด้วยเครื่องหมายจุลภาค ,)`}>
                  <input
                    type="text"
                    value={expertiseInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setExpertiseInput(e.target.value)
                    }
                    placeholder="Artificial Intelligence, Computer Vision, Deep Learning, Cloud Computing"
                  />
                </LiyonField>

                <LiyonField label={t("staff.researchInterests")}>
                  <textarea
                    className="w-full text-sm border border-slate-200 rounded-lg p-2.5 focus:border-rose-500 focus:outline-none min-h-[70px]"
                    value={formData.researchInterests}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setFormData({ ...formData, researchInterests: e.target.value })
                    }
                    placeholder="หัวข้องานวิจัยที่สนใจ เช่น ปัญญาประดิษฐ์ทางการแพทย์, การประมวลผลภาษาธรรมชาติ..."
                  />
                </LiyonField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <LiyonField label={t("staff.googleScholar")}>
                    <input
                      type="text"
                      value={formData.googleScholarUrl}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, googleScholarUrl: e.target.value })
                      }
                      placeholder="https://scholar.google.com/citations?user=..."
                    />
                  </LiyonField>
                  <LiyonField label={t("staff.scopus")}>
                    <input
                      type="text"
                      value={formData.scopusUrl}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, scopusUrl: e.target.value })
                      }
                      placeholder="https://www.scopus.com/authid/detail.uri?authorId=..."
                    />
                  </LiyonField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <LiyonField label={t("staff.orcid")}>
                    <input
                      type="text"
                      value={formData.orcidId}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, orcidId: e.target.value })
                      }
                      placeholder="0000-0002-1825-0097"
                    />
                  </LiyonField>
                  <LiyonField label={t("staff.website")}>
                    <input
                      type="text"
                      value={formData.websiteUrl}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, websiteUrl: e.target.value })
                      }
                      placeholder="https://faculty.ac.th/~somchai"
                    />
                  </LiyonField>
                </div>
              </div>
            )}
          </div>
        </LiyonDialogBody>

        <LiyonDialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {t("staff.cancel")}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "..." : t("staff.save")}
          </Button>
        </LiyonDialogFooter>
      </form>
    </LiyonDialog>
  );
}
