"use client";
import { AlertCircle, Search, Users as UsersIcon, ChevronLeft, ChevronRight, Pencil, KeyRound, Mail, Ban, CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, RowMenuItem, StatusPill, LiyonSelect, type DataTableColumn, type DataTableSelection } from "@/shared/components/liyon";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { formatDate, localizedName } from "@/shared/lib/format";
import type { UserListItem, RolePick } from "./types";

export function UsersTableCard({
  state,
  users,
  total,
  page,
  totalPages,
  searchInput,
  onSearchInputChange,
  status,
  onStatusChange,
  roleId,
  roles,
  onRoleChange,
  onPrev,
  onNext,
  canManage,
  selfId,
  selected,
  onSelectedChange,
  onEdit,
  onIssueLink,
  onChangeEmail,
  onSuspend,
  onActivate,
  onRetry,
}: {
  state: "loading" | "data" | "empty" | "error";
  users: UserListItem[];
  total: number;
  page: number;
  totalPages: number;
  searchInput: string;
  onSearchInputChange: (v: string) => void;
  status: "all" | "active" | "inactive";
  onStatusChange: (s: "all" | "active" | "inactive") => void;
  roleId: string;
  roles: RolePick[];
  onRoleChange: (roleId: string) => void;
  onPrev: () => void;
  onNext: () => void;
  canManage: boolean;
  selfId: string;
  selected: Set<string>;
  onSelectedChange: (s: Set<string>) => void;
  onEdit: (u: UserListItem) => void;
  onIssueLink: (u: UserListItem) => void;
  onChangeEmail: (u: UserListItem) => void;
  onSuspend: (list: UserListItem[]) => void;
  onActivate: (u: UserListItem) => void;
  onRetry: () => void;
}) {
  const t = useT();
  const locale = useLocale();
  const hasFilters = searchInput.trim() !== "" || status !== "all" || roleId !== "";

  const columns: DataTableColumn<UserListItem>[] = [
    {
      key: "name",
      header: t("users.colName"),
      render: (u) => (
        <div>
          <div className="font-medium">{u.name}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="muted">{u.email}</span>
            {u.email.toLowerCase().includes("gmail.com") && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/40 dark:border-red-900/50">
                <svg className="w-2.5 h-2.5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"/>
                </svg>
                Google
              </span>
            )}
          </div>
        </div>
      ),
    },
    { key: "roles", header: t("users.colRoles"), render: (u) => u.roles.map((r) => localizedName(r, locale)).join(", ") },
    { key: "status", header: t("common.colStatus"), render: (u) => <StatusPill tone={u.isActive ? "ok" : "bad"}>{t(u.isActive ? "status.active" : "status.inactive")}</StatusPill> },
    { key: "lastLogin", header: t("users.colLastLogin"), render: (u) => formatDate(u.lastLoginAt, locale, { time: true }) },
  ];

  // B5: "เลือกทั้งหมด" ต้องไม่รวมแถวของตัวเอง — การกระทำหมู่เดียวที่มีคือ "ระงับที่เลือก" ซึ่ง service
  // ปฏิเสธด้วย cannot_edit_self เสมอ (เมนูสามจุดของแถวตัวเองก็ซ่อนรายการนี้ไว้แล้ว) ถ้ารวมเข้ามาด้วย
  // ผู้ใช้จะกดแล้วได้ error ทุกครั้งโดยไม่มีทางสำเร็จ
  //
  // รีวิวรอบสุดท้าย ข้อ 6: แค่ตัดออกจาก select-all ไม่พอ — แถวตัวเองยังมี checkbox ให้ติ๊กเองอยู่ ซึ่ง
  // พาไปสู่ผลเดียวกับที่ตั้งใจกัน และทำให้ allSelected นับเพี้ยน (selected.size โตเกิน selectableIds
  // จนติ๊กครบก็ไม่เท่ากันสักที) จึงส่ง isRowSelectable ด้วยเงื่อนไขเดียวกันไปให้ DataTable ซ่อน
  // checkbox ของแถวตัวเองทิ้ง สอดคล้องกับเมนูสามจุดที่ตัดรายการของตัวเองไปแล้ว
  const isRowSelectable = (u: UserListItem) => u.id !== selfId;
  const selectableIds = users.filter(isRowSelectable).map((u) => u.id);

  const selection: DataTableSelection<UserListItem> | undefined = canManage
    ? {
        selectedIds: selected,
        onToggleRow: (u) => {
          const next = new Set(selected);
          if (next.has(u.id)) next.delete(u.id); else next.add(u.id);
          onSelectedChange(next);
        },
        onToggleAll: () => onSelectedChange(selected.size === selectableIds.length ? new Set() : new Set(selectableIds)),
        allSelected: selectableIds.length > 0 && selected.size === selectableIds.length,
        ariaLabelAll: t("users.selectAll"),
        ariaLabelRow: (u) => t("users.selectRow", { name: u.name }),
        isRowSelectable,
        bulkBar: {
          countLabel: (n) => t("users.selected", { n }),
          actions: (
            <Button type="button" size="sm" variant="destructive" onClick={() => onSuspend(users.filter((u) => selected.has(u.id)))}>
              {t("users.bulkSuspend")}
            </Button>
          ),
          onClear: () => onSelectedChange(new Set()),
          clearLabel: t("users.clearSelection"),
        },
      }
    : undefined;

  return (
    <DataTable
      state={state}
      columns={columns}
      rows={users}
      getRowId={(u) => u.id}
      selection={selection}
      renderRowMenu={
        canManage
          ? (u) => (
              <>
                <RowMenuItem icon={<Pencil aria-hidden="true" />} onSelect={() => onEdit(u)}>{t("users.menuEdit")}</RowMenuItem>
                <RowMenuItem icon={<KeyRound aria-hidden="true" />} onSelect={() => onIssueLink(u)}>{t("users.menuLink")}</RowMenuItem>
                <RowMenuItem icon={<Mail aria-hidden="true" />} onSelect={() => onChangeEmail(u)}>{t("users.menuEmail")}</RowMenuItem>
                {u.id !== selfId &&
                  (u.isActive ? (
                    <RowMenuItem danger icon={<Ban aria-hidden="true" />} onSelect={() => onSuspend([u])}>{t("users.menuSuspend")}</RowMenuItem>
                  ) : (
                    <RowMenuItem icon={<CircleCheck aria-hidden="true" />} onSelect={() => onActivate(u)}>{t("users.menuActivate")}</RowMenuItem>
                  ))}
              </>
            )
          : undefined
      }
      rowMenuLabel={(u) => t("users.rowMenu", { name: u.name })}
      empty={{ icon: <UsersIcon aria-hidden="true" />, title: t(hasFilters ? "users.noResults" : "users.empty") }}
      error={{ icon: <AlertCircle aria-hidden="true" />, title: t("users.loadFail"), actions: <Button type="button" size="sm" onClick={onRetry}>{t("auth.errorRetry")}</Button> }}
      toolbar={
        <>
          <span className="tsearch">
            <Search aria-hidden="true" />
            <input type="search" value={searchInput} onChange={(e) => onSearchInputChange(e.target.value)} placeholder={t("users.searchPh")} aria-label={t("common.search")} />
          </span>
          <LiyonSelect aria-label={t("users.filterStatus")} value={status} onChange={(e) => onStatusChange(e.target.value as "all" | "active" | "inactive")}>
            <option value="all">{t("common.all")}</option>
            <option value="active">{t("status.active")}</option>
            <option value="inactive">{t("status.inactive")}</option>
          </LiyonSelect>
          <LiyonSelect aria-label={t("users.filterRole")} value={roleId} onChange={(e) => onRoleChange(e.target.value)}>
            <option value="">{t("common.all")}</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{localizedName(r, locale)}</option>
            ))}
          </LiyonSelect>
        </>
      }
      headHeading={t("users.listTitle")}
      headMeta={t("users.total", { n: total })}
      footer={
        <>
          <span className="at">{t("common.page", { page, totalPages, total })}</span>
          <span className="pager">
            <button type="button" className="pg" onClick={onPrev} disabled={page <= 1} aria-label={t("common.prev")}>
              <ChevronLeft aria-hidden="true" />
            </button>
            <button type="button" className="pg" onClick={onNext} disabled={page >= totalPages} aria-label={t("common.next")}>
              <ChevronRight aria-hidden="true" />
            </button>
          </span>
        </>
      }
    />
  );
}
