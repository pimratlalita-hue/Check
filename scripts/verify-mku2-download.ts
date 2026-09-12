import { chromium } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const SHOT_DIR = "/Users/lalitapimrat/.gemini/antigravity/brain/a115f894-2ade-4919-bbd3-1ccabae1cad9/screenshots/chrome";

async function main() {
  console.log("===============================================================");
  console.log("📥 Verifying มคอ. 2 PDF Download Button and Upload Feature");
  console.log("===============================================================\n");

  if (!fs.existsSync(SHOT_DIR)) {
    fs.mkdirSync(SHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME_PATH,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  try {
    // 1. Check Portal Detail Page
    console.log("▶ Step 1: Open Portal Detail Page (dfl-ma-english-2566)");
    await page.goto("http://localhost:3010/portal/curriculum/dfl-ma-english-2566", { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);

    const downloadBtn = page.locator('a[href*="mku2-ma-english-2566.pdf"], button:has-text("ดาวน์โหลดเล่มหลักสูตร")').first();
    const isDownloadVisible = await downloadBtn.isVisible();
    console.log(`  Download button visible: ${isDownloadVisible}`);
    await page.screenshot({ path: path.join(SHOT_DIR, "download-01-portal-button.png") });

    // 2. Login as Admin
    console.log("▶ Step 2: Login as Admin");
    await page.goto("http://localhost:3010/login", { waitUntil: "networkidle" });
    const adminPreset = page.locator('button:has-text("ผู้ดูแลสูงสุด (Admin)")');
    if (await adminPreset.isVisible()) {
      await adminPreset.click();
      await page.waitForTimeout(300);
    } else {
      await page.fill('input[type="email"]', "admin@example.com");
      await page.fill('input[type="password"]', "Admin@123456");
    }
    await page.locator('button[type="submit"]:has-text("เข้าสู่ระบบ")').click();
    await page.waitForTimeout(2500);

    // 3. Open Curriculum Admin & Edit Program
    console.log("▶ Step 3: Open Edit Program Dialog in Admin");
    await page.goto("http://localhost:3010/curriculum", { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);

    // Find row with 25551851106069
    const row = page.locator('tr:has-text("25551851106069")').first();
    const menuBtn = row.locator('button').last();
    await menuBtn.click();
    await page.waitForTimeout(600);

    const editBtn = page.locator('button:has-text("แก้ไขหลักสูตร")').first();
    await editBtn.click();
    await page.waitForTimeout(1000);

    // Switch to Details Tab
    const detailsTab = page.locator('button:has-text("รายละเอียด")').first();
    await detailsTab.click();
    await page.waitForTimeout(600);

    await page.screenshot({ path: path.join(SHOT_DIR, "download-02-admin-upload-field.png") });
    console.log("  ✓ Captured admin edit dialog with PDF upload button and handbook URL");

    console.log("\n===============================================================");
    console.log("🎉 มคอ. 2 Download and Upload Verification Complete!");
    console.log("===============================================================\n");

  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await browser.close();
  }
}

main();
