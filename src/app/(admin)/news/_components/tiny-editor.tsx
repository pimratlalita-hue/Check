"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

interface TinyEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
  disabled?: boolean;
}

// Dynamic import with SSR disabled to ensure client-side DOM availability
const Editor = dynamic(
  () => import("@tinymce/tinymce-react").then((mod) => mod.Editor),
  {
    ssr: false,
    loading: () => (
      <div className="h-[320px] w-full flex flex-col items-center justify-center border border-slate-200 rounded-lg bg-slate-50 text-slate-400 gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
        <span className="text-xs font-medium text-slate-500">กำลังโหลด Tiny Editor...</span>
      </div>
    ),
  }
);

export function TinyEditor({
  value,
  onChange,
  placeholder = "พิมพ์หรือจัดรูปแบบเนื้อหาข่าวที่นี่...",
  height = 320,
  disabled = false,
}: TinyEditorProps) {
  return (
    <div className="tiny-editor-container border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-purple-500 transition-all">
      <Editor
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        licenseKey="gpl"
        value={value}
        disabled={disabled}
        onEditorChange={(newContent) => {
          onChange(newContent);
        }}
        init={{
          height,
          menubar: false,
          branding: false,
          promotion: false,
          statusbar: true,
          elementpath: false,
          placeholder,
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "media",
            "table",
            "wordcount",
          ],
          toolbar:
            "undo redo | blocks | bold italic underline forecolor | " +
            "alignleft aligncenter alignright alignjustify | " +
            "bullist numlist outdent indent | table link | " +
            "removeformat code fullscreen",
          content_style: `
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Thai", sans-serif;
              font-size: 14px;
              line-height: 1.6;
              color: #1e293b;
              padding: 12px;
            }
            p { margin: 0 0 10px 0; }
            h1, h2, h3, h4, h5, h6 { color: #0f172a; margin-top: 1em; margin-bottom: 0.5em; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
            table td, table th { border: 1px solid #cbd5e1; padding: 6px 10px; }
            table th { background-color: #f8fafc; }
            ul { list-style-type: disc; padding-left: 24px; margin-bottom: 10px; }
            ol { list-style-type: decimal; padding-left: 24px; margin-bottom: 10px; }
            a { color: #2563eb; text-decoration: underline; }
          `,
        }}
      />
    </div>
  );
}
