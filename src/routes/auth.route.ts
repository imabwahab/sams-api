import { Router } from "express";

const router = Router();

import * as controller from "../controller/auth.controller";
import { validate } from "../middleware/validate";
import { loginSchema, registerSchema } from "../validator/auth.validator";
import { requireAuth } from "../middleware/auth.middleware";

router.post("/login", validate(loginSchema), controller.login);
router.post("/register", validate(registerSchema), controller.register);
router.post("/logout", requireAuth, controller.logout);
router.get("/user", requireAuth, controller.me);

export default router;
