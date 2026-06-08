import { createClient } from "@/lib/supabase/server";
import { getUserPlan, createPortalSession } from "@/lib/actions/stripe";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Zap, Check, User, CreditCard } from "lucide-react";
import { redirect } from "next/navigation";
import UpgradeButton from "@/components/buttons/upgrade-button";

const PRO_FEATURES = [
  "Unlimited projects",
  "Auto-open dependency update PRs",
  "Full snapshot diff history",
  "Email alerts for critical updates",
  "Priority support",
];

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const avatarUrl = user.user_metadata?.avatar_url ?? "";
  const username = user.user_metadata?.user_name ?? "";
  const email = user.email ?? "";
  const plan = await getUserPlan();

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-lg font-semibold mb-1">Settings</h1>
      <p className="text-sm text-zinc-500 mb-8">
        Manage your account and billing
      </p>

      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <User className="size-4 text-zinc-400" />
          <h2 className="text-sm font-medium text-zinc-700">Profile</h2>
        </div>
        <div className="border border-zinc-200 rounded-xl p-4 flex items-center gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="text-sm">
              {username?.[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-900 truncate">
              @{username}
            </p>
            <p className="text-xs text-zinc-500 truncate">{email}</p>
          </div>
          <Badge
            className={
              plan === "pro"
                ? "h-5 text-xs bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100"
                : "h-5 text-xs bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-100"
            }
          >
            {plan === "pro" ? "Pro" : "Free"}
          </Badge>
        </div>
      </section>

      <Separator className="mb-8" />

      <section>
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="size-4 text-zinc-400" />
          <h2 className="text-sm font-medium text-zinc-700">Billing</h2>
        </div>

        {plan === "pro" ? (
          <div className="border border-zinc-200 rounded-xl overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-900">
                  Patchboard Pro
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Active subscription
                </p>
              </div>
              <Badge className="h-5 text-xs bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
                Active
              </Badge>
            </div>
            <Separator />
            <div className="p-4">
              <p className="text-xs text-zinc-500 mb-3">Your plan includes:</p>
              <ul className="space-y-1.5 mb-4">
                {PRO_FEATURES.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-xs text-zinc-700"
                  >
                    <Check className="size-3.5 text-emerald-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <form action={createPortalSession}>
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs text-zinc-600"
                >
                  Manage subscription
                </Button>
              </form>
              <p className="text-xs text-zinc-400 mt-2">
                Cancel or change your plan via the billing portal.
              </p>
            </div>
          </div>
        ) : (
          <div className="border border-zinc-200 rounded-xl overflow-hidden">
            <div className="p-4">
              <p className="text-sm font-medium text-zinc-900">Free plan</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                You&apos;re on the free tier.
              </p>
            </div>
            <Separator />
            <div className="p-4">
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="size-4 text-amber-500" />
                  <p className="text-sm font-semibold text-amber-900">
                    Upgrade to Pro
                  </p>
                </div>
                <ul className="space-y-1.5 mb-4">
                  {PRO_FEATURES.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-xs text-zinc-700"
                    >
                      <Check className="size-3.5 text-amber-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <UpgradeButton />
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
