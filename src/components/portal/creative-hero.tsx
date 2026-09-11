"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ChevronDown, Compass, ShieldCheck } from "lucide-react";
import { useLocale } from "@/shared/lib/i18n/client";

export function CreativeHero() {
  const locale = useLocale();
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
      className="relative w-full rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-hidden py-14 sm:py-20 px-6 sm:px-12 select-none transition-all duration-700 mb-10"
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
          className="absolute top-[-10%] right-[10%] sm:right-[15%] w-[340px] sm:w-[480px] h-[340px] sm:h-[480px] bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 opacity-65 sm:opacity-75 blur-[75px] sm:blur-[95px] animate-morph-1 will-change-transform"
        />

        {/* Layer 2: Neon Magenta / Rose Heart */}
        <div
          className="absolute top-[10%] right-[5%] sm:right-[10%] w-[300px] sm:w-[420px] h-[300px] sm:h-[420px] bg-gradient-to-bl from-pink-500 via-rose-600 to-fuchsia-600 opacity-60 sm:opacity-70 blur-[70px] sm:blur-[90px] animate-morph-2 will-change-transform"
        />

        {/* Layer 3: Soft Violet / Royal Indigo Depth */}
        <div
          className="absolute top-[20%] right-[20%] sm:right-[25%] w-[260px] sm:w-[380px] h-[260px] sm:h-[380px] bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 opacity-45 sm:opacity-55 blur-[80px] sm:blur-[100px] animate-morph-3 will-change-transform"
        />

        {/* Dynamic Mouse Follow Light */}
        <div
          className="absolute w-[320px] h-[320px] rounded-full bg-rose-400/20 blur-[80px] transition-all duration-300 pointer-events-none"
          style={{
            left: `${mousePos.x * 100}%`,
            top: `${mousePos.y * 100}%`,
            transform: "translate(-50%, -50%)",
            opacity: isHovered ? 1 : 0.4,
          }}
        />
      </div>

      {/* ═══ Header Top Minimalist Bar ═══ */}
      <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 mb-12 sm:mb-16">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span className="font-semibold tracking-wider uppercase text-slate-700">
            {locale === "en" ? "GTMTS Intelligence" : "GTMTS • บัณฑิตศึกษาและวิจัย"}
          </span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-400 hidden sm:inline">
            {locale === "en" ? "Faculty of Information Science" : "คณะวิทยาการและเทคโนโลยีสารสนเทศ"}
          </span>
        </div>

        <div className="flex items-center gap-2 bg-slate-100/80 backdrop-blur-xs px-3 py-1 rounded-full border border-slate-200/60 text-slate-600 font-medium">
          <Sparkles className="h-3 w-3 text-amber-500" />
          <span>{locale === "en" ? "Academic Year 2026" : "ปีการศึกษา 2569"}</span>
        </div>
      </div>

      {/* ═══ Main Headline & Editorial Typography (MotionSites Style) ═══ */}
      <div className="relative z-10 max-w-3xl space-y-6 sm:space-y-8">
        <div className="space-y-2">
          <h1 className="font-editorial text-5xl sm:text-7xl lg:text-8xl text-slate-900 font-normal tracking-tight leading-[1.04] transition-all duration-500">
            retro soul, <br className="hidden sm:inline" />
            <span className="italic font-light bg-gradient-to-r from-slate-900 via-slate-800 to-rose-700 bg-clip-text text-transparent">
              modern vision.
            </span>
          </h1>

          {/* Thai Context Subheading */}
          <p className="text-xs sm:text-sm font-medium tracking-wide uppercase text-rose-600/90 pt-1">
            {locale === "en"
              ? "Graduate Thesis Management & Tracking Ecosystem"
              : "นวัตกรรมการบริหารจัดการวิทยานิพนธ์และผลงานวิจัยระดับบัณฑิตศึกษา"}
          </p>
        </div>

        {/* Narrative Description */}
        <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-xl">
          {locale === "en"
            ? "A cross-functional academic platform crafting seamless thesis workflows, committee defenses, and AI-accelerated scholarly milestones with a clean, detail-driven style."
            : "ระบบบริหารจัดการกระบวนการวิทยานิพนธ์ครบวงจร ผสานมาตรฐานวิชาการระดับสูงเข้ากับปัญญาประดิษฐ์และเวิร์กโฟลว์อัจฉริยะ เพื่อการวิจัยที่ก้าวล้ำและตรวจสอบได้ในทุกมิติ"}
        </p>

        {/* ═══ Action Pills & Interactive CTAs ═══ */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
          {/* Primary Action Button */}
          <Link
            href="/portal/petitions"
            className="group relative inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-md hover:shadow-lg shadow-slate-900/15 transition-all duration-300 active:scale-98"
          >
            <span>{locale === "en" ? "Submit Thesis Proposal" : "ยื่นคำร้องเค้าโครง / สอบจบ"}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>

          {/* Secondary Action Button */}
          <Link
            href="/portal/curriculum"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/80 hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-sm font-medium border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all duration-300"
          >
            <Compass className="h-4 w-4 text-rose-600" />
            <span>{locale === "en" ? "Explore Programs" : "หลักสูตรบัณฑิตศึกษา"}</span>
          </Link>

          {/* AI Feature Pill */}
          <Link
            href="/portal/petitions"
            className="inline-flex items-center gap-1.5 px-4 py-3 rounded-full bg-rose-50/80 hover:bg-rose-100/90 text-rose-700 text-xs font-semibold border border-rose-200/60 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-rose-500" />
            <span>{locale === "en" ? "AI Summarizer" : "AI สรุปแนวคิดวิทยานิพนธ์"}</span>
          </Link>
        </div>
      </div>

      {/* ═══ Bottom Bar (Copyright, Chevron, and Feature Tags) ═══ */}
      <div className="relative z-10 pt-14 sm:pt-20 mt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>&copy; 2026 GTMTS Research</span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1 text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>PDPA Biometrics</span>
          </span>
        </div>

        {/* Center Floating Scroll Down Button */}
        <button
          onClick={scrollToContent}
          className="animate-float-slow hover:text-slate-800 transition-colors p-1.5 rounded-full hover:bg-slate-100/80 flex items-center justify-center cursor-pointer group"
          aria-label="Scroll to content"
          title={locale === "en" ? "Explore News & Articles" : "เลื่อนลงสู่เนื้อหาข่าวสาร"}
        >
          <ChevronDown className="h-5 w-5 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-y-0.5" />
        </button>

        {/* Right Feature Badges */}
        <div className="flex items-center gap-3 text-slate-500">
          <Link href="/portal/facility" className="hover:text-rose-600 transition-colors">
            {locale === "en" ? "Exam Rooms" : "ห้องสอบ"}
          </Link>
          <span className="text-slate-200">•</span>
          <Link href="/portal/staff" className="hover:text-rose-600 transition-colors">
            {locale === "en" ? "Advisors" : "อาจารย์ที่ปรึกษา"}
          </Link>
          <span className="text-slate-200">•</span>
          <Link href="/portal/attendance" className="hover:text-rose-600 transition-colors">
            {locale === "en" ? "Attendance" : "เช็คชื่อเข้าสอบ"}
          </Link>
        </div>
      </div>
    </div>
  );
}
