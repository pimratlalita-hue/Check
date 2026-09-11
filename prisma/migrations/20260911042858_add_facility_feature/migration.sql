-- CreateTable
CREATE TABLE `facility_rooms` (
    `id` VARCHAR(36) NOT NULL,
    `tenant_id` VARCHAR(36) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `name_th` VARCHAR(255) NOT NULL,
    `name_en` VARCHAR(255) NOT NULL,
    `building` VARCHAR(100) NOT NULL,
    `floor` INTEGER NOT NULL DEFAULT 1,
    `capacity` INTEGER NOT NULL DEFAULT 10,
    `type` ENUM('EXAM_ROOM', 'MEETING_ROOM', 'LAB', 'AUDITORIUM', 'SMART_CLASSROOM') NOT NULL DEFAULT 'EXAM_ROOM',
    `facilities` JSON NULL,
    `image_url` VARCHAR(500) NULL,
    `description` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `display_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `facility_rooms_tenant_id_type_is_active_idx`(`tenant_id`, `type`, `is_active`),
    UNIQUE INDEX `facility_rooms_tenant_id_code_key`(`tenant_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `room_bookings` (
    `id` VARCHAR(36) NOT NULL,
    `tenant_id` VARCHAR(36) NOT NULL,
    `room_id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `purpose` TEXT NULL,
    `type` ENUM('EXAM_DEFENSE', 'ACADEMIC_MEETING', 'SEMINAR', 'TEACHING', 'GENERAL') NOT NULL DEFAULT 'EXAM_DEFENSE',
    `platform` ENUM('ON_SITE', 'ZOOM', 'MS_TEAMS', 'GOOGLE_MEET', 'HYBRID') NOT NULL DEFAULT 'ON_SITE',
    `meeting_url` VARCHAR(500) NULL,
    `start_time` DATETIME(3) NOT NULL,
    `end_time` DATETIME(3) NOT NULL,
    `status` ENUM('CONFIRMED', 'PENDING', 'CANCELLED', 'REJECTED') NOT NULL DEFAULT 'CONFIRMED',
    `booked_by_name` VARCHAR(255) NOT NULL,
    `booked_by_email` VARCHAR(255) NOT NULL,
    `booked_by_phone` VARCHAR(50) NULL,
    `attendee_count` INTEGER NULL,
    `petition_id` VARCHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `room_bookings_tenant_id_room_id_start_time_end_time_idx`(`tenant_id`, `room_id`, `start_time`, `end_time`),
    INDEX `room_bookings_tenant_id_status_idx`(`tenant_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `facility_rooms` ADD CONSTRAINT `facility_rooms_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `room_bookings` ADD CONSTRAINT `room_bookings_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `room_bookings` ADD CONSTRAINT `room_bookings_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `facility_rooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `room_bookings` ADD CONSTRAINT `room_bookings_petition_id_fkey` FOREIGN KEY (`petition_id`) REFERENCES `petitions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
