"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  LogIn,
  Menu,
  X,
  ChevronRight,
  LayoutDashboard,
  BookOpen,
  Users,
  FileText,
  DoorClosed,
  ScanFace,
  Newspaper,
  ChevronDown,
} from "lucide-react";
import { useLocale, useT } from "@/shared/lib/i18n/client";
import { Button } from "@/components/ui/button";

interface PortalNavbarProps {
  logoUrl?: string | null;
  orgNameTh?: string;
  orgNameEn?: string;
  utilities?: React.ReactNode;
}

function parseOrgTitle(name: string, isEn: boolean) {
  const trimmed = (name || "").trim();
  if (!trimmed) {
    return {
      primary: isEn ? "Department of Foreign Languages, Faculty of Humanities, MCU" : "ภาควิชาภาษาต่างประเทศ คณะมนุษยศาสตร์ มจร",
      secondary: isEn ? "Graduate Thesis & Research Ecosystem" : "ระบบบริหารจัดการและติดตามวิทยานิพนธ์ (GTMTS)",
    };
  }
  // If explicitly formatted with line breaks or slashes, honor the author's structure
  if (trimmed.includes("\n")) {
    const [p, ...rest] = trimmed.split("\n");
    return { primary: p.trim(), secondary: rest.join(" ").trim() };
  }
  if (trimmed.includes(" / ")) {
    const [p, ...rest] = trimmed.split(" / ");
    return { primary: p.trim(), secondary: rest.join(" / ").trim() };
  }
  if (trimmed.includes(" • ")) {
    const [p, ...rest] = trimmed.split(" • ");
    return { primary: p.trim(), secondary: rest.join(" • ").trim() };
  }
  return {
    primary: trimmed,
    secondary: isEn ? "Graduate Thesis & Research Ecosystem" : "ระบบบริหารจัดการและติดตามวิทยานิพนธ์ (GTMTS)",
  };
}

