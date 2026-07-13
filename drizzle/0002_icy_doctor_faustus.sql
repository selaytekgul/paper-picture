CREATE TABLE `operational_metrics` (
	`metric` text NOT NULL,
	`bucket_start` integer NOT NULL,
	`count` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `operational_metrics_metric_bucket_unique` ON `operational_metrics` (`metric`,`bucket_start`);--> statement-breakpoint
CREATE INDEX `operational_metrics_bucket_idx` ON `operational_metrics` (`bucket_start`);--> statement-breakpoint
ALTER TABLE `game_sessions` ADD `game_mode` text DEFAULT 'institution' NOT NULL;