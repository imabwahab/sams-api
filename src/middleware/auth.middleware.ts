import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt";
import prisma from "../lib/prisma";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) return res.status(401).send("Unauthorized");

  const decoded: any = verifyToken(token);

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      fullName: true,
    },
  });

  req.user = user;
  next();
}
