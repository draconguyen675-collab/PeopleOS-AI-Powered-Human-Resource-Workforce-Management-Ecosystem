import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("HR manages parent-child departments and cannot delete linked departments", async ({
  page,
}) => {
  const suffix = Date.now().toString();
  const parent = `QA Parent ${suffix}`;
  const child = `QA Child ${suffix}`;
  const updatedChild = `QA Updated ${suffix}`;
  const created: string[] = [];
  await page.goto("/auth/login");
  await page.getByLabel("Work email").fill("hr@example.test");
  await page
    .getByLabel("Password", { exact: true })
    .fill(process.env.DEMO_PASSWORD ?? "");
  await page.getByRole("button", { name: "Sign in to your workspace" }).click();
  await expect(page).toHaveURL(/\/app\/dashboard/);
  try {
    await page.getByRole("link", { name: "Departments", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Delete Engineering", exact: true }),
    ).toBeDisabled();
    await page
      .getByRole("button", { name: "Add department", exact: true })
      .click();
    await page.getByLabel("Department name", { exact: true }).fill(parent);
    await page
      .getByLabel("Description", { exact: true })
      .fill("Browser verification team");
    const firstCreate = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/v1/organization/departments") &&
        response.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Save department" }).click();
    const parentResult = await firstCreate;
    expect(parentResult.status()).toBe(201);
    const parentRecord = (await parentResult.json()) as { id: string };
    created.push(parentRecord.id);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page
      .getByRole("button", { name: "Add department", exact: true })
      .click();
    await page.getByLabel("Department name", { exact: true }).fill(child);
    await page
      .getByLabel("Parent department", { exact: true })
      .selectOption({ label: parent });
    const secondCreate = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/v1/organization/departments") &&
        response.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Save department" }).click();
    const childResult = await secondCreate;
    expect(childResult.status()).toBe(201);
    const childRecord = (await childResult.json()) as { id: string };
    created.push(childRecord.id);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: `Delete ${parent}`, exact: true }),
    ).toBeDisabled();
    await page
      .getByRole("button", { name: `Edit ${parent}`, exact: true })
      .click();
    await page
      .getByLabel("Parent department", { exact: true })
      .selectOption({ label: child });
    await page.getByRole("button", { name: "Save department" }).click();
    await expect(page.getByRole("dialog").getByRole("alert")).toContainText(
      "cannot report to itself or its descendants",
    );
    await page
      .getByLabel("Parent department", { exact: true })
      .selectOption("");
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Cancel", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: `Edit ${parent}`, exact: true }),
    ).toBeFocused();
    await page
      .getByRole("button", { name: `Edit ${child}`, exact: true })
      .click();
    await page.setViewportSize({ width: 320, height: 740 });
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page
      .getByLabel("Department name", { exact: true })
      .fill(updatedChild);
    await page.getByRole("button", { name: "Save department" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page
      .getByLabel("Filter by parent department")
      .selectOption(parentRecord.id);
    await expect(page.locator(".department-card")).toHaveCount(1);
    await expect(
      page.getByRole("heading", { name: updatedChild, exact: true }),
    ).toBeVisible();
    await page.screenshot({
      path: test.info().outputPath("departments-mobile.png"),
      fullPage: true,
    });
    await page
      .getByRole("button", { name: `Delete ${updatedChild}`, exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Cancel", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: `Delete ${updatedChild}`, exact: true }),
    ).toBeFocused();
    await expect(
      page.getByRole("heading", { name: updatedChild, exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: `Delete ${updatedChild}`, exact: true })
      .click();
    await page.getByRole("button", { name: "Confirm deletion" }).click();
    await expect(
      page.getByRole("heading", { name: "No departments found" }),
    ).toBeVisible();
    await page.getByLabel("Filter by parent department").selectOption("");
    await page
      .getByRole("button", { name: `Delete ${parent}`, exact: true })
      .click();
    await page.getByRole("button", { name: "Confirm deletion" }).click();
    await expect(
      page.getByRole("heading", { name: parent, exact: true }),
    ).toHaveCount(0);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.screenshot({
      path: test.info().outputPath("departments-desktop.png"),
      fullPage: true,
    });
  } finally {
    for (const id of created.reverse()) {
      const response = await page.request.get(
        `/api/v1/organization/departments/${id}`,
      );
      if (response.ok()) {
        const record = (await response.json()) as { version: number };
        const csrf = (await (
          await page.request.get("/api/v1/auth/csrf")
        ).json()) as { headerName: string; token: string };
        expect(
          (
            await page.request.delete(
              `/api/v1/organization/departments/${id}?version=${record.version}`,
              { headers: { [csrf.headerName]: csrf.token } },
            )
          ).status(),
        ).toBe(204);
      }
    }
  }
});
