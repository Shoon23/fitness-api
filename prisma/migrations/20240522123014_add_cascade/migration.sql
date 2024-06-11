-- DropForeignKey
ALTER TABLE `Exercise` DROP FOREIGN KEY `Exercise_workout_day_id_fkey`;

-- DropForeignKey
ALTER TABLE `WorkoutDay` DROP FOREIGN KEY `WorkoutDay_workout_plan_id_fkey`;

-- AddForeignKey
ALTER TABLE `WorkoutDay` ADD CONSTRAINT `WorkoutDay_workout_plan_id_fkey` FOREIGN KEY (`workout_plan_id`) REFERENCES `WorkoutPlan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Exercise` ADD CONSTRAINT `Exercise_workout_day_id_fkey` FOREIGN KEY (`workout_day_id`) REFERENCES `WorkoutDay`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
