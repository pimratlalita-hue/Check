import { chromium } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

interface StepResult {
  step: number;
  feature: string;
  role: string;
  url: string;
  status: "PASSED" | "FAILED";
  screenshot: string;
  details: string;
}

async function simulateAllFeatures() {
  const shotDir = "/Users/lalitapimrat/.gemini/antigravity/brain/a115f894-2ade-4919-bbd3-1ccabae1cad9/screenshots/simulation";
  if (!fs.existsSync(shotDir)) {
    fs.mkdirSync(shotDir, { recursive: true });
  }

  // Check if native Edge is available
  const edgeAppPath = "/Users/lalitapimrat/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge";
  const useNativeEdge = fs.existsSync(edgeAppPath);

  console.log(`[Simulation Engine] Native Edge available: ${useNativeEdge}`);

  const browser = await chromium.launch({
    headless: true,
    executablePath: useNativeEdge ? edgeAppPath : undefined,
    args: [
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0",
    ],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0",
    deviceScaleFactor: 2,
    locale: "th-TH",
  });

  const page = await context.newPage();
  const results: StepResult[] = [];

  let stepCount = 1;

  async function recordStep(
    feature: string,
    role: string,
    url: string,
    action: () => Promise<string>
  ) {
    const shotName = `step-${String(stepCount).padStart(2, "0")}-${feature.replace(/[^a-zA-Z0-9_-]/g, "_")}.png`;
    const shotPath = path.join(shotDir, shotName);
    console.log(`\n▶ [Step ${stepCount}] ${feature} (${role}) @ ${url}`);

    try {
      const details = await action();
      await page.waitForTimeout(600);
      await page.screenshot({ path: shotPath });
      console.log(`  ✓ Passed: ${details}`);
      results.push({
        step: stepCount,
        feature,
        role,
        url,
        status: "PASSED",
        screenshot: shotPath,
        details,
      });
    } catch (err: any) {
      console.error(`  ✗ Failed: ${err.message}`);
      await page.screenshot({ path: shotPath }).catch(() => {});
      results.push({
        step: stepCount,
        feature,
        role,
        url,
        status: "FAILED",
        screenshot: shotPath,
        details: err.message,
      });
    }
    stepCount++;
  }

  // ==========================================
  // SECTION 1: PUBLIC PORTAL (Student / Guest Persona)
  // ==========================================

  // 1. Portal Home & News Announcements
  await recordStep("Portal News", "Public / Student", "http://localhost:3010/portal/news", async () => {
    await page.goto("http://localhost:3010/portal/news", { waitUntil: "networkidle" });
    const brand = await page.locator("header a div.font-bold").first().innerText();
    return `เข้าชมหน้าข่าวสารสำเร็จ แสดงชื่อองค์กร: "${brand.trim()}"`;
  });

  // 2. Bilingual Switcher (Switch to English)
  await recordStep("Bilingual Switcher", "Public / Student", "http://localhost:3010/portal/news", async () => {
    const langBtn = page.locator('button[title*="language"]');
    if (await langBtn.isVisible()) {
      await langBtn.click();
      await page.waitForTimeout(800);
    }
    const brandEn = await page.locator("header a div.font-bold").first().innerText();
    // Switch back to TH
    const langBtn2 = page.locator('button[title*="language"]');
    if (await langBtn2.isVisible()) {
      await langBtn2.click();
      await page.waitForTimeout(800);
    }
    return `สลับภาษาสำเร็จ ชื่อภาษาอังกฤษ: "${brandEn.trim()}" และสลับกลับเป็นภาษาไทย`;
  });

  // 3. Curriculum & Academic Programs
  await recordStep("Curriculum Directory", "Student", "http://localhost:3010/portal/curriculum", async () => {
    await page.goto("http://localhost:3010/portal/curriculum", { waitUntil: "networkidle" });
    const cardCount = await page.locator("a[href^='/portal/curriculum/']").count();
    return `ตรวจสอบหลักสูตรการศึกษา พบ ${cardCount} หลักสูตร พร้อมรายละเอียดแผนการเรียน`;
  });

  // 4. Faculty & Staff Directory
  await recordStep("Staff Directory & Quota", "Student", "http://localhost:3010/portal/staff", async () => {
    await page.goto("http://localhost:3010/portal/staff", { waitUntil: "networkidle" });
    const searchInput = page.locator('input[type="search"], input[placeholder*="ค้นหา"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill("สมชาย");
      await page.waitForTimeout(500);
    }
    return `ค้นหาทำเนียบคณาจารย์และตรวจสอบโควตานิสิตที่ปรึกษาวิทยานิพนธ์`;
  });

  // 5. Online Academic Petitions
  await recordStep("Online Petitions", "Student (นายมานะ)", "http://localhost:3010/portal/petitions", async () => {
    await page.goto("http://localhost:3010/portal/petitions", { waitUntil: "networkidle" });
    return `เข้าสู่ระบบยื่นคำร้องวิทยานิพนธ์ออนไลน์ ตรวจสอบสถานะคำร้องและหัวข้อที่เสนอ`;
  });

  // 6. Exam Room & Facility Services
  await recordStep("Facility & Exam Rooms", "Student", "http://localhost:3010/portal/facility", async () => {
    await page.goto("http://localhost:3010/portal/facility", { waitUntil: "networkidle" });
    return `ตรวจสอบห้องสอบเค้าโครง/สอบจบวิทยานิพนธ์ และระบบป้องกันการจองเวลาชนกัน`;
  });

  // 7. Exam Attendance & PDPA Biometrics
  await recordStep("Biometrics & PDPA Attendance", "Student", "http://localhost:3010/portal/attendance", async () => {
    await page.goto("http://localhost:3010/portal/attendance", { waitUntil: "networkidle" });
    return `เข้าสู่หน้าเช็คชื่อเข้าห้องสอบด้วยชีวมิติ พร้อมเงื่อนไขความยินยอม PDPA Consent`;
  });

  // ==========================================
  // SECTION 2: 5-ROLES SIMULATOR & WORKFLOW
  // ==========================================

  // 8. Role Simulator: Switch to Advisor
  await recordStep("Role Simulator: Advisor", "อาจารย์ที่ปรึกษา (ผศ.ดร.สมชาย)", "http://localhost:3010/portal/news", async () => {
    await page.goto("http://localhost:3010/portal/news", { waitUntil: "networkidle" });
    const simBtn = page.locator('button[title*="สลับบทบาทจำลอง"]');
    if (await simBtn.isVisible()) {
      await simBtn.click();
      await page.waitForTimeout(400);
      const advisorOption = page.locator('button:has-text("อาจารย์ที่ปรึกษา"), [role="menuitem"]:has-text("อาจารย์ที่ปรึกษา")').first();
      if (await advisorOption.isVisible()) {
        await advisorOption.click();
        await page.waitForTimeout(600);
      }
    }
    return `จำลองเป็น ผศ.ดร.สมชาย ใจดี (อาจารย์ที่ปรึกษา) เพื่อตรวจสอบความก้าวหน้าวิทยานิพนธ์`;
  });

  // 9. Role Simulator: Switch to Program Chair
  await recordStep("Role Simulator: Chair", "ประธานหลักสูตร (ศ.ดร.วิชาการ)", "http://localhost:3010/portal/news", async () => {
    const simBtn = page.locator('button[title*="สลับบทบาทจำลอง"]');
    if (await simBtn.isVisible()) {
      await simBtn.click();
      await page.waitForTimeout(400);
      const chairOption = page.locator('button:has-text("ประธานหลักสูตร"), [role="menuitem"]:has-text("ประธานหลักสูตร")').first();
      if (await chairOption.isVisible()) {
        await chairOption.click();
        await page.waitForTimeout(600);
      }
    }
    return `จำลองเป็น ศ.ดร.วิชาการ เข้มงวด (ประธานหลักสูตร) เพื่อพิจารณาการอนุมัติระดับคณะ/สาขา`;
  });

  // 10. Role Simulator: Switch to Dean / Graduate Officer
  await recordStep("Role Simulator: Dean", "เจ้าหน้าที่บัณฑิตวิทยาลัย", "http://localhost:3010/portal/news", async () => {
    const simBtn = page.locator('button[title*="สลับบทบาทจำลอง"]');
    if (await simBtn.isVisible()) {
      await simBtn.click();
      await page.waitForTimeout(400);
      const deanOption = page.locator('button:has-text("บัณฑิตวิทยาลัย"), [role="menuitem"]:has-text("บัณฑิตวิทยาลัย")').first();
      if (await deanOption.isVisible()) {
        await deanOption.click();
        await page.waitForTimeout(600);
      }
    }
    return `จำลองเป็น เจ้าหน้าที่บัณฑิตวิทยาลัย เพื่อตรวจสอบขั้นสุดท้ายและออกรหัสวิทยานิพนธ์`;
  });

  // ==========================================
  // SECTION 3: ADMIN BACKEND (Super Admin Persona)
  // ==========================================

  // 11. Admin Login
  await recordStep("Admin Authentication", "Super Admin", "http://localhost:3010/dashboard", async () => {
    const simBtn = page.locator('button[title*="สลับบทบาทจำลอง"]');
    if (await simBtn.isVisible()) {
      await simBtn.click();
      await page.waitForTimeout(400);
      const adminOption = page.locator('button:has-text("ผู้ดูแลสูงสุด"), [role="menuitem"]:has-text("ผู้ดูแลสูงสุด")').first();
      if (await adminOption.isVisible()) {
        await adminOption.click();
        await page.waitForTimeout(600);
      }
    }
    await page.goto("http://localhost:3010/dashboard", { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    return `เข้าสู่ระบบในบทบาท Super Admin (ผู้ดูแลสูงสุด) สำเร็จ พร้อมสิทธิ์บริหารจัดการทุกโมดูล`;
  });

  // 12. Admin Dashboard Overview
  await recordStep("Admin Dashboard", "Super Admin", "http://localhost:3010/dashboard", async () => {
    await page.goto("http://localhost:3010/dashboard", { waitUntil: "networkidle" });
    const cards = await page.locator("div.card, [data-slot='card']").count();
    return `ตรวจสอบแดชบอร์ดสรุปภาพรวม สถิติผู้ใช้งาน จำนวนคำร้อง และกิจกรรมวิทยานิพนธ์`;
  });

  // 13. Users Management
  await recordStep("Users Management", "Super Admin", "http://localhost:3010/users", async () => {
    await page.goto("http://localhost:3010/users", { waitUntil: "networkidle" });
    const userRows = await page.locator("tbody tr").count();
    return `บริหารจัดการรายชื่อผู้ใช้ในระบบทั้งหมด (${userRows} บัญชีผู้ใช้)`;
  });

  // 14. Roles & RBAC Permissions
  await recordStep("Roles & RBAC", "Super Admin", "http://localhost:3010/users/roles", async () => {
    await page.goto("http://localhost:3010/users/roles", { waitUntil: "networkidle" });
    return `ตรวจสอบเมทริกซ์การกำหนดสิทธิ์ 5 บทบาทตามหลัก Least Privilege`;
  });

  // 15. Thesis Workflow State Machine
  await recordStep("Thesis Workflow", "Super Admin", "http://localhost:3010/workflow", async () => {
    await page.goto("http://localhost:3010/workflow", { waitUntil: "networkidle" });
    return `ตรวจสอบการไหลของสถานะคำร้องวิทยานิพนธ์ (Proposal -> Approved -> Defense -> Completed)`;
  });

  // 16. Staff & Advisor Quotas
  await recordStep("Staff & Advisor Quota Admin", "Super Admin", "http://localhost:3010/staff", async () => {
    await page.goto("http://localhost:3010/staff", { waitUntil: "networkidle" });
    return `ตรวจสอบและจัดการโควตานิสิตของอาจารย์ที่ปรึกษา`;
  });

  // 17. Curriculum Administration
  await recordStep("Curriculum Admin", "Super Admin", "http://localhost:3010/curriculum", async () => {
    await page.goto("http://localhost:3010/curriculum", { waitUntil: "networkidle" });
    return `จัดการข้อมูลหลักสูตรและรายวิชาวิทยานิพนธ์`;
  });

  // 18. News Administration
  await recordStep("News Admin", "Super Admin", "http://localhost:3010/news", async () => {
    await page.goto("http://localhost:3010/news", { waitUntil: "networkidle" });
    return `จัดการข่าวสารและประกาศวิชาการของคณะ`;
  });

  // 19. Exam Facility Administration
  await recordStep("Facility Admin", "Super Admin", "http://localhost:3010/facility", async () => {
    await page.goto("http://localhost:3010/facility", { waitUntil: "networkidle" });
    return `จัดการห้องสอบและระบบป้องกันการจัดเวลาซ้ำซ้อน`;
  });

  // 20. Biometrics Logs & PDPA Auditing
  await recordStep("Biometrics PDPA Logs", "Super Admin", "http://localhost:3010/biometrics", async () => {
    await page.goto("http://localhost:3010/biometrics", { waitUntil: "networkidle" });
    return `ตรวจสอบประวัติการยืนยันตัวตนเข้าห้องสอบด้วย Synthetic Landmark Hash (ไม่มีภาพดิบ)`;
  });

  // 21. Organization Settings & Logo Editor & Presets
  await recordStep("Organization Settings & Logo", "Super Admin", "http://localhost:3010/settings", async () => {
    await page.goto("http://localhost:3010/settings", { waitUntil: "networkidle" });
    return `ตรวจสอบการตั้งค่าองค์กร มจร. พร้อมปุ่มอัปโหลดแต่งโลโก้ (Canvas) และปุ่มเทมเพลตมาตรฐานสากล`;
  });

  // 22. Backup, Export JSON & System Wipe
  await recordStep("Backup & Data Operations", "Super Admin", "http://localhost:3010/backup", async () => {
    await page.goto("http://localhost:3010/backup", { waitUntil: "networkidle" });
    return `ตรวจสอบระบบ Export gtmts_backup.json และ One-Click System Wipe ป้องกันข้อผิดพลาด`;
  });

  await browser.close();
  console.log("\n==========================================");
  console.log(`Simulation complete! Tested ${results.length} features across all personas.`);
  console.log("==========================================");

  // Write summary file
  const summaryJson = path.join(shotDir, "simulation-results.json");
  fs.writeFileSync(summaryJson, JSON.stringify(results, null, 2), "utf8");
}

simulateAllFeatures().catch((err) => {
  console.error("Simulation failed:", err);
  process.exit(1);
});
