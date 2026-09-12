import { prisma, type Db } from "@/shared/lib/infra/prisma";
import { env } from "@/shared/lib/infra/env";
import { sendMail } from "@/shared/lib/infra/mailer";
import { errors } from "@/shared/lib/errors";
import { asLocale } from "@/shared/lib/i18n/config";
import { logger } from "@/shared/lib/infra/logger";
import { SUPER_ADMIN_CODE } from "../../permissions";
import { issueToken, consumeToken, TOKEN_TTL } from "../tokens";
import { writeAudit } from "../audit";
import { passwordSetupEmail, emailChangeEmail } from "../email-templates";
import type { ListUsersQuery, RoleAssignment, ExportUsersQuery, ImportUsersInput } from "../validations/users";
import type { ScopeType } from "../grants";

export interface UserListItem {
  id: string; email: string; name: string; isActive: boolean; mustChangePassword: boolean; lastLoginAt: string | null;
  roles: { id: string; code: string; nameTh: string; nameEn: string; scopeType: ScopeType; scopeId: string | null }[];
}

/**
 * `isSuperAdmin` และ `permissions` คือ session snapshot ของผู้เรียก (`ctx.isSuperAdmin`/`ctx.permissions`
 * จาก requirePermission) ที่ชั้น action ส่งต่อมา — ไม่ re-derive ที่นี่ รูปแบบเดียวกับ Actor ของ
 * `role.service.ts` และเป็นที่มาของอำนาจให้ guard F1/F2 ด้านล่าง
 */
interface Actor { tenantId: string; actorId: string; isSuperAdmin: boolean; permissions: string[] }

const roleSelect = { role: { select: { id: true, code: true, nameTh: true, nameEn: true } }, scopeType: true, scopeId: true } as const;

export async function listUsers(tenantId: string, q: ListUsersQuery): Promise<{ items: UserListItem[]; total: number }> {
  const where = {
    tenantId,
    ...(q.status === "active" ? { isActive: true, user: { isActive: true } } : q.status === "inactive" ? { OR: [{ isActive: false }, { user: { isActive: false } }] } : {}),
    ...(q.roleId ? { userRoles: { some: { roleId: q.roleId } } } : {}),
    ...(q.search ? { user: { OR: [{ name: { contains: q.search } }, { email: { contains: q.search } }] } } : {}),
  };
  const [rows, total] = await Promise.all([
    prisma.userTenant.findMany({ where, skip: (q.page - 1) * q.perPage, take: q.perPage, orderBy: { user: { name: "asc" } }, include: { user: true, userRoles: { select: roleSelect } } }),
    prisma.userTenant.count({ where }),
  ]);
  return {
    total,
    items: rows.map((r) => ({
      id: r.user.id, email: r.user.email, name: r.user.name, isActive: r.isActive && r.user.isActive, mustChangePassword: r.user.mustChangePassword,
      lastLoginAt: r.user.lastLoginAt?.toISOString() ?? null,
      roles: r.userRoles.map((ur) => ({ ...ur.role, scopeType: ur.scopeType, scopeId: ur.scopeId })),
    })),
  };
}

async function assertRolesInTenant(roles: RoleAssignment[], tenantId: string, db: Db) {
  const ids = [...new Set(roles.map((r) => r.roleId))];
  const found = await db.role.count({ where: { id: { in: ids }, tenantId } });
  if (found !== ids.length) throw errors.not_found("role_not_in_tenant");
}

async function membership(userId: string, tenantId: string, db: Db) {
  const ut = await db.userTenant.findUnique({ where: { userId_tenantId: { userId, tenantId } }, include: { user: true, userRoles: { include: { role: true } } } });
  if (!ut) throw errors.not_found("user_not_in_tenant");
  return ut;
}

/** จำนวน SUPER_ADMIN ที่ active ใน tenant นอกจากคนที่ระบุ */
async function otherActiveSuperAdmins(tenantId: string, exceptUserId: string, db: Db): Promise<number> {
  return db.userTenant.count({ where: { tenantId, isActive: true, userId: { not: exceptUserId }, user: { isActive: true }, userRoles: { some: { role: { code: SUPER_ADMIN_CODE } } } } });
}

