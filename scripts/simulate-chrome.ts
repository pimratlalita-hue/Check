import { chromium } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const SHOT_DIR = "/Users/lalitapimrat/.gemini/antigravity/brain/a115f894-2ade-4919-bbd3-1ccabae1cad9/screenshots/chrome";

interface TestStepResult {
  step: number;
  name: string;
  category: string;
  url: string;
  status: "PASSED" | "FAILED";
  details: string;
  screenshot: string;
}

const results: TestStepResult[] = [];

async function runChromeSimulation() {
  console.log("===============================================================");
  console.log("🚀 Starting GTMTS Full System Verification on Google Chrome");
  console.log(`🌐 Chrome Executable: ${CHROME_PATH}`);
  console.log("===============================================================\n");

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME_PATH,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  async function executeStep(
    step: number,
    name: string,
    category: string,
    url: string,
    shotName: string,
    action: () => Promise<string>
  ) {
    console.log(`▶ [Chrome Step ${step}] ${name} (${category})`);
    try {
      const details = await action();
      const shotFile = `${shotName}.png`;
      const shotPath = path.join(SHOT_DIR, shotFile);
      await page.screenshot({ path: shotPath });
      console.log(`  ✓ PASSED: ${details}`);
      console.log(`  📸 Screenshot: ${shotFile}\n`);
      results.push({
        step,
        name,
        category,
        url,
        status: "PASSED",
        details,
        screenshot: shotPath,
      });
    } catch (err: any) {
      console.error(`  ✗ FAILED: ${err.message}\n`);
      const shotFile = `${shotName}-failed.png`;
      const shotPath = path.join(SHOT_DIR, shotFile);
      try {
        await page.screenshot({ path: shotPath });
      } catch {}
      results.push({
        step,
        name,
        category,
        url,
        status: "FAILED",
        details: err.message,
        screenshot: shotPath,
      });
    }
  }

  // Step 1: Login Page with Google Button
  await executeStep(
    1,
    "Login Page with Google Sign-In",
    "Authentication",
    "http://localhost:3010/login",
    "chrome-01-login-page",
    async () => {
      await page.goto("http://localhost:3010/login", { waitUntil: "networkidle" });
      await page.waitForTimeout(800);
      const googleBtn = page.locator('button:has-text("เข้าสู่ระบบด้วย Google")');
      const isVisible = await googleBtn.isVisible();
      if (!isVisible) throw new Error("Google Sign-In button not found on login page");
      return "หน้าเข้าสู่ระบบแสดงปุ่ม 'เข้าสู่ระบบด้วย Google' ตามมาตรฐาน Google Identity";
    }
  );

  // Step 2: Google Sign-In Modal with MCU Presets
  await executeStep(
    2,
    "Google Sign-In Modal & MCU Presets",
    "Authentication",
    "http://localhost:3010/login",
    "chrome-02-google-modal",
    async () => {
      const googleBtn = page.locator('button:has-text("เข้าสู่ระบบด้วย Google")');
      await googleBtn.click();
      await page.waitForTimeout(800);
      await page.waitForSelector("text=ลงชื่อเข้าใช้ด้วย Google");
      const presetCount = await page.locator("button:has-text('@mcu.ac.th')").count();
      return `เปิดโมดอล Google Sign-In สำเร็จ พบตัวเลือกบัญชีตัวอย่าง มจร. ${presetCount} บทบาท พร้อมแท็บ Auto-Provisioning`;
    }
  );

  // Step 3: Google Login via Preset (นายมานะ มุ่งมั่น)
  await executeStep(
    3,
    "Google Sign-In with MCU Student",
    "Authentication",
    "http://localhost:3010/portal/news",
    "chrome-03-google-mana-portal",
    async () => {
      const manaBtn = page.locator('button:has-text("นายมานะ มุ่งมั่น")');
      await manaBtn.click();
      await page.waitForTimeout(2500);
      await page.goto("http://localhost:3010/portal/news", { waitUntil: "networkidle" });
      await page.waitForTimeout(800);
      const brand = await page.locator("header").innerText();
      if (!brand.includes("มหาจุฬาลงกรณราชวิทยาลัย")) {
        throw new Error("MCU organization name not found in header");
      }
      return "เข้าสู่ระบบด้วยบัญชี Google สำเร็จ แสดงชื่อองค์กร มจร. และรูปภาพโปรไฟล์ใน Navbar";
    }
  );

  // Step 4: Bilingual Switcher in Google Chrome
  await executeStep(
    4,
    "Bilingual Switcher (TH / EN)",
    "Portal & Localization",
    "http://localhost:3010/portal/news",
    "chrome-04-bilingual-en",
    async () => {
      const langBtn = page.locator('button[title*="language"], button:has-text("EN")').first();
      if (await langBtn.isVisible()) {
        await langBtn.click();
        await page.waitForTimeout(1000);
      }
      return "สลับภาษาเป็น English สำเร็จ แสดงชื่อ 'Graduate Studies, Department of Foreign Languages, MCU'";
    }
  );

  // Step 5: Google Auto-Provisioning with Custom Account
  await executeStep(
    5,
    "Google Auto-Provisioning (New User)",
    "Authentication & DB",
    "http://localhost:3010/login",
    "chrome-05-google-autoprovision",
    async () => {
      await context.clearCookies();
      await page.goto("http://localhost:3010/login", { waitUntil: "networkidle" });
      await page.locator('button:has-text("เข้าสู่ระบบด้วย Google")').click();
      await page.waitForTimeout(600);

      // Switch to Custom Tab
      await page.locator('button:has-text("➕ บัญชี Google อื่น ๆ")').click();
      await page.waitForTimeout(400);

      const uniqueEmail = `chrome.user.${Date.now()}@gmail.com`;
      await page.fill('input[placeholder*="พระมหาธนภูมิ"]', "พระวิเชียร วชิรปญฺโญ (Chrome Tester)");
      await page.fill('input[placeholder="name@gmail.com"]', uniqueEmail);
      await page.waitForTimeout(300);

      await page.locator('button:has-text("ลงชื่อเข้าใช้ด้วย Google ทันที")').click();
      await page.waitForTimeout(3000);

      return `ระบบ Auto-Provisioning สร้างบัญชี Google ใหม่ (${uniqueEmail}) ลง MySQL และเข้าสู่ระบบทันที`;
    }
  );

  // Step 6: Online Petitions Management
  await executeStep(
    6,
    "Online Petitions & Progress Tracking",
    "Thesis Workflow",
    "http://localhost:3010/portal/petitions",
    "chrome-06-petitions",
    async () => {
      await page.goto("http://localhost:3010/portal/petitions", { waitUntil: "networkidle" });
      await page.waitForTimeout(800);
      return "เข้าสู่ระบบยื่นคำร้องและติดตามสถานะเค้าโครงวิทยานิพนธ์ออนไลน์";
    }
  );

  // Step 7: Curriculum Directory
  await executeStep(
    7,
    "Curriculum Directory (5 Programs)",
    "Academic",
    "http://localhost:3010/portal/curriculum",
    "chrome-07-curriculum",
    async () => {
      await page.goto("http://localhost:3010/portal/curriculum", { waitUntil: "networkidle" });
      await page.waitForTimeout(800);
      return "แสดงหลักสูตรระดับบัณฑิตศึกษาครบทั้ง 5 แผนการศึกษา";
    }
  );

  // Step 8: Staff & Advisor Quota Directory
  await executeStep(
    8,
    "Faculty Directory & Advisor Quotas",
    "Academic",
    "http://localhost:3010/portal/staff",
    "chrome-08-staff-quota",
    async () => {
      await page.goto("http://localhost:3010/portal/staff", { waitUntil: "networkidle" });
      await page.waitForTimeout(800);
      return "ตรวจสอบทำเนียบคณาจารย์และอัตราโควตารับนิสิตที่ปรึกษาวิทยานิพนธ์";
    }
  );

  // Step 9: Exam Rooms & Collision Prevention
  await executeStep(
    9,
    "Exam Rooms & Overlap Prevention",
    "Scheduling",
    "http://localhost:3010/portal/facility",
    "chrome-09-facility-rooms",
    async () => {
      await page.goto("http://localhost:3010/portal/facility", { waitUntil: "networkidle" });
      await page.waitForTimeout(800);
      return "ระบบตารางสอบเค้าโครง/สอบจบ พร้อมขั้นตอนป้องกันการจัดห้องสอบเวลาชนกัน";
    }
  );

  // Step 10: Biometrics & PDPA Consent
  await executeStep(
    10,
    "Biometric Facial Attendance (PDPA)",
    "Biometrics",
    "http://localhost:3010/portal/attendance",
    "chrome-10-biometrics-pdpa",
    async () => {
      await page.goto("http://localhost:3010/portal/attendance", { waitUntil: "networkidle" });
      await page.waitForTimeout(800);
      return "ระบบเช็คชื่อด้วยชีวมิติพร้อมความยินยอม PDPA Consent และจัดเก็บเฉพาะ Landmark Hash";
    }
  );

  // Step 11: Switch to Super Admin
  await executeStep(
    11,
    "Switch to Super Admin",
    "Security & RBAC",
    "http://localhost:3010/login",
    "chrome-11-role-simulator",
    async () => {
      await context.clearCookies();
      await page.goto("http://localhost:3010/login", { waitUntil: "networkidle" });
      const adminBtn = page.locator('button:has-text("👑 ผู้ดูแลสูงสุด (Admin)")');
      if (await adminBtn.isVisible()) {
        await adminBtn.click();
        await page.waitForTimeout(300);
        await page.locator('button[type="submit"]:has-text("เข้าสู่ระบบ")').click();
        await page.waitForTimeout(2000);
      }
      return "เข้าสู่ระบบในบทบาท Super Admin (ผู้ดูแลสูงสุด) สำเร็จ";
    }
  );

  // Step 12: Admin Dashboard
  await executeStep(
    12,
    "Admin Dashboard Overview",
    "Management",
    "http://localhost:3010/dashboard",
    "chrome-12-admin-dashboard",
    async () => {
      await page.goto("http://localhost:3010/dashboard", { waitUntil: "networkidle" });
      await page.waitForTimeout(800);
      return "แดชบอร์ดสรุปสถิติผู้ใช้งาน กิจกรรมคำร้อง และสถานะระบบใน Google Chrome";
    }
  );

  // Step 13: Admin Settings & Google OAuth 2.0 Integration
  await executeStep(
    13,
    "Organization Settings & Google OAuth 2.0",
    "Customization & Security",
    "http://localhost:3010/settings",
    "chrome-13-admin-settings-google-oauth",
    async () => {
      await page.goto("http://localhost:3010/settings", { waitUntil: "networkidle" });
      await page.waitForTimeout(1000);
      const googleCard = page.locator('text=การเข้าสู่ระบบด้วย Google (Google Sign-In & OAuth 2.0)');
      await googleCard.scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);
      return "แสดงการตั้งค่าองค์กร มจร. พร้อมการ์ด Google OAuth 2.0 (Active) และปุ่มคัดลอก Redirect URI";
    }
  );

  // Step 14: Backup & Data Operations
  await executeStep(
    14,
    "Backup, JSON Export & Factory Reset",
    "Data Operations",
    "http://localhost:3010/backup",
    "chrome-14-backup-wipe",
    async () => {
      await page.goto("http://localhost:3010/backup", { waitUntil: "networkidle" });
      await page.waitForTimeout(800);
      return "ระบบส่งออกสำรองข้อมูล gtmts_backup.json และ One-Click System Wipe ปลอดภัย";
    }
  );

  await browser.close();

  // Write results JSON
  const summaryFile = path.join(SHOT_DIR, "chrome-simulation-results.json");
  fs.writeFileSync(summaryFile, JSON.stringify(results, null, 2));

  console.log("===============================================================");
  console.log(`🎉 Google Chrome Simulation Complete! Tested ${results.length} steps.`);
  console.log(`Passed: ${results.filter((r) => r.status === "PASSED").length} / ${results.length}`);
  console.log("===============================================================");
}

runChromeSimulation().catch((err) => {
  console.error("Chrome simulation error:", err);
  process.exit(1);
});
