import { PrismaClient, CourseCategory, DegreeLevel, ProgramType, ProgramStatus } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("===============================================================");
  console.log("📚 Populating Exact มคอ.2 Data for Master of Arts Program in English");
  console.log("===============================================================\n");

  // 1. Find DFL department
  const dfl = await prisma.department.findFirst({
    where: { code: "DFL" },
  });

  if (!dfl) {
    console.error("❌ Department DFL not found");
    return;
  }

  // Find tenant
  const tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    console.error("❌ Tenant not found");
    return;
  }

  const careerPaths = [
    "ครู/อาจารย์ในสถาบันการศึกษา (Teacher, Lecturer and Instructor)",
    "นักวิชาการทางด้านภาษาอังกฤษ (Academic Scholar on English)",
    "นักคิดนักเขียนด้านภาษาอังกฤษ (Thinker and Writer on English)",
    "ล่าม หรือ ผู้แปล (Interpreter and Translator)",
    "นักวิจัยด้านภาษาอังกฤษ (Researcher on English)",
    "นักจัดรายการ/ผู้สื่อข่าววิทยุและโทรทัศน์ (Radio and Television Host / Journalist)",
    "เจ้าหน้าที่ของรัฐ ข้าราชการพลเรือน นักบริหาร และนักธุรกิจ (Government Officer, Civil Servant, Administrator, Entrepreneur)",
  ];

  const learningOutcomes = [
    {
      code: "PLO1",
      descTh: "มีคุณธรรม จริยธรรม และความรู้ในศาสตร์ภาษาอังกฤษเพื่อใช้ทักษะในการสื่อสารเชิงวิชาการเพื่อนำเสนองานในระดับชาติและนานาชาติ (Sub-PLO1: อธิบายองค์ความรู้เพื่อการสื่อสารเชิงวิชาการ, Sub-PLO2: มีความซื่อสัตย์สุจริต รับผิดชอบ จิตสาธารณะ)",
      descEn: "Students will be fully equipped with ethics and morality, have comprehensive knowledge of English, and use academic communication skills at national and international levels.",
    },
    {
      code: "PLO2",
      descTh: "มีองค์ความรู้ในศาสตร์ภาษาอังกฤษ สามารถคิดเชิงวิเคราะห์ สังเคราะห์ และประยุกต์องค์ความรู้ด้านภาษาอังกฤษเพื่อพัฒนาสังคมและองค์กร",
      descEn: "Students will be equipped with knowledge in English fields, and be able to analyze, synthesize, and create/apply knowledge to develop society.",
    },
    {
      code: "PLO3",
      descTh: "มีความสามารถบูรณาการองค์ความรู้ภาษาอังกฤษกับเทคโนโลยีสารสนเทศ ศาสตร์ทางพระพุทธศาสนา และศาสตร์สมัยใหม่อื่น ๆ เพื่อสร้างงานวิจัยและนวัตกรรม",
      descEn: "Students can integrate English language knowledge with information technology, Buddhist studies, and other interdisciplinary fields to conduct research and develop academic innovations.",
    },
  ];

  const philosophyTh = "ผลิตมหาบัณฑิตให้มีความรู้ความสามารถด้านภาษาอังกฤษทั้งทางด้านทฤษฎีและปฏิบัติประกอบให้มีคุณธรรมจริยธรรมเพื่อตอบสนองความต้องการของคณะสงฆ์ สังคมและผู้ประกอบการ";
  const philosophyEn = "To produce graduates to be skillful in English both in theoretical and practical aspect and to make graduates to have morality and ethics in order to meet the demands of Sangha Orders, society, and entrepreneurs.";

  const descriptionTh = "หลักสูตรปรับปรุง พ.ศ. ๒๕๖๖ ระดับปริญญาโท (Master's Degree) สังกัดภาควิชาภาษาต่างประเทศ คณะมนุษยศาสตร์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย จัดการเรียนการสอนเป็นภาษาอังกฤษ มุ่งเน้นการพัฒนาทักษะภาษาอังกฤษเชิงวิชาการ การวิจัยทางภาษาศาสตร์ และการประยุกต์ใช้เทคโนโลยีสมัยใหม่ควบคู่คุณธรรมตามแนวพุทธศาสน์";
  const descriptionEn = "Revised Curriculum 2023 at the Master's Degree level, Department of Foreign Languages, Faculty of Humanities, Mahachulalongkornrajavidyalaya University. Conducted in English as a medium of instruction, emphasizing academic English communication, linguistics research, and innovative technology integration.";

  // Update or upsert program
  const program = await prisma.program.upsert({
    where: {
      tenantId_code: {
        tenantId: tenant.id,
        code: "25551851106069",
      },
    },
    update: {
      departmentId: dfl.id,
      nameTh: "หลักสูตรศิลปศาสตรมหาบัณฑิต สาขาวิชาภาษาอังกฤษ (หลักสูตรภาษาอังกฤษ) (หลักสูตรปรับปรุง พ.ศ. ๒๕๖๖)",
      nameEn: "Master of Arts Program in English (English Program) (Revised Curriculum 2023)",
      degreeTh: "ศิลปศาสตรมหาบัณฑิต (ภาษาอังกฤษ)",
      degreeEn: "Master of Arts (English)",
      degreeShortTh: "ศศ.ม. (ภาษาอังกฤษ)",
      degreeShortEn: "M.A. (English)",
      level: DegreeLevel.MASTER,
      type: ProgramType.INTERNATIONAL,
      status: ProgramStatus.ACTIVE,
      slug: "dfl-ma-english-2566",
      totalCredits: 36,
      studyDuration: "2 ปี (2 Years)",
      tuitionFee: "35,000 บาท / ภาคการศึกษา",
      descriptionTh,
      descriptionEn,
      philosophyTh,
      philosophyEn,
      careerPaths,
      learningOutcomes,
      displayOrder: 1,
    },
    create: {
      tenantId: tenant.id,
      departmentId: dfl.id,
      code: "25551851106069",
      nameTh: "หลักสูตรศิลปศาสตรมหาบัณฑิต สาขาวิชาภาษาอังกฤษ (หลักสูตรภาษาอังกฤษ) (หลักสูตรปรับปรุง พ.ศ. ๒๕๖๖)",
      nameEn: "Master of Arts Program in English (English Program) (Revised Curriculum 2023)",
      degreeTh: "ศิลปศาสตรมหาบัณฑิต (ภาษาอังกฤษ)",
      degreeEn: "Master of Arts (English)",
      degreeShortTh: "ศศ.ม. (ภาษาอังกฤษ)",
      degreeShortEn: "M.A. (English)",
      level: DegreeLevel.MASTER,
      type: ProgramType.INTERNATIONAL,
      status: ProgramStatus.ACTIVE,
      slug: "dfl-ma-english-2566",
      totalCredits: 36,
      studyDuration: "2 ปี (2 Years)",
      tuitionFee: "35,000 บาท / ภาคการศึกษา",
      descriptionTh,
      descriptionEn,
      philosophyTh,
      philosophyEn,
      careerPaths,
      learningOutcomes,
      displayOrder: 1,
    },
  });

  console.log(`  ✓ Program synchronized: ${program.nameTh} (${program.code})`);

  // Delete previous courses for this program to ensure clean sync
  await prisma.programCourse.deleteMany({
    where: { programId: program.id },
  });

  // 19 Courses from มคอ.2
  const coursesData = [
    // หมวดวิชาบังคับ ไม่นับหน่วยกิต (12 หน่วยกิต)
    {
      code: "619 101",
      nameTh: "ภาษาศาสตร์พื้นฐาน",
      nameEn: "Fundamental Linguistics",
      credits: 3,
      creditHours: "(3) (3-0-9)",
      category: CourseCategory.CORE_COURSE,
      year: 1,
      semester: 1,
      descriptionTh: "ศึกษาลักษณะเด่นของภาษาและภาษาศาสตร์เชิงพรรณนา ประกอบด้วย สัทศาสตร์ สรศาสตร์ วจีวิภาค วากยสัมพันธ์ และอรรถศาสตร์",
      descriptionEn: "Study the characteristics of language and descriptive linguistics: phonetics, phonology, morphology, syntax and semantics.",
      displayOrder: 1,
    },
    {
      code: "619 202",
      nameTh: "การวิเคราะห์ไวยากรณ์ภาษาอังกฤษขั้นสูง",
      nameEn: "Analysis of Advanced English Grammar",
      credits: 3,
      creditHours: "(3) (3-0-9)",
      category: CourseCategory.CORE_COURSE,
      year: 1,
      semester: 2,
      descriptionTh: "ศึกษาวิเคราะห์ลักษณะเฉพาะของโครงสร้างทางไวยากรณ์ภาษาอังกฤษ และหลักการใช้โครงสร้างทางไวยากรณ์ภาษาอังกฤษตามแนวภาษาศาสตร์",
      descriptionEn: "Analyze the characteristics of English grammatical structure and the principle of usage based on linguistic approach.",
      displayOrder: 2,
    },
    {
      code: "619 203",
      nameTh: "ระเบียบวิธีวิจัยภาษาอังกฤษ",
      nameEn: "Research Methodology in English",
      credits: 3,
      creditHours: "(3) (3-0-9)",
      category: CourseCategory.CORE_COURSE,
      year: 1,
      semester: 2,
      descriptionTh: "ศึกษาความรู้เบื้องต้นเกี่ยวกับลักษณะและองค์ประกอบของการวิจัยด้านภาษาอังกฤษและการสื่อสาร การออกแบบการวิจัย และการวิเคราะห์ทางสถิติที่เหมาะสม ฝึกเขียนหัวข้อ โครงร่าง รายงานผล และบทคัดย่องานวิจัย",
      descriptionEn: "This course is an introduction to the nature and components of research in English and communications. Emphasis on research designs, research approaches and statistical analyses.",
      displayOrder: 3,
    },
    {
      code: "619 204",
      nameTh: "กรรมฐาน",
      nameEn: "Buddhist Meditation",
      credits: 3,
      creditHours: "(3) (3-0-9)",
      category: CourseCategory.CORE_COURSE,
      year: 1,
      semester: 2,
      descriptionTh: "ศึกษาหลักสมถกรรมฐานและวิปัสสนากรรมฐาน ที่ปรากฏในคัมภีร์พระไตรปิฎก และรูปแบบการปฏิบัติกรรมฐานของสำนักต่าง ๆ ในสังคมไทย เน้นฝึกปฏิบัติตามแนวมหาสติปัฏฐานสูตร",
      descriptionEn: "Study the principles of Samathakammathana and Vipassanakammathana that appear in Tipitaka and the practice at different schools in Thai society, focusing on Mahasatipatthana Sutta.",
      displayOrder: 4,
    },

    // หมวดวิชาบังคับ นับหน่วยกิต (9 หน่วยกิต)
    {
      code: "619 105",
      nameTh: "นานาภาษาอังกฤษโลก",
      nameEn: "World Englishes",
      credits: 3,
      creditHours: "3 (3-0-9)",
      category: CourseCategory.CORE_COURSE,
      year: 2,
      semester: 1,
      descriptionTh: "ฝึกพูดและฟังภาษาอังกฤษจากหลากหลายสำเนียงของประเทศที่ใช้ภาษาอังกฤษในการติดต่อสื่อสาร",
      descriptionEn: "Practice speaking and listening to English of different accents and pronunciations of the countries that use English for communications.",
      displayOrder: 5,
    },
    {
      code: "619 106",
      nameTh: "วิธีสอนภาษาอังกฤษอย่างมีประสิทธิภาพ",
      nameEn: "Methods of Effective English Teaching",
      credits: 3,
      creditHours: "3 (3-0-9)",
      category: CourseCategory.CORE_COURSE,
      year: 1,
      semester: 1,
      descriptionTh: "ศึกษาทฤษฎีและวิธีสอนภาษาอังกฤษตามแนวภาษาศาสตร์ จิตวิทยาการเรียนการสอน การเลือกใช้อุปกรณ์และเทคโนโลยี และการประเมินผลการสอน",
      descriptionEn: "Study theories and methods of teaching English based on linguistic approach, learning and teaching psychology, teaching methods analysis, and educational technology.",
      displayOrder: 6,
    },
    {
      code: "619 207",
      nameTh: "การแปลแบบล่ามอาชีพ",
      nameEn: "Professional Interpretation",
      credits: 3,
      creditHours: "3 (3-0-9)",
      category: CourseCategory.CORE_COURSE,
      year: 1,
      semester: 2,
      descriptionTh: "ศึกษาหลักการและวิธีการถ่ายทอดภาษาโดยแปลจากการฟัง ล่ามพูดตาม ล่ามพูดพร้อม และล่ามกระซิบ เน้นจัดกิจกรรมเสมือนจริงเพื่อฝึกฝนการเป็นล่ามในสถานการณ์ต่าง ๆ",
      descriptionEn: "Study principles and methods concerning verbal translation: consecutive interpretation, simultaneous interpretation, and whispering interpretation with role-play practice.",
      displayOrder: 7,
    },

    // หมวดวิชาเอก (12 หน่วยกิต)
    {
      code: "619 108",
      nameTh: "สัมมนาวิทยานิพนธ์ภาษาอังกฤษ",
      nameEn: "Seminar on Thesis in English",
      credits: 3,
      creditHours: "3 (3-0-9)",
      category: CourseCategory.MAJOR_ELECTIVE,
      year: 2,
      semester: 1,
      descriptionTh: "ศึกษาหลักการและวิธีการเขียนวิทยานิพนธ์เชิงลึก โดยเน้นการฝึกปฏิบัติการเขียนเป็นหลัก",
      descriptionEn: "Study the principles and methods of thesis writing focusing mainly on practicing the thesis writing.",
      displayOrder: 8,
    },
    {
      code: "619 109",
      nameTh: "ภาษาอังกฤษเพื่อการสื่อสารมวลชน",
      nameEn: "English for Mass Communication",
      credits: 3,
      creditHours: "3 (3-0-9)",
      category: CourseCategory.MAJOR_ELECTIVE,
      year: 1,
      semester: 1,
      descriptionTh: "พัฒนาทักษะภาษาอังกฤษจากการสื่อสารมวลชนต่าง ๆ โดยเน้นที่หลักการ รูปแบบ โครงสร้างของภาษา และลักษณะการใช้คำ",
      descriptionEn: "Develop English skills through a variety of printed and digital media: newspapers, magazines, broadcasting, and advertisements; emphasis on syntactic and lexical features.",
      displayOrder: 9,
    },
    {
      code: "619 110",
      nameTh: "ภาษาอังกฤษเพื่อการกล่าวสุนทรพจน์",
      nameEn: "English for Delivering Speeches",
      credits: 3,
      creditHours: "3 (3-0-9)",
      category: CourseCategory.MAJOR_ELECTIVE,
      year: 2,
      semester: 1,
      descriptionTh: "ศึกษาคำ วลี ประโยค โครงสร้างภาษาอังกฤษ และฝึกกล่าวสุนทรพจน์เป็นภาษาอังกฤษในโอกาสต่าง ๆ",
      descriptionEn: "Study English words, phrases, sentences, discourse structures, and practice delivering speeches on various formal occasions.",
      displayOrder: 10,
    },
    {
      code: "619 111",
      nameTh: "เทคนิคการนำเสนอและการอภิปรายเชิงวิชาการ",
      nameEn: "Academic Presentation and Discussion Techniques",
      credits: 3,
      creditHours: "3 (3-0-9)",
      category: CourseCategory.MAJOR_ELECTIVE,
      year: 1,
      semester: 1,
      descriptionTh: "พัฒนาทักษะภาษาในการอภิปรายและการนำเสนอในที่ประชุม การวางแผนและกลวิธีการนำเสนอ การจัดระเบียบข้อมูล และการนำเสนอบทความวิจัย",
      descriptionEn: "Develop language skills and techniques for formal academic discussions, seminar presentations, data organization, and research paper delivery.",
      displayOrder: 11,
    },

    // หมวดวิชาเลือก (เลือกเรียนไม่น้อยกว่า 3 หน่วยกิต จาก 18 หน่วยกิต)
    {
      code: "619 112",
      nameTh: "สนทนาธรรมภาคภาษาอังกฤษ",
      nameEn: "Dhamma Talk in English",
      credits: 3,
      creditHours: "3 (3-0-9)",
      category: CourseCategory.FREE_ELECTIVE,
      year: 2,
      semester: 1,
      descriptionTh: "ศึกษาวิธีการปาฐกถาธรรม บรรยายธรรมเป็นภาษาอังกฤษ เน้นหลักธรรมทั่วไปเพื่อการเผยแผ่พระพุทธศาสนาอย่างมีประสิทธิภาพ",
      descriptionEn: "Study methods of Dhamma talks, lecture, preachment, and delivery of Dhamma in English for propagating Buddhism worldwide.",
      displayOrder: 12,
    },
    {
      code: "619 113",
      nameTh: "ภาษาอังกฤษเพื่อการสื่อสารสำหรับงานมัคคุเทศก์",
      nameEn: "Communicative English for Tour Guide",
      credits: 3,
      creditHours: "3 (3-0-9)",
      category: CourseCategory.FREE_ELECTIVE,
      year: 2,
      semester: 1,
      descriptionTh: "ศึกษาหลักการจัดนำเที่ยว ฝึกคำศัพท์และบทสนทนาภาษาอังกฤษที่จำเป็นสำหรับงานมัคคุเทศก์ และการนำเสนอปากเปล่า",
      descriptionEn: "Study principles of tour management, vocabularies, and expressions needed for professional tour guides in various situations.",
      displayOrder: 13,
    },
    {
      code: "619 114",
      nameTh: "การแปลเชิงวิชาการ",
      nameEn: "Academic Translation",
      credits: 3,
      creditHours: "3 (3-0-9)",
      category: CourseCategory.FREE_ELECTIVE,
      year: 2,
      semester: 1,
      descriptionTh: "ศึกษาทฤษฎีและเทคนิคการแปล วัจนลีลา การแปลในบริบทต่างวัฒนธรรม ฝึกแปลบทความวิชาการและวรรณกรรม",
      descriptionEn: "Study translation theories and techniques, registers, intercultural translation context, and practical translation of academic texts.",
      displayOrder: 14,
    },
    {
      code: "619 115",
      nameTh: "การอ่านพระไตรปิฎกเชิงวิเคราะห์ภาคภาษาอังกฤษ",
      nameEn: "Analytical Tipitaka Reading in English",
      credits: 3,
      creditHours: "3 (3-0-9)",
      category: CourseCategory.FREE_ELECTIVE,
      year: 1,
      semester: 1,
      descriptionTh: "วิเคราะห์เนื้อหาที่สำคัญในพระไตรปิฎกที่คัดมาจากพระสูตร พระวินัย และพระอภิธรรม ภาคภาษาอังกฤษ",
      descriptionEn: "Analyze essential contents in Tipitaka selected from Sutta, Vinaya, and Abhidhamma in English translation.",
      displayOrder: 15,
    },
    {
      code: "619 116",
      nameTh: "การฟังภาษาอังกฤษชั้นสูง",
      nameEn: "Advanced English Listening",
      credits: 3,
      creditHours: "3 (3-0-9)",
      category: CourseCategory.FREE_ELECTIVE,
      year: 2,
      semester: 1,
      descriptionTh: "ฝึกฟังภาษาอังกฤษจากแหล่งข่าวหรือเรื่องราวต่าง ๆ จับประเด็นและวิเคราะห์เนื้อหาเชิงลึก",
      descriptionEn: "Practice listening to English from authentic media sources, international news, and synthesize complex content.",
      displayOrder: 16,
    },
    {
      code: "619 117",
      nameTh: "ภาษาอังกฤษผ่านสื่อและเทคโนโลยีสมัยใหม่",
      nameEn: "English Through Modern Media and Technology",
      credits: 3,
      creditHours: "3 (3-0-9)",
      category: CourseCategory.FREE_ELECTIVE,
      year: 2,
      semester: 1,
      descriptionTh: "ศึกษาและฝึกทักษะภาษาอังกฤษในการฟัง พูด อ่าน เขียน และเข้าใจความหลากหลายทางวัฒนธรรมสากลผ่านสื่อและเทคโนโลยีสมัยใหม่",
      descriptionEn: "Study and practice four English skills, intercultural understanding, and digital literacy through modern multimedia technology.",
      displayOrder: 17,
    },

    // หมวดวิทยานิพนธ์
    {
      code: "407 300",
      nameTh: "วิทยานิพนธ์ (แผน ๑.๑)",
      nameEn: "Thesis (Plan 1.1)",
      credits: 36,
      creditHours: "36 หน่วยกิต (0-24-72)",
      category: CourseCategory.THESIS,
      year: 2,
      semester: 2,
      descriptionTh: "ศึกษาวิจัยเฉพาะบุคคลตามลักษณะวิชาภาษาอังกฤษ โดยค้นคว้าด้วยตนเองในประเด็นที่น่าสนใจ วิเคราะห์เชิงลึกตามระเบียบวิธีวิจัย และบูรณาการกับพระพุทธศาสนา",
      descriptionEn: "Individual research in English studies through in-depth analysis and synthesis, integrating English linguistics with Buddhism under faculty supervision.",
      displayOrder: 18,
    },
    {
      code: "407 400",
      nameTh: "วิทยานิพนธ์ (แผน ๑.๒)",
      nameEn: "Thesis (Plan 1.2)",
      credits: 12,
      creditHours: "12 (0-12-36)",
      category: CourseCategory.THESIS,
      year: 2,
      semester: 2,
      descriptionTh: "ศึกษาวิจัยทางภาษาอังกฤษ โดยการค้นคว้าด้วยตนเองตามระเบียบวิธีวิจัย และนำผลการศึกษาบูรณาการกับพระพุทธศาสนา",
      descriptionEn: "Self-directed research on an approved topic in English linguistics and communication, integrated with Buddhist values under supervision.",
      displayOrder: 19,
    },
  ];

  for (const c of coursesData) {
    await prisma.programCourse.create({
      data: {
        programId: program.id,
        code: c.code,
        nameTh: c.nameTh,
        nameEn: c.nameEn,
        credits: c.credits,
        creditHours: c.creditHours,
        category: c.category,
        year: c.year,
        semester: c.semester,
        descriptionTh: c.descriptionTh,
        descriptionEn: c.descriptionEn,
        displayOrder: c.displayOrder,
      },
    });
  }

  console.log(`  ✓ Inserted all ${coursesData.length} courses from มคอ.2 into database`);
  console.log("\n===============================================================");
  console.log("🎉 Successfully synchronized program and courses with มคอ.2!");
  console.log("===============================================================\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
