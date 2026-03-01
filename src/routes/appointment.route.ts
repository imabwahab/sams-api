import { Router } from "express";
import { appointmentController } from "../controller/appointment.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     tags: [appointment]
 *     summary: List appointments
 *     description: Returns appointments scoped to the authenticated user role.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, accepted, cancelled, done]
 *         description: Optional status filter.
 *     responses:
 *       200:
 *         description: Appointments fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Appointments fetched successfully }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AppointmentWithRelations'
 *       401:
 *         description: Unauthorized
 */
router.get("/appointments", requireAuth, appointmentController.list);

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     tags: [appointment]
 *     summary: Get appointment by id
 *     description: Returns one appointment if it belongs to the authenticated user or user is admin.
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
 *         description: Appointment fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Appointment not found
 */
router.get("/appointments/:id", requireAuth, appointmentController.getOne);

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     tags: [appointment]
 *     summary: Create appointment
 *     description: Creates an appointment for an authenticated patient.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAppointmentRequest'
 *     responses:
 *       201:
 *         description: Appointment created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Doctor not found
 *       409:
 *         description: Slot not available
 */
router.post("/appointments", requireAuth, appointmentController.create);

/**
 * @swagger
 * /api/appointments/{id}:
 *   patch:
 *     tags: [appointment]
 *     summary: Update appointment
 *     description: Updates appointment data based on role permissions.
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
 *             $ref: '#/components/schemas/UpdateAppointmentRequest'
 *     responses:
 *       200:
 *         description: Appointment updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Appointment not found
 *       409:
 *         description: Slot not available
 */
router.patch("/appointments/:id", requireAuth, appointmentController.update);

/**
 * @swagger
 * /api/appointments/{id}:
 *   delete:
 *     tags: [appointment]
 *     summary: Delete appointment
 *     description: Deletes appointment if actor is owner or admin.
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
 *         description: Appointment deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Appointment not found
 */
router.delete("/appointments/:id", requireAuth, appointmentController.remove);

export default router;
