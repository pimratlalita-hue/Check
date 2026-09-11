"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X, UserPlus, Sparkles, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";

interface GoogleAccount {
  name: string;
  email: string;
  roleTitle: string;
  roleCode: "STUDENT" | "ADVISOR" | "COMMITTEE_CHAIR" | "DEAN_OFFICE" | "SUPER_ADMIN";
  avatarBg: string;
  avatarText: string;
  badgeColor: string;
}

const PRESET_ACCOUNTS: GoogleAccount[] = [
  {
    name: "นายมานะ มุ่งมั่น",
    email: "mana.student@mcu.ac.th",
    roleTitle: "นิสิตบัณฑิตศึกษา (Student)",
    roleCode: "STUDENT",
    avatarBg: "bg-blue-600",
    avatarText: "ม",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    name: "ผศ.ดร.สมชาย ใจดี",
    email: "somchai.advisor@mcu.ac.th",
    roleTitle: "อาจารย์ที่ปรึกษา (Advisor)",
    roleCode: "ADVISOR",
    avatarBg: "bg-amber-600",
    avatarText: "ส",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
  },
  {
    name: "ศ.ดร.วิชาการ เข้มงวด",
    email: "wichakan.chair@mcu.ac.th",
    roleTitle: "ประธานหลักสูตร (Chair)",
    roleCode: "COMMITTEE_CHAIR",
    avatarBg: "bg-indigo-600",
    avatarText: "ว",
    badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
  {
    name: "เจ้าหน้าที่บัณฑิตวิทยาลัย",
    email: "dean.officer@mcu.ac.th",
    roleTitle: "เจ้าหน้าที่บัณฑิตฯ (Dean)",
    roleCode: "DEAN_OFFICE",
    avatarBg: "bg-emerald-600",
    avatarText: "จ",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  {
    name: "ผู้ดูแลระบบสูงสุด (Super Admin)",
    email: "admin.central@mcu.ac.th",
    roleTitle: "ผู้ดูแลระบบ (Admin)",
    roleCode: "SUPER_ADMIN",
    avatarBg: "bg-rose-600",
    avatarText: "ผ",
    badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
  },
];

function GoogleSvgLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
      />
    </svg>
  );
}

