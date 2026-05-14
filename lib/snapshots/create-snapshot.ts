import sql from "@/lib/db";
import { fetchPackageJson } from "@/lib/github/fetch-package-json";
import { fetchLatestVersion, fetchRepositoryUrl } from "@/lib/npm/fetch-versions";
import semver from "semver";

interface PackageResult {
  name: string;
  currentVersion: string;
  latestVersion: string;
  isMajor: boolean;
  repoUrl: string | null;
}

export async function createSnapshot(projectId: string, repoOwner: string, repoName: string, accessToken: string) {
  const packageJson = await fetchPackageJson(repoOwner, repoName, accessToken);

  const deps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  const [snapshot] = await sql`insert into snapshots (project_id) values (${projectId}) returning *`;

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
      (r): r is PromiseFulfilledResult<NonNullable<PackageResult>> => r.status === "fulfilled" && r.value !== null,
    )
    .map((r) => r.value);

  if (packages.length > 0) {
    await sql`
    insert into package_reviews ${sql(
      packages.map((p: PackageResult) => ({
        snapshot_id: snapshot.id,
        package_name: p.name,
        current_version: p.currentVersion,
        latest_version: p.latestVersion,
        is_major: p.isMajor,
        repo_url: p.repoUrl,
      })),
    )}
    `;
  }

  return { snapshot, packages };
}
