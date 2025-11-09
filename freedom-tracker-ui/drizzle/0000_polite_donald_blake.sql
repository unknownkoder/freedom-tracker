CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`institution` text DEFAULT '',
	`last_four` text DEFAULT '',
	`name` text DEFAULT '',
	`is_primary` integer DEFAULT false,
	`status` text DEFAULT '',
	`subtype` text DEFAULT '',
	`type` text DEFAULT '',
	`currency` text DEFAULT 'USD',
	`balance` numeric DEFAULT '0.0',
	`connection_id` integer,
	FOREIGN KEY (`connection_id`) REFERENCES `connections`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `connections` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`access_token` text DEFAULT '',
	`enrollment_id` text DEFAULT '',
	`teller_user_id` text DEFAULT '',
	`user_id` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `goals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`amount` numeric DEFAULT '0.0',
	`duration` integer DEFAULT 30,
	`type` text NOT NULL,
	`reset_on_month` integer DEFAULT true,
	`user_id` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`teller_transactions_id` text,
	`amount` numeric,
	`date` text NOT NULL,
	`category` text,
	`counterparty_name` text,
	`counterparty_type` text,
	`type` text,
	`tracked` integer DEFAULT true,
	`account_id` text,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nickname` text NOT NULL
);
