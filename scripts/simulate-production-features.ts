import { chromium } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const SHOT_DIR = "/Users/lalitapimrat/.gemini/antigravity/brain/a115f894-2ade-4919-bbd3-1ccabae1cad9/screenshots/chrome";

async function runSimulation() {
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

  console.log("1. Visiting /portal/petitions to test Document Upload Dropzone & Notification Bell...");
  await page.goto("http://localhost:3010/portal/petitions", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // Click on "ยื่นคำร้องใหม่" tab if not selected
  const submitTab = page.getByRole("tab", { name: /ยื่นคำร้อง|ขออนุมัติ/i });
  if (await submitTab.isVisible()) {
    await submitTab.click();
    await page.waitForTimeout(1000);
  }

  // Scroll down to dropzone
  await page.evaluate(() => window.scrollBy(0, 500));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SHOT_DIR, "prod-01-portal-document-upload.png") });
  console.log("   ✓ Saved prod-01-portal-document-upload.png");

  // 2. Open notification bell
  console.log("2. Testing Notification Bell in Portal...");
  const bellButton = page.locator("button[aria-label='การแจ้งเตือน']").first();
  if (await bellButton.isVisible()) {
    await bellButton.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SHOT_DIR, "prod-02-portal-notification-bell.png") });
    console.log("   ✓ Saved prod-02-portal-notification-bell.png");
  }

  // 3. Admin Login & Workflow Defense Evaluation
  console.log("3. Logging in as Admin to test Defense Evaluation Widget & Admin Notification Bell...");
  await page.goto("http://localhost:3010/login", { waitUntil: "networkidle" });
  const adminBtn = page.locator('button:has-text("👑 ผู้ดูแลสูงสุด (Admin)")');
  if (await adminBtn.isVisible()) {
    await adminBtn.click();
    await page.waitForTimeout(300);
    await page.locator('button[type="submit"]:has-text("เข้าสู่ระบบ")').click();
    await page.waitForTimeout(2500);
  } else {
    await page.fill("#email", "admin@vibe.local");
    await page.fill("#password", "admin1234");
    await page.click("button[type='submit']");
    await page.waitForTimeout(2500);
  }

  // Navigate to /workflow
  await page.goto("http://localhost:3010/workflow", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  // Click on the first row's review button or action
  const reviewBtn = page.locator("button:has-text('พิจารณา'), button:has-text('ตรวจสอบ')").first();
  if (await reviewBtn.isVisible()) {
    await reviewBtn.click();
    await page.waitForTimeout(1200);

    // Scroll review dialog to show DefenseEvaluationWidget
    await page.evaluate(() => {
      const modal = document.querySelector(".overflow-y-auto");
      if (modal) modal.scrollTop = 450;
    });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(SHOT_DIR, "prod-03-admin-defense-evaluation.png") });
    console.log("   ✓ Saved prod-03-admin-defense-evaluation.png");
  } else {
    await page.screenshot({ path: path.join(SHOT_DIR, "prod-03-admin-workflow-table.png") });
    console.log("   ✓ Saved prod-03-admin-workflow-table.png");
  }

  // 4. Admin Settings & Backup
  console.log("4. Visiting /backup...");
  await page.goto("http://localhost:3010/backup", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SHOT_DIR, "prod-04-backup-management.png") });
  console.log("   ✓ Saved prod-04-backup-management.png");

  await browser.close();
  console.log("Done verifying on Chrome!");
}

runSimulation().catch((err) => {
  console.error("Simulation failed:", err);
  process.exit(1);
});
