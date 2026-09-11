import { resolveTenantInfo } from "@/features/identity/server";
import { AdminShellClient } from "./_components/admin-shell-client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenantInfo = await resolveTenantInfo();

  return (
    <AdminShellClient initialTenantInfo={tenantInfo}>
      {children}
    </AdminShellClient>
  );
}

