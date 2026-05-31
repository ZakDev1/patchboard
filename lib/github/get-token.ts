import { createClient } from "@/lib/supabase/server";
import { User } from "@supabase/supabase-js";

export async function getGithubToken(): Promise<{ user: User; accessToken: string } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.provider_token) return null;

  return { user, accessToken: session.provider_token };
}