/**
 * F1 ข้อ (1) — ผู้กระทำที่ไม่ใช่ super admin มอบบทบาท SUPER_ADMIN ให้ใครไม่ได้เลย (ดูรายงาน task-11
 * ส่วน "Fix round 1" · ข้อ (2) ของ F1 อยู่ที่ `assertCanActOnTarget` ด้านล่าง)
 *
 * F2 (รีวิวรอบสุดท้าย ข้อ 2) — และมอบบทบาทที่ถือสิทธิ์ซึ่งตัวเองไม่มีให้ใครไม่ได้ด้วย
 *
 * ด้านคู่ของ A7 (`assertCanGrantPermissions` ใน `role.service.ts`): A7 ปิดฝั่ง "สร้างบทบาทที่ถือสิทธิ์
 * เกินตัว" แต่ถ้าไม่ปิดฝั่ง "มอบบทบาทที่มีอยู่แล้ว" ด้วย ผู้ถือ `users:manage` (ไม่มี `settings:manage`)
 * ก็แค่หยิบบทบาท ADMIN ที่ seed มาให้บัญชีที่ตัวเองสร้าง แล้วรับลิงก์ตั้งรหัสผ่านของบัญชีนั้นมาบนจอผ่าน
 * `issuePasswordSetupLink` — ได้หุ่นเชิดที่ถือสิทธิ์ identity ครบทุกตัวโดยไม่ต้องแตะ SUPER_ADMIN และ
 * ไม่ต้องสร้างบทบาทใหม่ (จึงไม่โดน guard A7) เลยสักครั้ง
 *
 * สิทธิ์ของบทบาทปลายทางอ่านจากฐานข้อมูล แต่สิทธิ์ของผู้กระทำมาจาก session snapshot เท่านั้น (ดู Actor)
 */
async function assertCanAssignRoles(roles: RoleAssignment[], actor: Actor, db: Db): Promise<void> {
  if (actor.isSuperAdmin) return;
  const ids = [...new Set(roles.map((r) => r.roleId))];
  const rows = await db.role.findMany({
    where: { id: { in: ids }, tenantId: actor.tenantId },
    select: { code: true, rolePermissions: { select: { permission: { select: { code: true } } } } },
  });
  if (rows.some((r) => r.code === SUPER_ADMIN_CODE)) throw errors.forbidden("super_admin_protected");
  const held = new Set(actor.permissions);
  if (rows.some((r) => r.rolePermissions.some((rp) => !held.has(rp.permission.code)))) {
    throw errors.forbidden("cannot_grant_unheld_permission");
  }
}

/**
 * F1 ข้อ (2) — ผู้กระทำที่ไม่ใช่ super admin กระทำการใด ๆ กับผู้ใช้ที่ถือ SUPER_ADMIN อยู่แล้วไม่ได้เลย
 * (ไม่ว่าจะแก้ชื่อ บทบาท อีเมล สถานะ หรือออกลิงก์ตั้งรหัสผ่านให้) — คู่กับข้อ (1) ปิดทุกช่องทางที่ ADMIN
 * เคยใช้ยกระดับตัวเองเป็น SUPER_ADMIN ได้ (ดูรายงาน task-11 ส่วน "Fix round 1")
 */
function assertCanActOnTarget(targetRoles: { role: { code: string } }[], actor: Actor): void {
  if (actor.isSuperAdmin) return;
  if (targetRoles.some((r) => r.role.code === SUPER_ADMIN_CODE)) throw errors.forbidden("super_admin_protected");
}

function setupLink(raw: string) { return `${env().APP_URL}/reset-password/${raw}`; }
function verifyLink(raw: string) { return `${env().APP_URL}/verify-email/${raw}`; }

