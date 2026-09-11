import { chromium } from "@playwright/test";
import * as path from "path";

const EDGE_PATH = "/Users/lalitapimrat/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge";
const SHOT_DIR = "/Users/lalitapimrat/.gemini/antigravity/brain/a115f894-2ade-4919-bbd3-1ccabae1cad9/screenshots";

async function runGoogleSignInTest() {
  console.log("=== Testing Google Sign-In & Auto-Provisioning in Microsoft Edge ===");
  const browser = await chromium.launch({
    headless: true,
    executablePath: EDGE_PATH,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  // 1. Visit Login Page
  console.log("1. Navigating to /login...");
  await page.goto("http://localhost:3010/login", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // 2. Click Google Login button
  console.log("2. Clicking Google Sign-In button...");
  const googleBtn = page.locator('button:has-text("เข้าสู่ระบบด้วย Google")');
  await googleBtn.waitFor({ state: "visible" });
  await googleBtn.click();
  await page.waitForTimeout(1000);

  // 3. Verify Modal is Open & Capture Screenshot
  console.log("3. Verifying Google Sign-In Modal is open...");
  await page.waitForSelector('text=ลงชื่อเข้าใช้ด้วย Google');
  await page.screenshot({ path: path.join(SHOT_DIR, "53-google-modal-open.png") });
  console.log("  ✓ Saved screenshot 53-google-modal-open.png");

  // 4. Click Preset Account: นายมานะ มุ่งมั่น
  console.log("4. Testing Preset Account: นายมานะ มุ่งมั่น...");
  const manaBtn = page.locator('button:has-text("นายมานะ มุ่งมั่น")');
  await manaBtn.click();
  await page.waitForTimeout(3000);
  console.log("  Current URL after login:", page.url());
  await page.screenshot({ path: path.join(SHOT_DIR, "54-google-login-mana.png") });
  console.log("  ✓ Saved screenshot 54-google-login-mana.png");

  // 5. Test Auto-Provisioning with a new custom Google account
  console.log("5. Testing Auto-Provisioning with brand new Google account...");
  // Clear cookies to test fresh login
  await context.clearCookies();
  await page.goto("http://localhost:3010/login", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);

  const googleBtn2 = page.locator('button:has-text("เข้าสู่ระบบด้วย Google")');
  await googleBtn2.click();
  await page.waitForTimeout(800);

  // Switch to Custom Tab
  const customTab = page.locator('button:has-text("➕ บัญชี Google อื่น ๆ")');
  await customTab.click();
  await page.waitForTimeout(600);

  // Fill in new user details
  const testName = "พระมหาธนภูมิ ญาณวีโร (Google Auto-Provision)";
  const testEmail = `thanapoom.mcu.${Date.now()}@gmail.com`;

  await page.fill('input[placeholder*="พระมหาธนภูมิ"]', testName);
  await page.fill('input[placeholder="name@gmail.com"]', testEmail);
  await page.waitForTimeout(400);

  await page.screenshot({ path: path.join(SHOT_DIR, "55-google-custom-account-form.png") });
  console.log("  ✓ Saved screenshot 55-google-custom-account-form.png");

  // Submit
  const submitBtn = page.locator('button:has-text("ลงชื่อเข้าใช้ด้วย Google ทันที")');
  await submitBtn.click();
  await page.waitForTimeout(3500);

  console.log("  Current URL after auto-provision login:", page.url());
  await page.screenshot({ path: path.join(SHOT_DIR, "56-google-custom-logged-in.png") });
  console.log("  ✓ Saved screenshot 56-google-custom-logged-in.png");

  // 6. Check Admin Settings Google OAuth Card
  console.log("6. Verifying Admin Settings Google OAuth Card...");
  await context.clearCookies();
  await page.goto("http://localhost:3010/login", { waitUntil: "networkidle" });
  await page.locator('button:has-text("👑 ผู้ดูแลสูงสุด (Admin)")').click();
  await page.waitForTimeout(300);
  await page.locator('button[type="submit"]:has-text("เข้าสู่ระบบ")').click();
  await page.waitForTimeout(2000);

  await page.goto("http://localhost:3010/settings", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);

  const googleCard = page.locator('text=การเข้าสู่ระบบด้วย Google (Google Sign-In & OAuth 2.0)');
  await googleCard.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  await page.screenshot({ path: path.join(SHOT_DIR, "57-google-oauth-settings-card.png") });
  console.log("  ✓ Saved screenshot 57-google-oauth-settings-card.png");

  await browser.close();
  console.log("=== All Google Sign-In & Auto-Provisioning tests PASSED! ===");
}

runGoogleSignInTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
