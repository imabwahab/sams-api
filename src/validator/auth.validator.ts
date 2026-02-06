import { z } from "zod";

export const loginSchema = z.object({
  username: z.string(), // can be username OR email
  password: z.string(),
});

export const registerSchema = z.object({
  email: z.string().email(),
  username: z.string(),
  password: z.string().min(6),
  fullName: z.string(),
  role: z.string(),

  // doctor-only optional fields
  specialization: z.string().optional(),
  bio: z.string().optional(),
  consultationFee: z.coerce.number().optional(),
  experienceYears: z.coerce.number().optional(),
});
