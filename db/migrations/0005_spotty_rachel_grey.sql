ALTER TABLE `bot_actions` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `bot_inline_actions` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `bot_inline_users` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `bot_users` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `channel_suggestions` ADD PRIMARY KEY(`name`);--> statement-breakpoint
ALTER TABLE `channels` ADD PRIMARY KEY(`name`);--> statement-breakpoint
ALTER TABLE `featured_channels` ADD PRIMARY KEY(`username`);--> statement-breakpoint
ALTER TABLE `phashes` ADD PRIMARY KEY(`phash`);--> statement-breakpoint
ALTER TABLE `proxies` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `channels` ADD `with_text` tinyint NOT NULL;