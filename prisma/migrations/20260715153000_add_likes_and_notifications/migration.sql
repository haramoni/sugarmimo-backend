CREATE TABLE `profile_likes` (
  `id` CHAR(36) NOT NULL,
  `daddy_id` CHAR(36) NOT NULL,
  `baby_id` CHAR(36) NOT NULL,
  `contacts_released_at` TIMESTAMP(0) NULL,
  `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `profile_likes_daddy_baby_unique` (`daddy_id`, `baby_id`),
  INDEX `profile_likes_baby_created_at_idx` (`baby_id`, `created_at`),
  CONSTRAINT `profile_likes_daddy_id_fkey` FOREIGN KEY (`daddy_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `profile_likes_baby_id_fkey` FOREIGN KEY (`baby_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE TABLE `notifications` (
  `id` CHAR(36) NOT NULL,
  `recipient_id` CHAR(36) NOT NULL,
  `actor_id` CHAR(36) NOT NULL,
  `profile_like_id` CHAR(36) NULL,
  `type` VARCHAR(50) NOT NULL,
  `read_at` TIMESTAMP(0) NULL,
  `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `notifications_recipient_created_at_idx` (`recipient_id`, `created_at`),
  INDEX `notifications_profile_like_id_idx` (`profile_like_id`),
  CONSTRAINT `notifications_recipient_id_fkey` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `notifications_actor_id_fkey` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `notifications_profile_like_id_fkey` FOREIGN KEY (`profile_like_id`) REFERENCES `profile_likes` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
);
