ALTER TABLE "books" ADD COLUMN "genre" varchar(80);--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "stock" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "books_author_idx" ON "books" USING btree ("author");