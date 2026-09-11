"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Mail,
  MapPin,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Crown,
  Users,
} from "lucide-react";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import type { PublicDirectoryData, StaffProfileDto } from "@/features/staff";

interface DirectoryViewProps {
  data: PublicDirectoryData;
}

export function DirectoryView({ data }: DirectoryViewProps) {
  const t = useT();
  const locale = useLocale();

  const [search, setSearch] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");

  // Filter staff list
  const filteredStaff = useMemo(() => {
    return data.staffList.filter((staff) => {
      // Dept filter
      if (selectedDeptId !== "ALL" && staff.departmentId !== selectedDeptId) {
        return false;
      }
      // Type filter
      if (selectedType !== "ALL" && staff.staffType !== selectedType) {
        return false;
      }
      // Search keyword
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const nameMatch =
          staff.fullNameTh.toLowerCase().includes(q) ||
          staff.fullNameEn.toLowerCase().includes(q);
        const posMatch =
          staff.positionTh.toLowerCase().includes(q) ||
          staff.positionEn.toLowerCase().includes(q);
        const deptMatch =
          (staff.departmentNameTh && staff.departmentNameTh.toLowerCase().includes(q)) ||
          (staff.departmentNameEn && staff.departmentNameEn.toLowerCase().includes(q));
        const expertiseMatch =
          staff.expertise &&
          staff.expertise.some((exp) => exp.toLowerCase().includes(q));
        const researchMatch =
          staff.researchInterests &&
          staff.researchInterests.toLowerCase().includes(q);

        return nameMatch || posMatch || deptMatch || expertiseMatch || researchMatch;
      }
      return true;
    });
  }, [data.staffList, selectedDeptId, selectedType, search]);

  return (
    <div className="space-y-12">
      {/* Executive Board Showcase (if executives exist) */}
      {data.executives.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Crown className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {t("staff.executiveBoard")}
              </h2>
              <p className="text-xs text-slate-500">
                {locale === "en"
                  ? "Faculty Executive Leadership Team"
                  : "คณะผู้บริหารคณะวิทยาการและเทคโนโลยีสารสนเทศ"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.executives.map((exec) => (
              <ExecutiveCard key={exec.id} staff={exec} locale={locale} t={t} />
            ))}
          </div>
        </section>
      )}

      {/* Directory Section */}
      <section className="space-y-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {t("staff.allStaff")}
              </h2>
              <p className="text-xs text-slate-500">
                {locale === "en"
                  ? `Showing ${filteredStaff.length} members`
                  : `พบบุคลากรจำนวน ${filteredStaff.length} ท่าน`}
              </p>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("staff.searchPlaceholder")}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 shadow-xs"
            />
          </div>
        </div>

        {/* Filters Bar: Department Tabs & Staff Type Pills */}
        <div className="space-y-3">
          {/* Department Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 pb-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => setSelectedDeptId("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedDeptId === "ALL"
                  ? "bg-slate-900 text-white shadow-xs font-semibold"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t("staff.allDepartments")}
            </button>
            {data.departments.map((dept) => (
              <button
                key={dept.id}
                type="button"
                onClick={() => setSelectedDeptId(dept.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedDeptId === dept.id
                    ? "bg-slate-900 text-white shadow-xs font-semibold"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {locale === "en" ? dept.nameEn : dept.nameTh}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs text-slate-500 mr-1">{t("staff.type")}:</span>
            <button
              type="button"
              onClick={() => setSelectedType("ALL")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedType === "ALL"
                  ? "bg-rose-100 text-rose-800 font-semibold"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {t("staff.allStaff")}
            </button>
            <button
              type="button"
              onClick={() => setSelectedType("ACADEMIC")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                selectedType === "ACADEMIC"
                  ? "bg-rose-100 text-rose-800 font-semibold"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <GraduationCap className="h-3 w-3" />
              <span>{t("staff.academicStaff")}</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedType("SUPPORT")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
                selectedType === "SUPPORT"
                  ? "bg-rose-100 text-rose-800 font-semibold"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Briefcase className="h-3 w-3" />
              <span>{t("staff.supportStaff")}</span>
            </button>
          </div>
        </div>

        {/* Staff Directory Grid */}
        {filteredStaff.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
            <div className="font-semibold text-slate-800">{t("staff.empty")}</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {t("staff.emptyDesc")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredStaff.map((staff) => (
              <StaffCard key={staff.id} staff={staff} locale={locale} t={t} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ExecutiveCard({
  staff,
  locale,
  t,
}: {
  staff: StaffProfileDto;
  locale: string;
  t: (key: string) => string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group">
      <div>
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
            {staff.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={staff.avatarUrl}
                alt={staff.fullNameTh}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-rose-50 text-rose-600 font-bold text-lg">
                {staff.firstNameEn.charAt(0)}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              <Crown className="h-3 w-3" />
              <span>{staff.executiveRole || t("staff.type.EXECUTIVE")}</span>
            </span>

            <h3 className="font-bold text-slate-900 text-base leading-snug pt-0.5">
              {locale === "en" ? staff.fullNameEn : staff.fullNameTh}
            </h3>
            <p className="text-xs text-slate-500">
              {locale === "en" ? staff.positionEn : staff.positionTh}
            </p>
          </div>
        </div>

        {/* Contact details */}
        <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1.5">
          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{staff.email}</span>
          </div>
          {staff.officeRoom && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{staff.officeRoom}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3">
        <Link
          href={`/portal/staff/${staff.id}`}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center justify-between group-hover:translate-x-0.5 transition-transform"
        >
          <span>{t("staff.viewProfile")}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function StaffCard({
  staff,
  locale,
  t,
}: {
  staff: StaffProfileDto;
  locale: string;
  t: (key: string) => string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group">
      <div>
        <div className="flex items-start gap-3.5">
          <div className="h-14 w-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
            {staff.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={staff.avatarUrl}
                alt={staff.fullNameTh}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-slate-50 text-slate-500 font-bold text-base">
                {staff.firstNameEn.charAt(0)}
              </div>
            )}
          </div>

          <div className="space-y-0.5 min-w-0">
            <div className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">
              {locale === "en" ? staff.departmentNameEn : staff.departmentNameTh}
            </div>
            <h3 className="font-bold text-slate-900 text-sm truncate">
              {locale === "en" ? staff.fullNameEn : staff.fullNameTh}
            </h3>
            <p className="text-xs text-slate-500 truncate">
              {locale === "en" ? staff.positionEn : staff.positionTh}
            </p>
          </div>
        </div>

        {/* Expertise tags */}
        {staff.expertise && staff.expertise.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1">
            {staff.expertise.slice(0, 3).map((exp, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md text-[11px] bg-slate-100 text-slate-600 border border-slate-200/60"
              >
                {exp}
              </span>
            ))}
            {staff.expertise.length > 3 && (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] text-slate-400">
                +{staff.expertise.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Contact info */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
          <div className="flex items-center gap-1.5 truncate">
            <Mail className="h-3 w-3 text-slate-400 shrink-0" />
            <span className="truncate">{staff.email}</span>
          </div>
          {staff.officeRoom && (
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
              <span className="truncate">{staff.officeRoom}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-2">
        <Link
          href={`/portal/staff/${staff.id}`}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center justify-between group-hover:translate-x-0.5 transition-transform"
        >
          <span>{t("staff.viewProfile")}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
