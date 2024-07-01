-- ALTER TABLE `bot_channels` RENAME COLUMN `id` TO `telegram_id`;--> statement-breakpoint
ALTER TABLE `bot_channels` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `bot_channels` ADD COLUMN `id` int AUTO_INCREMENT PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE `bot_subscriptions` RENAME COLUMN `channel_id` TO `old_channel_id`;--> statement-breakpoint
ALTER TABLE `bot_topic_keyword_unsubscriptions` RENAME COLUMN `channel_id` TO `old_channel_id`;--> statement-breakpoint
ALTER TABLE `bot_topic_subscriptions` RENAME COLUMN `channel_id` TO `old_channel_id`;--> statement-breakpoint
ALTER TABLE `bot_subscriptions` ADD COLUMN `channel_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `bot_topic_keyword_unsubscriptions` ADD COLUMN `channel_id` int NOT NULL;--> statement-breakpoint
ALTER TABLE `bot_topic_subscriptions` ADD COLUMN `channel_id` int NOT NULL;--> statement-breakpoint
UPDATE bot_subscriptions bs JOIN bot_channels bc ON bs.old_channel_id = bc.telegram_id SET bs.channel_id = bc.id;--> statement-breakpoint
UPDATE bot_topic_keyword_unsubscriptions btk JOIN bot_channels bc ON btk.old_channel_id = bc.telegram_id SET btk.channel_id = bc.id;--> statement-breakpoint
UPDATE bot_topic_subscriptions bts JOIN bot_channels bc ON bts.old_channel_id = bc.telegram_id SET bts.channel_id = bc.id;--> statement-breakpoint
ALTER TABLE `bot_channels` ADD CONSTRAINT `bot_channels__userId-telegram_id` UNIQUE(`telegram_id`,`user_id`);
