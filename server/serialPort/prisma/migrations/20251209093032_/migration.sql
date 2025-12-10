-- CreateTable
CREATE TABLE `bills` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bill_number` VARCHAR(191) NOT NULL,
    `bill_name` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `bills_bill_number_key`(`bill_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bill_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bill_number` VARCHAR(191) NOT NULL,
    `product_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `restors` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `restore_number` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `restors_restore_number_key`(`restore_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `restoreItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `restore_number` VARCHAR(191) NOT NULL,
    `product_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_info` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tag_number` VARCHAR(191) NULL,
    `before_weight` DOUBLE NULL,
    `after_weight` DOUBLE NULL,
    `difference` DOUBLE NULL,
    `adjustment` DOUBLE NULL,
    `final_weight` DOUBLE NULL,
    `barcode_weight` VARCHAR(191) NULL,
    `productName` VARCHAR(191) NULL,
    `workerName` VARCHAR(191) NULL,
    `grossWeight` VARCHAR(191) NULL,
    `stoneWeight` VARCHAR(191) NULL,
    `netWeight` VARCHAR(191) NULL,
    `goldSmithCode` VARCHAR(191) NULL,
    `itemCode` VARCHAR(191) NULL,
    `product_number` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `product_type` ENUM('hold', 'active', 'sold') NOT NULL DEFAULT 'active',
    `itemType` ENUM('STONE', 'PLAIN') NOT NULL,
    `lot_id` INTEGER NOT NULL,

    UNIQUE INDEX `product_info_product_number_key`(`product_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `before_weight_img` VARCHAR(191) NULL,
    `after_weight_img` VARCHAR(191) NULL,
    `final_weight_img` VARCHAR(191) NULL,
    `gross_weight_img` VARCHAR(191) NULL,
    `product_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lot_info` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lot_name` VARCHAR(191) NOT NULL,
    `bulk_weight_before` DOUBLE NULL,
    `bulk_after_weight` DOUBLE NULL,
    `isAvailable` BOOLEAN NOT NULL DEFAULT true,
    `adjustment_percent` INTEGER NULL,
    `type` ENUM('STONE', 'PLAIN') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lot_process` ENUM('completed', 'not_completed') NOT NULL DEFAULT 'not_completed',

    UNIQUE INDEX `lot_info_lot_name_key`(`lot_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MasterGoldSmith` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `goldSmithCode` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MasterItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `itemName` VARCHAR(191) NULL,
    `itemCode` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userName` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `role` VARCHAR(191) NULL,
    `hashPassword` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_userName_key`(`userName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Access` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `userCreateAccess` BOOLEAN NOT NULL DEFAULT false,
    `goldSmithAccess` BOOLEAN NOT NULL DEFAULT false,
    `itemAccess` BOOLEAN NOT NULL DEFAULT false,
    `productAccess` BOOLEAN NOT NULL DEFAULT false,
    `billingAccess` BOOLEAN NOT NULL DEFAULT false,
    `restoreAccess` BOOLEAN NOT NULL DEFAULT false,
    `deleteLotAccess` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `bill_items` ADD CONSTRAINT `bill_items_bill_number_fkey` FOREIGN KEY (`bill_number`) REFERENCES `bills`(`bill_number`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bill_items` ADD CONSTRAINT `bill_items_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `product_info`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `restoreItems` ADD CONSTRAINT `restoreItems_restore_number_fkey` FOREIGN KEY (`restore_number`) REFERENCES `restors`(`restore_number`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `restoreItems` ADD CONSTRAINT `restoreItems_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `product_info`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_info` ADD CONSTRAINT `product_info_lot_id_fkey` FOREIGN KEY (`lot_id`) REFERENCES `lot_info`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_images` ADD CONSTRAINT `product_images_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `product_info`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Access` ADD CONSTRAINT `Access_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
