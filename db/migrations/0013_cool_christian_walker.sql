ALTER TABLE `bot_topic_keyword_unsubscriptions` DROP FOREIGN KEY `bot_group_keyword_unsubscriptions_keyword_id_fk`;
--> statement-breakpoint
ALTER TABLE `bot_topic_keyword_unsubscriptions` DROP FOREIGN KEY `bot_group_keyword_unsubscriptions__channel_id_fk`;
--> statement-breakpoint
ALTER TABLE `bot_topic_subscriptions` DROP FOREIGN KEY `bot_group_subscriptions__group_id_fk`;
--> statement-breakpoint
ALTER TABLE `bot_topic_subscriptions` DROP FOREIGN KEY `bot_group_subscriptions__channel_id_fk`;
--> statement-breakpoint
ALTER TABLE `bot_topic_keyword_unsubscriptions` ADD CONSTRAINT `bot_topic_keyword_unsubscriptions_keyword_id_fk` FOREIGN KEY (`keyword_id`) REFERENCES `bot_keywords`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bot_topic_keyword_unsubscriptions` ADD CONSTRAINT `bot_topic_keyword_unsubscriptions__channel_id_fk` FOREIGN KEY (`channel_id`) REFERENCES `bot_channels`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bot_topic_subscriptions` ADD CONSTRAINT `bot_topic_subscriptions__topic_id_fk` FOREIGN KEY (`topic_id`) REFERENCES `bot_topics`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bot_topic_subscriptions` ADD CONSTRAINT `bot_topic_subscriptions__channel_id_fk` FOREIGN KEY (`channel_id`) REFERENCES `bot_channels`(`id`) ON DELETE no action ON UPDATE no action;