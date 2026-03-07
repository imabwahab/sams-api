import "dotenv/config";
import { Request, Response } from "express";
import app from "./server";

const PORT = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running");
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
