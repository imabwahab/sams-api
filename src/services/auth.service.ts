import prisma from "../lib/prisma";
import bcrypt from "bcrypt";
import { signPasswordResetToken, signToken } from "../lib/jwt";

type ForgotPasswordPayload = {
  identifier: string;
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
      role: data.specialization ? "doctor" : "patient",
    },
  });

  // Optional doctor profile
  if (user.role === "doctor") {
    await prisma.doctorProfile.create({
      data: {
        userId: user.id,
        specialization: data.specialization!,
        bio: data.bio,
        consultationFee: data.consultationFee,
        experienceYears: data.experienceYears,
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
