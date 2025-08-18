import * as z from "zod";

export const signInSchema = z.object({
  identifier: z.email("Please enter a valid emial").min(1, "Email is required"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password should be minimum of 8 characters"),
});
