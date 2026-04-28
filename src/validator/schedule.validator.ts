import { z } from "zod";

const dayOfWeekSchema = z.enum([
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]);

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (expected HH:mm)");

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (expected YYYY-MM-DD)");

function getDayOfWeekFromDate(date: string) {
  const weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ] as const;

  return weekdays[new Date(`${date}T00:00:00.000Z`).getUTCDay()];
}

export function isStartBeforeEnd(startTime: string, endTime: string): boolean {
  return startTime < endTime;
}

export const createScheduleSchema = z.object({
  date: dateSchema,
  dayOfWeek: dayOfWeekSchema.optional(),
  startTime: timeSchema,
  endTime: timeSchema,
  isAvailable: z.boolean().optional(),
})
  .refine((value) => isStartBeforeEnd(value.startTime, value.endTime), {
    message: "startTime must be earlier than endTime",
    path: ["endTime"],
  })
  .refine(
    (value) => !value.dayOfWeek || value.dayOfWeek === getDayOfWeekFromDate(value.date),
    {
      message: "dayOfWeek must match the provided date",
      path: ["dayOfWeek"],
    }
  );

export const updateScheduleSchema = z
  .object({
    date: dateSchema.optional(),
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
  )
  .refine(
    (value) => !value.date || !value.dayOfWeek || value.dayOfWeek === getDayOfWeekFromDate(value.date),
    {
      message: "dayOfWeek must match the provided date",
      path: ["dayOfWeek"],
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
