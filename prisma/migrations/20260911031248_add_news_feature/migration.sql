-- CreateTable
CREATE TABLE `news_articles` (
    `id` VARCHAR(36) NOT NULL,
    `tenant_id` VARCHAR(36) NOT NULL,
    `title_th` VARCHAR(255) NOT NULL,
    `title_en` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `summary_th` VARCHAR(500) NULL,
    `summary_en` VARCHAR(500) NULL,
    `content_th` TEXT NOT NULL,
    `content_en` TEXT NOT NULL,
    `cover_image_url` VARCHAR(500) NULL,
    `category` ENUM('ACADEMIC', 'EVENT', 'GENERAL', 'PROCUREMENT') NOT NULL DEFAULT 'GENERAL',
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `is_pinned` BOOLEAN NOT NULL DEFAULT false,
    `view_count` INTEGER NOT NULL DEFAULT 0,
    `author_id` VARCHAR(36) NULL,
    `published_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `news_articles_tenant_id_status_category_idx`(`tenant_id`, `status`, `category`),
    INDEX `news_articles_tenant_id_is_pinned_idx`(`tenant_id`, `is_pinned`),
    UNIQUE INDEX `news_articles_tenant_id_slug_key`(`tenant_id`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `news_attachments` (
    `id` VARCHAR(36) NOT NULL,
    `news_id` VARCHAR(36) NOT NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `file_url` VARCHAR(500) NOT NULL,
    `file_size` INTEGER NOT NULL DEFAULT 0,
    `file_type` VARCHAR(50) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `news_attachments_news_id_idx`(`news_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `news_articles` ADD CONSTRAINT `news_articles_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `news_articles` ADD CONSTRAINT `news_articles_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `news_attachments` ADD CONSTRAINT `news_attachments_news_id_fkey` FOREIGN KEY (`news_id`) REFERENCES `news_articles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
