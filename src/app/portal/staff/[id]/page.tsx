import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Clock,
  GraduationCap,
  BookOpen,
  Globe,
  ExternalLink,
  Crown,
  Award,
} from "lucide-react";
import { getLocale, getT } from "@/i18n/server";
import { resolvePortalTenantId, getPublicStaffDetail } from "@/features/staff/server";

interface StaffDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function StaffDetailPage({ params }: StaffDetailPageProps) {
  const { id } = await params;
  const t = await getT();
  const locale = await getLocale();

  let tenantId: string;
  try {
    tenantId = await resolvePortalTenantId();
  } catch {
    notFound();
  }

  const staff = await getPublicStaffDetail(tenantId, id);
  if (!staff) {
    notFound();
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      {/* Back Button */}
      <div>
        <Link
          href="/portal/staff"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-rose-600 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>{t("staff.backToDirectory")}</span>
        </Link>
      </div>

      {/* Main Hero Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="h-32 w-32 sm:h-36 sm:w-36 rounded-2xl bg-slate-100 border-2 border-slate-200 overflow-hidden shrink-0 shadow-sm">
            {staff.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={staff.avatarUrl}
                alt={staff.fullNameTh}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-rose-50 text-rose-600 font-bold text-3xl">
                {staff.firstNameEn.charAt(0)}
              </div>
            )}
          </div>

          {/* Core Info */}
          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              {staff.isExecutive && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  <Crown className="h-3 w-3" />
                  <span>{staff.executiveRole || t("staff.type.EXECUTIVE")}</span>
                </span>
              )}
              {staff.departmentNameTh && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                  <GraduationCap className="h-3 w-3" />
                  <span>{locale === "en" ? staff.departmentNameEn : staff.departmentNameTh}</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {locale === "en" ? staff.fullNameEn : staff.fullNameTh}
            </h1>
            <p className="text-sm font-medium text-slate-500">
              {locale === "en" ? staff.fullNameTh : staff.fullNameEn}
            </p>

            <div className="pt-1 text-slate-700 text-sm font-medium">
              {locale === "en" ? staff.positionEn : staff.positionTh}
            </div>

            {/* Quick Contact Badges */}
            <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-600">
              <a
                href={`mailto:${staff.email}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <Mail className="h-3.5 w-3.5 text-slate-500" />
                <span>{staff.email}</span>
              </a>

              {staff.phone && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100">
                  <Phone className="h-3.5 w-3.5 text-slate-500" />
                  <span>{staff.phone}</span>
                </span>
              )}

              {staff.officeRoom && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100">
                  <MapPin className="h-3.5 w-3.5 text-slate-500" />
                  <span>{staff.officeRoom}</span>
                </span>
              )}

              {staff.officeHours && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  <span>{staff.officeHours}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Academic Profiles & External Links */}
        {(staff.googleScholarUrl || staff.scopusUrl || staff.orcidId || staff.websiteUrl) && (
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-semibold text-slate-500 mr-1">
              {locale === "en" ? "Academic Profiles:" : "ฐานข้อมูลวิชาการ:"}
            </span>

            {staff.googleScholarUrl && (
              <a
                href={staff.googleScholarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Google Scholar</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}

            {staff.scopusUrl && (
              <a
                href={staff.scopusUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-50 text-orange-800 border border-orange-200 hover:bg-orange-100 transition-colors"
              >
                <Award className="h-3.5 w-3.5" />
                <span>Scopus</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}

            {staff.orcidId && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span className="font-mono text-[11px] font-bold text-emerald-600">iD</span>
                <span>{staff.orcidId}</span>
              </span>
            )}

            {staff.websiteUrl && (
              <a
                href={staff.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200 transition-colors"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>{locale === "en" ? "Personal Website" : "เว็บไซต์ส่วนตัว"}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Grid Sections: Education, Expertise, Bio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Education Timeline */}
        {staff.education && staff.education.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <GraduationCap className="h-5 w-5 text-rose-600" />
              <h2 className="font-bold text-slate-900 text-base">
                {t("staff.education")}
              </h2>
            </div>
            <ul className="space-y-2.5 text-sm text-slate-700">
              {staff.education.map((edu, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500 mt-2 shrink-0" />
                  <span className="leading-relaxed">{edu}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Expertise & Research Interests */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <BookOpen className="h-5 w-5 text-rose-600" />
            <h2 className="font-bold text-slate-900 text-base">
              {t("staff.expertise")}
            </h2>
          </div>

          {staff.expertise && staff.expertise.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {staff.expertise.map((exp, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200"
                >
                  {exp}
                </span>
              ))}
            </div>
          )}

          {staff.researchInterests && (
            <div className="pt-2 text-xs text-slate-600 leading-relaxed">
              <div className="font-semibold text-slate-800 mb-1">
                {t("staff.researchInterests")}:
              </div>
              <p>{staff.researchInterests}</p>
            </div>
          )}
        </div>
      </div>

      {/* Biography */}
      {(staff.bioTh || staff.bioEn) && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
          <h2 className="font-bold text-slate-900 text-base">
            {t("staff.bio")}
          </h2>
          <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {locale === "en"
              ? staff.bioEn || staff.bioTh
              : staff.bioTh || staff.bioEn}
          </div>
        </div>
      )}
    </div>
  );
}
