import { Router } from "express";

const router = Router();

import * as controller from "../controller/auth.controller";
import { validate } from "../middleware/validate";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../validator/auth.validator";
import { requireAuth } from "../middleware/auth.middleware";

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [auth]
 *     summary: Login user
 *     description: Authenticate a user by username/email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Login successful }
 *                 data: { $ref: '#/components/schemas/AuthUser' }
 *       400:
 *         description: Invalid credentials or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/login", validate(loginSchema), controller.login);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [auth]
 *     summary: Register user
 *     description: Register a patient or doctor account.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Registration successful
 *       400:
 *         description: Validation error or user exists
 */
router.post("/register", validate(registerSchema), controller.register);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     tags: [auth]
 *     summary: Request password reset token
 *     description: Generates a password reset token for a valid account identifier.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordRequest'
 *     responses:
 *       200:
 *         description: Request handled successfully
 *       400:
 *         description: Validation or request error
 */
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  controller.forgotPassword
);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     tags: [auth]
 *     summary: Reset password
 *     description: Reset account password using a valid reset token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid token or validation error
 */
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  controller.resetPassword
);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     tags: [auth]
 *     summary: Change password
 *     description: Change password for the currently authenticated user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Validation or business rule error
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/change-password",
  requireAuth,
  validate(changePasswordSchema),
  controller.changePassword
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [auth]
 *     summary: Logout user
 *     description: Logout the currently authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 */
router.post("/logout", requireAuth, controller.logout);

/**
 * @swagger
 * /api/auth/user:
 *   get:
 *     tags: [auth]
 *     summary: Get current user profile (alias)
 *     description: Returns authenticated user profile information.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: User fetched successfully }
 *                 data: { $ref: '#/components/schemas/UserMe' }
 *       401:
 *         description: Unauthorized
 */
router.get("/user", requireAuth, controller.me);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [auth]
 *     summary: Get current user profile
 *     description: Returns authenticated user profile information.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: User fetched successfully }
 *                 data: { $ref: '#/components/schemas/UserMe' }
 *       401:
 *         description: Unauthorized
 */
router.get("/me", requireAuth, controller.me);

export default router;
