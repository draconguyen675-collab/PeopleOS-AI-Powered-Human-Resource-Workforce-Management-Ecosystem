import { describe, expect, it } from "vitest";
import { employeeSchema } from "./employeeSchema";

const valid = {
  employeeNumber: " hr-042 ",
  name: " Linh Nguyen ",
  workEmail: " LINH@example.test ",
  departmentId: "19b7175a-3053-40c7-9c20-d5781c631bd8",
  position: "Engineer",
  location: "Hanoi",
  status: "ONBOARDING",
  startedOn: "2028-02-29",
};
describe("employee work profiles", () => {
  it("normalizes unique keys while retaining a valid future start date", () => {
    expect(employeeSchema.parse(valid)).toMatchObject({
      employeeNumber: "HR-042",
      name: "Linh Nguyen",
      workEmail: "linh@example.test",
      startedOn: "2028-02-29",
    });
  });
  it("rejects blank names, invalid calendar dates, unknown statuses and missing departments", () => {
    for (const invalid of [
      { name: " " },
      { startedOn: "2027-02-29" },
      { status: "FIRED" },
      { departmentId: "" },
      { employeeNumber: "HR 042" },
    ])
      expect(employeeSchema.safeParse({ ...valid, ...invalid }).success).toBe(
        false,
      );
  });
});
