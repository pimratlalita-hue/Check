const { PrismaClient } = require("../src/generated/prisma");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "mysql://gtmts_user:gtmts_secure_pass@localhost:3307/ums_dev"
    }
  }
});

const MCU_DFL_FACULTY = [
  {
    prefixTh: null,
    firstNameTh: "พระมหาสมชาย",
    lastNameTh: "กิตฺติปัญฺโญ, ดร.",
    prefixEn: "Phramaha Dr.",
    firstNameEn: "Somchai",
    lastNameEn: "Kittipanyo",
    positionTh: "หัวหน้าภาควิชาภาษาต่างประเทศ",
    positionEn: "Head of the Department of Foreign Languages",
    academicRank: "LECTURER",
    isExecutive: true,
    executiveRole: "หัวหน้าภาควิชาภาษาต่างประเทศ / ผู้อำนวยการหลักสูตร ปร.ด. ภาษาศาสตร์",
    executiveOrder: 1,
    email: "somchai.kit@mcu.ac.th",
    phone: "035-248-000 ต่อ 8400",
    officeRoom: "ห้อง 301 อาคารเรียนรวม ชั้น 3",
    avatarUrl: "/images/staff/somchai.png",
    displayOrder: 1,
    education: ["พธ.บ. (ภาษาอังกฤษ)", "ศศ.ม. (ภาษาศาสตร์)", "ปร.ด. (ภาษาศาสตร์) มจร."],
    expertise: ["Linguistics", "Buddhist Linguistics", "English Pedagogy", "Pali Grammar"]
  },
  {
    prefixTh: null,
    firstNameTh: "พระธรรมวชิโรดม,",
    lastNameTh: "รศ.ดร.",
    prefixEn: "Assoc. Prof. Dr.",
    firstNameEn: "Phradhamvachirodom",
    lastNameEn: "",
    positionTh: "รองอธิการบดีฝ่ายกิจการนิสิต",
    positionEn: "Vice Rector for Student Affairs",
    academicRank: "ASSOCIATE_PROFESSOR",
    isExecutive: true,
    executiveRole: "รองอธิการบดีฝ่ายกิจการนิสิต",
    executiveOrder: 2,
    email: "phradham.v@mcu.ac.th",
    phone: "035-248-000",
    officeRoom: "สำนักงานอธิการบดี อาคาร มจร.",
    avatarUrl: "/images/staff/phradhamvachirodom.jpg",
    displayOrder: 2,
    education: ["พธ.บ.", "ศศ.ม.", "พธ.ด."],
    expertise: ["Higher Education Administration", "Buddhist Studies", "Student Affairs Management"]
  },
  {
    prefixTh: null,
    firstNameTh: "พระวิเชียร",
    lastNameTh: "ปริชาโน, ผศ.ดร.",
    prefixEn: "Asst. Prof. Dr. Phra",
    firstNameEn: "Wichian",
    lastNameEn: "Parichano",
    positionTh: "อาจารย์ประจำภาควิชาภาษาต่างประเทศ",
    positionEn: "Lecturer, Department of Foreign Languages",
    academicRank: "ASSISTANT_PROFESSOR",
    isExecutive: false,
    email: "wichian.par@mcu.ac.th",
    phone: "035-248-000",
    officeRoom: "ห้องพักอาจารย์ อาคารเรียนรวม ชั้น 3",
    avatarUrl: "/images/staff/wichian.jpg",
    displayOrder: 3,
    education: ["พธ.บ. (ภาษาอังกฤษ)", "ศศ.ม. (ภาษาศาสตร์)", "ปร.ด. (ภาษาศาสตร์)"],
    expertise: ["Buddhist English", "Translation Studies", "Pali-English Translation"]
  },
  {
    prefixTh: "ผศ.ดร.",
    firstNameTh: "เมธาพันธ์",
    lastNameTh: "โพธิธีรโรจน์",
    prefixEn: "Asst. Prof. Dr.",
    firstNameEn: "Methapan",
    lastNameEn: "Phothitheerorot",
    positionTh: "รองคณบดีฝ่ายบริหาร / ผู้อำนวยการหลักสูตรปรัชญาดุษฎีบัณฑิต สาขาวิชาภาษาอังกฤษ (English Program)",
    positionEn: "Associate Dean for Administration / Director of Ph.D. Program in English (English Program)",
    academicRank: "ASSISTANT_PROFESSOR",
    isExecutive: true,
    executiveRole: "รองคณบดีฝ่ายบริหาร / ผอ.หลักสูตร ปร.ด. ภาษาอังกฤษ",
    executiveOrder: 3,
    email: "methapan.pho@mcu.ac.th",
    phone: "035-248-000 ต่อ 8401",
    officeRoom: "ห้อง 302 อาคารเรียนรวม ชั้น 3",
    avatarUrl: "/images/staff/methapan.jpg",
    displayOrder: 4,
    education: ["B.A. (English)", "M.A. (English)", "Ph.D. (English)"],
    expertise: ["Applied Linguistics", "English Literature", "Curriculum Administration", "Second Language Acquisition"]
  },
  {
    prefixTh: "รศ.ดร.",
    firstNameTh: "วีระกาญจน์",
    lastNameTh: "กนกกมเลศ",
    prefixEn: "Assoc. Prof. Dr.",
    firstNameEn: "Weerakarn",
    lastNameEn: "Kanokkamales",
    positionTh: "ผู้อำนวยการหลักสูตรศิลปศาสตรมหาบัณฑิต สาขาวิชาภาษาอังกฤษ (English Program)",
    positionEn: "Director of M.A. Program in English (English Program)",
    academicRank: "ASSOCIATE_PROFESSOR",
    isExecutive: true,
    executiveRole: "ผู้อำนวยการหลักสูตร ศศ.ม. ภาษาอังกฤษ (English Program)",
    executiveOrder: 4,
    email: "weerakarn.k@mcu.ac.th",
    phone: "035-248-000 ต่อ 8402",
    officeRoom: "ห้อง 303 อาคารเรียนรวม ชั้น 3",
    avatarUrl: "/images/staff/weerakarn.png",
    displayOrder: 5,
    education: ["B.A. (English)", "M.A. (English Language Teaching)", "Ph.D. (Linguistics)"],
    expertise: ["English Syntax", "TESOL", "Research Methodology", "Discourse Analysis"]
  },
  {
    prefixTh: "ดร.",
    firstNameTh: "ศักดิ์ชัย",
    lastNameTh: "โพธิ์สัย",
    prefixEn: "Dr.",
    firstNameEn: "Sakchai",
    lastNameEn: "Phosai",
    positionTh: "ผู้อำนวยการหลักสูตรศิลปศาสตรมหาบัณฑิต สาขาวิชาภาษาศาสตร์",
    positionEn: "Director of M.A. Program in Linguistics",
    academicRank: "LECTURER",
    isExecutive: true,
    executiveRole: "ผู้อำนวยการหลักสูตร ศศ.ม. ภาษาศาสตร์",
    executiveOrder: 5,
    email: "sakchai.pho@mcu.ac.th",
    phone: "035-248-000 ต่อ 8403",
    officeRoom: "ห้อง 304 อาคารเรียนรวม ชั้น 3",
    avatarUrl: "/images/staff/sakchai.png",
    displayOrder: 6,
    education: ["พธ.บ.", "ศศ.ม. (ภาษาศาสตร์)", "ปร.ด. (ภาษาศาสตร์)"],
    expertise: ["Theoretical Linguistics", "Phonetics & Phonology", "Morphology", "Comparative Linguistics"]
  },
  {
    prefixTh: "รศ.ดร.",
    firstNameTh: "นิลรัตน์",
    lastNameTh: "กลิ่นจันทร์",
    prefixEn: "Assoc. Prof. Dr.",
    firstNameEn: "Ninrat",
    lastNameEn: "Klinchan",
    positionTh: "อาจารย์ประจำภาควิชาภาษาต่างประเทศ",
    positionEn: "Associate Professor, Department of Foreign Languages",
    academicRank: "ASSOCIATE_PROFESSOR",
    isExecutive: false,
    email: "ninrat.k@mcu.ac.th",
    phone: "035-248-000",
    officeRoom: "ห้องพักอาจารย์ อาคารเรียนรวม ชั้น 3",
    avatarUrl: "/images/staff/ninrat.png",
    displayOrder: 7,
    education: ["ศศ.บ. (ภาษาอังกฤษ)", "ศศ.ม. (ภาษาศาสตร์ประยุกต์)", "ปร.ด. (ภาษาศาสตร์)"],
    expertise: ["Sociolinguistics", "Language Acquisition", "Intercultural Communication"]
  },
  {
    prefixTh: "ดร.",
    firstNameTh: "ณรงค์ชัย",
    lastNameTh: "ปิ่นทรายมูล",
    prefixEn: "Dr.",
    firstNameEn: "Narongchai",
    lastNameEn: "Pinsaimun",
    positionTh: "อาจารย์ประจำภาควิชาภาษาต่างประเทศ",
    positionEn: "Lecturer, Department of Foreign Languages",
    academicRank: "LECTURER",
    isExecutive: false,
    email: "narongchai.pin@mcu.ac.th",
    phone: "035-248-000",
    officeRoom: "ห้องพักอาจารย์ อาคารเรียนรวม ชั้น 3",
    avatarUrl: "/images/staff/narongchai.png",
    displayOrder: 8,
    education: ["B.A. (English)", "M.A. (English)", "Ph.D. (Linguistics)"],
    expertise: ["English for Academic Purposes", "Semantics", "Stylistics"]
  },
  {
    prefixTh: "ผศ.ดร.",
    firstNameTh: "ประเพศ",
    lastNameTh: "ไกรจันทร์",
    prefixEn: "Asst. Prof. Dr.",
    firstNameEn: "Praphet",
    lastNameEn: "Kraijan",
    positionTh: "อาจารย์ประจำภาควิชาภาษาต่างประเทศ",
    positionEn: "Assistant Professor, Department of Foreign Languages",
    academicRank: "ASSISTANT_PROFESSOR",
    isExecutive: false,
    email: "praphet.k@mcu.ac.th",
    phone: "035-248-000",
    officeRoom: "ห้องพักอาจารย์ อาคารเรียนรวม ชั้น 3",
    avatarUrl: "/images/staff/praphet.png",
    displayOrder: 9,
    education: ["ศศ.บ. (ภาษาอังกฤษ)", "ศศ.ม. (ภาษาอังกฤษ)", "ปร.ด. (ภาษาศาสตร์ประยุกต์)"],
    expertise: ["Pragmatics", "Discourse Analysis", "English for Specific Purposes"]
  },
  {
    prefixTh: "ดร.",
    firstNameTh: "ลลิตา",
    lastNameTh: "พิมพ์รัตน์",
    prefixEn: "Dr.",
    firstNameEn: "Lalita",
    lastNameEn: "Pimrat",
    positionTh: "เลขานุการหลักสูตร ปร.ด. & ศศ.ม. ภาษาอังกฤษ (English Program) และหลักสูตร ป.ทศ.",
    positionEn: "Secretary of Ph.D. & M.A. in English (English Program) and TFL Certificate",
    academicRank: "LECTURER",
    isExecutive: true,
    executiveRole: "เลขานุการหลักสูตร ปร.ด. & ศศ.ม. ภาษาอังกฤษ (English Program)",
    executiveOrder: 6,
    email: "lalita.pim@mcu.ac.th",
    phone: "035-248-000 ต่อ 8405",
    officeRoom: "ห้อง 305 อาคารเรียนรวม ชั้น 3",
    avatarUrl: "/images/staff/lalita.png",
    displayOrder: 10,
    education: ["B.A. (English)", "M.A. (English)", "Ph.D. (Linguistics)"],
    expertise: ["English Program Coordination", "Corpus Linguistics", "Academic Writing & Research", "Educational Technology"]
  },
  {
    prefixTh: "อาจารย์",
    firstNameTh: "สุวิทย์",
    lastNameTh: "แซวรัมย์",
    prefixEn: "Lecturer",
    firstNameEn: "Suwit",
    lastNameEn: "Saewram",
    positionTh: "เลขานุการหลักสูตรปรัชญาดุษฎีบัณฑิต สาขาวิชาภาษาศาสตร์",
    positionEn: "Secretary of Ph.D. Program in Linguistics",
    academicRank: "LECTURER",
    isExecutive: true,
    executiveRole: "เลขานุการหลักสูตร ปร.ด. สาขาวิชาภาษาศาสตร์",
    executiveOrder: 7,
    email: "suwit.sae@mcu.ac.th",
    phone: "035-248-000 ต่อ 8406",
    officeRoom: "ห้อง 306 อาคารเรียนรวม ชั้น 3",
    avatarUrl: "/images/staff/suwit.png",
    displayOrder: 11,
    education: ["พธ.บ. (ภาษาอังกฤษ)", "ศศ.ม. (ภาษาศาสตร์)"],
    expertise: ["Linguistics Research Administration", "Lexicography", "Grammar"]
  },
  {
    prefixTh: "ดร.",
    firstNameTh: "นิกร",
    lastNameTh: "พลเยี่ยม",
    prefixEn: "Dr.",
    firstNameEn: "Nikorn",
    lastNameEn: "Polyeam",
    positionTh: "อาจารย์ประจำภาควิชาภาษาต่างประเทศ",
    positionEn: "Lecturer, Department of Foreign Languages",
    academicRank: "LECTURER",
    isExecutive: false,
    email: "nikorn.pol@mcu.ac.th",
    phone: "035-248-000",
    officeRoom: "ห้องพักอาจารย์ อาคารเรียนรวม ชั้น 3",
    avatarUrl: "/images/staff/nikorn.png",
    displayOrder: 12,
    education: ["พธ.บ.", "ศศ.ม.", "ปร.ด."],
    expertise: ["English Phonology", "World Englishes", "Language Teaching"]
  },
  {
    prefixTh: "ดร.",
    firstNameTh: "อัปสร",
    lastNameTh: "เตียวเจริญกิจ",
    prefixEn: "Dr.",
    firstNameEn: "Upsorn",
    lastNameEn: "Tiawcharoenkit",
    positionTh: "อาจารย์ประจำภาควิชาภาษาต่างประเทศ",
    positionEn: "Lecturer, Department of Foreign Languages",
    academicRank: "LECTURER",
    isExecutive: false,
    email: "upsorn.tia@mcu.ac.th",
    phone: "035-248-000",
    officeRoom: "ห้องพักอาจารย์ อาคารเรียนรวม ชั้น 3",
    avatarUrl: "/images/staff/upsorn.png",
    displayOrder: 13,
    education: ["B.A. (English)", "M.A. (English)", "Ph.D. (Linguistics)"],
    expertise: ["English Morphology", "Cognitive Linguistics", "English Communication"]
  }
];

