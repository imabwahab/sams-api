import { Router } from "express";
import { scheduleController } from "../controller/schedule.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

// GET doctor schedules
router.get("/doctors/:id/schedules", scheduleController.list);

// GET single schedule
router.get("/schedules/:id", scheduleController.getOne);

// POST create schedule (doctor only)
router.post("/schedules", requireAuth, scheduleController.create);

// PATCH update schedule (doctor only)
router.patch("/schedules/:id", requireAuth, scheduleController.update);

// DELETE schedule (doctor only)
router.delete("/schedules/:id", requireAuth, scheduleController.remove);

export default router;
