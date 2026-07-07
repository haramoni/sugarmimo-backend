ALTER TABLE `users`
  MODIFY COLUMN `approval_status` VARCHAR(30) NOT NULL DEFAULT 'PENDING';

UPDATE `users`
SET `approval_status` = 'PENDING'
WHERE `role` = 'SUGAR_BABY'
  AND `approval_status` = 'APPROVED'
  AND `reviewed_at` IS NULL;
