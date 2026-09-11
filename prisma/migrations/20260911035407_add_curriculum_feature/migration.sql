-- CreateTable
CREATE TABLE `programs` (
    `id` VARCHAR(36) NOT NULL,
    `tenant_id` VARCHAR(36) NOT NULL,
    `department_id` VARCHAR(36) NULL,
    `code` VARCHAR(50) NOT NULL,
    `name_th` VARCHAR(255) NOT NULL,
    `name_en` VARCHAR(255) NOT NULL,
    `degree_th` VARCHAR(255) NOT NULL,
    `degree_en` VARCHAR(255) NOT NULL,
    `degree_short_th` VARCHAR(100) NOT NULL,
    `degree_short_en` VARCHAR(100) NOT NULL,
    `level` ENUM('BACHELOR', 'MASTER', 'DOCTORAL', 'CERTIFICATE') NOT NULL DEFAULT 'BACHELOR',
    `type` ENUM('THAI', 'INTERNATIONAL', 'BILINGUAL') NOT NULL DEFAULT 'THAI',
    `status` ENUM('DRAFT', 'ACTIVE', 'REVISED', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `slug` VARCHAR(100) NOT NULL,
    `total_credits` INTEGER NOT NULL,
    `study_duration` VARCHAR(100) NOT NULL,
    `tuition_fee` VARCHAR(255) NULL,
    `description_th` TEXT NULL,
    `description_en` TEXT NULL,
    `philosophy_th` TEXT NULL,
    `philosophy_en` TEXT NULL,
    `career_paths` JSON NULL,
    `learning_outcomes` JSON NULL,
    `handbook_url` VARCHAR(500) NULL,
    `image_url` VARCHAR(500) NULL,
    `display_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `programs_tenant_id_level_status_idx`(`tenant_id`, `level`, `status`),
    INDEX `programs_tenant_id_department_id_idx`(`tenant_id`, `department_id`),
    UNIQUE INDEX `programs_tenant_id_code_key`(`tenant_id`, `code`),
    UNIQUE INDEX `programs_tenant_id_slug_key`(`tenant_id`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `program_courses` (
    `id` VARCHAR(36) NOT NULL,
    `program_id` VARCHAR(36) NOT NULL,
    `code` VARCHAR(20) NOT NULL,
    `name_th` VARCHAR(255) NOT NULL,
    `name_en` VARCHAR(255) NOT NULL,
    `credits` INTEGER NOT NULL DEFAULT 3,
    `credit_hours` VARCHAR(50) NULL,
    `category` ENUM('GENERAL_EDUCATION', 'CORE_COURSE', 'MAJOR_ELECTIVE', 'FREE_ELECTIVE', 'THESIS') NOT NULL DEFAULT 'CORE_COURSE',
    `semester` INTEGER NULL,
    `year` INTEGER NULL,
    `description_th` TEXT NULL,
    `description_en` TEXT NULL,
    `prerequisite` VARCHAR(255) NULL,
    `display_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `program_courses_program_id_category_idx`(`program_id`, `category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `programs` ADD CONSTRAINT `programs_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `programs` ADD CONSTRAINT `programs_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `program_courses` ADD CONSTRAINT `program_courses_program_id_fkey` FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
