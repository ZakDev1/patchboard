export async function fetchLatestVersion(packageName: string): Promise<string> {
  const response = await fetch(`https://registry.npmjs.org/${packageName}/latest`);

  if (!response.ok) {
    throw new Error(`Failed to fetch version for ${packageName}`);
  }

  const data = await response.json();
  return data.version as string;
}

export async function fetchRepositoryUrl(packageName: string): Promise<string | null> {
  const response = await fetch(`https://registry.npmjs.org/${packageName}/latest`);
  if (!response.ok) return null;

  const data = await response.json();
  const repo = data.repository;

  if (!repo) return null;

  const url = typeof repo === "string" ? repo : repo.url;

  return url
    .replace(/^git\+/, "")
    .replace(/^git:\/\//, "https://")
    .replace(/\.git$/, "")
    .replace("git+https://", "https://");
}
