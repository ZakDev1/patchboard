"use server";

import { createClient } from "@/lib/supabase/server";
import sql from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Project } from "@/types";
import { redirect } from "next/navigation";

export async function getProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return sql`
    select
      p.*,
      count(distinct s.id) as snapshot_count,
      max(s.captured_at) as last_synced
    from projects p
    left join snapshots s on s.project_id = p.id
    where p.user_id = ${user!.id}
    group by p.id
    order by p.created_at desc
  `;
}

export async function getProject(id: string): Promise<Project | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const [project] = await sql`
    select * from projects
    where id = ${id}
    and user_id = ${user!.id}
  `;

  return (project as Project) ?? null;
}

export async function addProject(repoOwner: string, repoName: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [project] = await sql`
    insert into projects (user_id, repo_owner, repo_name)
    values (${user!.id}, ${repoOwner}, ${repoName})
    on conflict (user_id, repo_owner, repo_name) do nothing
    returning *
  `;

  revalidatePath("/dashboard");
  return project;
}

export async function deleteProject(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  await sql`
    delete from projects
    where id = ${id}
    and user_id = ${user!.id}
  `;

  revalidatePath("/dashboard");
}
