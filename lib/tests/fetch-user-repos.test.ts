import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGithub = vi.fn();
vi.mock("@/lib/github/client", () => ({
  githubFetch: () => mockGithub,
}));

import { fetchUserRepos } from "../github/fetch-user-repos";

const makeRepo = (overrides = {}) => ({
  id: 1,
  full_name: "zakdev/patchboard",
  owner: { login: "zakdev" },
  name: "patchboard",
  private: false,
  updated_at: "2026-05-31T00:00:00Z",
  ...overrides,
});

describe("fetchUserRepos", () => {
  beforeEach(() => mockGithub.mockReset());

  it("maps raw GitHub response to clean shape", async () => {
    mockGithub.mockResolvedValue([makeRepo()]);
    const result = await fetchUserRepos("token");
    expect(result[0]).toEqual({
      id: 1,
      fullName: "zakdev/patchboard",
      owner: "zakdev",
      name: "patchboard",
      private: false,
      updatedAt: "2026-05-31T00:00:00Z",
    });
  });

  it("returns empty array when no repos", async () => {
    mockGithub.mockResolvedValue([]);
    const result = await fetchUserRepos("token");
    expect(result).toEqual([]);
  });
});
