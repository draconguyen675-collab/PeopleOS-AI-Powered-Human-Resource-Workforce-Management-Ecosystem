import { expect, test } from "vitest";
import { companySchema } from "./companySchema";
test("company validation rejects invalid timezones and blank names", () => {
  expect(
    companySchema.safeParse({
      name: "  ",
      timezone: "Moon/Base",
      currency: "VND",
      version: 0,
    }).success,
  ).toBe(false);
  expect(
    companySchema.parse({
      name: " NovaTech ",
      timezone: "Asia/Ho_Chi_Minh",
      currency: "VND",
      version: 0,
    }).name,
  ).toBe("NovaTech");
});
