"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Project } from "@/types";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { and, count, desc, eq, getTableColumns, max } from "drizzle-orm";
import { profiles, projects, snapshots } from "@/db/schema";
import { schedules } from "@trigger.dev/sdk";

export async function getProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const result = await db
    .select({
      ...getTableColumns(projects),
      snapshotCount: count(snapshots.id),
      lastSynced: max(snapshots.capturedAt),
    })
    .from(projects)
    .leftJoin(snapshots, eq(snapshots.projectId, projects.id))
    .where(eq(projects.userId, user.id))
    .groupBy(projects.id)
    .orderBy(desc(projects.createdAt));

  return result;
}

export async function getProject(id: string): Promise<Project | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const [project] = await db
    .select({
      ...getTableColumns(projects),
      snapshotCount: count(snapshots.id),
      lastSynced: max(snapshots.capturedAt),
    })
    .from(projects)
    .leftJoin(snapshots, eq(snapshots.projectId, projects.id))
    .where(and(eq(projects.id, id), eq(projects.userId, user.id)))
    .groupBy(projects.id);

  return project;
}

export async function addProject(repoOwner: string, repoName: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id));

  if (profile.plan === "free") {
    const projectCount = await db.select({ count: count() }).from(projects).where(eq(projects.userId, user.id));

    if (projectCount[0].count >= 3) {
      return { success: false, error: "Free plan is limited to 3 projects. Upgrade to Pro for unlimited." };
    }
  }

  const [project] = await db
    .insert(projects)
    .values({
      userId: user.id,
      repoOwner,
      repoName,
    })
    .onConflictDoNothing()
    .returning();

  await schedules.create({
    task: "weekly-dependency-scan",
    cron: "0 9 * * 1",
    externalId: project.id,
    deduplicationKey: project.id,
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteProject(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  await db.delete(projects).where(and(eq(projects.id, id), eq(projects.userId, user.id)));

  await schedules.del(id);
  revalidatePath("/dashboard");
}