export async function createUser(input: Actor & { email: string; name: string; roles: RoleAssignment[] }) {
  const email = input.email.toLowerCase();
  if (await prisma.user.findUnique({ where: { email } })) throw errors.conflict("email_taken");
  await assertRolesInTenant(input.roles, input.tenantId, prisma);
  await assertCanAssignRoles(input.roles, input, prisma);
  const { user, rawToken, expiresAt } = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: { email, name: input.name } });
    const ut = await tx.userTenant.create({ data: { userId: user.id, tenantId: input.tenantId } });
    await tx.userRole.createMany({ data: input.roles.map((r) => ({ userTenantId: ut.id, ...r })) });
    const { raw, expiresAt } = await issueToken({ userId: user.id, purpose: "PASSWORD_RESET", ttlMs: TOKEN_TTL.PASSWORD_SETUP }, tx);
    await writeAudit({ tenantId: input.tenantId, actorId: input.actorId, action: "user.create", entity: "user", entityId: user.id, after: { email, name: input.name, roles: input.roles } }, tx);
    return { user, rawToken: raw, expiresAt };
  });
  // B17: คืน delivered ให้ผู้เรียกด้วย — SMTP ที่ตั้งค่าผิดจะล้มเงียบ ๆ (mailer ไม่เคย throw) แอดมิน
  // ต้องรู้ว่าต้องคัดลอกลิงก์ส่งเอง ไม่ใช่เห็นแค่ "สร้างผู้ใช้แล้ว"
  const { delivered } = await sendMail({ to: email, ...passwordSetupEmail("th", { name: input.name, link: setupLink(rawToken), hours: 72 }) });
  return { user, rawToken, expiresAt, mailDelivered: delivered };
}

export async function updateUser(input: Actor & { userId: string; name?: string; roles?: RoleAssignment[]; mustChangePassword?: boolean }) {
  if (input.userId === input.actorId && (input.roles !== undefined || input.mustChangePassword !== undefined)) throw errors.forbidden("cannot_edit_self");
  await prisma.$transaction(async (tx) => {
    const ut = await membership(input.userId, input.tenantId, tx);
    assertCanActOnTarget(ut.userRoles, input);
    const before = { name: ut.user.name, roles: ut.userRoles.map((r) => ({ roleId: r.roleId, scopeType: r.scopeType, scopeId: r.scopeId })), mustChangePassword: ut.user.mustChangePassword };
    if (input.roles) {
      await assertRolesInTenant(input.roles, input.tenantId, tx);
      await assertCanAssignRoles(input.roles, input, tx);
      const hadSuper = ut.userRoles.some((r) => r.role.code === SUPER_ADMIN_CODE);
      const superIds = new Set((await tx.role.findMany({ where: { tenantId: input.tenantId, code: SUPER_ADMIN_CODE }, select: { id: true } })).map((r) => r.id));
      const keepsSuper = input.roles.some((r) => superIds.has(r.roleId));
      if (hadSuper && !keepsSuper && (await otherActiveSuperAdmins(input.tenantId, input.userId, tx)) === 0) throw errors.forbidden("last_super_admin");
      await tx.userRole.deleteMany({ where: { userTenantId: ut.id } });
      await tx.userRole.createMany({ data: input.roles.map((r) => ({ userTenantId: ut.id, ...r })) });
    }
    if (input.name !== undefined || input.mustChangePassword !== undefined) {
      await tx.user.update({ where: { id: input.userId }, data: { name: input.name, mustChangePassword: input.mustChangePassword } });
    }
    await writeAudit({ tenantId: input.tenantId, actorId: input.actorId, action: "user.update", entity: "user", entityId: input.userId, before, after: { name: input.name, roles: input.roles, mustChangePassword: input.mustChangePassword } }, tx);
  });
}

