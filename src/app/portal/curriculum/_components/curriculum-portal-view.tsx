"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Search,
  BookOpen,
  Clock,
  Coins,
  ArrowRight,
  FileText,
  Building2,
} from "lucide-react";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import type { ProgramDto, DegreeLevel } from "@/features/curriculum";

interface CurriculumPortalViewProps {
  programs: ProgramDto[];
}

export function CurriculumPortalView({ programs }: CurriculumPortalViewProps) {
  const t = useT();
  const locale = useLocale();

  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");

  const levelTabs = [
    { key: "ALL", label: t("curriculum.allLevels") },
    { key: "BACHELOR", label: t("curriculum.bachelor") },
    { key: "MASTER", label: t("curriculum.master") },
    { key: "DOCTORAL", label: t("curriculum.doctoral") },
    { key: "CERTIFICATE", label: t("curriculum.certificate") },
  ];

  const filteredPrograms = useMemo(() => {
    return programs.filter((p) => {
      if (selectedLevel !== "ALL" && p.level !== selectedLevel) return false;
      if (selectedType !== "ALL" && p.type !== selectedType) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchCode = p.code.toLowerCase().includes(q);
        const matchNameTh = p.nameTh.toLowerCase().includes(q);
        const matchNameEn = p.nameEn.toLowerCase().includes(q);
        const matchDegree = p.degreeTh.toLowerCase().includes(q) || p.degreeEn.toLowerCase().includes(q);
        if (!matchCode && !matchNameTh && !matchNameEn && !matchDegree) return false;
      }
      return true;
    });
  }, [programs, selectedLevel, selectedType, search]);

  const getLevelBadgeClass = (level: DegreeLevel) => {
    switch (level) {
      case "BACHELOR":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "MASTER":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "DOCTORAL":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "CERTIFICATE":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-8">
      {/* Level Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {levelTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setSelectedLevel(tab.key)}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
              selectedLevel === tab.key
                ? "bg-rose-600 text-white shadow-md shadow-rose-500/25 scale-102"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100/80 hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
            placeholder={t("curriculum.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <select
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="ALL">{t("curriculum.filterByType")}: {t("common.all")}</option>
            <option value="THAI">{t("curriculum.type.THAI")}</option>
            <option value="INTERNATIONAL">{t("curriculum.type.INTERNATIONAL")}</option>
            <option value="BILINGUAL">{t("curriculum.type.BILINGUAL")}</option>
          </select>
        </div>
      </div>

      {/* Program Cards Grid */}
      {filteredPrograms.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
          <GraduationCap className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">{t("curriculum.empty")}</h3>
          <p className="text-sm text-slate-500 mt-1">{t("curriculum.emptyDesc")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((program) => (
            <div
              key={program.id}
              className="group bg-white rounded-2xl border border-slate-200/90 hover:border-rose-300 hover:shadow-lg hover:shadow-rose-500/5 transition-all flex flex-col overflow-hidden"
            >
              {/* Header Badges */}
              <div className="p-5 pb-0 flex items-center justify-between gap-2">
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${getLevelBadgeClass(
                    program.level
                  )}`}
                >
                  {t(`curriculum.level.${program.level}`)}
                </span>
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {t(`curriculum.type.${program.type}`)}
                </span>
              </div>

              {/* Title & Info */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="font-mono text-xs font-semibold text-slate-400 mb-1">
                  {program.code}
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-2 leading-snug">
                  {locale === "en" ? program.nameEn : program.nameTh}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                  {locale === "en" ? program.nameTh : program.nameEn}
                </p>

                <div className="mt-2 text-xs font-semibold text-rose-600">
                  {locale === "en" ? program.degreeShortEn : program.degreeShortTh}
                </div>

                {program.departmentNameTh && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                    <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      {locale === "en" ? program.departmentNameEn ?? program.departmentNameTh : program.departmentNameTh}
                    </span>
                  </div>
                )}

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                    <span>
                      <strong>{program.totalCredits}</strong> {t("curriculum.creditsUnit")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{program.studyDuration}</span>
                  </div>
                </div>

                {program.tuitionFee && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                    <Coins className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{program.tuitionFee}</span>
                  </div>
                )}

                {/* Footer Action */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/portal/curriculum/${program.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                  >
                    <span>{t("curriculum.viewDetails")}</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  {program.handbookUrl && (
                    <a
                      href={program.handbookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-400 hover:text-slate-700 p-1 flex items-center gap-1"
                      title={t("curriculum.downloadHandbook")}
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span className="text-[10px]">มคอ.2</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
