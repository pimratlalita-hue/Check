"use server";
import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { P } from "../../permissions";
import { requirePermission } from "../rbac";
import { updateSettingsSchema, testSmtpSchema, testGeminiApiSchema } from "../validations/settings";
import { getTenantSettings, updateTenantSettings, type TenantSettings } from "../services/tenant.service";
import nodemailer from "nodemailer";
import { GoogleGenAI } from "@google/genai";

export async function getSettingsAction(): Promise<ActionResult<TenantSettings>> {
  return runAction(async () => getTenantSettings((await requirePermission(P.settingsManage)).tenantId));
}

export async function updateSettingsAction(input: unknown): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(P.settingsManage);
    await updateTenantSettings({ tenantId: ctx.tenantId, actorId: ctx.userId, ...updateSettingsSchema.parse(input, { error: zodErrorMap(await getLocale()) }) });
    revalidatePath("/", "layout"); // data-palette บน <html> อ่านใหม่
  });
}

export async function testGmailSmtpAction(input: unknown): Promise<ActionResult<{ delivered: boolean; recipient: string }>> {
  return runAction(async () => {
    await requirePermission(P.settingsManage);
    const locale = await getLocale();
    const data = testSmtpSchema.parse(input, { error: zodErrorMap(locale) });

    const cleanPassword = data.appPassword.replace(/\s+/g, "");
    const transport = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: data.port,
      secure: data.port === 465,
      auth: {
        user: data.user,
        pass: cleanPassword,
      },
    });

    // 1. Verify connection credentials
    await transport.verify();

    // 2. Send formal verification email
    const subject = locale === "en"
      ? "🎓 [GTMTS] Gmail SMTP Connection Test Successful"
      : "🎓 [GTMTS] ทดสอบการเชื่อมต่อ Gmail SMTP สำเร็จเรียบร้อยแล้ว";

    const sender = `${data.fromName || "GTMTS Graduate School"} <${data.user}>`;

    await transport.sendMail({
      from: sender,
      to: data.recipient,
      subject,
      text: `การเชื่อมต่อ Gmail SMTP สำหรับระบบ GTMTS สำเร็จเรียบร้อยแล้ว\nบัญชี: ${data.user}\nเวลา: ${new Date().toLocaleString("th-TH")}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
          <div style="border-bottom: 2px solid #f43f5e; padding-bottom: 16px; margin-bottom: 20px;">
            <span style="font-size: 12px; font-weight: 700; color: #e11d48; text-transform: uppercase; letter-spacing: 0.05em;">Graduate Thesis Management and Tracking System</span>
            <h2 style="margin: 8px 0 0 0; color: #0f172a; font-size: 20px; font-weight: 700;">การเชื่อมต่อ Gmail SMTP สำเร็จ 100%</h2>
          </div>
          <p style="font-size: 15px; line-height: 1.6; color: #334155;">
            ยินดีด้วย! ระบบได้ทำการเชื่อมต่อผ่าน <strong>Google Gmail SMTP</strong> และส่งอีเมลทดสอบฉบับนี้เข้าสู่กล่องจดหมายของคุณเรียบร้อยแล้ว
          </p>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 14px;">
            <p style="margin: 4px 0; color: #475569;"><strong>บัญชี Gmail ผู้ส่ง:</strong> <span style="color: #0f172a;">${data.user}</span></p>
            <p style="margin: 4px 0; color: #475569;"><strong>ชื่อผู้ส่ง (Display Name):</strong> <span style="color: #0f172a;">${data.fromName}</span></p>
            <p style="margin: 4px 0; color: #475569;"><strong>พอร์ตที่ใช้งาน:</strong> <span style="color: #0f172a;">${data.port}</span></p>
            <p style="margin: 4px 0; color: #475569;"><strong>เวลาที่ทดสอบ:</strong> <span style="color: #0f172a;">${new Date().toLocaleString("th-TH")}</span></p>
          </div>
          <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
            ข้อความนี้ส่งจากการทดสอบในหน้า <em>การตั้งค่าระบบองค์กร (Organization Settings)</em> บัญชีนี้พร้อมสำหรับการส่งการแจ้งเตือนคำร้องวิทยานิพนธ์ กำหนดการสอบ และการกู้คืนรหัสผ่านของระบบ
          </p>
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #94a3b8;">
            &copy; 2026 Graduate Thesis Management and Tracking System (GTMTS)
          </div>
        </div>
      `,
    });

    return { delivered: true, recipient: data.recipient };
  });
}

export async function testGeminiApiAction(
  input: unknown
): Promise<ActionResult<{ success: boolean; model: string; reply: string }>> {
  return runAction(async () => {
    await requirePermission(P.settingsManage);
    const locale = await getLocale();
    const data = testGeminiApiSchema.parse(input, { error: zodErrorMap(locale) });

    const ai = new GoogleGenAI({ apiKey: data.apiKey });
    const model = data.model || "gemini-2.5-flash";

    const response = await ai.models.generateContent({
      model,
      contents: "สวัสดี Gemini นี่คือข้อความทดสอบการเชื่อมต่อ API จากระบบ GTMTS มจร. กรุณาตอบกลับสั้นๆ หนึ่งประโยคว่าพร้อมให้บริการ",
    });

    const reply = response.text?.trim() || "การเชื่อมต่อกับ Google Gemini สำเร็จเรียบร้อยแล้ว พร้อมให้บริการ";
    return {
      success: true,
      model,
      reply,
    };
  });
}