async function main() {
  console.log("Starting MCU DFL Faculty Population...");

  const tenant = await prisma.tenant.findFirst({
    where: { code: "DEMO" }
  });
  if (!tenant) throw new Error("Tenant DEMO not found");

  const dflDept = await prisma.department.findFirst({
    where: { tenantId: tenant.id, code: "DFL" }
  });
  if (!dflDept) throw new Error("DFL Department not found");

  // Deactivate non-DFL sample staff so only real MCU DFL faculty are prominent
  await prisma.staffProfile.updateMany({
    where: {
      tenantId: tenant.id,
      NOT: { departmentId: dflDept.id }
    },
    data: {
      isActive: false
    }
  });
  console.log("Set non-DFL sample profiles to inactive");

  // Remove previously inserted DFL profiles to ensure clean names
  await prisma.staffProfile.deleteMany({
    where: {
      tenantId: tenant.id,
      departmentId: dflDept.id
    }
  });
  console.log("Cleaned previous DFL profiles");

  // Insert fresh 13 faculty members
  for (const faculty of MCU_DFL_FACULTY) {
    const dataPayload = {
      tenantId: tenant.id,
      departmentId: dflDept.id,
      staffType: faculty.isExecutive ? "EXECUTIVE" : "ACADEMIC",
      academicRank: faculty.academicRank,
      prefixTh: faculty.prefixTh,
      prefixEn: faculty.prefixEn,
      firstNameTh: faculty.firstNameTh,
      lastNameTh: faculty.lastNameTh,
      firstNameEn: faculty.firstNameEn,
      lastNameEn: faculty.lastNameEn,
      positionTh: faculty.positionTh,
      positionEn: faculty.positionEn,
      isExecutive: !!faculty.isExecutive,
      executiveRole: faculty.executiveRole || null,
      executiveOrder: faculty.executiveOrder || null,
      email: faculty.email,
      phone: faculty.phone || null,
      officeRoom: faculty.officeRoom || null,
      avatarUrl: faculty.avatarUrl,
      education: faculty.education,
      expertise: faculty.expertise,
      displayOrder: faculty.displayOrder,
      isActive: true
    };

    console.log(`Inserting #${faculty.displayOrder}: ${faculty.prefixTh || ""}${faculty.firstNameTh} ${faculty.lastNameTh}`);
    await prisma.staffProfile.create({ data: dataPayload });
  }

  const count = await prisma.staffProfile.count({
    where: { tenantId: tenant.id, departmentId: dflDept.id, isActive: true }
  });

  console.log(`Successfully populated all ${count} MCU DFL faculty members!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
