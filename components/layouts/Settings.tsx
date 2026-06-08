"use client";

import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Zap, Check, User, CreditCard, Palette } from "lucide-react";
import UpgradeButton from "@/components/buttons/upgrade-button";
import { Switch } from "@/components/ui/switch";

const PRO_FEATURES = [
  "Unlimited projects",
  "Auto-open dependency update PRs",
  "Full snapshot diff history",
  "Email alerts for critical updates",
  "Priority support",
];

export default function SettingsPage({
  profile,
  createPortalSession,
}: {
  profile: {
    avatarUrl: string;
    username: string;
    email: string;
    plan: "free" | "pro";
  };
  createPortalSession: () => void;
}) {
  const { theme, setTheme } = useTheme();
  const { avatarUrl, username, email, plan } = profile;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-lg font-semibold mb-1">Settings</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Manage your account and billing
      </p>

      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <User className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-medium">Profile</h2>
        </div>
        <div className="border border-border rounded-xl p-4 flex items-center gap-4 bg-card">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="text-sm">
              {username?.[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">@{username}</p>
            <p className="text-xs text-muted-foreground truncate">{email}</p>
          </div>
          <Badge
            className={
              plan === "pro"
                ? "h-5 text-xs bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100"
                : "h-5 text-xs bg-muted text-muted-foreground border-border hover:bg-muted"
            }
          >
            {plan === "pro" ? "Pro" : "Free"}
          </Badge>
        </div>
      </section>

      <Separator className="mb-8" />

      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-medium">Customisation</h2>
        </div>
        <div className="p-4 flex items-center justify-between gap-4">
          <p className="text-xs truncate">Dark Mode</p>
          <Switch
            aria-label="Dark Mode"
            checked={theme === "dark"}
            onCheckedChange={() =>
              setTheme(theme === "dark" ? "light" : "dark")
            }
          />
        </div>
      </section>

      <Separator className="mb-8" />

      <section>
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-medium">Billing</h2>
        </div>

        {plan === "pro" ? (
          <div className="border border-border rounded-xl overflow-hidden bg-card">
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Patchboard Pro</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Active subscription
                </p>
              </div>
              <Badge className="h-5 text-xs bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
                Active
              </Badge>
            </div>
            <Separator />
            <div className="p-4">
              <p className="text-xs text-muted-foreground mb-3">Your plan includes:</p>
              <ul className="space-y-1.5 mb-4">
                {PRO_FEATURES.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-xs"
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
                  className="h-8 text-xs"
                >
                  Manage subscription
                </Button>
              </form>
              <p className="text-xs text-muted-foreground mt-2">
                Cancel or change your plan via the billing portal.
              </p>
            </div>
          </div>
        ) : (
          <div className="border border-border rounded-xl overflow-hidden bg-card">
            <div className="p-4">
              <p className="text-sm font-medium">Free plan</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                You&apos;re on the free tier.
              </p>
            </div>
            <Separator />
            <div className="p-4">
              <div className="bg-linear-to-br from-amber-50 to-yellow-50 border border-amber-100 rounded-lg p-4 mb-4">
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
                      className="flex items-center gap-2 text-xs text-amber-900"
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
