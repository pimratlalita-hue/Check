import * as fs from "fs/promises";
import * as path from "path";
import * as crypto from "crypto";
import { sendMail } from "@/shared/lib/infra/mailer";
import { logger } from "@/shared/lib/infra/logger";

const NOTIF_FILE = path.join(process.cwd(), "storage", "notifications.json");

export type NotificationType =
  | "PETITION_SUBMITTED"
  | "PETITION_APPROVED"
  | "PETITION_RETURNED"
  | "PETITION_REJECTED"
  | "EXAM_SCHEDULED"
  | "SYSTEM";

export interface SystemNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  trackingNo?: string;
  petitionId?: string;
  recipientRole?: string; // "ALL" | "STUDENT" | "ADVISOR" | "CHAIR" | "DEAN" | "ADMIN"
  recipientEmail?: string;
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}

async function ensureStorage(): Promise<void> {
  try {
    await fs.mkdir(path.dirname(NOTIF_FILE), { recursive: true });
  } catch {}
}

export async function loadAllNotifications(): Promise<SystemNotification[]> {
  await ensureStorage();
  try {
    const data = await fs.readFile(NOTIF_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    // Return initial default notifications if file is empty
    return [
      {
        id: "notif_seed_1",
        type: "PETITION_SUBMITTED",
        title: "มีคำร้องขออนุมัติหัวข้อวิทยานิพนธ์ใหม่",
        message: "นายมานะ มุ่งมั่น (65010001) ได้ยื่นคำร้อง REQ-2026-0001 รอการพิจารณา",
        trackingNo: "REQ-2026-0001",
        recipientRole: "ADVISOR",
        linkUrl: "/workflow",
        isRead: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "notif_seed_2",
        type: "EXAM_SCHEDULED",
        title: "แจ้งเตือนกำหนดการสอบเค้าโครงวิทยานิพนธ์",
        message: "นัดหมายสอบห้อง Smart Defense Room 101 ในวันศุกร์นี้ เวลา 09:00 น.",
        recipientRole: "ALL",
        linkUrl: "/facility",
        isRead: false,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
    ];
  }
}

async function saveAllNotifications(notifs: SystemNotification[]): Promise<void> {
  await ensureStorage();
  await fs.writeFile(NOTIF_FILE, JSON.stringify(notifs.slice(0, 100), null, 2), "utf-8");
}

export async function createNotification(notif: Omit<SystemNotification, "id" | "createdAt" | "isRead">): Promise<SystemNotification> {
  const all = await loadAllNotifications();
  const newNotif: SystemNotification = {
    ...notif,
    id: `notif_${crypto.randomUUID()}`,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  all.unshift(newNotif);
  await saveAllNotifications(all);

  // Dispatch background email if recipientEmail exists
  if (notif.recipientEmail) {
    sendMail({
      to: notif.recipientEmail,
      subject: `[GTMTS มจร.] ${notif.title}`,
      text: `${notif.message}\n\nติดตามสถานะได้ที่: http://localhost:3010${notif.linkUrl || "/portal/petitions"}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px;">
          <h2 style="color: #e11d48;">บัณฑิตศึกษา ภาควิชาภาษาต่างประเทศ มจร.</h2>
          <h3 style="color: #1e293b;">${notif.title}</h3>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">${notif.message}</p>
          <div style="margin-top: 20px;">
            <a href="http://localhost:3010${notif.linkUrl || "/portal/petitions"}" style="background-color: #e11d48; color: white; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px; display: inline-block;">
              คลิกเพื่อเปิดดูรายละเอียดในระบบ
            </a>
          </div>
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #e2e8f0;" />
          <p style="color: #94a3b8; font-size: 12px;">ระบบบริหารจัดการและติดตามวิทยานิพนธ์ระดับบัณฑิตศึกษา (GTMTS)</p>
        </div>
      `,
    }).catch((err) => logger.warn("Notification email dispatch failed", { err }));
  }

  return newNotif;
}

export async function getNotificationsForUser(userRole?: string, userEmail?: string): Promise<{
  notifications: SystemNotification[];
  unreadCount: number;
}> {
  const all = await loadAllNotifications();
  const normalizedRole = userRole?.toUpperCase() || "STUDENT";
  const normalizedEmail = userEmail?.toLowerCase();

  const filtered = all.filter((n) => {
    if (!n.recipientRole || n.recipientRole === "ALL") return true;
    if (n.recipientRole === normalizedRole) return true;
    if (normalizedRole === "SUPER_ADMIN" || normalizedRole === "ADMIN") return true;
    if (normalizedEmail && n.recipientEmail?.toLowerCase() === normalizedEmail) return true;
    return false;
  });

  const unreadCount = filtered.filter((n) => !n.isRead).length;
  return { notifications: filtered, unreadCount };
}

export async function markNotificationAsRead(id: string): Promise<boolean> {
  const all = await loadAllNotifications();
  let found = false;
  for (const n of all) {
    if (n.id === id) {
      n.isRead = true;
      found = true;
      break;
    }
  }
  if (found) await saveAllNotifications(all);
  return found;
}

export async function markAllAsRead(): Promise<void> {
  const all = await loadAllNotifications();
  all.forEach((n) => (n.isRead = true));
  await saveAllNotifications(all);
}
