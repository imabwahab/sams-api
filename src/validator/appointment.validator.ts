import { z } from "zod";

const appointmentStatusSchema = z.enum([
  "pending",
  "confirmed",
  "cancelled",
  "completed",
]);

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (expected HH:mm)");

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (expected YYYY-MM-DD)");

function isStartBeforeEnd(startTime: string, endTime: string): boolean {
  return startTime < endTime;
}

export const createAppointmentSchema = z.object({
  doctorId: z.coerce.number().int().positive(),
  date: dateSchema,
  startTime: timeSchema,
  endTime: timeSchema,
  notes: z.string().trim().max(500).optional(),
}).refine((value) => isStartBeforeEnd(value.startTime, value.endTime), {
  message: "startTime must be earlier than endTime",
  path: ["endTime"],
});

export const appointmentIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const listAppointmentsQuerySchema = z.object({
  status: appointmentStatusSchema.optional(),
});

export const updateAppointmentSchema = z.object({
  date: dateSchema.optional(),
  startTime: timeSchema.optional(),
  endTime: timeSchema.optional(),
  notes: z.string().trim().max(500).nullable().optional(),
  status: appointmentStatusSchema.optional(),
}).refine((value) => Object.keys(value).length > 0, {
  message: "At least one field must be provided",
}).refine(
  (value) =>
    !(value.startTime && value.endTime) ||
    isStartBeforeEnd(value.startTime, value.endTime),
  {
    message: "startTime must be earlier than endTime",
    path: ["endTime"],
  }
);

export const updateStatusSchema = z.object({
  status: appointmentStatusSchema,
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
