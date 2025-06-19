import { Request, Response } from "express";
import { RateCalculator } from "../utils/calculations";
import { ContractInput, EmployeeContractInput } from "../types";
import CompanyRates from "../models/companyRates";
import Contract from "../models/contract";
import Employee from "../models/employee";
import EmployeeContract from "../models/employeeContract";
import FringeBenefits from "../models/fringeBenefits";

export const contractController = {
  async getAllContracts(req: Request, res: Response): Promise<void> {
    try {
      const contracts = await Contract.findAll({
        where: { active: true },
        include: [
          {
            model: Employee,
            through: { attributes: ["allocationPercentage", "billRate"] },
          },
        ],
      });
      res.json(contracts);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  async getContractById(
    req: Request<{ id: string }>,
    res: Response
  ): Promise<void> {
    try {
      const contract = await Contract.findByPk(req.params.id, {
        include: [
          {
            model: Employee,
            through: { attributes: ["allocationPercentage", "billRate"] },
            include: [FringeBenefits],
          },
        ],
      });

      if (!contract) {
        res.status(404).json({ error: "Contract not found" });
        return;
      }

      // Calculate contract profitability
      const currentYear = new Date().getFullYear();
      const companyRates = await CompanyRates.findOne({
        where: { fiscalYear: currentYear, active: true },
      });

      if (!companyRates) {
        res.status(404).json({ error: "Company rates not configured" });
        return;
      }

      let contractRevenue = 0;
      let contractCost = 0;
      const employeeSummary: any[] = [];

      for (const employee of (contract as any).Employees || []) {
        const allocation =
          (employee.EmployeeContract.allocationPercentage as number) / 100;
        const billRate = employee.EmployeeContract.billRate as number;
        const hoursAllocated = employee.utilizationTarget * allocation;

        const rateStructure = RateCalculator.buildRateStructure(
          employee.toJSON(),
          employee.FringeBenefit?.dataValues || {},
          companyRates,
          employee.utilizationTarget
        );

        const revenue = billRate * hoursAllocated;
        const cost = rateStructure.costs.totalBurdenedCost * hoursAllocated;

        contractRevenue += revenue;
        contractCost += cost;

        employeeSummary.push({
          name: employee.name,
          allocation: employee.EmployeeContract.allocationPercentage,
          billRate,
          revenue,
          cost,
          profit: revenue - cost,
        });
      }

      res.json({
        contract: contract.toJSON(),
        profitability: {
          revenue: contractRevenue,
          cost: contractCost,
          profit: contractRevenue - contractCost,
          margin:
            contractRevenue > 0
              ? ((contractRevenue - contractCost) / contractRevenue) * 100
              : 0,
        },
        employees: employeeSummary,
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  async createContract(
    req: Request<{}, {}, ContractInput>,
    res: Response
  ): Promise<void> {
    try {
      const contract = await Contract.create(req.body);
      res.status(201).json(contract);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },

  async updateContract(
    req: Request<{ id: string }, {}, ContractInput>,
    res: Response
  ): Promise<void> {
    try {
      const contract = await Contract.findByPk(req.params.id);

      if (!contract) {
        res.status(404).json({ error: "Contract not found" });
        return;
      }

      await contract.update(req.body);
      res.json(contract);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },

  async deleteContract(
    req: Request<{ id: string }>,
    res: Response
  ): Promise<void> {
    try {
      const contract = await Contract.findByPk(req.params.id);

      if (!contract) {
        res.status(404).json({ error: "Contract not found" });
        return;
      }

      await contract.update({ active: false });
      res.json({ message: "Contract deactivated successfully" });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  async assignEmployee(
    req: Request<{ id: string }, {}, EmployeeContractInput>,
    res: Response
  ): Promise<void> {
    try {
      const { employeeId, allocationPercentage, billRate, startDate, endDate } =
        req.body;

      // Validate allocation doesn't exceed 100% for employee
      const existingAllocations = await EmployeeContract.findAll({
        where: {
          employeeId,
          endDate: null,
        },
      });

      const totalAllocation = existingAllocations.reduce(
        (sum, alloc) => sum + parseFloat(String(alloc.allocationPercentage)),
        0
      );

      if (totalAllocation + allocationPercentage > 100) {
        res.status(400).json({
          error: `Employee allocation would exceed 100%. Current: ${totalAllocation}%`,
        });
        return;
      }

      const assignment = await EmployeeContract.create({
        employeeId,
        contractId: parseInt(req.params.id),
        allocationPercentage,
        billRate,
        startDate,
        endDate,
      });

      res.status(201).json(assignment);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },
};
