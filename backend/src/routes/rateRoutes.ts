// backend/src/routes/rateRoutes.ts
import { Router, Request, Response, NextFunction } from "express";
import { rateController } from "../controllers/rateController";

const router = Router();

// Validation middleware
const validateRateInput = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { baseSalary, utilizationHours } = req.body;

  if (baseSalary !== undefined && baseSalary <= 0) {
    res.status(400).json({ error: "Base salary must be positive" });
    return;
  }

  if (
    utilizationHours !== undefined &&
    (utilizationHours < 1000 || utilizationHours > 2080)
  ) {
    res.status(400).json({
      error: "Utilization hours must be between 1000 and 2080",
    });
    return;
  }

  next();
};

const validateContractType = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { contractType } = req.body;

  if (contractType && !["FFP", "T&M", "CPFF"].includes(contractType)) {
    res.status(400).json({
      error: "Contract type must be FFP, T&M, or CPFF",
    });
    return;
  }

  next();
};

// Existing routes with validation
router.post(
  "/calculate",
  validateRateInput,
  validateContractType,
  rateController.calculateRates
);
router.get("/employee/:id", rateController.getEmployeeRates);
router.get("/contract/:id", rateController.getContractRates);

// New routes for enhanced functionality
router.post("/calculate-bulk", rateController.calculateBulkRates);
router.post("/compare", validateRateInput, rateController.compareRates);

export default router;
