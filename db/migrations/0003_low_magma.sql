CREATE TABLE `bot_publisher_channels` (
	`id` bigint NOT NULL,
	`user_id` int NOT NULL,
	`username` varchar(255) NOT NULL,
	`subscribers` int NOT NULL,
	`timestamp` int NOT NULL,
	CONSTRAINT `bot_publisher_channels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bot_publisher_keywords` (
	`keyword` varchar(255) NOT NULL,
	CONSTRAINT `bot_publisher_keywords_keyword` PRIMARY KEY(`keyword`)
);
--> statement-breakpoint
CREATE TABLE `bot_publisher_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`keyword` varchar(255) NOT NULL,
	`channel_id` bigint NOT NULL,
	CONSTRAINT `bot_publisher_subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `keyword_id-channel_id` UNIQUE(`keyword`,`channel_id`)
);
--> statement-breakpoint
CREATE TABLE `bot_publisher_users` (
	`id` int NOT NULL,
	`user` varchar(255) NOT NULL,
	`keywords_count` int,
	`timestamp` int NOT NULL,
	CONSTRAINT `bot_publisher_users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `bot_publisher_channels` ADD CONSTRAINT `bot_publisher_channels_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `bot_publisher_users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bot_publisher_subscriptions` ADD CONSTRAINT `bot_publisher_subscriptions_keyword_fk` FOREIGN KEY (`keyword`) REFERENCES `bot_publisher_keywords`(`keyword`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bot_publisher_subscriptions` ADD CONSTRAINT `bot_publisher_subscriptions__channel_id_fk` FOREIGN KEY (`channel_id`) REFERENCES `bot_publisher_channels`(`id`) ON DELETE no action ON UPDATE no action;