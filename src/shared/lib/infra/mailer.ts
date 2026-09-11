import "server-only";
import nodemailer from "nodemailer";
import { env, smtpConfigured } from "./env";
import { logger } from "./logger";

export interface SmtpConfig {
  host?: string;
  port?: number;
  user?: string;
  pass?: string;
  fromName?: string;
  secure?: boolean;
}

export interface MailInput {
  to: string;
  subject: string;
  text: string;
  html?: string;
  smtp?: SmtpConfig;
}

/** ไม่มี SMTP → เขียนลง log ระดับ info แล้วคืน delivered:false — ระบบต้องไม่ล้มเพราะส่งอีเมลไม่ได้ */
export async function sendMail(input: MailInput): Promise<{ delivered: boolean }> {
  // 1. If explicit tenant Gmail SMTP is provided
  if (input.smtp?.user && input.smtp?.pass) {
    try {
      const cleanPass = input.smtp.pass.replace(/\s+/g, "");
      const transport = nodemailer.createTransport({
        service: "gmail",
        host: input.smtp.host || "smtp.gmail.com",
        port: input.smtp.port || 587,
        secure: input.smtp.port === 465,
        auth: { user: input.smtp.user, pass: cleanPass },
      });
      const sender = `${input.smtp.fromName || "GTMTS"} <${input.smtp.user}>`;
      await transport.sendMail({ from: sender, to: input.to, subject: input.subject, text: input.text, html: input.html });
      return { delivered: true };
    } catch (err) {
      logger.error("tenant gmail mail send failed", { to: input.to, err: err instanceof Error ? err.message : String(err) });
      return { delivered: false };
    }
  }

  // 2. Fallback to system env SMTP
  if (!smtpConfigured()) {
    logger.info("mail (no SMTP, logged only)", { to: input.to, subject: input.subject, text: input.text });
    return { delivered: false };
  }
  const e = env();
  try {
    const transport = nodemailer.createTransport({
      host: e.SMTP_HOST, port: e.SMTP_PORT, secure: e.SMTP_PORT === 465,
      auth: e.SMTP_USER ? { user: e.SMTP_USER, pass: e.SMTP_PASS } : undefined,
    });
    await transport.sendMail({ from: e.SMTP_FROM, to: input.to, subject: input.subject, text: input.text, html: input.html });
    return { delivered: true };
  } catch (err) {
    logger.error("mail send failed", { to: input.to, err: err instanceof Error ? err.message : String(err) });
    return { delivered: false };
  }
}
