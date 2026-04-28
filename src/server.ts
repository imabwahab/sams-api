import express, { NextFunction, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import authRoutes from "./routes/auth.route";
import scheduleRoutes from "./routes/schedule.route";
import appointmentRoutes from "./routes/appointment.route";
import doctorRoutes from "./routes/doctor.route";
import adminRoutes from "./routes/admin.route";
import { swaggerSpec } from "./swagger";

const app = express();
const frontendOrigin = process.env.FRONTEND_URL || "http://localhost:3000";

app.use((req: Request, res: Response, next: NextFunction) => {
  const startedAt = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`
    );
  });

  next();
});

app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", frontendOrigin);
  res.header("Vary", "Origin");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

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
