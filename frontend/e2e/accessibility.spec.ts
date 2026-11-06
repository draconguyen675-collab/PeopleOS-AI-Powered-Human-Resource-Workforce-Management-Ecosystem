import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("implemented screens pass automated WCAG A/AA checks in both themes", async ({
  page,
}) => {
  const failures: unknown[] = [];
  await page.goto("/auth/login");
  await expect(
    page.getByRole("heading", { name: "Welcome back." }),
  ).toBeVisible();
  const loginScan = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  failures.push(
    ...loginScan.violations.map((item) => ({
      route: "login",
      id: item.id,
      nodes: item.nodes.map((node) => ({
        target: node.target,
        summary: node.failureSummary,
      })),
    })),
  );
  await page.getByLabel("Work email").fill("owner@example.test");
  await page
    .getByLabel("Password", { exact: true })
    .fill(process.env.OWNER_PASSWORD ?? process.env.DEMO_PASSWORD ?? "");
  await page.getByRole("button", { name: "Sign in to your workspace" }).click();
  await expect(
    page.getByRole("heading", { name: "Hello, Alex." }),
  ).toBeVisible();
  for (const theme of ["light", "dark"]) {
    await page
      .getByRole("button", { name: `${theme} theme`, exact: true })
      .click();
    const directory = (await (
      await page.request.get("/api/v1/employees?size=1")
    ).json()) as { items: { id: string }[] };
    const employeeId = directory.items[0].id;
    for (const route of [
      "/app/dashboard",
      "/app/people/employees",
      "/app/people/departments",
      "/app/people/positions",
      "/app/settings/company",
      "/app/settings/roles",
      "/app/settings/audit",
      "/app/settings/security",
      "/app/people/employees/new",
      `/app/people/employees/${employeeId}`,
      `/app/people/employees/${employeeId}/edit`,
    ]) {
      await page.goto(route);
      await expect(page.locator("main h1")).toBeVisible();
      await expect(page.getByText("Loading your workspace…")).toHaveCount(0);
      const scan = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      failures.push(
        ...scan.violations.map((item) => ({
          route: `${theme}: ${route}`,
          id: item.id,
          nodes: item.nodes.map((node) => ({
            target: node.target,
            summary: node.failureSummary,
          })),
        })),
      );
    }
  }
  expect(failures).toEqual([]);
});

test("unsaved company edits survive canceled navigation including browser back", async ({
  page,
}) => {
  await page.goto("/auth/login");
  await page.getByLabel("Work email").fill("owner@example.test");
  await page
    .getByLabel("Password", { exact: true })
    .fill(process.env.OWNER_PASSWORD ?? process.env.DEMO_PASSWORD ?? "");
  await page.getByRole("button", { name: "Sign in to your workspace" }).click();
  await expect(
    page.getByRole("heading", { name: "Hello, Alex." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Company", exact: true }).click();
  await page.getByLabel("Company name").fill("Unsaved draft");
  const firstDialog = page.waitForEvent("dialog");
  const firstNavigation = page
    .getByRole("link", { name: "Overview", exact: true })
    .click();
  const leavePrompt = await firstDialog;
  expect(leavePrompt.message()).toContain("discard your unsaved changes");
  await leavePrompt.dismiss();
  await firstNavigation;
  await expect(page).toHaveURL(/\/settings\/company/);
  await expect(page.getByLabel("Company name")).toHaveValue("Unsaved draft");
  const backDialog = page.waitForEvent("dialog");
  const backNavigation = page.goBack();
  const backPrompt = await backDialog;
  expect(backPrompt.message()).toContain("discard your unsaved changes");
  await backPrompt.dismiss();
  await backNavigation;
  await expect(page).toHaveURL(/\/settings\/company/);
  await expect(page.getByLabel("Company name")).toHaveValue("Unsaved draft");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.getByRole("link", { name: "Overview", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Hello, Alex." }),
  ).toBeVisible();
});
