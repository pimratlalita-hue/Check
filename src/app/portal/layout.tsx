import Link from "next/link";
import {
  Clock,
  ExternalLink,
  Globe,
  GraduationCap,
  LogIn,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ProjectorModeToggle } from "@/components/layout/projector-mode-toggle";
import { RoleSwitcher } from "@/components/layout/role-switcher";
import { getLocale, getT } from "@/i18n/server";
import { Button } from "@/components/ui/button";
import { resolveTenantInfo } from "@/features/identity/server";
import { NotificationBell } from "@/components/notifications/notification-bell";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locale, t, tenantInfo] = await Promise.all([
    getLocale(),
    getT(),
    resolveTenantInfo(),
  ]);

  const orgName = locale === "en" ? (tenantInfo.nameEn || "Sample Organization") : (tenantInfo.nameTh || "องค์กรตัวอย่าง");

  const contact = tenantInfo.contact;
  const address =
    locale === "en"
      ? contact?.addressEn || contact?.addressTh
      : contact?.addressTh || contact?.addressEn;
  const officeHours =
    locale === "en"
      ? contact?.officeHoursEn || contact?.officeHoursTh
      : contact?.officeHoursTh || contact?.officeHoursEn;
  const phone = contact?.phone;
  const email = contact?.email;
  const website = contact?.website;
  const facebook = contact?.facebook;
  const lineId = contact?.lineId;
  const mapUrl = contact?.mapUrl;

  const hasAnyContact = !!(
    address ||
    phone ||
    email ||
    officeHours ||
    website ||
    facebook ||
    lineId ||
    mapUrl
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-rose-100 selection:text-rose-900">
      {/* Top Notice Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {locale === "en"
                ? "Faculty Web Platform • Academic Year 2026"
                : "ระบบเว็บไซต์คณะและบัณฑิตศึกษา • ประจำปีการศึกษา 2569"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <LogIn className="h-3 w-3" />
              <span>{locale === "en" ? "Staff & Student Login" : "เข้าสู่ระบบบุคลากร / นิสิต"}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/portal/news" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform overflow-hidden">
              {tenantInfo.logoUrl ? (
                <img
                  src={tenantInfo.logoUrl}
                  alt={orgName}
                  className="h-full w-full object-contain p-1 rounded-xl"
                />
              ) : (
                <GraduationCap className="h-6 w-6" />
              )}
            </div>
            <div className="max-w-[180px] sm:max-w-[260px] md:max-w-[320px] lg:max-w-md">
              <div
                className="font-bold text-sm sm:text-base tracking-tight text-slate-900 leading-tight truncate"
                title={orgName}
              >
                {orgName}
              </div>
              <div className="text-2xs sm:text-xs text-rose-600 font-medium truncate">
                {locale === "en" ? "Public Portal & Knowledge Center" : "ศูนย์ข้อมูลข่าวสารและประชาสัมพันธ์"}
              </div>
            </div>
          </Link>

          <nav className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/portal/news"
              className="text-sm font-medium text-slate-700 hover:text-rose-600 transition-colors px-2 py-1"
            >
              {t("news.portalTitle")}
            </Link>

            <Link
              href="/portal/curriculum"
              className="text-sm font-medium text-slate-700 hover:text-rose-600 transition-colors px-2 py-1"
            >
              {t("curriculum.portalTitle")}
            </Link>

            <Link
              href="/portal/staff"
              className="text-sm font-medium text-slate-700 hover:text-rose-600 transition-colors px-2 py-1"
            >
              {t("staff.portalTitle")}
            </Link>

            <Link
              href="/portal/petitions"
              className="text-sm font-medium text-slate-700 hover:text-rose-600 transition-colors px-2 py-1"
            >
              {t("workflow.portalTitle")}
            </Link>

            <Link
              href="/portal/facility"
              className="text-sm font-medium text-slate-700 hover:text-rose-600 transition-colors px-2 py-1"
            >
              {t("facility.portalTitle")}
            </Link>

            <Link
              href="/portal/attendance"
              className="text-sm font-medium text-slate-700 hover:text-rose-600 transition-colors px-2 py-1"
            >
              {t("biometrics.navAttendance")}
            </Link>

            <Link href="/login">
              <Button size="sm" variant="outline" className="hidden sm:inline-flex gap-1.5 text-xs">
                <LogIn className="h-3.5 w-3.5" />
                <span>{locale === "en" ? "Admin Console" : "ระบบจัดการหลังบ้าน"}</span>
              </Button>
            </Link>

            <div className="pl-2 border-l border-slate-200 flex items-center gap-2">
              <NotificationBell />
              <RoleSwitcher />
              <ProjectorModeToggle />
              <LanguageSwitcher />
            </div>
          </nav>
        </div>
      </header>

      {/* Content Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white text-slate-600 mt-16 text-sm">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                {tenantInfo.logoUrl ? (
                  <img
                    src={tenantInfo.logoUrl}
                    alt={orgName}
                    className="h-6 w-6 object-contain rounded"
                  />
                ) : (
                  <GraduationCap className="h-5 w-5 text-rose-600" />
                )}
                <span>
                  {orgName}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {locale === "en"
                  ? "Excellence in computing research, intelligent systems, and graduate thesis innovations."
                  : "มุ่งมั่นสู่ความเป็นเลิศด้านการวิจัยนวัตกรรมปัญญาประดิษฐ์และวิทยานิพนธ์ระดับบัณฑิตศึกษา"}
              </p>
            </div>

            <div className="space-y-2">
              <div className="font-semibold text-xs uppercase tracking-wider text-slate-400">
                {locale === "en" ? "Quick Links" : "ลิงก์ด่วน"}
              </div>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <Link href="/portal/news" className="hover:text-rose-600 transition-colors">
                    {t("news.portalTitle")}
                  </Link>
                </li>
                <li>
                  <Link href="/portal/facility" className="hover:text-rose-600 transition-colors">
                    {t("facility.portalTitle")}
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-rose-600 transition-colors">
                    {locale === "en" ? "Sign In" : "เข้าสู่ระบบ"}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="font-semibold text-xs uppercase tracking-wider text-slate-400">
                {locale === "en" ? "Contact Information" : "ข้อมูลการติดต่อ"}
              </div>
              {hasAnyContact ? (
                <div className="space-y-2 text-xs text-slate-600">
                  {address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <span>{address}</span>
                        {mapUrl && (
                          <a
                            href={mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 hover:underline font-medium ml-1.5"
                          >
                            <span>{locale === "en" ? "Map" : "แผนที่"}</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-rose-600 shrink-0" />
                      <a
                        href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
                        className="hover:text-rose-600 transition-colors"
                      >
                        {phone}
                      </a>
                    </div>
                  )}

                  {email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-rose-600 shrink-0" />
                      <a
                        href={`mailto:${email}`}
                        className="hover:text-rose-600 transition-colors hover:underline"
                      >
                        {email}
                      </a>
                    </div>
                  )}

                  {officeHours && (
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock className="h-4 w-4 text-rose-600 shrink-0" />
                      <span>{officeHours}</span>
                    </div>
                  )}

                  {(website || facebook || lineId) && (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap">
                      {website && (
                        <a
                          href={website.startsWith("http") ? website : `https://${website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-colors"
                          title={website}
                        >
                          <Globe className="h-3 w-3 text-slate-500" />
                          <span>Website</span>
                        </a>
                      )}
                      {facebook && (
                        <a
                          href={facebook.startsWith("http") ? facebook : `https://facebook.com/${facebook}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs transition-colors"
                          title={facebook}
                        >
                          <span className="font-bold text-[10px]">f</span>
                          <span>Facebook</span>
                        </a>
                      )}
                      {lineId && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs">
                          <span className="font-bold text-[10px]">LINE</span>
                          <span>{lineId}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500 leading-relaxed">
                  {locale === "en"
                    ? "Building 1, Faculty of Information Science, University Campus\nTel: 02-123-4567 | Email: info@faculty.ac.th"
                    : "อาคาร 1 คณะวิทยาการและเทคโนโลยีสารสนเทศ\nโทรศัพท์: 02-123-4567 | อีเมล: info@faculty.ac.th"}
                </p>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div>
              &copy; {new Date().getFullYear()}{" "}
              {locale === "en"
                ? "Faculty Web Platform. All rights reserved."
                : "ระบบเว็บไซต์คณะ สงวนลิขสิทธิ์ตามกฎหมาย"}
            </div>
            <div className="flex items-center gap-2">
              <span>Powered by VibeCore Framework</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
