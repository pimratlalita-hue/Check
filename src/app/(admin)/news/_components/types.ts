import type { NewsCategory, NewsStatus } from "@/features/news";

export interface NewsFormData {
  id?: string;
  titleTh: string;
  titleEn: string;
  slug: string;
  summaryTh: string;
  summaryEn: string;
  contentTh: string;
  contentEn: string;
  coverImageUrl: string;
  category: NewsCategory;
  status: NewsStatus;
  isPinned: boolean;
}

export function emptyNewsForm(): NewsFormData {
  return {
    titleTh: "",
    titleEn: "",
    slug: "",
    summaryTh: "",
    summaryEn: "",
    contentTh: "",
    contentEn: "",
    coverImageUrl: "",
    category: "GENERAL",
    status: "DRAFT",
    isPinned: false,
  };
}
