"use client";

import React, { useEffect, useState } from "react";
import { Presentation, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProjectorModeToggle({ className }: { className?: string }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("gtmts_projector_mode");
    if (saved === "true") {
      setActive(true);
      document.documentElement.classList.add("projector-mode");
    }
  }, []);

  const toggle = () => {
    const next = !active;
    setActive(next);
    if (next) {
      document.documentElement.classList.add("projector-mode");
      localStorage.setItem("gtmts_projector_mode", "true");
    } else {
      document.documentElement.classList.remove("projector-mode");
      localStorage.setItem("gtmts_projector_mode", "false");
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={toggle}
      title={active ? "ปิดโหมดฉายจอห้องประชุม" : "เปิดโหมดฉายจอห้องประชุม (เพิ่มคอนทราสต์และความชัดเจน)"}
      className={`h-8 px-2.5 text-xs flex items-center gap-1.5 transition-all ${
        active
          ? "bg-rose-600 text-white border-rose-600 hover:bg-rose-700 hover:text-white shadow-xs font-semibold"
          : "text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
      } ${className ?? ""}`}
    >
      <Presentation className={`h-3.5 w-3.5 ${active ? "animate-pulse text-white" : "text-slate-500"}`} />
      <span className="hidden sm:inline">
        {active ? "ฉายจอ (ON)" : "ฉายจอ"}
      </span>
      {active && <Check className="h-3 w-3" />}
    </Button>
  );
}
