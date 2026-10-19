import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function login(
  page: Page,
  email = "owner@example.test",
  workspace = "novatech",
) {
  const password = process.env.DEMO_PASSWORD;
  if (!password)
    throw new Error(
      "Set DEMO_PASSWORD to the demo instance password before running browser tests.",
    );
  await page.goto("/auth/login");
  await page.getByLabel("Workspace", { exact: true }).fill(workspace);
  await page.getByLabel("Work email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in to your workspace" }).click();
  await expect(
    page.getByRole("heading", { name: "Hello, Alex." }),
  ).toBeVisible();
}

test("owner searches people, edits company, sees audit, and signs out", async ({
  page,
}) => {
  await login(page);
  await expect(page.locator(".metric-value").first()).toHaveText("120");
  await page
    .getByRole("link", { name: "People directory", exact: true })
    .click();
  await expect(page.locator("tbody tr")).toHaveCount(12);
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.locator(".table-pagination")).toContainText("13–24 of 120");
  await page
    .getByRole("textbox", { name: "Search employee directory" })
    .fill("Linh Nguyen");
  await page
    .getByRole("button", { name: "Search", exact: true })
    .last()
    .click();
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(page.locator("tbody")).toContainText("Linh Nguyen");
  await page
    .getByRole("textbox", { name: "Search people globally" })
    .fill("Minh Nguyen");
  await page
    .getByRole("textbox", { name: "Search people globally" })
    .press("Enter");
  await expect(
    page.getByRole("textbox", { name: "Search employee directory" }),
  ).toHaveValue("Minh Nguyen");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(page.locator("tbody")).toContainText("Minh Nguyen");
  await page.getByRole("link", { name: "Company", exact: true }).click();
  const name = page.getByLabel("Company name");
  const original = await name.inputValue();
  await name.fill("NovaTech browser verified");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("status")).toHaveText("Company settings saved.");
  await page.reload();
  await expect(name).toHaveValue("NovaTech browser verified");
  await name.fill(original);
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("status")).toHaveText("Company settings saved.");
  await page
    .getByRole("link", { name: "Activity & audit", exact: true })
    .click();
  await expect(page.locator(".audit-list")).toContainText(
    "Updated company name, timezone or currency",
  );
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/\/auth\/login/);
  await page.goto("/app/dashboard");
  await expect(page).toHaveURL(/\/auth\/login/);
});

test("viewer UI and API enforce permissions", async ({ page }) => {
  await page.goto("/auth/login");
  await page.getByLabel("Work email").fill("viewer@example.test");
  await page
    .getByLabel("Password", { exact: true })
    .fill(process.env.DEMO_PASSWORD ?? "");
  await page.getByRole("button", { name: "Sign in to your workspace" }).click();
  await expect(
    page.getByRole("heading", { name: "Hello, Jamie." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "People directory" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Activity & audit" }),
  ).toHaveCount(0);
  await page.getByRole("link", { name: "Company", exact: true }).click();
  await expect(page.getByLabel("Company name")).toBeDisabled();
  await expect(page.getByRole("button", { name: "Save changes" })).toHaveCount(
    0,
  );
  expect((await page.request.get("/api/v1/employees")).status()).toBe(403);
});

test("tenant separation persists across a full browser login", async ({
  page,
}) => {
  await login(page, "owner@example.test", "orbit");
  await expect(page.locator(".metric-value").first()).toHaveText("8");
  await page
    .getByRole("link", { name: "People directory", exact: true })
    .click();
  await expect(page.locator("tbody tr")).toHaveCount(8);
  await expect(page.locator("tbody")).not.toContainText(
    "novatech.example.test",
  );
});

test("all screens fit required viewports and theme persists", async ({
  page,
}) => {
  await login(page);
  await page.getByRole("button", { name: "dark theme", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "light theme", exact: true }).click();
  const routes = [
    "/app/dashboard",
    "/app/people/employees",
    "/app/settings/company",
    "/app/settings/roles",
    "/app/settings/audit",
    "/app/settings/security",
  ];
  for (const width of [320, 375, 390, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator("main h1")).toBeVisible();
      await expect(page.getByText("Loading your workspace…")).toHaveCount(0);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      );
      expect(overflow, `${route} overflows at ${width}px`).toBe(false);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Open navigation" }),
  ).toBeFocused();
});

test("login is usable at mobile width and invalid credentials are explained", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/auth/login");
  await page.getByLabel("Work email").fill("owner@example.test");
  await page.getByLabel("Password", { exact: true }).fill("incorrect-password");
  await page.getByRole("button", { name: "Sign in to your workspace" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Workspace, email or password is incorrect.",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
});

test("account sessions support canceling and revoking another browser sign-in", async ({
  page,
  browser,
}) => {
  await login(page);
  const secondContext = await browser.newContext({
    baseURL: new URL(page.url()).origin,
  });
  try {
    const second = await secondContext.newPage();
    await login(second);
    const response = await second.request.get("/api/v1/auth/sessions?size=100");
    expect(response.status()).toBe(200);
    const body = (await response.json()) as {
      items: { id: string; current: boolean }[];
    };
    const target = body.items.find((item) => item.current);
    expect(target).toBeDefined();
    await page
      .getByRole("link", { name: "Sign-in sessions", exact: true })
      .click();
    await expect(page.getByText("Loading your workspace…")).toHaveCount(0);
    await expect(page.locator(`[data-session-id="${target!.id}"]`)).toBeVisible();
    await page.screenshot({
      path: test.info().outputPath("sessions-desktop.png"),
      fullPage: true,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    const row = page.locator(`[data-session-id="${target!.id}"]`);
    const revoke = row.getByRole("button", { name: "Revoke session" });
    await revoke.click();
    const dialog = page.getByRole("dialog", { name: "Revoke this session?" });
    await expect(dialog).toBeVisible();
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.screenshot({
      path: test.info().outputPath("session-confirmation-mobile.png"),
      fullPage: true,
    });
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(revoke).toBeFocused();
    expect((await second.request.get("/api/v1/auth/me")).status()).toBe(200);
    await revoke.click();
    const endpoint = `**/api/v1/auth/sessions/${target!.id}`;
    await page.route(endpoint, (route) => route.abort("failed"));
    await dialog.getByRole("button", { name: "Confirm revocation" }).click();
    await expect(dialog.getByRole("alert")).toContainText(
      "Cannot reach PeopleOS",
    );
    expect((await second.request.get("/api/v1/auth/me")).status()).toBe(200);
    await page.unroute(endpoint);
    await dialog.getByRole("button", { name: "Confirm revocation" }).click();
    await expect(page.getByRole("status")).toHaveText(
      "Session revoked. That session must sign in again.",
    );
    await expect(row).toHaveCount(0);
    expect((await page.request.get("/api/v1/auth/me")).status()).toBe(200);
    expect((await second.request.get("/api/v1/auth/me")).status()).toBe(401);
    await second.goto("/app/dashboard");
    await expect(second).toHaveURL(/\/auth\/login/);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page
      .getByRole("link", { name: "Activity & audit", exact: true })
      .click();
    await expect(page.locator(".audit-list")).toContainText(
      "Revoked another sign-in session",
    );
  } finally {
    await secondContext.close();
  }
});
