import { Request, Response } from "express";
import * as authService from "../services/auth.service";

/**
 * LOGIN
 */
export async function login(req: Request, res: Response) {
  try {
    const user = await authService.login(req.body);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: user,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Login failed",
      data: null,
    });
  }
}

/**
 * REGISTER
 */
export async function register(req: Request, res: Response) {
  try {
    const user = await authService.register(req.body);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: user,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Registration failed",
      data: null,
    });
  }
}

/**
 * LOGOUT
 */
export async function logout(req: Request, res: Response) {
  try {
    await authService.logout();

    res.clearCookie("token");

    res.status(200).json({
      success: true,
      message: "Logout successful",
      data: null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Logout failed",
      data: null,
    });
  }
}

/**
 * ME
 */
export async function me(req: Request, res: Response) {
  try {
    const user = await authService.getMe(req.user?.id);

    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message || "Failed to fetch user",
      data: null,
    });
  }
}

/**
 * FORGOT PASSWORD
 */
export async function forgotPassword(req: Request, res: Response) {
  try {
    const result = await authService.requestPasswordReset(req.body);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.resetToken ? { resetToken: result.resetToken } : null,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to process forgot password request",
      data: null,
    });
  }
}

/**
 * RESET PASSWORD
 */
export async function resetPassword(req: Request, res: Response) {
  try {
    await authService.resetPassword(req.body);

    res.status(200).json({
      success: true,
      message: "Password reset successful",
      data: null,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to reset password",
      data: null,
    });
  }
}

/**
 * CHANGE PASSWORD
 */
export async function changePassword(req: Request, res: Response) {
  try {
    await authService.changePassword(req.user?.id, req.body);

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
      data: null,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to change password",
      data: null,
    });
  }
}
