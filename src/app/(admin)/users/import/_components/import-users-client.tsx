"use client";

import { useCallback, useEffect, useState, useTransition, useRef, type ChangeEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  RotateCcw,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StatusPill, LiyonSelect } from "@/shared/components/liyon";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { localizedName } from "@/shared/lib/format";
import {
  listRolesForPickerAction,
  checkExistingEmailsAction,
  importUsersAction,
} from "@/features/identity/actions";

interface RoleOption {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string;
}

interface ParsedRow {
  rowNum: number;
  email: string;
  name: string;
  roleCode?: string;
  resolvedRoleId?: string;
  resolvedRoleName?: string;
  status: "valid" | "warning" | "error";
  issue?: string;
}

interface ImportOutcome {
  email: string;
  name: string;
  roleName?: string;
  roleCode?: string;
  success: boolean;
  userId?: string;
  link?: string;
  mailDelivered?: boolean;
  error?: string;
}

function parseCSV(text: string): string[][] {
  // Strip UTF-8 BOM if present
  const clean = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let insideQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    const nextChar = clean[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // skip next quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = "";
    } else if ((char === "\r" || char === "\n") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i++;
      }
      currentRow.push(currentCell.trim());
      if (currentRow.some((c) => c !== "")) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = "";
    } else {
      currentCell += char;
    }
  }

  if (currentCell !== "" || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((c) => c !== "")) {
      rows.push(currentRow);
    }
  }

  return rows;
}

