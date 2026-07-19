ALTER TABLE "usage_events" ADD COLUMN "input_cost_usd" numeric(12, 6);--> statement-breakpoint
ALTER TABLE "usage_events" ADD COLUMN "output_cost_usd" numeric(12, 6);--> statement-breakpoint
ALTER TABLE "usage_events" ADD COLUMN "cache_cost_usd" numeric(12, 6);