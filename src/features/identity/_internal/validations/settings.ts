import { z } from "zod";
import { PALETTE_IDS } from "@/shared/lib/palette";

export const smtpSettingsSchema = z.object({
  enabled: z.boolean().default(false),
  user: z.string().trim().email().or(z.literal("")).default(""),
  appPassword: z.string().trim().default(""),
  fromName: z.string().trim().default("GTMTS Graduate School"),
  port: z.coerce.number().default(587),
});

export const testSmtpSchema = z.object({
  user: z.string().trim().email("กรุณากรอกอีเมล Gmail ที่ถูกต้อง"),
  appPassword: z.string().trim().min(1, "กรุณากรอก Google App Password"),
  fromName: z.string().trim().default("GTMTS Graduate School"),
  port: z.coerce.number().default(587),
  recipient: z.string().trim().email("กรุณากรอกอีเมลปลายทางสำหรับทดสอบ"),
});

export const updateSettingsSchema = z.object({
  nameTh: z.string().trim().min(1).max(255),
  nameEn: z.string().trim().min(1).max(255),
  logoUrl: z
    .string()
    .trim()
    .max(500_000)
    .refine(
      (val) => val === "" || val.startsWith("/") || /^https?:\/\//i.test(val) || val.startsWith("data:image/"),
      { message: "Invalid URL or path" }
    )
    .default(""),
  palette: z.enum(PALETTE_IDS),
  smtp: smtpSettingsSchema.optional(),
});
export const updateProfileSchema = z.object({ name: z.string().trim().min(1).max(255), locale: z.enum(["th", "en"]) });
export type SmtpSettings = z.infer<typeof smtpSettingsSchema>;
export type TestSmtpInput = z.infer<typeof testSmtpSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
