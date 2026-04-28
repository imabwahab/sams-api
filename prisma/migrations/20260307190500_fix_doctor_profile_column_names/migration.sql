ALTER TABLE `doctor_profiles`
DROP FOREIGN KEY `doctor_profiles_userId_fkey`;

ALTER TABLE `doctor_profiles`
DROP INDEX `doctor_profiles_userId_key`;

ALTER TABLE `doctor_profiles`
CHANGE COLUMN `userId` `user_id` INT NOT NULL,
CHANGE COLUMN `consultationFee` `consultation_fee` INT NOT NULL,
CHANGE COLUMN `experienceYears` `experience_years` INT NOT NULL DEFAULT 0;

ALTER TABLE `doctor_profiles`
ADD UNIQUE KEY `doctor_profiles_user_id_key` (`user_id`);

ALTER TABLE `doctor_profiles`
ADD CONSTRAINT `doctor_profiles_user_id_fkey`
FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
ON DELETE RESTRICT
ON UPDATE CASCADE;
