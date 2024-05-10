UPDATE `bot_publisher_channels` SET `type` = 'private' WHERE `type` IS NULL;--> statement-breakpoint
ALTER TABLE `bot_publisher_channels` MODIFY COLUMN `type` varchar(32) NOT NULL;--> statement-breakpoint
ALTER TABLE `bot_publisher_keyword_groups` MODIFY COLUMN `keywords` text NOT NULL;