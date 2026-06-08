import { db } from "@/db";
import { profiles } from "@/db/schema";
import { encrypt } from "@/lib/encrypt";
import { createClient } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getPostHogClient } from "@/lib/posthog-server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      const accessToken = data.session.provider_token;
      if (accessToken) {
        await db
          .update(profiles)
          .set({
            githubAccessToken: encrypt(accessToken),
            email: data.session.user.email,
          })
          .where(eq(profiles.id, data.session.user.id));
      }

      const posthog = getPostHogClient();
      const userId = data.session.user.id;
      const email = data.session.user.email;
      const username = data.session.user.user_metadata?.user_name;

      posthog.identify({
        distinctId: userId,
        properties: {
          email,
          username,
        },
      });

      posthog.capture({
        distinctId: userId,
        event: "user_signed_in",
        properties: {
          provider: "github",
          email,
          username,
        },
      });

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
