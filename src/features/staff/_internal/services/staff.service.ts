import { prisma, type Db } from "@/shared/lib/infra/prisma";
import { errors } from "@/shared/lib/errors";
import { Prisma, type Department, type StaffProfile } from "@/generated/prisma";
import type {
  CreateDepartmentInput,
  UpdateDepartmentInput,
  CreateStaffInput,
  UpdateStaffInput,
  ListStaffQuery,
  StaffType,
  AcademicRank,
} from "../schemas";

export interface DepartmentDto {
  id: string;
  tenantId: string;
  code: string;
  nameTh: string;
  nameEn: string;
  descriptionTh: string | null;
  descriptionEn: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  staffCount?: number;
}

export interface StaffProfileDto {
  id: string;
  tenantId: string;
  departmentId: string | null;
  departmentCode?: string | null;
  departmentNameTh?: string | null;
  departmentNameEn?: string | null;
  userId: string | null;
  staffType: StaffType;
  academicRank: AcademicRank;
  prefixTh: string | null;
  prefixEn: string | null;
  firstNameTh: string;
  lastNameTh: string;
  firstNameEn: string;
  lastNameEn: string;
  fullNameTh: string;
  fullNameEn: string;
  positionTh: string;
  positionEn: string;
  isExecutive: boolean;
  executiveRole: string | null;
  executiveOrder: number | null;
  email: string;
  phone: string | null;
  officeRoom: string | null;
  officeHours: string | null;
  avatarUrl: string | null;
  education: string[] | null;
  expertise: string[] | null;
  researchInterests: string | null;
  googleScholarUrl: string | null;
  scopusUrl: string | null;
  orcidId: string | null;
  websiteUrl: string | null;
  bioTh: string | null;
  bioEn: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StaffListResult {
  items: StaffProfileDto[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface PublicDirectoryData {
  executives: StaffProfileDto[];
  departments: DepartmentDto[];
  staffList: StaffProfileDto[];
}

type StaffWithRelations = StaffProfile & {
  department?: Department | null;
};

function parseJsonArray(val: unknown): string[] | null {
  if (!val) return null;
  if (Array.isArray(val)) return val.map(String);
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      return [val];
    }
  }
  return null;
}

function departmentToDto(dept: Department, staffCount?: number): DepartmentDto {
  return {
    id: dept.id,
    tenantId: dept.tenantId,
    code: dept.code,
    nameTh: dept.nameTh,
    nameEn: dept.nameEn,
    descriptionTh: dept.descriptionTh,
    descriptionEn: dept.descriptionEn,
    displayOrder: dept.displayOrder,
    isActive: dept.isActive,
    createdAt: dept.createdAt.toISOString(),
    updatedAt: dept.updatedAt.toISOString(),
    staffCount,
  };
}

function staffToDto(staff: StaffWithRelations): StaffProfileDto {
  const prefixTh = staff.prefixTh ? `${staff.prefixTh} ` : "";
  const prefixEn = staff.prefixEn ? `${staff.prefixEn} ` : "";

  return {
    id: staff.id,
    tenantId: staff.tenantId,
    departmentId: staff.departmentId,
    departmentCode: staff.department?.code ?? null,
    departmentNameTh: staff.department?.nameTh ?? null,
    departmentNameEn: staff.department?.nameEn ?? null,
    userId: staff.userId,
    staffType: staff.staffType as StaffType,
    academicRank: staff.academicRank as AcademicRank,
    prefixTh: staff.prefixTh,
    prefixEn: staff.prefixEn,
    firstNameTh: staff.firstNameTh,
    lastNameTh: staff.lastNameTh,
    firstNameEn: staff.firstNameEn,
    lastNameEn: staff.lastNameEn,
    fullNameTh: `${prefixTh}${staff.firstNameTh} ${staff.lastNameTh}`.trim(),
    fullNameEn: `${prefixEn}${staff.firstNameEn} ${staff.lastNameEn}`.trim(),
    positionTh: staff.positionTh,
    positionEn: staff.positionEn,
    isExecutive: staff.isExecutive,
    executiveRole: staff.executiveRole,
    executiveOrder: staff.executiveOrder,
    email: staff.email,
    phone: staff.phone,
    officeRoom: staff.officeRoom,
    officeHours: staff.officeHours,
    avatarUrl: staff.avatarUrl,
    education: parseJsonArray(staff.education),
    expertise: parseJsonArray(staff.expertise),
    researchInterests: staff.researchInterests,
    googleScholarUrl: staff.googleScholarUrl,
    scopusUrl: staff.scopusUrl,
    orcidId: staff.orcidId,
    websiteUrl: staff.websiteUrl,
    bioTh: staff.bioTh,
    bioEn: staff.bioEn,
    displayOrder: staff.displayOrder,
    isActive: staff.isActive,
    createdAt: staff.createdAt.toISOString(),
    updatedAt: staff.updatedAt.toISOString(),
  };
}

export async function resolvePortalTenantId(db: Db = prisma): Promise<string> {
  const tenant =
    (await db.tenant.findUnique({ where: { code: "DEMO" }, select: { id: true } })) ??
    (await db.tenant.findFirst({ where: { isActive: true }, orderBy: { createdAt: "asc" }, select: { id: true } }));
  if (!tenant) throw errors.not_found();
  return tenant.id;
}

// ================= Departments =================

export async function listDepartments(
  tenantId: string,
  onlyActive = false,
  db: Db = prisma,
): Promise<DepartmentDto[]> {
  const where: Prisma.DepartmentWhereInput = { tenantId };
  if (onlyActive) where.isActive = true;

  const depts = await db.department.findMany({
    where,
    orderBy: [{ displayOrder: "asc" }, { code: "asc" }],
    include: {
      _count: { select: { staffProfiles: true } },
    },
  });

  return depts.map((d) => departmentToDto(d, d._count.staffProfiles));
}

export async function getDepartmentById(
  tenantId: string,
  id: string,
  db: Db = prisma,
): Promise<DepartmentDto | null> {
  const dept = await db.department.findFirst({
    where: { id, tenantId },
  });
  return dept ? departmentToDto(dept) : null;
}

export async function createDepartment(
  tenantId: string,
  input: CreateDepartmentInput,
  db: Db = prisma,
): Promise<DepartmentDto> {
  const existing = await db.department.findUnique({
    where: { tenantId_code: { tenantId, code: input.code } },
  });
  if (existing) {
    throw errors.conflict("department_code_exists");
  }

  const dept = await db.department.create({
    data: {
      tenantId,
      code: input.code,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      descriptionTh: input.descriptionTh ?? null,
      descriptionEn: input.descriptionEn ?? null,
      displayOrder: input.displayOrder ?? 0,
      isActive: input.isActive ?? true,
    },
  });

  return departmentToDto(dept);
}

export async function updateDepartment(
  tenantId: string,
  input: UpdateDepartmentInput,
  db: Db = prisma,
): Promise<DepartmentDto> {
  const existing = await db.department.findFirst({
    where: { id: input.id, tenantId },
  });
  if (!existing) {
    throw errors.not_found("department_not_found");
  }

  if (input.code && input.code !== existing.code) {
    const codeDup = await db.department.findUnique({
      where: { tenantId_code: { tenantId, code: input.code } },
    });
    if (codeDup) {
      throw errors.conflict("department_code_exists");
    }
  }

  const updated = await db.department.update({
    where: { id: input.id },
    data: {
      ...(input.code ? { code: input.code } : {}),
      ...(input.nameTh ? { nameTh: input.nameTh } : {}),
      ...(input.nameEn ? { nameEn: input.nameEn } : {}),
      ...(input.descriptionTh !== undefined ? { descriptionTh: input.descriptionTh } : {}),
      ...(input.descriptionEn !== undefined ? { descriptionEn: input.descriptionEn } : {}),
      ...(input.displayOrder !== undefined ? { displayOrder: input.displayOrder } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
  });

  return departmentToDto(updated);
}

export async function deleteDepartment(
  tenantId: string,
  id: string,
  db: Db = prisma,
): Promise<void> {
  const existing = await db.department.findFirst({
    where: { id, tenantId },
  });
  if (!existing) {
    throw errors.not_found("department_not_found");
  }

  await db.department.delete({ where: { id } });
}

// ================= Staff Profiles =================

export async function listStaffProfiles(
  tenantId: string,
  query: Partial<ListStaffQuery> = {},
  db: Db = prisma,
): Promise<StaffListResult> {
  const page = query.page ?? 1;
  const perPage = query.perPage ?? 50;
  const skip = (page - 1) * perPage;

  const where: Prisma.StaffProfileWhereInput = { tenantId };

  if (query.departmentId) where.departmentId = query.departmentId;
  if (query.staffType) where.staffType = query.staffType;
  if (query.academicRank) where.academicRank = query.academicRank;
  if (query.isExecutive !== undefined) where.isExecutive = query.isExecutive;
  if (query.isActive !== undefined) where.isActive = query.isActive;

  if (query.search) {
    const s = query.search.trim();
    where.OR = [
      { firstNameTh: { contains: s } },
      { lastNameTh: { contains: s } },
      { firstNameEn: { contains: s } },
      { lastNameEn: { contains: s } },
      { positionTh: { contains: s } },
      { positionEn: { contains: s } },
      { email: { contains: s } },
    ];
  }

  const [staffList, total] = await Promise.all([
    db.staffProfile.findMany({
      where,
      skip,
      take: perPage,
      orderBy: [
        { isExecutive: "desc" },
        { executiveOrder: "asc" },
        { displayOrder: "asc" },
        { createdAt: "desc" },
      ],
      include: {
        department: true,
      },
    }),
    db.staffProfile.count({ where }),
  ]);

  return {
    items: staffList.map(staffToDto),
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getStaffProfileById(
  tenantId: string,
  id: string,
  db: Db = prisma,
): Promise<StaffProfileDto | null> {
  const staff = await db.staffProfile.findFirst({
    where: { id, tenantId },
    include: { department: true },
  });
  return staff ? staffToDto(staff) : null;
}

export async function createStaffProfile(
  tenantId: string,
  input: CreateStaffInput,
  db: Db = prisma,
): Promise<StaffProfileDto> {
  if (input.departmentId) {
    const dept = await db.department.findFirst({
      where: { id: input.departmentId, tenantId },
    });
    if (!dept) {
      throw errors.not_found("department_not_found");
    }
  }

  const staff = await db.staffProfile.create({
    data: {
      tenantId,
      departmentId: input.departmentId ?? null,
      userId: input.userId ?? null,
      staffType: input.staffType ?? "ACADEMIC",
      academicRank: input.academicRank ?? "NONE",
      prefixTh: input.prefixTh ?? null,
      prefixEn: input.prefixEn ?? null,
      firstNameTh: input.firstNameTh,
      lastNameTh: input.lastNameTh,
      firstNameEn: input.firstNameEn,
      lastNameEn: input.lastNameEn,
      positionTh: input.positionTh,
      positionEn: input.positionEn,
      isExecutive: input.isExecutive ?? false,
      executiveRole: input.executiveRole ?? null,
      executiveOrder: input.executiveOrder ?? null,
      email: input.email,
      phone: input.phone ?? null,
      officeRoom: input.officeRoom ?? null,
      officeHours: input.officeHours ?? null,
      avatarUrl: input.avatarUrl || null,
      education: input.education ? (input.education as Prisma.InputJsonValue) : Prisma.JsonNull,
      expertise: input.expertise ? (input.expertise as Prisma.InputJsonValue) : Prisma.JsonNull,
      researchInterests: input.researchInterests ?? null,
      googleScholarUrl: input.googleScholarUrl || null,
      scopusUrl: input.scopusUrl || null,
      orcidId: input.orcidId ?? null,
      websiteUrl: input.websiteUrl || null,
      bioTh: input.bioTh ?? null,
      bioEn: input.bioEn ?? null,
      displayOrder: input.displayOrder ?? 0,
      isActive: input.isActive ?? true,
    },
    include: {
      department: true,
    },
  });

  return staffToDto(staff);
}

export async function updateStaffProfile(
  tenantId: string,
  input: UpdateStaffInput,
  db: Db = prisma,
): Promise<StaffProfileDto> {
  const existing = await db.staffProfile.findFirst({
    where: { id: input.id, tenantId },
  });
  if (!existing) {
    throw errors.not_found("staff_not_found");
  }

  if (input.departmentId) {
    const dept = await db.department.findFirst({
      where: { id: input.departmentId, tenantId },
    });
    if (!dept) {
      throw errors.not_found("department_not_found");
    }
  }

  const updated = await db.staffProfile.update({
    where: { id: input.id },
    data: {
      ...(input.departmentId !== undefined ? { departmentId: input.departmentId } : {}),
      ...(input.userId !== undefined ? { userId: input.userId } : {}),
      ...(input.staffType ? { staffType: input.staffType } : {}),
      ...(input.academicRank ? { academicRank: input.academicRank } : {}),
      ...(input.prefixTh !== undefined ? { prefixTh: input.prefixTh } : {}),
      ...(input.prefixEn !== undefined ? { prefixEn: input.prefixEn } : {}),
      ...(input.firstNameTh ? { firstNameTh: input.firstNameTh } : {}),
      ...(input.lastNameTh ? { lastNameTh: input.lastNameTh } : {}),
      ...(input.firstNameEn ? { firstNameEn: input.firstNameEn } : {}),
      ...(input.lastNameEn ? { lastNameEn: input.lastNameEn } : {}),
      ...(input.positionTh ? { positionTh: input.positionTh } : {}),
      ...(input.positionEn ? { positionEn: input.positionEn } : {}),
      ...(input.isExecutive !== undefined ? { isExecutive: input.isExecutive } : {}),
      ...(input.executiveRole !== undefined ? { executiveRole: input.executiveRole } : {}),
      ...(input.executiveOrder !== undefined ? { executiveOrder: input.executiveOrder } : {}),
      ...(input.email ? { email: input.email } : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
      ...(input.officeRoom !== undefined ? { officeRoom: input.officeRoom } : {}),
      ...(input.officeHours !== undefined ? { officeHours: input.officeHours } : {}),
      ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl || null } : {}),
      ...(input.education !== undefined
        ? { education: input.education ? (input.education as Prisma.InputJsonValue) : Prisma.JsonNull }
        : {}),
      ...(input.expertise !== undefined
        ? { expertise: input.expertise ? (input.expertise as Prisma.InputJsonValue) : Prisma.JsonNull }
        : {}),
      ...(input.researchInterests !== undefined ? { researchInterests: input.researchInterests } : {}),
      ...(input.googleScholarUrl !== undefined ? { googleScholarUrl: input.googleScholarUrl || null } : {}),
      ...(input.scopusUrl !== undefined ? { scopusUrl: input.scopusUrl || null } : {}),
      ...(input.orcidId !== undefined ? { orcidId: input.orcidId } : {}),
      ...(input.websiteUrl !== undefined ? { websiteUrl: input.websiteUrl || null } : {}),
      ...(input.bioTh !== undefined ? { bioTh: input.bioTh } : {}),
      ...(input.bioEn !== undefined ? { bioEn: input.bioEn } : {}),
      ...(input.displayOrder !== undefined ? { displayOrder: input.displayOrder } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
    include: {
      department: true,
    },
  });

  return staffToDto(updated);
}

export async function deleteStaffProfile(
  tenantId: string,
  id: string,
  db: Db = prisma,
): Promise<void> {
  const existing = await db.staffProfile.findFirst({
    where: { id, tenantId },
  });
  if (!existing) {
    throw errors.not_found("staff_not_found");
  }

  await db.staffProfile.delete({ where: { id } });
}

export async function toggleStaffActive(
  tenantId: string,
  id: string,
  db: Db = prisma,
): Promise<StaffProfileDto> {
  const existing = await db.staffProfile.findFirst({
    where: { id, tenantId },
  });
  if (!existing) {
    throw errors.not_found("staff_not_found");
  }

  const updated = await db.staffProfile.update({
    where: { id },
    data: { isActive: !existing.isActive },
    include: { department: true },
  });

  return staffToDto(updated);
}

// ================= Public Portal Directory =================

export async function getPublicStaffDirectory(
  tenantId: string,
  filters: { departmentId?: string; staffType?: StaffType; search?: string } = {},
  db: Db = prisma,
): Promise<PublicDirectoryData> {
  const [executivesRaw, departmentsRaw, staffRaw] = await Promise.all([
    // Executives (always load active executives for leadership section)
    db.staffProfile.findMany({
      where: {
        tenantId,
        isActive: true,
        isExecutive: true,
      },
      orderBy: [{ executiveOrder: "asc" }, { displayOrder: "asc" }],
      include: { department: true },
    }),
    // Departments
    db.department.findMany({
      where: { tenantId, isActive: true },
      orderBy: [{ displayOrder: "asc" }, { code: "asc" }],
    }),
    // All active staff for the directory listing
    db.staffProfile.findMany({
      where: {
        tenantId,
        isActive: true,
        ...(filters.departmentId ? { departmentId: filters.departmentId } : {}),
        ...(filters.staffType ? { staffType: filters.staffType } : {}),
        ...(filters.search
          ? {
              OR: [
                { firstNameTh: { contains: filters.search.trim() } },
                { lastNameTh: { contains: filters.search.trim() } },
                { firstNameEn: { contains: filters.search.trim() } },
                { lastNameEn: { contains: filters.search.trim() } },
                { positionTh: { contains: filters.search.trim() } },
                { positionEn: { contains: filters.search.trim() } },
                { researchInterests: { contains: filters.search.trim() } },
              ],
            }
          : {}),
      },
      orderBy: [
        { displayOrder: "asc" },
        { academicRank: "desc" },
        { createdAt: "desc" },
      ],
      include: { department: true },
    }),
  ]);

  return {
    executives: executivesRaw.map(staffToDto),
    departments: departmentsRaw.map((d) => departmentToDto(d)),
    staffList: staffRaw.map(staffToDto),
  };
}

export async function getPublicStaffDetail(
  tenantId: string,
  id: string,
  db: Db = prisma,
): Promise<StaffProfileDto | null> {
  const staff = await db.staffProfile.findFirst({
    where: { id, tenantId, isActive: true },
    include: { department: true },
  });
  return staff ? staffToDto(staff) : null;
}
