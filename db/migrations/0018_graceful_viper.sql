CREATE TABLE `bot_meme_suggestions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` bigint NOT NULL,
	`file_id` varchar(255) NOT NULL,
	`text` text,
	CONSTRAINT `bot_meme_suggestions_id` PRIMARY KEY(`id`),
	CONSTRAINT `bot_meme_suggestions_file_id_unique` UNIQUE(`file_id`)
);
--> statement-breakpoint
ALTER TABLE `bot_meme_suggestions` ADD CONSTRAINT `bot_meme_suggestions_user_id_bot_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `bot_users`(`id`) ON DELETE no action ON UPDATE no action;