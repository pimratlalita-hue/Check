import { chromium, type Page } from "@playwright/test";
import * as path from "path";

async function verify() {
  let browser;
  let page: Page;

  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const context = await browser.newContext();
    page = await context.newPage();
  } catch (err) {
    console.error("Failed to launch chromium:", err);
    return;
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  const shotDir = "/Users/lalitapimrat/.gemini/antigravity/brain/a115f894-2ade-4919-bbd3-1ccabae1cad9/screenshots";

  console.log("1. Navigating to login...");
  await page.goto("http://localhost:3010/login", { waitUntil: "networkidle" });
  const emailInput = page.locator("#email, input[type='email']");
  if (await emailInput.isVisible()) {
    const adminBtn = page.locator('button:has-text("ผู้ดูแลสูงสุด (Admin)")');
    if (await adminBtn.isVisible()) {
      await adminBtn.click();
    } else {
      await emailInput.fill("admin@app.local");
      await page.locator("#password, input[type='password']").fill("Passw0rd!vibe");
    }
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle", timeout: 15000 }).catch(() => {}),
      page.locator('button[type="submit"]').click(),
    ]);
  }

  console.log("2. Navigating to /settings...");
  await page.goto("http://localhost:3010/settings", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // Check Admin Navbar Brand Name
  const adminBrandEl = page.locator("a.brand-blk");
  const adminBrandText = await adminBrandEl.innerText();
  console.log("Admin Brand Text in /settings:", JSON.stringify(adminBrandText));
  await page.screenshot({ path: path.join(shotDir, "25-admin-navbar-orgname.png") });

  console.log("3. Navigating to /portal/news...");
  await page.goto("http://localhost:3010/portal/news", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  const portalBrandEl = page.locator("header a[href='/portal/news'] div.font-bold");
  const portalBrandText = await portalBrandEl.innerText();
  console.log("Portal Brand Text in /portal/news:", JSON.stringify(portalBrandText));
  await page.screenshot({ path: path.join(shotDir, "26-portal-navbar-orgname.png") });

  console.log("4. Testing live update of Organization Name in /settings...");
  await page.goto("http://localhost:3010/settings", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  const nameThInput = page.locator("#s-name-th");
  const nameEnInput = page.locator("#s-name-en");

  // Fill custom updated organization name
  const updatedNameTh = "คณะมนุษยศาสตร์ (GTMTS)";
  const updatedNameEn = "Faculty of Humanities (GTMTS)";

  await nameThInput.fill(updatedNameTh);
  await nameEnInput.fill(updatedNameEn);

  console.log("Clicking Save button...");
  await page.locator('button:has-text("บันทึก")').last().click();
  await page.waitForTimeout(2000);

  const updatedAdminBrand = await page.locator("a.brand-blk").innerText();
  console.log("Updated Admin Brand Text:", JSON.stringify(updatedAdminBrand));
  await page.screenshot({ path: path.join(shotDir, "27-settings-saved-new-orgname.png") });

  console.log("5. Navigating to /portal/news to verify updated name in Portal...");
  await page.goto("http://localhost:3010/portal/news", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  const updatedPortalBrand = await page.locator("header a[href='/portal/news'] div.font-bold").innerText();
  console.log("Updated Portal Brand Text:", JSON.stringify(updatedPortalBrand));
  await page.screenshot({ path: path.join(shotDir, "28-portal-updated-orgname.png") });

  console.log("Verification completed successfully!");
  await browser.close();
}

verify().catch(console.error);
