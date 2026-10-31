CREATE TABLE "books" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"author" varchar(150) NOT NULL,
	"isbn" varchar(20) NOT NULL,
	"published_year" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "books_isbn_unique" UNIQUE("isbn")
);
