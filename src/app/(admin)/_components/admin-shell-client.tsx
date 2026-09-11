"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Loader2, User, Settings } from "lucide-react";
import { AdminShell, useBreadcrumbTailItems, type Crumb } from "@/shared/components/liyon";
import { AdminSidebarNav } from "@/components/layout/admin-sidebar-nav";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ProjectorModeToggle } from "@/components/layout/projector-mode-toggle";
import { RoleSwitcher } from "@/components/layout/role-switcher";
import { useSidebarStore } from "@/components/layout/sidebar-store";
import { getActiveNavChain } from "@/components/layout/sidebar-nav";
import { useAppSession } from "@/hooks/use-session";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { localizedName } from "@/shared/lib/format";
import { hasPermission, P, type TenantInfo } from "@/features/identity";

interface AdminShellClientProps {
  initialTenantInfo: TenantInfo;
  children: React.ReactNode;
}

export function AdminShellClient({
  initialTenantInfo,
  children,
}: AdminShellClientProps) {
  const pathname = usePathname();
  const t = useT();
  const locale = useLocale();
  const tail = useBreadcrumbTailItems();
  const { status, user, roles, permissions, isSuperAdmin } = useAppSession();
  const { collapsed, toggleCollapsed } = useSidebarStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [prev, setPrev] = useState(pathname);
  const [mounted, setMounted] = useState(false);
  const [tenantInfo, setTenantInfo] = useState<TenantInfo>(initialTenantInfo);

  if (pathname !== prev) {
    setPrev(pathname);
    setDrawerOpen(false);
  }

  // Update when server passes new props (after revalidatePath)
  useEffect(() => {
    setTenantInfo(initialTenantInfo);
  }, [initialTenantInfo]);

  // Listen to instant custom event from settings form
  useEffect(() => {
    function handleUpdate(e: Event) {
      const customEvent = e as CustomEvent<Partial<TenantInfo>>;
      if (customEvent.detail) {
        setTenantInfo((prev) => ({
          ...prev,
          nameTh: customEvent.detail.nameTh ?? prev.nameTh,
          nameEn: customEvent.detail.nameEn ?? prev.nameEn,
          logoUrl: customEvent.detail.logoUrl !== undefined ? customEvent.detail.logoUrl : prev.logoUrl,
        }));
      }
    }
    window.addEventListener("tenant-info-updated", handleUpdate);
    return () => window.removeEventListener("tenant-info-updated", handleUpdate);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const initials = (user?.name ?? "?").trim().charAt(0).toUpperCase() || "?";
  const chain = getActiveNavChain(pathname);
  const breadcrumb: Crumb[] =
    chain.length === 0 && tail.length === 0
      ? []
      : [
          { label: t("nav.home"), href: "/dashboard" },
          ...chain.map((c) => ({ label: t(c.title), href: c.href })),
          ...tail,
        ];
  const ctx = { roles, permissions, isSuperAdmin };
  const links = [
    { href: "/me", label: t("account.profile"), icon: <User className="h-4 w-4" /> },
    ...(hasPermission(ctx, P.settingsManage)
      ? [{ href: "/settings", label: t("nav.settings"), icon: <Settings className="h-4 w-4" /> }]
      : []),
  ];

  // Dynamic organization name based on active locale
  const brandName =
    locale === "en"
      ? tenantInfo.nameEn || t("app.name")
      : tenantInfo.nameTh || t("app.name");

  return (
    <AdminShell
      brandName={brandName}
      brandTagline={t("app.tagline")}
      brandHref="/dashboard"
      brandLogoUrl={tenantInfo.logoUrl}
      breadcrumb={breadcrumb}
      breadcrumbLabel={t("common.breadcrumb")}
      roleLabel={roles[0] ? localizedName(roles[0], locale) : null}
      languageSwitcher={
        <div className="flex items-center gap-2">
          <RoleSwitcher />
          <ProjectorModeToggle />
          <LanguageSwitcher className="lang" />
        </div>
      }
      notifications={null}
      account={
        user
          ? {
              name: user.name ?? "",
              email: user.email ?? "",
              imageUrl: user.image,
              initials,
              links,
              onSignOut: () => signOut({ callbackUrl: "/login" }),
              signOutLabel: t("account.logout"),
            }
          : null
      }
      accountLoading={!user}
      themeToggleLabel={t("nav.themeToggle")}
      collapsed={collapsed}
      onToggleCollapsed={toggleCollapsed}
      collapseLabel={t("nav.collapse")}
      expandLabel={t("nav.expand")}
      drawerOpen={drawerOpen}
      onToggleDrawer={() => setDrawerOpen((v) => !v)}
      onCloseDrawer={() => setDrawerOpen(false)}
      drawerLabel={t("nav.openDrawer")}
      sidebarAriaLabel={t("nav.menu")}
      sidebarNav={<AdminSidebarNav />}
    >
      {children}
    </AdminShell>
  );
}
