import { Router } from "express";
import { companyController } from "../controllers/companyController";

const router = Router();

router.get("/rates", companyController.getCurrentRates);
router.put("/rates", companyController.updateRates);
router.get("/summary", companyController.getCompanySummary);

export default router;
