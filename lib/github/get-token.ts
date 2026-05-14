import { createClient } from "@/lib/supabase/server";
import sql from "@/lib/db";
import { User } from "@supabase/supabase-js";

export async function getGithubToken(): Promise<{ user: User; accessToken: string } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [profile] = await sql`
    select github_access_token from profiles
    where id = ${user.id}
  `;

  if (!profile?.github_access_token) return null;

  return { user, accessToken: profile.github_access_token };
}
