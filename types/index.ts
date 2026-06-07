export interface Package {
  id: string;
  packageName: string;
  currentVersion: string;
  latestVersion: string;
  isMajor: boolean;
  status: "approved" | "snoozed" | "pending";
  repoUrl: string | null;
  prUrl: string | null;
}

export interface Project {
  id: string;
  userId: string;
  repoOwner: string;
  repoName: string;
  snapshotCount: number;
  lastSynced: Date | null;
}

export interface Snapshot {
  id: string;
  projectId: string;
  capturedAt: Date;
}
