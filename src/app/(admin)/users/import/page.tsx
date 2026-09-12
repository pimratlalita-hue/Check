import { requirePermission, P } from "@/features/identity/server";
import { ImportUsersClient } from "./_components/import-users-client";

export default async function ImportUsersPage() {
  await requirePermission(P.usersManage);
  return <ImportUsersClient />;
}
