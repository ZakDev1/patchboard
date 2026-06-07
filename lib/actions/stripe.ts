"use server";

import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getGithubToken } from "@/lib/github/get-token";
import { redirect } from "next/navigation";

export async function createCheckoutSession() {
  const auth = await getGithubToken();
  if (!auth) redirect("/login");
  const { user } = auth;

  const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id));

  let customerId = profile.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id },
    });
    customerId = customer.id;

    await db.update(profiles).set({ stripeCustomerId: customerId }).where(eq(profiles.id, user.id));
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID!, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgrade=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });

  redirect(session.url!);
}

export async function createPortalSession() {
  const auth = await getGithubToken();
  if (!auth) redirect("/login");
  const { user } = auth;

  const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id));

  if (!profile?.stripeCustomerId) redirect("/dashboard/settings");

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
  });

  redirect(session.url);
}

export async function getUserPlan(): Promise<"free" | "pro"> {
  const auth = await getGithubToken();
  if (!auth) return "free";
  const { user } = auth;

  const [profile] = await db.select({ plan: profiles.plan }).from(profiles).where(eq(profiles.id, user.id));
  return (profile?.plan as "free" | "pro") ?? "free";
}
