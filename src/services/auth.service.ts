import prisma from "../lib/prisma";
import bcrypt from "bcrypt";
import {
  signPasswordResetToken,
  signToken,
  verifyPasswordResetToken,
} from "../lib/jwt";

type ForgotPasswordPayload = {
  identifier: string;
};

type ResetPasswordPayload = {
  token: string;
  newPassword: string;
};

type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export async function login(data: { username: string; password: string }) {
  const identifier = data.username.toLowerCase();

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { username: identifier }],
      isActive: true,
    },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const valid = await bcrypt.compare(data.password, user.password);
  if (!valid) {
    throw new Error("Invalid credentials");
  }

  const token = signToken({ userId: user.id, role: user.role });

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    fullName: user.fullName,
    token,
  };
}

export async function register(data: any) {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email: data.email }, { username: data.username }],
    },
  });

  if (existing) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      username: data.username,
      password: hashedPassword,
      fullName: data.fullName,
      role: data.role,
    },
  });

  // Optional doctor profile
  if (user.role === "doctor") {
    if (data.consultationFee === undefined) {
      throw new Error("Consultation fee is required for doctors");
    }

    await prisma.doctorProfile.create({
      data: {
        userId: user.id,
        specialization: data.specialization!,
        bio: data.bio,
        consultationFee: data.consultationFee,
        experienceYears: data.experienceYears ?? 0,
      },
    });
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    fullName: user.fullName,
  };
}

export async function getMe(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      fullName: true,
      isActive: true,
      doctorProfile: {
        select: {
          specialization: true,
          bio: true,
          consultationFee: true,
          experienceYears: true,
        },
      },
    },
  });

  if (!user || !user.isActive) {
    throw new Error("User not found");
  }

  return user;
}

export async function logout() {
  return true;
}

export async function requestPasswordReset(data: ForgotPasswordPayload) {
  const identifier = data.identifier.toLowerCase().trim();

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { username: identifier }],
      isActive: true,
    },
  });

  if (!user) {
    return {
      message:
        "If an account with that email/username exists, a reset token has been generated.",
    };
  }

  const resetToken = signPasswordResetToken({ userId: user.id });

  return {
    message:
      "If an account with that email/username exists, a reset token has been generated.",
    resetToken,
  };
}

export async function resetPassword(data: ResetPasswordPayload) {
  const decoded = verifyPasswordResetToken(data.token);

  if (!decoded?.userId) {
    throw new Error("Invalid or expired reset token");
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user || !user.isActive) {
    throw new Error("Invalid or expired reset token");
  }

  const samePassword = await bcrypt.compare(data.newPassword, user.password);
  if (samePassword) {
    throw new Error("New password must be different from current password");
  }

  const hashedPassword = await bcrypt.hash(data.newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  return true;
}

export async function changePassword(
  userId: number,
  data: ChangePasswordPayload
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.isActive) {
    throw new Error("User not found");
  }

  const valid = await bcrypt.compare(data.currentPassword, user.password);
  if (!valid) {
    throw new Error("Current password is incorrect");
  }

  const samePassword = await bcrypt.compare(data.newPassword, user.password);
  if (samePassword) {
    throw new Error("New password must be different from current password");
  }

  const hashedPassword = await bcrypt.hash(data.newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return true;
}
