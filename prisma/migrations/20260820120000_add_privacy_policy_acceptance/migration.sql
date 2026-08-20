ALTER TABLE `users`
  ADD COLUMN `privacy_policy_version` VARCHAR(20) NULL,
  ADD COLUMN `privacy_policy_accepted_at` TIMESTAMP(0) NULL;
