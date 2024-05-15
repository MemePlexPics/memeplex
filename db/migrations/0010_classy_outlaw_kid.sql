CREATE TABLE `bot_publisher_group_keyword_unsubscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`keyword` varchar(255) NOT NULL,
	`channel_id` bigint NOT NULL,
	CONSTRAINT `bot_publisher_group_keyword_unsubscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `keyword_id-channel_id` UNIQUE(`keyword`,`channel_id`)
);
--> statement-breakpoint
ALTER TABLE `bot_publisher_group_keyword_unsubscriptions` ADD CONSTRAINT `bot_publisher_group_keyword_unsubscriptions__channel_id_fk` FOREIGN KEY (`channel_id`) REFERENCES `bot_publisher_channels`(`id`) ON DELETE no action ON UPDATE no action;