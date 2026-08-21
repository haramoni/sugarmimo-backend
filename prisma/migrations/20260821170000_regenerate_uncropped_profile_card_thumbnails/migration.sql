-- Card thumbnails are derived data. Clear the cropped legacy versions so they
-- are regenerated lazily from the preserved original photos.
UPDATE `user_photos`
SET `card_data_url` = NULL
WHERE `card_data_url` IS NOT NULL;
