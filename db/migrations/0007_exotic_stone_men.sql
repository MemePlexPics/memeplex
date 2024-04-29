CREATE TABLE `bot_publisher_group_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`group_name` varchar(255) NOT NULL,
	`channel_id` bigint NOT NULL,
	CONSTRAINT `bot_publisher_group_subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `group_name-channel_id` UNIQUE(`group_name`,`channel_id`)
);
--> statement-breakpoint
CREATE TABLE `bot_publisher_user_premiums` (
	`user_id` bigint NOT NULL,
	`until_timestamp` int NOT NULL,
	CONSTRAINT `bot_publisher_user_premiums_user_id` PRIMARY KEY(`user_id`)
);
--> statement-breakpoint
ALTER TABLE `channel_suggestions` MODIFY COLUMN `processed` tinyint;--> statement-breakpoint
ALTER TABLE `channel_suggestions` MODIFY COLUMN `processed` tinyint DEFAULT 0;--> statement-breakpoint
ALTER TABLE `proxies` MODIFY COLUMN `availability` tinyint NOT NULL;--> statement-breakpoint
ALTER TABLE `bot_publisher_group_subscriptions` ADD CONSTRAINT `bot_publisher_group_subscriptions__group_name_fk` FOREIGN KEY (`group_name`) REFERENCES `bot_publisher_keyword_groups`(`name`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bot_publisher_group_subscriptions` ADD CONSTRAINT `bot_publisher_group_subscriptions__channel_id_fk` FOREIGN KEY (`channel_id`) REFERENCES `bot_publisher_channels`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bot_publisher_user_premiums` ADD CONSTRAINT `bot_publisher_user_premiums__user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `bot_publisher_users`(`id`) ON DELETE no action ON UPDATE no action;