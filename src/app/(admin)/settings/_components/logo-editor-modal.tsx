"use client";

import * as React from "react";
import {
  Upload,
  Link as LinkIcon,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Move,
  Check,
  AlertTriangle,
  RefreshCw,
  Image as ImageIcon,
  Crop,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LiyonDialog,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonDialogCloseButton,
} from "@/shared/components/liyon/liyon-dialog";

interface LogoEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLogoUrl?: string;
  onApplyLogo: (logoDataUrl: string) => void;
}

const MAX_BYTES = 200 * 1024; // 200 KB (204,800 bytes)

export function LogoEditorModal({
  open,
  onOpenChange,
  currentLogoUrl,
  onApplyLogo,
}: LogoEditorModalProps) {
  // Mode: "upload" | "url"
  const [activeTab, setActiveTab] = React.useState<"upload" | "url">("upload");
  const [imageSrc, setImageSrc] = React.useState<string | null>(null);
  const [urlInput, setUrlInput] = React.useState("");
  const [isDragging, setIsDragging] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Editor adjustments
  const [zoom, setZoom] = React.useState<number>(1.0);
  const [rotation, setRotation] = React.useState<number>(0);
  const [pan, setPan] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [aspectRatio, setAspectRatio] = React.useState<"1:1" | "4:3" | "16:9" | "free">("1:1");
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false);
  const [processedResult, setProcessedResult] = React.useState<{
    dataUrl: string;
    sizeBytes: number;
    format: string;
  } | null>(null);

  // Canvas refs
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const imageObjRef = React.useRef<HTMLImageElement | null>(null);

  // Drag-to-pan state
  const isPanningRef = React.useRef(false);
  const panStartRef = React.useRef({ x: 0, y: 0 });

  // Reset editor when modal opens or closes
  React.useEffect(() => {
    if (!open) {
      setImageSrc(null);
      setUrlInput("");
      setZoom(1.0);
      setRotation(0);
      setPan({ x: 0, y: 0 });
      setProcessedResult(null);
      setErrorMessage(null);
      imageObjRef.current = null;
    }
  }, [open]);

  // Load image object when imageSrc changes
  React.useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageObjRef.current = img;
      // Calculate initial zoom to fit comfortably in viewport
      const maxSide = Math.max(img.width, img.height);
      const initialZoom = maxSide > 400 ? 400 / maxSide : 1.0;
      setZoom(Math.max(0.3, Math.min(initialZoom, 1.5)));
      setPan({ x: 0, y: 0 });
      setRotation(0);
      renderCanvas();
    };
    img.onerror = () => {
      setErrorMessage("ไม่สามารถโหลดรูปภาพได้ กรุณาตรวจสอบไฟล์หรือ URL");
      setImageSrc(null);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Handle file select (PNG, JPG, JPEG)
  const handleFileSelect = (file: File) => {
    setErrorMessage(null);
    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setErrorMessage("กรุณาเลือกไฟล์ภาพนามสกุล .png, .jpg หรือ .jpeg เท่านั้น");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === "string") {
        setImageSrc(e.target.result);
      }
    };
    reader.onerror = () => {
      setErrorMessage("เกิดข้อผิดพลาดในการอ่านไฟล์");
    };
    reader.readAsDataURL(file);
  };

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // URL Load
  const handleLoadUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setErrorMessage("กรุณากรอก URL รูปภาพ");
      return;
    }
    setErrorMessage(null);
    setImageSrc(trimmed);
  };

  // Rotate helper: 90 degrees clockwise
  const handleRotate90 = () => {
    setRotation((prev) => {
      const next = prev + 90;
      return next > 180 ? next - 360 : next;
    });
  };

  // Reset center/pan
  const handleResetCenter = () => {
    setPan({ x: 0, y: 0 });
  };

  // Draw crop guides
  const drawCropOverlay = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    aspect: "1:1" | "4:3" | "16:9" | "free"
  ) => {
    let cropW = w - 40;
    let cropH = h - 40;

    if (aspect === "1:1") {
      const size = Math.min(cropW, cropH);
      cropW = size;
      cropH = size;
    } else if (aspect === "4:3") {
      cropH = cropW * 0.75;
      if (cropH > h - 40) {
        cropH = h - 40;
        cropW = cropH * (4 / 3);
      }
    } else if (aspect === "16:9") {
      cropH = cropW * (9 / 16);
      if (cropH > h - 40) {
        cropH = h - 40;
        cropW = cropH * (16 / 9);
      }
    }

    const cropX = (w - cropW) / 2;
    const cropY = (h - cropH) / 2;

    // Dark semi-transparent mask outside crop area
    ctx.save();
    ctx.fillStyle = "rgba(15, 23, 42, 0.45)";

    // Outer rect
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    // Cut out inner crop rect
    ctx.rect(cropX + cropW, cropY, -cropW, cropH);
    ctx.fill();

    // Border of crop window
    ctx.strokeStyle = "#e11d48"; // Rose-600
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.strokeRect(cropX, cropY, cropW, cropH);

    // Rule-of-thirds grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    // Vertical lines
    ctx.moveTo(cropX + cropW / 3, cropY);
    ctx.lineTo(cropX + cropW / 3, cropY + cropH);
    ctx.moveTo(cropX + (cropW * 2) / 3, cropY);
    ctx.lineTo(cropX + (cropW * 2) / 3, cropY + cropH);
    // Horizontal lines
    ctx.moveTo(cropX, cropY + cropH / 3);
    ctx.lineTo(cropX + cropW, cropY + cropH / 3);
    ctx.moveTo(cropX, cropY + (cropH * 2) / 3);
    ctx.lineTo(cropX + cropW, cropY + (cropH * 2) / 3);
    ctx.stroke();

    ctx.restore();
  };

  // Compress & Enforce <= 200 KB
  const generateOptimizedImage = React.useCallback((): Promise<{ dataUrl: string; sizeBytes: number; format: string } | null> => {
    return new Promise((resolve) => {
      const img = imageObjRef.current;
      const previewCanvas = canvasRef.current;
      if (!img || !previewCanvas) {
        resolve(null);
        return;
      }

      // Determine crop dimensions
      const pw = previewCanvas.width;
      const ph = previewCanvas.height;

      let cropW = pw - 40;
      let cropH = ph - 40;
      if (aspectRatio === "1:1") {
        const size = Math.min(cropW, cropH);
        cropW = size;
        cropH = size;
      } else if (aspectRatio === "4:3") {
        cropH = cropW * 0.75;
        if (cropH > ph - 40) {
          cropH = ph - 40;
          cropW = cropH * (4 / 3);
        }
      } else if (aspectRatio === "16:9") {
        cropH = cropW * (9 / 16);
        if (cropH > ph - 40) {
          cropH = ph - 40;
          cropW = cropH * (16 / 9);
        }
      }
      const cropX = (pw - cropW) / 2;
      const cropY = (ph - cropH) / 2;

      // Target high-definition output canvas (max 512x512 for crisp display)
      const maxTargetDim = 512;
      const scaleFactor = Math.min(maxTargetDim / cropW, maxTargetDim / cropH, 1.5);
      const outW = Math.round(cropW * scaleFactor);
      const outH = Math.round(cropH * scaleFactor);

      const outCanvas = document.createElement("canvas");
      outCanvas.width = outW;
      outCanvas.height = outH;
      const ctx = outCanvas.getContext("2d");
      if (!ctx) {
        resolve(null);
        return;
      }

      // Draw cropped portion from world coordinates
      ctx.save();
      // Fill clean background (white for universal logos)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, outW, outH);

      const cropCenterX = cropX + cropW / 2;
      const cropCenterY = cropY + cropH / 2;

      ctx.translate(outW / 2, outH / 2);
      ctx.scale(scaleFactor, scaleFactor);
      // Offset relative to preview transform
      ctx.translate(pan.x - (cropCenterX - pw / 2), pan.y - (cropCenterY - ph / 2));
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);
      ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
      ctx.restore();

      // Compression loop: try PNG first (if already under 200KB), else JPEG with quality steps
      let dataUrl = outCanvas.toDataURL("image/png");
      let byteLen = Math.round((dataUrl.length * 3) / 4);

      if (byteLen <= MAX_BYTES) {
        resolve({ dataUrl, sizeBytes: byteLen, format: "image/png" });
        return;
      }

      // Step down JPEG quality until <= 200 KB
      const qualitySteps = [0.92, 0.85, 0.75, 0.65, 0.5, 0.35];
      for (const q of qualitySteps) {
        dataUrl = outCanvas.toDataURL("image/jpeg", q);
        byteLen = Math.round((dataUrl.length * 3) / 4);
        if (byteLen <= MAX_BYTES) {
          resolve({ dataUrl, sizeBytes: byteLen, format: "image/jpeg" });
          return;
        }
      }

      // If still exceeding, downscale canvas dimensions by 30%
      const smallCanvas = document.createElement("canvas");
      smallCanvas.width = Math.round(outW * 0.7);
      smallCanvas.height = Math.round(outH * 0.7);
      const sCtx = smallCanvas.getContext("2d");
      if (sCtx) {
        sCtx.drawImage(outCanvas, 0, 0, smallCanvas.width, smallCanvas.height);
        dataUrl = smallCanvas.toDataURL("image/jpeg", 0.7);
        byteLen = Math.round((dataUrl.length * 3) / 4);
      }

      resolve({ dataUrl, sizeBytes: byteLen, format: "image/jpeg" });
    });
  }, [aspectRatio, pan, rotation, zoom]);

  // Debounced preview compression size readout
  const updateCompressionPreview = React.useCallback(() => {
    generateOptimizedImage().then((res) => {
      if (res) {
        setProcessedResult(res);
      }
    });
  }, [generateOptimizedImage]);

  // Draw canvas preview
  const renderCanvas = React.useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageObjRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.clearRect(0, 0, width, height);

    // Save state
    ctx.save();

    // Fill canvas background pattern (checkerboard for transparent PNGs)
    const gridSize = 16;
    for (let x = 0; x < width; x += gridSize) {
      for (let y = 0; y < height; y += gridSize) {
        ctx.fillStyle = (x / gridSize + y / gridSize) % 2 === 0 ? "#f8fafc" : "#f1f5f9";
        ctx.fillRect(x, y, gridSize, gridSize);
      }
    }

    // Apply transform: Center -> Pan -> Rotate -> Zoom
    ctx.translate(width / 2 + pan.x, height / 2 + pan.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Draw image centered
    ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);

    ctx.restore();

    // Draw crop guidelines overlay
    drawCropOverlay(ctx, width, height, aspectRatio);

    // Trigger auto-compression calculation
    updateCompressionPreview();
  }, [pan, rotation, zoom, aspectRatio, updateCompressionPreview]);

  // Redraw when adjustments change
  React.useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Pan interaction via mouse drag on preview canvas
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isPanningRef.current = true;
    panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPanningRef.current) return;
    setPan({
      x: e.clientX - panStartRef.current.x,
      y: e.clientY - panStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    isPanningRef.current = false;
  };

  // Apply logo handler
  const handleApply = async () => {
    setIsProcessing(true);
    try {
      const result = await generateOptimizedImage();
      if (!result) {
        setErrorMessage("ไม่สามารถประมวลผลรูปภาพได้");
        setIsProcessing(false);
        return;
      }

      if (result.sizeBytes > MAX_BYTES) {
        setErrorMessage(`ขนาดไฟล์ (${(result.sizeBytes / 1024).toFixed(1)} KB) เกิน 200 KB กรุณาลดขนาด`);
        setIsProcessing(false);
        return;
      }

      onApplyLogo(result.dataUrl);
      onOpenChange(false);
    } catch {
      setErrorMessage("เกิดข้อผิดพลาดในการบันทึกภาพ");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <LiyonDialog open={open} onOpenChange={onOpenChange} wide>
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 m-0">
            ปรับแต่งตราสัญลักษณ์ / โลโก้องค์กร
          </h2>
          <p className="text-xs text-slate-500 m-0 mt-0.5">
            รองรับ PNG, JPG, JPEG ปรับย่อ ขยาย เอียง ครอบภาพ จัดกึ่งกลาง และจำกัดขนาดไม่เกิน 200 KB
          </p>
        </div>
        <LiyonDialogCloseButton label="ปิดหน้าต่าง" />
      </div>

      <LiyonDialogBody className="p-6 space-y-5">
        {/* Error Alert */}
        {errorMessage && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg text-xs leading-relaxed bg-rose-50 text-rose-800 border border-rose-200">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {!imageSrc ? (
          /* Step 1: Upload or URL Source Selection */
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("upload");
                  setErrorMessage(null);
                }}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === "upload"
                    ? "border-rose-600 text-rose-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Upload className="h-4 w-4" />
                <span>อัปโหลดไฟล์ (ลากและวาง)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("url");
                  setErrorMessage(null);
                }}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === "url"
                    ? "border-rose-600 text-rose-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <LinkIcon className="h-4 w-4" />
                <span>นำเข้าจาก URL / ตัวอย่าง</span>
              </button>
            </div>

            {activeTab === "upload" ? (
              /* Drag & Drop Area */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                  isDragging
                    ? "border-rose-500 bg-rose-50/60 scale-[0.99]"
                    : "border-slate-300 hover:border-rose-400 bg-slate-50/50 hover:bg-slate-50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                />
                <div className="p-3 bg-white rounded-full shadow-xs border border-slate-200 text-rose-600 mb-3">
                  <Upload className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-slate-800 m-0">
                  ลากไฟล์ภาพมาวางที่นี่ หรือ <span className="text-rose-600 underline">คลิกเพื่อเลือกไฟล์</span>
                </p>
                <p className="text-xs text-slate-500 m-0 mt-1">
                  รองรับไฟล์ประเภท PNG, JPG, JPEG (ระบบจะบีบอัดอัตโนมัติไม่ให้เกิน 200 KB)
                </p>
              </div>
            ) : (
              /* URL Import */
              <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="space-y-1.5">
                  <label htmlFor="logo-url-input" className="text-xs font-semibold text-slate-700">
                    ที่อยู่ URL รูปภาพ (Image URL)
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="logo-url-input"
                      type="url"
                      placeholder="https://example.com/logo.png หรือ /faculty-logo.svg"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      className="flex-1 text-xs"
                    />
                    <Button type="button" size="sm" onClick={handleLoadUrl} className="gap-1.5 whitespace-nowrap">
                      <ImageIcon className="h-3.5 w-3.5" />
                      <span>โหลดภาพ</span>
                    </Button>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-2xs font-semibold uppercase tracking-wider text-slate-400">
                    หรือเลือกตราสัญลักษณ์มาตรฐาน:
                  </span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setImageSrc("/faculty-logo.svg")}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:border-rose-400 hover:text-rose-600 shadow-2xs"
                    >
                      <img src="/faculty-logo.svg" alt="" className="h-4 w-4 object-contain" />
                      <span>ตราสัญลักษณ์คณะบัณฑิตศึกษาตัวอย่าง (faculty-logo.svg)</span>
                    </button>
                    {currentLogoUrl && (
                      <button
                        type="button"
                        onClick={() => setImageSrc(currentLogoUrl)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:border-rose-400 hover:text-rose-600 shadow-2xs"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>ใช้รูปภาพโลโก้เดิมในระบบ</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Step 2: Interactive Editor Controls */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Interactive Canvas Viewport */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-900 rounded-xl p-3 relative overflow-hidden border border-slate-800 shadow-inner">
              <div className="relative cursor-grab active:cursor-grabbing max-w-full">
                <canvas
                  ref={canvasRef}
                  width={360}
                  height={360}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className="rounded-lg shadow-md touch-none max-w-full h-auto block"
                />
              </div>

              {/* Floating Canvas Quick Actions */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 shadow-lg text-white text-xs">
                <button
                  type="button"
                  onClick={handleResetCenter}
                  title="ปรับตรงกลาง (Reset Center)"
                  className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800 transition-colors"
                >
                  <Move className="h-3.5 w-3.5 text-rose-400" />
                  <span>กึ่งกลาง</span>
                </button>
                <div className="h-3 w-px bg-slate-700" />
                <button
                  type="button"
                  onClick={handleRotate90}
                  title="หมุนตามเข็ม 90 องศา"
                  className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800 transition-colors"
                >
                  <RotateCw className="h-3.5 w-3.5 text-rose-400" />
                  <span>หมุน 90°</span>
                </button>
                <div className="h-3 w-px bg-slate-700" />
                <button
                  type="button"
                  onClick={() => setZoom(1.0)}
                  title="รีเซ็ตขนาดปกติ 100%"
                  className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800 transition-colors"
                >
                  <Maximize2 className="h-3.5 w-3.5 text-rose-400" />
                  <span>100%</span>
                </button>
              </div>
            </div>

            {/* Right: Fine-Tuning Tool Sliders & Size Check */}
            <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                {/* 1. ครอบภาพ (Crop Aspect Ratio) */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1.5">
                    <Crop className="h-3.5 w-3.5 text-rose-600" />
                    <span>สัดส่วนครอบภาพ (Crop Aspect Ratio)</span>
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(
                      [
                        { id: "1:1", label: "จัตุรัส 1:1" },
                        { id: "4:3", label: "4:3" },
                        { id: "16:9", label: "16:9" },
                        { id: "free", label: "อิสระ" },
                      ] as const
                    ).map((ratio) => (
                      <button
                        key={ratio.id}
                        type="button"
                        onClick={() => setAspectRatio(ratio.id)}
                        className={`px-2 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                          aspectRatio === ratio.id
                            ? "bg-rose-50 border-rose-600 text-rose-700 shadow-2xs"
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        {ratio.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. ย่อ / ขยาย (Zoom / Scale) */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <label className="font-bold text-slate-800 flex items-center gap-1.5">
                      <ZoomIn className="h-3.5 w-3.5 text-rose-600" />
                      <span>ย่อ / ขยาย (Zoom)</span>
                    </label>
                    <span className="font-mono text-slate-500 font-semibold">
                      {Math.round(zoom * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setZoom((z) => Math.max(0.2, Number((z - 0.1).toFixed(2))))}
                      className="p-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-100"
                    >
                      <ZoomOut className="h-3.5 w-3.5" />
                    </button>
                    <input
                      type="range"
                      min={0.2}
                      max={3.0}
                      step={0.05}
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="flex-1 accent-rose-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => setZoom((z) => Math.min(3.0, Number((z + 0.1).toFixed(2))))}
                      className="p-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-100"
                    >
                      <ZoomIn className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* 3. ปรับความเอียง (Rotate / Tilt) */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <label className="font-bold text-slate-800 flex items-center gap-1.5">
                      <RotateCw className="h-3.5 w-3.5 text-rose-600" />
                      <span>ปรับความเอียง (Tilt / Rotate)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setRotation(0)}
                      className="text-2xs text-rose-600 hover:underline font-mono font-semibold"
                    >
                      {rotation}° (รีเซ็ต)
                    </button>
                  </div>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    step={1}
                    value={rotation}
                    onChange={(e) => setRotation(parseInt(e.target.value, 10))}
                    className="w-full accent-rose-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-3xs text-slate-400 font-mono mt-0.5">
                    <span>-180°</span>
                    <span>0°</span>
                    <span>+180°</span>
                  </div>
                </div>

                {/* 4. ปรับตรงกลาง (Pan Offset) */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Move className="h-4 w-4 text-slate-500" />
                    <div>
                      <p className="font-bold text-slate-800 m-0">ปรับตำแหน่งตรงกลาง</p>
                      <p className="text-2xs text-slate-500 m-0">
                        คลิกลากภาพในกรอบเพื่อเลื่อน หรือคลิกปุ่มจัดกึ่งกลาง
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResetCenter}
                    className="h-7 text-2xs font-semibold whitespace-nowrap bg-white"
                  >
                    จัดกึ่งกลาง
                  </Button>
                </div>
              </div>

              {/* 5. ปรับขนาดภาพให้ไม่เกิน 200 KB (File Size Meter & Assurance) */}
              <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">ขนาดไฟล์หลังปรับแต่ง:</span>
                  {processedResult && (
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-bold ${
                        processedResult.sizeBytes <= MAX_BYTES
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {processedResult.sizeBytes <= MAX_BYTES ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 text-rose-600" />
                      )}
                      {(processedResult.sizeBytes / 1024).toFixed(1)} KB / 200 KB
                    </span>
                  )}
                </div>

                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      (processedResult?.sizeBytes ?? 0) <= MAX_BYTES
                        ? "bg-emerald-500"
                        : "bg-rose-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round(((processedResult?.sizeBytes ?? 0) / MAX_BYTES) * 100)
                      )}%`,
                    }}
                  />
                </div>
                <p className="text-3xs text-slate-400 m-0">
                  ⚡ ระบบบีบอัดภาพความละเอียดสูงให้อยู่ในเกณฑ์มาตรฐานสากล (&le; 200 KB) เสมอ
                </p>

                {/* Reset or choose new image */}
                <div className="pt-2 flex justify-between items-center text-2xs">
                  <button
                    type="button"
                    onClick={() => setImageSrc(null)}
                    className="text-slate-500 hover:text-rose-600 underline"
                  >
                    เลือกภาพอื่น
                  </button>
                  <span className="text-slate-400">
                    ฟอร์แมต: {processedResult?.format === "image/png" ? "PNG (โปร่งใส)" : "JPEG (บีบอัดคุณภาพ)"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </LiyonDialogBody>

      <LiyonDialogFooter className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isProcessing}
        >
          ยกเลิก
        </Button>

        {imageSrc && (
          <Button
            type="button"
            onClick={handleApply}
            disabled={isProcessing || (processedResult?.sizeBytes ?? 0) > MAX_BYTES}
            className="gap-1.5"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>กำลังประมวลผล...</span>
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>นำไปใช้เป็นโลโก้องค์กร</span>
              </>
            )}
          </Button>
        )}
      </LiyonDialogFooter>
    </LiyonDialog>
  );
}
