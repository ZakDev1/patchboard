"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteSnapshot } from "@/app/actions/snapshots";
import { toast } from "sonner";

export default function DeleteSnapshotButton({ snapshotId }: { snapshotId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteSnapshot(snapshotId);
      toast.success("Snapshot deleted");
    } catch (err) {
      toast.error("Failed to delete snapshot");
      console.error(err);
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 ml-4">
        <span className="text-xs text-zinc-400">Sure?</span>
        <Button size="sm" variant="destructive" className="h-7 text-xs" disabled={loading} onClick={handleDelete}>
          {loading ? "Deleting..." : "Delete"}
        </Button>
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setConfirming(false)}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      className="h-7 text-xs text-zinc-400 hover:text-red-500 ml-4"
      onClick={() => setConfirming(true)}
    >
      Delete
    </Button>
  );
}
