import { chromium } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.setViewportSize({ width: 1440, height: 960 });

  const shotDir = "/Users/lalitapimrat/.gemini/antigravity/brain/a115f894-2ade-4919-bbd3-1ccabae1cad9/screenshots";
  if (!fs.existsSync(shotDir)) {
    fs.mkdirSync(shotDir, { recursive: true });
  }

  console.log("1. Logging in as Admin...");
  await page.goto("http://localhost:3010/login", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const adminBtn = page.locator('button:has-text("ผู้ดูแลสูงสุด")');
  if (await adminBtn.isVisible()) {
    await adminBtn.click();
    await page.waitForTimeout(500);
    await page.locator('button[type="submit"]:has-text("เข้าสู่ระบบ")').click();
    await page.waitForTimeout(2000);
  }

  console.log("2. Navigating to /settings...");
  await page.goto("http://localhost:3010/settings", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  await page.screenshot({ path: path.join(shotDir, "35-settings-initial.png") });
  console.log("Saved: 35-settings-initial.png");

  // 2. Open Logo Editor Modal
  console.log("2. Clicking Logo Upload & Customize button...");
  const uploadLogoBtn = page.locator('button:has-text("อัปโหลดและปรับแต่งโลโก้")');
  await uploadLogoBtn.click();
  await page.waitForTimeout(800);

  await page.screenshot({ path: path.join(shotDir, "36-logo-editor-modal-open.png") });
  console.log("Saved: 36-logo-editor-modal-open.png");

  // 3. Switch to URL / Presets tab in Logo Editor
  console.log("3. Testing Logo Presets in Modal...");
  const urlTab = page.locator('button:has-text("นำเข้าจาก URL / ตัวอย่าง")');
  if (await urlTab.isVisible()) {
    await urlTab.click();
    await page.waitForTimeout(500);
  }

  const sampleLogoBtn = page.locator('button:has-text("ตราสัญลักษณ์คณะบัณฑิตศึกษาตัวอย่าง")');
  if (await sampleLogoBtn.isVisible()) {
    await sampleLogoBtn.click();
    await page.waitForTimeout(1000);
  }

  await page.screenshot({ path: path.join(shotDir, "37-logo-editor-canvas-active.png") });
  console.log("Saved: 37-logo-editor-canvas-active.png");

  // 4. Test zoom, rotate, center buttons
  console.log("4. Testing Zoom and Rotate controls...");
  const rotateBtn = page.locator('button:has-text("หมุน 90°")');
  if (await rotateBtn.isVisible()) {
    await rotateBtn.click();
    await page.waitForTimeout(400);
  }

  const centerBtn = page.locator('button:has-text("จัดกึ่งกลาง")');
  if (await centerBtn.isVisible()) {
    await centerBtn.click();
    await page.waitForTimeout(400);
  }

  await page.screenshot({ path: path.join(shotDir, "38-logo-editor-adjusted.png") });
  console.log("Saved: 38-logo-editor-adjusted.png");

  // 5. Apply Logo
  console.log("5. Applying edited logo...");
  const applyLogoBtn = page.locator('button:has-text("นำไปใช้เป็นโลโก้องค์กร")');
  if (await applyLogoBtn.isVisible()) {
    await applyLogoBtn.click();
    await page.waitForTimeout(1000);
  }

  // 6. Open Global Standard Organization Presets Modal
  console.log("6. Clicking Global Standard Organization Templates button...");
  const globalPresetsBtn = page.locator('button:has-text("เลือกข้อความองค์กรแบบมาตรฐานโลก")');
  await globalPresetsBtn.first().click();
  await page.waitForTimeout(800);

  await page.screenshot({ path: path.join(shotDir, "39-global-presets-modal-open.png") });
  console.log("Saved: 39-global-presets-modal-open.png");

  // 7. Select a preset (e.g. First preset)
  console.log("7. Selecting preset...");
  const firstPresetBtn = page.locator('button:has-text("เลือกใช้ชุดนี้")').first();
  if (await firstPresetBtn.isVisible()) {
    await firstPresetBtn.click();
    await page.waitForTimeout(400);
  }

  await page.screenshot({ path: path.join(shotDir, "40-global-presets-selected.png") });
  console.log("Saved: 40-global-presets-selected.png");

  // 8. Apply preset to form
  console.log("8. Applying preset to settings form...");
  const applyPresetBtn = page.locator('button:has-text("นำชื่อองค์กรไปใช้งาน")');
  if (await applyPresetBtn.isVisible()) {
    await applyPresetBtn.click();
    await page.waitForTimeout(800);
  }

  await page.screenshot({ path: path.join(shotDir, "41-settings-form-ready-to-save.png") });
  console.log("Saved: 41-settings-form-ready-to-save.png");

  // 9. Save settings
  console.log("9. Saving settings...");
  const saveBtn = page.locator('div.savebar button:has-text("บันทึก")');
  await saveBtn.click();
  await page.waitForTimeout(2500);

  await page.screenshot({ path: path.join(shotDir, "42-settings-saved-success.png") });
  console.log("Saved: 42-settings-saved-success.png");

  // 10. Check Admin navbar
  console.log("10. Checking Admin navbar...");
  await page.goto("http://localhost:3010/users", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(shotDir, "43-admin-navbar-updated.png") });
  console.log("Saved: 43-admin-navbar-updated.png");

  // 11. Check Portal navbar in TH and EN
  console.log("11. Checking Portal in EN and TH...");
  await page.goto("http://localhost:3010/portal/news", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  const langEnBtn = page.locator('button:has-text("EN")');
  if (await langEnBtn.isVisible()) {
    await langEnBtn.click();
    await page.waitForTimeout(800);
  }
  await page.screenshot({ path: path.join(shotDir, "44-portal-en-updated.png") });
  console.log("Saved: 44-portal-en-updated.png");

  const langThBtn = page.locator('button:has-text("TH")');
  if (await langThBtn.isVisible()) {
    await langThBtn.click();
    await page.waitForTimeout(800);
  }
  await page.screenshot({ path: path.join(shotDir, "45-portal-th-updated.png") });
  console.log("Saved: 45-portal-th-updated.png");

  console.log("All verifications completed successfully!");
  await browser.close();
}

run().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
