ALTER TABLE `users`
  ADD COLUMN `is_admin_featured` BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX `users_admin_featured_rank_idx`
  ON `users`(`role`, `approval_status`, `is_admin_featured`, `last_active_at`, `created_at`);
