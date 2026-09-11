import { getT } from "@/i18n/server";
import { resolvePortalTenantId, listPublicPrograms } from "@/features/curriculum/server";
import { CurriculumPortalView } from "./_components/curriculum-portal-view";

export default async function PublicCurriculumPage() {
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

  const programs = await listPublicPrograms(tenantId);

  return (
    <div className="space-y-8">
      {/* Page Title & Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-2 py-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          {t("curriculum.portalTitle")}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          {t("curriculum.portalSubtitle")}
        </p>
      </div>

      {/* Interactive Curriculum Portal View */}
      <CurriculumPortalView programs={programs} />
    </div>
  );
}
