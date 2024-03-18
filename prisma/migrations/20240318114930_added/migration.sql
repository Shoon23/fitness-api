/*
  Warnings:

  - Added the required column `details` to the `Exercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reps` to the `Exercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `set` to the `Exercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `update_at` to the `WorkoutPlan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Exercise` ADD COLUMN `details` VARCHAR(191) NOT NULL,
    ADD COLUMN `reps` INTEGER NOT NULL,
    ADD COLUMN `set` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `WorkoutPlan` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `update_at` DATETIME(3) NOT NULL;
