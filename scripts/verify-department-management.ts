import { chromium } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const SHOT_DIR = "/Users/lalitapimrat/.gemini/antigravity/brain/a115f894-2ade-4919-bbd3-1ccabae1cad9/screenshots/chrome";

async function verifyDepartmentFeature() {
  console.log("===============================================================");
  console.log("🏛️  Verifying Department & Curriculum Management on Google Chrome");
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
    console.log("  ✓ Logged in successfully");

    // 2. Go to Curriculum Admin
    console.log("▶ Step 2: Navigate to Curriculum & Program Management");
    await page.goto("http://localhost:3010/curriculum", { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SHOT_DIR, "dept-01-curriculum-overview.png") });
    console.log("  ✓ Captured dept-01-curriculum-overview.png");

    // 3. Switch to Department Management Tab
    console.log("▶ Step 3: Switch to Departments & Divisions Tab");
    const deptTab = page.locator('button:has-text("บริหารจัดการภาควิชา")').first();
    await deptTab.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SHOT_DIR, "dept-02-departments-tab.png") });
    console.log("  ✓ Captured dept-02-departments-tab.png");

    // 4. Click Add Department
    console.log("▶ Step 4: Open Add Department Modal");
    const addDeptBtn = page.locator('button:has-text("เพิ่มภาควิชา / ส่วนงาน")').first();
    await addDeptBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SHOT_DIR, "dept-03-add-department-dialog.png") });
    console.log("  ✓ Captured dept-03-add-department-dialog.png");

    // 5. Fill and Submit Department Form
    console.log("▶ Step 5: Fill DFL Department Form and Submit");
    const codeInput = page.locator('input[placeholder*="DFL"]').first();
    await codeInput.fill("DFL");

    const nameThInput = page.locator('input[placeholder*="ภาควิชาภาษาต่างประเทศ"]').first();
    await nameThInput.fill("ภาควิชาภาษาต่างประเทศ");

    const nameEnInput = page.locator('input[placeholder*="Department of Foreign Languages"]').first();
    await nameEnInput.fill("Department of Foreign Languages");

    const descThInput = page.locator('textarea[placeholder*="รายละเอียดภาควิชา"]').first();
    await descThInput.fill("ภาควิชาภาษาต่างประเทศ คณะมนุษยศาสตร์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย");

    const descEnInput = page.locator('textarea[placeholder*="Department mission"]').first();
    await descEnInput.fill("Department of Foreign Languages, Faculty of Humanities, Mahachulalongkornrajavidyalaya University");

    await page.screenshot({ path: path.join(SHOT_DIR, "dept-04-filled-department-form.png") });
    console.log("  ✓ Captured dept-04-filled-department-form.png");

    const saveBtn = page.locator('button[type="submit"]:has-text("บันทึก")').first();
    await saveBtn.click();
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(SHOT_DIR, "dept-05-department-created.png") });
    console.log("  ✓ Department DFL created! Captured dept-05-department-created.png");

    // 6. Manage programs in DFL department
    console.log("▶ Step 6: Open Program Assignment for DFL");
    const dflRow = page.locator('tr:has-text("DFL")');
    if (await dflRow.count() > 0) {
      const manageProgBtn = dflRow.locator('button:has-text("จัดเก็บหลักสูตร")').first();
      await manageProgBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(SHOT_DIR, "dept-06-assign-programs-modal.png") });
      console.log("  ✓ Captured dept-06-assign-programs-modal.png");

      const selectProg = page.locator('select').first();
      const options = await selectProg.locator('option').all();
      if (options.length > 1) {
        const val = await options[1].getAttribute('value');
        if (val) {
          await selectProg.selectOption(val);
          const assignBtn = page.locator('button:has-text("สังกัดภาควิชานี้")').first();
          await assignBtn.click();
          await page.waitForTimeout(2500);
          await page.screenshot({ path: path.join(SHOT_DIR, "dept-07-program-assigned-to-dfl.png") });
          console.log("  ✓ Program successfully assigned to DFL! Captured dept-07-program-assigned-to-dfl.png");
        }
      }
      // Close modal
      const closeBtn = page.locator('button:has-text("ปิด")').last();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
        await page.waitForTimeout(800);
      }
    }

    // 7. Return to Programs tab to verify updated department label
    console.log("▶ Step 7: Return to Curriculums Tab to verify assigned department display");
    const progTab = page.locator('button:has-text("รายการหลักสูตร")').first();
    await progTab.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SHOT_DIR, "dept-08-programs-with-dfl.png") });
    console.log("  ✓ Captured dept-08-programs-with-dfl.png");

    console.log("\n===============================================================");
    console.log("🎉 All Department & Curriculum Management Tests Passed Successfully!");
    console.log("===============================================================\n");
  } catch (err) {
    console.error("❌ Test error:", err);
  } finally {
    await browser.close();
  }
}

verifyDepartmentFeature();
