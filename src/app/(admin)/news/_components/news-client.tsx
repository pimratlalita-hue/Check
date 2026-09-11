"use client";

import { useState, useEffect, useCallback, useTransition, useRef } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Pin,
  PinOff,
  Globe,
  Archive,
  ExternalLink,
  Search,
  Newspaper,
  AlertCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { formatDate } from "@/shared/lib/format";
import {
  LiyonCard,
  DataTable,
  StatusPill,
  LiyonDialog,
  LiyonDialogCloseButton,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonSelect,
  RowMenuItem,
  RowMenuSeparator,
  type DataTableColumn,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type {
  NewsArticleDto,
  NewsListResult,
  NewsCategory,
  NewsStatus,
} from "@/features/news";
import {
  listNewsAction,
  createNewsAction,
  updateNewsAction,
  deleteNewsAction,
  togglePinNewsAction,
  changeNewsStatusAction,
} from "@/features/news/actions";
import { NewsDialog } from "./news-dialog";
import { emptyNewsForm, type NewsFormData } from "./types";

interface NewsClientProps {
  initialData: NewsListResult;
  canManage: boolean;
  canPublish: boolean;
}

const PER_PAGE = 10;

export function NewsClient({ initialData, canManage, canPublish }: NewsClientProps) {
  const t = useT();
  const locale = useLocale();

  const [articles, setArticles] = useState<NewsArticleDto[]>(initialData.items);
  const [total, setTotal] = useState(initialData.total);
  const [page, setPage] = useState(initialData.page);
  const [totalPages, setTotalPages] = useState(initialData.totalPages);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"all" | NewsCategory>("all");
  const [status, setStatus] = useState<"all" | NewsStatus>("all");
  const [state, setState] = useState<"loading" | "data" | "empty" | "error">(
    initialData.items.length ? "data" : "empty",
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<NewsFormData>(emptyNewsForm());
  const [deleteTarget, setDeleteTarget] = useState<NewsArticleDto | null>(null);

  const [isPending, startTransition] = useTransition();
  const isMounted = useRef(false);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Load articles
  const loadArticles = useCallback(async () => {
    setState("loading");
    const res = await listNewsAction({
      page,
      perPage: PER_PAGE,
      search: search || undefined,
      category: category !== "all" ? category : undefined,
      status: status !== "all" ? status : undefined,
    });

    if (!res.ok) {
      setState("error");
      toast.error(t("common.error"));
      return;
    }

    setArticles(res.data.items);
    setTotal(res.data.total);
    setTotalPages(res.data.totalPages);
    setState(res.data.items.length ? "data" : "empty");
  }, [page, search, category, status, t]);

  // Refetch when filters change (skip initial mount since initialData was passed)
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    void loadArticles();
  }, [loadArticles]);

  // Open Create Dialog
  const handleOpenCreate = () => {
    setFormData(emptyNewsForm());
    setDialogOpen(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = (article: NewsArticleDto) => {
    setFormData({
      id: article.id,
      titleTh: article.titleTh,
      titleEn: article.titleEn,
      slug: article.slug,
      summaryTh: article.summaryTh ?? "",
      summaryEn: article.summaryEn ?? "",
      contentTh: article.contentTh,
      contentEn: article.contentEn,
      coverImageUrl: article.coverImageUrl ?? "",
      category: article.category,
      status: article.status,
      isPinned: article.isPinned,
    });
    setDialogOpen(true);
  };

  // Submit Create / Edit
  const handleSubmitForm = async () => {
    startTransition(async () => {
      if (formData.id) {
        const res = await updateNewsAction({
          id: formData.id,
          titleTh: formData.titleTh.trim(),
          titleEn: formData.titleEn.trim(),
          slug: formData.slug.trim(),
          summaryTh: formData.summaryTh.trim() || undefined,
          summaryEn: formData.summaryEn.trim() || undefined,
          contentTh: formData.contentTh.trim(),
          contentEn: formData.contentEn.trim(),
          coverImageUrl: formData.coverImageUrl.trim() || undefined,
          category: formData.category,
          status: formData.status,
          isPinned: formData.isPinned,
        });

        if (res.ok) {
          toast.success(t("news.updateSuccess"));
          setDialogOpen(false);
          await loadArticles();
        } else {
          toast.error(t("common.error"));
        }
      } else {
        const res = await createNewsAction({
          titleTh: formData.titleTh.trim(),
          titleEn: formData.titleEn.trim(),
          slug: formData.slug.trim(),
          summaryTh: formData.summaryTh.trim() || undefined,
          summaryEn: formData.summaryEn.trim() || undefined,
          contentTh: formData.contentTh.trim(),
          contentEn: formData.contentEn.trim(),
          coverImageUrl: formData.coverImageUrl.trim() || undefined,
          category: formData.category,
          status: formData.status,
          isPinned: formData.isPinned,
        });

        if (res.ok) {
          toast.success(t("news.createSuccess"));
          setDialogOpen(false);
          await loadArticles();
        } else {
          toast.error(t("common.error"));
        }
      }
    });
  };

  // Toggle Pin
  const handleTogglePin = (article: NewsArticleDto) => {
    startTransition(async () => {
      const res = await togglePinNewsAction(article.id);
      if (res.ok) {
        toast.success(res.data.isPinned ? t("news.pinSuccess") : t("news.unpinSuccess"));
        await loadArticles();
      } else {
        toast.error(t("common.error"));
      }
    });
  };

  // Change Status
  const handleChangeStatus = (article: NewsArticleDto, newStatus: NewsStatus) => {
    startTransition(async () => {
      const res = await changeNewsStatusAction(article.id, newStatus);
      if (res.ok) {
        toast.success(t("news.statusSuccess"));
        await loadArticles();
      } else {
        toast.error(t("common.error"));
      }
    });
  };

  // Delete
  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    startTransition(async () => {
      const res = await deleteNewsAction(deleteTarget.id);
      if (res.ok) {
        toast.success(t("news.deleteSuccess"));
        setDeleteTarget(null);
        await loadArticles();
      } else {
        toast.error(t("common.error"));
      }
    });
  };

  // Columns definition
  const columns: DataTableColumn<NewsArticleDto>[] = [
    {
      key: "title",
      header: t("news.titleTh"),
      render: (row) => {
        const displayTitle = locale === "en" && row.titleEn ? row.titleEn : row.titleTh;
        return (
          <div className="space-y-1 py-1">
            <div className="flex items-center gap-2">
              {row.isPinned && (
                <span className="inline-flex items-center gap-1 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 px-1.5 py-0.5 text-xs font-semibold shrink-0">
                  <Pin className="h-3 w-3 fill-current" />
                  PIN
                </span>
              )}
              <span className="font-medium text-foreground line-clamp-1">{displayTitle}</span>
            </div>
            <div className="text-xs text-muted-foreground font-mono">/{row.slug}</div>
          </div>
        );
      },
    },
    {
      key: "category",
      header: t("news.category"),
      render: (row) => (
        <span className="inline-block px-2.5 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
          {t(`news.cat.${row.category}`)}
        </span>
      ),
    },
    {
      key: "status",
      header: t("news.status"),
      render: (row) => {
        const tone = row.status === "PUBLISHED" ? "ok" : row.status === "DRAFT" ? "warn" : "off";
        return <StatusPill tone={tone}>{t(`news.status.${row.status}`)}</StatusPill>;
      },
    },
    {
      key: "views",
      header: t("news.viewCount"),
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Eye className="h-3.5 w-3.5" />
          {row.viewCount.toLocaleString()}
        </span>
      ),
    },
    {
      key: "publishedAt",
      header: t("news.publishedAt"),
      className: "nowrap text-muted-foreground text-xs",
      render: (row) => (
        <span>{formatDate(row.publishedAt ? new Date(row.publishedAt) : new Date(row.createdAt), locale)}</span>
      ),
    },
  ];

  const hasFilters = searchInput.trim() !== "" || category !== "all" || status !== "all";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("news.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("news.subtitle")}</p>
        </div>
        {canManage && (
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("news.create")}
          </Button>
        )}
      </div>

      {/* Main Table Card */}
      <LiyonCard>
        <DataTable<NewsArticleDto>
          state={state}
          headHeading={t("news.title")}
          headMeta={t("news.totalArticles", { n: total })}
          rows={articles}
          columns={columns}
          getRowId={(row) => row.id}
          toolbar={
            <>
              <span className="tsearch">
                <Search aria-hidden="true" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={t("news.searchPh")}
                  aria-label={t("common.search")}
                />
              </span>
              <LiyonSelect
                aria-label={t("news.category")}
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as "all" | NewsCategory);
                  setPage(1);
                }}
              >
                <option value="all">{t("news.allCategories")}</option>
                <option value="GENERAL">{t("news.cat.GENERAL")}</option>
                <option value="ACADEMIC">{t("news.cat.ACADEMIC")}</option>
                <option value="EVENT">{t("news.cat.EVENT")}</option>
                <option value="PROCUREMENT">{t("news.cat.PROCUREMENT")}</option>
              </LiyonSelect>
              <LiyonSelect
                aria-label={t("news.status")}
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as "all" | NewsStatus);
                  setPage(1);
                }}
              >
                <option value="all">{t("news.allStatuses")}</option>
                <option value="PUBLISHED">{t("news.status.PUBLISHED")}</option>
                <option value="DRAFT">{t("news.status.DRAFT")}</option>
                <option value="ARCHIVED">{t("news.status.ARCHIVED")}</option>
              </LiyonSelect>
            </>
          }
          renderRowMenu={
            canManage
              ? (row) => (
                  <>
                    <RowMenuItem
                      onSelect={() => handleOpenEdit(row)}
                      icon={<Pencil className="h-4 w-4" />}
                    >
                      {t("news.edit")}
                    </RowMenuItem>

                    {canPublish && (
                      <RowMenuItem
                        onSelect={() => handleTogglePin(row)}
                        icon={
                          row.isPinned ? (
                            <PinOff className="h-4 w-4" />
                          ) : (
                            <Pin className="h-4 w-4" />
                          )
                        }
                      >
                        {row.isPinned ? t("news.unpin") : t("news.pin")}
                      </RowMenuItem>
                    )}

                    {canPublish && row.status !== "PUBLISHED" && (
                      <RowMenuItem
                        onSelect={() => handleChangeStatus(row, "PUBLISHED")}
                        icon={<Globe className="h-4 w-4 text-emerald-600" />}
                      >
                        {t("news.publish")}
                      </RowMenuItem>
                    )}

                    {canPublish && row.status === "PUBLISHED" && (
                      <RowMenuItem
                        onSelect={() => handleChangeStatus(row, "DRAFT")}
                        icon={<Archive className="h-4 w-4 text-amber-600" />}
                      >
                        {t("news.unpublish")}
                      </RowMenuItem>
                    )}

                    {row.status === "PUBLISHED" && (
                      <RowMenuItem
                        onSelect={() => window.open(`/portal/news/${row.slug}`, "_blank")}
                        icon={<ExternalLink className="h-4 w-4 text-blue-600" />}
                      >
                        {t("news.viewPortal")}
                      </RowMenuItem>
                    )}

                    {canPublish && (
                      <>
                        <RowMenuSeparator />
                        <RowMenuItem
                          onSelect={() => setDeleteTarget(row)}
                          danger
                          icon={<Trash2 className="h-4 w-4" />}
                        >
                          {t("news.delete")}
                        </RowMenuItem>
                      </>
                    )}
                  </>
                )
              : undefined
          }
          empty={{
            icon: <Newspaper className="h-10 w-10 text-muted-foreground/50" />,
            title: t(hasFilters ? "news.emptyFilter" : "news.empty"),
            description: t("news.subtitle"),
          }}
          error={{
            icon: <AlertCircle className="h-10 w-10 text-destructive" />,
            title: t("common.error"),
            actions: (
              <Button type="button" size="sm" onClick={loadArticles}>
                {t("auth.errorRetry")}
              </Button>
            ),
          }}
          footer={
            <>
              <span className="at">
                {t("common.page", { page, totalPages: totalPages || 1, total })}
              </span>
              <span className="pager">
                <button
                  type="button"
                  className="pg"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || isPending}
                  aria-label={t("common.prev")}
                >
                  <ChevronLeft aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="pg"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || isPending}
                  aria-label={t("common.next")}
                >
                  <ChevronRight aria-hidden="true" />
                </button>
              </span>
            </>
          }
        />
      </LiyonCard>

      {/* Create / Edit Dialog */}
      <NewsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        form={formData}
        setForm={setFormData}
        onSubmit={handleSubmitForm}
        pending={isPending}
        canPublish={canPublish}
      />

      {/* Delete Confirmation Dialog */}
      <LiyonDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        danger
      >
        <LiyonDialogCloseButton label={t("common.cancel")} />
        <LiyonDialogHeader
          title={t("news.delete")}
          description={t("news.deleteConfirm")}
        />
        <LiyonDialogBody>
          <p className="text-sm font-medium text-foreground py-2">
            {locale === "en" && deleteTarget?.titleEn
              ? deleteTarget.titleEn
              : deleteTarget?.titleTh}
          </p>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button
            variant="outline"
            onClick={() => setDeleteTarget(null)}
            disabled={isPending}
          >
            {t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteConfirm}
            disabled={isPending}
          >
            {isPending ? t("common.deleting") : t("news.delete")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
