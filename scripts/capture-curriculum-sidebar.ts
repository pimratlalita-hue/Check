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

  // Navigate to /curriculum
  await page.goto("http://localhost:3010/curriculum", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(SHOT_DIR, "sidebar-03-curriculum-auto-expanded.png") });
  console.log("Captured curriculum auto-expanded sidebar successfully!");

  await browser.close();
}

run();
