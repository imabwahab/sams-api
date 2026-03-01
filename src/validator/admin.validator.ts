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

const fullNameSchema = z
  .string()
  .trim()
  .min(2, "Full name must be at least 2 characters")
  .max(120, "Full name cannot exceed 120 characters");

const phoneSchema = z
  .string()
  .trim()
  .min(7, "Phone must be at least 7 characters")
  .max(20, "Phone cannot exceed 20 characters");

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password cannot exceed 72 characters");

export const listAdminsQuerySchema = z.object({
  search: z.string().trim().min(1, "Search term cannot be empty").optional(),
  isActive: z
    .enum(["true", "false"], {
      message: "isActive must be true or false",
    })
    .transform((value) => value === "true")
    .optional(),
});

export const adminIdParamSchema = z.object({
  id: z.coerce.number().int().positive("Invalid admin id"),
});

export const createAdminSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  fullName: fullNameSchema,
  phone: phoneSchema.optional(),
  isActive: z.boolean().optional(),
});

export const updateAdminSchema = z
  .object({
    username: usernameSchema.optional(),
    email: emailSchema.optional(),
    password: passwordSchema.optional(),
    fullName: fullNameSchema.optional(),
    phone: phoneSchema.nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

export type ListAdminsQueryInput = z.infer<typeof listAdminsQuerySchema>;
export type CreateAdminInput = z.infer<typeof createAdminSchema>;
export type UpdateAdminInput = z.infer<typeof updateAdminSchema>;
