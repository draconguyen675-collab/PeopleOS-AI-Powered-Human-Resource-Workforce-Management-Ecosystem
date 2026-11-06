import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import type { EmployeeDetail, PositionDetail } from "../src/types/api";

test("HR manages catalog revisions and employee position links", async ({
  page,
}) => {
  const suffix = Date.now().toString();
  const code = `QA-${suffix}`;
  let positionId = "";
  let employeeId = "";
  await page.goto("/auth/login");
  await page.getByLabel("Work email").fill("hr@example.test");
  await page
    .getByLabel("Password", { exact: true })
    .fill(process.env.DEMO_PASSWORD ?? "");
  await page.getByRole("button", { name: "Sign in to your workspace" }).click();
  await expect(page).toHaveURL(/\/app\/dashboard/);
  const token = (await (
    await page.request.get("/api/v1/auth/csrf")
  ).json()) as { token: string; headerName: string };
  const headers = { [token.headerName]: token.token };
  try {
    await page.getByRole("link", { name: "Positions", exact: true }).click();
    await page
      .getByRole("button", { name: "Add position", exact: true })
      .click();
    await page.getByLabel("Position code", { exact: true }).fill("!!!");
    await page
      .getByLabel("Position title", { exact: true })
      .fill(`QA Role ${suffix}`);
    await page.getByRole("button", { name: "Save position" }).click();
    await expect(
      page.getByText("Use letters, numbers, dots, hyphens or underscores."),
    ).toBeVisible();
    await page
      .getByLabel("Position code", { exact: true })
      .fill(code.toLowerCase());
    const created = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/v1/organization/positions") &&
        response.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Save position" }).click();
    const response = await created;
    expect(response.status()).toBe(201);
    const position = (await response.json()) as PositionDetail;
    positionId = position.id;
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page
      .getByRole("button", { name: `Edit ${code}`, exact: true })
      .click();
    await page
      .getByLabel("Position title", { exact: true })
      .fill(`QA Draft ${suffix}`);
    expect(
      (
        await page.request.patch(
          `/api/v1/organization/positions/${positionId}`,
          {
            headers,
            data: {
              version: position.version,
              details: {
                code,
                title: `QA Concurrent ${suffix}`,
                description: "Concurrent update",
              },
            },
          },
        )
      ).status(),
    ).toBe(200);
    await page.getByRole("button", { name: "Save position" }).click();
    await expect(page.getByRole("dialog").getByRole("alert")).toContainText(
      "This position changed.",
    );
    await expect(
      page.getByLabel("Position title", { exact: true }),
    ).toHaveValue(`QA Draft ${suffix}`);
    page.once("dialog", (dialog) => dialog.accept());
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Cancel", exact: true })
      .click();
    await page.getByRole("button", { name: "Refresh", exact: true }).click();
    await expect(
      page.getByRole("heading", {
        name: `QA Concurrent ${suffix}`,
        exact: true,
      }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: `Edit ${code}`, exact: true })
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
      .getByLabel("Position title", { exact: true })
      .fill(`QA Standard ${suffix}`);
    await page.getByRole("button", { name: "Save position" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.screenshot({
      path: test.info().outputPath("positions-mobile.png"),
      fullPage: true,
    });
    const departments = (await (
      await page.request.get("/api/v1/departments")
    ).json()) as { id: string }[];
    const profileResponse = await page.request.post("/api/v1/employees", {
      headers,
      data: {
        employeeNumber: `POS-${suffix}`,
        name: `QA Position ${suffix}`,
        workEmail: `pos-${suffix}@example.test`,
        departmentId: departments[0].id,
        position: "Individual work title",
        location: "Hanoi",
        status: "ACTIVE",
        startedOn: "2026-01-01",
      },
    });
    expect(profileResponse.status()).toBe(201);
    employeeId = ((await profileResponse.json()) as EmployeeDetail).id;
    await page.goto(`/app/people/employees/${employeeId}/edit`);
    await page
      .getByLabel("Position catalog (optional)", { exact: true })
      .selectOption(positionId);
    await page.getByRole("button", { name: "Save employee" }).click();
    await expect(page.getByRole("status")).toHaveText(
      "Employee profile saved.",
    );
    await page.getByRole("link", { name: "Back", exact: true }).click();
    await expect(page.locator(".employee-detail-grid")).toContainText(
      `QA Standard ${suffix}`,
    );
    await expect(page.locator(".employee-detail-grid")).toContainText(
      "Individual work title",
    );
    await page.goto("/app/people/positions");
    await expect(
      page.getByRole("button", { name: `Delete ${code}`, exact: true }),
    ).toBeDisabled();
    const linked = (await (
      await page.request.get(`/api/v1/employees/${employeeId}`)
    ).json()) as EmployeeDetail;
    expect(
      (
        await page.request.delete(
          `/api/v1/employees/${employeeId}?version=${linked.version}`,
          { headers },
        )
      ).status(),
    ).toBe(200);
    await page.reload();
    await expect(
      page.getByRole("button", { name: `Delete ${code}`, exact: true }),
    ).toBeDisabled();
    expect(
      (
        await page.request.post(`/api/v1/employees/${employeeId}/restore`, {
          headers,
          data: { version: linked.version + 1 },
        })
      ).status(),
    ).toBe(200);
    await page.goto(`/app/people/employees/${employeeId}/edit`);
    await page
      .getByLabel("Position catalog (optional)", { exact: true })
      .selectOption("");
    await page.getByRole("button", { name: "Save employee" }).click();
    await expect(page.getByRole("status")).toHaveText(
      "Employee profile saved.",
    );
    await page.goto("/app/people/positions");
    await page
      .getByRole("button", { name: `Delete ${code}`, exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Cancel", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: `Delete ${code}`, exact: true }),
    ).toBeFocused();
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.screenshot({
      path: test.info().outputPath("positions-desktop.png"),
      fullPage: true,
    });
    await page
      .getByRole("button", { name: `Delete ${code}`, exact: true })
      .click();
    await page.getByRole("button", { name: "Confirm deletion" }).click();
    await expect(
      page.getByRole("heading", { name: `QA Standard ${suffix}`, exact: true }),
    ).toHaveCount(0);
  } finally {
    if (employeeId) {
      let record = (await (
        await page.request.get(`/api/v1/employees/${employeeId}`)
      ).json()) as EmployeeDetail;
      if (record.positionId) {
        if (record.archivedAt) {
          const restored = await page.request.post(
            `/api/v1/employees/${employeeId}/restore`,
            { headers, data: { version: record.version } },
          );
          expect(restored.status()).toBe(200);
          record = (await restored.json()) as EmployeeDetail;
        }
        const unlinked = await page.request.patch(
          `/api/v1/employees/${employeeId}`,
          {
            headers,
            data: {
              version: record.version,
              details: { ...record, positionId: null },
            },
          },
        );
        expect(unlinked.status()).toBe(200);
        record = (await unlinked.json()) as EmployeeDetail;
      }
      if (!record.archivedAt)
        expect(
          (
            await page.request.delete(
              `/api/v1/employees/${employeeId}?version=${record.version}`,
              { headers },
            )
          ).status(),
        ).toBe(200);
    }
    if (positionId) {
      const response = await page.request.get(
        `/api/v1/organization/positions/${positionId}`,
      );
      if (response.ok()) {
        const record = (await response.json()) as PositionDetail;
        expect(
          (
            await page.request.delete(
              `/api/v1/organization/positions/${positionId}?version=${record.version}`,
              { headers },
            )
          ).status(),
        ).toBe(204);
      }
    }
  }
});
