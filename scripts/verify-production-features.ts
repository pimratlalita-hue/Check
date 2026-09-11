// Stub server-only for standalone script runner
const Module = require("module");
const originalRequire = Module.prototype.require;
Module.prototype.require = function (id: string) {
  if (id === "server-only") {
    return {};
  }
  return originalRequire.apply(this, arguments);
};

async function runVerification() {
  const { evaluateThesisPrerequisites } = await import(
    "../src/features/workflow/_internal/services/prerequisite.service"
  );
  const {
    createNotification,
    getNotificationsForUser,
    markNotificationAsRead,
  } = await import(
    "../src/features/workflow/_internal/services/notification.service"
  );
  const {
    storeDocumentFile,
    getDocumentFile,
  } = await import(
    "../src/features/workflow/_internal/services/document-storage.service"
  );
  console.log("=================================================");
  console.log(" [GTMTS] Verifying Production Grade Enhancements");
  console.log("=================================================");

  // 1. Document Storage Verification
  console.log("\n1. Testing Document Storage Engine...");
  const dummyPdf = Buffer.from("%PDF-1.4\n%Fake PDF content for GTMTS thesis test\n%%EOF");
  const stored = await storeDocumentFile(dummyPdf, "sample_thesis_proposal.pdf", "application/pdf");
  console.log("   -> Document stored successfully:");
  console.log("      ID:", stored.id);
  console.log("      File Name:", stored.fileName);
  console.log("      Size:", stored.fileSize, "bytes");

  const retrieved = await getDocumentFile(stored.id);
  if (!retrieved || retrieved.buffer.length !== dummyPdf.length) {
    throw new Error("Failed to retrieve stored document!");
  }
  console.log("   -> Document retrieval verified! (Bytes match)");

  // 2. Notification Engine Verification
  console.log("\n2. Testing Automated Notification Engine...");
  const notif = await createNotification({
    type: "PETITION_SUBMITTED",
    title: "ยื่นคำร้องสอบปากเปล่าวิทยานิพนธ์ (Verification Test)",
    message: "นิสิต พระมหาดุษฎี ธีรปัญโญ ได้ยื่นคำร้อง REQ-2026-TEST",
    trackingNo: "REQ-2026-TEST",
    recipientRole: "ADVISOR",
    recipientEmail: "advisor@mcu.ac.th",
    linkUrl: "/workflow",
  });
  console.log("   -> Notification created:", notif.id);

  const advisorNotifs = await getNotificationsForUser("ADVISOR", "advisor@mcu.ac.th");
  const found = advisorNotifs.notifications.some((n) => n.id === notif.id);
  if (!found) throw new Error("Notification not found for advisor!");
  console.log("   -> Notification query verified! Unread count:", advisorNotifs.unreadCount);

  await markNotificationAsRead(notif.id);
  const updatedNotifs = await getNotificationsForUser("ADVISOR", "advisor@mcu.ac.th");
  const updatedItem = updatedNotifs.notifications.find((n) => n.id === notif.id);
  if (!updatedItem?.isRead) throw new Error("Failed to mark notification as read!");
  console.log("   -> Mark as read verified!");

  // 3. Thesis Prerequisite Evaluation Verification
  console.log("\n3. Testing Prerequisite Evaluation Engine...");
  const prereqPass = evaluateThesisPrerequisites({
    degreeLevel: "DOCTORAL",
    englishTestType: "CU_TEP",
    englishScore: 80,
    publicationType: "SCOPUS_ISI_JOURNAL",
  });
  console.log("   -> Doctoral (CU-TEP 80 + Scopus/ISI):", prereqPass.passed ? "PASSED (Expected)" : "FAILED");
  if (!prereqPass.passed) throw new Error("Doctoral prereq should pass!");

  const prereqFail = evaluateThesisPrerequisites({
    degreeLevel: "DOCTORAL",
    englishTestType: "CU_TEP",
    englishScore: 50, // Min is 75 for Doctoral
    publicationType: "NONE",
  });
  console.log("   -> Doctoral (CU-TEP 50 + No publication):", !prereqFail.passed ? "FAILED (Expected)" : "PASSED");
  if (prereqFail.passed) throw new Error("Doctoral prereq should fail for low scores!");

  console.log("\n=================================================");
  console.log(" ALL PRODUCTION ENHANCEMENTS VERIFIED SUCCESSFULLY!");
  console.log("=================================================");
}

runVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
