import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const PASSWORD_RESET_EXPIRES_IN = "15m";

export function signToken(payload: any) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}

export function signPasswordResetToken(payload: { userId: number }) {
  return jwt.sign(
    {
      userId: payload.userId,
      type: "password_reset",
    },
    JWT_SECRET,
    { expiresIn: PASSWORD_RESET_EXPIRES_IN }
  );
}
