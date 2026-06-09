import { createClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/encrypt";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { User } from "@supabase/supabase-js";

export async function getGithubToken(): Promise<{
  user: User;
  accessToken: string;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [profile] = await db
    .select({ githubAccessToken: profiles.githubAccessToken })
    .from(profiles)
    .where(eq(profiles.id, user.id));

  if (!profile?.githubAccessToken) return null;

  let accessToken: string;
  try {
    accessToken = decrypt(profile.githubAccessToken);
  } catch (error) {
    console.error(error);
    return null;
  }

  return { user, accessToken };
}
