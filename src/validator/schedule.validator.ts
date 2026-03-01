import { z } from "zod";

const dayOfWeekSchema = z.enum([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (expected HH:mm)");

export function isStartBeforeEnd(startTime: string, endTime: string): boolean {
  return startTime < endTime;
}

export const createScheduleSchema = z.object({
  dayOfWeek: dayOfWeekSchema,
  startTime: timeSchema,
  endTime: timeSchema,
  isAvailable: z.boolean().optional(),
}).refine((value) => isStartBeforeEnd(value.startTime, value.endTime), {
  message: "startTime must be earlier than endTime",
  path: ["endTime"],
});

export const updateScheduleSchema = z
  .object({
    dayOfWeek: dayOfWeekSchema.optional(),
    startTime: timeSchema.optional(),
    endTime: timeSchema.optional(),
    isAvailable: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  })
  .refine(
    (value) =>
      !(value.startTime && value.endTime) ||
      isStartBeforeEnd(value.startTime, value.endTime),
    {
      message: "startTime must be earlier than endTime",
      path: ["endTime"],
    }
  );

export const scheduleIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const doctorIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;
