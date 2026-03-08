import { AppointmentStatus } from "../generated/prisma";
import prisma from "../lib/prisma";
import {
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from "../validator/appointment.validator";

type ActorRole = "patient" | "doctor" | "admin";

type UserActor = {
  id: number;
  role: ActorRole;
};

export class AppointmentServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "AppointmentServiceError";
    this.statusCode = statusCode;
  }
}

function toDateOnly(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

function getScopedWhere(actor: UserActor) {
  if (actor.role === "patient") {
    return { patientId: actor.id };
  }

  if (actor.role === "doctor") {
    return { doctorId: actor.id };
  }

  return {};
}

async function assertDoctorExists(doctorId: number) {
  const doctor = await prisma.user.findUnique({
    where: { id: doctorId },
    select: { id: true, role: true, isActive: true },
  });

  if (!doctor || doctor.role !== "doctor" || !doctor.isActive) {
    throw new AppointmentServiceError("Doctor not found", 404);
  }
}

export const appointmentService = {
  async listAppointments(actor: UserActor, status?: AppointmentStatus) {
    const scopedWhere = getScopedWhere(actor);
    return prisma.appointment.findMany({
      where: {
        ...scopedWhere,
        ...(status ? { status } : {}),
      },
      include: {
        patient: { select: { id: true, fullName: true, email: true } },
        doctor: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: [{ date: "desc" }, { startTime: "desc" }],
    });
  },

  async getAppointmentById(id: number, actor: UserActor) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: { select: { id: true, fullName: true, email: true } },
        doctor: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!appointment) {
      throw new AppointmentServiceError("Appointment not found", 404);
    }

    if (
      actor.role !== "admin" &&
      appointment.patientId !== actor.id &&
      appointment.doctorId !== actor.id
    ) {
      throw new AppointmentServiceError("Forbidden", 403);
    }

    return appointment;
  },

  async checkDoctorAvailability(
    doctorId: number,
    date: string,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: number
  ) {
    const existing = await prisma.appointment.findFirst({
      where: {
        doctorId,
        date: toDateOnly(date),
        status: { not: "cancelled" },
        ...(excludeAppointmentId ? { id: { not: excludeAppointmentId } } : {}),
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });

    return !existing;
  },

  async createAppointment(patientId: number, data: CreateAppointmentInput) {
    await assertDoctorExists(data.doctorId);

    const available = await this.checkDoctorAvailability(
      data.doctorId,
      data.date,
      data.startTime,
      data.endTime
    );

    if (!available) {
      throw new AppointmentServiceError("Slot not available", 409);
    }

    return prisma.appointment.create({
      data: {
        ...data,
        patientId,
        date: toDateOnly(data.date),
      },
    });
  },

  async updateAppointment(id: number, actor: UserActor, data: UpdateAppointmentInput) {
    const current = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!current) {
      throw new AppointmentServiceError("Appointment not found", 404);
    }

    if (
      actor.role !== "admin" &&
      current.patientId !== actor.id &&
      current.doctorId !== actor.id
    ) {
      throw new AppointmentServiceError("Forbidden", 403);
    }

    if (actor.role === "patient" && data.status) {
      throw new AppointmentServiceError(
        "Patients are not allowed to update appointment status",
        403
      );
    }

    const nextDate = data.date ?? current.date.toISOString().slice(0, 10);
    const nextStartTime = data.startTime ?? current.startTime;
    const nextEndTime = data.endTime ?? current.endTime;

    if (nextStartTime >= nextEndTime) {
      throw new AppointmentServiceError("startTime must be earlier than endTime", 400);
    }

    const slotChanged =
      nextDate !== current.date.toISOString().slice(0, 10) ||
      nextStartTime !== current.startTime ||
      nextEndTime !== current.endTime;

    if (slotChanged) {
      const available = await this.checkDoctorAvailability(
        current.doctorId,
        nextDate,
        nextStartTime,
        nextEndTime,
        current.id
      );

      if (!available) {
        throw new AppointmentServiceError("Slot not available", 409);
      }
    }

    return prisma.appointment.update({
      where: { id },
      data: {
        ...(data.date ? { date: toDateOnly(data.date) } : {}),
        ...(data.startTime ? { startTime: data.startTime } : {}),
        ...(data.endTime ? { endTime: data.endTime } : {}),
        ...(data.status ? { status: data.status } : {}),
        ...(Object.prototype.hasOwnProperty.call(data, "notes")
          ? { notes: data.notes ?? null }
          : {}),
      },
    });
  },

  async deleteAppointment(id: number, actor: UserActor) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      select: { id: true, patientId: true, doctorId: true },
    });

    if (!appointment) {
      throw new AppointmentServiceError("Appointment not found", 404);
    }

    if (
      actor.role !== "admin" &&
      appointment.patientId !== actor.id &&
      appointment.doctorId !== actor.id
    ) {
      throw new AppointmentServiceError("Forbidden", 403);
    }

    return prisma.appointment.delete({
      where: { id },
    });
  },
};
