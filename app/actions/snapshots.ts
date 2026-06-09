"use server";

import { revalidatePath } from "next/cache";
import { createSnapshot } from "@/lib/snapshots/create-snapshot";
import { createClient } from "@/lib/supabase/server";
import { Snapshot } from "@/types";
import { getGithubToken } from "@/lib/github/get-token";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { and, count, desc, eq, sql } from "drizzle-orm";
import { packageReviews, projects, snapshots } from "@/db/schema";

export async function getSnapshots(projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const result = await db
    .select({
      id: snapshots.id,
      capturedAt: snapshots.capturedAt,
      total: count(packageReviews.id),
      pending: sql<number>`count(${packageReviews.id}) filter (where ${packageReviews.status} = 'pending')`,
      approved: sql<number>`count(${packageReviews.id}) filter (where ${packageReviews.status} = 'approved')`,
      snoozed: sql<number>`count(${packageReviews.id}) filter (where ${packageReviews.status} = 'snoozed')`,
      majorCount: sql<number>`count(${packageReviews.id}) filter (where ${packageReviews.isMajor} = true)`,
    })
    .from(snapshots)
    .leftJoin(packageReviews, eq(packageReviews.snapshotId, snapshots.id))
    .where(eq(snapshots.projectId, projectId))
    .groupBy(snapshots.id)
    .orderBy(desc(snapshots.capturedAt));

  return result;
}

export async function getSnapshot(
  snapshotId: string,
  projectId: string,
): Promise<Snapshot | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [snapshot] = await db
    .select()
    .from(snapshots)
    .where(
      and(eq(snapshots.id, snapshotId), eq(snapshots.projectId, projectId)),
    );

  return snapshot;
}

export async function getLatestSnapshot(projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [snapshot] = await db
    .select()
    .from(snapshots)
    .where(eq(snapshots.projectId, projectId))
    .orderBy(desc(snapshots.capturedAt))
    .limit(1);

  return snapshot;
}

export async function syncProject(
  projectId: string,
): Promise<{ success: boolean; error?: string }> {
  const auth = await getGithubToken();
  if (!auth) redirect("/login");

  const { user, accessToken } = auth;

  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)));

  if (!project) {
    return { success: false, error: "Project not found" };
  }

  const result = await createSnapshot(
    project.id,
    project.repoOwner,
    project.repoName,
    accessToken,
  );

  if (result.error) {
    return { success: false, error: result.error };
  }

  revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true };
}

export async function deleteSnapshot(snapshotId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  await db.execute(sql`
    delete from snapshots s
    using projects p
    where s.id = ${snapshotId}
    and s.project_id = p.id
    and p.user_id = ${user!.id}
  `);

  revalidatePath("/dashboard");
}
