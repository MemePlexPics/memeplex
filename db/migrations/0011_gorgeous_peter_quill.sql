CREATE TABLE `bot_publisher_keyword_group_names` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	CONSTRAINT `bot_publisher_keyword_group_names_id` PRIMARY KEY(`id`),
	CONSTRAINT `bot_publisher_keyword_group_names_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
DELETE FROM `bot_publisher_group_subscriptions`;--> statement-breakpoint
DELETE FROM `bot_publisher_subscriptions`;--> statement-breakpoint
DELETE FROM `bot_publisher_keyword_groups`;--> statement-breakpoint
DELETE FROM `bot_publisher_keywords`;--> statement-breakpoint
DELETE FROM `bot_publisher_group_keyword_unsubscriptions`;--> statement-breakpoint
ALTER TABLE `bot_publisher_group_subscriptions` DROP FOREIGN KEY `bot_publisher_group_subscriptions__group_name_fk`;
--> statement-breakpoint
ALTER TABLE `bot_publisher_subscriptions` DROP FOREIGN KEY `bot_publisher_subscriptions_keyword_fk`;
--> statement-breakpoint
ALTER TABLE `bot_publisher_keyword_groups` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `bot_publisher_keywords` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `bot_actions` MODIFY COLUMN `query` varchar(255);--> statement-breakpoint
ALTER TABLE `bot_inline_actions` MODIFY COLUMN `query` varchar(255);--> statement-breakpoint
ALTER TABLE `bot_inline_actions` MODIFY COLUMN `selected_id` varchar(32);--> statement-breakpoint
ALTER TABLE `bot_inline_actions` MODIFY COLUMN `chat_type` varchar(128);--> statement-breakpoint
ALTER TABLE `featured_channels` MODIFY COLUMN `comment` varchar(255);--> statement-breakpoint
ALTER TABLE `ocr_keys` MODIFY COLUMN `timeout` datetime;--> statement-breakpoint
ALTER TABLE `proxies` MODIFY COLUMN `ocr_key` varchar(255);--> statement-breakpoint
ALTER TABLE `bot_publisher_keyword_groups` ADD `id` int(11) AUTO_INCREMENT PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `bot_publisher_keywords` ADD `id` int(11) AUTO_INCREMENT PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `bot_publisher_group_keyword_unsubscriptions` ADD `keyword_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `bot_publisher_group_keyword_unsubscriptions` ADD CONSTRAINT `unsubscription__keyword_id-channel_id` UNIQUE(`keyword_id`,`channel_id`);--> statement-breakpoint
ALTER TABLE `bot_publisher_group_subscriptions` ADD `group_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `bot_publisher_group_subscriptions` ADD CONSTRAINT `group_id-channel_id` UNIQUE(`group_id`,`channel_id`);--> statement-breakpoint
ALTER TABLE `bot_publisher_keyword_groups` ADD `group_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `bot_publisher_keyword_groups` ADD `keyword_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `bot_publisher_keyword_groups` ADD CONSTRAINT `group_id-keyword_id` UNIQUE(`group_id`,`keyword_id`);--> statement-breakpoint
ALTER TABLE `bot_publisher_keywords` ADD CONSTRAINT `bot_publisher_keywords_keyword_unique` UNIQUE(`keyword`);--> statement-breakpoint
ALTER TABLE `bot_publisher_subscriptions` ADD `keyword_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `bot_publisher_subscriptions` ADD CONSTRAINT `subscription_keyword_id-channel_id` UNIQUE(`keyword_id`,`channel_id`);--> statement-breakpoint
ALTER TABLE `bot_publisher_group_keyword_unsubscriptions` DROP INDEX `keyword_id-channel_id`;--> statement-breakpoint
ALTER TABLE `bot_publisher_group_subscriptions` DROP INDEX `group_name-channel_id`;--> statement-breakpoint
ALTER TABLE `bot_publisher_subscriptions` DROP INDEX `keyword_id-channel_id`;--> statement-breakpoint
ALTER TABLE `bot_publisher_group_keyword_unsubscriptions` ADD CONSTRAINT `bot_publisher_group_keyword_unsubscriptions_keyword_id_fk` FOREIGN KEY (`keyword_id`) REFERENCES `bot_publisher_keywords`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
DELETE FROM `bot_publisher_group_subscriptions` WHERE `group_id` NOT IN (SELECT `id` FROM `bot_publisher_keyword_groups`);--> statement-breakpoint
ALTER TABLE `bot_publisher_group_subscriptions` ADD CONSTRAINT `bot_publisher_group_subscriptions__group_id_fk` FOREIGN KEY (`group_id`) REFERENCES `bot_publisher_keyword_groups`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
DELETE FROM `bot_publisher_keyword_groups` WHERE `group_id` NOT IN (SELECT `id` FROM `bot_publisher_keyword_group_names`);--> statement-breakpoint
ALTER TABLE `bot_publisher_keyword_groups` ADD CONSTRAINT `bot_publisher_keyword_groups_group_id_fk` FOREIGN KEY (`group_id`) REFERENCES `bot_publisher_keyword_group_names`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bot_publisher_keyword_groups` ADD CONSTRAINT `bot_publisher_keyword_groups_keyword_id_fk` FOREIGN KEY (`keyword_id`) REFERENCES `bot_publisher_keywords`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
DELETE FROM `bot_publisher_subscriptions` WHERE `keyword_id` NOT IN (SELECT `id` FROM `bot_publisher_keywords`);--> statement-breakpoint
ALTER TABLE `bot_publisher_subscriptions` ADD CONSTRAINT `bot_publisher_subscriptions_keyword_id_fk` FOREIGN KEY (`keyword_id`) REFERENCES `bot_publisher_keywords`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bot_publisher_group_keyword_unsubscriptions` DROP COLUMN `keyword`;--> statement-breakpoint
ALTER TABLE `bot_publisher_group_subscriptions` DROP COLUMN `group_name`;--> statement-breakpoint
ALTER TABLE `bot_publisher_keyword_groups` DROP COLUMN `name`;--> statement-breakpoint
ALTER TABLE `bot_publisher_keyword_groups` DROP COLUMN `keywords`;--> statement-breakpoint
ALTER TABLE `bot_publisher_subscriptions` DROP COLUMN `keyword`;