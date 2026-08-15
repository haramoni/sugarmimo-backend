CREATE TABLE `referrals` (
  `id` CHAR(36) NOT NULL,
  `inviter_id` CHAR(36) NOT NULL,
  `referred_user_id` CHAR(36) NOT NULL,
  `inviter_username_at_signup` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

  UNIQUE INDEX `referrals_referred_user_unique`(`referred_user_id`),
  INDEX `referrals_inviter_created_at_idx`(`inviter_id`, `created_at`),
  PRIMARY KEY (`id`),
  CONSTRAINT `referrals_inviter_id_fkey`
    FOREIGN KEY (`inviter_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `referrals_referred_user_id_fkey`
    FOREIGN KEY (`referred_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
