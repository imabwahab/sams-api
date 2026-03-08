import bcrypt from "bcrypt";
import { Prisma } from "../generated/prisma/client";
import prisma from "../lib/prisma";
import { DoctorModel, DoctorWithSchedulesModel } from "../model/doctor.model";

type ListDoctorsQueryInput = {
  specialization?: string;
  search?: string;
};

type CreateDoctorInput = {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  specialization: string;
  bio?: string;
  consultationFee: number;
  experienceYears?: number;
  isActive?: boolean;
};

type UpdateDoctorInput = {
  username?: string;
  email?: string;
  fullName?: string;
  phone?: string | null;
  specialization?: string;
  bio?: string | null;
  consultationFee?: number;
  experienceYears?: number;
  isActive?: boolean;
};

export class DoctorServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "DoctorServiceError";
    this.statusCode = statusCode;
  }
}

const doctorSelect = {
  id: true,
  username: true,
  email: true,
  fullName: true,
  phone: true,
  role: true,
  isActive: true,
  createdAt: true,
  doctorProfile: {
    select: {
      id: true,
      specialization: true,
      bio: true,
      consultationFee: true,
      experienceYears: true,
    },
  },
} satisfies Prisma.UserSelect;

function isUniqueConstraintError(
  error: unknown
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
  );
}

export const doctorService = {
  async listDoctors(filters?: ListDoctorsQueryInput): Promise<DoctorModel[]> {
    const where: Prisma.UserWhereInput = {
      role: "doctor",
      isActive: true,
    };

    if (filters?.specialization) {
      where.doctorProfile = {
        is: {
          specialization: {
            contains: filters.specialization,
          },
        },
      };
    }

    if (filters?.search) {
      where.OR = [
        {
          fullName: {
            contains: filters.search,
          },
        },
        {
          email: {
            contains: filters.search,
          },
        },
        {
          username: {
            contains: filters.search,
          },
        },
      ];
    }

    return prisma.user.findMany({
      where,
      select: doctorSelect,
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async getDoctorById(id: number): Promise<DoctorWithSchedulesModel> {
    const doctor = await prisma.user.findFirst({
      where: {
        id,
        role: "doctor",
        isActive: true,
      },
      select: {
        ...doctorSelect,
        schedules: {
          select: {
            id: true,
            dayOfWeek: true,
            startTime: true,
            endTime: true,
            isAvailable: true,
          },
          orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        },
      },
    });

    if (!doctor) {
      throw new DoctorServiceError("Doctor not found", 404);
    }

    return doctor;
  },

  async createDoctor(data: CreateDoctorInput) {
    try {
      const hashedPassword = await bcrypt.hash(data.password, 10);

      return prisma.user.create({
        data: {
          username: data.username,
          email: data.email.toLowerCase(),
          password: hashedPassword,
          fullName: data.fullName,
          phone: data.phone,
          role: "doctor",
          isActive: data.isActive ?? true,
          doctorProfile: {
            create: {
              specialization: data.specialization,
              bio: data.bio,
              consultationFee: data.consultationFee,
              experienceYears: data.experienceYears,
            },
          },
        },
        select: doctorSelect,
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new DoctorServiceError("Username or email already exists", 409);
      }

      throw error;
    }
  },

  async updateDoctor(id: number, data: UpdateDoctorInput) {
    const existing = await prisma.user.findFirst({
      where: {
        id,
        role: "doctor",
      },
      select: {
        id: true,
        doctorProfile: {
          select: {
            id: true,
            specialization: true,
            consultationFee: true,
            experienceYears: true,
          },
        },
      },
    });

    if (!existing) {
      throw new DoctorServiceError("Doctor not found", 404);
    }

    const userData: Prisma.UserUpdateInput = {};
    if (data.username !== undefined) userData.username = data.username;
    if (data.email !== undefined) userData.email = data.email.toLowerCase();
    if (data.fullName !== undefined) userData.fullName = data.fullName;
    if (data.phone !== undefined) userData.phone = data.phone;
    if (data.isActive !== undefined) userData.isActive = data.isActive;

    const profileData: Prisma.DoctorProfileUpdateInput = {};
    if (data.specialization !== undefined) {
      profileData.specialization = data.specialization;
    }
    if (data.bio !== undefined) profileData.bio = data.bio;
    if (data.consultationFee !== undefined) {
      profileData.consultationFee = data.consultationFee;
    }
    if (data.experienceYears !== undefined) {
      profileData.experienceYears = data.experienceYears;
    }

    const hasProfileUpdates = Object.keys(profileData).length > 0;
    const hasUserUpdates = Object.keys(userData).length > 0;

    if (!hasProfileUpdates && !hasUserUpdates) {
      throw new DoctorServiceError("At least one field must be provided", 400);
    }

    const nextSpecialization =
      data.specialization ?? existing.doctorProfile?.specialization;
    const nextConsultationFee =
      data.consultationFee ?? existing.doctorProfile?.consultationFee;
    const nextExperienceYears =
      data.experienceYears ?? existing.doctorProfile?.experienceYears ?? 0;

    if (!nextSpecialization) {
      throw new DoctorServiceError(
        "Specialization is required for doctor profile",
        400
      );
    }
    if (nextConsultationFee === undefined) {
      throw new DoctorServiceError(
        "Consultation fee is required for doctor profile",
        400
      );
    }

    try {
      return prisma.user.update({
        where: { id },
        data: {
          ...userData,
          ...(hasProfileUpdates
            ? {
                doctorProfile: {
                  upsert: {
                    update: profileData,
                    create: {
                      specialization: nextSpecialization,
                      bio: data.bio ?? null,
                      consultationFee: nextConsultationFee,
                      experienceYears: nextExperienceYears,
                    },
                  },
                },
              }
            : {}),
        },
        select: doctorSelect,
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new DoctorServiceError("Username or email already exists", 409);
      }

      throw error;
    }
  },

  async deleteDoctor(id: number) {
    const doctor = await prisma.user.findFirst({
      where: {
        id,
        role: "doctor",
      },
      select: {
        id: true,
        isActive: true,
      },
    });

    if (!doctor) {
      throw new DoctorServiceError("Doctor not found", 404);
    }

    if (!doctor.isActive) {
      throw new DoctorServiceError("Doctor is already deleted", 409);
    }

    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  },
};
