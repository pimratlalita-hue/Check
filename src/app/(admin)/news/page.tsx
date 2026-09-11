import { requirePermission, hasPermission } from "@/features/identity/server";
import { NEWS_P, listNews } from "@/features/news/server";
import { NewsClient } from "./_components/news-client";

export default async function NewsAdminPage() {
  const ctx = await requirePermission(NEWS_P.newsRead);
  const initialData = await listNews(ctx.tenantId, { page: 1, perPage: 10 });

  return (
    <NewsClient
      initialData={initialData}
      canManage={hasPermission(ctx, NEWS_P.newsManage)}
      canPublish={hasPermission(ctx, NEWS_P.newsPublish)}
    />
  );
}
