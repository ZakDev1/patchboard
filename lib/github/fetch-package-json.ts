export async function fetchPackageJson(owner: string, repo: string, accessToken: string) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/package.json`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github.v3.raw",
    },
  });

  if (!res.ok) throw new Error(`Failed to fetch package.json: ${res.status}`);

  const text = await res.text();
  return JSON.parse(text) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
}
