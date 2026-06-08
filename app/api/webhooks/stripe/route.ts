import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getPostHogClient } from "@/lib/posthog-server";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 404 });
  }
  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const posthog = getPostHogClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const customerId = session.customer as string;
      await db
        .update(profiles)
        .set({
          stripeSubscriptionId: session.subscription as string,
          plan: "pro",
        })
        .where(eq(profiles.stripeCustomerId, customerId));

      const [profile] = await db
        .select({ id: profiles.id })
        .from(profiles)
        .where(eq(profiles.stripeCustomerId, customerId));
      if (profile) {
        posthog.capture({
          distinctId: profile.id,
          event: "subscription_activated",
          properties: { stripe_customer_id: customerId },
        });
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object;
      const isActive = subscription.status === "active";
      const customerId = subscription.customer as string;
      await db
        .update(profiles)
        .set({ plan: isActive ? "pro" : "free" })
        .where(eq(profiles.stripeCustomerId, customerId));
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const customerId = subscription.customer as string;
      await db
        .update(profiles)
        .set({ plan: "free", stripeSubscriptionId: null })
        .where(eq(profiles.stripeSubscriptionId, customerId));

      const [profile] = await db
        .select({ id: profiles.id })
        .from(profiles)
        .where(eq(profiles.stripeCustomerId, customerId));
      if (profile) {
        posthog.capture({
          distinctId: profile.id,
          event: "subscription_cancelled",
          properties: { stripe_customer_id: customerId },
        });
      }
      break;
    }
  }

  return NextResponse.json({ recieved: true });
}
