"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { addProject } from "@/app/actions/projects";
import { getUserRepos } from "@/app/actions/github";
import { toast } from "sonner";
import posthog from "posthog-js";

interface Repo {
  id: number;
  fullName: string;
  owner: string;
  name: string;
  private: boolean;
}

export default function AddProjectForm() {
  const [open, setOpen] = useState(false);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) return;
    getUserRepos().then((data) => {
      setRepos(data);
      setLoading(false);
    });
  }, [open]);

  async function handleAdd(repo: Repo) {
    setAdding(repo.fullName);
    const { success, error } = await addProject(repo.owner, repo.name);
    if (!success && error) {
      toast.error(error);
      posthog.capture("project_add_failed", {
        repo: repo.fullName,
        error,
      });
    } else if (success) {
      posthog.capture("project_added", {
        repo: repo.fullName,
        is_private: repo.private,
      });
    }
    setAdding(null);
    setOpen(false);
    setSearch("");
  }

  const filtered = repos.filter((r) => r.fullName.toLowerCase().includes(search.toLowerCase()));

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        Add project
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-32">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="p-4 border-b border-zinc-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">Add a repository</p>
            <button
              onClick={() => {
                setOpen(false);
                setSearch("");
              }}
              className="text-zinc-400 hover:text-zinc-600 text-xs"
            >
              Close
            </button>
          </div>
          <input
            autoFocus
            placeholder="Search repos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-zinc-400"
          />
        </div>

        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="py-8 text-center text-sm text-zinc-400">Loading repos...</div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-zinc-400">No repos found</div>
          ) : (
            filtered.map((repo) => (
              <button
                key={repo.id}
                onClick={() => handleAdd(repo)}
                disabled={adding === repo.fullName}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-50 transition-colors text-left border-b border-zinc-50 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium">{repo.fullName}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{repo.private ? "Private" : "Public"}</p>
                </div>
                {adding === repo.fullName ? (
                  <span className="text-xs text-zinc-400">Adding...</span>
                ) : (
                  <span className="text-xs text-zinc-400">+</span>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