export function ImportUsersClient() {
  const t = useT();
  const locale = useLocale();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [defaultRoleId, setDefaultRoleId] = useState("");
  const [fileName, setFileName] = useState("");
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [filterMode, setFilterMode] = useState<"all" | "valid" | "error">("all");
  const [skipInvalid, setSkipInvalid] = useState(true);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const [pending, start] = useTransition();
  const [importResult, setImportResult] = useState<{
    total: number;
    successCount: number;
    failCount: number;
    outcomes: ImportOutcome[];
  } | null>(null);

  // Load available roles for the tenant
  useEffect(() => {
    listRolesForPickerAction().then((r) => {
      if (r.ok) {
        setRoles(r.data);
        // Default to STAFF or STUDENT or the first non-SUPER_ADMIN role
        const preferredDefault =
          r.data.find((x) => x.code === "STAFF") ||
          r.data.find((x) => x.code === "STUDENT") ||
          r.data.find((x) => x.code !== "SUPER_ADMIN");
        if (preferredDefault) {
          setDefaultRoleId(preferredDefault.id);
        }
      }
    });
  }, []);

  // Download Sample Template
  function handleDownloadTemplate() {
    const headers = ["email", "name", "role"];
    const samples = [
      ["somchai.j@example.com", "ดร.สมชาย ใจดี", "STAFF"],
      ["wichian.p@example.com", "พระวิเชียร ปริชาโน", "ADVISOR"],
      ["ananya.k@example.com", "ผศ.ดร.อนัญญา เกียรติอนันต์", "COMMITTEE_CHAIR"],
      ["student01@example.com", "นายสมศักดิ์ รักเรียน", "STUDENT"],
    ];

    const lines = [
      headers.join(","),
      ...samples.map((row) =>
        row
          .map((val) =>
            val.includes(",") || val.includes('"')
              ? `"${val.replace(/"/g, '""')}"`
              : val
          )
          .join(",")
      ),
    ];

    const csvText = "\uFEFF" + lines.join("\r\n");
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users_import_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(t("users.import.templateBtn"));
  }

  // Handle File Upload and Parsing
  const processFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith(".csv")) {
        toast.error(t("users.import.dropzoneSub"));
        return;
      }
      setFileName(file.name);
      setImportResult(null);

      const text = await file.text();
      const rawRows = parseCSV(text);

      if (rawRows.length < 2) {
        toast.error(t("users.import.errEmpty"));
        setParsedRows([]);
        return;
      }

      const headerRow = rawRows[0].map((h) => h.toLowerCase().trim());
      let emailIdx = headerRow.findIndex((h) =>
        ["email", "mail", "e-mail", "อีเมล"].includes(h)
      );
      let nameIdx = headerRow.findIndex((h) =>
        ["name", "fullname", "displayname", "ชื่อ", "ชื่อ-นามสกุล", "ชื่อสกุล"].includes(h)
      );
      let roleIdx = headerRow.findIndex((h) =>
        ["role", "roles", "rolecode", "บทบาท", "รหัสบทบาท", "ชื่อบทบาท"].includes(h)
      );

      // Fallback if header doesn't match standard names
      if (emailIdx === -1 && rawRows[0].length >= 1) emailIdx = 0;
      if (nameIdx === -1 && rawRows[0].length >= 2) nameIdx = 1;
      if (roleIdx === -1 && rawRows[0].length >= 3) roleIdx = 2;

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const seenEmailsInFile = new Set<string>();
      const emailsToCheck: string[] = [];

      const initialRows: ParsedRow[] = [];

      for (let i = 1; i < rawRows.length; i++) {
        const row = rawRows[i];
        const rawEmail = (row[emailIdx] ?? "").trim();
        const rawName = (row[nameIdx] ?? "").trim();
        const rawRole = roleIdx !== -1 ? (row[roleIdx] ?? "").trim() : "";

        const emailLower = rawEmail.toLowerCase();
        let status: "valid" | "warning" | "error" = "valid";
        let issue: string | undefined;

        if (!rawEmail || !emailRegex.test(emailLower)) {
          status = "error";
          issue = t("users.import.errNoEmail");
        } else if (!rawName) {
          status = "error";
          issue = t("users.import.errNoName");
        } else if (seenEmailsInFile.has(emailLower)) {
          status = "error";
          issue = t("users.import.statusDuplicate");
        } else {
          seenEmailsInFile.add(emailLower);
          emailsToCheck.push(emailLower);
        }

        // Match role
        let matchedRole: RoleOption | undefined;
        if (rawRole) {
          const upperRole = rawRole.toUpperCase();
          const lowerRole = rawRole.toLowerCase();
          matchedRole =
            roles.find((r) => r.code.toUpperCase() === upperRole) ||
            roles.find((r) => r.nameTh.toLowerCase() === lowerRole) ||
            roles.find((r) => r.nameEn.toLowerCase() === lowerRole);

          if (!matchedRole && status === "valid") {
            status = "error";
            issue = t("users.import.errInvalidRole", { role: rawRole });
          }
        }

        if (!matchedRole && defaultRoleId) {
          matchedRole = roles.find((r) => r.id === defaultRoleId);
        }

        if (matchedRole?.code === "SUPER_ADMIN" && status === "valid") {
          status = "error";
          issue = t("users.import.errSuperAdmin");
        }

        initialRows.push({
          rowNum: i + 1,
          email: rawEmail,
          name: rawName,
          roleCode: matchedRole?.code,
          resolvedRoleId: matchedRole?.id,
          resolvedRoleName: matchedRole ? localizedName(matchedRole, locale) : undefined,
          status,
          issue,
        });
      }

      // Check existing emails in database
      if (emailsToCheck.length > 0) {
        const res = await checkExistingEmailsAction({ emails: emailsToCheck });
        if (res.ok && res.data.length > 0) {
          const existingSet = new Set(res.data.map((e) => e.toLowerCase()));
          for (const row of initialRows) {
            if (existingSet.has(row.email.toLowerCase()) && row.status === "valid") {
              row.status = "warning";
              row.issue = t("users.import.statusExists");
            }
          }
        }
      }

      setParsedRows(initialRows);
    },
    [roles, defaultRoleId, locale, t]
  );

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      void processFile(file);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void processFile(file);
    }
  }

  // Execute Import
  function handleStartImport() {
    const rowsToImport = parsedRows.filter((r) => r.status === "valid");
    if (rowsToImport.length === 0) {
      toast.error(t("users.import.errEmpty"));
      return;
    }

    start(async () => {
      const payload = {
        rows: rowsToImport.map((r) => ({
          email: r.email,
          name: r.name,
          roleId: r.resolvedRoleId,
          roleCode: r.roleCode,
        })),
        defaultRoleId: defaultRoleId || undefined,
        skipInvalid: true,
      };

      const res = await importUsersAction(payload);
      if (!res.ok) {
        toast.error(t("common.error"));
        return;
      }

      setImportResult(res.data);
      toast.success(
        t("users.import.successSummary", {
          success: res.data.successCount,
          fail: res.data.failCount,
        })
      );
    });
  }

  function copyToClipboard(link: string) {
    void navigator.clipboard.writeText(link);
    setCopiedLink(link);
    toast.success(t("users.import.copied"));
    setTimeout(() => setCopiedLink(null), 2000);
  }

  function handleDownloadResultReport() {
    if (!importResult) return;
    const headers = ["email", "name", "role", "status", "password_setup_link", "error"];
    const lines = [
      headers.join(","),
      ...importResult.outcomes.map((o) =>
        [
          o.email,
          o.name,
          o.roleName || o.roleCode || "",
          o.success ? "SUCCESS" : "FAILED",
          o.link || "",
          o.error || "",
        ]
          .map((v) =>
            v.includes(",") || v.includes('"')
              ? `"${v.replace(/"/g, '""')}"`
              : v
          )
          .join(",")
      ),
    ];

    const csvText = "\uFEFF" + lines.join("\r\n");
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_import_result_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(t("users.import.downloadReport"));
  }

  const validCount = parsedRows.filter((r) => r.status === "valid").length;
  const warnCount = parsedRows.filter((r) => r.status === "warning").length;
  const errorCount = parsedRows.filter((r) => r.status === "error").length;

  const displayRows = parsedRows.filter((r) => {
    if (filterMode === "valid") return r.status === "valid";
    if (filterMode === "error") return r.status === "error" || r.status === "warning";
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/users" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
              <span>{t("users.import.back")}</span>
            </Link>
          </Button>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("users.import.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("users.import.desc")}</p>
      </div>

      {!importResult ? (
        <>
          {/* Step 1 & 2: Template and Upload */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1: Template Card */}
            <div className="p-5 rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 font-semibold text-base mb-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">1</span>
                  {t("users.import.step1")}
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  {t("users.import.templateDesc")}
                </p>
                <div className="p-3 bg-muted/60 rounded-lg text-xs font-mono text-muted-foreground mb-4 space-y-1 overflow-x-auto">
                  <div className="font-semibold text-foreground">email,name,role</div>
                  <div>somchai.j@example.com,ดร.สมชาย ใจดี,STAFF</div>
                  <div>student01@example.com,นายสมศักดิ์ รักเรียน,STUDENT</div>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleDownloadTemplate}
                className="w-full flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                {t("users.import.templateBtn")}
              </Button>
            </div>

            {/* Step 2: Upload Dropzone Card */}
            <div className="md:col-span-2 p-5 rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 font-semibold text-base">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">2</span>
                    <span>{t("users.import.step2")}</span>
                  </div>
                  {/* Default Role Selection */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {t("users.import.defaultRole")}:
                    </span>
                    <LiyonSelect
                      value={defaultRoleId}
                      onChange={(e) => setDefaultRoleId(e.target.value)}
                      aria-label={t("users.import.defaultRole")}
                      className="text-xs h-8 py-1"
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {localizedName(r, locale)} ({r.code})
                        </option>
                      ))}
                    </LiyonSelect>
                  </div>
                </div>

                {/* Dropzone */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/40 transition-colors rounded-xl p-8 text-center cursor-pointer flex flex-col items-center justify-center gap-2"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="p-3 bg-primary/10 rounded-full text-primary">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="font-medium text-sm">
                    {fileName ? (
                      <span className="text-primary font-semibold flex items-center gap-1.5">
                        <FileText className="w-4 h-4" /> {fileName}
                      </span>
                    ) : (
                      t("users.import.dropzoneTitle")
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t("users.import.dropzoneSub")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Preview and Validation */}
          {parsedRows.length > 0 && (
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              {/* Summary Bar */}
              <div className="p-4 bg-muted/40 border-b flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-sm flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-primary" />
                    {t("users.import.step3")}
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-full bg-background border font-medium">
                      {t("users.import.totalRows", { n: parsedRows.length })}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/40 dark:border-green-900 font-medium">
                      {t("users.import.validRows", { n: validCount })}
                    </span>
                    {warnCount > 0 && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-900 font-medium">
                        {t("users.import.warnRows", { n: warnCount })}
                      </span>
                    )}
                    {errorCount > 0 && (
                      <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:border-red-900 font-medium">
                        {t("users.import.errorRows", { n: errorCount })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Filter and Actions */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-lg border bg-background p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setFilterMode("all")}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        filterMode === "all" ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t("users.import.filterAll")} ({parsedRows.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterMode("valid")}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        filterMode === "valid" ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t("users.import.filterValid")} ({validCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterMode("error")}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        filterMode === "error" ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t("users.import.filterErrors")} ({warnCount + errorCount})
                    </button>
                  </div>

                  <Button
                    type="button"
                    onClick={handleStartImport}
                    disabled={validCount === 0 || pending}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {pending ? t("users.import.importing") : t("users.import.startBtn", { n: validCount })}
                  </Button>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-muted/60 sticky top-0 border-b">
                    <tr>
                      <th className="p-3 font-semibold text-muted-foreground w-16">{t("users.import.colRow")}</th>
                      <th className="p-3 font-semibold text-muted-foreground">{t("users.import.colEmail")}</th>
                      <th className="p-3 font-semibold text-muted-foreground">{t("users.import.colName")}</th>
                      <th className="p-3 font-semibold text-muted-foreground">{t("users.import.colRole")}</th>
                      <th className="p-3 font-semibold text-muted-foreground w-28">{t("users.import.colStatus")}</th>
                      <th className="p-3 font-semibold text-muted-foreground">{t("users.import.colIssue")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {displayRows.map((r) => (
                      <tr
                        key={r.rowNum}
                        className={`hover:bg-muted/30 transition-colors ${
                          r.status === "error"
                            ? "bg-red-50/40 dark:bg-red-950/20"
                            : r.status === "warning"
                            ? "bg-amber-50/40 dark:bg-amber-950/20"
                            : ""
                        }`}
                      >
                        <td className="p-3 font-mono text-muted-foreground">{r.rowNum}</td>
                        <td className="p-3 font-medium">{r.email}</td>
                        <td className="p-3">{r.name}</td>
                        <td className="p-3">
                          {r.resolvedRoleName ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-muted font-medium text-xs">
                              {r.resolvedRoleName}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-3">
                          {r.status === "valid" ? (
                            <StatusPill tone="ok">{t("users.import.statusValid")}</StatusPill>
                          ) : r.status === "warning" ? (
                            <StatusPill tone="warn">{t("users.import.statusExists")}</StatusPill>
                          ) : (
                            <StatusPill tone="bad">{t("users.import.statusError")}</StatusPill>
                          )}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {r.issue ? (
                            <span className={r.status === "error" ? "text-red-600 dark:text-red-400 font-medium" : "text-amber-600 dark:text-amber-400 font-medium"}>
                              {r.issue}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Results View */
        <div className="space-y-6">
          <div className="p-6 rounded-xl border bg-card shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-full bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">{t("users.import.resultsTitle")}</h2>
                  <p className="text-sm text-muted-foreground">
                    {t("users.import.successSummary", {
                      success: importResult.successCount,
                      fail: importResult.failCount,
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDownloadResultReport}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {t("users.import.downloadReport")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setParsedRows([]);
                    setFileName("");
                    setImportResult(null);
                  }}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  {t("users.import.reimport")}
                </Button>
                <Button asChild>
                  <Link href="/users">{t("users.import.back")}</Link>
                </Button>
              </div>
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto max-h-96 rounded-lg border">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-muted/60 sticky top-0 border-b">
                  <tr>
                    <th className="p-3 font-semibold text-muted-foreground">{t("users.import.colEmail")}</th>
                    <th className="p-3 font-semibold text-muted-foreground">{t("users.import.colName")}</th>
                    <th className="p-3 font-semibold text-muted-foreground">{t("users.import.colRole")}</th>
                    <th className="p-3 font-semibold text-muted-foreground w-28">{t("users.import.colStatus")}</th>
                    <th className="p-3 font-semibold text-muted-foreground">{t("users.import.colLink")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {importResult.outcomes.map((o, idx) => (
                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-medium">{o.email}</td>
                      <td className="p-3">{o.name}</td>
                      <td className="p-3">
                        {o.roleName || o.roleCode ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded bg-muted font-medium text-xs">
                            {o.roleName || o.roleCode}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-3">
                        {o.success ? (
                          <StatusPill tone="ok">{t("users.import.statusValid")}</StatusPill>
                        ) : (
                          <StatusPill tone="bad">{t("users.import.statusError")}</StatusPill>
                        )}
                      </td>
                      <td className="p-3">
                        {o.link ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-muted-foreground truncate max-w-xs">
                              {o.link}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(o.link!)}
                              className="h-7 px-2 text-xs flex items-center gap-1 shrink-0"
                            >
                              {copiedLink === o.link ? (
                                <Check className="w-3.5 h-3.5 text-green-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                              <span>{copiedLink === o.link ? t("users.import.copied") : t("users.import.copyLink")}</span>
                            </Button>
                          </div>
                        ) : (
                          <span className="text-red-500 font-medium">{o.error || "-"}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
