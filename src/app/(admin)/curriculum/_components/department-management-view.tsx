"use client";

import React, { useState, useMemo, useTransition } from "react";
import {
  Building2,
  GraduationCap,
  Users,
  Plus,
  Pencil,
  Trash2,
  Search,
  ArrowRightLeft,
  AlertCircle,
  FolderOpen,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import {
  LiyonCard,
  DataTable,
  StatusPill,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonDialogCloseButton,
  LiyonSelect,
  type DataTableColumn,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type { DepartmentDto } from "@/features/staff";
import type { ProgramDto } from "@/features/curriculum";
import { deleteDepartmentAction } from "@/features/staff/actions";
import { assignProgramDepartmentAction } from "@/features/curriculum/actions";
import { DepartmentCrudDialog } from "./department-crud-dialog";

interface DepartmentManagementViewProps {
  departments: DepartmentDto[];
  programs: ProgramDto[];
  canManage: boolean;
  onRefresh: () => void;
}

export function DepartmentManagementView({
  departments,
  programs,
  canManage,
  onRefresh,
}: DepartmentManagementViewProps) {
  const t = useT();
  const locale = useLocale();
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  // Dialog states
  const [isCrudOpen, setIsCrudOpen] = useState(false);
  const [selectedDeptForCrud, setSelectedDeptForCrud] = useState<DepartmentDto | null>(null);

  const [isProgramsModalOpen, setIsProgramsModalOpen] = useState(false);
  const [activeDeptForPrograms, setActiveDeptForPrograms] = useState<DepartmentDto | null>(null);
  const [selectedProgramToAssign, setSelectedProgramToAssign] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);

  // Filtered departments
  const filteredDepartments = useMemo(() => {
    if (!search.trim()) return departments;
    const q = search.toLowerCase();
    return departments.filter(
      (d) =>
        d.code.toLowerCase().includes(q) ||
        d.nameTh.toLowerCase().includes(q) ||
        d.nameEn.toLowerCase().includes(q)
    );
  }, [departments, search]);

  // KPI Calculations
  const stats = useMemo(() => {
    const totalDepts = departments.length;
    const activeDepts = departments.filter((d) => d.isActive).length;
    const assignedCount = programs.filter((p) => Boolean(p.departmentId)).length;
    const unassignedCount = programs.filter((p) => !p.departmentId).length;
    const totalStaff = departments.reduce((acc, d) => acc + (d.staffCount ?? 0), 0);

    return {
      totalDepts,
      activeDepts,
      assignedCount,
      unassignedCount,
      totalStaff,
    };
  }, [departments, programs]);

  // Unassigned programs list
  const unassignedPrograms = useMemo(() => {
    return programs.filter((p) => !p.departmentId);
  }, [programs]);

  // Handle Delete Department
  const handleDelete = async (dept: DepartmentDto) => {
    const assigned = programs.filter((p) => p.departmentId === dept.id);
    if (assigned.length > 0) {
      toast.error(
        `ไม่สามารถลบภาควิชา ${dept.code} ได้ เนื่องจากมี ${assigned.length} หลักสูตรที่สังกัดอยู่ กรุณาย้ายหรือนำหลักสูตรออกก่อน`
      );
      return;
    }

    if (!confirm(t("curriculum.deleteDeptConfirm"))) return;

    try {
      const res = await deleteDepartmentAction(dept.id);
      if (res.ok) {
        toast.success(t("curriculum.deptDeletedSuccess"));
        onRefresh();
      } else {
        toast.error(res.error.message || "เกิดข้อผิดพลาดในการลบภาควิชา");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อระบบ");
    }
  };

  // Open manage programs modal
  const openManagePrograms = (dept: DepartmentDto) => {
    setActiveDeptForPrograms(dept);
    setSelectedProgramToAssign("");
    setIsProgramsModalOpen(true);
  };

  // Assign program to current department
  const handleAssignProgram = async () => {
    if (!activeDeptForPrograms || !selectedProgramToAssign) return;
    setIsAssigning(true);
    try {
      const res = await assignProgramDepartmentAction({
        programId: selectedProgramToAssign,
        departmentId: activeDeptForPrograms.id,
      });

      if (res.ok) {
        toast.success(t("curriculum.assignDeptSuccess"));
        setSelectedProgramToAssign("");
        onRefresh();
      } else {
        toast.error(res.error.message || "ไม่สามารถกำหนดภาควิชาสังกัดได้");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อระบบ");
    } finally {
      setIsAssigning(false);
    }
  };

  // Unassign program (set departmentId to null)
  const handleUnassignProgram = async (programId: string) => {
    setIsAssigning(true);
    try {
      const res = await assignProgramDepartmentAction({
        programId,
        departmentId: null,
      });

      if (res.ok) {
        toast.success("นำหลักสูตรออกจากสังกัดเรียบร้อยแล้ว");
        onRefresh();
      } else {
        toast.error(res.error.message || "ไม่สามารถนำหลักสูตรออกจากสังกัดได้");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อระบบ");
    } finally {
      setIsAssigning(false);
    }
  };

  // Programs currently assigned to activeDeptForPrograms
  const programsInActiveDept = useMemo(() => {
    if (!activeDeptForPrograms) return [];
    return programs.filter((p) => p.departmentId === activeDeptForPrograms.id);
  }, [programs, activeDeptForPrograms]);

  // Candidates available to be assigned to activeDeptForPrograms (programs not already in this department)
  const availableProgramsToAssign = useMemo(() => {
    if (!activeDeptForPrograms) return [];
    return programs.filter((p) => p.departmentId !== activeDeptForPrograms.id);
  }, [programs, activeDeptForPrograms]);

  // Table Columns
  const columns: DataTableColumn<DepartmentDto>[] = [
    {
      key: "code",
      header: t("curriculum.deptCode"),
      render: (dept) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
              {dept.code}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            {t("curriculum.deptOrder")}: {dept.displayOrder}
          </div>
        </div>
      ),
    },
    {
      key: "name",
      header: t("curriculum.deptNameTh"),
      render: (dept) => (
        <div className="max-w-md">
          <div className="font-semibold text-slate-900 text-sm">{dept.nameTh}</div>
          <div className="text-xs text-slate-500">{dept.nameEn}</div>
          {dept.descriptionTh && (
            <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
              {locale === "en" ? dept.descriptionEn || dept.descriptionTh : dept.descriptionTh}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "programCount",
      header: t("curriculum.deptProgramCount"),
      render: (dept) => {
        const assigned = programs.filter((p) => p.departmentId === dept.id);
        const count = assigned.length;
        return (
          <button
            type="button"
            onClick={() => openManagePrograms(dept)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
            title="คลิกเพื่อจัดการหลักสูตรในสังกัด"
          >
            <GraduationCap className="h-3.5 w-3.5" />
            <span>{count} หลักสูตร</span>
          </button>
        );
      },
    },
    {
      key: "staffCount",
      header: t("curriculum.deptStaffCount"),
      render: (dept) => (
        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
          <Users className="h-3.5 w-3.5 text-slate-500" />
          <span>{dept.staffCount ?? 0} คน</span>
        </div>
      ),
    },
    {
      key: "status",
      header: t("curriculum.status"),
      render: (dept) => (
        <StatusPill tone={dept.isActive ? "ok" : "off"}>
          {dept.isActive ? "เปิดใช้งาน" : "ปิดชั่วคราว"}
        </StatusPill>
      ),
    },
    {
      key: "actions",
      header: t("common.actions"),
      render: (dept) => (
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => openManagePrograms(dept)}
            className="h-8 px-2.5 text-xs text-indigo-600 hover:text-indigo-700 hover:border-indigo-300"
            title="จัดการหลักสูตรในสังกัด"
          >
            <ArrowRightLeft className="h-3.5 w-3.5 mr-1" />
            <span>จัดเก็บหลักสูตร</span>
          </Button>

          {canManage && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedDeptForCrud(dept);
                  setIsCrudOpen(true);
                }}
                className="h-8 w-8 p-0 text-slate-600 hover:text-rose-600"
                title="แก้ไขภาควิชา"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDelete(dept)}
                className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:border-rose-300"
                title="ลบภาควิชา"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Departments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{stats.totalDepts}</div>
            <div className="text-xs text-slate-500 font-medium">ภาควิชาและส่วนงาน</div>
          </div>
        </div>

        {/* Assigned Programs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{stats.assignedCount}</div>
            <div className="text-xs text-slate-500 font-medium">หลักสูตรสังกัดภาควิชา</div>
          </div>
        </div>

        {/* Unassigned Programs */}
        <div className={`bg-white p-5 rounded-2xl border shadow-xs flex items-center gap-4 ${
          stats.unassignedCount > 0 ? "border-amber-200 bg-amber-50/20" : "border-slate-200/80"
        }`}>
          <div className={`p-3 rounded-xl border ${
            stats.unassignedCount > 0
              ? "bg-amber-100 text-amber-700 border-amber-200"
              : "bg-emerald-50 text-emerald-600 border-emerald-100"
          }`}>
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{stats.unassignedCount}</div>
            <div className="text-xs text-slate-500 font-medium">หลักสูตรยังไม่ระบุภาควิชา</div>
          </div>
        </div>

        {/* Total Faculty & Staff */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{stats.totalStaff}</div>
            <div className="text-xs text-slate-500 font-medium">อาจารย์/บุคลากรทั้งหมด</div>
          </div>
        </div>
      </div>

      {/* Unassigned Programs Alert Banner (if any) */}
      {stats.unassignedCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-amber-900">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-semibold text-amber-800 text-sm">
                มี {stats.unassignedCount} หลักสูตรที่ยังไม่ได้สังกัดภาควิชาหรือส่วนงาน
              </span>
              <p className="text-amber-700">
                รายชื่อ:{" "}
                {unassignedPrograms
                  .map((p) => `${p.code} (${p.nameTh})`)
                  .join(", ")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search & Actions Bar */}
      <LiyonCard>
        <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
              placeholder="ค้นหารหัสภาควิชา, ชื่อไทย, ชื่ออังกฤษ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {canManage && (
            <Button
              type="button"
              onClick={() => {
                setSelectedDeptForCrud(null);
                setIsCrudOpen(true);
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white shadow-sm flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>{t("curriculum.addDepartment")}</span>
            </Button>
          )}
        </div>

        {/* Data Table */}
        <DataTable<DepartmentDto>
          state={filteredDepartments.length === 0 ? "empty" : "data"}
          headHeading={t("curriculum.deptManageTitle")}
          headMeta={`${filteredDepartments.length} ภาควิชา`}
          columns={columns}
          rows={filteredDepartments}
          getRowId={(row) => row.id}
          empty={{
            icon: <FolderOpen className="h-10 w-10 text-slate-400" />,
            title: "ไม่พบข้อมูลภาควิชาหรือส่วนงาน",
            description: "คุณสามารถกดเพิ่มภาควิชาใหม่เพื่อเริ่มต้นจัดกลุ่มและจัดเก็บหลักสูตร",
          }}
          error={{
            icon: <AlertCircle className="h-10 w-10 text-rose-500" />,
            title: "เกิดข้อผิดพลาดในการโหลดข้อมูล",
            actions: (
              <Button size="sm" onClick={onRefresh}>
                ลองใหม่อีกครั้ง
              </Button>
            ),
          }}
        />
      </LiyonCard>

      {/* Create / Edit Department Dialog */}
      <DepartmentCrudDialog
        open={isCrudOpen}
        onOpenChange={setIsCrudOpen}
        department={selectedDeptForCrud}
        onSuccess={() => {
          onRefresh();
        }}
      />

      {/* Manage Department Programs Dialog */}
      <LiyonDialog
        open={isProgramsModalOpen}
        onOpenChange={setIsProgramsModalOpen}
        wide
      >
        <LiyonDialogCloseButton label={t("common.close")} />
        <LiyonDialogHeader
          title={`จัดเก็บหลักสูตรในสังกัด: ${activeDeptForPrograms?.nameTh ?? ""} (${activeDeptForPrograms?.code ?? ""})`}
          description="จัดการมอบหมาย จัดเก็บ และย้ายหลักสูตรการศึกษาเข้าสู่สังกัดของภาควิชานี้"
        />

        <LiyonDialogBody>
          <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-1">
            {/* Assign New Program Section */}
            {canManage && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <Plus className="h-4 w-4 text-rose-600" />
                  <span>เพิ่มหลักสูตรเข้าสู่ภาควิชานี้</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <LiyonSelect
                      value={selectedProgramToAssign}
                      onChange={(e) => setSelectedProgramToAssign(e.target.value)}
                    >
                      <option value="">-- เลือกหลักสูตรที่ต้องการเพิ่มเข้าภาควิชานี้ --</option>
                      {availableProgramsToAssign.map((p) => {
                        const currentDept = departments.find((d) => d.id === p.departmentId);
                        const deptLabel = currentDept
                          ? `(ปัจจุบันอยู่: ${currentDept.code})`
                          : "(ยังไม่มีสังกัด)";
                        return (
                          <option key={p.id} value={p.id}>
                            {p.code} - {p.nameTh} {deptLabel}
                          </option>
                        );
                      })}
                    </LiyonSelect>
                  </div>
                  <Button
                    type="button"
                    disabled={!selectedProgramToAssign || isAssigning}
                    onClick={handleAssignProgram}
                    className="bg-rose-600 hover:bg-rose-700 text-white shadow-sm shrink-0 flex items-center gap-1"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    <span>สังกัดภาควิชานี้</span>
                  </Button>
                </div>
              </div>
            )}

            {/* List of Programs Currently in this Department */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-indigo-600" />
                  <span>หลักสูตรในสังกัดปัจจุบัน ({programsInActiveDept.length} หลักสูตร)</span>
                </h4>
              </div>

              {programsInActiveDept.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-xs">
                  <FolderOpen className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                  <span>ยังไม่มีหลักสูตรสังกัดในภาควิชานี้</span>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {programsInActiveDept.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 bg-white hover:bg-slate-50 flex items-center justify-between gap-4 transition-colors"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-800">
                            {p.code}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-medium">
                            {p.level}
                          </span>
                        </div>
                        <div className="font-medium text-xs text-slate-900 truncate">
                          {p.nameTh}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {p.nameEn} · {p.totalCredits} หน่วยกิต
                        </div>
                      </div>

                      {canManage && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isAssigning}
                          onClick={() => handleUnassignProgram(p.id)}
                          className="h-8 px-2.5 text-xs text-amber-700 hover:text-amber-800 hover:bg-amber-50 border-amber-200 shrink-0"
                          title="นำหลักสูตรออกจากภาควิชานี้"
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1" />
                          <span>นำออกจากสังกัด</span>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </LiyonDialogBody>

        <LiyonDialogFooter>
          <div className="flex justify-end w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsProgramsModalOpen(false)}
            >
              {t("common.close")}
            </Button>
          </div>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
