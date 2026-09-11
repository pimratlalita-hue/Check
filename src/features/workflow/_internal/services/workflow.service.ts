import { prisma, type Db } from "@/shared/lib/infra/prisma";
import { errors } from "@/shared/lib/errors";
import type {
  PetitionType,
  PetitionStatus,
  ApprovalAction,
  Petition,
  PetitionActivity,
  Program,
  StaffProfile,
} from "@/generated/prisma";
import type {
  SubmitPetitionInput,
  ProcessPetitionActionInput,
  ListPetitionsQueryInput,
} from "../schemas";

export interface PetitionActivityDto {
  id: string;
  petitionId: string;
  actorName: string;
  actorRole: string;
  action: ApprovalAction;
  previousStatus: PetitionStatus | null;
  newStatus: PetitionStatus;
  comment: string | null;
  createdAt: string;
}

export interface PetitionDto {
  id: string;
  tenantId: string;
  trackingNo: string;
  type: PetitionType;
  status: PetitionStatus;
  title: string;
  description: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string | null;
  programId: string | null;
  programNameTh?: string | null;
  programNameEn?: string | null;
  programDegreeTh?: string | null;
  advisorId: string | null;
  advisorNameTh?: string | null;
  advisorNameEn?: string | null;
  thesisTitleTh: string | null;
  thesisTitleEn: string | null;
  attachmentUrl: string | null;
  currentStep: number;
  createdAt: string;
  updatedAt: string;
  activities?: PetitionActivityDto[];
}