export function PortalNavbar({
  logoUrl,
  orgNameTh,
  orgNameEn,
  utilities,
}: PortalNavbarProps) {
  const locale = useLocale();
  const t = useT();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);

  // Dynamic organization state synced with props & instant events
  const [currentNameTh, setCurrentNameTh] = useState(orgNameTh || "");
  const [currentNameEn, setCurrentNameEn] = useState(orgNameEn || "");
  const [currentLogoUrl, setCurrentLogoUrl] = useState(logoUrl || null);

  useEffect(() => {
    setCurrentNameTh(orgNameTh || "");
    setCurrentNameEn(orgNameEn || "");
    setCurrentLogoUrl(logoUrl || null);
  }, [orgNameTh, orgNameEn, logoUrl]);

  useEffect(() => {
    function handleUpdate(e: Event) {
      const customEvent = e as CustomEvent<Partial<{ nameTh: string; nameEn: string; logoUrl: string | null }>>;
      if (customEvent.detail) {
        if (customEvent.detail.nameTh !== undefined) setCurrentNameTh(customEvent.detail.nameTh);
        if (customEvent.detail.nameEn !== undefined) setCurrentNameEn(customEvent.detail.nameEn);
        if (customEvent.detail.logoUrl !== undefined) setCurrentLogoUrl(customEvent.detail.logoUrl);
      }
    }
    window.addEventListener("tenant-info-updated", handleUpdate);
    return () => window.removeEventListener("tenant-info-updated", handleUpdate);
  }, []);

  const isEn = locale === "en";
  const activeOrgName = isEn ? (currentNameEn || currentNameTh) : (currentNameTh || currentNameEn);
  const titleInfo = parseOrgTitle(activeOrgName, isEn);

  const navLinks = [
    {
      href: "/portal/news",
      label: isEn ? "News & Events" : "ข่าวสาร",
      fullLabel: t("news.portalTitle"),
      icon: Newspaper,
      isActive: pathname.startsWith("/portal/news"),
    },
    {
      href: "/portal/curriculum",
      label: isEn ? "Programs" : "หลักสูตร",
      fullLabel: t("curriculum.portalTitle"),
      icon: BookOpen,
      isActive: pathname.startsWith("/portal/curriculum"),
    },
    {
      href: "/portal/staff",
      label: isEn ? "Faculty" : "คณาจารย์",
      fullLabel: t("staff.portalTitle"),
      icon: Users,
      isActive: pathname.startsWith("/portal/staff"),
    },
    {
      href: "/portal/petitions",
      label: isEn ? "Petitions" : "คำร้องวิชาการ",
      fullLabel: isEn ? "Online Petitions" : "บริการคำร้องวิชาการ",
      icon: FileText,
      isActive: pathname.startsWith("/portal/petitions"),
    },
    {
      href: "/portal/facility",
      label: isEn ? "Facilities" : "จองห้อง/สถานที่",
      fullLabel: isEn ? "Rooms & Facilities" : "จองห้องและสิ่งอำนวยความสะดวก",
      icon: DoorClosed,
      isActive: pathname.startsWith("/portal/facility"),
    },
    {
      href: "/portal/attendance",
      label: isEn ? "Attendance" : "เช็คชื่อสอบ",
      fullLabel: isEn ? "Exam Attendance" : "เช็คชื่อเข้าสอบ (PDPA)",
      icon: ScanFace,
      isActive: pathname.startsWith("/portal/attendance"),
    },
  ];

  return (
    <>
      {/* ═══ Top Live Notice Bar ═══ */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-medium text-slate-200 truncate">
              {isEn
                ? "Academic Year 2026 • Graduate Studies & Research Ecosystem"
                : "ระบบเว็บไซต์คณะและบัณฑิตศึกษา • ประจำปีการศึกษา 2569"}
            </span>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <Link
              href="/login"
              className="hover:text-white transition-colors flex items-center gap-1.5 text-slate-300 hover:underline"
            >
              <LogIn className="h-3.5 w-3.5 text-rose-400" />
              <span>{isEn ? "Staff & Student Login" : "เข้าสู่ระบบบุคลากร / นิสิต"}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ═══ Main Navigation Header ═══ */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3">
          
          {/* Brand Logo & Site Identity */}
          <Link
            href="/portal/news"
            className="flex items-center gap-3 group shrink-0 min-w-0"
          >
            <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-gradient-to-tr from-rose-500 via-rose-600 to-pink-500 p-0.5 shadow-md shadow-rose-500/15 group-hover:scale-105 transition-all duration-300 shrink-0">
              <div className="h-full w-full bg-white rounded-[14px] flex items-center justify-center overflow-hidden p-0.5">
                {currentLogoUrl ? (
                  <img
                    src={currentLogoUrl}
                    alt={activeOrgName}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <GraduationCap className="h-6 w-6 text-rose-600" />
                )}
              </div>
            </div>

            <div className="flex flex-col min-w-0" title={activeOrgName}>
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 group-hover:text-rose-600 transition-colors truncate">
                {titleInfo.primary}
              </span>
              {titleInfo.secondary && (
                <span className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                  {titleInfo.secondary}
                </span>
              )}
            </div>
          </Link>

          {/* Desktop Navigation Links (>= xl) */}
          <nav className="hidden xl:flex items-center gap-1 shrink-0">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap ${
                    item.isActive
                      ? "text-rose-600 bg-rose-50/90 font-semibold shadow-2xs"
                      : "text-slate-600 hover:text-rose-600 hover:bg-slate-100/80"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${item.isActive ? "text-rose-600" : "text-slate-400 group-hover:text-rose-500"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Medium Screen Navigation (lg to xl) */}
          <nav className="hidden lg:flex xl:hidden items-center gap-1 shrink-0">
            {navLinks.slice(0, 3).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 whitespace-nowrap ${
                    item.isActive
                      ? "text-rose-600 bg-rose-50 font-semibold"
                      : "text-slate-600 hover:text-rose-600 hover:bg-slate-100/80"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Dropdown for other 3 services on medium screens */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-slate-100/80 flex items-center gap-1 cursor-pointer"
              >
                <span>{isEn ? "Services" : "บริการออนไลน์"}</span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {servicesDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in-50 duration-150"
                  onMouseLeave={() => setServicesDropdownOpen(false)}
                >
                  {navLinks.slice(3).map((subItem) => {
                    const SubIcon = subItem.icon;
                    return (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        onClick={() => setServicesDropdownOpen(false)}
                        className={`flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors ${
                          subItem.isActive
                            ? "bg-rose-50 text-rose-600 font-semibold"
                            : "text-slate-700 hover:bg-slate-50 hover:text-rose-600"
                        }`}
                      >
                        <SubIcon className="h-3.5 w-3.5" />
                        <span>{subItem.fullLabel}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Right Actions / CTA & Utilities (Desktop) */}
          <div className="hidden lg:flex items-center gap-2.5 shrink-0">
            {/* Admin Console CTA Button */}
            <Link href="/login">
              <Button
                size="sm"
                className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-3.5 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 text-xs hover:shadow-md hover:shadow-slate-900/10 cursor-pointer"
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-rose-400" />
                <span>{isEn ? "Admin Console" : "ระบบจัดการหลังบ้าน"}</span>
              </Button>
            </Link>

            {/* Utilities Toolbar */}
            {utilities && (
              <div className="pl-2 border-l border-slate-200 flex items-center gap-1.5">
                {utilities}
              </div>
            )}
          </div>

          {/* Mobile Right Controls (< lg): Utilities + Hamburger Toggle */}
          <div className="flex lg:hidden items-center gap-1.5 shrink-0">
            {utilities && (
              <div className="flex items-center gap-1 scale-90">
                {utilities}
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500/30 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* ═══ Mobile Navigation Drawer (Dropdown) ═══ */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white/98 backdrop-blur-xl px-4 py-4 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-200">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-1">
              {isEn ? "Main Navigation" : "เมนูหลักของเว็บไซต์"}
            </div>
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    item.isActive
                      ? "bg-rose-50 text-rose-700 font-semibold"
                      : "text-slate-700 hover:bg-slate-50 hover:text-rose-600"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${item.isActive ? "text-rose-600" : "text-slate-400"}`} />
                    <span>{item.fullLabel}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </Link>
              );
            })}

            <div className="pt-3 mt-2 border-t border-slate-100 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
              >
                <LayoutDashboard className="h-4 w-4 text-rose-400" />
                <span>{isEn ? "Admin Console" : "ระบบจัดการหลังบ้าน"}</span>
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
