import { afterEach, expect, test, vi } from "vitest";
import { api, login, refreshCsrf } from "./api";
afterEach(() => vi.unstubAllGlobals());
test("fetches a CSRF token and sends it with a same-origin form login, then rotates it", async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify({ token: "masked-token", headerName: "X-CSRF-TOKEN" }),
      ),
    )
    .mockResolvedValueOnce(new Response(null, { status: 204 }))
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify({ token: "rotated", headerName: "X-CSRF-TOKEN" }),
      ),
    );
  vi.stubGlobal("fetch", fetch);
  await login("novatech", "owner@example.test", "example-password");
  expect(fetch).toHaveBeenCalledTimes(3);
  const [url, init] = fetch.mock.calls[1] as [string, RequestInit];
  expect(url).toBe("/api/v1/auth/login");
  expect(init.credentials).toBe("same-origin");
  expect(new Headers(init.headers).get("X-CSRF-TOKEN")).toBe("masked-token");
  expect((init.body as URLSearchParams).get("username")).toBe(
    "novatech:owner@example.test",
  );
});
test("returns validation errors without replacing them with success", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          detail: "Invalid company",
          errors: { name: "Required" },
        }),
        { status: 400 },
      ),
    ),
  );
  await expect(api("/company")).rejects.toMatchObject({
    status: 400,
    message: "Invalid company",
    errors: { name: "Required" },
  });
});
test("failed security token establishment fails closed", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response(null, { status: 503 })),
  );
  await expect(refreshCsrf()).rejects.toMatchObject({ status: 503 });
});
