import prisma from "../lib/prisma";
import {
  CreateScheduleInput,
  UpdateScheduleInput,
  isStartBeforeEnd,
} from "../validator/schedule.validator";

export class ScheduleServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "ScheduleServiceError";
    this.statusCode = statusCode;
  }
}

type RangeInput = {
  id?: number;
  startTime: string;
  endTime: string;
};

function toDateOnly(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

function toDayOfWeek(date: string) {
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

function hasOverlap(candidate: RangeInput, existingRanges: RangeInput[]): boolean {
  const candidateStart = candidate.startTime;
  const candidateEnd = candidate.endTime;

  return existingRanges.some((existing) => {
    const currentStart = existing.startTime;
    const currentEnd = existing.endTime;

    return candidateStart < currentEnd && currentStart < candidateEnd;
  });
}

export const scheduleService = {
  async getDoctorSchedules(doctorId: number) {
    const doctor = await prisma.user.findUnique({
      where: { id: doctorId },
      select: { id: true, role: true, isActive: true },
    });

    if (!doctor || !doctor.isActive || doctor.role !== "doctor") {
      throw new ScheduleServiceError("Doctor not found", 404);
    }

    return prisma.schedule.findMany({
      where: { doctorId },
      orderBy: [{ date: "asc" }, { startTime: "asc" }, { dayOfWeek: "asc" }],
    });
  },

  async getScheduleById(scheduleId: number) {
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) {
      throw new ScheduleServiceError("Schedule not found", 404);
    }

    return schedule;
  },

  async createSchedule(doctorId: number, data: CreateScheduleInput) {
    const doctor = await prisma.user.findUnique({
      where: { id: doctorId },
      select: { id: true, role: true, isActive: true },
    });

    if (!doctor || !doctor.isActive || doctor.role !== "doctor") {
      throw new ScheduleServiceError("Only active doctors can create schedules", 403);
    }

    const existingSchedules = await prisma.schedule.findMany({
      where: { doctorId, date: toDateOnly(data.date) },
      select: { id: true, startTime: true, endTime: true },
    });

    if (
      hasOverlap(
        { startTime: data.startTime, endTime: data.endTime },
        existingSchedules
      )
    ) {
      throw new ScheduleServiceError(
        "Schedule overlaps with an existing time range",
        409
      );
    }

    return prisma.schedule.create({
      data: {
        doctorId,
        date: toDateOnly(data.date),
        dayOfWeek: toDayOfWeek(data.date),
        startTime: data.startTime,
        endTime: data.endTime,
        ...(data.isAvailable !== undefined ? { isAvailable: data.isAvailable } : {}),
      },
    });
  },

  async updateSchedule(
    scheduleId: number,
    doctorId: number,
    data: UpdateScheduleInput
  ) {
    const schedule = await prisma.schedule.findFirst({
      where: { id: scheduleId, doctorId },
    });

    if (!schedule) {
      throw new ScheduleServiceError("Schedule not found", 404);
    }

    const nextDate = data.date
      ? toDateOnly(data.date)
      : schedule.date;
    const nextDayOfWeek = data.date
      ? toDayOfWeek(data.date)
      : data.dayOfWeek ?? schedule.dayOfWeek;
    const nextStartTime = data.startTime ?? schedule.startTime;
    const nextEndTime = data.endTime ?? schedule.endTime;

    if (!isStartBeforeEnd(nextStartTime, nextEndTime)) {
      throw new ScheduleServiceError("startTime must be earlier than endTime", 400);
    }

    const existingSchedules = await prisma.schedule.findMany({
      where: {
        doctorId,
        ...(nextDate
          ? { date: nextDate }
          : { dayOfWeek: nextDayOfWeek }),
        id: { not: scheduleId },
      },
      select: { id: true, startTime: true, endTime: true },
    });

    if (
      hasOverlap(
        { id: scheduleId, startTime: nextStartTime, endTime: nextEndTime },
        existingSchedules
      )
    ) {
      throw new ScheduleServiceError(
        "Schedule overlaps with an existing time range",
        409
      );
    }

    return prisma.schedule.update({
      where: { id: scheduleId },
      data: {
        ...(data.date ? { date: toDateOnly(data.date), dayOfWeek: toDayOfWeek(data.date) } : {}),
        ...(data.dayOfWeek && !data.date ? { dayOfWeek: data.dayOfWeek } : {}),
        ...(data.startTime ? { startTime: data.startTime } : {}),
        ...(data.endTime ? { endTime: data.endTime } : {}),
        ...(data.isAvailable !== undefined ? { isAvailable: data.isAvailable } : {}),
      },
    });
  },

  async deleteSchedule(scheduleId: number, doctorId: number) {
    // ensure ownership
    const schedule = await prisma.schedule.findFirst({
      where: { id: scheduleId, doctorId },
    });

    if (!schedule) {
      throw new ScheduleServiceError("Schedule not found", 404);
    }

    return prisma.schedule.delete({
      where: { id: scheduleId },
    });
  },
};
