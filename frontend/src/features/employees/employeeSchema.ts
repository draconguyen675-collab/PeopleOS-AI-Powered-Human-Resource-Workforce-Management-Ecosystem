import { z } from "zod";

export const employeeSchema = z.object({
  employeeNumber: z
    .string()
    .trim()
    .toUpperCase()
    .min(1, "Employee number is required.")
    .max(30)
    .regex(
      /^[A-Z0-9][A-Z0-9._-]*$/,
      "Use letters, numbers, dots, hyphens or underscores.",
    ),
  name: z.string().trim().min(1, "Full name is required.").max(120),
  workEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid work email.")
    .max(254),
  departmentId: z.string().uuid("Choose a department."),
  position: z.string().trim().min(1, "Position is required.").max(120),
  positionId: z.union([z.literal(""), z.string().uuid()]).nullish(),
  location: z.string().trim().min(1, "Location is required.").max(120),
  status: z.enum(["ACTIVE", "ONBOARDING", "ON_LEAVE"]),
  startedOn: z.iso.date("Enter a valid start date."),
});
export type EmployeeValues = z.infer<typeof employeeSchema>;
