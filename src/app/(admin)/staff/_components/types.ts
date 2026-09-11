import type { StaffType, AcademicRank } from "@/features/staff";

export interface StaffFormData {
  id?: string;
  departmentId: string;
  staffType: StaffType;
  academicRank: AcademicRank;
  prefixTh: string;
  prefixEn: string;
  firstNameTh: string;
  lastNameTh: string;
  firstNameEn: string;
  lastNameEn: string;
  positionTh: string;
  positionEn: string;
  isExecutive: boolean;
  executiveRole: string;
  executiveOrder: number | null;
  email: string;
  phone: string;
  officeRoom: string;
  officeHours: string;
  avatarUrl: string;
  education: string[];
  expertise: string[];
  researchInterests: string;
  googleScholarUrl: string;
  scopusUrl: string;
  orcidId: string;
  websiteUrl: string;
  bioTh: string;
  bioEn: string;
  displayOrder: number;
  isActive: boolean;
}

export const emptyStaffForm: StaffFormData = {
  departmentId: "",
  staffType: "ACADEMIC",
  academicRank: "NONE",
  prefixTh: "",
  prefixEn: "",
  firstNameTh: "",
  lastNameTh: "",
  firstNameEn: "",
  lastNameEn: "",
  positionTh: "",
  positionEn: "",
  isExecutive: false,
  executiveRole: "",
  executiveOrder: null,
  email: "",
  phone: "",
  officeRoom: "",
  officeHours: "",
  avatarUrl: "",
  education: [],
  expertise: [],
  researchInterests: "",
  googleScholarUrl: "",
  scopusUrl: "",
  orcidId: "",
  websiteUrl: "",
  bioTh: "",
  bioEn: "",
  displayOrder: 0,
  isActive: true,
};

export interface DepartmentFormData {
  id?: string;
  code: string;
  nameTh: string;
  nameEn: string;
  descriptionTh: string;
  descriptionEn: string;
  displayOrder: number;
  isActive: boolean;
}

export const emptyDepartmentForm: DepartmentFormData = {
  code: "",
  nameTh: "",
  nameEn: "",
  descriptionTh: "",
  descriptionEn: "",
  displayOrder: 0,
  isActive: true,
};
