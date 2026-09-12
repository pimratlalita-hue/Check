import Link from "next/link";
import {
  Calendar,
  Eye,
  Pin,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Newspaper,
  Sparkles,
} from "lucide-react";
import { listNews, resolvePortalTenantId } from "@/features/news/server";
import { resolveTenantInfo } from "@/features/identity/server";
import type { NewsCategory } from "@/features/news";
import { getLocale, getT } from "@/i18n/server";
import { formatDate } from "@/shared/lib/format";
import { PortalNewsSearch } from "./_components/news-search";
import { Button } from "@/components/ui/button";
import { CreativeHero } from "@/components/portal/creative-hero";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    page?: string;
  }>;
}

const CATEGORIES: Array<{ key: string; value: NewsCategory | "" }> = [
  { key: "news.allCategories", value: "" },
  { key: "news.cat.ACADEMIC", value: "ACADEMIC" },
  { key: "news.cat.EVENT", value: "EVENT" },
  { key: "news.cat.GENERAL", value: "GENERAL" },
  { key: "news.cat.PROCUREMENT", value: "PROCUREMENT" },
];

export default async function PortalNewsPage({ searchParams }: PageProps) {
  const locale = await getLocale();
  const t = await getT();
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const search = params.search || "";
  const categoryParam = params.category as NewsCategory | undefined;
  const validCategory =
    categoryParam && ["ACADEMIC", "EVENT", "GENERAL", "PROCUREMENT"].includes(categoryParam)
      ? categoryParam
      : undefined;

  const tenantId = await resolvePortalTenantId();

  // Parallel fetch: tenant info, news list and featured news
  const [tenantInfo, newsData, featuredData] = await Promise.all([
    resolveTenantInfo(),
    listNews(tenantId, {
      page,
      perPage: 9,
      category: validCategory,
      search: search || undefined,
      status: "PUBLISHED",
    }),
    listNews(tenantId, {
      page: 1,
      perPage: 2,
      isPinned: true,
      status: "PUBLISHED",
    }),
  ]);

  const showFeatured = page === 1 && !search && !validCategory && featuredData.items.length > 0;

  return (
    <div className="space-y-10">
      {/* MotionSites-Inspired Animated Hero Section */}
      <CreativeHero
        tenantNameTh={tenantInfo.nameTh}
        tenantNameEn={tenantInfo.nameEn}
      />

      <div id="portal-content-section" className="space-y-10">

      {/* Featured Pinned Article Section */}
      {showFeatured && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600">
            <Sparkles className="h-4 w-4" />
            <span>{t("news.featured")}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredData.items.map((art) => {
              const displayTitle = locale === "en" && art.titleEn ? art.titleEn : art.titleTh;
              const displaySummary = locale === "en" && art.summaryEn ? art.summaryEn : art.summaryTh;
              return (
                <Link
                  key={art.id}
                  href={`/portal/news/${art.slug}`}
                  className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-tr from-slate-800 to-slate-900">
                    {art.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={art.coverImageUrl}
                        alt={displayTitle}
                        className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-500">
                        <Newspaper className="h-12 w-12 stroke-[1.5]" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-600/90 backdrop-blur px-2.5 py-1 text-xs font-semibold text-white shadow-xs">
                        <Pin className="h-3 w-3 fill-current" />
                        PINNED
                      </span>
                      <span className="rounded-full bg-slate-900/80 backdrop-blur px-2.5 py-1 text-xs font-medium text-slate-200">
                        {t(`news.cat.${art.category}`)}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(art.publishedAt ? new Date(art.publishedAt) : new Date(art.createdAt), locale)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          {art.viewCount.toLocaleString()}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-2">
                        {displayTitle}
                      </h3>
                      {displaySummary && (
                        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                          {displaySummary}
                        </p>
                      )}
                    </div>

                    <div className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 group-hover:translate-x-1 transition-transform">
                      <span>{t("news.readMore")}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-slate-200/80">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = (!validCategory && !cat.value) || validCategory === cat.value;
            const query = new URLSearchParams();
            if (cat.value) query.set("category", cat.value);
            if (search) query.set("search", search);

            return (
              <Link
                key={cat.key}
                href={`/portal/news${query.toString() ? `?${query.toString()}` : ""}`}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-rose-600 text-white shadow-xs font-semibold"
                    : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
                }`}
              >
                {t(cat.key)}
              </Link>
            );
          })}
        </div>

        <PortalNewsSearch defaultValue={search} />
      </div>

      {/* News Grid */}
      {newsData.items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsData.items.map((art) => {
            const displayTitle = locale === "en" && art.titleEn ? art.titleEn : art.titleTh;
            const displaySummary = locale === "en" && art.summaryEn ? art.summaryEn : art.summaryTh;

            return (
              <Link
                key={art.id}
                href={`/portal/news/${art.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all"
              >
                {/* Image */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                  {art.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={art.coverImageUrl}
                      alt={displayTitle}
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400 bg-slate-100">
                      <Newspaper className="h-8 w-8 stroke-[1.5]" />
                    </div>
                  )}

                  <div className="absolute top-2.5 left-2.5">
                    <span className="rounded-lg bg-white/90 backdrop-blur px-2 py-0.5 text-xs font-semibold text-slate-700 shadow-2xs border border-slate-200/50">
                      {t(`news.cat.${art.category}`)}
                    </span>
                  </div>

                  {art.isPinned && (
                    <div className="absolute top-2.5 right-2.5">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-rose-600 text-white px-2 py-0.5 text-xs font-semibold shadow-2xs">
                        <Pin className="h-3 w-3 fill-current" />
                        PIN
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        {formatDate(art.publishedAt ? new Date(art.publishedAt) : new Date(art.createdAt), locale)}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-2 leading-snug">
                      {displayTitle}
                    </h3>

                    {displaySummary && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {displaySummary}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {art.viewCount.toLocaleString()}
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-rose-600 group-hover:translate-x-0.5 transition-transform">
                      {t("news.readMore")}
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-slate-200 bg-white space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Newspaper className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-slate-800 text-base">
            {t("news.emptyFilter")}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {locale === "en"
              ? "Try adjusting your search terms or clearing category filters to find what you are looking for."
              : "ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นเพื่อดูรายการข่าวสารที่เกี่ยวข้อง"}
          </p>
          {(search || validCategory) && (
            <div className="pt-2">
              <Link href="/portal/news">
                <Button size="sm" variant="outline">
                  {locale === "en" ? "Clear all filters" : "ล้างตัวกรองทั้งหมด"}
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {newsData.totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-slate-200 text-xs text-slate-500">
          <div>
            {locale === "en"
              ? `Page ${newsData.page} of ${newsData.totalPages} (${newsData.total} articles)`
              : `หน้า ${newsData.page} จาก ${newsData.totalPages} (ทั้งหมด ${newsData.total} รายการ)`}
          </div>

          <div className="flex items-center gap-2">
            {page > 1 ? (
              <Link
                href={`/portal/news?page=${page - 1}${validCategory ? `&category=${validCategory}` : ""}${
                  search ? `&search=${encodeURIComponent(search)}` : ""
                }`}
              >
                <Button size="sm" variant="outline" className="gap-1 h-8 px-2.5 text-xs">
                  <ChevronLeft className="h-3.5 w-3.5" />
                  {locale === "en" ? "Previous" : "ก่อนหน้า"}
                </Button>
              </Link>
            ) : (
              <Button size="sm" variant="outline" disabled className="gap-1 h-8 px-2.5 text-xs">
                <ChevronLeft className="h-3.5 w-3.5" />
                {locale === "en" ? "Previous" : "ก่อนหน้า"}
              </Button>
            )}

            {page < newsData.totalPages ? (
              <Link
                href={`/portal/news?page=${page + 1}${validCategory ? `&category=${validCategory}` : ""}${
                  search ? `&search=${encodeURIComponent(search)}` : ""
                }`}
              >
                <Button size="sm" variant="outline" className="gap-1 h-8 px-2.5 text-xs">
                  {locale === "en" ? "Next" : "ถัดไป"}
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            ) : (
              <Button size="sm" variant="outline" disabled className="gap-1 h-8 px-2.5 text-xs">
                {locale === "en" ? "Next" : "ถัดไป"}
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
