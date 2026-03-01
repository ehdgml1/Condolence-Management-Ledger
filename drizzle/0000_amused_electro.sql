CREATE TABLE `event_members` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`wedding_id` text NOT NULL,
	`name` text NOT NULL,
	`display_name` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`wedding_id`) REFERENCES `weddings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `guests` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	`wedding_id` text NOT NULL,
	`name` text NOT NULL,
	`side` text NOT NULL,
	`group_name` text DEFAULT '기타' NOT NULL,
	`relationship` text,
	`phone` text,
	`gift_amount` integer DEFAULT 0 NOT NULL,
	`meal_tickets` integer DEFAULT 0 NOT NULL,
	`attended` integer DEFAULT false NOT NULL,
	`thanked` integer DEFAULT false NOT NULL,
	`memo` text,
	`payment_method` text DEFAULT 'cash' NOT NULL,
	`envelope_number` integer,
	`gift_received` integer DEFAULT false NOT NULL,
	`gift_returned` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`wedding_id`) REFERENCES `weddings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`user_id` text NOT NULL,
	`wedding_id` text NOT NULL,
	`name` text NOT NULL,
	`role` text DEFAULT 'groom' NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`wedding_id`) REFERENCES `weddings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `thank_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`wedding_id` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`is_default` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`wedding_id`) REFERENCES `weddings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `wedding_costs` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`wedding_id` text NOT NULL,
	`category` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`amount` real DEFAULT 0 NOT NULL,
	`paid_by` text NOT NULL,
	FOREIGN KEY (`wedding_id`) REFERENCES `weddings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `weddings` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	`bride_name` text,
	`groom_name` text NOT NULL,
	`wedding_date` text,
	`venue` text,
	`share_code` text NOT NULL,
	`owner_id` text NOT NULL,
	`event_type` text DEFAULT 'wedding' NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `weddings_share_code_unique` ON `weddings` (`share_code`);