export async function setUserActive(input: Actor & { userId: string; isActive: boolean }) {
  if (input.userId === input.actorId) throw errors.forbidden("cannot_edit_self");
  await prisma.$transaction(async (tx) => {
    const ut = await membership(input.userId, input.tenantId, tx);
    assertCanActOnTarget(ut.userRoles, input);
    const isSuper = ut.userRoles.some((r) => r.role.code === SUPER_ADMIN_CODE);
    if (!input.isActive && isSuper && (await otherActiveSuperAdmins(input.tenantId, input.userId, tx)) === 0) throw errors.forbidden("last_super_admin");
    await tx.user.update({ where: { id: input.userId }, data: { isActive: input.isActive } });
    await writeAudit({ tenantId: input.tenantId, actorId: input.actorId, action: input.isActive ? "user.activate" : "user.suspend", entity: "user", entityId: input.userId }, tx);
  });
}

export async function issuePasswordSetupLink(input: Actor & { userId: string }) {
  const ut = await membership(input.userId, input.tenantId, prisma);
  assertCanActOnTarget(ut.userRoles, input);
  const { raw, expiresAt } = await issueToken({ userId: input.userId, purpose: "PASSWORD_RESET", ttlMs: TOKEN_TTL.PASSWORD_SETUP });
  await writeAudit({ tenantId: input.tenantId, actorId: input.actorId, action: "user.password_link", entity: "user", entityId: input.userId });
  const { delivered } = await sendMail({ to: ut.user.email, ...passwordSetupEmail(asLocale(ut.user.locale), { name: ut.user.name, link: setupLink(raw), hours: 72 }) });
  return { rawToken: raw, expiresAt, mailDelivered: delivered };
}

export async function requestEmailChange(input: Actor & { userId: string; newEmail: string }) {
  const newEmail = input.newEmail.toLowerCase();
  const ut = await membership(input.userId, input.tenantId, prisma);
  assertCanActOnTarget(ut.userRoles, input);
  if (await prisma.user.findUnique({ where: { email: newEmail } })) throw errors.conflict("email_taken");
  const { raw, expiresAt } = await issueToken({ userId: input.userId, purpose: "EMAIL_VERIFY", ttlMs: TOKEN_TTL.EMAIL_VERIFY, payload: { newEmail } });
  await writeAudit({ tenantId: input.tenantId, actorId: input.actorId, action: "user.email_change_request", entity: "user", entityId: input.userId, after: { newEmail } });
  const { delivered } = await sendMail({ to: newEmail, ...emailChangeEmail(asLocale(ut.user.locale), { name: ut.user.name, link: verifyLink(raw), hours: 24 }) });
  return { rawToken: raw, expiresAt, mailDelivered: delivered };
}

/** เรียกจากหน้า /verify-email/[token] ไม่ต้อง login — คืน false เมื่อโทเคนใช้ไม่ได้หรืออีเมลใหม่ถูกใช้ไปแล้วระหว่างรอ */
export async function confirmEmailChange(raw: string): Promise<boolean> {
  const c = await consumeToken(raw, "EMAIL_VERIFY");
  const newEmail = c?.payload?.newEmail;
  if (!c || typeof newEmail !== "string") return false;
  if (await prisma.user.findUnique({ where: { email: newEmail } })) return false;
  await prisma.$transaction(async (tx) => {
    const before = await tx.user.findUnique({ where: { id: c.userId }, select: { email: true } });
    await tx.user.update({ where: { id: c.userId }, data: { email: newEmail, emailVerified: true } });
    const ut = await tx.userTenant.findFirst({ where: { userId: c.userId }, select: { tenantId: true } });
    if (ut) {
      await writeAudit({ tenantId: ut.tenantId, actorId: c.userId, action: "user.email_change", entity: "user", entityId: c.userId, before, after: { email: newEmail } }, tx);
    } else {
      // audit_logs.tenant_id เป็น NOT NULL — ไม่มี membership ใด ๆ แปลว่าเขียน audit ไม่ได้เลย (ไม่ใช่แค่ข้าม tenant)
      // เปลี่ยนอีเมลสำเร็จแล้วแต่ไม่มีร่องรอย audit จึงต้องส่งเสียงเตือนแทนที่จะเงียบไปเฉย ๆ
      logger.warn("confirmEmailChange: no tenant membership found, email changed without an audit row", { userId: c.userId });
    }
  });
  return true;
}

