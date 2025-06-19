import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import compression from "compression";
import helmet from "helmet";
import morgan from "morgan";

import employeeRoutes from "./routes/employeeRoutes";
import contractRoutes from "./routes/contractRoutes";
import companyRoutes from "./routes/companyRoutes";
import rateRoutes from "./routes/rateRoutes";

const app: Application = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/employees", employeeRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/rates", rateRoutes);

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

export default app;
