import { Router } from "express";
import { doctorController } from "../controller/doctor.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/doctors", doctorController.list);
router.get("/doctors/:id", doctorController.getOne);
router.post("/doctors", requireAuth, doctorController.create);
router.patch("/doctors/:id", requireAuth, doctorController.update);
router.delete("/doctors/:id", requireAuth, doctorController.remove);

export default router;
