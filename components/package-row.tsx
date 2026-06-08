"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { updateReviewStatus } from "@/app/actions/reviews";
import { Package } from "@/types";
import { toast } from "sonner";
import posthog from "posthog-js";

export default function PackageRow({ pkg }: { pkg: Package }) {
  const [loading, setLoading] = useState(false);

  async function updateStatus(status: "approved" | "snoozed" | "pending") {
    setLoading(true);
    try {
      await updateReviewStatus(pkg.id, status);
      if (status === "approved") {
        posthog.capture("package_approved", {
          package_name: pkg.packageName,
          current_version: pkg.currentVersion,
          latest_version: pkg.latestVersion,
          is_major: pkg.isMajor,
        });
      } else if (status === "snoozed") {
        posthog.capture("package_snoozed", {
          package_name: pkg.packageName,
          current_version: pkg.currentVersion,
          latest_version: pkg.latestVersion,
          is_major: pkg.isMajor,
        });
      }
    } catch (err) {
      toast.error("Failed to update - please try again");
      posthog.captureException(err);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-between px-5 py-3.5">
      <div className="flex items-center gap-3 min-w-0">
        <span className="font-mono text-sm truncate">{pkg.packageName}</span>
        {pkg.isMajor && (
          <Badge variant="destructive" className="text-xs shrink-0">
            major
          </Badge>
        )}
        <span className="text-xs text-zinc-400 shrink-0">
          {pkg.currentVersion} → {pkg.latestVersion}
        </span>
        {pkg.repoUrl && (
          <a
            href={`${pkg.repoUrl}/releases`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:underline shrink-0"
          >
            changelog ↗
          </a>
        )}
        {pkg.prUrl && (
          <a
            href={pkg.prUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:underline shrink-0"
          >
            PR ↗
          </a>
        )}
      </div>

      <div className="flex items-center gap-2 ml-4 shrink-0">
        {pkg.status === "pending" ? (
          <>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              disabled={loading}
              onClick={() => updateStatus("approved")}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-zinc-400"
              disabled={loading}
              onClick={() => updateStatus("snoozed")}
            >
              Snooze
            </Button>
          </>
        ) : (
          <Badge
            variant="outline"
            className={`text-xs ${
              pkg.status === "approved"
                ? "text-green-600 border-green-200 bg-green-50"
                : "text-yellow-600 border-yellow-200 bg-yellow-50"
            }`}
          >
            {pkg.status}
          </Badge>
        )}
      </div>
    </div>
  );
}
