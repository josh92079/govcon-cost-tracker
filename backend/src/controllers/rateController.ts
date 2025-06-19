import { Request, Response } from "express";
import { RateCalculator } from "../utils/calculations";
import { RateCalculationInput } from "../types";
import CompanyRates from "../models/companyRates";
import Contract from "../models/contract";
import Employee from "../models/employee";
import FringeBenefits from "../models/fringeBenefits";

export const rateController = {
  async calculateRates(
    req: Request<{}, {}, RateCalculationInput>,
    res: Response
  ): Promise<void> {
    try {
      const { baseSalary, fringeBenefits, utilizationHours = 1800 } = req.body;

      const currentYear = new Date().getFullYear();
      const companyRates = await CompanyRates.findOne({
        where: { fiscalYear: currentYear, active: true },
      });

      if (!companyRates) {
        res.status(404).json({ error: "Company rates not configured" });
        return;
      }

      // Create temporary employee object for calculation
      const tempEmployee = { baseSalary };

      const rateStructure = RateCalculator.buildRateStructure(
        tempEmployee,
        fringeBenefits,
        companyRates,
        utilizationHours
      );

      res.json(rateStructure);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  async getEmployeeRates(
    req: Request<{ id: string }>,
    res: Response
  ): Promise<void> {
    try {
      const employee = await Employee.findByPk(req.params.id, {
        include: [FringeBenefits],
      });

      if (!employee) {
        res.status(404).json({ error: "Employee not found" });
        return;
      }

      const currentYear = new Date().getFullYear();
      const companyRates = await CompanyRates.findOne({
        where: { fiscalYear: currentYear, active: true },
      });

      if (!companyRates) {
        res.status(404).json({ error: "Company rates not configured" });
        return;
      }

      // Calculate detailed rate breakdown
      const hourlyRate = RateCalculator.calculateHourlyRate(
        parseFloat(String(employee.baseSalary)),
        employee.utilizationTarget
      );

      const fringeRate = RateCalculator.calculateFringeRate(
        (employee as any).FringeBenefit?.dataValues || {},
        parseFloat(String(employee.baseSalary))
      );

      const breakdown = RateCalculator.calculateBurdenedCost(
        hourlyRate,
        fringeRate,
        parseFloat(String(companyRates.overheadRate)),
        parseFloat(String(companyRates.gaRate))
      );

      // Get all fringe components for transparency
      const fb = (employee as any).FringeBenefit || {};
      const fringeDetails = {
        healthInsurance: parseFloat(String(fb.healthInsurance || 0)),
        dentalInsurance: parseFloat(String(fb.dentalInsurance || 0)),
        visionInsurance: parseFloat(String(fb.visionInsurance || 0)),
        ltdInsurance: parseFloat(String(fb.ltdInsurance || 0)),
        stdInsurance: parseFloat(String(fb.stdInsurance || 0)),
        lifeInsurance: parseFloat(String(fb.lifeInsurance || 0)),
        trainingBudget: parseFloat(String(fb.trainingBudget || 0)),
        match401k: parseFloat(String(fb.match401k || 0)),
        ptoCost: parseFloat(String(fb.ptoCost || 0)),
        cellAllowance: parseFloat(String(fb.cellAllowance || 0)),
        internetAllowance: parseFloat(String(fb.internetAllowance || 0)),
      };

      const totalFringe = Object.values(fringeDetails).reduce(
        (sum, val) => sum + val,
        0
      );

      res.json({
        employee: {
          name: employee.name,
          title: employee.title,
          baseSalary: parseFloat(String(employee.baseSalary)),
          utilizationTarget: employee.utilizationTarget,
        },
        rateBreakdown: {
          directLaborRate: hourlyRate,
          fringeDetails,
          totalFringeCost: totalFringe,
          fringeRate: fringeRate * 100,
          overheadRate: parseFloat(String(companyRates.overheadRate)) * 100,
          gaRate: parseFloat(String(companyRates.gaRate)) * 100,
        },
        calculations: breakdown,
        annualCosts: {
          baseSalary: parseFloat(String(employee.baseSalary)),
          totalFringe,
          overhead: breakdown.overheadCost * employee.utilizationTarget,
          ga: breakdown.gaCost * employee.utilizationTarget,
          totalBurdenedCost:
            breakdown.totalBurdenedCost * employee.utilizationTarget,
        },
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  async getContractRates(
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

      const currentYear = new Date().getFullYear();
      const companyRates = await CompanyRates.findOne({
        where: { fiscalYear: currentYear, active: true },
      });

      if (!companyRates) {
        res.status(404).json({ error: "Company rates not configured" });
        return;
      }

      const rateAnalysis: any[] = [];

      for (const employee of (contract as any).Employees || []) {
        const rateStructure = RateCalculator.buildRateStructure(
          employee.toJSON(),
          employee.FringeBenefit?.dataValues || {},
          companyRates,
          employee.utilizationTarget
        );

        const billRate = parseFloat(String(employee.EmployeeContract.billRate));
        const profitAnalysis = RateCalculator.calculateProfitMargin(
          billRate,
          rateStructure.costs.totalBurdenedCost
        );

        rateAnalysis.push({
          employee: employee.name,
          allocation: parseFloat(
            String(employee.EmployeeContract.allocationPercentage)
          ),
          burdenedCost: rateStructure.costs.totalBurdenedCost,
          billRate,
          ...profitAnalysis,
        });
      }

      res.json({
        contract: {
          number: contract.contractNumber,
          name: contract.contractName,
          customer: contract.customer,
          type: contract.contractType,
        },
        rateAnalysis,
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
};
