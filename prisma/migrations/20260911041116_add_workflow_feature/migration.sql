-- CreateTable
CREATE TABLE `petitions` (
    `id` VARCHAR(36) NOT NULL,
    `tenant_id` VARCHAR(36) NOT NULL,
    `tracking_no` VARCHAR(50) NOT NULL,
    `type` ENUM('THESIS_TOPIC_APPROVAL', 'DEFENSE_EXAM_REQUEST', 'LEAVE_OF_ABSENCE', 'EXTENSION_OF_STUDY', 'GENERAL_PETITION') NOT NULL,
    `status` ENUM('SUBMITTED', 'ADVISOR_APPROVED', 'CHAIR_APPROVED', 'COMPLETED', 'RETURNED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'SUBMITTED',
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `student_id` VARCHAR(50) NOT NULL,
    `student_name` VARCHAR(255) NOT NULL,
    `student_email` VARCHAR(255) NOT NULL,
    `student_phone` VARCHAR(50) NULL,
    `program_id` VARCHAR(36) NULL,
    `advisor_id` VARCHAR(36) NULL,
    `thesis_title_th` VARCHAR(500) NULL,
    `thesis_title_en` VARCHAR(500) NULL,
    `attachment_url` VARCHAR(500) NULL,
    `current_step` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `petitions_tenant_id_status_idx`(`tenant_id`, `status`),
    INDEX `petitions_tenant_id_student_id_idx`(`tenant_id`, `student_id`),
    INDEX `petitions_tenant_id_advisor_id_idx`(`tenant_id`, `advisor_id`),
    UNIQUE INDEX `petitions_tenant_id_tracking_no_key`(`tenant_id`, `tracking_no`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `petition_activities` (
    `id` VARCHAR(36) NOT NULL,
    `petition_id` VARCHAR(36) NOT NULL,
    `actor_name` VARCHAR(255) NOT NULL,
    `actor_role` VARCHAR(100) NOT NULL,
    `action` ENUM('SUBMIT', 'APPROVE', 'RETURN', 'REJECT', 'CANCEL') NOT NULL,
    `previous_status` ENUM('SUBMITTED', 'ADVISOR_APPROVED', 'CHAIR_APPROVED', 'COMPLETED', 'RETURNED', 'REJECTED', 'CANCELLED') NULL,
    `new_status` ENUM('SUBMITTED', 'ADVISOR_APPROVED', 'CHAIR_APPROVED', 'COMPLETED', 'RETURNED', 'REJECTED', 'CANCELLED') NOT NULL,
    `comment` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `petition_activities_petition_id_created_at_idx`(`petition_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `petitions` ADD CONSTRAINT `petitions_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `petitions` ADD CONSTRAINT `petitions_program_id_fkey` FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `petitions` ADD CONSTRAINT `petitions_advisor_id_fkey` FOREIGN KEY (`advisor_id`) REFERENCES `staff_profiles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `petition_activities` ADD CONSTRAINT `petition_activities_petition_id_fkey` FOREIGN KEY (`petition_id`) REFERENCES `petitions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
