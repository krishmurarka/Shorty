CREATE SEQUENCE "public"."link_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE TABLE "links" (
	"id" bigint PRIMARY KEY NOT NULL,
	"code" varchar(11) NOT NULL,
	"destination" text NOT NULL,
	"disabled" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "links_code_unique" UNIQUE("code")
);
