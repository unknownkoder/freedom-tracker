ALTER TABLE `goals` ADD `startDate` text NOT NULL;--> statement-breakpoint
ALTER TABLE `goals` ADD `endDate` text;--> statement-breakpoint
ALTER TABLE `goals` ADD `recurring` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `goals` ADD `occurance_type` text DEFAULT 'null';--> statement-breakpoint
ALTER TABLE `goals` DROP COLUMN `duration`;--> statement-breakpoint
ALTER TABLE `goals` DROP COLUMN `reset_on_month`;