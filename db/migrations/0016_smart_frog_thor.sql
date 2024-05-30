ALTER TABLE `bot_topic_subscriptions` DROP FOREIGN KEY `bot_topic_subscriptions__topic_id_fk`;
--> statement-breakpoint
ALTER TABLE `bot_topic_subscriptions` ADD CONSTRAINT `bot_topic_subscriptions__topic_id_fk` FOREIGN KEY (`topic_id`) REFERENCES `bot_topic_names`(`id`) ON DELETE no action ON UPDATE no action;