ALTER TABLE `channels` ADD `status` varchar(255);--> statement-breakpoint
UPDATE `channels` SET `status` = 'NOT_AVAILABLE' WHERE `availability` = 0;--> statement-breakpoint
ALTER TABLE `channels` DROP COLUMN `availability`;