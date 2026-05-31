import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/github/fetch-package-json", () => ({
  fetchPackageJson: vi.fn(),
}));
vi.mock("@/lib/npm/fetch-versions", () => ({
  fetchLatestVersion: vi.fn(),
  fetchRepositoryUrl: vi.fn(),
}));
vi.mock("@/lib/db", () => ({
  default: vi.fn(),
}));

import { createSnapshot } from "@/lib/snapshots/create-snapshot";
import { fetchPackageJson } from "@/lib/github/fetch-package-json";
import { fetchLatestVersion, fetchRepositoryUrl } from "@/lib/npm/fetch-versions";
import sql from "@/lib/db";

const mockSql = sql as unknown as ReturnType<typeof vi.fn>;
const mockFetchPackageJson = vi.mocked(fetchPackageJson);
const mockFetchLatestVersion = vi.mocked(fetchLatestVersion);
const mockFetchRepositoryUrl = vi.mocked(fetchRepositoryUrl);

describe("createSnapshot", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    mockSql.mockResolvedValueOnce([{ id: "snap-1" }] as any);
    mockFetchRepositoryUrl.mockResolvedValue("https://github.com/facebook/react");
  });

  it("filters out packages where current equals latest", async () => {
    mockFetchPackageJson.mockResolvedValue({
      dependencies: { react: "19.0.0" },
    } as any);
    mockFetchLatestVersion.mockResolvedValue("19.0.0");
    mockSql.mockResolvedValueOnce([]);

    const result = await createSnapshot("proj-1", "zakdev", "patchboard", "token");
    expect(result.packages).toHaveLength(0);
  });

  it("correctly identifies major version bumps", async () => {
    mockFetchPackageJson.mockResolvedValue({
      dependencies: { react: "^18.0.0" },
    } as any);
    mockFetchLatestVersion.mockResolvedValue("19.0.0");
    mockSql.mockResolvedValueOnce([]);

    const result = await createSnapshot("proj-1", "zakdev", "patchboard", "token");
    expect(result.packages[0].isMajor).toBe(true);
  });

  it("correctly identifies non-major version bumps", async () => {
    mockFetchPackageJson.mockResolvedValue({
      dependencies: { react: "^18.0.0" },
    } as any);
    mockFetchLatestVersion.mockResolvedValue("18.3.0");
    mockSql.mockResolvedValueOnce([]);

    const result = await createSnapshot("proj-1", "zakdev", "patchboard", "token");
    expect(result.packages[0].isMajor).toBe(false);
  });

  it("does not crash when individual package fetch fails", async () => {
    mockFetchPackageJson.mockResolvedValue({
      dependencies: { react: "^18.0.0", broken: "^1.0.0" },
    } as any);
    mockFetchLatestVersion.mockResolvedValueOnce("19.0.0").mockRejectedValueOnce(new Error("npm registry down"));
    mockSql.mockResolvedValueOnce([]);

    const result = await createSnapshot("proj-1", "zakdev", "patchboard", "token");
    expect(result.packages).toHaveLength(1);
    expect(result.packages[0].name).toBe("react");
  });

  it("merges dependencies and devDependencies", async () => {
    mockFetchPackageJson.mockResolvedValue({
      dependencies: { react: "^18.0.0" },
      devDependencies: { vitest: "^1.0.0" },
    } as any);
    mockFetchLatestVersion.mockResolvedValue("99.0.0");
    mockSql.mockResolvedValueOnce([]);

    const result = await createSnapshot("proj-1", "zakdev", "patchboard", "token");
    const names = result.packages.map((p) => p.name);
    expect(names).toContain("react");
    expect(names).toContain("vitest");
  });
});
