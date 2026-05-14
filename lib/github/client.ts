export function githubFetch(accessToken: string) {
  return async (path: string, options: RequestInit = {}) => {
    const res = await fetch(`https://api.github.com${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message ?? `Github API error: ${res.status} ${path}`);
    }

    return res.json();
  };
}
