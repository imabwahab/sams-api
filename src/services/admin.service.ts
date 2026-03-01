import bcrypt from "bcrypt";
import { Prisma } from "../generated/prisma/client";
import prisma from "../lib/prisma";
import { AdminModel } from "../model/admin.model";

type ListAdminsQueryInput = {
  search?: string;
  isActive?: boolean;
};

type CreateAdminInput = {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  isActive?: boolean;
};

type UpdateAdminInput = {
  username?: string;
  email?: string;
  password?: string;
  fullName?: string;
  phone?: string | null;
  isActive?: boolean;
};

export class AdminServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "AdminServiceError";
    this.statusCode = statusCode;
  }
}

const adminSelect = {
  id: true,
  username: true,
  email: true,
  fullName: true,
  phone: true,
  role: true,
  isActive: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

function isUniqueConstraintError(
  error: unknown
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
  );
}

export const adminService = {
  async listAdmins(filters?: ListAdminsQueryInput): Promise<AdminModel[]> {
    const where: Prisma.UserWhereInput = {
      role: "admin",
    };

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

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    return prisma.user.findMany({
      where,
      select: adminSelect,
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async getAdminById(id: number): Promise<AdminModel> {
    const admin = await prisma.user.findFirst({
      where: {
        id,
        role: "admin",
      },
      select: adminSelect,
    });

    if (!admin) {
      throw new AdminServiceError("Admin not found", 404);
    }

    return admin;
  },

  async createAdmin(data: CreateAdminInput): Promise<AdminModel> {
    try {
      const hashedPassword = await bcrypt.hash(data.password, 10);

      return prisma.user.create({
        data: {
          username: data.username,
          email: data.email.toLowerCase(),
          password: hashedPassword,
          fullName: data.fullName,
          phone: data.phone,
          role: "admin",
          isActive: data.isActive ?? true,
        },
        select: adminSelect,
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new AdminServiceError("Username or email already exists", 409);
      }

      throw error;
    }
  },

  async updateAdmin(id: number, data: UpdateAdminInput): Promise<AdminModel> {
    const existing = await prisma.user.findFirst({
      where: {
        id,
        role: "admin",
      },
      select: {
        id: true,
      },
    });

    if (!existing) {
      throw new AdminServiceError("Admin not found", 404);
    }

    const userData: Prisma.UserUpdateInput = {};

    if (data.username !== undefined) userData.username = data.username;
    if (data.email !== undefined) userData.email = data.email.toLowerCase();
    if (data.fullName !== undefined) userData.fullName = data.fullName;
    if (data.phone !== undefined) userData.phone = data.phone;
    if (data.isActive !== undefined) userData.isActive = data.isActive;

    if (data.password !== undefined) {
      userData.password = await bcrypt.hash(data.password, 10);
    }

    if (Object.keys(userData).length === 0) {
      throw new AdminServiceError("At least one field must be provided", 400);
    }

    try {
      return prisma.user.update({
        where: { id },
        data: userData,
        select: adminSelect,
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new AdminServiceError("Username or email already exists", 409);
      }

      throw error;
    }
  },

  async deleteAdmin(id: number): Promise<void> {
    const admin = await prisma.user.findFirst({
      where: {
        id,
        role: "admin",
      },
      select: {
        id: true,
        isActive: true,
      },
    });

    if (!admin) {
      throw new AdminServiceError("Admin not found", 404);
    }

    if (!admin.isActive) {
      throw new AdminServiceError("Admin is already deleted", 409);
    }

    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  },
};
