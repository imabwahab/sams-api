import { Router } from "express";
import { adminController } from "../controller/admin.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.get("/admins", requireAuth, adminController.list);
router.get("/admins/:id", requireAuth, adminController.getOne);
router.post("/admins", requireAuth, adminController.create);
router.patch("/admins/:id", requireAuth, adminController.update);
router.delete("/admins/:id", requireAuth, adminController.remove);

export default router;
