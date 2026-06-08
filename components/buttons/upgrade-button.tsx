"use client";

import { Button } from "@/components/ui/button";
import { createCheckoutSession } from "@/lib/actions/stripe";
import { Zap } from "lucide-react";
import posthog from "posthog-js";

export default function UpgradeButton() {
  return (
    <form action={createCheckoutSession}>
      <Button
        type="submit"
        size="sm"
        className="h-8 text-xs gap-1.5 bg-amber-500 hover:bg-amber-600 text-white w-full"
        onClick={() => posthog.capture("upgrade_clicked")}
      >
        <Zap className="size-3" />
        Upgrade to Pro
      </Button>
    </form>
  );
}
