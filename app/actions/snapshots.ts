"use server";

import sql from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createSnapshot } from "@/lib/snapshots/create-snapshot";
import { createClient } from "@/lib/supabase/server";
import { Snapshot } from "@/types";
import { getGithubToken } from "@/lib/github/get-token";
import { redirect } from "next/navigation";

export async function getSnapshots(projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return sql`
    select
      s.id,
      s.captured_at,
      count(pr.id) as total,
      count(pr.id) filter (where pr.status = 'pending') as pending,
      count(pr.id) filter (where pr.status = 'approved') as approved,
      count(pr.id) filter (where pr.status = 'snoozed') as snoozed,
      count(pr.id) filter (where pr.is_major = true) as major_count
    from snapshots s
    left join package_reviews pr on pr.snapshot_id = s.id
    where s.project_id = ${projectId}
    group by s.id
    order by s.captured_at desc
  `;
}

export async function getSnapshot(snapshotId: string, projectId: string): Promise<Snapshot | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [snapshot] = await sql`
    select * from snapshots
    where id = ${snapshotId}
    and project_id = ${projectId}
  `;

  return (snapshot as Snapshot) ?? null;
}

export async function getLatestSnapshot(projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [snapshot] = await sql`
    select * from snapshots
    where project_id = ${projectId}
    order by captured_at desc
    limit 1
  `;
  return snapshot ?? null;
}

export async function syncProject(projectId: string) {
  const auth = await getGithubToken();
  if (!auth) redirect("/login");

  const { user, accessToken } = auth;

  const [project] = await sql`
    select p.* from projects p
    where p.id = ${projectId}
    and user_id = ${user!.id}
  `;

  if (!project) throw new Error("Project not found");

  const result = await createSnapshot(project.id, project.repo_owner, project.repo_name, accessToken);

  revalidatePath(`/dashboard/projects/${projectId}`);
  return result;
}

export async function deleteSnapshot(snapshotId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  await sql`
    delete from snapshots s
    using projects p, users u
    where s.id = ${snapshotId}
    and s.project_id = p.id
    and user_id = ${user!.id}
  `;

  revalidatePath("/dashboard");
}
