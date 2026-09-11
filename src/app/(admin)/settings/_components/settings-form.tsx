"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Send,
  Loader2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiyonCard, LiyonField, PalettePicker } from "@/shared/components/liyon";
import { useT } from "@/shared/lib/i18n/client";
import type { PaletteId } from "@/shared/lib/palette";
import type { TenantSettings, SmtpSettings } from "@/features/identity";
import { updateSettingsAction, testGmailSmtpAction } from "@/features/identity/actions";

export function SettingsForm({ initial }: { initial: TenantSettings }) {
  const t = useT();
  const router = useRouter();
  const [form, setForm] = useState({
    nameTh: initial.nameTh,
    nameEn: initial.nameEn,
    logoUrl: initial.logoUrl ?? "",
    palette: initial.palette as PaletteId,
    smtp: {
      enabled: initial.smtp?.enabled ?? false,
      user: initial.smtp?.user ?? "",
      appPassword: initial.smtp?.appPassword ?? "",
      fromName: initial.smtp?.fromName ?? "GTMTS Graduate School",
      port: initial.smtp?.port ?? 587,
    } as SmtpSettings,
  });

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, start] = useTransition();

  // Test Email States
  const [testRecipient, setTestRecipient] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [testPending, setTestPending] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  function save() {
    start(async () => {
      const r = await updateSettingsAction(form);
      if (!r.ok) {
        setErrors(r.error.fieldErrors ?? {});
        if (!r.error.fieldErrors) toast.error(t(`error.${r.error.code}`));
        return;
      }
      setErrors({});
      toast.success(t("settings.saveOk"));
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("tenant-info-updated", {
            detail: {
              nameTh: form.nameTh,
              nameEn: form.nameEn,
              logoUrl: form.logoUrl || null,
            },
          })
        );
      }
      router.refresh();
    });
  }

  async function runTestEmail() {
    if (!form.smtp.user) {
      toast.error("กรุณากรอกอีเมล Gmail ก่อนทดสอบ");
      return;
    }
    if (!form.smtp.appPassword) {
      toast.error("กรุณากรอก Google App Password ก่อนทดสอบ");
      return;
    }
    if (!testRecipient) {
      toast.error("กรุณากรอกอีเมลผู้รับสำหรับทดสอบ");
      return;
    }

    setTestPending(true);
    setTestResult(null);

    try {
      const res = await testGmailSmtpAction({
        user: form.smtp.user,
        appPassword: form.smtp.appPassword,
        fromName: form.smtp.fromName,
        port: form.smtp.port,
        recipient: testRecipient,
      });

      if (res.ok) {
        setTestResult({
          success: true,
          message: `${t("settings.smtpTestSuccess")} (ส่งไปยัง: ${res.data.recipient})`,
        });
        toast.success(t("settings.smtpTestSuccess"));
      } else {
        const errMsg =
          res.error.message ||
          res.error.code ||
          "เชื่อมต่อไม่สำเร็จ กรุณาตรวจสอบ App Password";
        setTestResult({
          success: false,
          message: `${t("settings.smtpTestFail")} (${errMsg})`,
        });
        toast.error(t("settings.smtpTestFail"));
      }
    } catch (err) {
      setTestResult({
        success: false,
        message:
          err instanceof Error
            ? err.message
            : "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
      });
      toast.error(t("settings.smtpTestFail"));
    } finally {
      setTestPending(false);
    }
  }

  return (
    <>
      <header className="ph">
        <h1>{t("settings.title")}</h1>
      </header>

      <div className="set-cards space-y-6">
        {/* 1. ข้อมูลองค์กร */}
        <LiyonCard>
          <h2>{t("settings.orgTitle")}</h2>
          <div className="fields">
            <LiyonField
              label={t("settings.nameTh")}
              htmlFor="s-name-th"
              error={errors.nameTh?.[0]}
            >
              <input
                id="s-name-th"
                value={form.nameTh}
                onChange={(e) => setForm({ ...form, nameTh: e.target.value })}
              />
            </LiyonField>
            <LiyonField
              label={t("settings.nameEn")}
              htmlFor="s-name-en"
              error={errors.nameEn?.[0]}
            >
              <input
                id="s-name-en"
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
              />
            </LiyonField>
            <LiyonField
              label={t("settings.logoUrl")}
              htmlFor="s-logo"
              hint={t("common.optional")}
              error={errors.logoUrl?.[0]}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                    {form.logoUrl ? (
                      <img
                        src={form.logoUrl}
                        alt="Logo preview"
                        className="h-full w-full object-contain p-1"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">ไม่มี</span>
                    )}
                  </div>
                  <input
                    id="s-logo"
                    placeholder="https://... หรือ /faculty-logo.svg"
                    value={form.logoUrl}
                    onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                    className="flex-1"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-slate-400">ตัวเลือกด่วน:</span>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, logoUrl: "/faculty-logo.svg" })}
                    className="text-rose-600 hover:text-rose-700 underline font-medium"
                  >
                    ใช้ตราสัญลักษณ์คณะตัวอย่าง (/faculty-logo.svg)
                  </button>
                  {form.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, logoUrl: "" })}
                      className="text-slate-500 hover:text-slate-700 underline ml-2"
                    >
                      ล้างโลโก้ (ใช้ไอคอนเริ่มต้น)
                    </button>
                  )}
                </div>
              </div>
            </LiyonField>
          </div>
        </LiyonCard>

        {/* 2. การตั้งค่า Gmail SMTP */}
        <LiyonCard>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 m-0">
                  {t("settings.smtpTitle")}
                </h2>
                <p className="text-xs text-slate-500 m-0">
                  {t("settings.smtpDesc")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  form.smtp.enabled
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    form.smtp.enabled ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                  }`}
                />
                {form.smtp.enabled ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Toggle Switch */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <input
                type="checkbox"
                id="smtp-enabled-toggle"
                checked={form.smtp.enabled}
                onChange={(e) =>
                  setForm({
                    ...form,
                    smtp: { ...form.smtp, enabled: e.target.checked },
                  })
                }
                className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
              />
              <label
                htmlFor="smtp-enabled-toggle"
                className="text-sm font-semibold text-slate-800 cursor-pointer flex-1"
              >
                {t("settings.smtpEnabled")}
              </label>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                TLS 1.3 / SSL
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Gmail Address */}
              <LiyonField
                label={t("settings.smtpUser")}
                htmlFor="s-smtp-user"
                error={errors["smtp.user"]?.[0]}
              >
                <input
                  id="s-smtp-user"
                  type="email"
                  placeholder={t("settings.smtpUserPh")}
                  value={form.smtp.user}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      smtp: { ...form.smtp, user: e.target.value },
                    })
                  }
                />
              </LiyonField>

              {/* App Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="s-smtp-pass"
                    className="text-xs font-semibold text-slate-700"
                  >
                    {t("settings.smtpAppPassword")}
                  </label>
                  <a
                    href="https://myaccount.google.com/apppasswords"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline"
                  >
                    <span>สร้าง App Password</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <div className="relative flex items-center">
                  <input
                    id="s-smtp-pass"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("settings.smtpAppPasswordPh")}
                    value={form.smtp.appPassword}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        smtp: { ...form.smtp, appPassword: e.target.value },
                      })
                    }
                    className="w-full pr-10 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 text-slate-400 hover:text-slate-600 p-1"
                    title={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-2xs text-slate-400">
                  {t("settings.smtpAppPasswordHint")}
                </p>
              </div>

              {/* From Name */}
              <LiyonField
                label={t("settings.smtpFromName")}
                htmlFor="s-smtp-from-name"
              >
                <input
                  id="s-smtp-from-name"
                  type="text"
                  placeholder={t("settings.smtpFromNamePh")}
                  value={form.smtp.fromName}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      smtp: { ...form.smtp, fromName: e.target.value },
                    })
                  }
                />
              </LiyonField>

              {/* SMTP Port */}
              <LiyonField label={t("settings.smtpPort")} htmlFor="s-smtp-port">
                <select
                  id="s-smtp-port"
                  value={form.smtp.port}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      smtp: { ...form.smtp, port: Number(e.target.value) },
                    })
                  }
                  className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                >
                  <option value={587}>587 (TLS / STARTTLS - แนะนำ)</option>
                  <option value={465}>465 (SSL Direct)</option>
                </select>
              </LiyonField>
            </div>

            {/* Test Connection Box */}
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-800 m-0">
                  {t("settings.smtpTestTitle")}
                </h3>
              </div>
              <p className="text-xs text-slate-500 m-0">
                {t("settings.smtpTestDesc")}
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                <input
                  type="email"
                  placeholder={t("settings.smtpTestRecipientPh")}
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  className="flex-1 h-9 rounded-md border border-slate-300 bg-white px-3 text-xs focus:ring-2 focus:ring-rose-500"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={runTestEmail}
                  disabled={testPending}
                  className="gap-1.5 h-9 text-xs font-semibold whitespace-nowrap bg-white hover:bg-slate-100"
                >
                  {testPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>{t("settings.smtpTesting")}</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>{t("settings.smtpTestBtn")}</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Test Result Alert Banner */}
              {testResult && (
                <div
                  className={`flex items-start gap-2.5 p-3 rounded-lg text-xs leading-relaxed ${
                    testResult.success
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>
          </div>
        </LiyonCard>

        {/* 3. โทนสีและแบรนด์ */}
        <LiyonCard>
          <h2>{t("settings.brandTitle")}</h2>
          <p>{t("settings.brandDesc")}</p>
          <PalettePicker
            value={form.palette}
            onChange={(p) => setForm({ ...form, palette: p })}
            label={t("settings.paletteLabel")}
          />
          {form.palette === "coral" && (
            <p className="warn" role="note">
              {t("settings.coralWarn")}
            </p>
          )}
        </LiyonCard>

        {/* Save Bar */}
        <div className="savebar">
          <Button type="button" onClick={save} disabled={pending}>
            {pending ? t("common.saving") : t("common.save")}
          </Button>
        </div>
      </div>
    </>
  );
}
