import { Router } from "express";
import { rateController } from "../controllers/rateController";

const router = Router();

router.post("/calculate", rateController.calculateRates);
router.get("/employee/:id", rateController.getEmployeeRates);
router.get("/contract/:id", rateController.getContractRates);

export default router;
