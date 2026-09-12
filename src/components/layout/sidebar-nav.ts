import { LayoutDashboard, Users, Settings, Layers, Newspaper, UserCheck, GraduationCap, FileCheck, CalendarCheck, ScanFace, DatabaseBackup, type LucideIcon } from "lucide-react";
import { hasPermission, P } from "@/features/identity";
import { SAMPLE_P } from "@/features/sample";
import { NEWS_P } from "@/features/news";
import { STAFF_P } from "@/features/staff";
import { CURRICULUM_P } from "@/features/curriculum";
import { WORKFLOW_P } from "@/features/workflow";
import { FACILITY_P } from "@/features/facility";
import { BIOMETRICS_P } from "@/features/biometrics";
import { BACKUP_P } from "@/features/backup";

export interface NavItem {
  /** i18n key */
  title: string;
  href: string;
  icon?: LucideIcon;
  /** ต้องมีสิทธิ์นี้ถึงเห็น — ไม่มี = ทุกคนที่ login เห็น */
  permission?: string;
  children?: NavItem[];
}
export interface NavGroup { label: string; items: NavItem[] }
export interface NavCrumb { title: string; href: string }

export const sidebarGroups: NavGroup[] = [
  // 1. ภาพรวม (Overview)
  {
    label: "nav.group.overview",
    items: [{ title: "nav.dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },

  // 2. งานวิชาการและหลักสูตร (Academic & Curriculums)
  {
    label: "nav.group.academic",
    items: [
      {
        title: "nav.academic",
        href: "/curriculum",
        icon: GraduationCap,
        children: [
          { title: "curriculum.nav", href: "/curriculum", permission: CURRICULUM_P.curriculumRead },
          { title: "staff.nav", href: "/staff", permission: STAFF_P.staffRead },
          { title: "news.nav", href: "/news", permission: NEWS_P.newsRead },
        ],
      },
    ],
  },

  // 3. กระบวนการวิทยานิพนธ์และการสอบ (Thesis & Examination)
  {
    label: "nav.group.thesis",
    items: [
      {
        title: "nav.thesisExam",
        href: "/workflow",
        icon: FileCheck,
        children: [
          { title: "workflow.nav", href: "/workflow", icon: FileCheck, permission: WORKFLOW_P.workflowRead },
          { title: "facility.nav", href: "/facility", icon: CalendarCheck, permission: FACILITY_P.facilityRead },
          { title: "biometrics.navAttendance", href: "/biometrics", icon: ScanFace, permission: BIOMETRICS_P.read },
        ],
      },
    ],
  },

  // 4. ผู้ใช้งานและสิทธิ์ (Users & Access)
  {
    label: "nav.group.users",
    items: [
      {
        title: "nav.users",
        href: "/users",
        icon: Users,
        permission: P.usersRead,
        children: [
          { title: "nav.users", href: "/users", permission: P.usersRead },
          { title: "nav.roles", href: "/users/roles", permission: P.rolesManage },
        ],
      },
    ],
  },

  // 5. การตั้งค่าและการสำรองข้อมูล (Settings & Maintenance)
  {
    label: "nav.group.settings",
    items: [
      {
        title: "nav.systemSettings",
        href: "/settings",
        icon: Settings,
        children: [
          { title: "nav.settings", href: "/settings", permission: P.settingsManage },
          { title: "backup.nav", href: "/backup", permission: BACKUP_P.backupManage },
          { title: "sample.nav", href: "/sample", permission: SAMPLE_P.sampleRead },
        ],
      },
    ],
  },
];

type Ctx = Parameters<typeof hasPermission>[0];

function visibleItem(item: NavItem, ctx: Ctx): NavItem | null {
  if (item.permission && !hasPermission(ctx, item.permission)) return null;
  if (!item.children) return item;
  const children = item.children.filter((c) => !c.permission || hasPermission(ctx, c.permission));
  return children.length ? { ...item, children } : null;
}

export function visibleGroups(ctx: Ctx): NavGroup[] {
  return sidebarGroups
    .map((g) => ({ ...g, items: g.items.map((i) => visibleItem(i, ctx)).filter((i): i is NavItem => i !== null) }))
    .filter((g) => g.items.length > 0);
}

/** สายเมนูสำหรับ breadcrumb — จับ href ที่ยาวที่สุดที่ตรง (ลูกชนะแม่) */
export function getActiveNavChain(pathname: string): NavCrumb[] {
  let best: { parent: NavItem | null; item: NavItem } | null = null;
  const consider = (item: NavItem, parent: NavItem | null) => {
    if (pathname === item.href || pathname.startsWith(item.href + "/")) {
      if (!best || item.href.length > best.item.href.length || (item.href.length === best.item.href.length && parent)) best = { parent, item };
    }
  };
  for (const g of sidebarGroups) for (const i of g.items) { consider(i, null); for (const c of i.children ?? []) consider(c, i); }
  if (!best) return [];
  const { parent, item } = best as { parent: NavItem | null; item: NavItem };
  const chain: NavCrumb[] = [];
  if (parent && parent.href !== item.href) chain.push({ title: parent.title, href: parent.href });
  chain.push({ title: item.title, href: item.href });
  return chain;
}
