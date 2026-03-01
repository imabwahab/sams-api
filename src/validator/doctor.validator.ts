import { z } from "zod";

const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username cannot exceed 30 characters")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username can only contain letters, numbers, and underscores"
  );

const emailSchema = z
  .string()
  .trim()
  .email("Invalid email")
  .max(255, "Email cannot exceed 255 characters");

const phoneSchema = z
  .string()
  .trim()
  .min(7, "Phone must be at least 7 characters")
  .max(20, "Phone cannot exceed 20 characters");

const specializationSchema = z
  .string()
  .trim()
  .min(2, "Specialization must be at least 2 characters")
  .max(120, "Specialization cannot exceed 120 characters");

const bioSchema = z
  .string()
  .trim()
  .max(1000, "Bio cannot exceed 1000 characters");

export const listDoctorsQuerySchema = z.object({
  specialization: z
    .string()
    .trim()
    .min(1, "Specialization filter cannot be empty")
    .optional(),
  search: z.string().trim().min(1, "Search term cannot be empty").optional(),
});

export const doctorIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createDoctorSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password cannot exceed 72 characters"),
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(120, "Full name cannot exceed 120 characters"),
  phone: phoneSchema.optional(),
  specialization: specializationSchema,
  bio: bioSchema.optional(),
  consultationFee: z.coerce.number().positive().optional(),
  experienceYears: z.coerce.number().int().min(0).max(70).optional(),
  isActive: z.boolean().optional(),
});

export const updateDoctorSchema = z
  .object({
    username: usernameSchema.optional(),
    email: emailSchema.optional(),
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters")
      .max(120, "Full name cannot exceed 120 characters")
      .optional(),
    phone: phoneSchema.nullable().optional(),
    specialization: specializationSchema.optional(),
    bio: bioSchema.nullable().optional(),
    consultationFee: z.coerce.number().positive().nullable().optional(),
    experienceYears: z.coerce.number().int().min(0).max(70).nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

export type ListDoctorsQueryInput = z.infer<typeof listDoctorsQuerySchema>;
export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>;
