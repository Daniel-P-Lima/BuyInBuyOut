/*
  Warnings:

  - You are about to drop the `Logs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Logs` DROP FOREIGN KEY `Logs_purchaseRequestId_fkey`;

-- DropTable
DROP TABLE `Logs`;

-- CreateTable
CREATE TABLE `ApprovalHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `purchaseRequestId` INTEGER NOT NULL,
    `change` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ApprovalHistory` ADD CONSTRAINT `ApprovalHistory_purchaseRequestId_fkey` FOREIGN KEY (`purchaseRequestId`) REFERENCES `PurchaseRequest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
