CREATE INDEX `users_pending_review_idx`
ON `users`(`role`, `approval_status`, `created_at`, `id`);
