CREATE TABLE `chat_conversations` (
    `id` CHAR(36) NOT NULL,
    `member_one_id` CHAR(36) NOT NULL,
    `member_two_id` CHAR(36) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `chat_conversations_members_unique`(`member_one_id`, `member_two_id`),
    INDEX `chat_conversations_member_two_id_idx`(`member_two_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `chat_messages` (
    `id` CHAR(36) NOT NULL,
    `conversation_id` CHAR(36) NOT NULL,
    `sender_id` CHAR(36) NOT NULL,
    `body` TEXT NOT NULL,
    `read_at` TIMESTAMP(0) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `chat_messages_conversation_created_at_idx`(`conversation_id`, `created_at`),
    INDEX `chat_messages_sender_id_idx`(`sender_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `chat_conversations`
    ADD CONSTRAINT `chat_conversations_member_one_id_fkey`
    FOREIGN KEY (`member_one_id`) REFERENCES `users`(`id`)
    ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE `chat_conversations`
    ADD CONSTRAINT `chat_conversations_member_two_id_fkey`
    FOREIGN KEY (`member_two_id`) REFERENCES `users`(`id`)
    ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE `chat_messages`
    ADD CONSTRAINT `chat_messages_conversation_id_fkey`
    FOREIGN KEY (`conversation_id`) REFERENCES `chat_conversations`(`id`)
    ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE `chat_messages`
    ADD CONSTRAINT `chat_messages_sender_id_fkey`
    FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`)
    ON DELETE CASCADE ON UPDATE NO ACTION;
