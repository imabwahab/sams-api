import express, { Request, Response } from "express";
import authRoutes from "./routes/auth.route";
import scheduleRoutes from "./routes/schedule.route";
import appointmentRoutes from "./routes/appointment.route";
import doctorRoutes from "./routes/doctor.route";
import adminRoutes from "./routes/admin.route";

const app = express();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running");
});

app.use("/api/auth", authRoutes);
app.use("/api", scheduleRoutes);
app.use("/api", appointmentRoutes);
app.use("/api", doctorRoutes);
app.use("/api", adminRoutes);

export default app;
