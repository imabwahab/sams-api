import { Router } from "express";
import { doctorController } from "../controller/doctor.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/doctors:
 *   get:
 *     tags: [doctor]
 *     summary: List doctors
 *     description: Returns active doctors with optional filters.
 *     parameters:
 *       - in: query
 *         name: specialization
 *         schema:
 *           type: string
 *         description: Filter by specialization keyword.
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by doctor name, username, or email.
 *     responses:
 *       200:
 *         description: Doctors fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Doctors fetched successfully }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Doctor'
 *       400:
 *         description: Validation error
 */
router.get("/doctors", doctorController.list);

/**
 * @swagger
 * /api/doctors/{id}:
 *   get:
 *     tags: [doctor]
 *     summary: Get doctor by id
 *     description: Returns one active doctor and their schedules.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Doctor fetched successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Doctor not found
 */
router.get("/doctors/:id", doctorController.getOne);

/**
 * @swagger
 * /api/doctors:
 *   post:
 *     tags: [doctor]
 *     summary: Create doctor
 *     description: Creates a doctor account (admin role required).
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDoctorRequest'
 *     responses:
 *       201:
 *         description: Doctor created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Username/email conflict
 */
router.post("/doctors", requireAuth, doctorController.create);

/**
 * @swagger
 * /api/doctors/{id}:
 *   patch:
 *     tags: [doctor]
 *     summary: Update doctor
 *     description: Updates doctor by id (admin role required).
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
 *             $ref: '#/components/schemas/UpdateDoctorRequest'
 *     responses:
 *       200:
 *         description: Doctor updated successfully
 *       400:
 *         description: Validation/business error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Doctor not found
 *       409:
 *         description: Username/email conflict
 */
router.patch("/doctors/:id", requireAuth, doctorController.update);

/**
 * @swagger
 * /api/doctors/{id}:
 *   delete:
 *     tags: [doctor]
 *     summary: Delete doctor (soft delete)
 *     description: Sets doctor account as inactive by id (admin role required).
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
 *         description: Doctor deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Doctor not found
 *       409:
 *         description: Invalid delete operation
 */
router.delete("/doctors/:id", requireAuth, doctorController.remove);

export default router;
