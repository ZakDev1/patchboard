"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Zap, GitPullRequest, Bell, BarChart2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

const PRO_FEATURES = [
  { icon: Layers, label: "Unlimited projects", description: "Track as many repos as you need" },
  { icon: GitPullRequest, label: "Auto-open PRs", description: "One-click dependency update PRs" },
  { icon: BarChart2, label: "Snapshot history", description: "Full diff history across snapshots" },
  { icon: Bell, label: "Email alerts", description: "Get notified of critical updates" },
];

export default function UpgradeSuccessBanner() {
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();

  function handleDismiss() {
    setDismissed(true);
    router.replace("/dashboard");
  }

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-5 mb-6 relative">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-amber-400 hover:text-amber-600 transition-colors"
        aria-label="Dismiss"
      >
        <X className="size-4" />
      </button>

      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center justify-center size-7 rounded-full bg-amber-400">
          <Zap className="size-4 text-white fill-white" />
        </div>
        <div>
          <p className="font-semibold text-sm text-amber-900">Welcome to Patchboard Pro!</p>
          <p className="text-xs text-amber-700">Thanks for upgrading. Here&apos;s what you&apos;ve unlocked:</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {PRO_FEATURES.map(({ icon: Icon, label, description }) => (
          <div key={label} className="flex items-start gap-2 bg-white/60 rounded-lg px-3 py-2">
            <Icon className="size-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-zinc-800">{label}</p>
              <p className="text-xs text-zinc-500">{description}</p>
            </div>
          </div>
        ))}
      </div>

      <Button
        size="sm"
        className="h-7 text-xs bg-amber-500 hover:bg-amber-600 text-white"
        onClick={handleDismiss}
      >
        Get started
      </Button>
    </div>
  );
}
