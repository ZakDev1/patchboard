import { githubFetch } from "./client";

interface PackageUpdate {
  name: string;
  currentVersion: string;
  latestVersion: string;
}

interface CreateBatchPROptions {
  owner: string;
  repo: string;
  packages: PackageUpdate[];
  accessToken: string;
}

export async function createBatchPR({ owner, repo, packages, accessToken }: CreateBatchPROptions): Promise<string> {
  const github = githubFetch(accessToken);

  const repoData = await github(`/repos/${owner}/${repo}`);
  const defaultBranch = repoData.default_branch;

  const refData = await github(`/repos/${owner}/${repo}/git/ref/heads/${defaultBranch}`);
  const sha = refData.object.sha;

  const timestamp = Date.now();
  const branchName = `patchboard/batch-update-${timestamp}`;

  await github(`/repos/${owner}/${repo}/git/refs`, {
    method: "POST",
    body: JSON.stringify({
      ref: `refs/heads/${branchName}`,
      sha,
    }),
  });

  try {
    const fileData = await github(`/repos/${owner}/${repo}/contents/package.json?ref=${defaultBranch}`);
    const fileSha = fileData.sha;
    const packageJson = JSON.parse(Buffer.from(fileData.content, "base64").toString("utf-8"));

    for (const pkg of packages) {
      const updateDep = (deps: Record<string, string>) => {
        if (!deps?.[pkg.name]) return deps;
        const prefix = deps[pkg.name].match(/[\^~]/);
        deps[pkg.name] = prefix ? `${prefix[0]}${pkg.latestVersion}` : pkg.latestVersion;
        return deps;
      };

      if (packageJson.dependencies?.[pkg.name]) {
        packageJson.dependencies = updateDep(packageJson.dependencies);
      } else if (packageJson.devDependencies?.[pkg.name]) {
        packageJson.devDependencies = updateDep(packageJson.devDependencies);
      }
    }

    const updatedContent = Buffer.from(JSON.stringify(packageJson, null, 2) + "\n").toString("base64");

    await github(`/repos/${owner}/${repo}/contents/package.json`, {
      method: "PUT",
      body: JSON.stringify({
        message: `chore: update ${packages.length} dependenc${packages.length === 1 ? "y" : "ies"}`,
        content: updatedContent,
        sha: fileSha,
        branch: branchName,
      }),
    });

    const table = [
      "| Package | From | To |",
      "|---|---|---|",
      ...packages.map((p) => `| \`${p.name}\` | \`${p.currentVersion}\` | \`${p.latestVersion}\` |`),
    ].join("\n");

    const prData = await github(`/repos/${owner}/${repo}/pulls`, {
      method: "POST",
      body: JSON.stringify({
        title: `chore: update ${packages.length} dependenc${packages.length === 1 ? "y" : "ies"}`,
        body: `Automated dependency update opened by Patchboard.\n\n${table}`,
        head: branchName,
        base: defaultBranch,
      }),
    });

    return prData.html_url;
  } catch (err) {
    await github(`repos/${owner}/${repo}/git/refs/heads/${branchName}`, { method: "DELETE" });
    throw err;
  }
}
