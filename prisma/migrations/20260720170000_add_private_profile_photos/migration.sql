ALTER TABLE `user_photos`
  ADD COLUMN `is_private` BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX `user_photos_user_private_order_idx`
  ON `user_photos` (`user_id`, `is_private`, `sort_order`);
