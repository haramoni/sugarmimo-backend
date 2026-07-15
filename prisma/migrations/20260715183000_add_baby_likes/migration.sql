ALTER TABLE `profile_likes`
  ADD COLUMN `daddy_liked_at` TIMESTAMP(0) NULL,
  ADD COLUMN `baby_liked_at` TIMESTAMP(0) NULL;

UPDATE `profile_likes`
SET `daddy_liked_at` = `created_at`
WHERE `daddy_liked_at` IS NULL;
