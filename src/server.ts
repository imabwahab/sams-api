import express, { Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import authRoutes from "./routes/auth.route";
import scheduleRoutes from "./routes/schedule.route";
import appointmentRoutes from "./routes/appointment.route";
import doctorRoutes from "./routes/doctor.route";
import adminRoutes from "./routes/admin.route";
import { swaggerSpec } from "./swagger";

const app = express();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running");
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

app.use("/api/auth", authRoutes);
app.use("/api", scheduleRoutes);
app.use("/api", appointmentRoutes);
app.use("/api", doctorRoutes);
app.use("/api", adminRoutes);

export default app;
