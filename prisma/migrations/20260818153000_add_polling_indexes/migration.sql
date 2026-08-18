CREATE INDEX `notifications_recipient_read_at_idx`
  ON `notifications`(`recipient_id`, `read_at`);

CREATE INDEX `chat_messages_unread_idx`
  ON `chat_messages`(`conversation_id`, `read_at`, `sender_id`);
