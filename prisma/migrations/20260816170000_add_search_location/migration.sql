ALTER TABLE `users`
  ADD COLUMN `search_latitude` DOUBLE NULL,
  ADD COLUMN `search_longitude` DOUBLE NULL,
  ADD COLUMN `search_location_updated_at` TIMESTAMP(0) NULL;
