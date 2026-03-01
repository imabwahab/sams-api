import { Router } from "express";
import { adminController } from "../controller/admin.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/admins:
 *   get:
 *     tags: [admin]
 *     summary: List admins
 *     description: Returns all admins (admin role required).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, username, or email.
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status.
 *     responses:
 *       200:
 *         description: Admin list retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Admins fetched successfully }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Admin'
 *       401:
 *         description: Unauthorized
 */
router.get("/admins", requireAuth, adminController.list);

/**
 * @swagger
 * /api/admins/{id}:
 *   get:
 *     tags: [admin]
 *     summary: Get admin by id
 *     description: Returns a single admin by numeric id (admin role required).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Admin retrieved
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Admin not found
 */
router.get("/admins/:id", requireAuth, adminController.getOne);

/**
 * @swagger
 * /api/admins:
 *   post:
 *     tags: [admin]
 *     summary: Create admin
 *     description: Creates a new admin account (admin role required).
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAdminRequest'
 *     responses:
 *       201:
 *         description: Admin created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Username/email conflict
 */
router.post("/admins", requireAuth, adminController.create);

/**
 * @swagger
 * /api/admins/{id}:
 *   patch:
 *     tags: [admin]
 *     summary: Update admin
 *     description: Updates admin details by id (admin role required).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAdminRequest'
 *     responses:
 *       200:
 *         description: Admin updated
 *       400:
 *         description: Validation/business error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Admin not found
 *       409:
 *         description: Username/email conflict
 */
router.patch("/admins/:id", requireAuth, adminController.update);

/**
 * @swagger
 * /api/admins/{id}:
 *   delete:
 *     tags: [admin]
 *     summary: Delete admin (soft delete)
 *     description: Sets admin account as inactive by id (admin role required).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Admin deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Admin not found
 *       409:
 *         description: Invalid delete operation
 */
router.delete("/admins/:id", requireAuth, adminController.remove);

export default router;
