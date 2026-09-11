"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ExternalLink,
  GraduationCap,
  BookOpen,
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
  type StatusPillTone,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type {
  ProgramDto,
  ProgramListResult,
  DegreeLevel,
  ProgramStatus,
} from "@/features/curriculum";
import {
  listProgramsAction,
  deleteProgramAction,
} from "@/features/curriculum/actions";
import { CurriculumDialog } from "./curriculum-dialog";
import { CoursesDialog } from "./courses-dialog";

interface DepartmentOption {
  id: string;
  nameTh: string;
  nameEn: string;
}

interface CurriculumClientProps {
  initialData: ProgramListResult;
  departments: DepartmentOption[];
  canManage: boolean;
}

export function CurriculumClient({
  initialData,
  departments,
  canManage,
}: CurriculumClientProps) {
  const t = useT();
  const locale = useLocale();

  const [programData, setProgramData] = useState<ProgramListResult>(initialData);
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [isPending, startTransition] = useTransition();

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<ProgramDto | null>(null);
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);
  const [selectedProgramForCourses, setSelectedProgramForCourses] = useState<ProgramDto | null>(null);

  const fetchPrograms = useCallback(async () => {
    const res = await listProgramsAction({
      page,
      perPage: 25,
      level: selectedLevel !== "ALL" ? (selectedLevel as DegreeLevel) : undefined,
      status: selectedStatus !== "ALL" ? (selectedStatus as ProgramStatus) : undefined,
      departmentId: selectedDept || undefined,
      search: search || undefined,
    });
    if (res.ok) {
      setProgramData(res.data);
    } else {
      toast.error(res.error.message);
    }
  }, [page, selectedLevel, selectedStatus, selectedDept, search]);

  useEffect(() => {
    startTransition(() => {
      fetchPrograms();
    });
  }, [fetchPrograms]);

  const handleDelete = async (program: ProgramDto) => {
    if (!confirm(t("curriculum.deleteConfirm"))) return;
    try {
      const res = await deleteProgramAction(program.id);
      if (res.ok) {
        toast.success(t("curriculum.deletedSuccess"));
        fetchPrograms();
      } else {
        toast.error(res.error.message);
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการลบข้อมูล");
    }
  };

  const getStatusTone = (status: ProgramStatus): StatusPillTone => {
    switch (status) {
      case "ACTIVE":
        return "ok";
      case "DRAFT":
        return "off";
      case "REVISED":
        return "warn";
      case "ARCHIVED":
        return "bad";
      default:
        return "off";
    }
  };

  const getLevelLabel = (level: DegreeLevel) => {
    switch (level) {
      case "BACHELOR":
        return t("curriculum.level.BACHELOR");
      case "MASTER":
        return t("curriculum.level.MASTER");
      case "DOCTORAL":
        return t("curriculum.level.DOCTORAL");
      case "CERTIFICATE":
        return t("curriculum.level.CERTIFICATE");
      default:
        return level;
    }
  };

  const columns: DataTableColumn<ProgramDto>[] = [
    {
      key: "code",
      header: t("curriculum.code"),
      render: (row) => (
        <div className="space-y-0.5">
          <div className="font-mono text-xs font-bold text-slate-800">{row.code}</div>
          <div className="text-[11px] text-slate-400 font-mono">/{row.slug}</div>
        </div>
      ),
    },
    {
      key: "name",
      header: t("curriculum.nameTh"),
      render: (row) => (
        <div className="max-w-md">
          <div className="font-semibold text-slate-900 text-sm">{row.nameTh}</div>
          <div className="text-xs text-slate-500 line-clamp-1">{row.nameEn}</div>
          <div className="text-[11px] text-rose-600 font-medium mt-0.5">
            {row.degreeShortTh} ({row.degreeShortEn})
          </div>
        </div>
      ),
    },
    {
      key: "level",
      header: t("curriculum.filterByLevel"),
      render: (row) => (
        <div className="space-y-1">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">
            {getLevelLabel(row.level)}
          </span>
          <div className="text-[11px] text-slate-500">
            {t(`curriculum.type.${row.type}`)}
          </div>
        </div>
      ),
    },
    {
      key: "credits",
      header: t("curriculum.credits"),
      render: (row) => (
        <div className="text-xs">
          <div className="font-semibold text-slate-800">
            {row.totalCredits} {t("curriculum.creditsUnit")}
          </div>
          <div className="text-slate-500">{row.studyDuration}</div>
        </div>
      ),
    },
    {
      key: "department",
      header: t("curriculum.department"),
      render: (row) => (
        <div className="text-xs text-slate-600">
          {locale === "en" ? row.departmentNameEn ?? "-" : row.departmentNameTh ?? "-"}
        </div>
      ),
    },
    {
      key: "courses",
      header: t("curriculum.structure"),
      render: (row) => (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedProgramForCourses(row);
            setIsCoursesOpen(true);
          }}
          className="text-xs h-7 px-2.5 flex items-center gap-1 text-slate-700 hover:text-rose-600 hover:border-rose-300"
        >
          <BookOpen className="h-3 w-3" />
          <span>{row.courseCount ?? 0} วิชา</span>
        </Button>
      ),
    },
    {
      key: "status",
      header: t("curriculum.status"),
      render: (row) => (
        <StatusPill tone={getStatusTone(row.status)}>
          {t(`curriculum.status.${row.status}`)}
        </StatusPill>
      ),
    },
  ];

  const levelTabs = [
    { key: "ALL", label: t("curriculum.allLevels") },
    { key: "BACHELOR", label: t("curriculum.bachelor") },
    { key: "MASTER", label: t("curriculum.master") },
    { key: "DOCTORAL", label: t("curriculum.doctoral") },
    { key: "CERTIFICATE", label: t("curriculum.certificate") },
  ];

  const tableState = isPending
    ? "loading"
    : programData.items.length === 0
    ? "empty"
    : "data";

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-rose-600" />
            {t("curriculum.title")}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{t("curriculum.description")}</p>
        </div>

        {canManage && (
          <Button
            onClick={() => {
              setSelectedProgram(null);
              setIsDialogOpen(true);
            }}
            className="bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("curriculum.create")}
          </Button>
        )}
      </div>

      {/* Level Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {levelTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setSelectedLevel(tab.key);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              selectedLevel === tab.key
                ? "bg-rose-600 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <LiyonCard>
        <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
              placeholder={t("curriculum.searchPlaceholder")}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Department Filter */}
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
                  {d.nameTh}
                </option>
              ))}
            </LiyonSelect>
          </div>

          {/* Status Filter */}
          <div>
            <LiyonSelect
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">
                {t("curriculum.filterByStatus")}: {t("common.all")}
              </option>
              <option value="ACTIVE">{t("curriculum.status.ACTIVE")}</option>
              <option value="DRAFT">{t("curriculum.status.DRAFT")}</option>
              <option value="REVISED">{t("curriculum.status.REVISED")}</option>
              <option value="ARCHIVED">{t("curriculum.status.ARCHIVED")}</option>
            </LiyonSelect>
          </div>
        </div>

        {/* Data Table */}
        <DataTable<ProgramDto>
          state={tableState}
          headHeading={t("curriculum.title")}
          headMeta={
            locale === "en"
              ? `${programData.total} programs`
              : `${programData.total} รายการ`
          }
          columns={columns}
          rows={programData.items}
          getRowId={(row) => row.id}
          empty={{
            icon: <AlertCircle className="h-10 w-10 text-slate-400" />,
            title: t("curriculum.empty"),
            description: t("curriculum.emptyDesc"),
          }}
          error={{
            icon: <AlertCircle className="h-10 w-10 text-rose-500" />,
            title: "Error",
            actions: (
              <Button size="sm" onClick={fetchPrograms}>
                Retry
              </Button>
            ),
          }}
          renderRowMenu={(row) => (
            <>
              {canManage && (
                <RowMenuItem
                  icon={<Pencil className="h-4 w-4 mr-2" />}
                  onSelect={() => {
                    setSelectedProgram(row);
                    setIsDialogOpen(true);
                  }}
                >
                  {t("curriculum.edit")}
                </RowMenuItem>
              )}
              <RowMenuItem
                icon={<BookOpen className="h-4 w-4 mr-2" />}
                onSelect={() => {
                  setSelectedProgramForCourses(row);
                  setIsCoursesOpen(true);
                }}
              >
                {t("curriculum.manageCourses")}
              </RowMenuItem>
              <RowMenuItem
                icon={<ExternalLink className="h-4 w-4 mr-2" />}
                onSelect={() => window.open(`/portal/curriculum/${row.slug}`, "_blank")}
              >
                {t("curriculum.viewDetails")}
              </RowMenuItem>
              {canManage && (
                <>
                  <RowMenuSeparator />
                  <RowMenuItem
                    icon={<Trash2 className="h-4 w-4 mr-2" />}
                    danger
                    onSelect={() => handleDelete(row)}
                  >
                    {t("curriculum.delete")}
                  </RowMenuItem>
                </>
              )}
            </>
          )}
        />

        {/* Pagination */}
        {programData.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              หน้า {programData.page} จาก {programData.totalPages} (ทั้งหมด {programData.total} รายการ)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isPending}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                {t("common.prev")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= programData.totalPages || isPending}
                onClick={() => setPage((p) => p + 1)}
              >
                {t("common.next")}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </LiyonCard>

      {/* Program Dialog */}
      <CurriculumDialog
        key={selectedProgram?.id ?? (isDialogOpen ? "open-new" : "closed")}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        program={selectedProgram}
        departments={departments}
        onSuccess={fetchPrograms}
      />

      {/* Courses Dialog */}
      <CoursesDialog
        key={selectedProgramForCourses?.id ?? "closed-courses"}
        open={isCoursesOpen}
        onOpenChange={setIsCoursesOpen}
        program={selectedProgramForCourses}
        onCoursesUpdated={fetchPrograms}
      />
    </div>
  );
}
