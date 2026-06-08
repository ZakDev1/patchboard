CREATE TYPE "public"."status" AS ENUM('pending', 'approved', 'snoozed');
CREATE TABLE "package_metadata" (
	"package_name" text NOT NULL,
	"version" text NOT NULL,
	"changelog_url" text,
	"release_notes" text,
	"fetched_at" timestamp DEFAULT now(),
	CONSTRAINT "package_metadata_package_name_version_pk" PRIMARY KEY("package_name","version")
);

CREATE TABLE "package_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"snapshot_id" uuid,
	"package_name" text NOT NULL,
	"current_version" text NOT NULL,
	"latest_version" text NOT NULL,
	"is_major" boolean DEFAULT false NOT NULL,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"notes" text,
	"repo_url" text,
	"pr_url" text,
	"reviewed_at" timestamp
);

CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"github_username" text,
	"avatar_url" text,
	"github_access_token" text NOT NULL,
	"email" text NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"plan" text DEFAULT 'free' NOT NULL,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"repo_owner" text NOT NULL,
	"repo_name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "projects_user_id_repo_name_repo_name_unique" UNIQUE("user_id","repo_name","repo_name")
);

CREATE TABLE "snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"captured_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "package_reviews" ADD CONSTRAINT "package_reviews_snapshot_id_snapshots_id_fk" FOREIGN KEY ("snapshot_id") REFERENCES "public"."snapshots"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "snapshots" ADD CONSTRAINT "snapshots_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
