import React from "react";
import { requirePermission } from "@/features/identity/server";
import { BACKUP_P } from "@/features/backup";
import { getSystemDataStats } from "@/features/backup/server";
import { BackupClient } from "./_components/backup-client";

export default async function BackupPage() {
  const session = await requirePermission(BACKUP_P.backupManage);
  const stats = await getSystemDataStats(session.tenantId);

  return (
    <BackupClient
      initialStats={stats}
      canExport={session.permissions.includes(BACKUP_P.backupExport) || session.isSuperAdmin}
      canImport={session.permissions.includes(BACKUP_P.backupImport) || session.isSuperAdmin}
      canWipe={session.permissions.includes(BACKUP_P.backupWipe) || session.isSuperAdmin}
    />
  );
}
