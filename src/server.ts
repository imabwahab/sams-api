import express, { Request, Response } from "express";
import authRoutes from "./routes/auth.route";

const app = express();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running");
});

app.use("/api/auth", authRoutes);

export default app;
