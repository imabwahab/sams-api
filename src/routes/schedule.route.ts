import { Router } from "express";
import { scheduleController } from "../controller/schedule.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/doctors/{id}/schedules:
 *   get:
 *     tags: [schedule]
 *     summary: List doctor schedules
 *     description: Returns all schedules for a specific doctor.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Schedules fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Schedules fetched successfully }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Schedule'
 *       404:
 *         description: Doctor not found
 */
router.get("/doctors/:id/schedules", scheduleController.list);

/**
 * @swagger
 * /api/schedules/{id}:
 *   get:
 *     tags: [schedule]
 *     summary: Get schedule by id
 *     description: Returns one schedule record by id.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Schedule fetched successfully
 *       404:
 *         description: Schedule not found
 */
router.get("/schedules/:id", scheduleController.getOne);

/**
 * @swagger
 * /api/schedules:
 *   post:
 *     tags: [schedule]
 *     summary: Create schedule
 *     description: Creates a schedule for the authenticated doctor.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateScheduleRequest'
 *     responses:
 *       201:
 *         description: Schedule created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Overlapping schedule
 */
router.post("/schedules", requireAuth, scheduleController.create);

/**
 * @swagger
 * /api/schedules/{id}:
 *   patch:
 *     tags: [schedule]
 *     summary: Update schedule
 *     description: Updates a doctor-owned schedule by id.
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
 *             $ref: '#/components/schemas/UpdateScheduleRequest'
 *     responses:
 *       200:
 *         description: Schedule updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Schedule not found
 *       409:
 *         description: Overlapping schedule
 */
router.patch("/schedules/:id", requireAuth, scheduleController.update);

/**
 * @swagger
 * /api/schedules/{id}:
 *   delete:
 *     tags: [schedule]
 *     summary: Delete schedule
 *     description: Deletes a doctor-owned schedule by id.
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
 *         description: Schedule deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Schedule not found
 */
router.delete("/schedules/:id", requireAuth, scheduleController.remove);

export default router;
