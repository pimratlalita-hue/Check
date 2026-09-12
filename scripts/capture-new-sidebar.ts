import { chromium } from "@playwright/test";
import * as path from "path";

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const SHOT_DIR = "/Users/lalitapimrat/.gemini/antigravity/brain/a115f894-2ade-4919-bbd3-1ccabae1cad9/screenshots/chrome";

async function run() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME_PATH,
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Login
  await page.goto("http://localhost:3010/login", { waitUntil: "networkidle" });
  const adminPreset = page.locator('button:has-text("ผู้ดูแลสูงสุด (Admin)")');
  if (await adminPreset.isVisible()) {
    await adminPreset.click();
    await page.waitForTimeout(300);
  }
  await page.locator('button[type="submit"]:has-text("เข้าสู่ระบบ")').click();
  await page.waitForTimeout(2000);

  // Navigate to Dashboard
  await page.goto("http://localhost:3010/dashboard", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SHOT_DIR, "sidebar-01-dashboard.png") });

  // Expand "วิชาการและหลักสูตร"
  const academicMenu = page.locator('button:has-text("วิชาการและหลักสูตร")').first();
  if (await academicMenu.isVisible()) {
    await academicMenu.click();
    await page.waitForTimeout(600);
  }

  // Expand "วิทยานิพนธ์และการสอบ"
  const thesisMenu = page.locator('button:has-text("วิทยานิพนธ์และการสอบ")').first();
  if (await thesisMenu.isVisible()) {
    await thesisMenu.click();
    await page.waitForTimeout(600);
  }

  // Expand "การตั้งค่าและระบบ"
  const settingsMenu = page.locator('button:has-text("การตั้งค่าและระบบ")').first();
  if (await settingsMenu.isVisible()) {
    await settingsMenu.click();
    await page.waitForTimeout(600);
  }

  await page.screenshot({ path: path.join(SHOT_DIR, "sidebar-02-expanded-groups.png") });
  console.log("Captured sidebar screenshots successfully!");

  await browser.close();
}

run();
