CREATE INDEX `timestamp_user_id` ON `bot_actions` (`timestamp`,`user_id`);--> statement-breakpoint
CREATE INDEX `timestamp_user_id` ON `bot_inline_actions` (`timestamp`,`user_id`);