CREATE TABLE `activity_logs` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NULL,
  `action` VARCHAR(80) NOT NULL,
  `method` VARCHAR(10) NOT NULL,
  `path` VARCHAR(255) NOT NULL,
  `status_code` INTEGER NULL,
  `ip` VARCHAR(80) NULL,
  `user_agent` VARCHAR(255) NULL,
  `metadata` JSON NULL,
  `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

CREATE INDEX `activity_logs_created_at_idx` ON `activity_logs`(`created_at`);
CREATE INDEX `activity_logs_user_created_at_idx` ON `activity_logs`(`user_id`, `created_at`);

ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
  ON DELETE SET NULL
  ON UPDATE NO ACTION;
