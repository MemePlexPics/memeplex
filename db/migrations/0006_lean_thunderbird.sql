CREATE TABLE `bot_publisher_keyword_groups` (
	`name` varchar(255) NOT NULL,
	`keywords` text,
	CONSTRAINT `bot_publisher_keyword_groups_name` PRIMARY KEY(`name`)
);
--> statement-breakpoint
ALTER TABLE `bot_inline_users` MODIFY COLUMN `id` bigint NOT NULL;--> statement-breakpoint
ALTER TABLE `bot_publisher_channels` MODIFY COLUMN `user_id` bigint NOT NULL;--> statement-breakpoint
ALTER TABLE `bot_publisher_users` MODIFY COLUMN `id` bigint NOT NULL;--> statement-breakpoint
ALTER TABLE `bot_users` MODIFY COLUMN `id` bigint NOT NULL;