"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ChevronDown,
  Compass,
  ShieldCheck,
  GraduationCap,
  Award,
  Zap,
  BookOpen,
} from "lucide-react";
import { useLocale } from "@/shared/lib/i18n/client";

interface CreativeHeroProps {
  tenantNameTh?: string;
  tenantNameEn?: string;
}

export function CreativeHero({
  tenantNameTh,
  tenantNameEn,
}: CreativeHeroProps) {
  const locale = useLocale();
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isEn = locale === "en";

  // Dynamic department display
  const departmentLabel = isEn
    ? (tenantNameEn || "Department of Foreign Languages, Faculty of Humanities, MCU")
    : "ภาควิชาภาษาต่างประเทศ คณะมนุษยศาสตร์";

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setMousePos({ x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
    }
    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  const scrollToContent = () => {
    const target = document.getElementById("portal-content-section");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: 0.5, y: 0.5 });
      }}
      className="relative w-full rounded-3xl sm:rounded-[36px] bg-gradient-to-br from-white via-slate-50/60 to-rose-50/20 border border-slate-200/90 shadow-xl shadow-rose-950/3 overflow-hidden py-12 sm:py-18 lg:py-20 px-6 sm:px-12 lg:px-16 select-none transition-all duration-700 mb-12"
    >
      {/* ═══ Embedded MotionSites Animations & Typography ═══ */}
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap");

        .font-editorial {
          font-family: "Instrument Serif", Georgia, Cambria, "Times New Roman", Times, serif;
        }

        @keyframes morphBlob1 {
          0%, 100% {
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
            transform: translate(0px, 0px) rotate(0deg) scale(1);
          }
          34% {
            border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
            transform: translate(35px, -25px) rotate(110deg) scale(1.12);
          }
          67% {
            border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%;
            transform: translate(-25px, 20px) rotate(240deg) scale(0.92);
          }
        }

        @keyframes morphBlob2 {
          0%, 100% {
            border-radius: 40% 60% 60% 40% / 40% 50% 60% 50%;
            transform: translate(0px, 0px) rotate(0deg) scale(1);
          }
          50% {
            border-radius: 60% 40% 30% 70% / 70% 30% 60% 40%;
            transform: translate(-30px, -30px) rotate(-160deg) scale(1.15);
          }
        }

        @keyframes morphBlob3 {
          0%, 100% {
            border-radius: 50% 50% 40% 60% / 60% 40% 60% 40%;
            transform: translate(0px, 0px) rotate(0deg) scale(0.95);
          }
          50% {
            border-radius: 40% 60% 70% 30% / 40% 70% 30% 60%;
            transform: translate(25px, 15px) rotate(180deg) scale(1.1);
          }
        }

        @keyframes floatSlow {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .animate-morph-1 {
          animation: morphBlob1 18s ease-in-out infinite;
        }

        .animate-morph-2 {
          animation: morphBlob2 14s ease-in-out infinite;
        }

        .animate-morph-3 {
          animation: morphBlob3 22s ease-in-out infinite;
        }

        .animate-float-slow {
          animation: floatSlow 4s ease-in-out infinite;
        }
      `}</style>

      {/* ═══ Living Organic Fluid Gradient Mesh (Aura) ═══ */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden transition-transform duration-1000 ease-out"
        style={{
          transform: `translate(${(mousePos.x - 0.5) * 20}px, ${(mousePos.y - 0.5) * 15}px)`,
        }}
      >
        {/* Layer 1: Coral / Sunset Amber Glow */}
        <div
          className="absolute top-[-10%] right-[10%] sm:right-[15%] w-[360px] sm:w-[500px] h-[360px] sm:h-[500px] bg-gradient-to-tr from-amber-400 via-orange-400 to-rose-400 opacity-55 sm:opacity-65 blur-[85px] sm:blur-[105px] animate-morph-1 will-change-transform"
        />

        {/* Layer 2: Neon Magenta / Rose Heart */}
        <div
          className="absolute top-[10%] right-[5%] sm:right-[10%] w-[320px] sm:w-[440px] h-[320px] sm:h-[440px] bg-gradient-to-bl from-pink-400 via-rose-500 to-fuchsia-500 opacity-50 sm:opacity-60 blur-[75px] sm:blur-[95px] animate-morph-2 will-change-transform"
        />

        {/* Layer 3: Soft Violet / Royal Indigo Depth */}
        <div
          className="absolute top-[20%] right-[20%] sm:right-[25%] w-[280px] sm:w-[400px] h-[280px] sm:h-[400px] bg-gradient-to-r from-purple-400 via-indigo-400 to-pink-400 opacity-35 sm:opacity-45 blur-[85px] sm:blur-[105px] animate-morph-3 will-change-transform"
        />

        {/* Dynamic Mouse Follow Light */}
        <div
          className="absolute w-[340px] h-[340px] rounded-full bg-rose-400/20 blur-[85px] transition-all duration-300 pointer-events-none"
          style={{
            left: `${mousePos.x * 100}%`,
            top: `${mousePos.y * 100}%`,
            transform: "translate(-50%, -50%)",
            opacity: isHovered ? 1 : 0.4,
          }}
        />
      </div>

      {/* ═══ Header Top Minimalist Bar: Tags & Badges ═══ */}
      <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 mb-10 sm:mb-14">
        {/* Left Tag / Badge */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600" />
          </span>
          <span className="font-bold tracking-wider uppercase text-slate-800">
            {isEn ? "GTMTS Intelligence" : "GTMTS • บัณฑิตศึกษาและวิจัย"}
          </span>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <span className="text-slate-600 font-medium hidden sm:inline bg-white/70 px-2.5 py-0.5 rounded-full border border-slate-200/60 shadow-2xs">
            {departmentLabel}
          </span>
        </div>

        {/* Right Academic Year Glowing Badge */}
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-amber-200/80 text-slate-700 font-semibold shadow-xs">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span>{isEn ? "Academic Year 2026" : "ปีการศึกษา 2569"}</span>
        </div>
      </div>

      {/* ═══ Main Headline & Editorial Typography (MotionSites Style) ═══ */}
      <div className="relative z-10 max-w-3xl space-y-6 sm:space-y-8">
        <div className="space-y-3">
          {/* Main Headline */}
          <h1 className="font-editorial text-6xl sm:text-7xl lg:text-8xl text-slate-900 font-normal tracking-tight leading-[1.02] transition-all duration-500">
            retro soul, <br className="hidden sm:inline" />
            <span className="italic font-light bg-gradient-to-r from-slate-900 via-rose-700 to-pink-600 bg-clip-text text-transparent">
              modern vision.
            </span>
          </h1>

          {/* Thai Subheading Accent Pill */}
          <div className="pt-2">
            <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-rose-700 bg-rose-50/90 border border-rose-200/70 px-3.5 py-1 rounded-full shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-rose-500 shrink-0" />
              <span>
                {isEn
                  ? "Graduate Thesis Management & Academic Research Ecosystem"
                  : "นวัตกรรมการบริหารจัดการวิทยานิพนธ์และผลงานวิจัยระดับบัณฑิตศึกษา"}
              </span>
            </span>
          </div>
        </div>

        {/* Narrative Description */}
        <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl">
          {isEn
            ? "A unified scholarly ecosystem streamlining thesis proposals, committee defenses, and AI-accelerated academic milestones with elegance, precision, and verifiability."
            : "ระบบบริหารจัดการกระบวนการวิทยานิพนธ์ครบวงจร ผสานมาตรฐานวิชาการระดับสูงเข้ากับปัญญาประดิษฐ์และเวิร์กโฟลว์อัจฉริยะ เพื่อการวิจัยที่ก้าวล้ำและตรวจสอบได้ในทุกมิติ"}
        </p>

        {/* ═══ Action Pills & Interactive CTAs ═══ */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
          {/* Primary Action Button */}
          <Link
            href="/portal/petitions"
            className="group relative inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-md hover:shadow-lg shadow-slate-900/15 transition-all duration-300 active:scale-98 cursor-pointer"
          >
            <span>{isEn ? "Submit Thesis Proposal" : "ยื่นคำร้องเค้าโครง / สอบจบ"}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 text-rose-400" />
          </Link>

          {/* Secondary Action Button */}
          <Link
            href="/portal/curriculum"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/90 hover:bg-slate-50 text-slate-800 hover:text-slate-900 text-sm font-medium border border-slate-200 shadow-xs hover:shadow-sm transition-all duration-300 cursor-pointer"
          >
            <Compass className="h-4 w-4 text-rose-600" />
            <span>{isEn ? "Explore Programs" : "หลักสูตรบัณฑิตศึกษา"}</span>
          </Link>

          {/* AI Feature Pill */}
          <Link
            href="/portal/petitions"
            className="inline-flex items-center gap-2 px-4.5 py-3 rounded-full bg-rose-50/90 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200/80 transition-colors shadow-2xs cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-rose-500" />
            <span>{isEn ? "AI Thesis Copilot" : "AI สรุปแนวคิดวิทยานิพนธ์"}</span>
          </Link>
        </div>

        {/* ═══ Micro Highlights / Key Indicators ═══ */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 bg-white/70 px-3 py-1 rounded-full border border-slate-200/60">
            <GraduationCap className="h-3.5 w-3.5 text-rose-600" />
            <span>{isEn ? "Master of Arts in English" : "หลักสูตร ศศ.ม. ภาษาอังกฤษ"}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/70 px-3 py-1 rounded-full border border-slate-200/60">
            <Award className="h-3.5 w-3.5 text-amber-600" />
            <span>{isEn ? "Scopus & TCI Standards" : "มาตรฐานวารสาร TCI / Scopus"}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/70 px-3 py-1 rounded-full border border-slate-200/60">
            <Zap className="h-3.5 w-3.5 text-blue-600" />
            <span>{isEn ? "100% Digital Workflow" : "ระบบดิจิทัลและ AI 100%"}</span>
          </div>
        </div>
      </div>

      {/* ═══ Bottom Bar (Copyright, Chevron, and Feature Tags) ═══ */}
      <div className="relative z-10 pt-12 sm:pt-16 mt-8 border-t border-slate-200/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-slate-500">&copy; 2026 GTMTS • {departmentLabel}</span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1 text-slate-600 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>PDPA Biometrics</span>
          </span>
        </div>

        {/* Center Floating Scroll Down Button */}
        <button
          onClick={scrollToContent}
          className="animate-float-slow hover:text-slate-800 transition-colors p-2 rounded-full hover:bg-white/80 border border-transparent hover:border-slate-200/60 flex items-center justify-center cursor-pointer group shadow-2xs"
          aria-label="Scroll to content"
          title={isEn ? "Explore News & Articles" : "เลื่อนลงสู่เนื้อหาข่าวสารประชาสัมพันธ์"}
        >
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 group-hover:text-rose-600">
            <span>{isEn ? "Latest News" : "ข่าวสารประชาสัมพันธ์"}</span>
            <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-rose-600 transition-transform group-hover:translate-y-0.5" />
          </div>
        </button>

        {/* Right Feature Badges */}
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <Link href="/portal/facility" className="hover:text-rose-600 transition-colors">
            {isEn ? "Exam Rooms" : "ห้องสอบ"}
          </Link>
          <span className="text-slate-200">•</span>
          <Link href="/portal/staff" className="hover:text-rose-600 transition-colors">
            {isEn ? "Faculty Staff" : "อาจารย์ที่ปรึกษา"}
          </Link>
          <span className="text-slate-200">•</span>
          <Link href="/portal/attendance" className="hover:text-rose-600 transition-colors">
            {isEn ? "Attendance" : "เช็คชื่อเข้าสอบ"}
          </Link>
        </div>
      </div>
    </div>
  );
}
