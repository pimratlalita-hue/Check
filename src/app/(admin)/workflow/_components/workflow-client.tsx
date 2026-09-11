"use client";

import React, { useState, useTransition } from "react";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Eye,
  RefreshCw,
} from "lucide-react";
import { useT } from "@/shared/lib/i18n/client";
import {
  DataTable,
  StatusPill,
  type DataTableColumn,
  type StatusPillTone,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type {
  PetitionDto,
  PetitionListResult,
  WorkflowStats,
  PetitionType,
} from "@/features/workflow";
import { listPetitionsAction, getWorkflowStatsAction } from "@/features/workflow/actions";
import { PetitionReviewDialog } from "./petition-review-dialog";

interface WorkflowClientProps {
  initialData: PetitionListResult;
  initialStats: WorkflowStats;
  canManage: boolean;
  currentUserName: string;
}

export function WorkflowClient({
  initialData,
  initialStats,
  canManage,
  currentUserName,
}: WorkflowClientProps) {
  const t = useT();
  const [isPending, startTransition] = useTransition();

  const [petitions, setPetitions] = useState<PetitionDto[]>(initialData.items);
  const [stats, setStats] = useState<WorkflowStats>(initialStats);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "completed" | "issues">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  const [selectedPetition, setSelectedPetition] = useState<PetitionDto | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const fetchPetitions = (tab = activeTab, type = typeFilter, search = searchQuery) => {
    startTransition(async () => {
      const [listRes, statsRes] = await Promise.all([
        listPetitionsAction({
          tab,
          type: type ? (type as PetitionType) : undefined,
          search: search.trim() || undefined,
          page: 1,
          perPage: 100,
        }),
        getWorkflowStatsAction(),
      ]);

      if (listRes.ok) {
        setPetitions(listRes.data.items);
      }
      if (statsRes.ok) {
        setStats(statsRes.data);
      }
    });
  };

  const handleTabChange = (tab: "all" | "pending" | "completed" | "issues") => {
    setActiveTab(tab);
    fetchPetitions(tab, typeFilter, searchQuery);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setTypeFilter(val);
    fetchPetitions(activeTab, val, searchQuery);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPetitions(activeTab, typeFilter, searchQuery);
  };

  const handleOpenReview = (petition: PetitionDto) => {
    setSelectedPetition(petition);
    setIsReviewOpen(true);
  };

  const handleReviewSuccess = () => {
    fetchPetitions(activeTab, typeFilter, searchQuery);
  };

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

  const columns: DataTableColumn<PetitionDto>[] = [
    {
      key: "trackingNo",
      header: t("workflow.col.trackingNo"),
      render: (row) => (
        <div className="font-mono font-semibold text-rose-700 text-xs">
          {row.trackingNo}
        </div>
      ),
    },
    {
      key: "student",
      header: t("workflow.col.student"),
      render: (row) => (
        <div className="space-y-0.5">
          <div className="font-medium text-slate-800 text-xs">{row.studentName}</div>
          <div className="text-[11px] text-slate-500 font-mono">{row.studentId}</div>
        </div>
      ),
    },
    {
      key: "type",
      header: t("workflow.col.type"),
      render: (row) => (
        <span className="text-xs text-slate-700 font-medium">
          {t(`workflow.type.${row.type}`)}
        </span>
      ),
    },
    {
      key: "title",
      header: t("workflow.col.title"),
      render: (row) => (
        <div className="max-w-xs truncate text-xs text-slate-700" title={row.title}>
          {row.title}
        </div>
      ),
    },
    {
      key: "advisor",
      header: t("workflow.col.advisor"),
      render: (row) => (
        <span className="text-xs text-slate-600">
          {row.advisorNameTh || "-"}
        </span>
      ),
    },
    {
      key: "submittedAt",
      header: t("workflow.col.submittedAt"),
      render: (row) => (
        <span className="text-xs text-slate-500">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "step",
      header: t("workflow.col.step"),
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
          ขั้นที่ {row.currentStep}/4
        </span>
      ),
    },
    {
      key: "status",
      header: t("workflow.col.status"),
      render: (row) => (
        <StatusPill tone={getStatusTone(row.status)}>
          {t(`workflow.status.${row.status}`)}
        </StatusPill>
      ),
    },
    {
      key: "actions",
      header: t("workflow.col.actions"),
      render: (row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleOpenReview(row)}
          className="h-7 px-2.5 text-xs text-rose-700 hover:text-rose-800 hover:bg-rose-50 border-rose-200 flex items-center gap-1.5"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{t("workflow.review")}</span>
        </Button>
      ),
    },
  ];

  const tableState = isPending
    ? "loading"
    : petitions.length === 0
    ? "empty"
    : "data";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {t("workflow.title")}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {t("workflow.description")}
        </p>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">
              {t("workflow.stats.total")}
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {stats.total}
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="p-4 bg-white border border-amber-200 rounded-xl shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-amber-600 font-medium">
              {t("workflow.stats.pending")}
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {stats.pending}
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="p-4 bg-white border border-emerald-200 rounded-xl shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-emerald-600 font-medium">
              {t("workflow.stats.completed")}
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {stats.completed}
            </div>
          </div>
        </div>

        {/* Issues */}
        <div className="p-4 bg-white border border-rose-200 rounded-xl shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-rose-600 font-medium">
              {t("workflow.stats.issues")}
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {stats.issues}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="space-y-3 bg-white p-4 border border-slate-200 rounded-xl shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
          {/* Tabs */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleTabChange("all")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === "all"
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {t("workflow.tab.all")} ({stats.total})
            </button>
            <button
              onClick={() => handleTabChange("pending")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === "pending"
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {t("workflow.tab.pending")} ({stats.pending})
            </button>
            <button
              onClick={() => handleTabChange("completed")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === "completed"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {t("workflow.tab.completed")} ({stats.completed})
            </button>
            <button
              onClick={() => handleTabChange("issues")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === "issues"
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {t("workflow.tab.issues")} ({stats.issues})
            </button>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => fetchPetitions()}
            disabled={isPending}
            className="text-xs text-slate-500 hover:text-slate-800 h-8 gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPending ? "animate-spin" : ""}`} />
            <span>รีเฟรช</span>
          </Button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("workflow.searchPlaceholder")}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:bg-white focus:outline-none"
            />
          </form>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={typeFilter}
              onChange={handleTypeChange}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
            >
              <option value="">{t("workflow.filterByType")} (ทั้งหมด)</option>
              <option value="THESIS_TOPIC_APPROVAL">{t("workflow.type.THESIS_TOPIC_APPROVAL")}</option>
              <option value="DEFENSE_EXAM_REQUEST">{t("workflow.type.DEFENSE_EXAM_REQUEST")}</option>
              <option value="LEAVE_OF_ABSENCE">{t("workflow.type.LEAVE_OF_ABSENCE")}</option>
              <option value="EXTENSION_OF_STUDY">{t("workflow.type.EXTENSION_OF_STUDY")}</option>
              <option value="GENERAL_PETITION">{t("workflow.type.GENERAL_PETITION")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* DataTable */}
      <DataTable<PetitionDto>
        state={tableState}
        headHeading={t("workflow.title")}
        headMeta={`${petitions.length} ${t("workflow.stats.total")}`}
        getRowId={(row) => row.id}
        columns={columns}
        rows={petitions}
        empty={{
          icon: <AlertCircle className="h-10 w-10 text-slate-400" />,
          title: t("workflow.empty"),
          description: t("workflow.emptyDesc"),
        }}
        error={{
          icon: <AlertCircle className="h-10 w-10 text-rose-500" />,
          title: "Error",
          actions: (
            <Button size="sm" onClick={() => fetchPetitions()}>
              {t("workflow.col.actions")}
            </Button>
          ),
        }}
      />

      {/* Review Dialog with Dynamic Key for clean re-mounting */}
      <PetitionReviewDialog
        key={selectedPetition?.id ?? (isReviewOpen ? "open" : "closed")}
        open={isReviewOpen}
        onOpenChange={setIsReviewOpen}
        petition={selectedPetition}
        canManage={canManage}
        currentUserName={currentUserName}
        onSuccess={handleReviewSuccess}
      />
    </div>
  );
}
