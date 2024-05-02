CREATE TABLE `bot_publisher_invoices` (
	`id` int NOT NULL,
	`hash` varchar(255) NOT NULL,
	`user_id` bigint NOT NULL,
	`status` varchar(16) NOT NULL,
	`created_at` varchar(255) NOT NULL,
	CONSTRAINT `bot_publisher_invoices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `bot_publisher_invoices` ADD CONSTRAINT `bot_publisher_invoices_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `bot_publisher_users`(`id`) ON DELETE no action ON UPDATE no action;