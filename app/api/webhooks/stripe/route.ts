import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

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

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      await db
        .update(profiles)
        .set({
          stripeSubscriptionId: session.subscription as string,
          plan: "pro",
        })
        .where(eq(profiles.stripeCustomerId, session.customer as string));
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object;
      const isActive = subscription.status === "active";
      await db
        .update(profiles)
        .set({ plan: isActive ? "pro" : "free" })
        .where(eq(profiles.stripeCustomerId, subscription.customer as string));
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      await db
        .update(profiles)
        .set({ plan: "free", stripeSubscriptionId: null })
        .where(eq(profiles.stripeSubscriptionId, subscription.customer as string));
      break;
    }
  }

  return NextResponse.json({ recieved: true });
}
