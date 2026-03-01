import express, { Request, Response } from "express";
import authRoutes from "./routes/auth.route";
import scheduleRoutes from "./routes/schedule.route";
import appointmentRoutes from "./routes/appointment.route";


const app = express();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running");
});

app.use("/api/auth", authRoutes);
app.use("/api", scheduleRoutes);
app.use("/api", appointmentRoutes);


export default app;
