"use server";

import { revalidatePath } from "next/cache";
import { createBatchPR } from "@/lib/github/create-pr";
import { createClient } from "@/lib/supabase/server";
import { getGithubToken } from "@/lib/github/get-token";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { packageReviews, projects, snapshots } from "@/db/schema";
import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";

export async function getPackages(snapshotId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const result = await db
    .select()
    .from(packageReviews)
    .where(eq(packageReviews.snapshotId, snapshotId))
    .orderBy(desc(packageReviews.isMajor), asc(packageReviews.packageName));

  return result;
}

export async function updateReviewStatus(
  packageId: string,
  status: "approved" | "snoozed" | "pending",
  notes?: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [review] = await db.execute(sql`
    update package_reviews pr
    set
      status = ${status},
      notes = ${notes ?? null},
      reviewed_at = now()
    from snapshots s
    join projects p on p.id = s.project_id
    where pr.id = ${packageId}
    and s.id = pr.snapshot_id
    and user_id = ${user!.id}
    returning pr.*
  `);

  revalidatePath("/dashboard");
  return review;
}

export async function openBatchPR(projectId: string) {
  const auth = await getGithubToken();
  if (!auth) redirect("/login");

  const { user, accessToken } = auth;

  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)));

  if (!project) throw new Error("Project not found");

  const [snapshot] = await db
    .select()
    .from(snapshots)
    .where(eq(snapshots.projectId, project.id))
    .orderBy(desc(snapshots.capturedAt))
    .limit(1);

  if (!snapshot) throw new Error("No snapshot found");

  const packages = await db
    .select()
    .from(packageReviews)
    .where(
      and(
        eq(packageReviews.snapshotId, snapshot.id),
        eq(packageReviews.status, "approved"),
        isNull(packageReviews.prUrl),
      ),
    );

  if (packages.length === 0) throw new Error("No approved packages");

  const prUrl = await createBatchPR({
    owner: project.repoOwner,
    repo: project.repoName,
    packages: packages.map((p) => ({
      name: p.packageName,
      currentVersion: p.currentVersion,
      latestVersion: p.latestVersion,
    })),
    accessToken: accessToken,
  });

  await db
    .update(packageReviews)
    .set({
      prUrl: prUrl,
    })
    .where(
      and(
        eq(packageReviews.snapshotId, snapshot.id),
        eq(packageReviews.status, "approved"),
        isNull(packageReviews.prUrl),
      ),
    );

  revalidatePath(`/dashboard/projects/${projectId}`);
  return prUrl;
}
