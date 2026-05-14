export interface Package {
  id: string;
  package_name: string;
  current_version: string;
  latest_version: string;
  is_major: boolean;
  status: "approved" | "snoozed" | "pending";
  repo_url: string;
  pr_url: string;
}

export interface Project {
  id: string;
  user_id: string;
  repo_owner: string;
  repo_name: string;
  snapshot_count: number;
  last_synced: string;
}

export interface Snapshot {
  id: string;
  project_id: string;
  captured_at: string;
}
