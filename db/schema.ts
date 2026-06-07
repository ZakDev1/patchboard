import { pgTable, uuid, text, timestamp, unique, boolean, pgEnum, primaryKey } from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  githubUsername: text("github_username"),
  avatarUrl: text("avatar_url"),
  githubAccessToken: text("github_access_token").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  plan: text("plan").notNull().default("free"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => profiles.id, { onDelete: "cascade" })
      .notNull(),
    repoOwner: text("repo_owner").notNull(),
    repoName: text("repo_name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [unique().on(t.userId, t.repoName, t.repoName)],
);

export const snapshots = pgTable("snapshots", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  capturedAt: timestamp("captured_at").defaultNow().notNull(),
});

export const statusEnum = pgEnum("status", ["pending", "approved", "snoozed"]);

export const packageReviews = pgTable("package_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  snapshotId: uuid("snapshot_id").references(() => snapshots.id, { onDelete: "cascade" }),
  packageName: text("package_name").notNull(),
  currentVersion: text("current_version").notNull(),
  latestVersion: text("latest_version").notNull(),
  isMajor: boolean("is_major").notNull().default(false),
  status: statusEnum("status").notNull().default("pending"),
  notes: text("notes"),
  repoUrl: text("repo_url"),
  prUrl: text("pr_url"),
  reviewedAt: timestamp("reviewed_at"),
});

export const packageMetadata = pgTable(
  "package_metadata",
  {
    packageName: text("package_name").notNull(),
    version: text("version").notNull(),
    changelogUrl: text("changelog_url"),
    releaseNotes: text("release_notes"),
    fetchedAt: timestamp("fetched_at").defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.packageName, t.version] })],
);
