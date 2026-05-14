"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { syncProject } from "@/app/actions/snapshots";
import { toast } from "sonner";

export default function SyncButton({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleSync() {
    setLoading(true);
    try {
      await syncProject(projectId);
      toast.success("Snapshot created");
    } catch (err) {
      toast.error("Failed to sync - check the repo is accessible");
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
