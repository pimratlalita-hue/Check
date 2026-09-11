import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  GraduationCap,
  BookOpen,
  Clock,
  Coins,
  FileText,
  Target,
  Briefcase,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { getLocale, getT } from "@/i18n/server";
import {
  resolvePortalTenantId,
  getPublicProgramDetail,
  type ProgramCourseDto,
} from "@/features/curriculum/server";
import { Button } from "@/components/ui/button";

interface CurriculumDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CurriculumDetailPage({
  params,
}: CurriculumDetailPageProps) {
  const { slug } = await params;
  const locale = await getLocale();
  const t = await getT();

  let tenantId: string;
  try {
    tenantId = await resolvePortalTenantId();
  } catch {
    notFound();
  }

  const program = await getPublicProgramDetail(tenantId, slug);
  if (!program) {
    notFound();
  }

  const courses = program.courses ?? [];
  const groupedCourses = courses.reduce((acc, course) => {
    const cat = course.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(course);
    return acc;
  }, {} as Record<string, ProgramCourseDto[]>);

  const categoryOrder = [
    "GENERAL_EDUCATION",
    "CORE_COURSE",
    "MAJOR_ELECTIVE",
    "FREE_ELECTIVE",
    "THESIS",
  ];

  const categoryLabels: Record<string, string> = {
    GENERAL_EDUCATION: t("curriculum.category.GENERAL_EDUCATION"),
    CORE_COURSE: t("curriculum.category.CORE_COURSE"),
    MAJOR_ELECTIVE: t("curriculum.category.MAJOR_ELECTIVE"),
    FREE_ELECTIVE: t("curriculum.category.FREE_ELECTIVE"),
    THESIS: t("curriculum.category.THESIS"),
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Back Link */}
      <div>
        <Link
          href="/portal/curriculum"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{t("curriculum.backToList")}</span>
        </Link>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg">
                {program.code}
              </span>
              <span className="text-xs font-bold px-3 py-1 bg-rose-50 text-rose-700 rounded-lg border border-rose-100">
                {t(`curriculum.level.${program.level}`)}
              </span>
              <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
                {t(`curriculum.type.${program.type}`)}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {locale === "en" ? program.nameEn : program.nameTh}
            </h1>
            <p className="text-sm sm:text-base text-slate-500 font-medium">
              {locale === "en" ? program.nameTh : program.nameEn}
            </p>

            <div className="pt-2 space-y-1 text-sm">
              <div className="text-slate-800 font-semibold">
                {t("curriculum.degreeTitle")}:{" "}
                <span className="text-rose-600">
                  {locale === "en" ? program.degreeEn : program.degreeTh}
                </span>{" "}
                <span className="text-slate-500 font-normal">
                  ({locale === "en" ? program.degreeShortEn : program.degreeShortTh})
                </span>
              </div>

              {program.departmentNameTh && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                  <span>
                    {locale === "en"
                      ? program.departmentNameEn ?? program.departmentNameTh
                      : program.departmentNameTh}
                  </span>
                </div>
              )}
            </div>
          </div>

          {program.handbookUrl && (
            <div className="shrink-0">
              <a
                href={program.handbookUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-rose-600 hover:bg-rose-700 text-white gap-2 shadow-sm">
                  <FileText className="h-4 w-4" />
                  <span>{t("curriculum.downloadHandbook")}</span>
                </Button>
              </a>
            </div>
          )}
        </div>

        {/* Stats Grid Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
              <BookOpen className="h-4 w-4 text-rose-600" />
              <span>{t("curriculum.credits")}</span>
            </div>
            <div className="text-xl font-bold text-slate-900">
              {program.totalCredits}{" "}
              <span className="text-xs font-normal text-slate-500">
                {t("curriculum.creditsUnit")}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>{t("curriculum.studyDuration")}</span>
            </div>
            <div className="text-base font-bold text-slate-900 truncate">
              {program.studyDuration}
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
              <Coins className="h-4 w-4 text-emerald-600" />
              <span>{t("curriculum.tuitionFee")}</span>
            </div>
            <div className="text-sm font-bold text-slate-900 truncate">
              {program.tuitionFee || "-"}
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
              <GraduationCap className="h-4 w-4 text-purple-600" />
              <span>{t("curriculum.structure")}</span>
            </div>
            <div className="text-xl font-bold text-slate-900">
              {courses.length}{" "}
              <span className="text-xs font-normal text-slate-500">วิชา</span>
            </div>
          </div>
        </div>
      </div>

      {/* Philosophy & Overview */}
      {(program.philosophyTh || program.philosophyEn || program.descriptionTh) && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-4 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-rose-600" />
            <span>{t("curriculum.philosophy")}</span>
          </h2>
          <div className="text-sm leading-relaxed text-slate-600 space-y-3">
            {program.philosophyTh && <p>{program.philosophyTh}</p>}
            {program.philosophyEn && (
              <p className="text-slate-500 italic pt-1">{program.philosophyEn}</p>
            )}
            {program.descriptionTh && !program.philosophyTh && (
              <p>{program.descriptionTh}</p>
            )}
          </div>
        </div>
      )}

      {/* PLOs (Program Learning Outcomes) */}
      {program.learningOutcomes && program.learningOutcomes.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-5 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Target className="h-5 w-5 text-rose-600" />
            <span>{t("curriculum.learningOutcomes")}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {program.learningOutcomes.map((plo, idx) => (
              <div
                key={idx}
                className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/70 flex items-start gap-3"
              >
                <span className="font-mono text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-100 shrink-0">
                  {plo.code}
                </span>
                <div className="space-y-1 text-xs text-slate-700">
                  <p className="font-semibold text-slate-900">{plo.descTh}</p>
                  {plo.descEn && (
                    <p className="text-slate-500 italic">{plo.descEn}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Curriculum Structure & Courses */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100 gap-2">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-rose-600" />
            <span>{t("curriculum.structure")}</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            หลักสูตร {program.totalCredits} {t("curriculum.creditsUnit")}
          </span>
        </div>

        {courses.length === 0 ? (
          <p className="text-center py-8 text-sm text-slate-500">
            อยู่ระหว่างการปรับปรุงรายละเอียดโครงสร้างรายวิชา
          </p>
        ) : (
          <div className="space-y-6">
            {categoryOrder.map((catKey) => {
              const catCourses = groupedCourses[catKey];
              if (!catCourses || catCourses.length === 0) return null;
              const catCredits = catCourses.reduce((sum, c) => sum + c.credits, 0);

              return (
                <div key={catKey} className="space-y-3">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                    <h3 className="text-sm font-bold text-slate-800">
                      {categoryLabels[catKey] ?? catKey}
                    </h3>
                    <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
                      {catCredits} {t("curriculum.creditsUnit")} ({catCourses.length} รายวิชา)
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    {catCourses.map((c) => (
                      <div
                        key={c.id}
                        className="p-3.5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                              {c.code}
                            </span>
                            <span className="font-bold text-slate-900 text-sm">
                              {locale === "en" ? c.nameEn : c.nameTh}
                            </span>
                          </div>
                          <p className="text-slate-500">
                            {locale === "en" ? c.nameTh : c.nameEn}
                          </p>
                          {c.prerequisite && (
                            <p className="text-amber-700 bg-amber-50 inline-block px-1.5 py-0.5 rounded text-[11px]">
                              {t("curriculum.coursePrerequisite")}: {c.prerequisite}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-4 shrink-0 text-slate-600">
                          {(c.year || c.semester) && (
                            <span className="text-slate-400">
                              ปี {c.year ?? "-"} เทอม {c.semester ?? "-"}
                            </span>
                          )}
                          <div className="text-right">
                            <span className="font-bold text-slate-900">
                              {c.credits} หน่วยกิต
                            </span>
                            {c.creditHours && (
                              <div className="text-[11px] text-slate-400">
                                {c.creditHours}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Career Paths */}
      {program.careerPaths && program.careerPaths.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-4 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-rose-600" />
            <span>{t("curriculum.careerPaths")}</span>
          </h2>

          <div className="flex flex-wrap gap-2.5">
            {program.careerPaths.map((career, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-50 hover:bg-rose-50/50 text-slate-800 rounded-xl border border-slate-200 text-xs font-medium transition-colors"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-rose-500" />
                <span>{career}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Faculty link */}
      {program.departmentId && (
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-6 rounded-2xl border border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {t("curriculum.relatedFaculty")}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              คณาจารย์ประจำหลักสูตร และอาจารย์ผู้รับผิดชอบหลักสูตรในสาขาวิชา
            </p>
          </div>
          <Link href={`/portal/staff?dept=${program.departmentId}`}>
            <Button variant="outline" size="sm" className="bg-white text-xs gap-1.5">
              <span>ดูทำเนียบคณาจารย์ในสาขา</span>
              <GraduationCap className="h-3.5 w-3.5 text-rose-600" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
