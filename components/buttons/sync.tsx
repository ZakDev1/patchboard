"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { syncProject } from "@/app/actions/snapshots";
import { toast } from "sonner";
import posthog from "posthog-js";

export default function SyncButton({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleSync() {
    setLoading(true);
    try {
      const { success, error } = await syncProject(projectId);
      if (!success && error) {
        return toast.error(error);
      }
      toast.success("Snapshot created");
      posthog.capture("project_synced", { project_id: projectId });
    } catch (err) {
      toast.error("Failed to sync - check the repo is accessible");
      posthog.captureException(err);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" onClick={handleSync} disabled={loading}>
      {loading ? "Syncing..." : "Sync"}
    </Button>
  );
}
