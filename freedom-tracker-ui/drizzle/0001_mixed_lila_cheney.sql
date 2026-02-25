ALTER TABLE `goals` ADD `startDate` text NOT NULL;--> statement-breakpoint
ALTER TABLE `goals` ADD `endDate` text;--> statement-breakpoint
ALTER TABLE `goals` DROP COLUMN `duration`;