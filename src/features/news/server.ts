import "server-only";

export {
  listNews,
  getNewsBySlug,
  getNewsById,
  resolvePortalTenantId,
  type NewsArticleDto,
  type NewsAttachmentDto,
  type NewsListResult,
} from "./_internal/services/news.service";
export { NEWS_P, NEWS_PERMISSIONS } from "./permissions";
