import { createClient } from "@/lib/supabase/server";
import { getUserPlan, createPortalSession } from "@/lib/actions/stripe";
import { redirect } from "next/navigation";
import SettingsPage from "@/components/layouts/Settings";

export default async function Settings() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const avatarUrl = user.user_metadata?.avatar_url ?? "";
  const username = user.user_metadata?.user_name ?? "";
  const email = user.email ?? "";
  const plan = await getUserPlan();

  const profile = { avatarUrl, username, email, plan };

  return (
    <SettingsPage profile={profile} createPortalSession={createPortalSession} />
  );
}
