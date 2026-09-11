"use client";

import * as React from "react";
import {
  Globe,
  Check,
  Building2,
  GraduationCap,
  Sparkles,
  BookOpen,
  Cpu,
  HeartPulse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LiyonDialog,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonDialogCloseButton,
} from "@/shared/components/liyon/liyon-dialog";

export interface OrgPresetItem {
  id: string;
  nameTh: string;
  nameEn: string;
  category: "graduate" | "engineering" | "medicine" | "science" | "interdisciplinary";
  categoryLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const GLOBAL_ORG_PRESETS: OrgPresetItem[] = [
  {
    id: "mcu-humanities-foreign-lang",
    nameTh: "บัณฑิตศึกษา ภาควิชาภาษาต่างประเทศ คณะมนุษยศาสตร์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย",
    nameEn: "Graduate Studies, Department of Foreign Languages, Faculty of Humanities, Mahachulalongkornrajavidyalaya University",
    category: "graduate",
    categoryLabel: "บัณฑิตศึกษา / ภาษาต่างประเทศ (MCU)",
    icon: GraduationCap,
    description: "หลักสูตรบัณฑิตศึกษา ภาควิชาภาษาต่างประเทศ คณะมนุษยศาสตร์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย",
  },
  {
    id: "grad-school-innov",
    nameTh: "บัณฑิตวิทยาลัย มหาวิทยาลัยนวัตกรรมและการวิจัย",
    nameEn: "The Graduate School of Innovation and Advanced Research",
    category: "graduate",
    categoryLabel: "บัณฑิตวิทยาลัยวิจัย (QS World Research)",
    icon: GraduationCap,
    description: "รูปแบบสากลสำหรับบัณฑิตวิทยาลัยที่เน้นงานวิจัยเชิงลึกและนวัตกรรมระดับโลก",
  },
  {
    id: "grad-school-cu",
    nameTh: "บัณฑิตวิทยาลัย จุฬาลงกรณ์มหาวิทยาลัย (มาตรฐานสากล)",
    nameEn: "The Graduate School, Chulalongkorn University",
    category: "graduate",
    categoryLabel: "มหาวิทยาลัยแห่งชาติ (National Flagship)",
    icon: Building2,
    description: "มาตรฐานชื่อทางการระดับสากลของสถาบันอุดมศึกษาชั้นนำแห่งชาติ",
  },
  {
    id: "fac-eng-tech",
    nameTh: "คณะวิศวกรรมศาสตร์และนวัตกรรมดิจิทัล",
    nameEn: "Faculty of Engineering and Digital Innovation",
    category: "engineering",
    categoryLabel: "วิศวกรรมและเทคโนโลยี (ABET / IEEE Standard)",
    icon: Cpu,
    description: "มาตรฐานการตั้งชื่อคณะทางด้านวิศวกรรมศาสตร์และเทคโนโลยีดิจิทัลสากล",
  },
  {
    id: "fac-med-health",
    nameTh: "คณะแพทยศาสตร์และวิทยาศาสตร์สุขภาพขั้นสูง",
    nameEn: "Faculty of Medicine and Advanced Health Sciences",
    category: "medicine",
    categoryLabel: "การแพทย์และวิทยาศาสตร์สุขภาพ (WFME Standard)",
    icon: HeartPulse,
    description: "มาตรฐานองค์กรระดับนานาชาติด้านวิทยาศาสตร์การแพทย์และชีวอนามัย",
  },
  {
    id: "col-interdisciplinary",
    nameTh: "วิทยาลัยสหวิทยาการและเทคโนโลยีขั้นสูง",
    nameEn: "College of Interdisciplinary and Advanced Technologies",
    category: "interdisciplinary",
    categoryLabel: "สหวิทยาการข้ามศาสตร์ (Interdisciplinary)",
    icon: Sparkles,
    description: "รูปแบบวิทยาลัยบูรณาการศาสตร์ รองรับหลักสูตรปัญญาประดิษฐ์และวิทยานิพนธ์ประยุกต์",
  },
  {
    id: "inst-ai-science",
    nameTh: "สถาบันวิทยาการและนวัตกรรมปัญญาประดิษฐ์",
    nameEn: "Institute of AI Science and Technology Innovation",
    category: "science",
    categoryLabel: "สถาบันวิทยาการเฉพาะทาง (Specialized Institute)",
    icon: Cpu,
    description: "โครงสร้างสถาบันชั้นนำด้านวิทยาการข้อมูลและคอมพิวเตอร์ตามแนวทาง MIT/Stanford",
  },
  {
    id: "grad-tu-standard",
    nameTh: "สำนักบัณฑิตศึกษาและวิจัย มหาวิทยาลัยธรรมศาสตร์",
    nameEn: "Office of Graduate Studies and Research, Thammasat University",
    category: "graduate",
    categoryLabel: "สำนักบัณฑิตศึกษาและวิจัย (Research Office)",
    icon: BookOpen,
    description: "มาตรฐานชื่อองค์กรสายสังคมศาสตร์ มนุษยศาสตร์ และการวิจัยระดับสูง",
  },
  {
    id: "fac-ict-global",
    nameTh: "คณะเทคโนโลยีสารสนเทศและการสื่อสาร",
    nameEn: "Faculty of Information and Communication Technology",
    category: "engineering",
    categoryLabel: "เทคโนโลยีสารสนเทศ (ACM / IEEE Standard)",
    icon: Building2,
    description: "ชื่อทางการมาตรฐานสากลสำหรับคณะเทคโนโลยีสารสนเทศและวิทยาการคอมพิวเตอร์",
  },
];

interface GlobalOrgPresetsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentNameTh: string;
  currentNameEn: string;
  currentLogoUrl?: string;
  onApply: (nameTh: string, nameEn: string) => void;
}

