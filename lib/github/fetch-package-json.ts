export async function fetchPackageJson(
  owner: string,
  repo: string,
  accessToken: string,
): Promise<{
  hasPackageJson: boolean;
  deps: {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  } | null;
}> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/package.json`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3.raw",
      },
    },
  );

  if (!res.ok) {
    if (res.status === 404) {
      return { hasPackageJson: false, deps: null };
    }
  }

  const text = await res.text();
  return {
    hasPackageJson: true,
    deps: JSON.parse(text) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    },
  };
}
