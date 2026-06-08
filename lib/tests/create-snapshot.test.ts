import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/github/fetch-package-json", () => ({
  fetchPackageJson: vi.fn(),
}));

vi.mock("@/lib/npm/fetch-versions", () => ({
  fetchLatestVersion: vi.fn(),
  fetchRepositoryUrl: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "550e8400-e29b-41d4-a716-446655440000" } },
      }),
    },
  })),
}));

vi.mock("@/db", () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi
          .fn()
          .mockResolvedValue([{ id: "550e8400-e29b-41d4-a716-446655440000" }]),
      })),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn().mockResolvedValue([{ plan: "pro", count: 0 }]),
      })),
    })),
  },
}));

import { createSnapshot } from "@/lib/snapshots/create-snapshot";
import { fetchPackageJson } from "@/lib/github/fetch-package-json";
import {
  fetchLatestVersion,
  fetchRepositoryUrl,
} from "@/lib/npm/fetch-versions";

const mockFetchPackageJson = vi.mocked(fetchPackageJson);
const mockFetchLatestVersion = vi.mocked(fetchLatestVersion);
const mockFetchRepositoryUrl = vi.mocked(fetchRepositoryUrl);

describe("createSnapshot", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    mockFetchRepositoryUrl.mockResolvedValue(
      "https://github.com/facebook/react",
    );
  });

  it("filters out packages where current equals latest", async () => {
    mockFetchPackageJson.mockResolvedValue({
      dependencies: { react: "19.0.0" },
    } as any);
    mockFetchLatestVersion.mockResolvedValue("19.0.0");

    const result = await createSnapshot(
      "proj-1",
      "zakdev",
      "patchboard",
      "token",
    );
    expect(result.packages).toHaveLength(0);
  });

  it("correctly identifies major version bumps", async () => {
    mockFetchPackageJson.mockResolvedValue({
      dependencies: { react: "^18.0.0" },
    } as any);
    mockFetchLatestVersion.mockResolvedValue("19.0.0");

    const result = await createSnapshot(
      "proj-1",
      "zakdev",
      "patchboard",
      "token",
    );
    expect(result.packages[0].isMajor).toBe(true);
  });

  it("correctly identifies non-major version bumps", async () => {
    mockFetchPackageJson.mockResolvedValue({
      dependencies: { react: "^18.0.0" },
    } as any);
    mockFetchLatestVersion.mockResolvedValue("18.3.0");

    const result = await createSnapshot(
      "proj-1",
      "zakdev",
      "patchboard",
      "token",
    );
    expect(result.packages[0].isMajor).toBe(false);
  });

  it("does not crash when individual package fetch fails", async () => {
    mockFetchPackageJson.mockResolvedValue({
      dependencies: { react: "^18.0.0", broken: "^1.0.0" },
    } as any);
    mockFetchLatestVersion
      .mockResolvedValueOnce("19.0.0")
      .mockRejectedValueOnce(new Error("npm registry down"));

    const result = await createSnapshot(
      "proj-1",
      "zakdev",
      "patchboard",
      "token",
    );
    expect(result.packages).toHaveLength(1);
    expect(result.packages[0].name).toBe("react");
  });

  it("merges dependencies and devDependencies", async () => {
    mockFetchPackageJson.mockResolvedValue({
      dependencies: { react: "^18.0.0" },
      devDependencies: { vitest: "^1.0.0" },
    } as any);
    mockFetchLatestVersion.mockResolvedValue("99.0.0");

    const result = await createSnapshot(
      "proj-1",
      "zakdev",
      "patchboard",
      "token",
    );
    const names = result.packages.map((p) => p.name);
    expect(names).toContain("react");
    expect(names).toContain("vitest");
  });
});
