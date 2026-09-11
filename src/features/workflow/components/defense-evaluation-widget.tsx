"use client";

import React, { useState } from "react";
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Users,
  ClipboardList,
  Sparkles,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CommitteeMemberScore {
  role: string;
  name: string;
  score: number; // 0-100
  signatureDate: string;
  hasSigned: boolean;
}

export type DefenseVerdict = "PASS" | "PASS_WITH_CONDITION" | "FAIL";

interface DefenseEvaluationWidgetProps {
  petitionType?: string;
  thesisTitle?: string;
  studentName?: string;
  advisorName?: string;
  onApplyVerdict?: (summary: string, suggestedAction: "APPROVE" | "RETURN" | "REJECT") => void;
  readOnly?: boolean;
  className?: string;
}

export function DefenseEvaluationWidget({
  petitionType = "DEFENSE_EXAM_REQUEST",
  thesisTitle = "การศึกษาวิจัยวิทยานิพนธ์",
  studentName = "นิสิต",
  advisorName = "อาจารย์ที่ปรึกษา",
  onApplyVerdict,
  readOnly = false,
  className = "",
}: DefenseEvaluationWidgetProps) {
  // 4 Standard Academic Rubrics (Total 100)
  const [rubricScores, setRubricScores] = useState({
    methodology: 32, // max 35
    presentation: 22, // max 25
    originality: 23, // max 25
    formatting: 14, // max 15
  });

  const totalScore =
    rubricScores.methodology +
    rubricScores.presentation +
    rubricScores.originality +
    rubricScores.formatting;

  // Final Committee Decision
  const [verdict, setVerdict] = useState<DefenseVerdict>(
    totalScore >= 80 ? "PASS" : totalScore >= 65 ? "PASS_WITH_CONDITION" : "FAIL"
  );
  const [revisionNotes, setRevisionNotes] = useState(
    "1. ปรับปรุงบทที่ 4 ในส่วนการวิเคราะห์ข้อมูลเชิงคุณภาพ\n2. ตรวจสอบการอ้างอิงตามรูปแบบ APA 7th Edition"
  );
  const [revisionDays, setRevisionDays] = useState(30);

  // Committee Signatures
  const [committee, _setCommittee] = useState<CommitteeMemberScore[]>([
    {
      role: "ประธานกรรมการสอบ (Committee Chair)",
      name: "ศ.ดร.สมชาย วิชาการ",
      score: 88,
      signatureDate: new Date().toISOString().split("T")[0],
      hasSigned: true,
    },
    {
      role: "กรรมการผู้ทรงคุณวุฒิภายนอก (External Examiner)",
      name: "รศ.ดร.กานต์ อักษรศาสตร์",
      score: 85,
      signatureDate: new Date().toISOString().split("T")[0],
      hasSigned: true,
    },
    {
      role: "อาจารย์ที่ปรึกษาวิทยานิพนธ์ (Major Advisor)",
      name: advisorName || "รศ.ดร.ประเสริฐ ธรรมิกุล",
      score: 92,
      signatureDate: new Date().toISOString().split("T")[0],
      hasSigned: true,
    },
  ]);

  const handleScoreChange = (field: keyof typeof rubricScores, value: number, max: number) => {
    const clamped = Math.max(0, Math.min(max, value));
    const nextScores = { ...rubricScores, [field]: clamped };
    setRubricScores(nextScores);

    const nextTotal =
      nextScores.methodology + nextScores.presentation + nextScores.originality + nextScores.formatting;
    if (nextTotal >= 80) setVerdict("PASS");
    else if (nextTotal >= 65) setVerdict("PASS_WITH_CONDITION");
    else setVerdict("FAIL");
  };

  const generateSummaryText = (): string => {
    const verdictLabel =
      verdict === "PASS"
        ? "ผ่าน (Pass)"
        : verdict === "PASS_WITH_CONDITION"
        ? `ผ่านโดยมีเงื่อนไข (Pass with Condition - กำหนดส่งแก้ไขภายใน ${revisionDays} วัน)`
        : "ไม่ผ่าน (Fail)";

    return `[ผลการประเมินจากคณะกรรมการสอบ]
คะแนนรวมการประเมิน: ${totalScore}/100 คะแนน
- ระเบียบวิธีและคุณภาพเนื้อหา: ${rubricScores.methodology}/35
- การนำเสนอและการตอบข้อซักถาม: ${rubricScores.presentation}/25
- ความคิดริเริ่มและประโยชน์เชิงวิชาการ: ${rubricScores.originality}/25
- รูปแบบและการอ้างอิงตามคู่มือ: ${rubricScores.formatting}/15

มติคณะกรรมการสอบ: ${verdictLabel}
${verdict === "PASS_WITH_CONDITION" ? `ข้อสังเกตและรายการที่ต้องแก้ไข:\n${revisionNotes}` : ""}
กรรมการผู้ร่วมประเมิน: ${committee.map((c) => `${c.name} (${c.score} คะแนน)`).join(", ")}`;
  };

  const handleApply = () => {
    if (!onApplyVerdict) return;
    const summary = generateSummaryText();
    const suggestedAction =
      verdict === "PASS" ? "APPROVE" : verdict === "PASS_WITH_CONDITION" ? "APPROVE" : "RETURN";
    onApplyVerdict(summary, suggestedAction);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>บันทึกผลการสอบวิทยานิพนธ์ - ${studentName}</title>
            <style>
              body { font-family: 'Sarabun', -apple-system, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
              h2, h3 { text-align: center; margin-bottom: 8px; color: #e11d48; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
              th { background: #f8fafc; }
              .box { background: #f1f5f9; padding: 16px; border-radius: 8px; margin-top: 20px; white-space: pre-wrap; font-size: 13px; }
            </style>
          </head>
          <body>
            <h2>บัณฑิตศึกษา ภาควิชาภาษาต่างประเทศ คณะมนุษยศาสตร์</h2>
            <h3>มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย</h3>
            <p style="text-align: center;"><strong>แบบบันทึกผลการประเมินการสอบวิทยานิพนธ์</strong></p>
            <hr/>
            <p><strong>ชื่อนิสิต:</strong> ${studentName}</p>
            <p><strong>หัวข้อวิทยานิพนธ์:</strong> ${thesisTitle}</p>
            <p><strong>ประเภทการสอบ:</strong> ${
              petitionType === "DEFENSE_EXAM_REQUEST" ? "สอบปากเปล่าป้องกันวิทยานิพนธ์ขั้นสุดท้าย" : "สอบเค้าโครงวิทยานิพนธ์"
            }</p>
            
            <table>
              <thead>
                <tr>
                  <th>เกณฑ์การประเมิน</th>
                  <th>คะแนนเต็ม</th>
                  <th>คะแนนที่ได้</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>1. ระเบียบวิธีวิจัยและความสมบูรณ์ของเนื้อหา</td><td>35</td><td>${rubricScores.methodology}</td></tr>
                <tr><td>2. การนำเสนอและการตอบข้อซักถาม</td><td>25</td><td>${rubricScores.presentation}</td></tr>
                <tr><td>3. ความคิดริเริ่มและการนำไปใช้ประโยชน์</td><td>25</td><td>${rubricScores.originality}</td></tr>
                <tr><td>4. รูปแบบและการอ้างอิงตามคู่มือวิทยานิพนธ์</td><td>15</td><td>${rubricScores.formatting}</td></tr>
                <tr style="font-weight: bold; background: #fff1f2;"><td>รวมคะแนนเฉลี่ย</td><td>100</td><td>${totalScore}</td></tr>
              </tbody>
            </table>

            <div class="box">
              <strong>มติคณะกรรมการ:</strong> ${verdict === "PASS" ? "ผ่าน (Pass)" : verdict === "PASS_WITH_CONDITION" ? "ผ่านโดยมีเงื่อนไข (Pass with Condition)" : "ไม่ผ่าน (Fail)"}
              <br/><br/>
              <strong>รายละเอียดข้อเสนอแนะ:</strong><br/>
              ${revisionNotes || "ไม่มีข้อแก้ไขเพิ่มเติม"}
            </div>

            <div style="margin-top: 40px;">
              <table style="border: none;">
                <tr style="border: none;">
                  ${committee
                    .map(
                      (c) =>
                        `<td style="border: none; text-align: center; padding-top: 30px;">
                          ___________________________<br/>
                          (${c.name})<br/>
                          <span style="font-size: 12px; color: #64748b;">${c.role}</span>
                        </td>`
                    )
                    .join("")}
                </tr>
              </table>
            </div>
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div
      className={`p-4 bg-gradient-to-br from-slate-50 to-rose-50/30 border border-slate-200 rounded-xl space-y-4 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-sm">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              การประเมินผลการสอบและบันทึกคะแนนคณะกรรมการ
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold">
                Exam Evaluation
              </span>
            </h4>
            <p className="text-[11px] text-slate-500">
              เกณฑ์มาตรฐานบัณฑิตศึกษา (Rubric 100 คะแนน) พร้อมมติรับรอง
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="h-7 text-xs flex items-center gap-1 text-slate-700 bg-white"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            พิมพ์ใบรายงานผล
          </Button>
        </div>
      </div>

      {/* 4 Rubric Scoring Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-slate-700">1. ระเบียบวิธีและเนื้อหาวิจัย</span>
            <span className="font-bold text-rose-700">{rubricScores.methodology} / 35</span>
          </div>
          {!readOnly && (
            <input
              type="range"
              min="0"
              max="35"
              value={rubricScores.methodology}
              onChange={(e) => handleScoreChange("methodology", parseInt(e.target.value), 35)}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
            />
          )}
          <p className="text-[10px] text-slate-400">
            ความลุ่มลึก ความถูกต้องของเครื่องมือ และความสมบูรณ์ของบทที่ 1-5
          </p>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-slate-700">2. การนำเสนอและการตอบข้อซักถาม</span>
            <span className="font-bold text-rose-700">{rubricScores.presentation} / 25</span>
          </div>
          {!readOnly && (
            <input
              type="range"
              min="0"
              max="25"
              value={rubricScores.presentation}
              onChange={(e) => handleScoreChange("presentation", parseInt(e.target.value), 25)}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
            />
          )}
          <p className="text-[10px] text-slate-400">
            ความชัดเจนในการอธิบาย และการตอบคำถามข้อโต้แย้งทางวิชาการ
          </p>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-slate-700">3. ความคิดริเริ่มและประโยชน์วิชาการ</span>
            <span className="font-bold text-rose-700">{rubricScores.originality} / 25</span>
          </div>
          {!readOnly && (
            <input
              type="range"
              min="0"
              max="25"
              value={rubricScores.originality}
              onChange={(e) => handleScoreChange("originality", parseInt(e.target.value), 25)}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
            />
          )}
          <p className="text-[10px] text-slate-400">
            คุณค่าทางทฤษฎี นวัตกรรมทางภาษา หรือการประยุกต์หลักพุทธธรรม
          </p>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-slate-700">4. รูปแบบและการอ้างอิงตามคู่มือ</span>
            <span className="font-bold text-rose-700">{rubricScores.formatting} / 15</span>
          </div>
          {!readOnly && (
            <input
              type="range"
              min="0"
              max="15"
              value={rubricScores.formatting}
              onChange={(e) => handleScoreChange("formatting", parseInt(e.target.value), 15)}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
            />
          )}
          <p className="text-[10px] text-slate-400">
            การจัดหน้า บรรณานุกรม และระเบียบรูปแบบบัณฑิตวิทยาลัย
          </p>
        </div>
      </div>

      {/* Score Summary Badge & Verdict Selector */}
      <div className="p-3 bg-white border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="text-center px-3 py-1 bg-rose-50 border border-rose-200 rounded-lg">
            <span className="text-[10px] text-rose-700 font-semibold uppercase block">
              คะแนนเฉลี่ย
            </span>
            <span className="text-xl font-extrabold text-rose-900">{totalScore}</span>
            <span className="text-[10px] text-rose-600"> / 100</span>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-800 block">มติคณะกรรมการสอบ:</span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                verdict === "PASS"
                  ? "bg-emerald-100 text-emerald-800"
                  : verdict === "PASS_WITH_CONDITION"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              {verdict === "PASS" && <CheckCircle2 className="w-3.5 h-3.5" />}
              {verdict === "PASS_WITH_CONDITION" && <AlertTriangle className="w-3.5 h-3.5" />}
              {verdict === "FAIL" && <XCircle className="w-3.5 h-3.5" />}
              {verdict === "PASS"
                ? "ผ่าน (Pass)"
                : verdict === "PASS_WITH_CONDITION"
                ? "ผ่านโดยมีเงื่อนไข (Pass with Condition)"
                : "ไม่ผ่าน (Fail)"}
            </span>
          </div>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setVerdict("PASS")}
              className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all ${
                verdict === "PASS"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              ผ่าน
            </button>
            <button
              type="button"
              onClick={() => setVerdict("PASS_WITH_CONDITION")}
              className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all ${
                verdict === "PASS_WITH_CONDITION"
                  ? "bg-amber-600 text-white border-amber-600"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              ผ่านมีเงื่อนไข
            </button>
            <button
              type="button"
              onClick={() => setVerdict("FAIL")}
              className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all ${
                verdict === "FAIL"
                  ? "bg-rose-600 text-white border-rose-600"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              ไม่ผ่าน
            </button>
          </div>
        )}
      </div>

      {/* Conditions & Revision Notes */}
      {verdict === "PASS_WITH_CONDITION" && (
        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-amber-900 flex items-center gap-1.5">
              <ClipboardList className="w-3.5 h-3.5 text-amber-700" />
              รายการแก้ไขและเงื่อนไขที่ต้องปรับปรุงก่อนส่งฉบับสมบูรณ์
            </span>
            <div className="flex items-center gap-1">
              <span className="text-amber-800 text-[11px]">กำหนดส่งภายใน:</span>
              <select
                value={revisionDays}
                onChange={(e) => setRevisionDays(parseInt(e.target.value))}
                className="bg-white border border-amber-300 rounded px-1.5 py-0.5 text-xs font-semibold text-amber-900"
                disabled={readOnly}
              >
                <option value={15}>15 วัน</option>
                <option value={30}>30 วัน</option>
                <option value={45}>45 วัน</option>
                <option value={60}>60 วัน</option>
              </select>
            </div>
          </div>
          <textarea
            rows={2}
            value={revisionNotes}
            onChange={(e) => setRevisionNotes(e.target.value)}
            disabled={readOnly}
            placeholder="ระบุข้อแนะนำและประเด็นที่ต้องแก้ไข..."
            className="w-full p-2 text-xs bg-white border border-amber-200 rounded-md focus:ring-1 focus:ring-amber-500 focus:outline-none text-slate-700"
          />
        </div>
      )}

      {/* Committee Sign-off List */}
      <div className="space-y-1.5">
        <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-rose-600" />
          รายชื่อคณะกรรมการสอบและการลงนามรับรองผล
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {committee.map((c, idx) => (
            <div
              key={idx}
              className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-slate-400 truncate max-w-[140px]">
                  {c.role}
                </span>
                <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  รับรองแล้ว
                </span>
              </div>
              <div className="font-semibold text-slate-800 truncate">{c.name}</div>
              <div className="text-[10px] text-slate-500">
                คะแนน: <strong className="text-rose-700">{c.score}</strong>/100
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Apply to Review Decision Button */}
      {!readOnly && onApplyVerdict && (
        <div className="pt-1 flex justify-end">
          <Button
            type="button"
            size="sm"
            onClick={handleApply}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            นำผลประเมินใส่ในความเห็นการพิจารณา (Apply Verdict)
          </Button>
        </div>
      )}
    </div>
  );
}
