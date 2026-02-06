import { Request, Response } from "express";
import * as authService from "../services/auth.service";

export async function login(req: Request, res: Response) {
  const user = await authService.login(req.body);
  res.status(200).json(user);
}

export async function register(req: Request, res: Response) {
  console.log(req.body)
  const user = await authService.register(req.body);
  res.status(201).json(user);
}

export async function logout(req: Request, res: Response) {
  res.clearCookie("token");
  res.status(200).send();
}

export async function me(req: Request, res: Response) {
  res.status(200).json(req.user ?? null);
}
