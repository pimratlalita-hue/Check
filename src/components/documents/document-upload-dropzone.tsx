"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  ExternalLink,
  Link as LinkIcon,
} from "lucide-react";
import { toast } from "sonner";

interface DocumentUploadDropzoneProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  description?: string;
}

export function DocumentUploadDropzone({
  value,
  onChange,
  label = "เอกสารประกอบคำร้อง / เล่มเค้าโครงวิทยานิพนธ์ (Thesis Document)",
  description = "รองรับไฟล์ .pdf, .docx, .doc ขนาดไม่เกิน 50 MB",
}: DocumentUploadDropzoneProps) {
  const [mode, setMode] = useState<"file" | "url">(value.startsWith("http") && !value.includes("/api/documents/") ? "url" : "file");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    size: number;
    url: string;
  } | null>(value ? { name: "เอกสารที่แนบไว้", size: 0, url: value } : null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(file: File) {
    if (!file) return;

    // Validate size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error(`ขนาดไฟล์เกิน 50 MB (ไฟล์ปัจจุบัน ${(file.size / 1024 / 1024).toFixed(2)} MB)`);
      return;
    }

    // Validate extension
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (![".pdf", ".docx", ".doc"].includes(ext)) {
      toast.error("รองรับเฉพาะไฟล์ .pdf, .docx หรือ .doc เท่านั้น");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "การอัปโหลดไฟล์ล้มเหลว");
      }

      setFileInfo({
        name: data.fileName,
        size: data.fileSize,
        url: data.url,
      });
      onChange(data.url);
      toast.success(`อัปโหลดไฟล์ "${data.fileName}" สำเร็จ`);
    } catch (err: any) {
      toast.error(err.message || "เกิดข้อผิดพลาดในการอัปโหลด");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return "";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700">
          {label}
        </label>
        <div className="flex items-center gap-2 text-[11px]">
          <button
            type="button"
            onClick={() => setMode("file")}
            className={`font-medium transition-colors cursor-pointer ${
              mode === "file" ? "text-rose-600 font-bold underline" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            อัปโหลดไฟล์ (Upload)
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`font-medium transition-colors cursor-pointer ${
              mode === "url" ? "text-rose-600 font-bold underline" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            ระบุ URL ภายนอก
          </button>
        </div>
      </div>

      {mode === "file" ? (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileUpload(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          {fileInfo && fileInfo.url ? (
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 bg-white border border-emerald-200 rounded-lg text-emerald-600 shrink-0 shadow-2xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800 truncate flex items-center gap-1.5">
                    <span>{fileInfo.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-normal">
                      Verified
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    {fileInfo.size > 0 && <span>{formatFileSize(fileInfo.size)}</span>}
                    <a
                      href={fileInfo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-rose-600 hover:underline flex items-center gap-0.5"
                    >
                      <span>เปิดดูเอกสาร</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFileInfo(null);
                  onChange("");
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                title="ลบเอกสาร"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                dragOver
                  ? "border-rose-500 bg-rose-50/50"
                  : "border-slate-300 hover:border-rose-400 hover:bg-slate-50/60 bg-white"
              }`}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-2 text-rose-600">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="text-xs font-bold">กำลังอัปโหลดและตรวจสอบไฟล์เอกสาร...</span>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-rose-50 text-rose-600 rounded-full mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    ลากไฟล์เอกสารมาวางที่นี่ หรือ <span className="text-rose-600 underline">คลิกเพื่อเลือกไฟล์</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{description}</p>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          <div className="relative">
            <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="url"
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                setFileInfo(e.target.value ? { name: "ลิงก์ภายนอก", size: 0, url: e.target.value } : null);
              }}
              placeholder="https://drive.google.com/... หรือ https://onedrive.live.com/..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>
          <p className="text-[11px] text-slate-500">
            โปรดตรวจสอบให้แน่ใจว่าได้เปิดสิทธิ์การเข้าถึงเป็น "ทุกคนที่มีลิงก์สามารถดูได้ (Anyone with link)"
          </p>
        </div>
      )}
    </div>
  );
}
