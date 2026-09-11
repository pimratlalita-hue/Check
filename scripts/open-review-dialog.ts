import { chromium } from "@playwright/test";
import * as path from "path";

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const SHOT_DIR = "/Users/lalitapimrat/.gemini/antigravity/brain/a115f894-2ade-4919-bbd3-1ccabae1cad9/screenshots/chrome";

async function run() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME_PATH,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  // Login as admin
  await page.goto("http://localhost:3010/login", { waitUntil: "networkidle" });
  const adminBtn = page.locator('button:has-text("👑 ผู้ดูแลสูงสุด (Admin)")');
  if (await adminBtn.isVisible()) {
    await adminBtn.click();
    await page.waitForTimeout(300);
    await page.locator('button[type="submit"]:has-text("เข้าสู่ระบบ")').click();
    await page.waitForTimeout(2500);
  }

  // Go to workflow
  await page.goto("http://localhost:3010/workflow", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  // Click on "พิจารณาคำร้อง" for REQ-2026-0002 (defense exam request)
  const targetRow = page.locator("tr:has-text('REQ-2026-0002')");
  if (await targetRow.isVisible()) {
    await targetRow.locator("button:has-text('พิจารณาคำร้อง')").click();
  } else {
    await page.locator("button:has-text('พิจารณาคำร้อง')").first().click();
  }
  await page.waitForTimeout(1200);

  // Scroll modal dialog down to show the Defense Evaluation Widget
  await page.evaluate(() => {
    const dialogBody = document.querySelector(".max-h-\\[70vh\\]");
    if (dialogBody) {
      dialogBody.scrollTop = 500;
    }
  });
  await page.waitForTimeout(800);

  await page.screenshot({ path: path.join(SHOT_DIR, "prod-05-defense-evaluation-dialog.png") });
  console.log("Saved prod-05-defense-evaluation-dialog.png");

  // Scroll down a bit more to show committee signatures and Apply Verdict
  await page.evaluate(() => {
    const dialogBody = document.querySelector(".max-h-\\[70vh\\]");
    if (dialogBody) {
      dialogBody.scrollTop = 900;
    }
  });
  await page.waitForTimeout(800);

  await page.screenshot({ path: path.join(SHOT_DIR, "prod-06-defense-evaluation-signatures.png") });
  console.log("Saved prod-06-defense-evaluation-signatures.png");

  await browser.close();
}

run().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
