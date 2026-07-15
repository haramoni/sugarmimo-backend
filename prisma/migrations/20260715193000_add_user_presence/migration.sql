ALTER TABLE `users`
  ADD COLUMN `last_active_at` TIMESTAMP(0) NULL;

CREATE INDEX `users_role_approval_last_active_idx`
  ON `users` (`role`, `approval_status`, `last_active_at`);
