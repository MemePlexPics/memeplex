CREATE TABLE IF NOT EXISTS ocr_keys (
	ocr_key varchar(255) PRIMARY KEY,
	timeout datetime
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS proxies (
	id int(11) AUTO_INCREMENT PRIMARY KEY,
	address varchar(255) NOT NULL,
	protocol varchar(10) NOT NULL,
	availability BOOLEAN NOT NULL,
	ocr_key varchar(255),
	speed int(11) NOT NULL,

	FOREIGN KEY (ocr_key) REFERENCES ocr_keys(ocr_key),
	CONSTRAINT unique_address_protocol UNIQUE(address, protocol)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS channels (
	name varchar(255) PRIMARY KEY,
	availability BOOLEAN NOT NULL,
	langs varchar(255) NOT NULL,
	timestamp int(11) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS phashes (
	phash varchar(255) PRIMARY KEY
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS channel_suggestions (
	name varchar(255) PRIMARY KEY,
	processed BOOLEAN
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS featured_channels (
	username varchar(255) PRIMARY KEY,
	title varchar(255) NOT NULL,
	timestamp int(11) NOT NULL,
	comment varchar(255)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS bot_users (
	id int(12) PRIMARY KEY,
	user varchar(255) NOT NULL,
	timestamp int(11) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS bot_inline_users (
	id int(12) PRIMARY KEY,
	user varchar(255) NOT NULL,
	timestamp int(11) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS bot_actions (
	id int(11) AUTO_INCREMENT PRIMARY KEY,
	user_id int(12) NOT NULL,
	action varchar(32) NOT NULL,
	query varchar(255),
	page varchar(128) NOT NULL,
	timestamp int(11) NOT NULL,

	FOREIGN KEY (user_id) REFERENCES bot_users(id)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS bot_inline_actions (
	id int(11) AUTO_INCREMENT PRIMARY KEY,
	user_id int(12) NOT NULL,
	action varchar(32) NOT NULL,
	query varchar(255) NOT NULL,
	selected_id varchar(32) NULL,
	page varchar(128),
	chat_type varchar(128) NULL,
	timestamp int(11) NOT NULL,

	FOREIGN KEY (user_id) REFERENCES bot_inline_users(id)
);
