"use client";

import React, { useState, useRef, useEffect } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import {
  Users,
  Check,
  ChevronDown,
  Loader2,
  Shield,
  GraduationCap,
  Scale,
  Building,
  User,
} from "lucide-react";
import { useAppSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";

interface RoleOption {
  code: string;
  email: string;
  labelTh: string;
  labelEn: string;
  nameTh: string;
  badgeTone: string;
  icon: React.ElementType;
}

const GTMTS_ROLES: RoleOption[] = [
  {
    code: "SUPER_ADMIN",
    email: "admin@app.local",
    labelTh: "ผู้ดูแลสูงสุด (บัณฑิตวิทยาลัย)",
    labelEn: "Super Admin",
    nameTh: "ผู้ดูแลสูงสุด",
    badgeTone: "bg-rose-100 text-rose-800 border-rose-200",
    icon: Shield,
  },
  {
    code: "ADVISOR",
    email: "advisor@app.local",
    labelTh: "อาจารย์ที่ปรึกษาวิทยานิพนธ์",
    labelEn: "Thesis Advisor",
    nameTh: "ผศ.ดร.สมชาย ใจดี",
    badgeTone: "bg-amber-100 text-amber-800 border-amber-200",
    icon: GraduationCap,
  },
  {
    code: "COMMITTEE_CHAIR",
    email: "chair@app.local",
    labelTh: "ประธานหลักสูตร / ประธานสอบ",
    labelEn: "Committee Chair",
    nameTh: "ศ.ดร.วิชาการ เข้มงวด",
    badgeTone: "bg-indigo-100 text-indigo-800 border-indigo-200",
    icon: Scale,
  },
  {
    code: "DEAN_OFFICE",
    email: "dean@app.local",
    labelTh: "เจ้าหน้าที่บัณฑิตวิทยาลัย",
    labelEn: "Dean's Office Staff",
    nameTh: "งานวิชาการบัณฑิตวิทยาลัย",
    badgeTone: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: Building,
  },
  {
    code: "STUDENT",
    email: "student@app.local",
    labelTh: "นิสิตระดับบัณฑิตศึกษา",
    labelEn: "Graduate Student",
    nameTh: "นายมานะ มีใจ",
    badgeTone: "bg-slate-100 text-slate-800 border-slate-200",
    icon: User,
  },
];

export function RoleSwitcher({ className }: { className?: string }) {
  const { user, roles, isSuperAdmin } = useAppSession();
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentRoleCode = isSuperAdmin
    ? "SUPER_ADMIN"
    : roles[0] || "STUDENT";

  const currentRole =
    GTMTS_ROLES.find(
      (r) =>
        r.code === currentRoleCode ||
        (user?.email && r.email.toLowerCase() === user.email.toLowerCase())
    ) || GTMTS_ROLES[0];

  const handleSwitchRole = async (target: RoleOption) => {
    if (target.email === user?.email) {
      setOpen(false);
      return;
    }

    setSwitching(target.code);
    try {
      const res = await signIn("credentials", {
        email: target.email,
        password: "Passw0rd!vibe",
        redirect: false,
      });

      if (res?.ok) {
        toast.success(`สลับบทบาทเป็น "${target.labelTh}" เรียบร้อยแล้ว`);
        setOpen(false);
        // Atomic refresh to reload session and permissions
        window.location.reload();
      } else {
        toast.error("ไม่สามารถสลับบทบาทได้");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setSwitching(null);
    }
  };

  const IconComp = currentRole.icon;

  return (
    <div className={`relative inline-block ${className ?? ""}`} ref={dropdownRef}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        disabled={switching !== null}
        title="สลับบทบาทจำลอง (5 Roles Simulator)"
        className="h-8 px-2.5 text-xs flex items-center gap-1.5 border-slate-200 hover:bg-slate-50 text-slate-700 shadow-2xs font-medium cursor-pointer"
      >
        {switching ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-600" />
        ) : (
          <IconComp className="h-3.5 w-3.5 text-rose-600" />
        )}
        <span className="hidden sm:inline font-semibold">
          {currentRole.nameTh.split(" ")[0]}
        </span>
        <span
          className={`text-2xs px-1.5 py-0.2 rounded font-medium border ${currentRole.badgeTone}`}
        >
          {currentRole.labelEn}
        </span>
        <ChevronDown className="h-3 w-3 text-slate-400" />
      </Button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3 py-1.5 border-b border-slate-100">
            <div className="text-2xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Users className="h-3 w-3 text-rose-600" />
              <span>สลับบทบาทจำลอง 5 บทบาท (Role Simulator)</span>
            </div>
            <div className="text-2xs text-slate-500 mt-0.5">
              คลิกเพื่อสลับบทบาทและทดสอบสิทธิ์ทันที
            </div>
          </div>

          <div className="p-1 space-y-0.5">
            {GTMTS_ROLES.map((role) => {
              const RoleIcon = role.icon;
              const isCurrent =
                role.code === currentRole.code ||
                (user?.email && role.email.toLowerCase() === user.email.toLowerCase());
              const isPending = switching === role.code;

              return (
                <button
                  key={role.code}
                  type="button"
                  disabled={switching !== null}
                  onClick={() => handleSwitchRole(role)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-start gap-2.5 transition-colors cursor-pointer ${
                    isCurrent
                      ? "bg-rose-50/70 text-rose-900 font-medium"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="mt-0.5 p-1 rounded bg-white border border-slate-200 text-rose-600 shadow-2xs">
                    {isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RoleIcon className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 truncate">
                        {role.labelTh}
                      </span>
                      {isCurrent && <Check className="h-3.5 w-3.5 text-rose-600 shrink-0" />}
                    </div>
                    <div className="text-2xs text-slate-500 truncate">{role.nameTh}</div>
                    <div className="text-3xs text-slate-400 font-mono">{role.email}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
