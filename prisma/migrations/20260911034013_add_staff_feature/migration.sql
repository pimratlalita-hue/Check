-- CreateTable
CREATE TABLE `departments` (
    `id` VARCHAR(36) NOT NULL,
    `tenant_id` VARCHAR(36) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `name_th` VARCHAR(255) NOT NULL,
    `name_en` VARCHAR(255) NOT NULL,
    `description_th` TEXT NULL,
    `description_en` TEXT NULL,
    `display_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `departments_tenant_id_is_active_display_order_idx`(`tenant_id`, `is_active`, `display_order`),
    UNIQUE INDEX `departments_tenant_id_code_key`(`tenant_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `staff_profiles` (
    `id` VARCHAR(36) NOT NULL,
    `tenant_id` VARCHAR(36) NOT NULL,
    `department_id` VARCHAR(36) NULL,
    `user_id` VARCHAR(36) NULL,
    `staff_type` ENUM('ACADEMIC', 'SUPPORT', 'EXECUTIVE') NOT NULL DEFAULT 'ACADEMIC',
    `academic_rank` ENUM('PROFESSOR', 'ASSOCIATE_PROFESSOR', 'ASSISTANT_PROFESSOR', 'LECTURER', 'NONE') NOT NULL DEFAULT 'NONE',
    `prefix_th` VARCHAR(50) NULL,
    `prefix_en` VARCHAR(50) NULL,
    `first_name_th` VARCHAR(100) NOT NULL,
    `last_name_th` VARCHAR(100) NOT NULL,
    `first_name_en` VARCHAR(100) NOT NULL,
    `last_name_en` VARCHAR(100) NOT NULL,
    `position_th` VARCHAR(255) NOT NULL,
    `position_en` VARCHAR(255) NOT NULL,
    `is_executive` BOOLEAN NOT NULL DEFAULT false,
    `executive_role` VARCHAR(255) NULL,
    `executive_order` INTEGER NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(50) NULL,
    `office_room` VARCHAR(100) NULL,
    `office_hours` VARCHAR(255) NULL,
    `avatar_url` VARCHAR(500) NULL,
    `education` JSON NULL,
    `expertise` JSON NULL,
    `research_interests` TEXT NULL,
    `google_scholar_url` VARCHAR(500) NULL,
    `scopus_url` VARCHAR(500) NULL,
    `orcid_id` VARCHAR(50) NULL,
    `website_url` VARCHAR(500) NULL,
    `bio_th` TEXT NULL,
    `bio_en` TEXT NULL,
    `display_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `staff_profiles_tenant_id_staff_type_is_active_idx`(`tenant_id`, `staff_type`, `is_active`),
    INDEX `staff_profiles_tenant_id_department_id_idx`(`tenant_id`, `department_id`),
    INDEX `staff_profiles_tenant_id_is_executive_executive_order_idx`(`tenant_id`, `is_executive`, `executive_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `departments` ADD CONSTRAINT `departments_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `staff_profiles` ADD CONSTRAINT `staff_profiles_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `staff_profiles` ADD CONSTRAINT `staff_profiles_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `staff_profiles` ADD CONSTRAINT `staff_profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