export function GoogleSignInModal({
  isOpen,
  onClose,
  callbackUrl = "/portal/news",
}: {
  isOpen: boolean;
  onClose: () => void;
  callbackUrl?: string;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"preset" | "custom" | "live">("preset");
  const [loading, setLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  // Custom User Inputs
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [customRole, setCustomRole] = useState<GoogleAccount["roleCode"]>("STUDENT");

  if (!isOpen) return null;

  async function handleFastSignIn(account: {
    email: string;
    name: string;
    roleCode: string;
    avatarUrl?: string;
  }) {
    setLoading(true);
    setSelectedEmail(account.email);
    try {
      const avatar =
        account.avatarUrl ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          account.name
        )}&backgroundColor=4285f4,34a853,fbbc05,ea4335`;

      const result = await signIn("credentials", {
        redirect: false,
        email: account.email,
        name: account.name,
        image: avatar,
        roleCode: account.roleCode,
        isGoogleFastAuth: "true",
        callbackUrl,
      });

      if (result?.error) {
        toast.error("เข้าสู่ระบบด้วย Google ไม่สำเร็จ: " + result.error);
        setLoading(false);
        setSelectedEmail(null);
        return;
      }

      toast.success(`ลงชื่อเข้าใช้สำเร็จด้วยบัญชี Google: ${account.name}`);
      onClose();
      const targetUrl = callbackUrl || "/portal/news";
      router.push(targetUrl);
      router.refresh();
    } catch (err: any) {
      toast.error("เกิดข้อผิดพลาดในการเข้าสู่ระบบ: " + (err?.message || "Unknown error"));
      setLoading(false);
      setSelectedEmail(null);
    }
  }

  async function handleLiveGoogleOAuth() {
    setLoading(true);
    try {
      await signIn("google", { callbackUrl });
    } catch (err: any) {
      toast.error("ไม่สามารถเชื่อมต่อ Google OAuth: " + (err?.message || "Unknown error"));
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl shadow-xs">
              <GoogleSvgLogo className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                ลงชื่อเข้าใช้ด้วย Google
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Auto-Provisioning
                </span>
              </h3>
              <p className="text-xs text-slate-500 line-clamp-1">
                บัณฑิตศึกษา ภาควิชาภาษาต่างประเทศ คณะมนุษยศาสตร์ มจร.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab("preset")}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "preset"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            🧑‍🎓 บัญชีตัวอย่าง มจร.
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("custom")}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "custom"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            ➕ บัญชี Google อื่น ๆ
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("live")}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "live"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            🌐 Live Google Cloud
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Tab 1: Preset Accounts */}
          {activeTab === "preset" && (
            <div className="space-y-2.5">
              <p className="text-xs text-slate-600 mb-2">
                เลือกบัญชี Google เพื่อเข้าสู่ระบบในบทบาทที่ต้องการทันที:
              </p>
              {PRESET_ACCOUNTS.map((acc) => {
                const isSelected = selectedEmail === acc.email;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      handleFastSignIn({
                        email: acc.email,
                        name: acc.name,
                        roleCode: acc.roleCode,
                      })
                    }
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all text-left group cursor-pointer ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/70 ring-2 ring-blue-500/20"
                        : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-full ${acc.avatarBg} text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0`}
                      >
                        {acc.avatarText}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                          {acc.name}
                        </div>
                        <div className="text-xs text-slate-500 font-mono truncate">
                          {acc.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${acc.badgeColor}`}
                      >
                        {acc.roleTitle}
                      </span>
                      {loading && isSelected ? (
                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                      ) : (
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Tab 2: Custom Google Account */}
          {activeTab === "custom" && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  ระบบ Auto-Provisioning สำหรับ Google Sign-in
                </div>
                <p className="text-blue-700 leading-relaxed">
                  หากอีเมลยังไม่เคยมีในระบบ ระบบจะสร้างบัญชีผู้ใช้ใหม่ในตารางฐานข้อมูล ผูกกับองค์กร
                  มจร. และกำหนดบทบาทให้อัตโนมัติทันที
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อ - นามสกุล (Google Display Name)
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="เช่น พระมหาธนภูมิ ญาณวีโร หรือ Somchai Doe"
                    className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    อีเมล Google (@gmail.com หรือ @mcu.ac.th) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    required
                    className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    บทบาทเริ่มต้นในระบบ (Assigned Role)
                  </label>
                  <select
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value as GoogleAccount["roleCode"])}
                    className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="STUDENT">🧑‍🎓 นิสิตบัณฑิตศึกษา (Graduate Student)</option>
                    <option value="ADVISOR">🎓 อาจารย์ที่ปรึกษาวิทยานิพนธ์ (Thesis Advisor)</option>
                    <option value="COMMITTEE_CHAIR">⚖️ ประธานหลักสูตร (Committee Chair)</option>
                    <option value="DEAN_OFFICE">🏛️ เจ้าหน้าที่บัณฑิตวิทยาลัย (Dean's Office)</option>
                    <option value="SUPER_ADMIN">👑 ผู้ดูแลระบบสูงสุด (Super Admin)</option>
                  </select>
                </div>

                <button
                  type="button"
                  disabled={loading || !customEmail.includes("@")}
                  onClick={() =>
                    handleFastSignIn({
                      email: customEmail.trim(),
                      name: customName.trim() || customEmail.split("@")[0],
                      roleCode: customRole,
                    })
                  }
                  className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      กำลังเข้าสู่ระบบและสร้างบัญชี...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      ลงชื่อเข้าใช้ด้วย Google ทันที
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Live Google Cloud OAuth */}
          {activeTab === "live" && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-700">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  เชื่อมต่อไปยังเซิร์ฟเวอร์ Google Cloud โดยตรง
                </div>
                <p className="leading-relaxed">
                  โหมดนี้จะส่งคำขอไปยัง <code>accounts.google.com</code> ผ่าน Google OAuth 2.0 Client ID จริง
                  เหมาะสำหรับการใช้งานในสภาพแวดล้อมจริง (Production หรือเมื่อมี Google Client ID)
                </p>
                <div className="pt-2 border-t border-slate-200/60 flex flex-col gap-1 text-[11px] text-slate-500">
                  <div>
                    <strong>Redirect URI:</strong>{" "}
                    <code className="bg-white px-1.5 py-0.5 rounded border text-blue-700 font-mono">
                      http://localhost:3010/api/auth/callback/google
                    </code>
                  </div>
                  <div>
                    <strong>JavaScript Origin:</strong>{" "}
                    <code className="bg-white px-1.5 py-0.5 rounded border text-blue-700 font-mono">
                      http://localhost:3010
                    </code>
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={handleLiveGoogleOAuth}
                className="w-full py-2.5 px-4 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                ) : (
                  <GoogleSvgLogo className="w-5 h-5" />
                )}
                <span>เชื่อมต่อ Google OAuth 2.0 (Live Redirect)</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>ปลอดภัยตามมาตรฐานความปลอดภัย OAuth 2.0 & PDPA</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
}
