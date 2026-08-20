ALTER TABLE `users`
  ADD COLUMN `relationship_intent` VARCHAR(20) NOT NULL DEFAULT 'SUGAR';

CREATE INDEX `users_relationship_intent_idx`
  ON `users` (`relationship_intent`);
