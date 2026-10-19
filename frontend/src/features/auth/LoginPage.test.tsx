import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginPage from "./LoginPage";
import { vi, test, expect } from "vitest";
vi.mock("../../services/api", () => ({ login: vi.fn() }));
test("validates login fields and exposes accessible password visibility", async () => {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
  const user = userEvent.setup();
  await user.click(
    screen.getByRole("button", { name: /sign in to your workspace/i }),
  );
  expect(await screen.findByText("Enter a valid work email.")).toBeVisible();
  expect(screen.getByText("Enter your password.")).toBeVisible();
  expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
  await user.click(screen.getByRole("button", { name: "Show password" }));
  expect(screen.getByLabelText("Password")).toHaveAttribute("type", "text");
});
