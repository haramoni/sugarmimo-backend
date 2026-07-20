ALTER TABLE `users`
  ADD COLUMN `boosted_until` TIMESTAMP NULL;

CREATE INDEX `users_active_boost_idx`
  ON `users` (`role`, `approval_status`, `boosted_until`);
