"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { openBatchPR } from "@/app/actions/reviews";
import { toast } from "sonner";
import posthog from "posthog-js";

export default function OpenPRButton({ projectId, approvedCount }: { projectId: string; approvedCount: number }) {
  const [loading, setLoading] = useState(false);

  async function handleOpenPR() {
    setLoading(true);
    try {
      const prUrl = await openBatchPR(projectId);
      setLoading(false);
      if (prUrl) {
        window.open(prUrl, "_blank");
      }
      toast.success("PR opened successfully");
      posthog.capture("pr_opened", {
        project_id: projectId,
        approved_count: approvedCount,
        pr_url: prUrl,
      });
    } catch (err) {
      toast.error("Failed to open PR - check your GitHub permissions");
      posthog.captureException(err);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (approvedCount === 0) return null;

  return (
    <Button size="sm" variant="outline" onClick={handleOpenPR} disabled={loading}>
      {loading ? "Opening PR..." : `Open PR · ${approvedCount} approved`}
    </Button>
  );
}
