"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/shared/lib/i18n/client";
import { Button } from "@/components/ui/button";

export function ShareButton() {
  const t = useT();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        toast.success(t("news.copied"));
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      toast.error(t("common.error"));
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleShare}
      className="gap-1.5 text-xs rounded-xl h-8 text-slate-600 hover:text-slate-900"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-600" />
          <span className="text-emerald-600 font-medium">{t("news.copied")}</span>
        </>
      ) : (
        <>
          <Share2 className="h-3.5 w-3.5" />
          <span>{t("news.share")}</span>
        </>
      )}
    </Button>
  );
}