export function GlobalOrgPresetsModal({
  open,
  onOpenChange,
  currentNameTh,
  currentNameEn,
  currentLogoUrl,
  onApply,
}: GlobalOrgPresetsModalProps) {
  const [selectedPresetId, setSelectedPresetId] = React.useState<string>(GLOBAL_ORG_PRESETS[0].id);
  const [customNameTh, setCustomNameTh] = React.useState<string>(currentNameTh);
  const [customNameEn, setCustomNameEn] = React.useState<string>(currentNameEn);
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");

  // Sync state when opening
  React.useEffect(() => {
    if (open) {
      setCustomNameTh(currentNameTh);
      setCustomNameEn(currentNameEn);
    }
  }, [open, currentNameTh, currentNameEn]);

  const handleSelectPreset = (preset: OrgPresetItem) => {
    setSelectedPresetId(preset.id);
    setCustomNameTh(preset.nameTh);
    setCustomNameEn(preset.nameEn);
  };

  const handleApply = () => {
    onApply(customNameTh.trim(), customNameEn.trim());
    onOpenChange(false);
  };

  const filteredPresets = selectedCategory === "all"
    ? GLOBAL_ORG_PRESETS
    : GLOBAL_ORG_PRESETS.filter((p) => p.category === selectedCategory);

  return (
    <LiyonDialog open={open} onOpenChange={onOpenChange} wide>
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 m-0">
              เทมเพลตชื่อองค์กรระดับมาตรฐานสากล (Global Academic Standards)
            </h2>
            <p className="text-xs text-slate-500 m-0 mt-0.5">
              เลือกใช้ชื่อมหาวิทยาลัย คณะ และบัณฑิตวิทยาลัยตามมาตรฐาน QS World และ THE Rankings ทั้งไทยและอังกฤษ
            </p>
          </div>
        </div>
        <LiyonDialogCloseButton label="ปิดหน้าต่าง" />
      </div>

      <LiyonDialogBody className="p-6 space-y-5">
        {/* Live Navbar Preview Box */}
        <div className="p-4 bg-slate-900 text-white rounded-xl shadow-md border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>ตัวอย่างการแสดงผลบนแถบนำทาง (Navbar Preview)</span>
            </span>
            <span className="text-3xs text-slate-400 uppercase tracking-wider font-mono">
              Dynamic Real-time
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* TH Mode */}
            <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700">
              <div className="text-2xs text-slate-400 font-semibold mb-1 flex items-center justify-between">
                <span>โหมดภาษาไทย (TH)</span>
                <span className="px-1.5 py-0.2 rounded bg-rose-900/60 text-rose-300 font-mono text-3xs">TH</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
                  {currentLogoUrl ? (
                    <img src={currentLogoUrl} alt="" className="h-full w-full object-contain p-0.5" />
                  ) : (
                    <GraduationCap className="h-4 w-4 text-rose-400" />
                  )}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-white truncate m-0">{customNameTh || "ชื่อองค์กรภาษาไทย"}</p>
                  <p className="text-3xs text-slate-400 truncate m-0">ระบบบริหารจัดการวิทยานิพนธ์</p>
                </div>
              </div>
            </div>

            {/* EN Mode */}
            <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700">
              <div className="text-2xs text-slate-400 font-semibold mb-1 flex items-center justify-between">
                <span>โหมดภาษาอังกฤษ (EN)</span>
                <span className="px-1.5 py-0.2 rounded bg-rose-900/60 text-rose-300 font-mono text-3xs">EN</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
                  {currentLogoUrl ? (
                    <img src={currentLogoUrl} alt="" className="h-full w-full object-contain p-0.5" />
                  ) : (
                    <GraduationCap className="h-4 w-4 text-rose-400" />
                  )}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-white truncate m-0">{customNameEn || "Organization Name in English"}</p>
                  <p className="text-3xs text-slate-400 truncate m-0">Graduate Thesis System</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: "all", label: "ทั้งหมด" },
            { id: "graduate", label: "บัณฑิตวิทยาลัย" },
            { id: "engineering", label: "วิศวกรรม/เทคโนโลยี" },
            { id: "medicine", label: "การแพทย์/สุขภาพ" },
            { id: "interdisciplinary", label: "สหวิทยาการ" },
            { id: "science", label: "วิทยาศาสตร์เฉพาะทาง" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Preset Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
          {filteredPresets.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            const Icon = preset.icon;

            return (
              <div
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? "border-rose-600 bg-rose-50/40 ring-2 ring-rose-600/20 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-1.5 rounded-lg ${
                          isSelected ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-3xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {preset.categoryLabel}
                      </span>
                    </div>

                    {isSelected && (
                      <span className="flex items-center gap-1 text-2xs font-bold text-rose-600">
                        <Check className="h-3.5 w-3.5" />
                        <span>เลือกแล้ว</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-bold text-slate-900 m-0 line-clamp-1">{preset.nameTh}</p>
                  <p className="text-2xs text-slate-600 m-0 mt-0.5 italic line-clamp-1 font-sans">{preset.nameEn}</p>
                  <p className="text-3xs text-slate-400 m-0 mt-2 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPreset(preset);
                    }}
                    className={`text-2xs font-semibold px-2.5 py-1 rounded transition-colors ${
                      isSelected
                        ? "bg-rose-600 text-white"
                        : "text-rose-600 hover:bg-rose-50"
                    }`}
                  >
                    {isSelected ? "ชุดที่เลือกอยู่" : "เลือกใช้ชุดนี้"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Editable Fields for Fine Tuning */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
          <span className="text-xs font-bold text-slate-800">
            ปรับแต่งข้อความเพิ่มเติมก่อนนำไปใช้งาน (Fine-tune Values):
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label htmlFor="custom-name-th" className="text-2xs font-semibold text-slate-600 block mb-1">
                ชื่อภาษาไทย (Thai Name)
              </label>
              <input
                id="custom-name-th"
                type="text"
                value={customNameTh}
                onChange={(e) => setCustomNameTh(e.target.value)}
                className="w-full text-xs"
              />
            </div>
            <div>
              <label htmlFor="custom-name-en" className="text-2xs font-semibold text-slate-600 block mb-1">
                ชื่อภาษาอังกฤษ (English Name)
              </label>
              <input
                id="custom-name-en"
                type="text"
                value={customNameEn}
                onChange={(e) => setCustomNameEn(e.target.value)}
                className="w-full text-xs"
              />
            </div>
          </div>
        </div>
      </LiyonDialogBody>

      <LiyonDialogFooter className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          ยกเลิก
        </Button>
        <Button
          type="button"
          onClick={handleApply}
          disabled={!customNameTh.trim() || !customNameEn.trim()}
          className="gap-1.5"
        >
          <Check className="h-3.5 w-3.5" />
          <span>นำชื่อองค์กรไปใช้งาน</span>
        </Button>
      </LiyonDialogFooter>
    </LiyonDialog>
  );
}
