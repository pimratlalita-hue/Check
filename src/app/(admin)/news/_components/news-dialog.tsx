"use client";

import { useState } from "react";
import { Sparkles, Loader2, Languages } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/shared/lib/i18n/client";
import {
  LiyonDialog,
  LiyonDialogCloseButton,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonField,
  LiyonSelect,
  LiyonSwitchRow,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import { generateEnglishNewsAction } from "@/features/news/actions";
import { TinyEditor } from "./tiny-editor";
import type { NewsFormData } from "./types";
import type { NewsCategory, NewsStatus } from "@/features/news";

function isHtmlEmpty(html: string): boolean {
  if (!html) return true;
  const text = html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
  return text.length === 0 && !html.includes("<img");
}

interface NewsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: NewsFormData;
  setForm: React.Dispatch<React.SetStateAction<NewsFormData>>;
  onSubmit: () => Promise<void>;
  pending: boolean;
  canPublish: boolean;
}

function slugify(text: string): string {
  const cleaned = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || `news-${Date.now().toString().slice(-6)}`;
}

export function NewsDialog({
  open,
  onOpenChange,
  form,
  setForm,
  onSubmit,
  pending,
  canPublish,
}: NewsDialogProps) {
  const t = useT();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isEditing = Boolean(form.id);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const handleAutoSlug = () => {
    if (form.titleEn.trim()) {
      setForm((prev) => ({ ...prev, slug: slugify(prev.titleEn) }));
    } else if (form.titleTh.trim()) {
      setForm((prev) => ({ ...prev, slug: slugify(prev.titleTh) }));
    }
  };

  const handleAiTranslate = async () => {
    if (!form.titleTh.trim()) {
      toast.error("กรุณากรอกหัวข้อข่าวภาษาไทยก่อนใช้งาน AI");
      return;
    }
    if (isHtmlEmpty(form.contentTh)) {
      toast.error("กรุณากรอกเนื้อหาข่าวภาษาไทยก่อนใช้งาน AI");
      return;
    }

    setIsGeneratingAi(true);
    try {
      const res = await generateEnglishNewsAction({
        titleTh: form.titleTh,
        summaryTh: form.summaryTh,
        contentTh: form.contentTh,
        category: form.category,
      });

      if (!res.ok) {
        toast.error("ไม่สามารถสร้างเนื้อหาภาษาอังกฤษด้วย AI ได้: " + (res.error.message || res.error.code));
        return;
      }

      setForm((prev) => ({
        ...prev,
        titleEn: res.data.titleEn || prev.titleEn,
        summaryEn: res.data.summaryEn || prev.summaryEn,
        contentEn: res.data.contentEn || prev.contentEn,
        slug: res.data.slug || prev.slug,
      }));

      // Clear validation errors for English fields if any
      setErrors((prev) => {
        const next = { ...prev };
        delete next.titleEn;
        delete next.summaryEn;
        delete next.contentEn;
        delete next.slug;
        return next;
      });

      toast.success("✨ แปลและสร้างฉบับภาษาอังกฤษด้วย Google Gemini สำเร็จ!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเชื่อมต่อ AI";
      toast.error(msg);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.titleTh.trim()) errs.titleTh = t("error.required");
    if (!form.titleEn.trim()) errs.titleEn = t("error.required");
    if (!form.slug.trim()) errs.slug = t("error.required");
    if (isHtmlEmpty(form.contentTh)) errs.contentTh = t("error.required");
    if (isHtmlEmpty(form.contentEn)) errs.contentEn = t("error.required");
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit();
  };

  return (
    <LiyonDialog open={open} onOpenChange={onOpenChange} wide>
      <LiyonDialogCloseButton label={t("common.cancel")} />
      <LiyonDialogHeader
        title={isEditing ? t("news.edit") : t("news.create")}
        description={t("news.subtitle")}
      />
      <form onSubmit={handleSubmit}>
        <LiyonDialogBody>
          <div className="space-y-4 py-2 max-h-[65vh] overflow-y-auto pr-1">
            {/* AI Assistant Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200/80 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-purple-600 text-white shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-purple-950 m-0 flex items-center gap-1.5">
                    ผู้ช่วย AI สองภาษา (Google Gemini)
                    <span className="text-[10px] px-1.5 py-0.2 bg-purple-200/70 text-purple-800 rounded font-semibold">Gemini Flash</span>
                  </h4>
                  <p className="text-[11px] text-purple-700 m-0">
                    พิมพ์เนื้อหาภาษาไทย แล้วกดปุ่มนี้เพื่อแปลและสร้าง Title, Summary, Content ภาษาอังกฤษพร้อม SEO Slug ให้อัตโนมัติ
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAiTranslate}
                disabled={isGeneratingAi || !form.titleTh.trim()}
                className="gap-1.5 h-8.5 text-xs font-semibold bg-white hover:bg-purple-600 hover:text-white border-purple-300 text-purple-700 transition-all shadow-xs shrink-0 cursor-pointer"
              >
                {isGeneratingAi ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                    <span>Gemini กำลังสร้างฉบับ EN...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>✨ สร้างฉบับภาษาอังกฤษด้วย AI</span>
                  </>
                )}
              </Button>
            </div>

            {/* Titles (Thai & English) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <LiyonField
                label={t("news.titleTh")}
                error={errors.titleTh}
                hint="เช่น พิธีปฐมนิเทศนักศึกษาใหม่ ประจำปีการศึกษา 2569"
              >
                <input
                  type="text"
                  value={form.titleTh}
                  onChange={(e) => setForm((prev) => ({ ...prev, titleTh: e.target.value }))}
                  placeholder="กรอกหัวข้อข่าวภาษาไทย"
                  required
                />
              </LiyonField>

              <LiyonField
                label={t("news.titleEn")}
                error={errors.titleEn}
                hint="e.g. New Student Orientation Ceremony 2026"
              >
                <input
                  type="text"
                  value={form.titleEn}
                  onChange={(e) => setForm((prev) => ({ ...prev, titleEn: e.target.value }))}
                  placeholder="Enter English title"
                  required
                />
              </LiyonField>
            </div>

            {/* Slug */}
            <div className="flex flex-col gap-1">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <LiyonField
                    label={t("news.slug")}
                    error={errors.slug}
                    hint={t("news.slugHint")}
                  >
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                        }))
                      }
                      placeholder="faculty-orientation-2026"
                      required
                    />
                  </LiyonField>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAutoSlug}
                  className="mb-1 gap-1.5 shrink-0 text-xs"
                  title="สร้าง Slug จากชื่อภาษาอังกฤษอัตโนมัติ"
                >
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Auto-Slug
                </Button>
              </div>
            </div>

            {/* Category & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <LiyonField label={t("news.category")}>
                <LiyonSelect
                  value={form.category}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, category: e.target.value as NewsCategory }))
                  }
                >
                  <option value="GENERAL">{t("news.cat.GENERAL")}</option>
                  <option value="ACADEMIC">{t("news.cat.ACADEMIC")}</option>
                  <option value="EVENT">{t("news.cat.EVENT")}</option>
                  <option value="PROCUREMENT">{t("news.cat.PROCUREMENT")}</option>
                </LiyonSelect>
              </LiyonField>

              <LiyonField label={t("news.status")}>
                <LiyonSelect
                  value={form.status}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, status: e.target.value as NewsStatus }))
                  }
                  disabled={!canPublish && form.status === "PUBLISHED"}
                >
                  <option value="DRAFT">{t("news.status.DRAFT")}</option>
                  <option value="PUBLISHED" disabled={!canPublish}>
                    {t("news.status.PUBLISHED")} {!canPublish ? " (Requires Publish Permission)" : ""}
                  </option>
                  <option value="ARCHIVED">{t("news.status.ARCHIVED")}</option>
                </LiyonSelect>
              </LiyonField>
            </div>

            {/* Cover Image URL */}
            <LiyonField
              label={t("news.coverImage")}
              hint="ใส่ลิงก์รูปภาพหน้าปก เช่น https://images.unsplash.com/photo-..."
            >
              <input
                type="url"
                value={form.coverImageUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, coverImageUrl: e.target.value }))}
                placeholder="https://..."
              />
            </LiyonField>

            {/* Summaries */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <LiyonField label={t("news.summaryTh")}>
                <textarea
                  rows={2}
                  value={form.summaryTh}
                  onChange={(e) => setForm((prev) => ({ ...prev, summaryTh: e.target.value }))}
                  placeholder="บทคัดย่อย่อภาษาไทย..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                />
              </LiyonField>

              <LiyonField label={t("news.summaryEn")}>
                <textarea
                  rows={2}
                  value={form.summaryEn}
                  onChange={(e) => setForm((prev) => ({ ...prev, summaryEn: e.target.value }))}
                  placeholder="Brief summary in English..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                />
              </LiyonField>
            </div>

            {/* Full Contents */}
            <div className="space-y-4">
              <LiyonField
                label={t("news.contentTh")}
                error={errors.contentTh}
                hint="จัดรูปแบบเนื้อหาด้วย Tiny Editor (ตัวหนา ตัวเอียง ตาราง รายการ และลิงก์)"
              >
                <TinyEditor
                  value={form.contentTh}
                  onChange={(val) => setForm((prev) => ({ ...prev, contentTh: val }))}
                  placeholder="พิมพ์หรือจัดรูปแบบเนื้อหาข่าวฉบับเต็มภาษาไทยที่นี่..."
                  height={300}
                />
              </LiyonField>

              <LiyonField
                label={t("news.contentEn")}
                error={errors.contentEn}
                hint="เนื้อหาภาษาอังกฤษ (สร้างอัตโนมัติด้วย AI หรือแก้ไขด้วย Tiny Editor ได้โดยตรง)"
              >
                <TinyEditor
                  value={form.contentEn}
                  onChange={(val) => setForm((prev) => ({ ...prev, contentEn: val }))}
                  placeholder="Full news content in English (Markdown/HTML supported)..."
                  height={260}
                />
              </LiyonField>
            </div>

            {/* Pin Switch */}
            {canPublish && (
              <div className="pt-2">
                <LiyonSwitchRow
                  id="isPinned"
                  checked={form.isPinned}
                  onCheckedChange={(checked) =>
                    setForm((prev) => ({ ...prev, isPinned: checked }))
                  }
                  label={t("news.isPinned")}
                  description="ปักหมุดข่าวนี้ไว้ด้านบนสุดของหน้าหลักและหน้าข่าวสาร"
                />
              </div>
            )}
          </div>
        </LiyonDialogBody>

        <LiyonDialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? t("common.saving") : isEditing ? t("common.save") : t("news.create")}
          </Button>
        </LiyonDialogFooter>
      </form>
    </LiyonDialog>
  );
}