function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function exportUsers(
  tenantId: string,
  q: ExportUsersQuery,
  locale: "th" | "en" = "th"
): Promise<{ filename: string; csvContent: string; count: number }> {
  const where = {
    tenantId,
    ...(q.status === "active" ? { isActive: true, user: { isActive: true } } : q.status === "inactive" ? { OR: [{ isActive: false }, { user: { isActive: false } }] } : {}),
    ...(q.roleId ? { userRoles: { some: { roleId: q.roleId } } } : {}),
    ...(q.search ? { user: { OR: [{ name: { contains: q.search } }, { email: { contains: q.search } }] } } : {}),
  };

  const rows = await prisma.userTenant.findMany({
    where,
    orderBy: { user: { name: "asc" } },
    include: {
      user: true,
      userRoles: { select: roleSelect },
    },
    take: 5000,
  });

  const headers = locale === "th"
    ? ["อีเมล", "ชื่อ-นามสกุล", "รหัสบทบาท", "ชื่อบทบาท", "สถานะ", "เข้าสู่ระบบล่าสุด", "วันที่สร้าง"]
    : ["Email", "Name", "Role Codes", "Role Names", "Status", "Last Login", "Created At"];

  const csvLines: string[] = [headers.map(escapeCsvCell).join(",")];

  for (const r of rows) {
    const isActive = r.isActive && r.user.isActive;
    const statusText = locale === "th"
      ? (isActive ? "ใช้งาน" : "ระงับ")
      : (isActive ? "Active" : "Inactive");

    const roleCodes = r.userRoles.map((ur) => ur.role.code).join(", ");
    const roleNames = r.userRoles.map((ur) => (locale === "th" ? ur.role.nameTh : ur.role.nameEn)).join(", ");
    const lastLogin = r.user.lastLoginAt ? r.user.lastLoginAt.toISOString().replace("T", " ").substring(0, 19) : "";
    const createdAt = r.joinedAt.toISOString().replace("T", " ").substring(0, 19);

    csvLines.push(
      [
        r.user.email,
        r.user.name,
        roleCodes,
        roleNames,
        statusText,
        lastLogin,
        createdAt,
      ]
        .map(escapeCsvCell)
        .join(",")
    );
  }

  const dateStr = new Date().toISOString().split("T")[0];
  const filename = `users_export_${dateStr}.csv`;
  // Prepend UTF-8 BOM so Excel opens Thai characters cleanly
  const csvContent = "\uFEFF" + csvLines.join("\r\n");

  return { filename, csvContent, count: rows.length };
}

export async function checkExistingEmails(
  tenantId: string,
  emails: string[]
): Promise<string[]> {
  void tenantId;
  const normalized = [...new Set(emails.map((e) => e.trim().toLowerCase()).filter(Boolean))];
  if (normalized.length === 0) return [];
  const existing = await prisma.user.findMany({
    where: { email: { in: normalized } },
    select: { email: true },
  });
  return existing.map((u) => u.email.toLowerCase());
}

