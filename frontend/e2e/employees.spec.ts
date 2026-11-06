import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("HR creates, edits, resolves conflicts, archives and restores a work profile", async ({
  page,
}) => {
  const suffix = Date.now().toString();
  const name = `QA Employee ${suffix}`;
  const email = `qa-${suffix}@example.test`;
  let employeeId = "";
  await page.goto("/auth/login");
  await page.getByLabel("Work email").fill("hr@example.test");
  await page
    .getByLabel("Password", { exact: true })
    .fill(process.env.DEMO_PASSWORD ?? "");
  await page.getByRole("button", { name: "Sign in to your workspace" }).click();
  await expect(page).toHaveURL(/\/app\/dashboard/);
  try {
    await page
      .getByRole("link", { name: "People directory", exact: true })
      .click();
    await page.getByRole("link", { name: "Add employee", exact: true }).click();
    await page
      .getByLabel("Employee number", { exact: true })
      .fill(`QA-${suffix}`);
    await page.getByLabel("Full name", { exact: true }).fill(name);
    await page.getByLabel("Work email", { exact: true }).fill("invalid");
    await page.getByLabel("Position", { exact: true }).fill("QA Engineer");
    await page.getByLabel("Location", { exact: true }).fill("Hanoi");
    await page
      .getByLabel("Department", { exact: true })
      .selectOption({ label: "Engineering" });
    await page.getByRole("button", { name: "Create employee" }).click();
    await expect(page.getByText("Enter a valid work email.")).toBeVisible();
    await page.getByLabel("Work email", { exact: true }).fill(email);
    await page.getByRole("button", { name: "Create employee" }).click();
    await expect(
      page.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
    employeeId = page.url().split("/").at(-1)!;
    await expect(page.locator(".audit-list")).toContainText(
      "Created employee work profile",
    );
    await page.getByRole("link", { name: "Edit profile", exact: true }).click();
    await page
      .getByLabel("Position", { exact: true })
      .fill("Senior QA Engineer");
    // A concurrent write makes the open editor stale; the user's draft must survive the conflict.
    const initial = (await (
      await page.request.get(`/api/v1/employees/${employeeId}`)
    ).json()) as { version: number };
    const csrf = (await (
      await page.request.get("/api/v1/auth/csrf")
    ).json()) as { token: string; headerName: string };
    const details = (await (
      await page.request.get(`/api/v1/employees/${employeeId}`)
    ).json()) as Record<string, unknown>;
    const response = await page.request.patch(
      `/api/v1/employees/${employeeId}`,
      {
        headers: { [csrf.headerName]: csrf.token },
        data: {
          version: initial.version,
          details: { ...details, location: "Ho Chi Minh City" },
        },
      },
    );
    expect(response.status()).toBe(200);
    await page.getByRole("button", { name: "Save employee" }).click();
    await expect(page.getByRole("alert")).toContainText(
      "This employee changed.",
    );
    await expect(page.getByLabel("Position", { exact: true })).toHaveValue(
      "Senior QA Engineer",
    );
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Reload latest profile" }).click();
    await expect(page.getByLabel("Location", { exact: true })).toHaveValue(
      "Ho Chi Minh City",
    );
    await page
      .getByLabel("Position", { exact: true })
      .fill("Senior QA Engineer");
    await page.getByRole("button", { name: "Save employee" }).click();
    await expect(page.getByRole("status")).toHaveText(
      "Employee profile saved.",
    );
    await page.getByRole("link", { name: "Back", exact: true }).click();
    await expect(page.locator(".employee-detail-grid")).toContainText(
      "Senior QA Engineer",
    );
    await page.reload();
    await expect(page.locator(".employee-detail-grid")).toContainText(
      "Senior QA Engineer",
    );
    await page.setViewportSize({ width: 375, height: 812 });
    await page
      .getByRole("button", { name: "Archive employee", exact: true })
      .click();
    let dialog = page.getByRole("dialog");
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Archive employee", exact: true }),
    ).toBeFocused();
    await page
      .getByRole("button", { name: "Archive employee", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Confirm archive" })
      .click();
    await expect(
      page.getByText("Archived profile", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Edit profile", exact: true }),
    ).toHaveCount(0);
    await page.getByRole("link", { name: "Directory", exact: true }).click();
    await expect(page.getByLabel("Profile visibility")).toHaveValue("true");
    await page.getByLabel("Search employee directory").fill(email);
    await page
      .getByRole("button", { name: "Search", exact: true })
      .last()
      .click();
    await page
      .locator(".mobile-employee-list")
      .getByRole("link", { name, exact: true })
      .click();
    await page
      .getByRole("button", { name: "Restore employee", exact: true })
      .click();
    dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "Confirm restore" }).click();
    await expect(
      page.getByText("Current profile", { exact: true }),
    ).toBeVisible();
    await expect(page.locator(".audit-list")).toContainText(
      "Restored employee work profile",
    );
    await page.screenshot({
      path: test.info().outputPath("employee-mobile.png"),
      fullPage: true,
    });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.screenshot({
      path: test.info().outputPath("employee-desktop.png"),
      fullPage: true,
    });
  } finally {
    // Keep the real reversible archive behavior; never erase unrelated demo or user-created employees.
    if (employeeId) {
      const profile = await page.request.get(`/api/v1/employees/${employeeId}`);
      if (profile.ok()) {
        const employee = (await profile.json()) as {
          version: number;
          archivedAt: string | null;
        };
        if (!employee.archivedAt) {
          const csrf = (await (
            await page.request.get("/api/v1/auth/csrf")
          ).json()) as { token: string; headerName: string };
          const archived = await page.request.delete(
            `/api/v1/employees/${employeeId}?version=${employee.version}`,
            { headers: { [csrf.headerName]: csrf.token } },
          );
          expect(archived.status()).toBe(200);
        }
      }
    }
  }
});
