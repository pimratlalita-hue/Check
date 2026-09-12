import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";
import { seedCore, seedUser } from "./lib/seed-core";
import { requireDatabaseUrl } from "./lib/require-database-url";

requireDatabaseUrl();
const prisma = new PrismaClient();

/** รหัสผ่านทุกบัญชีตัวอย่าง */
export const DEV_PASSWORD = "Passw0rd!vibe";

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.SEED_ALLOW_PROD !== "1") {
    console.error("[seed] ปฏิเสธ: NODE_ENV=production — ใช้ npm run db:bootstrap แทน");
    process.exit(1);
  }
  const core = await seedCore(prisma, { tenantCode: "DEMO", nameTh: "องค์กรตัวอย่าง", nameEn: "Sample Organization" });
  const hash = await bcrypt.hash(DEV_PASSWORD, 12);
  const users = [
    { email: "admin@app.local", name: "ผู้ดูแลสูงสุด (บัณฑิตวิทยาลัย)", roles: ["SUPER_ADMIN"] },
    { email: "advisor@app.local", name: "ผศ.ดร.สมชาย ใจดี (อาจารย์ที่ปรึกษา)", roles: ["ADVISOR"] },
    { email: "chair@app.local", name: "ศ.ดร.วิชาการ เข้มงวด (ประธานหลักสูตร)", roles: ["COMMITTEE_CHAIR"] },
    { email: "dean@app.local", name: "เจ้าหน้าที่บัณฑิตวิทยาลัย (งานวิชาการ)", roles: ["DEAN_OFFICE"] },
    { email: "student@app.local", name: "นายมานะ มีใจ (นิสิตปริญญาเอก)", roles: ["STUDENT"] },
    { email: "staff@app.local", name: "เจ้าหน้าที่", roles: ["STAFF"] },
    { email: "viewer@app.local", name: "ผู้ดู", roles: ["VIEWER"] },
    { email: "lockme@app.local", name: "บัญชีทดสอบล็อก", roles: ["VIEWER"] },
    { email: "forced@app.local", name: "บัญชีบังคับเปลี่ยนรหัส", roles: ["VIEWER"], mustChangePassword: true },
  ];
  for (const u of users) {
    await seedUser(prisma, core.tenantId, { ...u, passwordHash: hash, roleIds: u.roles.map((c) => core.roleIds[c]) });
  }

  // Seed sample faculty news articles
  const adminUser = await prisma.user.findFirst({ where: { email: "admin@app.local" } });
  const sampleArticles = [
    {
      slug: "faculty-open-house-2026",
      titleTh: "ขอเชิญร่วมงานเปิดบ้านคณะ นวัตกรรมและเทคโนโลยีแห่งอนาคต ประจำปี 2569",
      titleEn: "Faculty Open House 2026: Future Innovation and Emerging Technologies",
      summaryTh: "เปิดบ้านต้อนรับนักเรียน นิสิต นักศึกษา และผู้สนใจ พบกับผลงานนวัตกรรมและหลักสูตรระดับปริญญาตรีและบัณฑิตศึกษา",
      summaryEn: "Join us for the Faculty Open House 2026 featuring cutting-edge research, hands-on workshops, and program showcases.",
      contentTh: "คณะขอเชิญชวนคณาจารย์ นักวิจัย นิสิตนักศึกษา และบุคคลทั่วไป ร่วมงานเปิดบ้านประจำปี 2569 ภายในงานมีกิจกรรมหลากหลาย อาทิ การบรรยายพิเศษจากผู้เชี่ยวชาญระดับโลก นิทรรศการโครงงานวิทยานิพนธ์ และการแข่งขัน Hackathon ชิงเงินรางวัลรวมกว่า 100,000 บาท",
      contentEn: "The Faculty warmly invites students, researchers, and tech enthusiasts to attend Open House 2026. Activities include keynote speeches, graduate thesis exhibitions, and an exciting 24-hour Hackathon.",
      category: "EVENT" as const,
      status: "PUBLISHED" as const,
      isPinned: true,
      viewCount: 1420,
      coverImageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80",
      publishedAt: new Date("2026-09-01T09:00:00Z"),
    },
    {
      slug: "ai-generative-seminar-2026",
      titleTh: "งานสัมมนาวิชาการ: การประยุกต์ใช้ Generative AI ในการศึกษาระดับบัณฑิตวิทยาลัย",
      titleEn: "Academic Seminar: Applied Generative AI in Graduate Studies and Research",
      summaryTh: "เจาะลึกแนวทางการนำ AI และโมเดลภาษาขนาดใหญ่ (LLM) มาใช้ในการวิจัยทางวิชาการอย่างมีจริยธรรมและมีประสิทธิภาพ",
      summaryEn: "Explore the ethical and impactful integration of Large Language Models and AI in modern academic thesis research.",
      contentTh: "การสัมมนาครั้งนี้มุ่งเน้นการถ่ายทอดองค์ความรู้เกี่ยวกับเครื่องมือ AI ล่าสุด เช่น Gemini API และ Agentic Workflow เพื่อช่วยเพิ่มประสิทธิภาพการทำงานวิจัยของนิสิตปริญญาโท-เอก",
      contentEn: "This academic seminar presents the latest developments in AI tooling, including the Gemini API and agentic workflows for graduate students.",
      category: "ACADEMIC" as const,
      status: "PUBLISHED" as const,
      isPinned: true,
      viewCount: 890,
      coverImageUrl: "https://images.unsplash.com/photo-1591453089816-0fbb971b454c?w=1200&auto=format&fit=crop&q=80",
      publishedAt: new Date("2026-09-05T13:30:00Z"),
    },
    {
      slug: "scholarships-announcement-2569",
      titleTh: "ประกาศรับสมัครทุนการศึกษาระดับบัณฑิตศึกษา ประจำภาคเรียนที่ 1/2569",
      titleEn: "Call for Graduate Research Scholarship Applications (Semester 1/2026)",
      summaryTh: "เปิดรับสมัครทุนสนับสนุนการศึกษาวิจัยเต็มจำนวน สำหรับนิสิตระดับปริญญาโทและปริญญาเอกที่มีผลการเรียนดีเด่น",
      summaryEn: "Full-tuition and research stipend scholarships are now accepting applications for high-achieving master and doctoral candidates.",
      contentTh: "บัณฑิตวิทยาลัยและคณะประกาศเปิดรับสมัครทุนการศึกษาเพื่อส่งเสริมนักวิจัยรุ่นใหม่ ทุนครอบคลุมค่าธรรมเนียมการศึกษา ค่าใช้จ่ายรายเดือน และงบประมาณสนับสนุนการตีพิมพ์ในวารสารระดับนานาชาติ (Scopus/ISI)",
      contentEn: "The Faculty announces competitive scholarship opportunities covering full tuition, monthly stipends, and international conference publication grants.",
      category: "GENERAL" as const,
      status: "PUBLISHED" as const,
      isPinned: false,
      viewCount: 654,
      coverImageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80",
      publishedAt: new Date("2026-09-08T10:00:00Z"),
    },
    {
      slug: "procurement-cloud-cluster-2569",
      titleTh: "ประกาศจัดซื้อครุภัณฑ์เครื่องแม่ข่ายและระบบ High-Performance Computing ประจำปีงบประมาณ 2569",
      titleEn: "Procurement Bidding: High-Performance Computing Cluster and Server Infrastructure 2026",
      summaryTh: "ประกวดราคาอิเล็กทรอนิกส์ (e-bidding) สำหรับจัดซื้อระบบคลัสเตอร์เพื่อรองรับการประมวลผลโมเดล AI ขั้นสูง",
      summaryEn: "Electronic bidding announcement for the acquisition of an enterprise GPU cluster for advanced machine learning research.",
      contentTh: "คณะมีความประสงค์จะประกวดราคาซื้อระบบประมวลผลสมรรถนะสูง (HPC Cluster) ด้วยวิธีประกวดราคาอิเล็กทรอนิกส์ กำหนดยื่นข้อเสนอและใบเสนอราคาทางระบบ e-GP ภายในวันที่ 30 กันยายน 2569",
      contentEn: "The Faculty announces the tender for High-Performance Computing infrastructure. Interested vendors can submit proposals through the government e-GP system by September 30, 2026.",
      category: "PROCUREMENT" as const,
      status: "PUBLISHED" as const,
      isPinned: false,
      viewCount: 312,
      coverImageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80",
      publishedAt: new Date("2026-09-09T11:00:00Z"),
    },
    {
      slug: "curriculum-revision-plan-2027",
      titleTh: "(ร่าง) แผนการปรับปรุงหลักสูตรวิทยาศาสตรมหาบัณฑิต สาขาวิชาปัญญาประดิษฐ์และวิทยาการข้อมูล พ.ศ. 2570",
      titleEn: "(Draft) Curriculum Revision Framework: M.Sc. in Artificial Intelligence & Data Science 2027",
      summaryTh: "ร่างแผนพัฒนาและปรับปรุงหลักสูตรเพื่อรองรับมาตรฐานสากลและตลาดแรงงานยุคดิจิทัล",
      summaryEn: "Draft framework for updating graduate degree curricula to meet global tech standards.",
      contentTh: "ร่างข้อเสนอการปรับปรุงโครงสร้างรายวิชาและหัวข้อการทำวิทยานิพนธ์ กำลังอยู่ระหว่างการรับฟังความคิดเห็นจากผู้ทรงคุณวุฒิและผู้มีส่วนได้ส่วนเสีย",
      contentEn: "Draft curriculum updates currently undergoing stakeholder consultation and academic committee review.",
      category: "ACADEMIC" as const,
      status: "DRAFT" as const,
      isPinned: false,
      viewCount: 45,
      coverImageUrl: null,
      publishedAt: null,
    },
  ];

  for (const art of sampleArticles) {
    await prisma.newsArticle.upsert({
      where: {
        tenantId_slug: {
          tenantId: core.tenantId,
          slug: art.slug,
        },
      },
      update: {
        ...art,
        authorId: adminUser?.id,
      },
      create: {
        ...art,
        tenantId: core.tenantId,
        authorId: adminUser?.id,
      },
    });
  }

  // ═══════ SEED DEPARTMENTS ═══════
  const sampleDepts = [
    {
      code: "CPE",
      nameTh: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
      nameEn: "Department of Computer Engineering",
      descriptionTh: "มุ่งเน้นการวิจัยด้านสถาปัตยกรรมคอมพิวเตอร์ ระบบสมองกลฝังตัว และความมั่นคงปลอดภัยไซเบอร์",
      descriptionEn: "Focused on computer architectures, embedded systems, and cybersecurity.",
      displayOrder: 1,
    },
    {
      code: "IT",
      nameTh: "ภาควิชาเทคโนโลยีสารสนเทศ",
      nameEn: "Department of Information Technology",
      descriptionTh: "ศูนย์กลางการเรียนรู้ด้านวิศวกรรมซอฟต์แวร์ คลาวด์ และระบบสารสนเทศองค์กร",
      descriptionEn: "Hub for software engineering, cloud computing, and enterprise information systems.",
      displayOrder: 2,
    },
    {
      code: "DS",
      nameTh: "สาขาวิชาวิทยาการข้อมูลและปัญญาประดิษฐ์",
      nameEn: "Division of Data Science & Artificial Intelligence",
      descriptionTh: "พัฒนาผู้นำด้านการวิเคราะห์ข้อมูลขนาดใหญ่ การเรียนรู้ของเครื่อง และปัญญาประดิษฐ์ประยุกต์",
      descriptionEn: "Fostering leaders in big data analytics, machine learning, and applied AI.",
      displayOrder: 3,
    },
    {
      code: "ADMIN_OFFICE",
      nameTh: "สำนักงานคณบดีและกองบริหารงานทั่วไป",
      nameEn: "Office of the Dean & Administrative Division",
      descriptionTh: "งานสนับสนุนภารกิจด้านวิชาการ การบริหารทรัพยากรบุคคล และการบริการนักศึกษา",
      descriptionEn: "Supporting academic operations, human resources, and student services.",
      displayOrder: 4,
    },
  ];

  const deptMap = new Map<string, string>();
  for (const dept of sampleDepts) {
    const record = await prisma.department.upsert({
      where: {
        tenantId_code: {
          tenantId: core.tenantId,
          code: dept.code,
        },
      },
      update: dept,
      create: {
        ...dept,
        tenantId: core.tenantId,
      },
    });
    deptMap.set(dept.code, record.id);
  }

  // ═══════ SEED FACULTY & STAFF PROFILES ═══════
  const sampleStaff = [
    {
      departmentCode: "CPE",
      staffType: "ACADEMIC" as const,
      academicRank: "PROFESSOR" as const,
      prefixTh: "ศ.ดร.",
      prefixEn: "Prof. Dr.",
      firstNameTh: "ธนวัฒน์",
      lastNameTh: "สิริวัฒนากุล",
      firstNameEn: "Thanawat",
      lastNameEn: "Siriwattanakul",
      positionTh: "คณบดีคณะมนุษยศาสตร์",
      positionEn: "Dean, Faculty of Humanities",
      isExecutive: true,
      executiveRole: "คณบดี",
      executiveOrder: 1,
      email: "thanawat.s@faculty.ac.th",
      phone: "02-123-4501",
      officeRoom: "อาคาร 1 ชั้น 4 ห้อง 1401",
      officeHours: "วันพุธ 10:00 - 12:00 น.",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
      education: [
        "Ph.D. in Computer Engineering, Stanford University, USA",
        "M.Eng. in Electrical & Computer Engineering, Cornell University, USA",
        "วศ.บ. วิศวกรรมคอมพิวเตอร์ (เกียรตินิยมอันดับหนึ่ง), จุฬาลงกรณ์มหาวิทยาลัย",
      ],
      expertise: ["Artificial Intelligence", "High Performance Computing", "Computer Architecture", "Quantum Computing"],
      researchInterests: "สถาปัตยกรรมหน่วยประมวลผลสำหรับแบบจำลองปัญญาประดิษฐ์ขนาดใหญ่ และระบบคอมพิวเตอร์ประสิทธิภาพสูง",
      googleScholarUrl: "https://scholar.google.com/citations?user=sample1",
      scopusUrl: "https://www.scopus.com/authid/detail.uri?authorId=57200000001",
      orcidId: "0000-0002-1825-0001",
      websiteUrl: "https://faculty.ac.th/~thanawat",
      bioTh: "ศ.ดร. ธนวัฒน์ มีประสบการณ์วิจัยด้านวิศวกรรมคอมพิวเตอร์กว่า 20 ปี และได้รับรางวัลนักวิจัยดีเด่นแห่งชาติ",
      bioEn: "Prof. Dr. Thanawat has over 20 years of research experience in computer systems and parallel architectures.",
      displayOrder: 1,
    },
    {
      departmentCode: "IT",
      staffType: "ACADEMIC" as const,
      academicRank: "ASSOCIATE_PROFESSOR" as const,
      prefixTh: "รศ.ดร.",
      prefixEn: "Assoc. Prof. Dr.",
      firstNameTh: "นฤมล",
      lastNameTh: "เกียรติอนันต์",
      firstNameEn: "Narumon",
      lastNameEn: "Kiat-anan",
      positionTh: "รองคณบดีฝ่ายวิชาการและบัณฑิตศึกษา",
      positionEn: "Associate Dean for Academic & Graduate Affairs",
      isExecutive: true,
      executiveRole: "รองคณบดีฝ่ายวิชาการ",
      executiveOrder: 2,
      email: "narumon.k@faculty.ac.th",
      phone: "02-123-4502",
      officeRoom: "อาคาร 1 ชั้น 4 ห้อง 1403",
      officeHours: "วันอังคารและพฤหัสบดี 13:30 - 15:30 น.",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80",
      education: [
        "Ph.D. in Information Science, University of Washington, USA",
        "วท.ม. เทคโนโลยีสารสนเทศ, มหาวิทยาลัยมหิดล",
        "วท.บ. วิทยาการคอมพิวเตอร์, มหาวิทยาลัยเกษตรศาสตร์",
      ],
      expertise: ["Data Analytics", "Information Retrieval", "Educational Technology", "Human-Centered Computing"],
      researchInterests: "การประยุกต์ใช้เทคโนโลยีสารสนเทศเพื่อการจัดการเรียนรู้ระดับบัณฑิตศึกษาและการดึงสารสนเทศอัจฉริยะ",
      googleScholarUrl: "https://scholar.google.com/citations?user=sample2",
      scopusUrl: "https://www.scopus.com/authid/detail.uri?authorId=57200000002",
      orcidId: "0000-0002-1825-0002",
      websiteUrl: null,
      bioTh: "รศ.ดร. นฤมล เป็นผู้เชี่ยวชาญด้านระบบสารสนเทศเพื่อการศึกษาและการวิเคราะห์ข้อมูลพฤติกรรมการเรียนรู้",
      bioEn: "Assoc. Prof. Dr. Narumon specializes in educational informatics, information retrieval, and learning analytics.",
      displayOrder: 2,
    },
    {
      departmentCode: "DS",
      staffType: "ACADEMIC" as const,
      academicRank: "ASSISTANT_PROFESSOR" as const,
      prefixTh: "ผศ.ดร.",
      prefixEn: "Asst. Prof. Dr.",
      firstNameTh: "กิตติศักดิ์",
      lastNameTh: "พรหมรักษา",
      firstNameEn: "Kittisak",
      lastNameEn: "Promraksa",
      positionTh: "รองคณบดีฝ่ายวิจัยและนวัตกรรมดิจิทัล",
      positionEn: "Associate Dean for Research & Digital Innovation",
      isExecutive: true,
      executiveRole: "รองคณบดีฝ่ายวิจัย",
      executiveOrder: 3,
      email: "kittisak.p@faculty.ac.th",
      phone: "02-123-4503",
      officeRoom: "อาคาร 2 ชั้น 5 ห้อง 2512",
      officeHours: "วันจันทร์ 14:00 - 16:00 น.",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
      education: [
        "Ph.D. in Computer Science, National University of Singapore (NUS)",
        "วท.ม. วิทยาการคอมพิวเตอร์, สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง",
        "วศ.บ. วิศวกรรมคอมพิวเตอร์, จุฬาลงกรณ์มหาวิทยาลัย",
      ],
      expertise: ["Natural Language Processing", "Large Language Models", "Deep Learning", "Knowledge Graphs"],
      researchInterests: "การประมวลผลภาษาธรรมชาติภาษาไทย โมเดลภาษาขนาดใหญ่ และการสร้างกราฟความรู้สำหรับข้อมูลการแพทย์",
      googleScholarUrl: "https://scholar.google.com/citations?user=sample3",
      scopusUrl: "https://www.scopus.com/authid/detail.uri?authorId=57200000003",
      orcidId: "0000-0002-1825-0003",
      websiteUrl: "https://ai-lab.faculty.ac.th",
      bioTh: "หัวหน้าห้องปฏิบัติการ AI & NLP มีผลงานตีพิมพ์ใน ACL, EMNLP และ IEEE Transactions",
      bioEn: "Head of AI & NLP Lab with research publications in top-tier conferences and journals.",
      displayOrder: 3,
    },
    {
      departmentCode: "CPE",
      staffType: "ACADEMIC" as const,
      academicRank: "ASSISTANT_PROFESSOR" as const,
      prefixTh: "ผศ.ดร.",
      prefixEn: "Asst. Prof. Dr.",
      firstNameTh: "วรพงษ์",
      lastNameTh: "ลิขิตตระกูล",
      firstNameEn: "Worapong",
      lastNameEn: "Likhittrakul",
      positionTh: "หัวหน้าภาควิชาวิศวกรรมคอมพิวเตอร์",
      positionEn: "Head of Computer Engineering Department",
      isExecutive: false,
      executiveRole: null,
      executiveOrder: null,
      email: "worapong.l@faculty.ac.th",
      phone: "02-123-4510",
      officeRoom: "อาคาร 2 ชั้น 3 ห้อง 2302",
      officeHours: "วันอังคาร 10:00 - 12:00 น.",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80",
      education: [
        "Ph.D. in Cybersecurity, Georgia Institute of Technology, USA",
        "วศ.ม. วิศวกรรมโทรคมนาคม, มหาวิทยาลัยธรรมศาสตร์",
        "วศ.บ. วิศวกรรมคอมพิวเตอร์, มหาวิทยาลัยเชียงใหม่",
      ],
      expertise: ["Cybersecurity", "Network Infrastructure", "Cloud Security", "IoT Systems"],
      researchInterests: "การตรวจจับการโจมตีทางไซเบอร์ด้วยปัญญาประดิษฐ์ และสถาปัตยกรรม Zero-Trust",
      googleScholarUrl: "https://scholar.google.com/citations?user=sample4",
      scopusUrl: null,
      orcidId: "0000-0002-1825-0004",
      websiteUrl: null,
      bioTh: "ผู้เชี่ยวชาญด้านความปลอดภัยทางไซเบอร์และที่ปรึกษาองค์กรภาครัฐและเอกชน",
      bioEn: "Cybersecurity specialist and technical consultant for government and enterprise security systems.",
      displayOrder: 4,
    },
    {
      departmentCode: "DS",
      staffType: "ACADEMIC" as const,
      academicRank: "ASSOCIATE_PROFESSOR" as const,
      prefixTh: "รศ.ดร.",
      prefixEn: "Assoc. Prof. Dr.",
      firstNameTh: "ภัทรภร",
      lastNameTh: "วรากร",
      firstNameEn: "Pattaraporn",
      lastNameEn: "Warakorn",
      positionTh: "ประธานหลักสูตรวิทยาการข้อมูลและปัญญาประดิษฐ์",
      positionEn: "Chair of Data Science & AI Curriculum",
      isExecutive: false,
      executiveRole: null,
      executiveOrder: null,
      email: "pattaraporn.w@faculty.ac.th",
      phone: "02-123-4520",
      officeRoom: "อาคาร 3 ชั้น 4 ห้อง 3415",
      officeHours: "วันพฤหัสบดี 14:00 - 16:00 น.",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&auto=format&fit=crop&q=80",
      education: [
        "Ph.D. in Computational Biology, Imperial College London, UK",
        "วท.ม. ชีวสารสนเทศศาสตร์, จุฬาลงกรณ์มหาวิทยาลัย",
        "วท.บ. สถิติประยุกต์, มหาวิทยาลัยขอนแก่น",
      ],
      expertise: ["Bioinformatics", "Genomics Data Science", "Big Data Analytics", "Statistical Modeling"],
      researchInterests: "การวิเคราะห์ข้อมูลพันธุศาสตร์เชิงคำนวณและการทำนายโรคทางพันธุกรรมด้วย Machine Learning",
      googleScholarUrl: "https://scholar.google.com/citations?user=sample5",
      scopusUrl: "https://www.scopus.com/authid/detail.uri?authorId=57200000005",
      orcidId: "0000-0002-1825-0005",
      websiteUrl: null,
      bioTh: "นักวิจัยผู้บุกเบิกงานวิจัยด้านชีวสารสนเทศศาสตร์และการวิเคราะห์ข้อมูลจีโนมิกส์ในประเทศไทย",
      bioEn: "Pioneering researcher in bioinformatics and genomic data science in Southeast Asia.",
      displayOrder: 5,
    },
    {
      departmentCode: "IT",
      staffType: "ACADEMIC" as const,
      academicRank: "LECTURER" as const,
      prefixTh: "ดร.",
      prefixEn: "Dr.",
      firstNameTh: "ศุภชัย",
      lastNameTh: "อภิวัฒนานันท์",
      firstNameEn: "Supachai",
      lastNameEn: "Apiwathananun",
      positionTh: "อาจารย์ประจำภาควิชาเทคโนโลยีสารสนเทศ",
      positionEn: "Lecturer in Information Technology",
      isExecutive: false,
      executiveRole: null,
      executiveOrder: null,
      email: "supachai.a@faculty.ac.th",
      phone: "02-123-4512",
      officeRoom: "อาคาร 2 ชั้น 3 ห้อง 2308",
      officeHours: "วันศุกร์ 13:00 - 15:00 น.",
      avatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&auto=format&fit=crop&q=80",
      education: [
        "Ph.D. in Information Systems, University of Melbourne, Australia",
        "วท.ม. วิศวกรรมซอฟต์แวร์, จุฬาลงกรณ์มหาวิทยาลัย",
        "วท.บ. เทคโนโลยีสารสนเทศ, สถาบันเทคโนโลยีพระจอมเกล้าธนบุรี",
      ],
      expertise: ["Software Engineering", "Human-Computer Interaction (HCI)", "Cloud Native", "FinTech"],
      researchInterests: "วิศวกรรมความต้องการซอฟต์แวร์ และการออกแบบระบบคลาวด์เนทีฟที่ปลอดภัย",
      googleScholarUrl: "https://scholar.google.com/citations?user=sample6",
      scopusUrl: null,
      orcidId: "0000-0002-1825-0006",
      websiteUrl: null,
      bioTh: "อาจารย์ผู้สอนวิชาวิศวกรรมซอฟต์แวร์และการพัฒนาเว็บแอพพลิเคชันสมัยใหม่",
      bioEn: "Lecturer teaching modern software engineering, web architectures, and user experience design.",
      displayOrder: 6,
    },
    {
      departmentCode: "DS",
      staffType: "ACADEMIC" as const,
      academicRank: "LECTURER" as const,
      prefixTh: "ดร.",
      prefixEn: "Dr.",
      firstNameTh: "จันทิมา",
      lastNameTh: "สุขประเสริฐ",
      firstNameEn: "Jantima",
      lastNameEn: "Sukprasert",
      positionTh: "อาจารย์ประจำสาขาวิชาวิทยาการข้อมูล",
      positionEn: "Lecturer in Data Science",
      isExecutive: false,
      executiveRole: null,
      executiveOrder: null,
      email: "jantima.s@faculty.ac.th",
      phone: "02-123-4522",
      officeRoom: "อาคาร 3 ชั้น 4 ห้อง 3418",
      officeHours: "วันพุธ 14:00 - 16:00 น.",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80",
      education: [
        "Ph.D. in Computer Science, Tokyo Institute of Technology, Japan",
        "วศ.ม. วิศวกรรมคอมพิวเตอร์, สถาบันเทคโนโลยีแห่งเอเชีย (AIT)",
        "วท.บ. วิทยาการคอมพิวเตอร์, มหาวิทยาลัยสงขลานครินทร์",
      ],
      expertise: ["Computer Vision", "Medical Imaging", "Autonomous Systems", "Generative AI"],
      researchInterests: "การวิเคราะห์ภาพถ่ายทางการแพทย์ด้วยการมองเห็นของเครื่อง และแบบจำลอง Generative Diffusion",
      googleScholarUrl: "https://scholar.google.com/citations?user=sample7",
      scopusUrl: "https://www.scopus.com/authid/detail.uri?authorId=57200000007",
      orcidId: "0000-0002-1825-0007",
      websiteUrl: null,
      bioTh: "นักวิจัยด้านคอมพิวเตอร์วิทัศน์ทางการแพทย์ และการประยุกต์ใช้โมเดลแพร่กระจายสำหรับงานภาพถ่าย",
      bioEn: "Specialist in biomedical computer vision and generative diffusion modeling.",
      displayOrder: 7,
    },
    {
      departmentCode: "ADMIN_OFFICE",
      staffType: "SUPPORT" as const,
      academicRank: "NONE" as const,
      prefixTh: "นาง",
      prefixEn: "Mrs.",
      firstNameTh: "พิสมัย",
      lastNameTh: "มั่นคง",
      firstNameEn: "Pisamai",
      lastNameEn: "Mankong",
      positionTh: "ผู้อำนวยการกองบริหารงานทั่วไปประจำคณะ",
      positionEn: "Director of General Administrative Division",
      isExecutive: false,
      executiveRole: null,
      executiveOrder: null,
      email: "pisamai.m@faculty.ac.th",
      phone: "02-123-4599",
      officeRoom: "อาคาร 1 ชั้น 2 ห้องบริหารกลาง",
      officeHours: "จันทร์-ศุกร์ 08:30 - 16:30 น.",
      avatarUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&auto=format&fit=crop&q=80",
      education: [
        "รป.ม. รัฐประศาสนศาสตรมหาบัณฑิต, สถาบันบัณฑิตพัฒนบริหารศาสตร์ (NIDA)",
        "ศศ.บ. การจัดการทั่วไป, มหาวิทยาลัยรามคำแหง",
      ],
      expertise: ["Faculty Administration", "Academic Personnel Management", "Procurement & Fiscal Control"],
      researchInterests: null,
      googleScholarUrl: null,
      scopusUrl: null,
      orcidId: null,
      websiteUrl: null,
      bioTh: "หัวหน้างานบริหารที่มีประสบการณ์บริหารงานมหาวิทยาลัยกว่า 15 ปี ดูแลงานธุรการ การเงิน และพัสดุ",
      bioEn: "Experienced university administrator overseeing operational budgets, personnel, and faculty governance.",
      displayOrder: 8,
    },
  ];

  for (const s of sampleStaff) {
    const departmentId = s.departmentCode ? deptMap.get(s.departmentCode) ?? null : null;
    const { departmentCode, ...staffData } = s;
    void departmentCode;

    const existing = await prisma.staffProfile.findFirst({
      where: {
        tenantId: core.tenantId,
        email: staffData.email,
      },
    });

    if (existing) {
      await prisma.staffProfile.update({
        where: { id: existing.id },
        data: {
          ...staffData,
          departmentId,
        },
      });
    } else {
      await prisma.staffProfile.create({
        data: {
          ...staffData,
          tenantId: core.tenantId,
          departmentId,
        },
      });
    }
  }

  // Seed sample Academic Programs and Courses
  const samplePrograms = [
    {
      code: "CS-BS-2565",
      nameTh: "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์",
      nameEn: "Bachelor of Science Program in Computer Science",
      degreeTh: "วิทยาศาสตรบัณฑิต (วิทยาการคอมพิวเตอร์)",
      degreeEn: "Bachelor of Science (Computer Science)",
      degreeShortTh: "วท.บ. (วิทยาการคอมพิวเตอร์)",
      degreeShortEn: "B.Sc. (Computer Science)",
      level: "BACHELOR" as const,
      type: "THAI" as const,
      status: "ACTIVE" as const,
      slug: "bachelor-computer-science",
      totalCredits: 128,
      studyDuration: "4 ปี (8 ภาคการศึกษา)",
      tuitionFee: "21,000 บาท / ภาคการศึกษา",
      descriptionTh: "หลักสูตรมาตรฐานสากลเน้นผลิตบัณฑิตที่มีทักษะการคิดวิเคราะห์ พัฒนาระบบซอฟต์แวร์ และปัญญาประดิษฐ์",
      descriptionEn: "A comprehensive degree curriculum focusing on software engineering, algorithm design, and AI applications.",
      philosophyTh: "มุ่งเน้นการผลิตบัณฑิตที่มีความรู้ความเชี่ยวชาญทั้งทฤษฎีและปฏิบัติการด้านวิทยาการคอมพิวเตอร์ มีคุณธรรมจริยธรรม และสามารถสร้างสรรค์นวัตกรรมดิจิทัลระดับสากล",
      philosophyEn: "Cultivating innovative computer scientists with strong theoretical grounding, practical engineering mastery, and ethical commitment.",
      careerPaths: ["Software Engineer", "Full-Stack Developer", "Data Scientist", "Cloud Architect", "System Analyst"],
      learningOutcomes: [
        { code: "PLO1", descTh: "มีความรู้ความเข้าใจในหลักการทางวิทยาการคอมพิวเตอร์และวิศวกรรมซอฟต์แวร์", descEn: "Understand fundamental computer science principles and software engineering best practices" },
        { code: "PLO2", descTh: "สามารถออกแบบ พัฒนา และทดสอบระบบซอฟต์แวร์ที่มีความซับซ้อนได้อย่างมีประสิทธิภาพ", descEn: "Design, implement, and verify high-performance complex software systems" },
        { code: "PLO3", descTh: "สามารถประยุกต์ใช้อัลกอริทึมและเทคโนโลยีปัญญาประดิษฐ์ในการแก้ปัญหาจริงขององค์กร", descEn: "Apply algorithmic thinking and AI technologies to resolve enterprise domain challenges" },
      ],
      handbookUrl: "https://example.com/handbooks/morkor2-cs-bs.pdf",
      imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000&auto=format&fit=crop&q=80",
      departmentCode: "CPE",
      displayOrder: 1,
      courses: [
        { code: "01418111", nameTh: "การเขียนโปรแกรมคอมพิวเตอร์ 1", nameEn: "Computer Programming I", credits: 3, creditHours: "3(2-2-5)", category: "CORE_COURSE" as const, year: 1, semester: 1 },
        { code: "01418112", nameTh: "การเขียนโปรแกรมคอมพิวเตอร์ 2", nameEn: "Computer Programming II", credits: 3, creditHours: "3(2-2-5)", category: "CORE_COURSE" as const, year: 1, semester: 2, prerequisite: "01418111" },
        { code: "01418211", nameTh: "โครงสร้างข้อมูลและขั้นตอนวิธี", nameEn: "Data Structures and Algorithms", credits: 3, creditHours: "3(3-0-6)", category: "CORE_COURSE" as const, year: 2, semester: 1, prerequisite: "01418112" },
        { code: "01418221", nameTh: "ระบบการจัดการฐานข้อมูล", nameEn: "Database Management Systems", credits: 3, creditHours: "3(2-2-5)", category: "CORE_COURSE" as const, year: 2, semester: 2 },
        { code: "01418381", nameTh: "ปัญญาประดิษฐ์เบื้องต้น", nameEn: "Introduction to Artificial Intelligence", credits: 3, creditHours: "3(3-0-6)", category: "MAJOR_ELECTIVE" as const, year: 3, semester: 1 },
        { code: "01418499", nameTh: "โครงงานวิทยาการคอมพิวเตอร์", nameEn: "Computer Science Senior Project", credits: 3, creditHours: "3(0-6-3)", category: "THESIS" as const, year: 4, semester: 2 },
      ],
    },
    {
      code: "AI-BS-2566",
      nameTh: "หลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาปัญญาประดิษฐ์และวิทยาศาสตร์ข้อมูล (นานาชาติ)",
      nameEn: "Bachelor of Science in Artificial Intelligence and Data Science (International Program)",
      degreeTh: "วิทยาศาสตรบัณฑิต (ปัญญาประดิษฐ์และวิทยาศาสตร์ข้อมูล)",
      degreeEn: "Bachelor of Science (Artificial Intelligence and Data Science)",
      degreeShortTh: "วท.บ. (ปัญญาประดิษฐ์และวิทยาศาสตร์ข้อมูล)",
      degreeShortEn: "B.Sc. (AI & Data Science)",
      level: "BACHELOR" as const,
      type: "INTERNATIONAL" as const,
      status: "ACTIVE" as const,
      slug: "bachelor-ai-datascience-inter",
      totalCredits: 132,
      studyDuration: "4 Years (8 Semesters)",
      tuitionFee: "65,000 THB / Semester",
      descriptionTh: "หลักสูตรนานาชาติมุ่งเน้นการสร้างโมเดล Machine Learning, Deep Learning, Big Data และ Generative AI",
      descriptionEn: "Cutting-edge international curriculum covering deep learning, big data analytics, and autonomous intelligent agents.",
      philosophyTh: "สรรสร้างผู้นำทางเทคโนโลยีปัญญาประดิษฐ์ที่เข้าใจทั้งคณิตศาสตร์ขั้นสูง วิทยาศาสตร์ข้อมูล และจริยธรรมของ AI",
      philosophyEn: "Empowering visionary AI innovators with rigorous mathematical foundations, practical data expertise, and ethical awareness.",
      careerPaths: ["AI Engineer", "Machine Learning Researcher", "Data Engineer", "MLOps Engineer", "Robotics Specialist"],
      learningOutcomes: [
        { code: "PLO1", descTh: "สร้างและปรับแต่งโมเดลการเรียนรู้เชิงลึกสำหรับงาน Computer Vision และ NLP", descEn: "Build and optimize deep neural models for computer vision and natural language tasks" },
        { code: "PLO2", descTh: "บริหารจัดการสถาปัตยกรรมข้อมูลขนาดใหญ่และกระบวนการ MLOps บนคลาวด์", descEn: "Architect enterprise big data pipelines and deploy production-grade MLOps workflows" },
      ],
      handbookUrl: "https://example.com/handbooks/morkor2-ai-bs.pdf",
      imageUrl: "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=1000&auto=format&fit=crop&q=80",
      departmentCode: "AI",
      displayOrder: 2,
      courses: [
        { code: "01420101", nameTh: "คณิตศาสตร์และสถิติสำหรับปัญญาประดิษฐ์", nameEn: "Mathematics and Statistics for AI", credits: 3, creditHours: "3(3-0-6)", category: "CORE_COURSE" as const, year: 1, semester: 1 },
        { code: "01420202", nameTh: "การเรียนรู้ของเครื่องเบื้องต้น", nameEn: "Foundations of Machine Learning", credits: 3, creditHours: "3(2-2-5)", category: "CORE_COURSE" as const, year: 2, semester: 1 },
        { code: "01420303", nameTh: "การเรียนรู้เชิงลึกและโครงข่ายประสาทเทียม", nameEn: "Deep Learning and Neural Networks", credits: 3, creditHours: "3(2-2-5)", category: "CORE_COURSE" as const, year: 3, semester: 1, prerequisite: "01420202" },
        { code: "01420499", nameTh: "โครงงานนวัตกรรมปัญญาประดิษฐ์", nameEn: "AI Capstone Innovation Project", credits: 3, creditHours: "3(0-6-3)", category: "THESIS" as const, year: 4, semester: 2 },
      ],
    },
    {
      code: "CPE-MS-2565",
      nameTh: "หลักสูตรวิศวกรรมศาสตรมหาบัณฑิต สาขาวิชาวิศวกรรมคอมพิวเตอร์",
      nameEn: "Master of Engineering Program in Computer Engineering",
      degreeTh: "วิศวกรรมศาสตรมหาบัณฑิต (วิศวกรรมคอมพิวเตอร์)",
      degreeEn: "Master of Engineering (Computer Engineering)",
      degreeShortTh: "วศ.ม. (วิศวกรรมคอมพิวเตอร์)",
      degreeShortEn: "M.Eng. (Computer Engineering)",
      level: "MASTER" as const,
      type: "THAI" as const,
      status: "ACTIVE" as const,
      slug: "master-computer-engineering",
      totalCredits: 36,
      studyDuration: "2 ปี (4 ภาคการศึกษา)",
      tuitionFee: "35,000 บาท / ภาคการศึกษา",
      descriptionTh: "หลักสูตรระดับบัณฑิตศึกษา มุ่งเน้นการวิจัยเชิงลึกด้านระบบสมองกลฝังตัว เครือข่ายคอมพิวเตอร์ และความมั่นคงไซเบอร์",
      descriptionEn: "Graduate research program focusing on embedded cyber-physical systems, secure networks, and IoT.",
      philosophyTh: "พัฒนาศักยภาพนักวิจัยและวิศวกรระดับสูงเพื่อขับเคลื่อนอุตสาหกรรมเทคโนโลยีขั้นสูงของประเทศ",
      philosophyEn: "Fostering elite engineering researchers to accelerate national deep-tech industry capabilities.",
      careerPaths: ["Lead Computer Architect", "Cybersecurity Principal", "Embedded Systems Director", "Academic Lecturer"],
      learningOutcomes: [
        { code: "PLO1", descTh: "ดำเนินการวิจัยและสร้างสรรค์องค์ความรู้ใหม่ทางวิศวกรรมคอมพิวเตอร์", descEn: "Conduct independent research contributing novel engineering methodologies" },
        { code: "PLO2", descTh: "เผยแพร่ผลงานวิจัยในวารสารวิชาการระดับนานาชาติที่ได้รับการยอมรับ", descEn: "Publish scholarly contributions in international peer-reviewed journals" },
      ],
      handbookUrl: "https://example.com/handbooks/morkor2-cpe-ms.pdf",
      imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1000&auto=format&fit=crop&q=80",
      departmentCode: "CPE",
      displayOrder: 3,
      courses: [
        { code: "01204511", nameTh: "สถาปัตยกรรมคอมพิวเตอร์ขั้นสูง", nameEn: "Advanced Computer Architecture", credits: 3, creditHours: "3(3-0-6)", category: "CORE_COURSE" as const, year: 1, semester: 1 },
        { code: "01204522", nameTh: "ความมั่นคงปลอดภัยไซเบอร์ขั้นสูง", nameEn: "Advanced Cyber Security", credits: 3, creditHours: "3(3-0-6)", category: "CORE_COURSE" as const, year: 1, semester: 2 },
        { code: "01204599", nameTh: "วิทยานิพนธ์ปริญญาโท", nameEn: "Master's Thesis", credits: 12, creditHours: "12(0-36-0)", category: "THESIS" as const, year: 2, semester: 1 },
      ],
    },
    {
      code: "CS-PHD-2566",
      nameTh: "หลักสูตรปรัชญาดุษฎีบัณฑิต สาขาวิชาวิทยาการคอมพิวเตอร์ (นานาชาติ)",
      nameEn: "Doctor of Philosophy Program in Computer Science (International Program)",
      degreeTh: "ปรัชญาดุษฎีบัณฑิต (วิทยาการคอมพิวเตอร์)",
      degreeEn: "Doctor of Philosophy (Computer Science)",
      degreeShortTh: "ปร.ด. (วิทยาการคอมพิวเตอร์)",
      degreeShortEn: "Ph.D. (Computer Science)",
      level: "DOCTORAL" as const,
      type: "INTERNATIONAL" as const,
      status: "ACTIVE" as const,
      slug: "phd-computer-science-inter",
      totalCredits: 48,
      studyDuration: "3 Years (6 Semesters)",
      tuitionFee: "75,000 THB / Semester",
      descriptionTh: "หลักสูตรปริญญาเอกระดับนานาชาติ เน้นการทำวิทยานิพนธ์และการสร้างองค์ความรู้ระดับแนวหน้าของโลก",
      descriptionEn: "Elite doctoral research program dedicated to groundbreaking computer science discoveries.",
      philosophyTh: "สร้างผู้นำทางวิชาการและนักวิจัยชั้นนำที่มีความเชี่ยวชาญระดับสากล",
      philosophyEn: "Inspiring world-class research leaders and academic faculty with transformative impact.",
      careerPaths: ["University Professor", "Principal Research Scientist", "Chief Technology Officer (CTO)", "AI Research Fellow"],
      learningOutcomes: [
        { code: "PLO1", descTh: "สร้างทฤษฎีหรือนวัตกรรมใหม่ทางวิทยาการคอมพิวเตอร์ที่ได้รับการยอมรับในระดับสากล", descEn: "Establish novel theories and paradigms accepted by the global computing community" },
      ],
      handbookUrl: "https://example.com/handbooks/morkor2-cs-phd.pdf",
      imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1000&auto=format&fit=crop&q=80",
      departmentCode: "CPE",
      displayOrder: 4,
      courses: [
        { code: "01418691", nameTh: "ระเบียบวิธีวิจัยขั้นสูงทางวิทยาการคอมพิวเตอร์", nameEn: "Advanced Research Methodology in Computer Science", credits: 3, creditHours: "3(3-0-6)", category: "CORE_COURSE" as const, year: 1, semester: 1 },
        { code: "01418699", nameTh: "ดุษฎีนิพนธ์", nameEn: "Doctoral Dissertation", credits: 36, creditHours: "36(0-108-0)", category: "THESIS" as const, year: 2, semester: 1 },
      ],
    },
    {
      code: "AI-CERT-2567",
      nameTh: "หลักสูตรประกาศนียบัตร ปัญญาประดิษฐ์เชิงสร้างสรรค์และการประยุกต์ใช้งาน (Non-Degree)",
      nameEn: "Certificate Program in Applied Generative AI for Modern Enterprise",
      degreeTh: "ประกาศนียบัตร (ปัญญาประดิษฐ์เชิงสร้างสรรค์)",
      degreeEn: "Certificate in Applied Generative AI",
      degreeShortTh: "ป.ปัญญาประดิษฐ์",
      degreeShortEn: "Cert. Applied GenAI",
      level: "CERTIFICATE" as const,
      type: "THAI" as const,
      status: "ACTIVE" as const,
      slug: "cert-generative-ai",
      totalCredits: 9,
      studyDuration: "3 เดือน (วันเสาร์-อาทิตย์)",
      tuitionFee: "18,000 บาท / ตลอดหลักสูตร",
      descriptionTh: "หลักสูตร Upskill/Reskill สำหรับบุคคลทั่วไปและคนทำงาน มุ่งเน้นการประยุกต์ใช้ LLMs, Prompt Engineering, และ AI Agents ในการทำงาน",
      descriptionEn: "Short-cycle executive training on Generative AI, prompt architecture, and multi-agent system automation.",
      philosophyTh: "เปิดโอกาสการเรียนรู้ตลอดชีวิตเพื่อยกระดับทักษะแรงงานดิจิทัลของประเทศ",
      philosophyEn: "Promoting lifelong learning and practical digital upskilling for the AI-driven workforce.",
      careerPaths: ["Prompt Engineer", "AI Product Specialist", "Digital Transformation Consultant"],
      learningOutcomes: [
        { code: "PLO1", descTh: "สามารถประยุกต์ใช้ Generative AI ในกระบวนการทำงานจริงเพื่อเพิ่มผลผลิตอย่างน้อย 3 เท่า", descEn: "Deploy generative AI workflows to amplify enterprise productivity" },
      ],
      handbookUrl: null,
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80",
      departmentCode: "AI",
      displayOrder: 5,
      courses: [
        { code: "01499101", nameTh: "พื้นฐาน Generative AI และโมเดลภาษาขนาดใหญ่", nameEn: "Foundations of Generative AI and LLMs", credits: 3, creditHours: "3(2-2-5)", category: "CORE_COURSE" as const, year: 1, semester: 1 },
        { code: "01499102", nameTh: "การสร้างแอปพลิเคชันด้วย Agentic Workflows", nameEn: "Building Agentic Workflows and Automation", credits: 3, creditHours: "3(2-2-5)", category: "CORE_COURSE" as const, year: 1, semester: 1 },
        { code: "01499103", nameTh: "โครงงานประยุกต์ AI สำหรับภาคธุรกิจ", nameEn: "Capstone Enterprise AI Project", credits: 3, creditHours: "3(1-4-4)", category: "THESIS" as const, year: 1, semester: 1 },
      ],
    },
  ];

  for (const p of samplePrograms) {
    const departmentId = p.departmentCode ? deptMap.get(p.departmentCode) ?? null : null;
    const { departmentCode, courses, ...programData } = p;
    void departmentCode;

    const existingProgram = await prisma.program.findFirst({
      where: {
        tenantId: core.tenantId,
        code: programData.code,
      },
    });

    let programId: string;
    if (existingProgram) {
      await prisma.program.update({
        where: { id: existingProgram.id },
        data: {
          ...programData,
          departmentId,
        },
      });
      programId = existingProgram.id;
    } else {
      const created = await prisma.program.create({
        data: {
          ...programData,
          tenantId: core.tenantId,
          departmentId,
        },
      });
      programId = created.id;
    }

    // Seed courses for program
    for (const c of courses) {
      const existingCourse = await prisma.programCourse.findFirst({
        where: {
          programId,
          code: c.code,
        },
      });

      if (existingCourse) {
        await prisma.programCourse.update({
          where: { id: existingCourse.id },
          data: c,
        });
      } else {
        await prisma.programCourse.create({
          data: {
            ...c,
            programId,
          },
        });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Seed Workflow & Academic Petitions (ระบบคำร้องและอนุมัติเอกสารออนไลน์)
  // ---------------------------------------------------------------------------
  const defaultProgram = await prisma.program.findFirst({
    where: { tenantId: core.tenantId },
  });
  const advisors = await prisma.staffProfile.findMany({
    where: { tenantId: core.tenantId },
    take: 3,
  });

  const samplePetitions = [
    {
      trackingNo: "REQ-2026-0001",
      type: "THESIS_TOPIC_APPROVAL" as const,
      status: "COMPLETED" as const,
      currentStep: 4,
      title: "ขออนุมัติหัวข้อและเค้าโครงวิทยานิพนธ์: สถาปัตยกรรมแบบกระจายศูนย์สำหรับระบบ IoT ทางการแพทย์",
      description: "ขอยื่นเสนอหัวข้อวิทยานิพนธ์และเค้าโครงวิจัยฉบับสมบูรณ์ พร้อมแผนการดำเนินงานวิจัย 4 ภาคการศึกษา",
      studentId: "65070012",
      studentName: "นายภานุวัฒน์ ศรีสมุทร",
      studentEmail: "phanuwat.s@univ.ac.th",
      studentPhone: "0812345678",
      thesisTitleTh: "สถาปัตยกรรมแบบกระจายศูนย์สำหรับระบบ IoT ทางการแพทย์",
      thesisTitleEn: "Decentralized Architecture for Medical IoT Healthcare Systems",
      attachmentUrl: "https://storage.univ.ac.th/thesis/proposals/REQ-2026-0001.pdf",
      programId: defaultProgram?.id,
      advisorId: advisors[0]?.id,
      activities: [
        {
          actorName: "นายภานุวัฒน์ ศรีสมุทร",
          actorRole: "STUDENT",
          action: "SUBMIT" as const,
          previousStatus: null,
          newStatus: "SUBMITTED" as const,
          comment: "ยื่นคำร้องขออนุมัติหัวข้อและเค้าโครงวิทยานิพนธ์ฉบับสมบูรณ์",
        },
        {
          actorName: advisors[0] ? `${advisors[0].prefixTh ?? ""}${advisors[0].firstNameTh} ${advisors[0].lastNameTh}`.trim() : "ศ.ดร.วิชัย บัณฑิตไพศาล",
          actorRole: "ADVISOR",
          action: "APPROVE" as const,
          previousStatus: "SUBMITTED" as const,
          newStatus: "ADVISOR_APPROVED" as const,
          comment: "หัวข้อวิจัยและระเบียบวิธีวิจัยมีความถูกต้อง เหมาะสมตามเกณฑ์มาตรฐานระดับปริญญาโท",
        },
        {
          actorName: "รศ.ดร.อานนท์ วิชาการ",
          actorRole: "PROGRAM_CHAIR",
          action: "APPROVE" as const,
          previousStatus: "ADVISOR_APPROVED" as const,
          newStatus: "CHAIR_APPROVED" as const,
          comment: "คณะกรรมการบริหารหลักสูตรพิจารณาให้ความเห็นชอบ ส่งต่อสำนักงานคณบดี",
        },
        {
          actorName: "สำนักงานคณบดี / บัณฑิตวิทยาลัย",
          actorRole: "DEAN_OFFICE",
          action: "APPROVE" as const,
          previousStatus: "CHAIR_APPROVED" as const,
          newStatus: "COMPLETED" as const,
          comment: "อนุมัติแต่งตั้งอาจารย์ที่ปรึกษาวิทยานิพนธ์และหัวข้อวิทยานิพนธ์อย่างเป็นทางการ",
        },
      ],
    },
    {
      trackingNo: "REQ-2026-0002",
      type: "DEFENSE_EXAM_REQUEST" as const,
      status: "CHAIR_APPROVED" as const,
      currentStep: 3,
      title: "ขอสอบปากเปล่าวิทยานิพนธ์ขั้นสุดท้าย ประจำภาคการศึกษาที่ 2/2569",
      description: "ขอยื่นขอสอบปากเปล่าวิทยานิพนธ์ โดยได้ดำเนินการวิจัยเสร็จสิ้น ตีพิมพ์บทความวิชาการในฐานข้อมูล Scopus เรียบร้อยแล้ว",
      studentId: "64070005",
      studentName: "น.ส.กานต์พิชชา ฤทธิ์ประเสริฐ",
      studentEmail: "karnpitcha.r@univ.ac.th",
      studentPhone: "0898765432",
      thesisTitleTh: "โมเดลภาษาขนาดใหญ่สำหรับการวิเคราะห์ข้อมูลทางการแพทย์ภาษาไทย",
      thesisTitleEn: "Large Language Models for Thai Clinical Document Analysis",
      attachmentUrl: "https://storage.univ.ac.th/thesis/drafts/REQ-2026-0002.pdf",
      programId: defaultProgram?.id,
      advisorId: advisors[0]?.id,
      activities: [
        {
          actorName: "น.ส.กานต์พิชชา ฤทธิ์ประเสริฐ",
          actorRole: "STUDENT",
          action: "SUBMIT" as const,
          previousStatus: null,
          newStatus: "SUBMITTED" as const,
          comment: "ยื่นคำร้องพร้อมแนบเล่มวิทยานิพนธ์และหลักฐานการตีพิมพ์ผลงานวิจัย",
        },
        {
          actorName: advisors[0] ? `${advisors[0].prefixTh ?? ""}${advisors[0].firstNameTh} ${advisors[0].lastNameTh}`.trim() : "ศ.ดร.วิชัย บัณฑิตไพศาล",
          actorRole: "ADVISOR",
          action: "APPROVE" as const,
          previousStatus: "SUBMITTED" as const,
          newStatus: "ADVISOR_APPROVED" as const,
          comment: "ตรวจสอบเล่มวิทยานิพนธ์และผลงานตีพิมพ์ครบถ้วนตามเงื่อนไขการสำเร็จการศึกษา เห็นควรให้สอบได้",
        },
        {
          actorName: "รศ.ดร.อานนท์ วิชาการ",
          actorRole: "PROGRAM_CHAIR",
          action: "APPROVE" as const,
          previousStatus: "ADVISOR_APPROVED" as const,
          newStatus: "CHAIR_APPROVED" as const,
          comment: "หลักสูตรเห็นชอบและเสนอรายชื่อคณะกรรมการสอบปากเปล่า 5 ท่าน ส่งต่อคณบดีลงนามแต่งตั้ง",
        },
      ],
    },
    {
      trackingNo: "REQ-2026-0003",
      type: "THESIS_TOPIC_APPROVAL" as const,
      status: "ADVISOR_APPROVED" as const,
      currentStep: 2,
      title: "ขออนุมัติหัวข้อวิทยานิพนธ์: การเพิ่มความปลอดภัยในเครือข่ายบล็อกเชนด้วย Zero-Knowledge Proofs",
      description: "เสนอหัวข้อและโครงร่างการวิจัยเพื่อพัฒนาระบบยืนยันตัวตนแบบไม่เปิดเผยตัวตน",
      studentId: "66070023",
      studentName: "นายธนกฤต มณีรัตน์",
      studentEmail: "thanakrit.m@univ.ac.th",
      studentPhone: "0845551234",
      thesisTitleTh: "การเพิ่มความปลอดภัยในเครือข่ายบล็อกเชนด้วย Zero-Knowledge Proofs",
      thesisTitleEn: "Enhancing Security in Blockchain Networks Using Zero-Knowledge Proofs",
      attachmentUrl: "https://storage.univ.ac.th/thesis/proposals/REQ-2026-0003.pdf",
      programId: defaultProgram?.id,
      advisorId: advisors[1]?.id ?? advisors[0]?.id,
      activities: [
        {
          actorName: "นายธนกฤต มณีรัตน์",
          actorRole: "STUDENT",
          action: "SUBMIT" as const,
          previousStatus: null,
          newStatus: "SUBMITTED" as const,
          comment: "ยื่นคำร้องผ่านระบบออนไลน์",
        },
        {
          actorName: advisors[1] ? `${advisors[1].prefixTh ?? ""}${advisors[1].firstNameTh} ${advisors[1].lastNameTh}`.trim() : "ดร.อาจารย์",
          actorRole: "ADVISOR",
          action: "APPROVE" as const,
          previousStatus: "SUBMITTED" as const,
          newStatus: "ADVISOR_APPROVED" as const,
          comment: "หัวข้อวิจัยมีประโยชน์ มีความทันสมัย และสอดคล้องกับทิศทางการวิจัยของภาควิชา",
        },
      ],
    },
    {
      trackingNo: "REQ-2026-0004",
      type: "LEAVE_OF_ABSENCE" as const,
      status: "SUBMITTED" as const,
      currentStep: 1,
      title: "ขอลาพักการศึกษา ภาคเรียนที่ 1/2569 เพื่อไปปฏิบัติงานวิจัยแลกเปลี่ยนต่างประเทศ",
      description: "มีความจำเป็นต้องเดินทางไปปฏิบัติงานวิจัย ณ มหาวิทยาลัยโตเกียว ประเทศญี่ปุ่น เป็นเวลา 1 ภาคการศึกษา",
      studentId: "66070044",
      studentName: "นายปิยพงศ์ เลิศวิไล",
      studentEmail: "piyapong.l@univ.ac.th",
      studentPhone: "0823334455",
      attachmentUrl: "https://storage.univ.ac.th/petitions/acceptance-letter.pdf",
      programId: defaultProgram?.id,
      advisorId: advisors[0]?.id,
      activities: [
        {
          actorName: "นายปิยพงศ์ เลิศวิไล",
          actorRole: "STUDENT",
          action: "SUBMIT" as const,
          previousStatus: null,
          newStatus: "SUBMITTED" as const,
          comment: "ยื่นคำร้องพร้อมแนบหนังสือตอบรับจากสถาบันปลายทางเรียบร้อยแล้ว",
        },
      ],
    },
    {
      trackingNo: "REQ-2026-0005",
      type: "EXTENSION_OF_STUDY" as const,
      status: "RETURNED" as const,
      currentStep: 1,
      title: "ขอขยายระยะเวลาการศึกษาภาคเรียนที่ 1/2569 ครั้งที่ 1",
      description: "ขอขยายเวลาการศึกษาเนื่องจากอยู่ระหว่างปรับปรุงผลงานวิจัยตามข้อเสนอแนะของผู้ทรงคุณวุฒิ",
      studentId: "63070002",
      studentName: "น.ส.ชญานิษฐ์ วงศ์สว่าง",
      studentEmail: "chayanit.w@univ.ac.th",
      studentPhone: "0867778899",
      programId: defaultProgram?.id,
      advisorId: advisors[1]?.id ?? advisors[0]?.id,
      activities: [
        {
          actorName: "น.ส.ชญานิษฐ์ วงศ์สว่าง",
          actorRole: "STUDENT",
          action: "SUBMIT" as const,
          previousStatus: null,
          newStatus: "SUBMITTED" as const,
          comment: "ยื่นคำร้องขอขยายเวลาการศึกษา",
        },
        {
          actorName: advisors[1] ? `${advisors[1].prefixTh ?? ""}${advisors[1].firstNameTh} ${advisors[1].lastNameTh}`.trim() : "อาจารย์ที่ปรึกษา",
          actorRole: "ADVISOR",
          action: "RETURN" as const,
          previousStatus: "SUBMITTED" as const,
          newStatus: "RETURNED" as const,
          comment: "กรุณาแนบรายงานความก้าวหน้าฉบับล่าสุด และแผนกำหนดการส่งเล่มที่ลงนามรับรองแล้วเพิ่มเติม",
        },
      ],
    },
    {
      trackingNo: "REQ-2026-0006",
      type: "GENERAL_PETITION" as const,
      status: "COMPLETED" as const,
      currentStep: 4,
      title: "ขอหนังสือรับรองการเป็นนิสิตฉบับภาษาอังกฤษเพื่อใช้ประกอบการยื่นขอวีซ่าวิจัย",
      description: "ต้องการขอเอกสารรับรองสถานภาพนิสิตภาษาอังกฤษ จำนวน 2 ฉบับ เพื่อยื่นขอวีซ่าไปนำเสนอผลงานวิจัยที่งานประชุมวิชาการ IEEE ณ ประเทศสหรัฐอเมริกา",
      studentId: "65070089",
      studentName: "นายณัฐพล เจริญผล",
      studentEmail: "nattapol.c@univ.ac.th",
      studentPhone: "0879990011",
      programId: defaultProgram?.id,
      advisorId: advisors[0]?.id,
      activities: [
        {
          actorName: "นายณัฐพล เจริญผล",
          actorRole: "STUDENT",
          action: "SUBMIT" as const,
          previousStatus: null,
          newStatus: "SUBMITTED" as const,
          comment: "ยื่นคำร้องขอหนังสือรับรองภาษาอังกฤษ",
        },
        {
          actorName: advisors[0] ? `${advisors[0].prefixTh ?? ""}${advisors[0].firstNameTh} ${advisors[0].lastNameTh}`.trim() : "อาจารย์ที่ปรึกษา",
          actorRole: "ADVISOR",
          action: "APPROVE" as const,
          previousStatus: "SUBMITTED" as const,
          newStatus: "ADVISOR_APPROVED" as const,
          comment: "รับทราบและเห็นชอบตามคำร้อง",
        },
        {
          actorName: "ประธานหลักสูตร",
          actorRole: "PROGRAM_CHAIR",
          action: "APPROVE" as const,
          previousStatus: "ADVISOR_APPROVED" as const,
          newStatus: "CHAIR_APPROVED" as const,
          comment: "เห็นชอบ",
        },
        {
          actorName: "งานทะเบียนและบัณฑิตศึกษา",
          actorRole: "DEAN_OFFICE",
          action: "APPROVE" as const,
          previousStatus: "CHAIR_APPROVED" as const,
          newStatus: "COMPLETED" as const,
          comment: "ออกหนังสือรับรองเลขที่ บศ. 0245/2569 เรียบร้อยแล้ว นิสิตสามารถมารับเอกสารฉบับจริงได้ที่สำนักงานคณะ",
        },
      ],
    },
    {
      trackingNo: "REQ-2026-0007",
      type: "DEFENSE_EXAM_REQUEST" as const,
      status: "REJECTED" as const,
      currentStep: 1,
      title: "ขอสอบปากเปล่าวิทยานิพนธ์",
      description: "ขอยื่นขอสอบปากเปล่าวิทยานิพนธ์",
      studentId: "64070018",
      studentName: "นายอนุชา ภักดีชน",
      studentEmail: "anucha.p@univ.ac.th",
      programId: defaultProgram?.id,
      advisorId: advisors[0]?.id,
      activities: [
        {
          actorName: "นายอนุชา ภักดีชน",
          actorRole: "STUDENT",
          action: "SUBMIT" as const,
          previousStatus: null,
          newStatus: "SUBMITTED" as const,
          comment: "ยื่นคำร้องขอสอบ",
        },
        {
          actorName: advisors[0] ? `${advisors[0].prefixTh ?? ""}${advisors[0].firstNameTh} ${advisors[0].lastNameTh}`.trim() : "อาจารย์ที่ปรึกษา",
          actorRole: "ADVISOR",
          action: "REJECT" as const,
          previousStatus: "SUBMITTED" as const,
          newStatus: "REJECTED" as const,
          comment: "ยังไม่ผ่านเกณฑ์การทดสอบความรู้ภาษาอังกฤษตามเกณฑ์มาตรฐานของบัณฑิตวิทยาลัย ขอให้สอบผ่านก่อนจึงจะสามารถยื่นคำร้องขอสอบปากเปล่าได้",
        },
      ],
    },
  ];

  for (const p of samplePetitions) {
    const { activities, ...pData } = p;
    const existing = await prisma.petition.findUnique({
      where: {
        tenantId_trackingNo: {
          tenantId: core.tenantId,
          trackingNo: p.trackingNo,
        },
      },
    });

    let petitionId: string;
    if (existing) {
      const updated = await prisma.petition.update({
        where: { id: existing.id },
        data: pData,
      });
      petitionId = updated.id;
    } else {
      const created = await prisma.petition.create({
        data: {
          ...pData,
          tenantId: core.tenantId,
        },
      });
      petitionId = created.id;
    }

    // Clear and recreate activities for clean seed state
    await prisma.petitionActivity.deleteMany({
      where: { petitionId },
    });

    for (const act of activities) {
      await prisma.petitionActivity.create({
        data: {
          ...act,
          petitionId,
        },
      });
    }
  }

  // Seed sample facility rooms and bookings
  const sampleRooms = [
    {
      code: "R-501",
      nameTh: "ห้องสอบวิทยานิพนธ์ 1 (Smart Defense Room)",
      nameEn: "Thesis Defense Room 1 (Smart Defense Room)",
      building: "อาคารวิจัยและบัณฑิตศึกษา",
      floor: 5,
      capacity: 25,
      type: "EXAM_ROOM" as const,
      facilities: ["Zoom Room Kit", "Dual 4K Projectors", "Smart Board", "Wireless Microphone System"],
      imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80",
      description: "ห้องสอบวิทยานิพนธ์มาตรฐานสากล รองรับการสอบแบบ Hybrid On-site และ Online พร้อมระบบบันทึกภาพและเสียง",
      isActive: true,
      displayOrder: 1,
    },
    {
      code: "R-502",
      nameTh: "ห้องสอบวิทยานิพนธ์ 2",
      nameEn: "Thesis Defense Room 2",
      building: "อาคารวิจัยและบัณฑิตศึกษา",
      floor: 5,
      capacity: 20,
      type: "EXAM_ROOM" as const,
      facilities: ["Projector", "Conference Cam", "Whiteboard"],
      imageUrl: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=1200&auto=format&fit=crop&q=80",
      description: "ห้องสอบวิทยานิพนธ์ขนาดกลาง เหมาะสำหรับการสอบเค้าโครงและสอบความก้าวหน้า",
      isActive: true,
      displayOrder: 2,
    },
    {
      code: "MR-301",
      nameTh: "ห้องประชุมคณะกรรมการวิชาการและที่ปรึกษา",
      nameEn: "Academic Committee & Advisory Board Room",
      building: "อาคารบริหารคณะวิทยาการ",
      floor: 3,
      capacity: 30,
      type: "MEETING_ROOM" as const,
      facilities: ["MS Teams Room Kit", "Laser Projector", "Round-table Mics", "Digital Signage"],
      imageUrl: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=1200&auto=format&fit=crop&q=80",
      description: "ห้องประชุมผู้บริหารและคณะกรรมการวิชาการ สำหรับพิจารณาหลักสูตรและผลงานวิจัย",
      isActive: true,
      displayOrder: 3,
    },
    {
      code: "LAB-401",
      nameTh: "ห้องปฏิบัติการ AI, Deep Learning & Vision Lab",
      nameEn: "AI & Deep Learning Computing Lab",
      building: "อาคารวิศวกรรมสารสนเทศ",
      floor: 4,
      capacity: 45,
      type: "LAB" as const,
      facilities: ["NVIDIA GPU Workstations", "Gigabit LAN", "Dual Interactive Displays"],
      imageUrl: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1200&auto=format&fit=crop&q=80",
      description: "ห้องปฏิบัติการคอมพิวเตอร์สมรรถนะสูง สำหรับการวิจัยวิทยานิพนธ์และฝึกอบรมโมเดล AI",
      isActive: true,
      displayOrder: 4,
    },
    {
      code: "AUD-101",
      nameTh: "หอประชุมวิชาการและนวัตกรรมบัณฑิต",
      nameEn: "Innovation & Graduate Auditorium",
      building: "อาคารศูนย์การเรียนรู้ดิจิทัล",
      floor: 1,
      capacity: 150,
      type: "AUDITORIUM" as const,
      facilities: ["Stage Audio System", "LED Wall 4K", "Live Streaming System", "Wireless Podium"],
      imageUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&auto=format&fit=crop&q=80",
      description: "หอประชุมใหญ่สำหรับงานปาฐกถาพิเศษ การประชุมวิชาการระดับชาติ และการนำเสนอผลงานวิทยานิพนธ์ยอดเยี่ยม",
      isActive: true,
      displayOrder: 5,
    },
    {
      code: "SC-201",
      nameTh: "ห้องเรียนอัจฉริยะ (Active Learning Classroom)",
      nameEn: "Active Learning Smart Classroom",
      building: "อาคารเรียนรวม",
      floor: 2,
      capacity: 50,
      type: "SMART_CLASSROOM" as const,
      facilities: ["Smart Interactive Whiteboards", "Group Pod Displays", "Flexible Seating"],
      imageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&auto=format&fit=crop&q=80",
      description: "ห้องเรียนอัจฉริยะแบบกลุ่ม สำหรับการสัมมนาวิชาการระดับบัณฑิตศึกษาและการเรียนรู้แบบมีส่วนร่วม",
      isActive: true,
      displayOrder: 6,
    },
  ];

  const seededRooms: Record<string, string> = {};

  for (const r of sampleRooms) {
    const existing = await prisma.facilityRoom.findFirst({
      where: { tenantId: core.tenantId, code: r.code },
    });

    if (existing) {
      const updated = await prisma.facilityRoom.update({
        where: { id: existing.id },
        data: {
          ...r,
          facilities: r.facilities,
        },
      });
      seededRooms[r.code] = updated.id;
    } else {
      const created = await prisma.facilityRoom.create({
        data: {
          ...r,
          tenantId: core.tenantId,
          facilities: r.facilities,
        },
      });
      seededRooms[r.code] = created.id;
    }
  }

  // Clear existing bookings for seeded rooms for clean idempotent state
  const roomIds = Object.values(seededRooms);
  await prisma.roomBooking.deleteMany({
    where: { tenantId: core.tenantId, roomId: { in: roomIds } },
  });

  const now = new Date();
  const todayMorningStart = new Date(now);
  todayMorningStart.setHours(9, 0, 0, 0);
  const todayMorningEnd = new Date(now);
  todayMorningEnd.setHours(12, 0, 0, 0);

  const todayAfternoonStart = new Date(now);
  todayAfternoonStart.setHours(13, 30, 0, 0);
  const todayAfternoonEnd = new Date(now);
  todayAfternoonEnd.setHours(16, 30, 0, 0);

  const tomorrowStart = new Date(now);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  tomorrowStart.setHours(10, 0, 0, 0);
  const tomorrowEnd = new Date(now);
  tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
  tomorrowEnd.setHours(12, 0, 0, 0);

  const nextWeekStart = new Date(now);
  nextWeekStart.setDate(nextWeekStart.getDate() + 5);
  nextWeekStart.setHours(13, 0, 0, 0);
  const nextWeekEnd = new Date(now);
  nextWeekEnd.setDate(nextWeekEnd.getDate() + 5);
  nextWeekEnd.setHours(17, 0, 0, 0);

  const sampleBookings = [
    {
      roomId: seededRooms["R-501"],
      title: "สอบป้องกันวิทยานิพนธ์ น.ส.วิไลลักษณ์ มั่นคง",
      purpose: "การสอบปากเปล่าวิทยานิพนธ์ขั้นสุดท้าย ปริญญาโท สาขาวิชาวิทยาการข้อมูล",
      type: "EXAM_DEFENSE" as const,
      platform: "HYBRID" as const,
      meetingUrl: "https://zoom.us/j/9876543210",
      startTime: todayMorningStart,
      endTime: todayMorningEnd,
      status: "CONFIRMED" as const,
      bookedByName: "น.ส.วิไลลักษณ์ มั่นคง",
      bookedByEmail: "wilailak@univ.ac.th",
      bookedByPhone: "089-123-4567",
      attendeeCount: 15,
    },
    {
      roomId: seededRooms["R-501"],
      title: "สอบเค้าโครงวิทยานิพนธ์ นายสมศักดิ์ ขยันยิ่ง",
      purpose: "การสอบโครงร่างวิจัยรอบบ่ายและแต่งตั้งคณะกรรมการที่ปรึกษา",
      type: "EXAM_DEFENSE" as const,
      platform: "ON_SITE" as const,
      startTime: todayAfternoonStart,
      endTime: todayAfternoonEnd,
      status: "CONFIRMED" as const,
      bookedByName: "นายสมศักดิ์ ขยันยิ่ง",
      bookedByEmail: "somsak@univ.ac.th",
      bookedByPhone: "081-999-8877",
      attendeeCount: 12,
    },
    {
      roomId: seededRooms["MR-301"],
      title: "การประชุมคณะกรรมการบริหารหลักสูตรปัญญาประดิษฐ์",
      purpose: "พิจารณาข้อเสนอวิทยานิพนธ์และผลงานตีพิมพ์ประจำภาคเรียน",
      type: "ACADEMIC_MEETING" as const,
      platform: "MS_TEAMS" as const,
      meetingUrl: "https://teams.microsoft.com/l/meetup-join/12345",
      startTime: tomorrowStart,
      endTime: tomorrowEnd,
      status: "CONFIRMED" as const,
      bookedByName: "ศ.ดร.ประสิทธิ์ ปัญญาดี",
      bookedByEmail: "prasit@univ.ac.th",
      bookedByPhone: "02-123-4567",
      attendeeCount: 20,
    },
    {
      roomId: seededRooms["LAB-401"],
      title: "สัมมนาเชิงปฏิบัติการ: Hands-on Fine-tuning Open LLMs",
      purpose: "การอบรมการประมวลผลและการเทรนโมเดลภาษาขนาดใหญ่สำหรับงานวิจัย",
      type: "SEMINAR" as const,
      platform: "ON_SITE" as const,
      startTime: nextWeekStart,
      endTime: nextWeekEnd,
      status: "PENDING" as const,
      bookedByName: "ผศ.ดร.ชัชวาลย์ สมาร์ท",
      bookedByEmail: "chatchawal@univ.ac.th",
      bookedByPhone: "086-555-4321",
      attendeeCount: 35,
    },
  ];

  for (const b of sampleBookings) {
    if (b.roomId) {
      await prisma.roomBooking.create({
        data: {
          ...b,
          tenantId: core.tenantId,
        },
      });
    }
  }

  console.log(`[seed] เสร็จ — login: admin@app.local / ${DEV_PASSWORD}`);
}

main().finally(() => prisma.$disconnect());
