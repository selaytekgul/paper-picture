CREATE TABLE `feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`user_key` text NOT NULL,
	`collection_id` text NOT NULL,
	`session_id` text,
	`paper_id` text,
	`category` text NOT NULL,
	`message` text NOT NULL,
	`rating` integer,
	`created_at` integer NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	FOREIGN KEY (`user_key`) REFERENCES `profiles`(`user_key`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `feedback_user_created_idx` ON `feedback` (`user_key`,`created_at`);--> statement-breakpoint
CREATE INDEX `feedback_status_created_idx` ON `feedback` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`id` text PRIMARY KEY NOT NULL,
	`user_key` text NOT NULL,
	`action` text NOT NULL,
	`window_start` integer NOT NULL,
	`request_count` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`user_key`) REFERENCES `profiles`(`user_key`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `rate_limits_user_window_idx` ON `rate_limits` (`user_key`,`window_start`);--> statement-breakpoint
ALTER TABLE `game_sessions` ADD `collection_version` text DEFAULT 'legacy' NOT NULL;--> statement-breakpoint
ALTER TABLE `game_sessions` ADD `paper_order` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `game_sessions` ADD `assisted_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `round_attempts` ADD `assisted` integer DEFAULT false NOT NULL;