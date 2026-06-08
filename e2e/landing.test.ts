import { test, expect } from "@playwright/test";

test("landing page loads and sign in button is visible", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Dependency updates")).toBeVisible();
  await expect(page.getByText("Sign in with GitHub")).toBeVisible();
});

test("landing page has docs link in nav", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Docs" })).toBeVisible();
});

test("dashboard redirects unauthenticated users to login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/login/);
});

test("docs site loads correctly", async ({ page }) => {
  await page.goto("/docs");
  await expect(
    page.getByRole("heading", { name: "Introduction" }),
  ).toBeVisible();
  await expect(page.getByText("What is Patchboard?")).toBeVisible();
});
