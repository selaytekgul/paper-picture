CREATE TABLE `game_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_key` text NOT NULL,
	`collection_id` text NOT NULL,
	`score_class` text DEFAULT 'casual' NOT NULL,
	`started_at` integer NOT NULL,
	`completed_at` integer,
	`status` text DEFAULT 'started' NOT NULL,
	`score` integer DEFAULT 0 NOT NULL,
	`maximum_score` integer NOT NULL,
	`correct_count` integer DEFAULT 0 NOT NULL,
	`round_count` integer NOT NULL,
	`figures_revealed` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`user_key`) REFERENCES `profiles`(`user_key`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `game_sessions_user_completed_idx` ON `game_sessions` (`user_key`,`completed_at`);--> statement-breakpoint
CREATE INDEX `game_sessions_user_status_idx` ON `game_sessions` (`user_key`,`status`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`user_key` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`last_seen_at` integer NOT NULL,
	`privacy_version` text NOT NULL,
	`profile_status` text DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `round_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`paper_id` text NOT NULL,
	`question_type` text NOT NULL,
	`selected_option` integer NOT NULL,
	`was_correct` integer NOT NULL,
	`score_awarded` integer NOT NULL,
	`images_seen` integer NOT NULL,
	`answered_at` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `game_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `round_attempts_session_paper_unique` ON `round_attempts` (`session_id`,`paper_id`);--> statement-breakpoint
CREATE INDEX `round_attempts_session_idx` ON `round_attempts` (`session_id`);--> statement-breakpoint
CREATE INDEX `round_attempts_paper_idx` ON `round_attempts` (`paper_id`);