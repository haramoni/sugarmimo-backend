ALTER TABLE `users`
  ADD COLUMN `approval_status` VARCHAR(30) NOT NULL DEFAULT 'APPROVED',
  ADD COLUMN `reviewed_at` TIMESTAMP(0) NULL;

CREATE TABLE `user_photos` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `data_url` LONGTEXT NOT NULL,
  `file_name` VARCHAR(255) NULL,
  `mime_type` VARCHAR(120) NULL,
  `sort_order` INTEGER NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

  INDEX `user_id`(`user_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `user_photos`
  ADD CONSTRAINT `user_photos_ibfk_1`
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
  ON DELETE CASCADE
  ON UPDATE NO ACTION;
