"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
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
import type { NewsFormData } from "./types";
import type { NewsCategory, NewsStatus } from "@/features/news";

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

  const handleAutoSlug = () => {
    if (form.titleEn.trim()) {
      setForm((prev) => ({ ...prev, slug: slugify(prev.titleEn) }));
    } else if (form.titleTh.trim()) {
      setForm((prev) => ({ ...prev, slug: slugify(prev.titleTh) }));
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.titleTh.trim()) errs.titleTh = t("error.required");
    if (!form.titleEn.trim()) errs.titleEn = t("error.required");
    if (!form.slug.trim()) errs.slug = t("error.required");
    if (!form.contentTh.trim()) errs.contentTh = t("error.required");
    if (!form.contentEn.trim()) errs.contentEn = t("error.required");
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
            <div className="space-y-3">
              <LiyonField label={t("news.contentTh")} error={errors.contentTh}>
                <textarea
                  rows={6}
                  value={form.contentTh}
                  onChange={(e) => setForm((prev) => ({ ...prev, contentTh: e.target.value }))}
                  placeholder="เนื้อหาข่าวฉบับเต็มภาษาไทย (รองรับ Markdown)..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm font-mono"
                  required
                />
              </LiyonField>

              <LiyonField label={t("news.contentEn")} error={errors.contentEn}>
                <textarea
                  rows={6}
                  value={form.contentEn}
                  onChange={(e) => setForm((prev) => ({ ...prev, contentEn: e.target.value }))}
                  placeholder="Full news content in English (Markdown supported)..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm font-mono"
                  required
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
