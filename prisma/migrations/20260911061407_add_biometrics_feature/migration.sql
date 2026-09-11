-- CreateTable
CREATE TABLE `exam_attendances` (
    `id` VARCHAR(36) NOT NULL,
    `tenant_id` VARCHAR(36) NOT NULL,
    `booking_id` VARCHAR(36) NULL,
    `student_code` VARCHAR(50) NOT NULL,
    `student_name` VARCHAR(255) NOT NULL,
    `exam_type` ENUM('PROPOSAL_DEFENSE', 'FINAL_DEFENSE', 'COMPREHENSIVE', 'QUALIFYING') NOT NULL DEFAULT 'PROPOSAL_DEFENSE',
    `face_hash` VARCHAR(255) NOT NULL,
    `confidence_score` DOUBLE NOT NULL DEFAULT 95.0,
    `status` ENUM('VERIFIED', 'FLAGGED', 'MANUAL_OVERRIDE') NOT NULL DEFAULT 'VERIFIED',
    `pdpa_consent` BOOLEAN NOT NULL DEFAULT true,
    `pdpa_consent_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `verified_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `verified_by` VARCHAR(255) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `exam_attendances_tenant_id_student_code_idx`(`tenant_id`, `student_code`),
    INDEX `exam_attendances_tenant_id_verified_at_idx`(`tenant_id`, `verified_at`),
    INDEX `exam_attendances_tenant_id_status_idx`(`tenant_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `exam_attendances` ADD CONSTRAINT `exam_attendances_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_attendances` ADD CONSTRAINT `exam_attendances_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `room_bookings`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
