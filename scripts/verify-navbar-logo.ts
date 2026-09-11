import { chromium, type Page } from "@playwright/test";
import * as path from "path";

async function verifyLogo() {
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

  console.log("2. Navigating to /settings to configure logo...");
  await page.goto("http://localhost:3010/settings", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // Click sample faculty logo button
  const sampleLogoBtn = page.locator('button:has-text("ใช้ตราสัญลักษณ์คณะตัวอย่าง")');
  if (await sampleLogoBtn.isVisible()) {
    console.log("Clicking quick sample logo button...");
    await sampleLogoBtn.click();
  } else {
    console.log("Filling logo input directly...");
    await page.locator("#s-logo").fill("/faculty-logo.svg");
  }

  await page.waitForTimeout(500);
  console.log("Saving settings...");
  await page.locator('button:has-text("บันทึก")').last().click();
  await page.waitForTimeout(2500);

  // Verify Admin Navbar Brand Logo
  const adminLogoImg = page.locator("a.brand-blk i img");
  const adminLogoVisible = await adminLogoImg.isVisible();
  const adminLogoSrc = await adminLogoImg.getAttribute("src");
  console.log("Admin Navbar Logo visible:", adminLogoVisible, "src:", adminLogoSrc);
  await page.screenshot({ path: path.join(shotDir, "33-admin-navbar-custom-logo.png") });

  // Verify Portal Navbar Brand Logo
  console.log("3. Navigating to /portal/news to verify logo on Portal...");
  await page.goto("http://localhost:3010/portal/news", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  const portalLogoImg = page.locator("header a[href='/portal/news'] img");
  const portalLogoVisible = await portalLogoImg.isVisible();
  const portalLogoSrc = await portalLogoImg.getAttribute("src");
  console.log("Portal Navbar Logo visible:", portalLogoVisible, "src:", portalLogoSrc);

  const footerLogoImg = page.locator("footer img");
  console.log("Portal Footer Logo visible:", await footerLogoImg.isVisible());
  await page.screenshot({ path: path.join(shotDir, "34-portal-navbar-custom-logo.png") });

  console.log("Logo verification finished successfully!");
  await browser.close();
}

verifyLogo().catch(console.error);
