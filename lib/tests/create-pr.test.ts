import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGithub = vi.fn();
vi.mock("@/lib/github/client", () => ({
  githubFetch: () => mockGithub,
}));

import { createBatchPR } from "../github/create-pr";

const baseOptions = {
  owner: "zakdev",
  repo: "patchboard",
  accessToken: "token",
  packages: [{ name: "react", currentVersion: "18.0.0", latestVersion: "19.0.0" }],
};

const setupMocks = (packageJsonDeps = {}) => {
  mockGithub
    .mockResolvedValueOnce({ default_branch: "main" })
    .mockResolvedValueOnce({ object: { sha: "abc123" } })
    .mockResolvedValueOnce(undefined)
    .mockResolvedValueOnce({
      sha: "file-sha",
      content: Buffer.from(
        JSON.stringify({
          dependencies: { react: "^18.0.0", ...packageJsonDeps },
        }),
      ).toString("base64"),
    })
    .mockResolvedValueOnce(undefined)
    .mockResolvedValueOnce({ html_url: "https://github.com/zakdev1/patchboard/pull/1" });
};

describe("createBatchPR", () => {
  beforeEach(() => mockGithub.mockReset());

  it("returns the PR url on success", async () => {
    setupMocks();
    const url = await createBatchPR(baseOptions);
    expect(url).toBe("https://github.com/zakdev1/patchboard/pull/1");
  });

  it("preserves ^ prefix when updating version", async () => {
    setupMocks();
    await createBatchPR(baseOptions);

    const putCall = mockGithub.mock.calls[4];
    const body = JSON.parse(putCall[1].body);
    const content = JSON.parse(Buffer.from(body.content, "base64").toString());
    expect(content.dependencies.react).toBe("^19.0.0");
  });

  it("updates devDependencies when package is not in dependencies", async () => {
    mockGithub
      .mockResolvedValueOnce({ default_branch: "main" })
      .mockResolvedValueOnce({ object: { sha: "abc123" } })
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({
        sha: "file-sha",
        content: Buffer.from(
          JSON.stringify({
            dependencies: {},
            devDependencies: { react: "~18.0.0" },
          }),
        ).toString("base64"),
      })
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({
        html_url: "https://github.com/zakdev1/patchboard/pull/1",
      });

    await createBatchPR(baseOptions);

    const putCall = mockGithub.mock.calls[4];
    const body = JSON.parse(putCall[1].body);
    const content = JSON.parse(Buffer.from(body.content, "base64").toString());
    expect(content.devDependencies.react).toBe("~19.0.0");
  });

  it("deletes branch and rethrows if PR creation fails", async () => {
    mockGithub
      .mockResolvedValueOnce({ default_branch: "main" })
      .mockResolvedValueOnce({ object: { sha: "abc123" } })
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({
        sha: "file-sha",
        content: Buffer.from(
          JSON.stringify({
            dependencies: { react: "^18.0.0" },
          }),
        ).toString("base64"),
      })
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("GitHub API error"))
      .mockResolvedValueOnce(undefined);

    await expect(createBatchPR(baseOptions)).rejects.toThrow("GitHub API error");

    const lastCall = mockGithub.mock.calls.at(-1);
    expect(lastCall?.[0]).toContain("git/refs/heads");
    expect(lastCall?.[1]).toEqual({ method: "DELETE" });
  });

  it("includes all packages in PR body table", async () => {
    const options = {
      ...baseOptions,
      packages: [
        { name: "react", currentVersion: "18.0.0", latestVersion: "19.0.0" },
        { name: "typescript", currentVersion: "4.0.0", latestVersion: "5.0.0" },
      ],
    };
    mockGithub
      .mockResolvedValueOnce({ default_branch: "main" })
      .mockResolvedValueOnce({ object: { sha: "abc123" } })
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({
        sha: "file-sha",
        content: Buffer.from(
          JSON.stringify({
            dependencies: { react: "^18.0.0", typescript: "^4.0.0" },
          }),
        ).toString("base64"),
      })
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ html_url: "https://github.com/zakdev/patchboard/pull/1" });

    await createBatchPR(options);

    const prCall = mockGithub.mock.calls[5];
    const body = JSON.parse(prCall[1].body);
    expect(body.body).toContain("react");
    expect(body.body).toContain("typescript");
    expect(body.title).toBe("chore: update 2 dependencies");
  });
});
