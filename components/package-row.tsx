"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { updateReviewStatus } from "@/app/actions/reviews";
import { Package } from "@/types";
import { toast } from "sonner";

export default function PackageRow({ pkg }: { pkg: Package }) {
  const [loading, setLoading] = useState(false);

  async function updateStatus(status: "approved" | "snoozed" | "pending") {
    setLoading(true);
    try {
      await updateReviewStatus(pkg.id, status);
    } catch (err) {
      toast.error("Failed to update - please try again");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-between px-5 py-3.5">
      <div className="flex items-center gap-3 min-w-0">
        <span className="font-mono text-sm truncate">{pkg.package_name}</span>
        {pkg.is_major && (
          <Badge variant="destructive" className="text-xs shrink-0">
            major
          </Badge>
        )}
        <span className="text-xs text-zinc-400 shrink-0">
          {pkg.current_version} → {pkg.latest_version}
        </span>
        {pkg.repo_url && (
          <a
            href={`${pkg.repo_url}/releases`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:underline shrink-0"
          >
            changelog ↗
          </a>
        )}
        {pkg.pr_url && (
          <a
            href={pkg.pr_url}
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
