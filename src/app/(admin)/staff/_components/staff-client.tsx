"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Building2,
  Search,
  ExternalLink,
  GraduationCap,
  Briefcase,
  Crown,
  Users,
  Eye,
  EyeOff,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import {
  LiyonCard,
  DataTable,
  StatusPill,
  LiyonSelect,
  RowMenuItem,
  RowMenuSeparator,
  type DataTableColumn,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type {
  StaffProfileDto,
  StaffListResult,
  DepartmentDto,
  StaffType,
} from "@/features/staff";
import {
  listStaffAction,
  deleteStaffAction,
  toggleStaffActiveAction,
  listDepartmentsAction,
} from "@/features/staff/actions";
import { StaffDialog } from "./staff-dialog";
import { DepartmentDialog } from "./department-dialog";

interface StaffClientProps {
  initialData: StaffListResult;
  initialDepartments: DepartmentDto[];
  canManage: boolean;
}

export function StaffClient({
  initialData,
  initialDepartments,
  canManage,
}: StaffClientProps) {
  const t = useT();
  const locale = useLocale();

  const [staffData, setStaffData] = useState<StaffListResult>(initialData);
  const [departments, setDepartments] = useState<DepartmentDto[]>(initialDepartments);
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [isPending, startTransition] = useTransition();

  // Modals
  const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffProfileDto | null>(null);
  const [isDeptDialogOpen, setIsDeptDialogOpen] = useState(false);

  const fetchStaff = useCallback(async () => {
    const res = await listStaffAction({
      page,
      perPage: 25,
      departmentId: selectedDept || undefined,
      staffType: selectedType !== "ALL" ? (selectedType as StaffType) : undefined,
      search: search || undefined,
    });
    if (res.ok) {
      setStaffData(res.data);
    } else {
      toast.error(res.error.message);
    }
  }, [page, selectedDept, selectedType, search]);

  const fetchDepartments = useCallback(async () => {
    const res = await listDepartmentsAction();
    if (res.ok) {
      setDepartments(res.data);
    }
  }, []);

  useEffect(() => {
    startTransition(() => {
      fetchStaff();
    });
  }, [fetchStaff]);

  const handleOpenCreate = () => {
    setSelectedStaff(null);
    setIsStaffDialogOpen(true);
  };

  const handleOpenEdit = (staff: StaffProfileDto) => {
    setSelectedStaff(staff);
    setIsStaffDialogOpen(true);
  };

  const handleToggleActive = async (id: string) => {
    try {
      const res = await toggleStaffActiveAction(id);
      if (!res.ok) throw new Error(res.error.message);
      toast.success(t("staff.statusToggled"));
      fetchStaff();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error toggling status";
      toast.error(msg);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("staff.deleteConfirm"))) return;
    try {
      const res = await deleteStaffAction(id);
      if (!res.ok) throw new Error(res.error.message);
      toast.success(t("staff.deletedSuccess"));
      fetchStaff();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting staff";
      toast.error(msg);
    }
  };

  const columns: DataTableColumn<StaffProfileDto>[] = [
    {
      key: "name",
      header: t("staff.name"),
      render: (row: StaffProfileDto) => (
        <div className="flex items-center gap-3 py-1">
          <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center text-slate-500 font-semibold text-xs">
            {row.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={row.avatarUrl}
                alt={row.fullNameTh}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>
                {row.firstNameEn.charAt(0)}
                {row.lastNameEn.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <div className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
              <span>{locale === "en" ? row.fullNameEn : row.fullNameTh}</span>
              {row.isExecutive && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-0.5">
                  <Crown className="h-2.5 w-2.5" />
                  <span>{t("staff.type.EXECUTIVE")}</span>
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500">
              {locale === "en" ? row.fullNameTh : row.fullNameEn}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "position",
      header: t("staff.position"),
      render: (row: StaffProfileDto) => (
        <div>
          <div className="text-sm font-medium text-slate-800">
            {locale === "en" ? row.positionEn : row.positionTh}
          </div>
          {row.executiveRole && (
            <div className="text-xs text-rose-600 font-medium">
              {row.executiveRole}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "department",
      header: t("staff.department"),
      render: (row: StaffProfileDto) => (
        <div>
          <div className="text-xs font-semibold text-slate-700">
            {row.departmentCode ? (
              <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 mr-1.5">
                {row.departmentCode}
              </span>
            ) : null}
            <span>
              {locale === "en"
                ? row.departmentNameEn ?? "-"
                : row.departmentNameTh ?? "-"}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: t("staff.contact"),
      render: (row: StaffProfileDto) => (
        <div className="text-xs space-y-0.5">
          <div className="text-slate-600 truncate max-w-[180px]">{row.email}</div>
          {row.officeRoom && (
            <div className="text-slate-500 truncate max-w-[180px]">{row.officeRoom}</div>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: t("staff.status"),
      render: (row: StaffProfileDto) => (
        <StatusPill tone={row.isActive ? "ok" : "off"}>
          {row.isActive ? t("staff.active") : t("staff.inactive")}
        </StatusPill>
      ),
    },
  ];

  const tableState = isPending
    ? "loading"
    : staffData.items.length === 0
    ? "empty"
    : "data";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {t("staff.title")}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{t("staff.description")}</p>
        </div>

        {canManage && (
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeptDialogOpen(true)}
              className="gap-1.5"
            >
              <Building2 className="h-4 w-4 text-slate-500" />
              <span>{t("staff.departmentsManage")}</span>
            </Button>
            <Button size="sm" onClick={handleOpenCreate} className="gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" />
              <span>{t("staff.create")}</span>
            </Button>
          </div>
        )}
      </div>

      {/* Control / Filter Bar */}
      <LiyonCard className="p-4 space-y-4">
        {/* Type Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-3">
          <button
            type="button"
            onClick={() => {
              setSelectedType("ALL");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              selectedType === "ALL"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>{t("staff.allStaff")}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedType("ACADEMIC");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              selectedType === "ACADEMIC"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5" />
            <span>{t("staff.academicStaff")}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedType("EXECUTIVE");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              selectedType === "EXECUTIVE"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Crown className="h-3.5 w-3.5" />
            <span>{t("staff.executiveBoard")}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedType("SUPPORT");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              selectedType === "SUPPORT"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Briefcase className="h-3.5 w-3.5" />
            <span>{t("staff.supportStaff")}</span>
          </button>
        </div>

        {/* Search & Department Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={t("staff.searchPlaceholder")}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <LiyonSelect
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setPage(1);
              }}
            >
              <option value="">{t("staff.allDepartments")}</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nameTh} ({d.code})
                </option>
              ))}
            </LiyonSelect>
          </div>
        </div>
      </LiyonCard>

      {/* Staff Table Card */}
      <LiyonCard className="overflow-hidden">
        <DataTable<StaffProfileDto>
          state={tableState}
          headHeading={t("staff.title")}
          headMeta={
            locale === "en"
              ? `${staffData.total} members`
              : `${staffData.total} รายการ`
          }
          columns={columns}
          rows={staffData.items}
          getRowId={(row: StaffProfileDto) => row.id}
          renderRowMenu={
            canManage
              ? (row: StaffProfileDto) => (
                  <>
                    <RowMenuItem
                      icon={<Pencil className="h-4 w-4 text-slate-500" />}
                      onSelect={() => handleOpenEdit(row)}
                    >
                      {t("staff.edit")}
                    </RowMenuItem>
                    <RowMenuItem
                      icon={
                        row.isActive ? (
                          <EyeOff className="h-4 w-4 text-amber-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-emerald-500" />
                        )
                      }
                      onSelect={() => handleToggleActive(row.id)}
                    >
                      {row.isActive ? t("staff.inactive") : t("staff.active")}
                    </RowMenuItem>
                    <RowMenuItem
                      icon={<ExternalLink className="h-4 w-4 text-slate-500" />}
                      onSelect={() => window.open(`/portal/staff/${row.id}`, "_blank")}
                    >
                      {t("staff.viewProfile")}
                    </RowMenuItem>
                    <RowMenuSeparator />
                    <RowMenuItem
                      icon={<Trash2 className="h-4 w-4 text-rose-500" />}
                      danger
                      onSelect={() => handleDelete(row.id)}
                    >
                      {t("staff.delete")}
                    </RowMenuItem>
                  </>
                )
              : undefined
          }
          empty={{
            icon: <Users className="h-10 w-10 text-slate-400" />,
            title: t("staff.empty"),
            description: t("staff.emptyDesc"),
          }}
          error={{
            icon: <AlertCircle className="h-10 w-10 text-rose-500" />,
            title: "Error",
            actions: (
              <Button size="sm" onClick={fetchStaff}>
                Retry
              </Button>
            ),
          }}
          footer={
            staffData.totalPages > 1 ? (
              <div className="flex items-center justify-between w-full">
                <span>
                  {locale === "en"
                    ? `Page ${staffData.page} of ${staffData.totalPages} (${staffData.total} items)`
                    : `หน้า ${staffData.page} จาก ${staffData.totalPages} (ทั้งหมด ${staffData.total} รายการ)`}
                </span>
                <span className="pager flex items-center gap-1">
                  <button
                    type="button"
                    className="pg"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="pg"
                    onClick={() => setPage((p) => Math.min(staffData.totalPages, p + 1))}
                    disabled={page >= staffData.totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </span>
              </div>
            ) : undefined
          }
        />
      </LiyonCard>

      {/* Dialogs */}
      <StaffDialog
        key={selectedStaff?.id ?? (isStaffDialogOpen ? "open-new" : "closed")}
        open={isStaffDialogOpen}
        onOpenChange={setIsStaffDialogOpen}
        staff={selectedStaff}
        departments={departments}
        onSuccess={fetchStaff}
      />

      <DepartmentDialog
        open={isDeptDialogOpen}
        onOpenChange={setIsDeptDialogOpen}
        departments={departments}
        onRefresh={() => {
          fetchDepartments();
          fetchStaff();
        }}
      />
    </div>
  );
}
