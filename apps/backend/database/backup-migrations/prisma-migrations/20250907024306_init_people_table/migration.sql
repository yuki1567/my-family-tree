-- CreateTable
CREATE TABLE `people` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NULL,
    `gender` TINYINT NOT NULL DEFAULT 0,
    `birth_date` DATE NULL,
    `death_date` DATE NULL,
    `birth_place` VARCHAR(200) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
