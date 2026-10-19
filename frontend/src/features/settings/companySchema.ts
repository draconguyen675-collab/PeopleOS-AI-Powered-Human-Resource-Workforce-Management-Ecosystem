import { z } from "zod";

export const companySchema = z.object({
  name: z.string().trim().min(1, "Company name is required.").max(120),
  timezone: z
    .string()
    .min(1, "Choose a timezone.")
    .refine((value) => {
      try {
        new Intl.DateTimeFormat("en", { timeZone: value });
        return true;
      } catch {
        return false;
      }
    }, "Use a valid IANA timezone."),
  currency: z.string().regex(/^[A-Z]{3}$/, "Use a three-letter currency code."),
  version: z.number().int().min(0),
});
