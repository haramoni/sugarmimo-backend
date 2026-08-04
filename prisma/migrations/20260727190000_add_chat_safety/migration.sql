ALTER TABLE `users`
    ADD COLUMN `account_status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    ADD COLUMN `suspended_until` TIMESTAMP(0) NULL;

CREATE TABLE `user_blocks` (
    `id` CHAR(36) NOT NULL,
    `blocker_id` CHAR(36) NOT NULL,
    `blocked_id` CHAR(36) NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `user_blocks_pair_unique`(`blocker_id`, `blocked_id`),
    INDEX `user_blocks_blocked_id_idx`(`blocked_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `chat_reports` (
    `id` CHAR(36) NOT NULL,
    `conversation_id` CHAR(36) NOT NULL,
    `reporter_id` CHAR(36) NOT NULL,
    `reported_id` CHAR(36) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `details` VARCHAR(1000) NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    `resolution` VARCHAR(1000) NULL,
    `reviewed_by_id` CHAR(36) NULL,
    `reviewed_at` TIMESTAMP(0) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `chat_reports_status_created_at_idx`(`status`, `created_at`),
    INDEX `chat_reports_reported_created_at_idx`(`reported_id`, `created_at`),
    INDEX `chat_reports_conversation_id_idx`(`conversation_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `chat_report_messages` (
    `report_id` CHAR(36) NOT NULL,
    `message_id` CHAR(36) NOT NULL,

    INDEX `chat_report_messages_message_id_idx`(`message_id`),
    PRIMARY KEY (`report_id`, `message_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Some existing SugarMimo databases were created before the migration
-- baseline and use the database's default utf8mb4 collation. MySQL requires
-- both sides of a string foreign key to use the exact same collation, so align
-- each new reference column with the column it references.
SET @users_id_collation = (
    SELECT `COLLATION_NAME`
    FROM `information_schema`.`COLUMNS`
    WHERE `TABLE_SCHEMA` = DATABASE()
      AND `TABLE_NAME` = 'users'
      AND `COLUMN_NAME` = 'id'
);
SET @conversation_id_collation = (
    SELECT `COLLATION_NAME`
    FROM `information_schema`.`COLUMNS`
    WHERE `TABLE_SCHEMA` = DATABASE()
      AND `TABLE_NAME` = 'chat_conversations'
      AND `COLUMN_NAME` = 'id'
);
SET @message_id_collation = (
    SELECT `COLLATION_NAME`
    FROM `information_schema`.`COLUMNS`
    WHERE `TABLE_SCHEMA` = DATABASE()
      AND `TABLE_NAME` = 'chat_messages'
      AND `COLUMN_NAME` = 'id'
);

SET @align_user_blocks = CONCAT(
    'ALTER TABLE `user_blocks` ',
    'MODIFY `blocker_id` CHAR(36) CHARACTER SET utf8mb4 COLLATE ',
    @users_id_collation,
    ' NOT NULL, ',
    'MODIFY `blocked_id` CHAR(36) CHARACTER SET utf8mb4 COLLATE ',
    @users_id_collation,
    ' NOT NULL'
);
PREPARE align_user_blocks_statement FROM @align_user_blocks;
EXECUTE align_user_blocks_statement;
DEALLOCATE PREPARE align_user_blocks_statement;

SET @align_chat_reports = CONCAT(
    'ALTER TABLE `chat_reports` ',
    'MODIFY `conversation_id` CHAR(36) CHARACTER SET utf8mb4 COLLATE ',
    @conversation_id_collation,
    ' NOT NULL, ',
    'MODIFY `reporter_id` CHAR(36) CHARACTER SET utf8mb4 COLLATE ',
    @users_id_collation,
    ' NOT NULL, ',
    'MODIFY `reported_id` CHAR(36) CHARACTER SET utf8mb4 COLLATE ',
    @users_id_collation,
    ' NOT NULL, ',
    'MODIFY `reviewed_by_id` CHAR(36) CHARACTER SET utf8mb4 COLLATE ',
    @users_id_collation,
    ' NULL'
);
PREPARE align_chat_reports_statement FROM @align_chat_reports;
EXECUTE align_chat_reports_statement;
DEALLOCATE PREPARE align_chat_reports_statement;

SET @align_report_messages = CONCAT(
    'ALTER TABLE `chat_report_messages` ',
    'MODIFY `message_id` CHAR(36) CHARACTER SET utf8mb4 COLLATE ',
    @message_id_collation,
    ' NOT NULL'
);
PREPARE align_report_messages_statement FROM @align_report_messages;
EXECUTE align_report_messages_statement;
DEALLOCATE PREPARE align_report_messages_statement;

ALTER TABLE `user_blocks`
    ADD CONSTRAINT `user_blocks_blocker_id_fkey`
    FOREIGN KEY (`blocker_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
    ADD CONSTRAINT `user_blocks_blocked_id_fkey`
    FOREIGN KEY (`blocked_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE `chat_reports`
    ADD CONSTRAINT `chat_reports_conversation_id_fkey`
    FOREIGN KEY (`conversation_id`) REFERENCES `chat_conversations`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
    ADD CONSTRAINT `chat_reports_reporter_id_fkey`
    FOREIGN KEY (`reporter_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
    ADD CONSTRAINT `chat_reports_reported_id_fkey`
    FOREIGN KEY (`reported_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
    ADD CONSTRAINT `chat_reports_reviewed_by_id_fkey`
    FOREIGN KEY (`reviewed_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE `chat_report_messages`
    ADD CONSTRAINT `chat_report_messages_report_id_fkey`
    FOREIGN KEY (`report_id`) REFERENCES `chat_reports`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
    ADD CONSTRAINT `chat_report_messages_message_id_fkey`
    FOREIGN KEY (`message_id`) REFERENCES `chat_messages`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
