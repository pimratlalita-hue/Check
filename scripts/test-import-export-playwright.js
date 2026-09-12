const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: "th-TH"
  });
  const page = await context.newPage();

  console.log("1. Navigating to login...");
  await page.goto("http://localhost:3010/login", { waitUntil: "networkidle" });
  await page.fill('input[type="email"], input[name="email"]', "admin@app.local");
  await page.fill('input[type="password"], input[name="password"]', "Passw0rd!vibe");
  await page.click('button[type="submit"]');

  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 15000 });
  console.log("Logged in! Current URL:", page.url());

  console.log("2. Navigating to /users...");
  await page.goto("http://localhost:3010/users", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  const screenshotDir = path.resolve(__dirname, "../screenshots/chrome");
  if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

  await page.screenshot({ path: path.join(screenshotDir, "users-page-with-export-import-buttons.png") });
  console.log("Screenshot saved: users-page-with-export-import-buttons.png");

  // Test Export button
  console.log("3. Testing Export CSV button...");
  const exportBtn = page.getByRole("button", { name: "ส่งออก CSV" });
  if (await exportBtn.count() > 0) {
    const downloadPromise = page.waitForEvent("download", { timeout: 10000 });
    await exportBtn.click();
    const download = await downloadPromise;
    const downloadPath = path.join(screenshotDir, download.suggestedFilename());
    await download.saveAs(downloadPath);
    console.log("Downloaded exported CSV to:", downloadPath);
    const csvContent = fs.readFileSync(downloadPath, "utf8");
    console.log("Exported CSV snippet (first 200 chars):", csvContent.substring(0, 200));
  } else {
    console.warn("Export button not found!");
  }

  // Navigate to /users/import
  console.log("4. Navigating to /users/import...");
  await page.goto("http://localhost:3010/users/import", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  await page.screenshot({ path: path.join(screenshotDir, "users-import-page-initial.png") });
  console.log("Screenshot saved: users-import-page-initial.png");

  // Test Download Template
  console.log("5. Testing Download CSV Template...");
  const templateBtn = page.getByRole("button", { name: "ดาวน์โหลดไฟล์ตัวอย่าง CSV" });
  const templateDownloadPromise = page.waitForEvent("download", { timeout: 10000 });
  await templateBtn.click();
  const templateDownload = await templateDownloadPromise;
  const templatePath = path.join(screenshotDir, templateDownload.suggestedFilename());
  await templateDownload.saveAs(templatePath);
  console.log("Downloaded template to:", templatePath);

  // Prepare a test CSV to upload
  const timestamp = Date.now();
  const testCsvContent = `\uFEFFemail,name,role
test.student.${timestamp}@example.com,นายทดสอบ เรียนดี_${timestamp},STUDENT
test.advisor.${timestamp}@example.com,ดร.ทดสอบ แนะแนว_${timestamp},ADVISOR
admin@app.local,ผู้ดูแลที่มีอยู่แล้ว,ADMIN
invalid-email-format,นายผิดพลาด,STAFF
`;
  const tempCsvPath = path.join(screenshotDir, "temp_test_import.csv");
  fs.writeFileSync(tempCsvPath, testCsvContent, "utf8");

  console.log("6. Uploading test CSV...");
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(tempCsvPath);
  await page.waitForTimeout(1500);

  await page.screenshot({ path: path.join(screenshotDir, "users-import-page-preview.png") });
  console.log("Screenshot saved: users-import-page-preview.png");

  // Click start import
  console.log("7. Starting import...");
  const startImportBtn = page.getByRole("button", { name: /เริ่มนำเข้าข้อมูล/ });
  await startImportBtn.click();
  await page.waitForTimeout(3000);

  await page.screenshot({ path: path.join(screenshotDir, "users-import-page-results.png") });
  console.log("Screenshot saved: users-import-page-results.png");

  console.log("8. Navigating back to /users to verify new users...");
  await page.goto("http://localhost:3010/users", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotDir, "users-page-after-import.png") });
  console.log("Screenshot saved: users-page-after-import.png");

  // Cleanup temp file
  if (fs.existsSync(tempCsvPath)) fs.unlinkSync(tempCsvPath);

  await browser.close();
  console.log("ALL PLAYWRIGHT TESTS COMPLETED SUCCESSFULLY!");
}

run().catch((err) => {
  console.error("Playwright test failed:", err);
  process.exit(1);
});
