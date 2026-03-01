import { Router } from "express";
import { appointmentController } from "../controller/appointment.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/appointments", requireAuth, appointmentController.list);
router.get("/appointments/:id", requireAuth, appointmentController.getOne);
router.post("/appointments", requireAuth, appointmentController.create);
router.patch("/appointments/:id", requireAuth, appointmentController.update);
router.delete("/appointments/:id", requireAuth, appointmentController.remove);

export default router;
