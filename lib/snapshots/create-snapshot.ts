import { db } from "@/db";
import { packageReviews, profiles, snapshots } from "@/db/schema";
import { fetchPackageJson } from "@/lib/github/fetch-package-json";
import {
  fetchLatestVersion,
  fetchRepositoryUrl,
} from "@/lib/npm/fetch-versions";
import semver from "semver";
import { redirect } from "next/navigation";
import { count, eq } from "drizzle-orm";
import { Snapshot } from "@/types";
import { createClient } from "../supabase/client";

interface PackageResult {
  name: string;
  currentVersion: string;
  latestVersion: string;
  isMajor: boolean;
  repoUrl: string | null;
}

export async function createSnapshot(
  projectId: string,
  repoOwner: string,
  repoName: string,
  accessToken: string,
): Promise<{
  snapshot: Snapshot | null;
  packages: PackageResult[] | null;
  error?: string;
}> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id));

  if (profile.plan === "free") {
    const snapshotCount = await db
      .select({ count: count() })
      .from(snapshots)
      .where(eq(snapshots.projectId, projectId));

    if (snapshotCount[0].count >= 5) {
      return {
        snapshot: null,
        packages: null,
        error:
          "Free plan is limited to 5 snapshots. Upgrade to Pro for unlimited.",
      };
    }
  }

  const packageJson = await fetchPackageJson(repoOwner, repoName, accessToken);

  const deps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  const [snapshot] = await db
    .insert(snapshots)
    .values({ projectId: projectId })
    .returning();

  const results = await Promise.allSettled(
    Object.entries(deps).map(async ([name, rawVersion]) => {
      const currentVersion = semver.coerce(rawVersion)?.version ?? rawVersion;
      const latestVersion = await fetchLatestVersion(name);
      const repoUrl = await fetchRepositoryUrl(name);

      if (currentVersion === latestVersion) return null;

      const isMajor = semver.diff(currentVersion, latestVersion) === "major";

      return { name, currentVersion, latestVersion, isMajor, repoUrl };
    }),
  );

  const packages = results
    .filter(
      (r): r is PromiseFulfilledResult<NonNullable<PackageResult>> =>
        r.status === "fulfilled" && r.value !== null,
    )
    .map((r) => r.value);

  if (packages.length > 0) {
    await db.insert(packageReviews).values(
      packages.map((p: PackageResult) => ({
        snapshotId: snapshot.id,
        packageName: p.name,
        currentVersion: p.currentVersion,
        latestVersion: p.latestVersion,
        isMajor: p.isMajor,
        repoUrl: p.repoUrl,
      })),
    );
  }

  return { snapshot, packages };
}
