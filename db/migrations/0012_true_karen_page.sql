CREATE TABLE `bot_channels` (
	`id` bigint NOT NULL,
	`user_id` bigint NOT NULL,
	`username` varchar(255) NOT NULL,
	`subscribers` int NOT NULL,
	`type` varchar(32) NOT NULL,
	`timestamp` int NOT NULL,
	CONSTRAINT `bot_channels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bot_invoices` (
	`id` int NOT NULL,
	`hash` varchar(255) NOT NULL,
	`user_id` bigint NOT NULL,
	`status` varchar(16) NOT NULL,
	`created_at` varchar(255) NOT NULL,
	CONSTRAINT `bot_invoices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bot_keywords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`keyword` varchar(255) NOT NULL,
	CONSTRAINT `bot_keywords_id` PRIMARY KEY(`id`),
	CONSTRAINT `bot_keywords_keyword_unique` UNIQUE(`keyword`)
);
--> statement-breakpoint
CREATE TABLE `bot_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`keyword_id` int NOT NULL,
	`channel_id` bigint NOT NULL,
	CONSTRAINT `bot_subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscription_keyword_id-channel_id` UNIQUE(`keyword_id`,`channel_id`)
);
--> statement-breakpoint
CREATE TABLE `bot_topic_keyword_unsubscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`keyword_id` int NOT NULL,
	`channel_id` bigint NOT NULL,
	CONSTRAINT `bot_topic_keyword_unsubscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `unsubscription__keyword_id-channel_id` UNIQUE(`keyword_id`,`channel_id`)
);
--> statement-breakpoint
CREATE TABLE `bot_topic_names` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	CONSTRAINT `bot_topic_names_id` PRIMARY KEY(`id`),
	CONSTRAINT `bot_topic_names_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `bot_topic_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`topic_id` int NOT NULL,
	`channel_id` bigint NOT NULL,
	CONSTRAINT `bot_topic_subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `topic_id-channel_id` UNIQUE(`topic_id`,`channel_id`)
);
--> statement-breakpoint
CREATE TABLE `bot_topics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name_id` int NOT NULL,
	`keyword_id` int NOT NULL,
	CONSTRAINT `bot_topics_id` PRIMARY KEY(`id`),
	CONSTRAINT `name_id-keyword_id` UNIQUE(`name_id`,`keyword_id`)
);
--> statement-breakpoint
CREATE TABLE `bot_user_premiums` (
	`user_id` bigint NOT NULL,
	`until_timestamp` int NOT NULL,
	CONSTRAINT `bot_user_premiums_user_id` PRIMARY KEY(`user_id`)
);
--> statement-breakpoint
DROP TABLE `bot_publisher_group_keyword_unsubscriptions`;--> statement-breakpoint
DROP TABLE `bot_publisher_group_subscriptions`;--> statement-breakpoint
DROP TABLE `bot_publisher_subscriptions`;--> statement-breakpoint
DROP TABLE `bot_publisher_invoices`;--> statement-breakpoint
DROP TABLE `bot_publisher_channels`;--> statement-breakpoint
DROP TABLE `bot_publisher_keyword_groups`;--> statement-breakpoint
DROP TABLE `bot_publisher_keyword_group_names`;--> statement-breakpoint
DROP TABLE `bot_publisher_keywords`;--> statement-breakpoint
DROP TABLE `bot_publisher_user_premiums`;--> statement-breakpoint
DROP TABLE `bot_publisher_users`;--> statement-breakpoint
ALTER TABLE `bot_channels` ADD CONSTRAINT `bot_channels_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `bot_users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bot_invoices` ADD CONSTRAINT `bot_invoices_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `bot_users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bot_subscriptions` ADD CONSTRAINT `bot_subscriptions_keyword_id_fk` FOREIGN KEY (`keyword_id`) REFERENCES `bot_keywords`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bot_subscriptions` ADD CONSTRAINT `bot_subscriptions__channel_id_fk` FOREIGN KEY (`channel_id`) REFERENCES `bot_channels`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bot_topic_keyword_unsubscriptions` ADD CONSTRAINT `bot_group_keyword_unsubscriptions_keyword_id_fk` FOREIGN KEY (`keyword_id`) REFERENCES `bot_keywords`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bot_topic_keyword_unsubscriptions` ADD CONSTRAINT `bot_group_keyword_unsubscriptions__channel_id_fk` FOREIGN KEY (`channel_id`) REFERENCES `bot_channels`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bot_topic_subscriptions` ADD CONSTRAINT `bot_group_subscriptions__group_id_fk` FOREIGN KEY (`topic_id`) REFERENCES `bot_topics`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bot_topic_subscriptions` ADD CONSTRAINT `bot_group_subscriptions__channel_id_fk` FOREIGN KEY (`channel_id`) REFERENCES `bot_channels`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bot_topics` ADD CONSTRAINT `bot_topics_name_id_fk` FOREIGN KEY (`name_id`) REFERENCES `bot_topic_names`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bot_topics` ADD CONSTRAINT `bot_topics_keyword_id_fk` FOREIGN KEY (`keyword_id`) REFERENCES `bot_keywords`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bot_user_premiums` ADD CONSTRAINT `bot_user_premiums__user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `bot_users`(`id`) ON DELETE no action ON UPDATE no action;