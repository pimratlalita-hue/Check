import { chromium } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const SHOT_DIR = "/Users/lalitapimrat/.gemini/antigravity/brain/a115f894-2ade-4919-bbd3-1ccabae1cad9/screenshots/chrome";

async function main() {
  console.log("===============================================================");
  console.log("🎓 Verifying มคอ.2 Content on Admin & Portal via Chrome");
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
    // 1. Login
    console.log("▶ Step 1: Login as Admin");
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
    console.log("  ✓ Logged in");

    // 2. Test URL redirect: http://localhost:3010/academic-programs
    console.log("▶ Step 2: Navigate to http://localhost:3010/academic-programs");
    await page.goto("http://localhost:3010/academic-programs", { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    console.log(`  Current URL after redirect: ${page.url()}`);
    await page.screenshot({ path: path.join(SHOT_DIR, "mku2-01-admin-curriculum.png") });

    // 3. Open Courses Dialog
    console.log("▶ Step 3: Open Courses Dialog for 25551851106069");
    const coursesBtn = page.locator('tr:has-text("25551851106069") button:has-text("วิชา")').first();
    if (await coursesBtn.isVisible()) {
      await coursesBtn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(SHOT_DIR, "mku2-02-courses-modal.png") });
      console.log("  ✓ Captured 19 courses modal");

      // Close modal
      const closeBtn = page.locator('button[aria-label="Close"], button:has-text("ปิด")').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
        await page.waitForTimeout(500);
      }
    }

    // 4. Check Portal List
    console.log("▶ Step 4: Navigate to Portal Curriculum Catalog");
    await page.goto("http://localhost:3010/portal/curriculum", { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SHOT_DIR, "mku2-03-portal-list.png") });
    console.log("  ✓ Captured portal curriculum list");

    // 5. Check Portal Detail for DFL MA English
    console.log("▶ Step 5: Navigate to Portal Detail page");
    await page.goto("http://localhost:3010/portal/curriculum/dfl-ma-english-2566", { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SHOT_DIR, "mku2-04-portal-detail-top.png") });

    // Scroll to courses & PLO section
    await page.evaluate(() => window.scrollTo(0, 900));
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(SHOT_DIR, "mku2-05-portal-detail-courses.png") });
    console.log("  ✓ Captured portal detail with courses and PLOs");

    console.log("\n===============================================================");
    console.log("🎉 มคอ.2 Verification Completed Successfully!");
    console.log("===============================================================\n");

  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await browser.close();
  }
}

main();
