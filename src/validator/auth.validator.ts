import { z } from "zod";

/*  LOGIN  */

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username or email is required"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
});


/*  GOOGLE OAUTH  */

export const googleLoginSchema = z.object({
  idToken: z
    .string()
    .trim()
    .min(1, "Google ID token is required"),
});


/*  REGISTER  */

export const registerSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email("Invalid email address"),

    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must not exceed 20 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100)
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),

    fullName: z
      .string()
      .trim()
      .min(2, "Full name is required")
      .max(100),

    role: z.enum(["patient", "doctor"], {
      message: "Invalid role selected",
    }),

    // Doctor-only optional fields
    specialization: z.string().trim().optional(),
    bio: z.string().trim().max(1000).optional(),

    consultationFee: z
      .coerce
      .number()
      .positive("Consultation fee must be positive")
      .optional(),

    experienceYears: z
      .coerce
      .number()
      .int("Experience must be a whole number")
      .min(0, "Experience cannot be negative")
      .optional(),
  })
  .superRefine((data, ctx) => {
    // If role is DOCTOR, enforce doctor-specific fields
    if (data.role === "doctor") {
      if (!data.specialization) {
        ctx.addIssue({
          path: ["specialization"],
          code: z.ZodIssueCode.custom,
          message: "Specialization is required for doctors",
        });
      }

      if (!data.consultationFee) {
        ctx.addIssue({
          path: ["consultationFee"],
          code: z.ZodIssueCode.custom,
          message: "Consultation fee is required for doctors",
        });
      }

      if (data.experienceYears === undefined) {
        ctx.addIssue({
          path: ["experienceYears"],
          code: z.ZodIssueCode.custom,
          message: "Experience years is required for doctors",
        });
      }
    }
  });

/*  FORGOT PASSWORD  */

export const forgotPasswordSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(3, "Username or email is required"),
});

/*  RESET PASSWORD  */

export const resetPasswordSchema = z
  .object({
    token: z
      .string()
      .trim()
      .min(1, "Reset token is required"),

    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100)
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),

    confirmPassword: z.string().min(8, "Confirm password is required"),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
      });
    }
  });

/*  CHANGE PASSWORD  */

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, "Current password must be at least 8 characters"),

    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(100)
      .regex(/[A-Z]/, "New password must contain at least one uppercase letter")
      .regex(/[a-z]/, "New password must contain at least one lowercase letter")
      .regex(/[0-9]/, "New password must contain at least one number"),
  })
  .superRefine((data, ctx) => {
    if (data.currentPassword === data.newPassword) {
      ctx.addIssue({
        path: ["newPassword"],
        code: z.ZodIssueCode.custom,
        message: "New password must be different from current password",
      });
    }
  });
