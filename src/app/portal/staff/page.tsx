import { getT } from "@/i18n/server";
import { resolvePortalTenantId, getPublicStaffDirectory } from "@/features/staff/server";
import { DirectoryView } from "./_components/directory-view";

export default async function PublicStaffDirectoryPage() {
  const t = await getT();

  let tenantId: string;
  try {
    tenantId = await resolvePortalTenantId();
  } catch {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-slate-800">Faculty Platform</h2>
        <p className="text-sm text-slate-500 mt-2">No active tenant found.</p>
      </div>
    );
  }

  const directoryData = await getPublicStaffDirectory(tenantId);

  return (
    <div className="space-y-8">
      {/* Page Title & Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-2 py-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          {t("staff.portalTitle")}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          {t("staff.portalSubtitle")}
        </p>
      </div>

      {/* Directory View (Executives + Department Filter + Search + Staff Cards) */}
      <DirectoryView data={directoryData} />
    </div>
  );
}
