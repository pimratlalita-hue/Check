import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Calendar,
  Eye,
  ArrowLeft,
  FileText,
  Download,
  User,
  Pin,
  Tag,
} from "lucide-react";
import { getNewsBySlug, resolvePortalTenantId } from "@/features/news/server";
import { getLocale, getT } from "@/i18n/server";
import { formatDate } from "@/shared/lib/format";
import { ShareButton } from "./_components/share-button";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const tenantId = await resolvePortalTenantId();
  const article = await getNewsBySlug(tenantId, slug, false);
  const locale = await getLocale();

  if (!article) return { title: "Article Not Found" };

  const title = locale === "en" && article.titleEn ? article.titleEn : article.titleTh;
  const description =
    locale === "en" && article.summaryEn
      ? article.summaryEn
      : article.summaryTh || "Faculty news article";

  return {
    title: `${title} | Faculty Web Platform`,
    description,
  };
}

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const locale = await getLocale();
  const t = await getT();
  const tenantId = await resolvePortalTenantId();

  // Increment viewCount on article load
  const article = await getNewsBySlug(tenantId, slug, true);

  if (!article || article.status !== "PUBLISHED") {
    notFound();
  }

  const primaryTitle = locale === "en" && article.titleEn ? article.titleEn : article.titleTh;
  const secondaryTitle = locale === "en" ? article.titleTh : article.titleEn;
  const primarySummary = locale === "en" && article.summaryEn ? article.summaryEn : article.summaryTh;
  const primaryContent = locale === "en" && article.contentEn ? article.contentEn : article.contentTh;

  return (
    <article className="max-w-3xl mx-auto space-y-8">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/portal/news"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("news.backToList")}</span>
        </Link>
        <ShareButton />
      </div>

      {/* Header Info */}
      <header className="space-y-4 border-b border-slate-200 pb-6">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-lg bg-rose-50 text-rose-700 px-2.5 py-1 font-semibold border border-rose-200/60">
            <Tag className="h-3 w-3" />
            {t(`news.cat.${article.category}`)}
          </span>

          {article.isPinned && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 text-amber-800 px-2.5 py-1 font-semibold border border-amber-200/60">
              <Pin className="h-3 w-3 fill-current" />
              PINNED
            </span>
          )}

          <span className="text-slate-400">•</span>

          <span className="inline-flex items-center gap-1 text-slate-500">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            {formatDate(
              article.publishedAt ? new Date(article.publishedAt) : new Date(article.createdAt),
              locale,
            )}
          </span>

          <span className="text-slate-400">•</span>

          <span className="inline-flex items-center gap-1 text-slate-500">
            <Eye className="h-3.5 w-3.5 text-slate-400" />
            {article.viewCount.toLocaleString()} {locale === "en" ? "views" : "ครั้ง"}
          </span>

          {article.authorName && (
            <>
              <span className="text-slate-400">•</span>
              <span className="inline-flex items-center gap-1 text-slate-500">
                <User className="h-3.5 w-3.5 text-slate-400" />
                {article.authorName}
              </span>
            </>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
          {primaryTitle}
        </h1>

        {secondaryTitle && secondaryTitle !== primaryTitle && (
          <p className="text-sm sm:text-base text-slate-500 font-medium italic">
            {secondaryTitle}
          </p>
        )}
      </header>

      {/* Cover Image */}
      {article.coverImageUrl && (
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-100 shadow-sm border border-slate-200/80">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.coverImageUrl}
            alt={primaryTitle}
            className="h-full w-full object-cover object-center"
          />
        </div>
      )}

      {/* Summary Highlight Box */}
      {primarySummary && (
        <div className="rounded-xl border-l-4 border-rose-500 bg-rose-50/50 p-4 text-slate-700 text-sm sm:text-base leading-relaxed font-medium">
          {primarySummary}
        </div>
      )}

      {/* Full Content */}
      {/<[a-z][\s\S]*>/i.test(primaryContent) ? (
        <div
          className="prose prose-slate max-w-none text-slate-800 text-base leading-relaxed font-normal [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_li]:mb-1 [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:p-2.5 [&_td]:border [&_td]:border-slate-200 [&_td]:p-2.5 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-slate-900 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-slate-800 [&_h3]:mt-4 [&_h3]:mb-2 [&_a]:text-blue-600 [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: primaryContent }}
        />
      ) : (
        <div className="prose prose-slate max-w-none text-slate-800 text-base leading-relaxed space-y-4 whitespace-pre-line font-normal">
          {primaryContent}
        </div>
      )}

      {/* File Attachments */}
      {article.attachments && article.attachments.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <FileText className="h-4 w-4 text-rose-600" />
            <span>{t("news.attachments")}</span>
            <span className="text-xs text-slate-400 font-normal">
              ({article.attachments.length} {locale === "en" ? "files" : "ไฟล์"})
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {article.attachments.map((file) => (
              <div
                key={file.id}
                className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {file.fileName}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {formatBytes(file.fileSize)} • {formatDate(new Date(file.createdAt), locale)}
                    </p>
                  </div>
                </div>

                <a
                  href={file.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="shrink-0"
                >
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8">
                    <Download className="h-3.5 w-3.5" />
                    <span>{t("news.download")}</span>
                  </Button>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="pt-8 border-t border-slate-200 flex items-center justify-between">
        <Link href="/portal/news">
          <Button variant="outline" className="gap-2 text-xs">
            <ArrowLeft className="h-4 w-4" />
            <span>{t("news.backToList")}</span>
          </Button>
        </Link>
        <ShareButton />
      </div>
    </article>
  );
}
