import type {
  DegreeLevel,
  ProgramType,
  ProgramStatus,
  CourseCategory,
  LearningOutcome,
} from "@/features/curriculum";

export interface ProgramFormData {
  id?: string;
  code: string;
  nameTh: string;
  nameEn: string;
  degreeTh: string;
  degreeEn: string;
  degreeShortTh: string;
  degreeShortEn: string;
  level: DegreeLevel;
  type: ProgramType;
  status: ProgramStatus;
  slug: string;
  totalCredits: number;
  studyDuration: string;
  tuitionFee: string;
  descriptionTh: string;
  descriptionEn: string;
  philosophyTh: string;
  philosophyEn: string;
  careerPaths: string[];
  learningOutcomes: LearningOutcome[];
  handbookUrl: string;
  imageUrl: string;
  departmentId: string;
  displayOrder: number;
}

export const emptyProgramForm: ProgramFormData = {
  code: "",
  nameTh: "",
  nameEn: "",
  degreeTh: "",
  degreeEn: "",
  degreeShortTh: "",
  degreeShortEn: "",
  level: "BACHELOR",
  type: "THAI",
  status: "ACTIVE",
  slug: "",
  totalCredits: 120,
  studyDuration: "4 ปี (8 ภาคการศึกษา)",
  tuitionFee: "",
  descriptionTh: "",
  descriptionEn: "",
  philosophyTh: "",
  philosophyEn: "",
  careerPaths: [],
  learningOutcomes: [],
  handbookUrl: "",
  imageUrl: "",
  departmentId: "",
  displayOrder: 0,
};

export interface CourseFormData {
  id?: string;
  programId: string;
  code: string;
  nameTh: string;
  nameEn: string;
  credits: number;
  creditHours: string;
  category: CourseCategory;
  semester: number | null;
  year: number | null;
  descriptionTh: string;
  descriptionEn: string;
  prerequisite: string;
  displayOrder: number;
}

export const emptyCourseForm: CourseFormData = {
  programId: "",
  code: "",
  nameTh: "",
  nameEn: "",
  credits: 3,
  creditHours: "3(2-2-5)",
  category: "CORE_COURSE",
  semester: 1,
  year: 1,
  descriptionTh: "",
  descriptionEn: "",
  prerequisite: "",
  displayOrder: 0,
};
