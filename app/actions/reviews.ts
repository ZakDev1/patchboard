"use server";

import sql from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createBatchPR } from "@/lib/github/create-pr";
import { Package } from "@/types";
import { createClient } from "@/lib/supabase/server";
import { getGithubToken } from "@/lib/github/get-token";
import { redirect } from "next/navigation";

export async function getPackages(snapshotId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return sql`
    select * from package_reviews
    where snapshot_id = ${snapshotId}
    order by is_major desc, package_name asc
  ` as unknown as Package[];
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

  const [review] = await sql`
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
  `;

  revalidatePath("/dashboard");
  return review;
}

export async function openBatchPR(projectId: string) {
  const auth = await getGithubToken();
  if (!auth) redirect("/login");

  const { user, accessToken } = auth;

  const [project] = await sql`
    select * from projects
    where id = ${projectId}
    and user_id = ${user!.id}
  `;

  if (!project) throw new Error("Project not found");

  const [snapshot] = await sql`
    select * from snapshots
    where project_id = ${project.id}
    order by captured_at desc
    limit 1
  `;

  if (!snapshot) throw new Error("No snapshot found");

  const packages = await sql`
    select * from package_reviews
    where snapshot_id = ${snapshot.id}
    and status = 'approved'
    and pr_url is null
  `;

  if (packages.length === 0) throw new Error("No approved packages");

  const prUrl = await createBatchPR({
    owner: project.repo_owner,
    repo: project.repo_name,
    packages: packages.map((p) => ({
      name: p.package_name,
      currentVersion: p.current_version,
      latestVersion: p.latest_version,
    })),
    accessToken: accessToken,
  });

  await sql`
    update package_reviews
    set pr_url = ${prUrl}
    where snapshot_id = ${snapshot.id}
    and status = 'approved'
    and pr_url is null
  `;

  revalidatePath(`/dashboard/projects/${projectId}`);
  return prUrl;
}
