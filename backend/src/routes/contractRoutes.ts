import { Router } from "express";
import { contractController } from "../controllers/contractController";

const router = Router();

router.get("/", contractController.getAllContracts);
router.get("/:id", contractController.getContractById);
router.post("/", contractController.createContract);
router.put("/:id", contractController.updateContract);
router.delete("/:id", contractController.deleteContract);
router.post("/:id/assign-employee", contractController.assignEmployee);

export default router;