export interface ImportUserOutcome {
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

export async function importUsers(
  input: Actor & ImportUsersInput
): Promise<{
  total: number;
  successCount: number;
  failCount: number;
  outcomes: ImportUserOutcome[];
}> {
  const tenantRoles = await prisma.role.findMany({
    where: { tenantId: input.tenantId },
    select: {
      id: true,
      code: true,
      nameTh: true,
      nameEn: true,
      isSystem: true,
      rolePermissions: { select: { permission: { select: { code: true } } } },
    },
  });

  const roleByCode = new Map(tenantRoles.map((r) => [r.code.toUpperCase(), r]));
  const roleById = new Map(tenantRoles.map((r) => [r.id, r]));
  const roleByNameTh = new Map(tenantRoles.map((r) => [r.nameTh.toLowerCase().trim(), r]));
  const roleByNameEn = new Map(tenantRoles.map((r) => [r.nameEn.toLowerCase().trim(), r]));

  const defaultRole = input.defaultRoleId ? roleById.get(input.defaultRoleId) : null;
  const outcomes: ImportUserOutcome[] = [];

  for (const row of input.rows) {
    const email = row.email.trim().toLowerCase();
    const name = row.name.trim();

    // 1. Resolve role
    let targetRole: (typeof tenantRoles)[number] | undefined;
    if (row.roleId && roleById.has(row.roleId)) {
      targetRole = roleById.get(row.roleId);
    } else if (row.roleCode) {
      const codeUpper = row.roleCode.toUpperCase().trim();
      const codeLower = row.roleCode.toLowerCase().trim();
      targetRole =
        roleByCode.get(codeUpper) ||
        roleByNameTh.get(codeLower) ||
        roleByNameEn.get(codeLower);
    }

    if (!targetRole && defaultRole) {
      targetRole = defaultRole;
    }

    if (!targetRole) {
      outcomes.push({
        email,
        name,
        success: false,
        error: "role_not_found",
      });
      continue;
    }

    // 2. Enforce permission guards (F1 & F2)
    if (!input.isSuperAdmin && targetRole.code === SUPER_ADMIN_CODE) {
      outcomes.push({
        email,
        name,
        roleCode: targetRole.code,
        roleName: targetRole.nameTh,
        success: false,
        error: "super_admin_protected",
      });
      continue;
    }

    if (!input.isSuperAdmin) {
      const held = new Set(input.permissions);
      const unheld = targetRole.rolePermissions.some((rp) => !held.has(rp.permission.code));
      if (unheld) {
        outcomes.push({
          email,
          name,
          roleCode: targetRole.code,
          roleName: targetRole.nameTh,
          success: false,
          error: "cannot_grant_unheld_permission",
        });
        continue;
      }
    }

    // 3. Check existing email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      outcomes.push({
        email,
        name,
        roleCode: targetRole.code,
        roleName: targetRole.nameTh,
        success: false,
        error: "email_taken",
      });
      continue;
    }

    // 4. Create user in transaction
    try {
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({ data: { email, name } });
        const ut = await tx.userTenant.create({ data: { userId: user.id, tenantId: input.tenantId } });
        await tx.userRole.create({
          data: {
            userTenantId: ut.id,
            roleId: targetRole!.id,
            scopeType: "ALL",
            scopeId: null,
          },
        });
        const { raw } = await issueToken(
          { userId: user.id, purpose: "PASSWORD_RESET", ttlMs: TOKEN_TTL.PASSWORD_SETUP },
          tx
        );
        await writeAudit(
          {
            tenantId: input.tenantId,
            actorId: input.actorId,
            action: "user.import",
            entity: "user",
            entityId: user.id,
            after: { email, name, roleId: targetRole!.id, roleCode: targetRole!.code },
          },
          tx
        );
        return { user, rawToken: raw };
      });

      const link = setupLink(result.rawToken);
      let mailDelivered = false;
      try {
        const mailRes = await sendMail({
          to: email,
          ...passwordSetupEmail("th", { name, link, hours: 72 }),
        });
        mailDelivered = mailRes.delivered;
      } catch {
        // Mail delivery errors are logged without breaking import
      }

      outcomes.push({
        email,
        name,
        roleName: targetRole.nameTh,
        roleCode: targetRole.code,
        success: true,
        userId: result.user.id,
        link,
        mailDelivered,
      });
    } catch (err) {
      outcomes.push({
        email,
        name,
        roleName: targetRole.nameTh,
        roleCode: targetRole.code,
        success: false,
        error: err instanceof Error ? err.message : "import_failed",
      });
    }
  }

  return {
    total: input.rows.length,
    successCount: outcomes.filter((o) => o.success).length,
    failCount: outcomes.filter((o) => !o.success).length,
    outcomes,
  };
}