export interface PetitionListResult {
  items: PetitionDto[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface WorkflowStats {
  total: number;
  pending: number;
  completed: number;
  issues: number;
}

function mapActivityToDto(a: PetitionActivity): PetitionActivityDto {
  return {
    id: a.id,
    petitionId: a.petitionId,
    actorName: a.actorName,
    actorRole: a.actorRole,
    action: a.action,
    previousStatus: a.previousStatus,
    newStatus: a.newStatus,
    comment: a.comment,
    createdAt: a.createdAt.toISOString(),
  };
}

function mapPetitionToDto(
  p: Petition & {
    program?: Program | null;
    advisor?: StaffProfile | null;
    activities?: PetitionActivity[];
  }
): PetitionDto {
  const advisorNameTh = p.advisor
    ? `${p.advisor.prefixTh ?? ""}${p.advisor.firstNameTh} ${p.advisor.lastNameTh}`.trim()
    : null;
  const advisorNameEn = p.advisor
    ? `${p.advisor.prefixEn ?? ""}${p.advisor.firstNameEn} ${p.advisor.lastNameEn}`.trim()
    : null;

  return {
    id: p.id,
    tenantId: p.tenantId,
    trackingNo: p.trackingNo,
    type: p.type,
    status: p.status,
    title: p.title,
    description: p.description,
    studentId: p.studentId,
    studentName: p.studentName,
    studentEmail: p.studentEmail,
    studentPhone: p.studentPhone,
    programId: p.programId,
    programNameTh: p.program?.nameTh ?? null,
    programNameEn: p.program?.nameEn ?? null,
    programDegreeTh: p.program?.degreeTh ?? null,
    advisorId: p.advisorId,
    advisorNameTh,
    advisorNameEn,
    thesisTitleTh: p.thesisTitleTh,
    thesisTitleEn: p.thesisTitleEn,
    attachmentUrl: p.attachmentUrl,
    currentStep: p.currentStep,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    activities: p.activities ? p.activities.map(mapActivityToDto) : undefined,
  };
}

/**
 * Generate a sequential tracking number for the current year
 * Format: REQ-YYYY-XXXX (e.g. REQ-2026-0001)
 */
export async function generateTrackingNo(tenantId: string, db: Db = prisma): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `REQ-${year}-`;

  const latest = await db.petition.findFirst({
    where: { tenantId, trackingNo: { startsWith: prefix } },
    orderBy: { trackingNo: "desc" },
    select: { trackingNo: true },
  });

  let nextSeq = 1;
  if (latest?.trackingNo) {
    const parts = latest.trackingNo.split("-");
    const lastNum = parseInt(parts[2] || "0", 10);
    if (!isNaN(lastNum)) {
      nextSeq = lastNum + 1;
    }
  }

  return `${prefix}${String(nextSeq).padStart(4, "0")}`;
}

/**
 * Submit a new petition from Public Portal
 */
export async function submitPublicPetition(
  tenantId: string,
  input: SubmitPetitionInput,
  db: Db = prisma
): Promise<PetitionDto> {
  const trackingNo = await generateTrackingNo(tenantId, db);

  const created = await db.petition.create({
    data: {
      tenantId,
      trackingNo,
      type: input.type,
      status: "SUBMITTED",
      title: input.title,
      description: input.description,
      studentId: input.studentId,
      studentName: input.studentName,
      studentEmail: input.studentEmail,
      studentPhone: input.studentPhone,
      programId: input.programId || null,
      advisorId: input.advisorId || null,
      thesisTitleTh: input.thesisTitleTh,
      thesisTitleEn: input.thesisTitleEn,
      attachmentUrl: input.attachmentUrl,
      currentStep: 1,
      activities: {
        create: {
          actorName: input.studentName,
          actorRole: "STUDENT",
          action: "SUBMIT",
          previousStatus: null,
          newStatus: "SUBMITTED",
          comment: "ยื่นคำร้องผ่านระบบออนไลน์เรียบร้อยแล้ว",
        },
      },
    },
    include: {
      program: true,
      advisor: true,
      activities: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return mapPetitionToDto(created);
}

/**
 * Track petitions by trackingNo or studentId
 */
export async function trackPublicPetition(
  tenantId: string,
  query: string,
  db: Db = prisma
): Promise<PetitionDto[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  const petitions = await db.petition.findMany({
    where: {
      tenantId,
      OR: [
        { trackingNo: cleanQuery },
        { studentId: cleanQuery },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      program: true,
      advisor: true,
      activities: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return petitions.map(mapPetitionToDto);
}

/**
 * Get petition detail by trackingNo for Public Portal
 */
export async function getPublicPetitionDetail(
  tenantId: string,
  trackingNo: string,
  db: Db = prisma
): Promise<PetitionDto | null> {
  const petition = await db.petition.findFirst({
    where: { tenantId, trackingNo },
    include: {
      program: true,
      advisor: true,
      activities: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!petition) return null;
  return mapPetitionToDto(petition);
}

/**
 * List petitions for Admin Console with filters and pagination
 */
export async function listPetitions(
  tenantId: string,
  query: Partial<ListPetitionsQueryInput> = {},
  db: Db = prisma
): Promise<PetitionListResult> {
  const page = query.page ?? 1;
  const perPage = query.perPage ?? 50;
  const skip = (page - 1) * perPage;

  // Build filter conditions
  const where: import("@/generated/prisma").Prisma.PetitionWhereInput = { tenantId };

  if (query.tab === "pending") {
    where.status = { in: ["SUBMITTED", "ADVISOR_APPROVED", "CHAIR_APPROVED"] };
  } else if (query.tab === "completed") {
    where.status = "COMPLETED";
  } else if (query.tab === "issues") {
    where.status = { in: ["RETURNED", "REJECTED", "CANCELLED"] };
  } else if (query.status) {
    where.status = query.status;
  }

  if (query.type) {
    where.type = query.type;
  }

  if (query.advisorId) {
    where.advisorId = query.advisorId;
  }

  if (query.search) {
    const s = query.search.trim();
    where.OR = [
      { trackingNo: { contains: s } },
      { studentId: { contains: s } },
      { studentName: { contains: s } },
      { title: { contains: s } },
    ];
  }

  const [total, items] = await Promise.all([
    db.petition.count({ where }),
    db.petition.findMany({
      where,
      skip,
      take: perPage,
      orderBy: { createdAt: "desc" },
      include: {
        program: true,
        advisor: true,
        activities: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    }),
  ]);

  return {
    items: items.map(mapPetitionToDto),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage) || 1,
  };
}

/**
 * Get petition by ID for Admin Console
 */
export async function getPetitionById(
  tenantId: string,
  id: string,
  db: Db = prisma
): Promise<PetitionDto | null> {
  const petition = await db.petition.findFirst({
    where: { id, tenantId },
    include: {
      program: true,
      advisor: true,
      activities: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!petition) return null;
  return mapPetitionToDto(petition);
}

/**
 * Get Dashboard KPIs for Workflow
 */
export async function getWorkflowStats(
  tenantId: string,
  db: Db = prisma
): Promise<WorkflowStats> {
  const [total, pending, completed, issues] = await Promise.all([
    db.petition.count({ where: { tenantId } }),
    db.petition.count({
      where: {
        tenantId,
        status: { in: ["SUBMITTED", "ADVISOR_APPROVED", "CHAIR_APPROVED"] },
      },
    }),
    db.petition.count({
      where: {
        tenantId,
        status: "COMPLETED",
      },
    }),
    db.petition.count({
      where: {
        tenantId,
        status: { in: ["RETURNED", "REJECTED", "CANCELLED"] },
      },
    }),
  ]);

  return { total, pending, completed, issues };
}

/**
 * Process a review decision (Approve, Return, Reject) with State Machine transitions
 */
export async function processPetitionAction(
  tenantId: string,
  input: ProcessPetitionActionInput,
  db: Db = prisma
): Promise<PetitionDto> {
  const petition = await db.petition.findFirst({
    where: { id: input.petitionId, tenantId },
  });

  if (!petition) {
    throw errors.not_found("ไม่พบคำร้องที่ต้องการพิจารณา");
  }

  if (petition.status === "COMPLETED") {
    throw errors.validation("ไม่สามารถพิจารณาคำร้องที่เสร็จสมบูรณ์แล้วได้");
  }

  if (petition.status === "REJECTED" || petition.status === "CANCELLED") {
    throw errors.validation("ไม่สามารถพิจารณาคำร้องที่ถูกปฏิเสธหรือยกเลิกแล้วได้");
  }

  let nextStatus: PetitionStatus;
  let nextStep = petition.currentStep;

  if (input.action === "APPROVE") {
    if (petition.status === "SUBMITTED") {
      nextStatus = "ADVISOR_APPROVED";
      nextStep = 2;
    } else if (petition.status === "ADVISOR_APPROVED") {
      nextStatus = "CHAIR_APPROVED";
      nextStep = 3;
    } else if (petition.status === "CHAIR_APPROVED") {
      nextStatus = "COMPLETED";
      nextStep = 4;
    } else if (petition.status === "RETURNED") {
      // If approved while in returned state, move to ADVISOR_APPROVED
      nextStatus = "ADVISOR_APPROVED";
      nextStep = 2;
    } else {
      nextStatus = "COMPLETED";
      nextStep = 4;
    }
  } else if (input.action === "RETURN") {
    nextStatus = "RETURNED";
    nextStep = 1;
  } else if (input.action === "REJECT") {
    nextStatus = "REJECTED";
  } else {
    throw errors.validation("การกระทำไม่ถูกต้อง");
  }

  // Update petition and record activity in a transaction
  const updated = await db.petition.update({
    where: { id: input.petitionId },
    data: {
      status: nextStatus,
      currentStep: nextStep,
      activities: {
        create: {
          actorName: input.actorName,
          actorRole: input.actorRole,
          action: input.action as ApprovalAction,
          previousStatus: petition.status,
          newStatus: nextStatus,
          comment: input.comment ?? null,
        },
      },
    },
    include: {
      program: true,
      advisor: true,
      activities: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return mapPetitionToDto(updated);
}

/**
 * Resolve tenant ID for public portal
 */
export async function resolvePortalTenantId(db: Db = prisma): Promise<string> {
  const tenant =
    (await db.tenant.findUnique({ where: { code: "DEMO" }, select: { id: true } })) ??
    (await db.tenant.findFirst({ where: { isActive: true }, orderBy: { createdAt: "asc" }, select: { id: true } }));
  if (!tenant) throw errors.not_found();
  return tenant.id;
}

export interface WorkflowFormData {
  programs: Array<{
    id: string;
    code: string;
    nameTh: string;
    nameEn: string;
    degreeTh: string;
    level: string;
  }>;
  advisors: Array<{
    id: string;
    nameTh: string;
    nameEn: string;
    positionTh: string;
    departmentNameTh?: string | null;
  }>;
}

/**
 * Get programs and advisors for public submission dropdowns
 */
export async function getPublicWorkflowFormData(
  tenantId: string,
  db: Db = prisma
): Promise<WorkflowFormData> {
  const [programs, advisors] = await Promise.all([
    db.program.findMany({
      where: { tenantId, status: "ACTIVE" },
      orderBy: [{ level: "asc" }, { displayOrder: "asc" }],
      select: {
        id: true,
        code: true,
        nameTh: true,
        nameEn: true,
        degreeTh: true,
        level: true,
      },
    }),
    db.staffProfile.findMany({
      where: { tenantId, isActive: true },
      include: { department: true },
      orderBy: [{ displayOrder: "asc" }, { firstNameTh: "asc" }],
    }),
  ]);

  return {
    programs,
    advisors: advisors.map((a) => ({
      id: a.id,
      nameTh: `${a.prefixTh ?? ""}${a.firstNameTh} ${a.lastNameTh}`.trim(),
      nameEn: `${a.prefixEn ?? ""}${a.firstNameEn} ${a.lastNameEn}`.trim(),
      positionTh: a.positionTh,
      departmentNameTh: a.department?.nameTh ?? null,
    })),
  };
}

