CREATE TABLE `bot_user_languages` (
	`user_id` bigint NOT NULL,
	`language` varchar(2) NOT NULL,
	CONSTRAINT `bot_user_languages_user_id` PRIMARY KEY(`user_id`)
);
