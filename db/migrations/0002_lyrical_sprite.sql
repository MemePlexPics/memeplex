ALTER TABLE `proxies` MODIFY COLUMN `speed` int;--> statement-breakpoint
ALTER TABLE `proxies` ADD COLUMN IF NOT EXISTS `anonymity` varchar(12);--> statement-breakpoint
ALTER TABLE `proxies` ADD COLUMN IF NOT EXISTS `last_activity_datetime` datetime NOT NULL;--> statement-breakpoint
ALTER TABLE `proxies` ADD COLUMN IF NOT EXISTS `last_check_datetime` datetime NOT NULL;
