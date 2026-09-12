import { chromium } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";
import { PrismaClient } from "../src/generated/prisma";

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUTPUT_PDF = path.join(process.cwd(), "public/documents/mku2-ma-english-2566.pdf");

async function generatePdf() {
  console.log("===============================================================");
  console.log("📄 Generating Official มคอ. 2 PDF for M.A. in English");
  console.log("===============================================================\n");

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME_PATH,
  });

  const page = await browser.newPage();

  // HTML content formatted exactly as official มคอ.2 specification
  const htmlContent = `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>มคอ.2 - หลักสูตรศิลปศาสตรมหาบัณฑิต สาขาวิชาภาษาอังกฤษ (หลักสูตรปรับปรุง พ.ศ. ๒๕๖๖)</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Sarabun:ital,wght@0,300;0,400;0,600;0,700;1,400&display=swap');
    
    @page {
      size: A4;
      margin: 25mm 20mm 25mm 25mm;
      @bottom-right {
        content: counter(page);
        font-family: 'Sarabun', sans-serif;
        font-size: 11pt;
      }
    }

    body {
      font-family: 'Sarabun', sans-serif;
      font-size: 15pt;
      line-height: 1.6;
      color: #111827;
      margin: 0;
      padding: 0;
    }

    .cover-page {
      page-break-after: always;
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 90vh;
      padding-top: 40px;
    }

    .emblem {
      width: 130px;
      height: 130px;
      margin: 0 auto 30px auto;
    }

    .cover-title {
      font-size: 20pt;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .cover-subtitle {
      font-size: 17pt;
      font-weight: 600;
      color: #374151;
      margin-bottom: 6px;
    }

    .cover-revised {
      font-size: 16pt;
      margin-bottom: 40px;
    }

    .cover-dept {
      margin-top: auto;
      font-size: 16pt;
      font-weight: 600;
      line-height: 1.8;
    }

    .page {
      page-break-after: always;
    }

    h1.section-title {
      font-size: 18pt;
      font-weight: 700;
      text-align: center;
      margin-top: 20px;
      margin-bottom: 24px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 8px;
    }

    h2.sub-section {
      font-size: 16pt;
      font-weight: 700;
      margin-top: 20px;
      margin-bottom: 12px;
      color: #1f2937;
    }

    p {
      text-indent: 1.5cm;
      margin: 8px 0;
      text-align: justify;
    }

    .no-indent {
      text-indent: 0;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 13.5pt;
    }

    th, td {
      border: 1px solid #9ca3af;
      padding: 8px 10px;
      vertical-align: top;
    }

    th {
      background-color: #f3f4f6;
      font-weight: 700;
      text-align: center;
    }

    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: 700; }
    
    .course-card {
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px dashed #d1d5db;
    }
    .course-code {
      font-weight: 700;
      color: #9f1239;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      font-size: 11pt;
      border-radius: 4px;
      background: #fee2e2;
      color: #991b1b;
      font-weight: 600;
    }
  </style>
</head>
<body>

  <!-- COVER PAGE -->
  <div class="cover-page">
    <div>
      <img src="http://localhost:3010/faculty-logo.svg" alt="MCU Logo" class="emblem" onerror="this.style.display='none'" />
      <div style="height: 20px;"></div>
      <div class="cover-title">หลักสูตรศิลปศาสตรมหาบัณฑิต</div>
      <div class="cover-subtitle">สาขาวิชาภาษาอังกฤษ (หลักสูตรภาษาอังกฤษ)</div>
      <div class="cover-revised">(หลักสูตรปรับปรุง พ.ศ. ๒๕๖๖)</div>
      <div style="font-size: 14pt; color: #6b7280; margin-top: 15px;">รหัสหลักสูตร อว./สกอ. ๒๕๕๕๑๘๕๑๑๐๖๐๖๙</div>
    </div>

    <div class="cover-dept">
      ภาควิชาภาษาต่างประเทศ คณะมนุษยศาสตร์<br>
      มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย<br>
      <span style="font-size: 13pt; font-weight: 400; color: #4b5563;">อนุมัติโดยสภามหาวิทยาลัย ครั้งที่ ๔/๒๕๖๖ เมื่อวันที่ ๒๖ เมษายน พ.ศ. ๒๕๖๖</span>
    </div>
  </div>

  <!-- SECTION 1 -->
  <div class="page">
    <h1 class="section-title">หมวดที่ ๑ ข้อมูลทั่วไป</h1>
    <p><strong>๑. รหัสและชื่อหลักสูตร</strong></p>
    <p class="no-indent" style="padding-left: 1.5cm;">
      รหัสหลักสูตร : ๒๕๕๕๑๘๕๑๑๐๖๐๖๙<br>
      ภาษาไทย : หลักสูตรศิลปศาสตรมหาบัณฑิต สาขาวิชาภาษาอังกฤษ (หลักสูตรภาษาอังกฤษ)<br>
      ภาษาอังกฤษ : Master of Arts Program in English (English Program)
    </p>

    <p><strong>๒. ชื่อปริญญาและสาขาวิชา</strong></p>
    <p class="no-indent" style="padding-left: 1.5cm;">
      ชื่อเต็ม (ไทย) : ศิลปศาสตรมหาบัณฑิต (ภาษาอังกฤษ)<br>
      ชื่อย่อ (ไทย) : ศศ.ม. (ภาษาอังกฤษ)<br>
      ชื่อเต็ม (อังกฤษ) : Master of Arts (English)<br>
      ชื่อย่อ (อังกฤษ) : M.A. (English)
    </p>

    <p><strong>๓. วิชาเอก :</strong> ไม่มี</p>
    <p><strong>๔. จำนวนหน่วยกิตที่เรียนตลอดหลักสูตร :</strong> ไม่น้อยกว่า ๓๖ หน่วยกิต</p>

    <p><strong>๕. รูปแบบของหลักสูตร</strong></p>
    <p class="no-indent" style="padding-left: 1.5cm;">
      ๕.๑ รูปแบบ : หลักสูตรระดับปริญญาโท ๒ ปี (ระบบทวิภาค ๔ ภาคการศึกษาปกติ)<br>
      ๕.๒ ภาษาที่ใช้ : การจัดการเรียนการสอนเป็นภาษาอังกฤษ (English as medium language)<br>
      ๕.๓ การรับเข้าศึกษา : รับนิสิตไทยและต่างประเทศที่ใช้ภาษาอังกฤษได้เป็นอย่างดี<br>
      ๕.๔ ความร่วมมือกับสถาบันอื่น : เป็นหลักสูตรเฉพาะของมหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย<br>
      ๕.๕ การให้ปริญญา : ให้ปริญญาเพียงสาขาเดียว คือ สาขาวิชาภาษาอังกฤษ
    </p>

    <p><strong>๖. สถานที่จัดการเรียนการสอน</strong></p>
    <p class="no-indent" style="padding-left: 1.5cm;">
      อาคารเรียนรวม คณะมนุษยศาสตร์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย เลขที่ ๗๙ หมู่ ๑ ถนนพหลโยธิน ตำบลลำไทร อำเภอวังน้อย จังหวัดพระนครศรีอยุธยา ๑๓๑๗๐
    </p>

    <p><strong>๗. อาชีพที่สามารถประกอบได้หลังสำเร็จการศึกษา</strong></p>
    <ol style="margin-left: 1.5cm; font-size: 14pt;">
      <li>ครู / อาจารย์ในสถาบันการศึกษา (Teacher, Lecturer and Instructor)</li>
      <li>นักวิชาการทางด้านภาษาอังกฤษ (Academic Scholar on English)</li>
      <li>นักคิดนักเขียนด้านภาษาอังกฤษ (Thinker and Writer on English)</li>
      <li>ล่าม หรือ ผู้แปล (Interpreter and Translator)</li>
      <li>นักวิจัยด้านภาษาอังกฤษ (Researcher on English)</li>
      <li>นักจัดรายการ / ผู้สื่อข่าววิทยุและโทรทัศน์ (Radio and Television Host)</li>
      <li>เจ้าหน้าที่ของรัฐ ข้าราชการพลเรือน นักบริหาร นักธุรกิจ (Civil Servant, Administrator, Entrepreneur)</li>
    </ol>
  </div>

  <!-- SECTION 2 -->
  <div class="page">
    <h1 class="section-title">หมวดที่ ๒ ปรัชญา วัตถุประสงค์ และผลลัพธ์การเรียนรู้</h1>
    <h2 class="sub-section">๑. ปรัชญาของหลักสูตร</h2>
    <p>
      "ผลิตมหาบัณฑิตให้มีความรู้ความสามารถด้านภาษาอังกฤษทั้งทางด้านทฤษฎีและปฏิบัติประกอบให้มีคุณธรรมจริยธรรมเพื่อตอบสนองความต้องการของคณะสงฆ์ สังคมและผู้ประกอบการ"
    </p>
    <p style="font-style: italic; color: #4b5563;">
      "To produce graduates to be skillful in English both in theoretical and practical aspect and to make graduates to have morality and ethics in order to meet the demands of Sangha Orders, society, and entrepreneurs."
    </p>

    <h2 class="sub-section">๒. วัตถุประสงค์ของหลักสูตร</h2>
    <p>๒.๑ เพื่อผลิตมหาบัณฑิตที่มีคุณธรรม จริยธรรม และสามารถใช้ทักษะภาษาอังกฤษในการสื่อสารเชิงวิชาการเพื่อนำเสนองานในระดับชาติและนานาชาติ</p>
    <p>๒.๒ เพื่อผลิตมหาบัณฑิตที่สามารถวิเคราะห์ และประยุกต์องค์ความรู้ด้านภาษาอังกฤษเพื่อพัฒนาสังคม</p>
    <p>๒.๓ เพื่อผลิตมหาบัณฑิตที่มีความสามารถบูรณาการภาษาอังกฤษกับเทคโนโลยีสารสนเทศและศาสตร์อื่น ๆ เพื่อให้ได้องค์ความรู้ทางวิชาการ และงานวิจัยเพื่อสร้างนวัตกรรม</p>

    <h2 class="sub-section">๓. ผลลัพธ์การเรียนรู้ที่คาดหวังของหลักสูตร (PLOs)</h2>
    <table>
      <thead>
        <tr>
          <th style="width: 18%;">รหัส PLO</th>
          <th>คำอธิบายผลลัพธ์การเรียนรู้ (Learning Outcomes)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="text-center font-bold">PLO ๑</td>
          <td>มีคุณธรรม จริยธรรม และความรู้ในศาสตร์ภาษาอังกฤษเพื่อใช้ทักษะในการสื่อสารเชิงวิชาการเพื่อนำเสนองานในระดับชาติและนานาชาติ (สามารถอธิบายองค์ความรู้เพื่อการสื่อสารเชิงวิชาการ มีความซื่อสัตย์สุจริต รับผิดชอบ และมีจิตสาธารณะ)</td>
        </tr>
        <tr>
          <td class="text-center font-bold">PLO ๒</td>
          <td>มีองค์ความรู้ในศาสตร์ภาษาอังกฤษ สามารถวิเคราะห์ สังเคราะห์ และประยุกต์องค์ความรู้ด้านภาษาอังกฤษเพื่อพัฒนาสังคม</td>
        </tr>
        <tr>
          <td class="text-center font-bold">PLO ๓</td>
          <td>มีความสามารถบูรณาการองค์ความรู้ภาษาอังกฤษกับเทคโนโลยีสารสนเทศ ศาสตร์ทางพระพุทธศาสนา และศาสตร์อื่น ๆ เพื่อสร้างงานวิจัยและนวัตกรรม</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- SECTION 3: STRUCTURE -->
  <div class="page">
    <h1 class="section-title">หมวดที่ ๓ โครงสร้างหลักสูตรและรายวิชา</h1>
    <h2 class="sub-section">๑. โครงสร้างหน่วยกิต (รวม ๓๖ หน่วยกิต)</h2>
    <table>
      <thead>
        <tr>
          <th>หมวดรายวิชา</th>
          <th style="width: 25%;">แผน ๑ แบบวิชาการ<br>(แผน ๑.๑)</th>
          <th style="width: 25%;">แผน ๑ แบบวิชาการ<br>(แผน ๑.๒)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>๑. หมวดวิชาบังคับ ไม่นับหน่วยกิต</td>
          <td class="text-center">-</td>
          <td class="text-center">(๑๒)*</td>
        </tr>
        <tr>
          <td>๑.๒ หมวดวิชาบังคับ นับหน่วยกิต</td>
          <td class="text-center">-</td>
          <td class="text-center">๙</td>
        </tr>
        <tr>
          <td>๒. หมวดวิชาเอก</td>
          <td class="text-center">-</td>
          <td class="text-center">๑๒</td>
        </tr>
        <tr>
          <td>๓. หมวดวิชาเลือก</td>
          <td class="text-center">-</td>
          <td class="text-center">๓</td>
        </tr>
        <tr>
          <td>๔. วิทยานิพนธ์</td>
          <td class="text-center">๓๖</td>
          <td class="text-center">๑๒</td>
        </tr>
        <tr style="background: #f9fafb; font-weight: bold;">
          <td>รวมหน่วยกิต</td>
          <td class="text-center">๓๖</td>
          <td class="text-center">๓๖</td>
        </tr>
      </tbody>
    </table>
    <p class="no-indent" style="font-size: 12pt; color: #6b7280;">* หมายเหตุ: รายวิชาไม่นับหน่วยกิต นิสิตต้องลงทะเบียนและมีผลการประเมินระดับ S (Satisfactory)</p>

    <h2 class="sub-section">๒. รายชื่อรายวิชาทั้งหมดในหลักสูตร (๑๙ รายวิชา)</h2>
    <table>
      <thead>
        <tr>
          <th style="width: 15%;">รหัสวิชา</th>
          <th>ชื่อรายวิชา (ภาษาไทยและภาษาอังกฤษ)</th>
          <th style="width: 18%;">หน่วยกิต</th>
          <th style="width: 20%;">หมวดวิชา</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="text-center font-bold">619 101</td>
          <td>ภาษาศาสตร์พื้นฐาน<br><span style="color:#4b5563;">Fundamental Linguistics</span></td>
          <td class="text-center">(3) (3-0-9)</td>
          <td>วิชาบังคับ (ไม่นับหน่วยกิต)</td>
        </tr>
        <tr>
          <td class="text-center font-bold">619 202</td>
          <td>การวิเคราะห์ไวยากรณ์ภาษาอังกฤษขั้นสูง<br><span style="color:#4b5563;">Analysis of Advanced English Grammar</span></td>
          <td class="text-center">(3) (3-0-9)</td>
          <td>วิชาบังคับ (ไม่นับหน่วยกิต)</td>
        </tr>
        <tr>
          <td class="text-center font-bold">619 203</td>
          <td>ระเบียบวิธีวิจัยภาษาอังกฤษ<br><span style="color:#4b5563;">Research Methodology in English</span></td>
          <td class="text-center">(3) (3-0-9)</td>
          <td>วิชาบังคับ (ไม่นับหน่วยกิต)</td>
        </tr>
        <tr>
          <td class="text-center font-bold">619 204</td>
          <td>กรรมฐาน<br><span style="color:#4b5563;">Buddhist Meditation</span></td>
          <td class="text-center">(3) (3-0-9)</td>
          <td>วิชาบังคับ (ไม่นับหน่วยกิต)</td>
        </tr>
        <tr>
          <td class="text-center font-bold">619 105</td>
          <td>นานาภาษาอังกฤษโลก<br><span style="color:#4b5563;">World Englishes</span></td>
          <td class="text-center">3 (3-0-9)</td>
          <td>วิชาบังคับ (นับหน่วยกิต)</td>
        </tr>
        <tr>
          <td class="text-center font-bold">619 106</td>
          <td>วิธีสอนภาษาอังกฤษอย่างมีประสิทธิภาพ<br><span style="color:#4b5563;">Methods of Effective English Teaching</span></td>
          <td class="text-center">3 (3-0-9)</td>
          <td>วิชาบังคับ (นับหน่วยกิต)</td>
        </tr>
        <tr>
          <td class="text-center font-bold">619 207</td>
          <td>การแปลแบบล่ามอาชีพ<br><span style="color:#4b5563;">Professional Interpretation</span></td>
          <td class="text-center">3 (3-0-9)</td>
          <td>วิชาบังคับ (นับหน่วยกิต)</td>
        </tr>
        <tr>
          <td class="text-center font-bold">619 108</td>
          <td>สัมมนาวิทยานิพนธ์ภาษาอังกฤษ<br><span style="color:#4b5563;">Seminar on Thesis in English</span></td>
          <td class="text-center">3 (3-0-9)</td>
          <td>วิชาเอก</td>
        </tr>
        <tr>
          <td class="text-center font-bold">619 109</td>
          <td>ภาษาอังกฤษเพื่อการสื่อสารมวลชน<br><span style="color:#4b5563;">English for Mass Communication</span></td>
          <td class="text-center">3 (3-0-9)</td>
          <td>วิชาเอก</td>
        </tr>
        <tr>
          <td class="text-center font-bold">619 110</td>
          <td>ภาษาอังกฤษเพื่อการกล่าวสุนทรพจน์<br><span style="color:#4b5563;">English for Delivering Speeches</span></td>
          <td class="text-center">3 (3-0-9)</td>
          <td>วิชาเอก</td>
        </tr>
        <tr>
          <td class="text-center font-bold">619 111</td>
          <td>เทคนิคการนำเสนอและอภิปรายเชิงวิชาการ<br><span style="color:#4b5563;">Academic Presentation and Discussion Techniques</span></td>
          <td class="text-center">3 (3-0-9)</td>
          <td>วิชาเอก</td>
        </tr>
        <tr>
          <td class="text-center font-bold">619 112</td>
          <td>สนทนาธรรมภาคภาษาอังกฤษ<br><span style="color:#4b5563;">Dhamma Talk in English</span></td>
          <td class="text-center">3 (3-0-9)</td>
          <td>วิชาเลือก</td>
        </tr>
        <tr>
          <td class="text-center font-bold">619 113</td>
          <td>ภาษาอังกฤษเพื่อการสื่อสารสำหรับงานมัคคุเทศก์<br><span style="color:#4b5563;">Communicative English for Tour Guide</span></td>
          <td class="text-center">3 (3-0-9)</td>
          <td>วิชาเลือก</td>
        </tr>
        <tr>
          <td class="text-center font-bold">619 114</td>
          <td>การแปลเชิงวิชาการ<br><span style="color:#4b5563;">Academic Translation</span></td>
          <td class="text-center">3 (3-0-9)</td>
          <td>วิชาเลือก</td>
        </tr>
        <tr>
          <td class="text-center font-bold">619 115</td>
          <td>การอ่านพระไตรปิฎกเชิงวิเคราะห์ภาคภาษาอังกฤษ<br><span style="color:#4b5563;">Analytical Tipitaka Reading in English</span></td>
          <td class="text-center">3 (3-0-9)</td>
          <td>วิชาเลือก</td>
        </tr>
        <tr>
          <td class="text-center font-bold">619 116</td>
          <td>การฟังภาษาอังกฤษชั้นสูง<br><span style="color:#4b5563;">Advanced English Listening</span></td>
          <td class="text-center">3 (3-0-9)</td>
          <td>วิชาเลือก</td>
        </tr>
        <tr>
          <td class="text-center font-bold">619 117</td>
          <td>ภาษาอังกฤษผ่านสื่อและเทคโนโลยีสมัยใหม่<br><span style="color:#4b5563;">English Through Modern Media and Technology</span></td>
          <td class="text-center">3 (3-0-9)</td>
          <td>วิชาเลือก</td>
        </tr>
        <tr>
          <td class="text-center font-bold">407 300</td>
          <td>วิทยานิพนธ์ (แผน ๑.๑)<br><span style="color:#4b5563;">Thesis (Plan 1.1)</span></td>
          <td class="text-center">36 หน่วยกิต</td>
          <td>วิทยานิพนธ์</td>
        </tr>
        <tr>
          <td class="text-center font-bold">407 400</td>
          <td>วิทยานิพนธ์ (แผน ๑.๒)<br><span style="color:#4b5563;">Thesis (Plan 1.2)</span></td>
          <td class="text-center">12 หน่วยกิต</td>
          <td>วิทยานิพนธ์</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- SECTION 4: INSTRUCTORS -->
  <div class="page">
    <h1 class="section-title">อาจารย์ผู้รับผิดชอบหลักสูตรและอาจารย์ประจำหลักสูตร</h1>
    <table>
      <thead>
        <tr>
          <th style="width: 10%;">ลำดับ</th>
          <th>ชื่อ - นามสกุล</th>
          <th>ตำแหน่งวิชาการ / วุฒิการศึกษา</th>
          <th>สถาบันที่สำเร็จการศึกษา</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="text-center">๑*</td>
          <td>ดร.เรืองเดช ปันเขื่อนขัติย์</td>
          <td>รองศาสตราจารย์ (ภาษาศาสตร์)<br>Ph.D., M.A. (Linguistics)</td>
          <td>University of Poona, India</td>
        </tr>
        <tr>
          <td class="text-center">๒*</td>
          <td>ดร.วีระกาญจน์ กนกกมเลศ</td>
          <td>ผู้ช่วยศาสตราจารย์ (ภาษาอังกฤษ)<br>Ph.D., M.A. (Linguistics)</td>
          <td>Deccan College / Univ. of Pune, India</td>
        </tr>
        <tr>
          <td class="text-center">๓*</td>
          <td>ดร.ณรงค์ชัย ปิ่นทรายมูล</td>
          <td>อาจารย์ (ภาษาอังกฤษ)<br>Ph.D., M.A. (Linguistics)</td>
          <td>University of Poona / Delhi Univ., India</td>
        </tr>
        <tr>
          <td class="text-center">๔</td>
          <td>ดร.สำราญ ขันสำโรง</td>
          <td>รองศาสตราจารย์ (ภาษาอังกฤษ)<br>Ph.D. (English), M.A. (Linguistics)</td>
          <td>University of Pune, India</td>
        </tr>
        <tr>
          <td class="text-center">๕</td>
          <td>ดร.วิสุทธิชัย ไชยสิทธิ์</td>
          <td>ผู้ช่วยศาสตราจารย์ (ภาษาอังกฤษ)<br>Ph.D., M.A. (English)</td>
          <td>Manipur Univ. / Univ. of Mysore, India</td>
        </tr>
      </tbody>
    </table>
    <p class="no-indent" style="font-size: 12pt; color: #6b7280;">* หมายเหตุ: อาจารย์ผู้รับผิดชอบหลักสูตร</p>
  </div>

</body>
</html>
  `;

  await page.setContent(htmlContent, { waitUntil: "networkidle" });
  await page.pdf({
    path: OUTPUT_PDF,
    format: "A4",
    printBackground: true,
    margin: {
      top: "20mm",
      bottom: "20mm",
      left: "20mm",
      right: "20mm",
    },
  });

  console.log(`  ✓ Generated PDF at: ${OUTPUT_PDF}`);
  await browser.close();

  // Update handbookUrl in MySQL database
  const prisma = new PrismaClient();
  await prisma.program.updateMany({
    where: {
      code: "25551851106069",
    },
    data: {
      handbookUrl: "/documents/mku2-ma-english-2566.pdf",
    },
  });

  console.log("  ✓ Updated program handbookUrl to /documents/mku2-ma-english-2566.pdf");
  await prisma.$disconnect();

  console.log("\n===============================================================");
  console.log("🎉 มคอ. 2 PDF Generation and Database Link Complete!");
  console.log("===============================================================\n");
}

generatePdf().catch(console.error);
